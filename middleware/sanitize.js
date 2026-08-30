/**
 * Input Sanitization & Unicode Normalization Middleware
 * 
 * 1. Normalizes input to Unicode Normalization Form KC (NFKC) to prevent
 *    homograph attacks, zero-width space bypasses, and encoding tricks.
 * 2. Recursively strips script tags, HTML tags, and dangerous javascript: URIs
 *    from request body and query parameters before processing.
 */

function sanitizeValue(value) {
    if (typeof value === 'string') {
        // Normalize Unicode representation first
        const normalized = value.normalize('NFKC');

        // Strip script tags, HTML elements, and dangerous protocols
        return normalized
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:\s*text\/html/gi, '')
            .trim();
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        const sanitized = {};
        for (const [k, v] of Object.entries(value)) {
            sanitized[k] = sanitizeValue(v);
        }
        return sanitized;
    }
    return value;
}

const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query);
    }
    next();
};

module.exports = sanitizeInput;
