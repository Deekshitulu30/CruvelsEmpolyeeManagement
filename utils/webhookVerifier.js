/**
 * Webhook Signature & Timestamp Replay Protection Verifier
 * 
 * Verifies HMAC-SHA256 signatures and timestamp freshness (tolerance window)
 * to prevent replay attacks and spoofed webhook dispatches.
 */

const crypto = require('crypto');
const db = require('../config/db');

const MAX_TIMESTAMP_DRIFT_SECONDS = 300; // 5 minutes

function verifyWebhookSignature({ rawPayload, signatureHeader, secret }) {
    if (!signatureHeader || !secret) return { valid: false, reason: 'Missing signature or secret' };

    // Format: t=1725000000,v1=6a39e0...
    const parts = signatureHeader.split(',');
    let timestamp = null;
    let signature = null;

    for (const part of parts) {
        const [k, v] = part.split('=');
        if (k === 't') timestamp = parseInt(v, 10);
        if (k === 'v1') signature = v;
    }

    if (!timestamp || !signature) {
        return { valid: false, reason: 'Malformed signature header format (expected t=...,v1=...)' };
    }

    // 1. Replay attack verification: Check timestamp drift
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestamp) > MAX_TIMESTAMP_DRIFT_SECONDS) {
        return { valid: false, reason: 'Webhook timestamp has expired or is outside 5-minute replay tolerance window' };
    }

    // 2. Compute expected HMAC SHA-256
    const payloadToSign = `${timestamp}.${rawPayload}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadToSign)
        .digest('hex');

    // 3. Constant-time equality check to thwart timing attacks
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return { valid: false, reason: 'HMAC signature mismatch' };
    }

    return { valid: true, timestamp };
}

/**
 * Record and reconcile webhook event in webhook_events table
 */
async function recordWebhookEvent({ eventId, provider, eventType, payload, signature }) {
    const existing = await db.query(
        'SELECT id FROM webhook_events WHERE event_id = $1',
        [eventId]
    );

    if (existing.rows.length > 0) {
        return { duplicate: true };
    }

    await db.query(
        `INSERT INTO webhook_events (event_id, provider, event_type, payload, signature, processed)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [eventId, provider, eventType, JSON.stringify(payload), signature]
    );

    return { duplicate: false };
}

module.exports = {
    verifyWebhookSignature,
    recordWebhookEvent,
    MAX_TIMESTAMP_DRIFT_SECONDS,
};
