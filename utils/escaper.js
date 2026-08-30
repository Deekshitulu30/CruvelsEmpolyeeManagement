/**
 * Escape on Read Utility
 * Encodes special HTML entities before data is returned to the client,
 * eliminating reflective and DOM-based Cross-Site Scripting (XSS) risks.
 */

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function escapePayload(obj) {
    if (typeof obj === 'string') return escapeHtml(obj);
    if (Array.isArray(obj)) return obj.map(escapePayload);
    if (obj !== null && typeof obj === 'object') {
        const escaped = {};
        for (const [key, value] of Object.entries(obj)) {
            escaped[key] = escapePayload(value);
        }
        return escaped;
    }
    return obj;
}

module.exports = { escapeHtml, escapePayload };
