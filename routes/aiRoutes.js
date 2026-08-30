const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/authMiddleware');
const { processAiRequest } = require('../services/aiAssistantService');

router.use(verifyToken);

// ─── Per-User AI Usage Rate Limit ─────────────────────────────────────────────
// Caps AI requests at 10 per hour per authenticated user to prevent cost
// exhaustion attacks and API abuse. Keyed by user ID (not IP) for accuracy.
const aiRateLimiter = process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 60 * 60 * 1000,   // 1 hour
        max: 10,
        keyGenerator: (req) => req.user?.id || req.ip,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: 'AI usage limit reached. You may send up to 10 requests per hour. Please try again later.'
        },
    });

// ─── Prompt Injection Pattern Detection ───────────────────────────────────────
// Detects known jailbreak and instruction-override injection patterns
const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /system\s*:\s*you\s+are\s+now/i,
    /forget\s+(everything|your\s+instructions)/i,
    /\[INST\]|\[\/INST\]/i,
    /act\s+as\s+(if\s+you\s+are\s+|a\s+)?(?:DAN|jailbreak|unrestricted)/i,
    /\bDAN\b.*do anything now/i,
    /enable\s+developer\s+mode/i,
];

function detectPromptInjection(prompt) {
    if (!prompt || typeof prompt !== 'string') return false;
    return INJECTION_PATTERNS.some((pattern) => pattern.test(prompt));
}

/**
 * Secure AI Prompt Processing Endpoint
 * - Rate-limited per authenticated user (10 req/hr)
 * - Detects and blocks prompt injection attempts
 * - Masks PII before model dispatch
 * - Sanitizes AI output before returning
 * - Enforces Human-in-the-Loop for side-effect actions
 */
router.post('/assistant', aiRateLimiter, async (req, res, next) => {
    try {
        const { prompt, contextData } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        if (prompt.length > 2000) {
            return res.status(400).json({ error: 'Prompt exceeds maximum allowed length of 2000 characters.' });
        }

        // Block prompt injection attacks before dispatching to any LLM
        if (detectPromptInjection(prompt)) {
            return res.status(400).json({
                error: 'Your request contains patterns associated with prompt injection attempts and has been blocked.'
            });
        }

        const result = await processAiRequest({
            prompt,
            contextData,
            userRole: req.user.role,
        });

        res.json(result);
    } catch (err) { next(err); }
});

module.exports = router;
