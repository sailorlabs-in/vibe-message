import CryptoJS from 'crypto-js';

export const SYSTEM_ENCRYPTION_KEY =
  (import.meta as any).env?.VITE_VIBE_SYSTEM_KEY || 'vibe_sys_k9x2m4p7q1w8e3r5t6y0u2i4o8p1a3s5';

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
 * @param encryptedPayload Base64 string.
 * @param secret The secret string acting as the decryption key.
 * @returns The decrypted JS object or throws an error if decryption fails.
 */
export function decryptPayload<T = any>(
  encryptedPayload: string,
  secret: string = SYSTEM_ENCRYPTION_KEY
): T {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPayload, secret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error('Decryption failed, returned empty string');
    }
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Invalid or corrupted encrypted payload');
  }
}
