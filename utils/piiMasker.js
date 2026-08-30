/**
 * PII Masking Utility for AI / LLM Integrations
 * 
 * Redacts Personally Identifiable Information (PII) before prompts are dispatched
 * to third-party LLM providers, and rehydrates masked tokens upon model response.
 */

function maskPII(text) {
    if (!text || typeof text !== 'string') return { maskedText: text, mapping: {} };

    const mapping = {};
    let emailIdx = 1;
    let phoneIdx = 1;
    let ssnIdx = 1;

    // Redact Emails
    let masked = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
        const token = `[EMAIL_${emailIdx++}]`;
        mapping[token] = match;
        return token;
    });

    // Redact Phone numbers (US/Indian/International formats)
    masked = masked.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, (match) => {
        const token = `[PHONE_${phoneIdx++}]`;
        mapping[token] = match;
        return token;
    });

    // Redact Government IDs / SSN (XXX-XX-XXXX)
    masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (match) => {
        const token = `[GOV_ID_${ssnIdx++}]`;
        mapping[token] = match;
        return token;
    });

    return { maskedText: masked, mapping };
}

function unmaskPII(text, mapping) {
    if (!text || !mapping) return text;
    let unmasked = text;
    for (const [token, original] of Object.entries(mapping)) {
        unmasked = unmasked.split(token).join(original);
    }
    return unmasked;
}

module.exports = { maskPII, unmaskPII };
