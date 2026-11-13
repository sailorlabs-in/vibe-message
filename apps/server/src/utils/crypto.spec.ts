import {
  encryptPayload,
  decryptPayload,
  isPayloadEncrypted,
  SYSTEM_ENCRYPTION_KEY,
} from './crypto';

describe('Crypto Utilities (Unit Tests)', () => {
  const secretKey = 'my-super-secret-key-123456';
  const testData = {
    title: 'Important Alert',
    body: 'Confidential notification message',
    userId: 42,
    metadata: { nested: true, tags: ['a', 'b'] },
  };

  it('should encrypt a payload into AES ciphertext format starting with U2FsdGVkX1', () => {
    const ciphertext = encryptPayload(testData, secretKey);

    expect(typeof ciphertext).toBe('string');
    expect(ciphertext.startsWith('U2FsdGVkX1')).toBe(true);
    expect(isPayloadEncrypted(ciphertext)).toBe(true);
  });

  it('should decrypt AES ciphertext back to the original object', () => {
    const ciphertext = encryptPayload(testData, secretKey);
    const decrypted = decryptPayload(ciphertext, secretKey);

    expect(decrypted).toEqual(testData);
    expect(decrypted.title).toBe(testData.title);
    expect(decrypted.userId).toBe(42);
    expect(decrypted.metadata.tags).toEqual(['a', 'b']);
  });

  it('should throw an error when decrypting with an incorrect secret key', () => {
    const ciphertext = encryptPayload(testData, secretKey);

    expect(() => {
      decryptPayload(ciphertext, 'wrong-secret-key-abcdef');
    }).toThrow();
  });

  it('should correctly identify non-encrypted strings', () => {
    expect(isPayloadEncrypted('{"plain":"json"}')).toBe(false);
    expect(isPayloadEncrypted('random string')).toBe(false);
    expect(isPayloadEncrypted('')).toBe(false);
    expect(isPayloadEncrypted(null as any)).toBe(false);
    expect(isPayloadEncrypted(undefined as any)).toBe(false);
  });

  it('should encrypt and decrypt using SYSTEM_ENCRYPTION_KEY for database at rest confidentiality', () => {
    const payload = { alert: 'Database encrypted at rest' };
    const encrypted = encryptPayload(payload, SYSTEM_ENCRYPTION_KEY);

    expect(isPayloadEncrypted(encrypted)).toBe(true);

    const decrypted = decryptPayload(encrypted, SYSTEM_ENCRYPTION_KEY);
    expect(decrypted).toEqual(payload);
  });
});
