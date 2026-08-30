# API Reference — Cruvels EMS

All endpoints are prefixed with `/api`. Authentication uses JWT Bearer tokens passed in the `Authorization: Bearer <token>` header. Rate limiting is enforced on all authentication-sensitive routes.

**Standard Error format:**
```json
{ "error": "Human-readable message." }
```

---

## 🔐 Auth & Security — `/api/auth`

### POST /api/auth/login
Authenticate a user and receive a JWT. Protected by IP rate limiter (5 requests / 15 min).

**Auth:** None  
**Body:**
```json
{ "email": "admin@company.com", "password": "password123" }
```
**200 OK:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-...",
    "email": "admin@company.com",
    "role": "ADMIN",
    "employeeId": "uuid-...",
    "name": "Admin User"
  }
}
```
**Errors:** `400` missing fields · `401` invalid credentials · `429` rate limit exceeded

---

### POST /api/auth/sso-login
Authenticates a user via Single Sign-On identity provider (Google, Microsoft, or Enterprise SAML).  
**Auth:** None  
**Body:**
```json
{
  "email": "arjun.sharma@company.com",
  "provider": "Google"
}
```
**200 OK:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-...",
    "email": "arjun.sharma@company.com",
    "role": "EMPLOYEE",
    "employeeId": "uuid-...",
    "name": "Arjun Sharma",
    "employee_code": "CRUV-002"
  }
}
```
**Errors:** `400` missing email · `404` account not found in organization

---

### POST /api/auth/logout
Invalidates client session and records audit event.  
**Auth:** Required  
**200 OK:** `{ "message": "Logged out successfully." }`

---

### GET /api/auth/2fa/status
Check whether Multi-Factor Authentication (TOTP) is active for the current user.  
**Auth:** Required  
**200 OK:** `{ "requires_2fa": true }`

---

### POST /api/auth/2fa/setup
Initiate TOTP two-factor enrollment and receive a QR code data URL.  
**Auth:** Required  
**200 OK:** `{ "secret": "JBSWY3DPEHPK3PXP", "qrCode": "data:image/png;base64,..." }`

---

### POST /api/auth/2fa/verify
Confirm a 6-digit TOTP code to activate two-factor authentication.  
**Auth:** Required  
**Body:** `{ "token": "123456" }`  
**200 OK:** `{ "message": "Two-factor authentication successfully enabled.", "backupCodes": [...] }`

---

### POST /api/auth/2fa/disable
Disable two-factor authentication for the authenticated user.  
**Auth:** Required  
**Body:** `{ "token": "123456" }`  
**200 OK:** `{ "message": "Two-factor authentication disabled." }`

---

### GET /api/auth/me
Returns the authenticated user and linked employee profile.  
**Auth:** Required  
**200 OK:**
```json
{
  "id": "uuid-...",
  "email": "arjun.sharma@company.com",
  "role": "EMPLOYEE",
  "employee": {
    "id": "uuid-...",
    "first_name": "Arjun",
    "last_name": "Sharma",
    "designation": "Software Engineer",
    "department_id": "uuid-...",
    "status": "ACTIVE"
  }
}
```

---

### POST /api/auth/forgot-password
Initiates the password reset workflow. Generates a cryptographically secure 32-byte hex token with a 15-minute expiration stored in `password_resets`. Rate-limited.

**Auth:** None  
**Body:**
```json
{ "email": "arjun.sharma@company.com" }
```
**200 OK:**
```json
{
  "message": "Password reset instructions sent to your email.",
  "reset_token": "4a7c8b9d...",
  "reset_url": "http://localhost:5173/reset-password?token=4a7c8b9d..."
}
```
*Note: In development and demo mode, `reset_token` and `reset_url` are returned directly in the response for evaluation convenience.*

---

### POST /api/auth/reset-password
Validates the reset token, verifies it has not expired and hasn't been used, and hashes the new password with bcrypt (10 salt rounds). Rate-limited.

**Auth:** None  
**Body:**
```json
{
  "token": "4a7c8b9d...",
  "new_password": "NewSecurePassword123!"
}
```
**200 OK:**
```json
{ "message": "Password reset successfully. You may now sign in with your new password." }
```
**Errors:** `400` token expired / invalid / missing new password

---

### POST /api/auth/change-password
Allows authenticated users to change their password by verifying their existing current password.

