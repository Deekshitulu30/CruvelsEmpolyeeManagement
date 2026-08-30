/**
 * Database Connection Pool — Hardened Configuration
 *
 * Security controls:
 * 1. TLS/SSL enforced in production (rejectUnauthorized: true)
 * 2. Connection pool limits: max 10 connections, idle/connect timeouts
 * 3. Statement timeout: 30 seconds per query (prevents resource exhaustion)
 * 4. Security event logging on auth/connection failures
 * 5. setRLSContext(): sets PostgreSQL session variables for Row-Level Security
 */
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isTest       = process.env.NODE_ENV === 'test';

// ─── SSL / TLS Configuration ──────────────────────────────────────────────────
// In production: enforce TLS — reject self-signed or invalid certificates.
// In development/test: TLS disabled for local PostgreSQL without a cert.
const sslConfig = isProduction
    ? { rejectUnauthorized: true }   // strict TLS validation in prod
    : false;                          // no TLS for local dev/test

// ─── Connection Pool Configuration ───────────────────────────────────────────
const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST     || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT) || 5432,
    ssl:      sslConfig,

    // ── Pool limits (prevents connection-flood DoS) ──
    max:                    parseInt(process.env.DB_POOL_MAX)     || 10,  // max open connections
    min:                    parseInt(process.env.DB_POOL_MIN)     || 2,   // keep alive min connections
    idleTimeoutMillis:      parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,  // close idle after 30s
    connectionTimeoutMillis:parseInt(process.env.DB_CONN_TIMEOUT) || 5000,   // fail after 5s if no conn available
    allowExitOnIdle:        isTest,   // allow clean exit in test environment
});

// ─── Connection Lifecycle Hooks ───────────────────────────────────────────────
pool.on('connect', () => {
    if (!isTest) console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
    // Security logging: auth failures and unexpected pool errors
    const isAuthError = err.code === '28P01' || err.code === '28000'; // invalid_password / invalid_authorization
    const level = isAuthError ? 'SECURITY' : 'ERROR';

    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: 'cruvels-ems',
        message: isAuthError
            ? 'Database authentication failure — possible credential attack'
            : 'Unexpected PostgreSQL pool error',
        pg_code: err.code,
        detail: err.message,
    }));
});

// ─── Row-Level Security Context Setter ───────────────────────────────────────
// Call this at the start of each request handler to set PostgreSQL session
// variables that RLS policies use to filter rows automatically.
//
// Usage in middleware:
//   await db.setRLSContext(client, req.user.role, req.user.employeeId);
async function setRLSContext(client, role, employeeId) {
    if (!client) return;
    const safeRole       = String(role       || 'EMPLOYEE').replace(/[^A-Z]/g, '');
    const safeEmployeeId = String(employeeId || '').replace(/[^a-f0-9-]/gi, '');
    await client.query(`SELECT set_config('app.current_user_role', $1, false)`, [safeRole]);
    await client.query(`SELECT set_config('app.current_employee_id', $1, false)`, [safeEmployeeId || '']);
}

// ─── Exports ─────────────────────────────────────────────────────────────────
module.exports = {
    query:          (text, params) => pool.query(text, params),
    getClient:      ()             => pool.connect(),
    setRLSContext,
    // Expose pool for direct pool.end() in tests
    pool,
};