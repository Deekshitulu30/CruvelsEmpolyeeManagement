/**
 * Bot Protection Middleware (Cloudflare Turnstile / CAPTCHA)
 * Protects public authentication endpoints from automated bots and scrapers.
 */

const botProtection = async (req, res, next) => {
    // In test environment, bypass bot challenge
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const token = req.body.captcha_token || req.headers['cf-turnstile-response'];

    // In local development mode, permit if no token is provided or if test token is used
    if (process.env.NODE_ENV === 'development' || !process.env.CLOUDFLARE_TURNSTILE_SECRET) {
        return next();
    }

    if (!token) {
        return res.status(400).json({
            error: 'Bot protection verification required. Please complete the security challenge.'
        });
    }

    // In production: Validate with Cloudflare Turnstile endpoint
    try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
                response: token,
                remoteip: req.ip,
            }),
        });

        const outcome = await verifyRes.json();
        if (!outcome.success) {
            return res.status(403).json({ error: 'Bot protection challenge failed. Please refresh and try again.' });
        }

        next();
    } catch (err) {
        console.error('Turnstile verification error:', err);
        return res.status(500).json({ error: 'Security challenge service temporarily unavailable.' });
    }
};

module.exports = botProtection;
