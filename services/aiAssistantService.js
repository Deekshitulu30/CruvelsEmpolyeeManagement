/**
 * Secure AI Assistant Service
 * 
 * 1. Masks PII before calling LLM APIs.
 * 2. Validates & sanitizes AI responses as untrusted input.
 * 3. Enforces Human-in-the-Loop (HITL) review for actions with real-world side effects.
 */

const { maskPII, unmaskPII } = require('../utils/piiMasker');
const { escapeHtml } = require('../utils/escaper');

async function processAiRequest({ prompt, contextData, userRole }) {
    // 1. Mask PII from prompt and context data
    const rawInput = `${prompt} \nContext: ${JSON.stringify(contextData || {})}`;
    const { maskedText, mapping } = maskPII(rawInput);

    // 2. Mock LLM Dispatch (e.g. Gemini / Claude / OpenAI) with masked prompt
    // In production, this would call the LLM SDK with maskedText
    let mockAiResponse = `Based on current department shift coverage, approving the leave for [EMAIL_1] is recommended. Action: APPROVE_LEAVE.`;

    // 3. Rehydrate masked tokens safely
    let rehydratedResponse = unmaskPII(mockAiResponse, mapping);

    // 4. Sanitize and escape AI output before rendering
    const sanitizedOutput = escapeHtml(rehydratedResponse);

    // 5. Check if action has real-world side effects (Human-in-the-Loop enforcement)
    const hasSideEffects = /(?:APPROVE_LEAVE|REJECT_LEAVE|CHANGE_SHIFT|TERMINATE|PROMOTE)/.test(mockAiResponse);

    return {
        response: sanitizedOutput,
        action: hasSideEffects ? 'LEAVE_APPROVAL_PROPOSAL' : 'INFORMATIONAL',
        requires_human_approval: hasSideEffects,
        status: hasSideEffects ? 'PENDING_HUMAN_REVIEW' : 'COMPLETED',
        pii_masked: Object.keys(mapping).length > 0,
        masked_tokens_count: Object.keys(mapping).length,
    };
}

module.exports = { processAiRequest };
