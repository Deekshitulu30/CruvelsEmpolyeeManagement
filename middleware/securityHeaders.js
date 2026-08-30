/**
 * Enterprise Security Headers Middleware
 * Enforces defense-in-depth HTTP response headers against clickjacking,
 * MIME-type sniffing, cross-site scripting (XSS), caching of sensitive auth data,
 * and protocol downgrade attacks.
 */
const crypto = require('crypto');

const securityHeaders = (req, res, next) => {
    // Unique request correlation ID for incident response and log tracing
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking by disallowing framing
    res.setHeader('X-Frame-Options', 'DENY');

    // Disable legacy buggy XSS auditor in modern browsers
    res.setHeader('X-XSS-Protection', '0');

    // Referrer policy: send origin only when protocol is same-origin or HTTPS -> HTTPS
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // HTTP Strict Transport Security (HSTS) with preload enforcement
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Restrict browser feature permissions (Microphone, Camera, Geolocation, Payments)
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Content Security Policy (CSP)
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:5000 http://localhost:5173 ws://localhost:5173; " +
        "frame-ancestors 'none'; " +
        "form-action 'self';"
    );

    // Prevent caching of sensitive authenticated data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    next();
};

module.exports = securityHeaders;
