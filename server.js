const express = require('express');
const cors = require('cors');
require('dotenv').config();

const securityHeaders       = require('./middleware/securityHeaders');
const sanitizeInput         = require('./middleware/sanitize');
const idempotencyMiddleware = require('./middleware/idempotency');
const { verifyToken, authorizeRoles } = require('./middleware/authMiddleware');
const { processSecureUpload } = require('./utils/fileUpload');

const authRoutes       = require('./routes/authRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes      = require('./routes/leaveRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const auditRoutes      = require('./routes/auditRoutes');
const webhookRoutes    = require('./routes/webhookRoutes');
const aiRoutes         = require('./routes/aiRoutes');

// ─── Test Key Exposure Guard ──────────────────────────────────────────────────
// Prevent accidental usage of test mode payment/service keys in production
if (process.env.NODE_ENV === 'production') {
    const sensitiveKeys = ['STRIPE_SECRET_KEY', 'PAYMENT_SECRET', 'WEBHOOK_SECRET'];
    for (const key of sensitiveKeys) {
        if (process.env[key] && process.env[key].includes('_test_')) {
            console.error(`🚨 FATAL SECURITY MISCONFIGURATION: Test key detected in production environment for ${key}!`);
            process.exit(1);
        }
    }
}

const app = express();

// ─── Information Disclosure Prevention ─────────────────────────────────────────
app.disable('x-powered-by');

// ─── Security Headers & Defenses (HSTS, CSP, Anti-Clickjacking, Sniffing) ──────
app.use(securityHeaders);

// ─── Strict CORS Configuration ────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Stripe-Signature', 'CF-Turnstile-Response'],
    exposedHeaders: ['X-Request-ID', 'X-Cache-Lookup'],
}));

// ─── Webhooks Route (Must be mounted before global JSON body parser for raw payload HMAC) ──
app.use('/api/webhooks', webhookRoutes);

// ─── Request Body Size Limits & Memory Exhaustion DOS Protection ───────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Input Sanitization (Strip XSS scripts and normalize Unicode before storing)
app.use(sanitizeInput);

// ─── Idempotency Protection for POST requests ─────────────────────────────────
app.use(idempotencyMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/leaves',      leaveRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/audit-logs',  auditRoutes);
app.use('/api/ai',          aiRoutes);

// ─── Secure File Upload Endpoint ──────────────────────────────────────────────
// Validates magic bytes, checks for malware, randomizes filename, and caps at 5MB
app.post('/api/upload', verifyToken, async (req, res, next) => {
    try {
        const { base64Data, fileName, mimeType } = req.body;
        if (!base64Data || !fileName || !mimeType) {
            return res.status(400).json({ error: 'base64Data, fileName, and mimeType are required.' });
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const uploadResult = await processSecureUpload({
            fileBuffer: buffer,
            originalName: fileName,
            mimeType,
        });

        res.status(201).json({
            message: 'File verified and stored securely.',
            file: uploadResult,
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large. Maximum request size is 10KB.' });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Log unexpected errors with request ID for correlation — never expose internals to clients
    console.error(`[${req.requestId || 'no-id'}] Unexpected error:`, err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;