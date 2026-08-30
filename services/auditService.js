const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Asynchronously log system actions without blocking user requests
 */
async function logAudit({ req, userId, userEmail, action, entityType, entityId, details }) {
    try {
        let ipAddress = 'unknown';
        if (req) {
            ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
            if (!userId && req.user) userId = req.user.id;
            if (!userEmail && req.user) userEmail = req.user.email;
        }

        await db.query(
            `INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                userId || null,
                userEmail || null,
                action,
                entityType || null,
                entityId ? String(entityId) : null,
                details ? JSON.stringify(details) : null,
                ipAddress,
            ]
        );
    } catch (err) {
        // Non-blocking: log error to console without breaking main business logic
        console.error('Audit logging failed:', err.message);
    }
}

/**
 * Retrieve paginated audit logs with search and action filters (Admin only)
 */
async function getAuditLogs({ page = 1, limit = 20, action, search }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (action) {
        conditions.push(`action = $${idx++}`);
        params.push(action);
    }

    if (search) {
        conditions.push(`(user_email ILIKE $${idx} OR entity_type ILIKE $${idx} OR action ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
        `SELECT COUNT(*) FROM audit_logs ${where}`,
        params
    );

    const dataResult = await db.query(
        `SELECT id, user_id, user_email, action, entity_type, entity_id, details, ip_address, created_at
         FROM audit_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
    );

    return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
    };
}

/**
 * Log a security event with severity classification.
 * Writes to both the structured logger (for SIEM pipelines) and the
 * append-only audit_logs DB table (for forensic investigation).
 *
 * @param {string} action   - Machine-readable action code (e.g. 'ACCOUNT_LOCKED')
 * @param {string} severity - 'HIGH' | 'MEDIUM' | 'LOW'
 * @param {object} meta     - Additional context: { userId, userEmail, ip, details }
 */
async function logSecurityEvent(action, severity = 'MEDIUM', meta = {}) {
    const { userId, userEmail, ip, details } = meta;

    // Structured log line for external SIEM / log aggregation
    logger.security(`[${severity}] ${action}`, {
        action,
        severity,
        userId: userId || null,
        userEmail: userEmail || null,
        ip: ip || null,
        ...details,
    });

    // Also persist in the append-only DB audit log for forensic access
    try {
        await db.query(
            `INSERT INTO audit_logs (user_id, user_email, action, entity_type, details, ip_address)
             VALUES ($1, $2, $3, 'SecurityEvent', $4, $5)`,
            [
                userId || null,
                userEmail || null,
                `SECURITY_${action}`,
                JSON.stringify({ severity, ...details }),
                ip || null,
            ]
        );
    } catch (err) {
        // Non-blocking: don't break request if security log write fails
        console.error('Security event DB log failed:', err.message);
    }
}

module.exports = { logAudit, getAuditLogs, logSecurityEvent };
