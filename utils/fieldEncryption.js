/**
 * Field-Level Encryption (FLE) Utility
 *
 * Provides AES-256-GCM encryption/decryption for sensitive PII fields
 * (salary, bank account numbers, SSN, tax IDs) before they are stored
 * in the database. Even if the database is breached, the ciphertext is
 * unreadable without the FIELD_ENCRYPTION_KEY from the environment.
 *
 * SECURITY DESIGN:
 * - AES-256-GCM (authenticated encryption) — provides both confidentiality
 *   and integrity: tampered ciphertext fails decryption.
 * - A unique 12-byte IV is generated per encryption to prevent IV reuse attacks.
 * - The Auth Tag is stored with the ciphertext for integrity verification.
 * - The encryption key is 32 bytes (256 bits), stored ONLY in environment vars.
 * - In test mode, a stable deterministic test key is used so tests are repeatable.
 *
 * OUTPUT FORMAT: `iv_hex:authTag_hex:ciphertext_hex`
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;    // GCM recommended IV length
const TAG_BYTES = 16;   // GCM auth tag length

/**
 * Derive the 32-byte encryption key from the environment.
 * In production: set FIELD_ENCRYPTION_KEY to a 64-char hex string.
 * In test: falls back to a deterministic test key.
 */
function getEncryptionKey() {
    const hexKey = process.env.FIELD_ENCRYPTION_KEY;
    if (hexKey && hexKey.length === 64) {
        return Buffer.from(hexKey, 'hex');
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'SECURITY MISCONFIGURATION: FIELD_ENCRYPTION_KEY must be set to a 64-character hex string in production.'
        );
    }
    // Test/development fallback — never used in production
    return Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a packed string: `iv:authTag:ciphertext` (all hex-encoded).
 * Returns null if value is null/undefined (preserves nullable fields).
 */
function encrypt(plaintext) {
    if (plaintext === null || plaintext === undefined) return null;
    if (typeof plaintext !== 'string') plaintext = String(plaintext);

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a packed ciphertext string produced by encrypt().
 * Returns null if the input is null.
 * Throws if the ciphertext has been tampered with (auth tag mismatch).
 */
function decrypt(packed) {
    if (packed === null || packed === undefined) return null;

    const parts = packed.split(':');
    if (parts.length !== 3) {
        throw new Error('Field decryption error: invalid ciphertext format.');
    }

    const [ivHex, tagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
}

/**
 * Convenience: check whether a value appears to be an FLE-encrypted blob.
 * Useful for skipping re-encryption on unchanged fields.
 */
function isEncrypted(value) {
    if (typeof value !== 'string') return false;
    const parts = value.split(':');
    return parts.length === 3 && parts[0].length === IV_BYTES * 2;
}

module.exports = { encrypt, decrypt, isEncrypted };
