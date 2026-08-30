const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { AppError } = require('../utils/errors');

const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            'SELECT id, email, role, is_active, password_changed_at, token_version, deleted_at FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        const user = result.rows[0];

        // Soft-delete check
        if (user.deleted_at) {
            return res.status(401).json({ error: 'This user account has been deleted.' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'Your account has been deactivated.' });
        }

        if (decoded.token_version && user.token_version && decoded.token_version !== user.token_version) {
            return res.status(401).json({
                error: 'Session invalidated. You were logged out because this account was logged into from another tab or another device. Please log in again.',
                code: 'CONCURRENT_LOGIN_LOGOUT'
            });
        }

        // Password change invalidation check
        if (user.password_changed_at && decoded.iat) {
            const changedTimestamp = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
            if (decoded.iat < changedTimestamp - 1) {
                return res.status(401).json({
                    error: 'Your password was recently changed. Active session invalidated. Please log in again.'
                });
            }
        }

        // Attach user + their employee record id
        const empResult = await db.query(
            'SELECT id FROM employees WHERE user_id = $1 AND deleted_at IS NULL',
            [user.id]
        );
        req.user = {
            ...user,
            employeeId: empResult.rows[0]?.id || null,
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };