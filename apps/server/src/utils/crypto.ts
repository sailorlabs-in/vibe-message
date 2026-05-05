import { customAlphabet } from "nanoid";
import CryptoJS from "crypto-js";

// Generate public app ID (short, URL-safe)
const nanoidAppId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16,
);

// Generate secret key (longer, more secure)
const nanoidSecret = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
  64,
);

export const generateAppId = (): string => {
  return `app_${nanoidAppId()}`;
};

export const generateSecretKey = (): string => {
  return `sk_${nanoidSecret()}`;
};

/**
 * Decrypts an AES encrypted payload using a secret.
 * @param encryptedPayload Base64 string from SDK.
 * @param secret The secret string acting as the decryption key.
 * @returns The decrypted JS object or throws an error if decryption fails.
 */
export function decryptPayload(encryptedPayload: string, secret: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPayload, secret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error("Decryption failed, returned empty string");
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    throw new Error("Invalid or corrupted encrypted payload");
  }
}
