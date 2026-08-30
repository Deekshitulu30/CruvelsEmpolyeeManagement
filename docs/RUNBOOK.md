# Cruvels EMS — System Operations & Runbook

This runbook provides complete, reproducible instructions to configure, run, verify, and test the **Cruvels Employee Management System** from scratch.

---

## 🛠️ 1. Architecture & Tech Stack

| Layer | Technology | Port / Address | Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS | `http://localhost:5173` | Responsive SPA, Recharts visualizers, debounced search, role guards |
| **Backend API** | Node.js + Express + CommonJS | `http://localhost:5000` | REST API, JWT auth, rate limiting, audit logging |
| **Database** | PostgreSQL 16 | `localhost:5432` | Relational storage, composite foreign keys, enum types, indexes |
| **Testing** | Jest + Supertest | CLI | Automated integration and regression test suites (22 tests) |

---

## 🚀 2. Quickstart: Zero to Running in 3 Minutes

### Step 1: Clone & Configure Environment Variables
Ensure `.env` exists in the root directory:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cruvels_db
DB_USER=postgres
DB_PASSWORD=root
JWT_SECRET=supersecret_cruvels_jwt_key_2026
```

### Step 2: Database Initialization & Migrations
Create the database and apply versioned migrations:
```bash
# 1. Create the PostgreSQL database (if it doesn't already exist)
node create-db.js

# 2. Run schema migrations (001_initial_schema.sql, 002_auth_audit_schema.sql)
node migrate.js

# 3. Seed demo departments, employees, shifts, and leave records
node seed.js
```

### Step 3: Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### Step 4: Start Backend & Frontend Servers
Open two terminal windows:

**Terminal 1 — Backend API:**
```bash
npm run dev
# Output: 🚀 Server running on http://localhost:5000
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
# Output: ➜ Local: http://localhost:5173/
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔑 3. Demo Credentials Matrix

All seeded demo accounts share the password: `password123`

| Role | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `password123` | Full org control, staff management, department creation, system audit logs, security trail |
| **Manager** | `manager@company.com` | `password123` | Direct reports attendance roster, team leave approvals/rejections |
| **Employee** | `arjun.sharma@company.com` | `password123` | Personal shift punch-in/out, time-off application, personal history |
| **Employee** | `priya.singh@company.com` | `password123` | Engineering frontend teammate |
| **Employee** | `vikram.patel@company.com` | `password123` | Backend developer teammate |

*Tip: Use the 1-click demo autofill buttons on the login screen for instant sign-in.*

---

## 🧪 4. Automated Testing Protocol

Run the entire Jest automated test suite with a single command:
```bash
npm test
```

### Expected Output:
```
PASS tests/audit.test.js
PASS tests/leaves.test.js
PASS tests/auth.test.js
PASS tests/employees.test.js
PASS tests/attendance.test.js

Test Suites: 5 passed, 5 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        ~5.9s
```

---

## 📦 5. Production Build Verification

Verify that the frontend builds with zero TypeScript compiler errors and minifies cleanly:
```bash
cd frontend
npm run build
```
Expected output: `✓ built in <1.5s` generating optimized static assets in `frontend/dist/`.

---

## 🔍 6. Troubleshooting & Gotchas

### Issue 1: Database Connection Refused (`ECONNREFUSED 127.0.0.1:5432`)
- **Cause:** PostgreSQL service is not running locally.
- **Fix:**
  - On Windows: Open Services (`services.msc`) and start `postgresql-x64-16`.
  - Or run PostgreSQL via Docker: `docker run --name cruvels-pg -e POSTGRES_PASSWORD=root -e POSTGRES_DB=cruvels_db -p 5432:5432 -d postgres:16-alpine`.

### Issue 2: Password Reset Link Expired (`400 Token Expired`)
- **Cause:** Reset tokens have a strict 15-minute expiration window to prevent credential hijacking.
- **Fix:** Request a fresh reset link via `http://localhost:5173/forgot-password`. In development mode, the active token is returned directly in the response payload for testing convenience.

### Issue 3: 403 Access Denied when visiting `/audit-logs`
- **Cause:** The route is protected by both client-side `<RoleRoute>` and backend `requireRole('ADMIN')`.
- **Fix:** This is intended behavior. Sign in as `admin@company.com` to inspect system security audit logs.

### Issue 4: Concurrent Multi-Role Testing Across Tabs
- **Mechanism:** Sessions are stored in browser `sessionStorage`.
- **To test Admin & Employee simultaneously:** Click the `"New Role Tab"` button in the top navbar or sidebar. This opens `/login?new_session=true` in a new tab, allowing you to log in as Arjun Sharma without affecting your active Admin session in the other tab.
