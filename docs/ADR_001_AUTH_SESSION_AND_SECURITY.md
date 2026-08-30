# ADR 001: Session Isolation, Rate Limiting, and Credential Recovery Architecture

**Status:** Accepted  
**Date:** 2026-08-30  
**Context:** Cruvels Employee Management System (EMS)

---

## 1. Context & Problem Statement
The Cruvels EMS is an internal portal used simultaneously by three distinct user tiers: `ADMIN`, `MANAGER`, and `EMPLOYEE`. During evaluation and daily operations, multiple technical challenges emerged:
1. **Concurrent Role Evaluation:** Reviewers and HR managers needed to test both Admin and Employee views side-by-side in separate tabs without cross-tab session overwrites.
2. **Credential Vulnerability:** Public-facing endpoints (`/api/auth/login`, `/api/auth/forgot-password`) were vulnerable to automated brute-force attacks and credential stuffing.
3. **Password Recovery Security:** Users needed a safe mechanism to recover forgotten credentials without passing plain-text passwords or vulnerable permanent reset links.
4. **Database Schema Evolution:** DDL migrations needed to execute safely across development, CI, and production environments without failing on pre-existing PostgreSQL enums or tables.

---

## 2. Decision Matrix & Evaluated Alternatives

### Decision 1: Per-Tab Session Storage vs Global LocalStorage
- **Alternative A (`localStorage`):** Standard single-page application practice.  
  *Critique:* `localStorage` is scoped to the browser origin. Logging in as an Employee in Tab B instantly overwrites the Admin JWT token in Tab A, causing confusing 403 errors and preventing simultaneous evaluation.
- **Alternative B (`httpOnly` Cookies):** High security against XSS.  
  *Critique:* Cookies are sent automatically with every origin request across all tabs, still causing cross-tab session collision unless complex partitioned cookie subdomains or session IDs are introduced.
- **Selected Solution (`sessionStorage` + `new_session` Query Param):**
  * Storage is strictly scoped to the active browser tab.
  * Opening a new tab via `"New Role Tab"` (`/login?new_session=true`) explicitly flushes the child tab's storage while preserving the parent tab's active session.
  * **Trade-off:** Closing the tab terminates the session, requiring re-login on next browser open. Acceptable and preferred for an enterprise security portal.

---

### Decision 2: Crypto Hex Tokens vs Signed JWTs for Password Reset
- **Alternative A (Stateless Signed JWT):** Embed email and expiration inside a JWT.  
  *Critique:* Stateless JWTs cannot be easily revoked once issued unless a distributed token denylist is maintained. If a user requests 3 reset links, all 3 remain valid until expiration.
- **Alternative B (Database-Backed Crypto Random Hex Token):**
  * Generate a 32-byte pseudo-random hexadecimal string using Node.js `crypto.randomBytes(32).toString('hex')`.
  * Store in PostgreSQL table `password_resets` with foreign key to `users(email)`, a `used BOOLEAN DEFAULT FALSE` flag, and `expires_at = NOW() + INTERVAL '15 minutes'`.
  * **Selected Solution:** Alternative B. Ensures single-use enforcement, instant invalidation upon successful reset, and strict 15-minute TTL.

---

### Decision 3: Rate Limiting Algorithm & Test Environment Safety
- **Implementation:** Integrated `express-rate-limit` using an in-memory sliding window of 5 requests per 15-minute window for auth routes.
- **Critical Architectural Edge Case:** Automated Jest test suites execute dozens of requests within milliseconds. If rate limiting is enforced globally during CI runs, subsequent test suites fail with HTTP 429.
- **Resolution:**
  ```javascript
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    skip: () => process.env.NODE_ENV === 'test', // Bypassed during test automation
  });
  ```
  This guarantees production security while maintaining deterministic, rapid CI test passes.

---

### Decision 4: Idempotent Migration Runner (`migrate.js`)
- **Problem:** PostgreSQL throws fatal errors if `CREATE TYPE user_role` is executed twice. Running raw SQL files on an existing database caused crashes.
- **Selected Solution:** Implemented a lightweight migration tracking table (`_migrations`):
  ```sql
  CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
  Each migration script (`001_initial_schema.sql`, `002_auth_audit_schema.sql`) runs inside a transactional boundary and is recorded. Subsequent deployments skip already-applied migrations.

---

## 3. Consequences & Downstream Impact
- **Positive:**
  - Evaluators can inspect Admin, Manager, and Employee screens concurrently across browser tabs.
  - Zero plain-text tokens or credentials stored in the codebase.
  - Full auditability across all employee status mutations and shift check-ins.
- **Future Considerations:**
  - When scaling horizontally across multiple Node.js instances in AWS/GCP, the in-memory rate limiter and audit service should be connected to a Redis cluster.