**Auth:** Required (Any role)  
**Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "NewSecurePassword123!"
}
```
**200 OK:**
```json
{ "message": "Password updated successfully." }
```
**Errors:** `400` incorrect current password or validation error

---

## 🛡️ Audit Logging — `/api/audit-logs`

### GET /api/audit-logs
Retrieves immutable system security audit logs tracking user logins, password changes, employee mutations, shift clock-ins, and leave reviews. Includes client IP, user agent, and contextual details.

**Auth:** ADMIN only  
**Query Parameters:**
- `page` (integer, default 1)
- `limit` (integer, default 20)
- `action` (string, optional filter: e.g. `AUTH_LOGIN`, `LEAVE_APPROVE`)
- `userId` (uuid, optional filter)

**200 OK:**
```json
{
  "data": [
    {
      "id": "uuid-...",
      "user_id": "uuid-...",
      "actor_name": "Admin User",
      "actor_email": "admin@company.com",
      "action": "LEAVE_APPROVE",
      "entity_type": "leave_request",
      "entity_id": "uuid-...",
      "details": { "leave_type": "CASUAL" },
      "ip_address": "127.0.0.1",
      "created_at": "2026-08-30T10:45:12.000Z"
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20
}
```
**Errors:** `401` unauthenticated · `403` forbidden (non-Admin)

---

## 👥 Employees — `/api/employees`

### GET /api/employees
Returns paginated list of employees with search and department filtering.

**Auth:** ADMIN, MANAGER  
**Query Parameters:** `search`, `department` (uuid), `status` (ACTIVE|INACTIVE), `page`, `limit`  
**200 OK:** `{ "data": [...], "total": 6, "page": 1, "limit": 10 }`

### GET /api/employees/me
Returns profile of the currently authenticated employee.  
**Auth:** Any authenticated  
**200 OK:** Employee object

### GET /api/employees/:id
**Auth:** ADMIN, MANAGER (direct-report only), EMPLOYEE (own profile only)  
**200 OK:** Full employee object with department and manager names  
**Errors:** `403` not authorized · `404` not found

### POST /api/employees
Creates a new user login and employee profile in a single database transaction.  
**Auth:** ADMIN  
**Body:**
```json
{
  "email": "new.hire@company.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "EMPLOYEE",
  "phone": "+91 98765 43210",
  "department_id": "uuid-...",
  "designation": "Software Engineer",
  "joining_date": "2026-09-01"
}
```
**201 Created:** Created employee object with generated employee code (e.g. `EMP007`).  
**Errors:** `400` missing required fields · `409` email already in use

### PUT /api/employees/:id
Updates employee details.  
**Auth:** ADMIN  
**Body:** Any subset of employee fields (`first_name`, `last_name`, `phone`, `department_id`, `designation`, `role`, `joining_date`)  
**200 OK:** Updated employee object

### PATCH /api/employees/:id/status
Toggles employee status between `ACTIVE` and `INACTIVE`. Deactivated employees are prevented from logging in.  
**Auth:** ADMIN  
**Body:** `{ "status": "INACTIVE" }`  
**200 OK:** Updated employee object

---

## 🏢 Departments — `/api/departments`

### GET /api/departments
**Auth:** Any authenticated  
**200 OK:** Array of `{ "id": "uuid-...", "name": "Engineering" }`

### POST /api/departments
**Auth:** ADMIN  
**Body:** `{ "name": "Infrastructure" }`  
**201 Created:** Created department object  
**Errors:** `409` department name already exists

---

## ⏱️ Attendance — `/api/attendance`

### POST /api/attendance/check-in
Marks check-in timestamp for the authenticated employee's current day shift. Automatically classifies `PRESENT` vs `LATE` (if after 10:00 AM).  
**Auth:** Any authenticated (own shift only)  
**201 Created:** Attendance record  
**Errors:** `409` already checked in today

### POST /api/attendance/check-out
Marks check-out timestamp for the active shift.  
**Auth:** Any authenticated  
**200 OK:** Updated attendance record  
**Errors:** `400` no active check-in · `409` already checked out today

### GET /api/attendance/me
**Auth:** Any authenticated  
**Query:** `startDate`, `endDate` (YYYY-MM-DD), `page`, `limit`  
**200 OK:** `{ "data": [...], "total": N }`

### GET /api/attendance/team
**Auth:** ADMIN, MANAGER  
**Query:** `startDate`, `endDate`, `empFilter`, `page`, `limit`  
**200 OK:** `{ "data": [...], "total": N }` — MANAGER sees own direct reports only, ADMIN sees entire org.

---

## 🌴 Leave Requests — `/api/leaves`

### POST /api/leaves
Submits a time off request. Prevents overlapping approved leaves.  
**Auth:** Any authenticated  
**Body:**
```json
{
  "leave_type": "CASUAL",
  "start_date": "2026-09-05",
  "end_date": "2026-09-06",
  "reason": "Personal errands"
}
```
**201 Created:** Leave request object (`status: PENDING`)  
**Errors:** `400` invalid dates or empty reason · `409` overlapping approved leave

### GET /api/leaves/me
**Auth:** Any authenticated  
**Query:** `status` (PENDING|APPROVED|REJECTED), `page`, `limit`  
**200 OK:** `{ "data": [...], "total": N }`

### GET /api/leaves
**Auth:** ADMIN, MANAGER  
**Query:** `status`, `empFilter`, `page`, `limit`  
**200 OK:** MANAGER sees team requests, ADMIN sees all org requests.

### PATCH /api/leaves/:id/approve
Approves a pending leave request.  
**Auth:** ADMIN (any employee), MANAGER (direct reports only)  
**200 OK:** Updated leave request object (`status: APPROVED`)  
**Errors:** `403` unauthorized · `404` not found · `409` already reviewed

### PATCH /api/leaves/:id/reject
Declines a pending leave request.  
**Auth:** ADMIN, MANAGER (direct reports only)  
**200 OK:** Updated leave request object (`status: REJECTED`)

---

## 📊 Dashboard — `/api/dashboard`

### GET /api/dashboard
Role-aware polymorphic response serving metrics tailored to the caller's role.  
**Auth:** Any authenticated

**ADMIN response:**
```json
{
  "role": "ADMIN",
  "stats": {
    "totalEmployees": 6,
    "activeEmployees": 6,
    "inactiveEmployees": 0,
    "presentToday": 1,
    "absentToday": 0,
    "pendingLeaves": 0
  },
  "departmentBreakdown": [
    { "name": "Engineering", "count": 4 },
    { "name": "Human Resources", "count": 2 }
  ],
  "recentLeaveRequests": [...],
  "recentEmployees": [...]
}
```

**MANAGER response:**
```json
{
  "role": "MANAGER",
  "stats": { "teamSize": 3, "presentToday": 1, "absentToday": 0, "pendingLeaves": 0 },
  "pendingLeaveRequests": [...],
  "teamMembers": [...]
}
```

**EMPLOYEE response:**
```json
{
  "role": "EMPLOYEE",
  "todayAttendance": { "check_in": "2026-08-30T09:15:00Z", "check_out": null, "status": "PRESENT" },
  "attendanceSummary": { "present": 12, "absent": 1, "late": 0, "half_day": 0 },
  "leaveSummary": { "pending": 0, "approved": 2, "rejected": 1 },
  "recentLeaveRequests": [...]
}
```

---

## 🛡️ Audit Logs — `/api/audit`

### GET /api/audit
Query immutable system audit logs with filtering and pagination.  
**Auth:** ADMIN only  
**Query:** `page`, `limit`, `action`, `search`  
**200 OK:**
```json
{
  "data": [
    {
      "id": "uuid-...",
      "action": "SSO_LOGIN",
      "user_email": "arjun.sharma@company.com",
      "ip_address": "127.0.0.1",
      "details": { "provider": "Google" },
      "created_at": "2026-08-30T18:25:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 142 }
}
```
**Errors:** `403` Forbidden for non-admin users

---

## 🏢 Departments — `/api/departments`

### GET /api/departments
List all company departments and employee headcounts.  
**Auth:** Required (any authenticated role)  
**200 OK:** `[{ "id": "uuid-...", "name": "Engineering", "employee_count": 4 }]`

### POST /api/departments
Create a new organizational department.  
**Auth:** ADMIN only  
**Body:** `{ "name": "Research & Development" }`  
**201 Created:** `{ "id": "uuid-...", "name": "Research & Development" }`  
**Errors:** `400` validation error · `403` forbidden · `409` department already exists

### DELETE /api/departments/:id
Delete a department (only if no active employees are assigned).  
**Auth:** ADMIN only  
**200 OK:** `{ "message": "Department deleted successfully." }`  
**Errors:** `403` forbidden · `409` cannot delete department with assigned employees
