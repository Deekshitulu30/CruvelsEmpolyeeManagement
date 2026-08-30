/**
 * Idempotency Middleware
 * 
 * Inspects 'Idempotency-Key' on state-changing POST requests.
 * If the key has already been processed, returns the cached response,
 * preventing double charges, duplicate shift punches, or repeated expense claims.
 */

const db = require('../config/db');

const idempotencyMiddleware = async (req, res, next) => {
    // Only apply to mutating requests with an Idempotency-Key header
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey || req.method !== 'POST') {
        return next();
    }

    try {
        const existing = await db.query(
            'SELECT response_code, response_body FROM idempotency_keys WHERE key = $1',
            [idempotencyKey]
        );

        if (existing.rows.length > 0) {
            const cached = existing.rows[0];
            res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_REPLAY');
            return res.status(cached.response_code).json(cached.response_body);
        }

        // Intercept res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Restore original method
            res.json = originalJson;

            // Only cache successful or intentional responses
            if (res.statusCode >= 200 && res.statusCode < 500) {
                db.query(
                    `INSERT INTO idempotency_keys (key, user_id, request_path, request_params, response_code, response_body)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (key) DO NOTHING`,
                    [
                        idempotencyKey,
                        req.user?.id || null,
                        req.originalUrl || req.path,
                        req.body ? JSON.stringify(req.body) : null,
                        res.statusCode,
                        JSON.stringify(body)
                    ]
                ).catch((err) => console.error('Error saving idempotency key:', err));
            }

            return originalJson(body);
        };

        next();
    } catch (err) {
        console.error('Idempotency middleware error:', err);
        next();
    }
};

module.exports = idempotencyMiddleware;
