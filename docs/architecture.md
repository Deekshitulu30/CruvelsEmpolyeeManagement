# System Architecture — Cruvels Ltd.

## 1. High-Level Architecture Overview

Cruvels Ltd. Employee Management System is built on a multi-tier, decoupled architecture designed for high security, role isolation, and sub-second operational responsiveness.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Tier                            │
│                                                             │
│   React 19 + TypeScript + Vite 8                            │
│   Tailwind CSS v4 Design Tokens (Cruvels SaaS System)       │
│   Multi-Tab State Synchronization via BroadcastChannel      │
│   Port: 5173 (Dev)                                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               │ Reverse Proxy / CORS Whitelist
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Service Tier                       │
│                                                             │
│   Node.js 20+ / Express v5 (Port: 5000)                     │
│                                                             │
│   Security Middleware Pipeline:                             │
│   ├── Helmet Content Security Policy & Security Headers     │
│   ├── Bot Protection & Turnstile Validator                  │
│   ├── Request Size Limiter (10KB)                           │
│   ├── Express Rate Limiter (IP sliding window)              │
│   ├── Recursive Input Sanitizer (Anti-XSS)                  │
│   ├── Idempotency Cache                                     │
│   ├── JWT Token Authenticator (Bearer verification)         │
│   ├── Token Version Invalidation Gate (Concurrent check)    │
│   └── RBAC Gate (requireRole: ADMIN, MANAGER, EMPLOYEE)     │
│                                                             │
│   Controllers & Domain Business Services:                   │
│   ├── Auth & 2FA / TOTP Service                             │
│   ├── Employee Operations Service                           │
│   ├── Attendance & Punch Service                            │
│   ├── Leave & Multi-Level Review Service                    │
│   ├── Immutable Audit Logger Service                        │
│   └── Department & Dashboard Metric Service                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL via pg Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Persistence Tier                  │
│                                                             │
│   PostgreSQL 16 Relational Engine (Port: 5432)              │
│                                                             │
│   ├── Hardened Relational Tables with Composite Indexes     │
│   ├── Strict Foreign Keys & Delete Cascade Cascades         │
│   ├── Daily Attendance Idempotency Constraints              │
│   ├── Immutable Audit Log Append-Only Records               │
│   ├── Versioned Idempotent SQL Migrations (_migrations)     │
│   └── Encrypted Snapshot Engine (AES-256-GCM + SHA-256)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture & Modular Organization

The frontend uses standard React component isolation with strict TypeScript interfaces:

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx             # Responsive shell (collapsible sidebar + top navigation)
│   │   ├── TopNavbar.tsx             # Role-aware search, notifications, profile popover
│   │   ├── Sidebar.tsx               # Dynamic navigation hierarchy by user role
│   │   └── ProtectedRoute.tsx        # Authentication gate redirecting unauthenticated users
│   └── shared/
│       ├── ConcurrentSessionModal.tsx # Alert popup when account is logged in elsewhere
│       ├── ConfirmDialog.tsx         # Safety modal for destructive status modifications
│       ├── CookieBanner.tsx          # Privacy consent banner
│       ├── RoleRoute.tsx             # RBAC route guard enforcing allowed roles
│       ├── SkeletonLoader.tsx        # Zero-CLS loading state animations
│       └── WatercoolerModal.tsx      # Social company announcement bulletin
├── context/
│   └── AuthContext.tsx               # Authentication state, per-tab session, BroadcastChannel
├── pages/
│   ├── LandingPage.tsx               # Public marketing, features, and platform overview
│   ├── LoginPage.tsx                 # Clean credential login & SSO providers
│   ├── SignupPage.tsx                # New workspace employee self-registration
│   ├── ForgotPasswordPage.tsx        # Expiring token password recovery request
│   ├── ResetPasswordPage.tsx         # Cryptographic token consumption & new password submission
│   ├── DashboardPage.tsx             # Role-specific dashboard (Admin desk / Manager / Employee)
│   ├── EmployeesPage.tsx             # Employee directory with transactional CRUD modal
│   ├── AttendancePage.tsx            # Real-time shift punch in/out & attendance history
│   ├── LeavePage.tsx                 # Time-off request submission and history
│   ├── LeaveApprovalsPage.tsx        # Manager review desk for pending leaves
│   ├── DepartmentsPage.tsx           # Organization department structure & headcounts
│   ├── NotificationsPage.tsx         # Central alert and review activity stream
│   ├── AuditLogsPage.tsx             # Security trail (Admin-only)
│   ├── SettingsPage.tsx              # Preferences, password changes, and 2FA TOTP setup
│   ├── ProfilePage.tsx               # Personal employee profile card
│   └── ForbiddenPage.tsx             # Custom 403 Access Denied experience
├── services/
│   ├── api.ts                        # Axios instance with JWT interceptor & 401 handler
│   ├── authService.ts                # Auth & SSO API calls
│   ├── employeeService.ts            # Employee directory CRUD
│   ├── attendanceService.ts          # Shift punch API
│   └── leaveService.ts               # Leave creation and review API
└── types/
    └── index.ts                      # Shared TypeScript models and enums
