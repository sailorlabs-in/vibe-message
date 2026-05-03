import CryptoJS from 'crypto-js';

/**
 * Encrypts a payload object symmetrically using AES.
 * @param payload The raw JavaScript object or primitive to encrypt.
 * @param secret The secret string (publicKey or secretKey) acting as the encryption key.
 * @returns The base64 encrypted string.
 */
export function encryptPayload(payload: any, secret: string): string {
    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, secret).toString();
    return encrypted;
}
