const express = require('express');
const router = express.Router();
const { verifyWebhookSignature, recordWebhookEvent } = require('../utils/webhookVerifier');

/**
 * Webhook Ingestion Endpoint (Reimbursements / Payments)
 * Verifies HMAC signature + 5-minute timestamp tolerance window to block replay attacks.
 */
router.post('/reimbursements', express.raw({ type: '*/*' }), async (req, res) => {
    const signatureHeader = req.header('Stripe-Signature') || req.header('X-Cruvels-Signature');
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_cruvels_test_secret_key_12345';

    let rawPayload = '';
    if (Buffer.isBuffer(req.body)) {
        rawPayload = req.body.toString('utf-8');
    } else if (typeof req.body === 'string') {
        rawPayload = req.body;
    } else if (typeof req.body === 'object') {
        rawPayload = JSON.stringify(req.body);
    }

    const verification = verifyWebhookSignature({
        rawPayload,
        signatureHeader,
        secret,
    });

    if (!verification.valid) {
        return res.status(400).json({ error: `Webhook rejected: ${verification.reason}` });
    }

    try {
        const payloadObj = typeof req.body === 'object' && !Buffer.isBuffer(req.body)
            ? req.body
            : JSON.parse(rawPayload);
        const eventId = payloadObj.id || `evt_${Date.now()}`;

        const record = await recordWebhookEvent({
            eventId,
            provider: 'Stripe',
            eventType: payloadObj.type || 'payment.reimbursement.settled',
            payload: payloadObj,
            signature: signatureHeader,
        });

        if (record.duplicate) {
            return res.json({ status: 'ignored_duplicate', eventId });
        }

        res.json({ status: 'received_and_reconciled', eventId });
    } catch (err) {
        console.error('Webhook processing error:', err);
        res.status(500).json({ error: 'Failed to process webhook event' });
    }
});

module.exports = router;