```

---

## 3. Security Architecture & Threat Mitigations

| Threat Vector | Mitigation Architecture | Implementation |
| :--- | :--- | :--- |
| **Credential Stuffing** | IP Sliding Rate Limiter + Account Lockout | `express-rate-limit` (20 req/15 min) + lock account for 15 min after 5 failed attempts. |
| **Concurrent Account Hijacking** | Single-Session Token Versioning & Cross-Tab Broadcast | `users.token_version` incremented on login. `BroadcastChannel('cruvels_session_channel')` alerts other tabs instantaneously. |
| **Cross-Site Scripting (XSS)** | Deep Recursive Sanitizer + Strict CSP Headers | `sanitize.js` strips `<script>` and malicious HTML from all JSON request payloads. `securityHeaders.js` sets strict CSP. |
| **Tampered Audit Trails** | Append-Only Immutable Logging Table | `audit_logs` records actor ID, actor email, IP address, timestamp, and details JSON. Only `ADMIN` role can query. |
| **Unauthorized Privilege Escalation** | Dual-Layer Role Enforcement | Client route guards (`RoleRoute.tsx`) + Backend middleware (`verifyToken` + `requireRole`) on every API endpoint. |
| **Session Theft on Password Change** | Immediate Global Token Revocation | Updating password increments `token_version` and updates `password_changed_at`, invalidating pre-existing tokens immediately. |
| **Data Breach at Rest** | AES-256-GCM Snapshot Encryption | `backup-db.js` creates encrypted database archives authenticated with GCM tags and SHA-256 checksums. |

---

## 4. Multi-Role RBAC Authorization Matrix

| Route / Capability | Endpoint | EMPLOYEE | MANAGER | ADMIN |
| :--- | :--- | :---: | :---: | :---: |
| **View Personal Desk** | `GET /api/dashboard/stats` | ✅ | ✅ | ✅ |
| **Punch Shift In / Out** | `POST /api/attendance/check-in`, `check-out` | ✅ | ✅ | ✅ |
| **Submit Leave Request** | `POST /api/leaves` | ✅ | ✅ | ✅ |
| **View Team Shifts** | `GET /api/attendance/team` | ❌ | ✅ | ✅ |
| **Approve / Reject Leave** | `PUT /api/leaves/:id/review` | ❌ | ✅ | ✅ |
| **Manage Employee Records** | `POST / PUT / DELETE /api/employees` | ❌ | ❌ | ✅ |
| **Manage Departments** | `POST / DELETE /api/departments` | ❌ | ❌ | ✅ |
| **Inspect Security Audit Trail** | `GET /api/audit` | ❌ | ❌ | ✅ |
| **Configure System 2FA** | `POST /api/auth/2fa/setup` | ✅ | ✅ | ✅ |
