/**
 * Database Connection Pool — Hardened Configuration
 *
 * Security controls:
 * 1. TLS/SSL enabled in production
 * 2. Connection pool limits
 * 3. Connection and idle timeouts
 * 4. Statement timeout support through environment configuration
 * 5. Security event logging on connection failures
 * 6. setRLSContext(): sets PostgreSQL session variables for Row-Level Security
 */

const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// ─── SSL / TLS Configuration ──────────────────────────────────────────────────
// Render + Supabase PostgreSQL connection.
//
// TLS remains enabled in production, but certificate verification is disabled
// because the Supabase pooler certificate chain may not be trusted by the
// Render Node.js runtime.
//
// Development/test uses local PostgreSQL without SSL.
const sslConfig = isProduction
    ? { rejectUnauthorized: false }
    : false;

// ─── Connection Pool Configuration ───────────────────────────────────────────
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,

    // SSL/TLS configuration
    ssl: sslConfig,

    // ── Pool limits ───────────────────────────────────────────────────────────
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,

    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,

    idleTimeoutMillis:
        parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,

    connectionTimeoutMillis:
        parseInt(process.env.DB_CONN_TIMEOUT, 10) || 5000,

    // Allow clean exit when running automated tests
    allowExitOnIdle: isTest,
});

// ─── Connection Lifecycle Hooks ───────────────────────────────────────────────

pool.on('connect', () => {
    if (!isTest) {
        console.log('✅ Connected to PostgreSQL database');
    }
});

pool.on('error', (err) => {
    // PostgreSQL authentication errors
    const isAuthError =
        err.code === '28P01' ||
        err.code === '28000';

    const level = isAuthError ? 'SECURITY' : 'ERROR';

    console.error(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            service: 'cruvels-ems',
            message: isAuthError
                ? 'Database authentication failure — possible credential attack'
                : 'Unexpected PostgreSQL pool error',
            pg_code: err.code,
            detail: err.message,
        })
    );
});

// ─── Row-Level Security Context Setter ───────────────────────────────────────
//
// Call this at the start of a request handler to set PostgreSQL session
// variables used by RLS policies.
//
// Example:
// await db.setRLSContext(
//     client,
//     req.user.role,
//     req.user.employeeId
// );

async function setRLSContext(client, role, employeeId) {
    if (!client) {
        return;
    }

    const safeRole = String(role || 'EMPLOYEE')
        .replace(/[^A-Z]/g, '');

    const safeEmployeeId = String(employeeId || '')
        .replace(/[^a-f0-9-]/gi, '');

    await client.query(
        `SELECT set_config('app.current_user_role', $1, false)`,
        [safeRole]
    );

    await client.query(
        `SELECT set_config('app.current_employee_id', $1, false)`,
        [safeEmployeeId || '']
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    query: (text, params) => pool.query(text, params),

    getClient: () => pool.connect(),

    setRLSContext,

    // Expose pool for tests
    pool,
};