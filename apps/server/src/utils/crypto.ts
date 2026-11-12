import { customAlphabet } from 'nanoid';
import CryptoJS from 'crypto-js';

// Generate public app ID (short, URL-safe)
const nanoidAppId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  16
);

// Generate secret key (longer, more secure)
const nanoidSecret = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_',
  64
);

export const generateAppId = (): string => {
  return `app_${nanoidAppId()}`;
};

export const generateSecretKey = (): string => {
  return `sk_${nanoidSecret()}`;
};

export const SYSTEM_ENCRYPTION_KEY =
  process.env.VIBE_SYSTEM_KEY || 'vibe_sys_k9x2m4p7q1w8e3r5t6y0u2i4o8p1a3s5';

/**
 * Encrypts a payload object symmetrically using AES.
 * @param payload The raw JavaScript object or primitive to encrypt.
 * @param secret The secret string acting as the encryption key.
 * @returns The base64 encrypted string.
 */
export function encryptPayload(payload: any, secret: string = SYSTEM_ENCRYPTION_KEY): string {
  const jsonString = JSON.stringify(payload);
  return CryptoJS.AES.encrypt(jsonString, secret).toString();
}

/**
 * Decrypts an AES encrypted payload using a secret.
 * @param encryptedPayload Base64 string from SDK.
 * @param secret The secret string acting as the decryption key.
 * @returns The decrypted JS object or throws an error if decryption fails.
 */
export function decryptPayload(
  encryptedPayload: string,
  secret: string = SYSTEM_ENCRYPTION_KEY
): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPayload, secret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error('Decryption failed, returned empty string');
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Invalid or corrupted encrypted payload');
  }
}

/**
 * Checks if a payload string is formatted as CryptoJS AES ciphertext.
 */
export function isPayloadEncrypted(payload: string): boolean {
  if (!payload || typeof payload !== 'string') return false;
  return payload.startsWith('U2FsdGVkX1');
}

/**
 * Encrypts a notification payload object for secure storage in the database.
 * If already encrypted, returns as-is.
 */
export function encryptNotificationPayload(
  payload: any,
  secret: string = SYSTEM_ENCRYPTION_KEY
): string {
  if (typeof payload === 'string') {
    if (isPayloadEncrypted(payload)) {
      return payload;
    }
    try {
      const parsed = JSON.parse(payload);
      return encryptPayload(parsed, secret);
    } catch {
      return encryptPayload({ body: payload }, secret);
    }
  }
  return encryptPayload(payload, secret);
}

/**
 * Decrypts a notification payload stored in the database.
 * Gracefully falls back to plain JSON parsing for backward compatibility.
 */
export function decryptNotificationPayload(
  payloadOrCipher: string,
  secret: string = SYSTEM_ENCRYPTION_KEY
): any {
  if (!payloadOrCipher) return {};
  if (isPayloadEncrypted(payloadOrCipher)) {
    try {
      const decrypted = decryptPayload(payloadOrCipher, secret);
      return typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;
    } catch {
      // Fallback below
    }
  }

  try {
    return JSON.parse(payloadOrCipher);
  } catch {
    return { title: 'Notification', body: payloadOrCipher };
  }
}
