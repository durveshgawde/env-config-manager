import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * Key must be exactly 32 characters for AES-256
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }
    return Buffer.from(key, 'utf-8');
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
    return !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 32;
}

/**
 * Encrypt a string value using AES-256-GCM
 * Returns base64 encoded string: salt:iv:tag:encrypted
 */
export function encrypt(text: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from password and salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'base64')
    ]);

    return 'ENC:' + combined.toString('base64');
}

/**
 * Decrypt an encrypted string
 * Expects format: ENC:base64(salt:iv:tag:encrypted)
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText.startsWith('ENC:')) {
        // Not encrypted, return as-is
        return encryptedText;
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedText.slice(4), 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from password and salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith('ENC:');
}

/**
 * Encrypt sensitive values in a config object
 * Keys ending with _SECRET, _KEY, _PASSWORD, _TOKEN are encrypted
 */
export function encryptSensitiveValues(data: Record<string, unknown>): Record<string, unknown> {
    if (!isEncryptionEnabled()) {
        return data;
    }

    const sensitivePatterns = ['_SECRET', '_KEY', '_PASSWORD', '_TOKEN', '_CREDENTIAL'];
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        const upperKey = key.toUpperCase();
        const isSensitive = sensitivePatterns.some(pattern => upperKey.includes(pattern));

        if (isSensitive && typeof value === 'string' && !isEncrypted(value)) {
            result[key] = encrypt(value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Decrypt all encrypted values in a config object
 */
export function decryptSensitiveValues(data: Record<string, unknown>): Record<string, unknown> {
    if (!isEncryptionEnabled()) {
        return data;
    }

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && isEncrypted(value)) {
            try {
                result[key] = decrypt(value);
            } catch {
                // If decryption fails, return encrypted value
                result[key] = value;
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}
