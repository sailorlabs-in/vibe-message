import {
  encryptPayload,
  decryptPayload,
  isPayloadEncrypted,
  SYSTEM_ENCRYPTION_KEY,
  generateAppId,
  generateSecretKey,
  encryptNotificationPayload,
  decryptNotificationPayload,
} from './crypto';

describe('Crypto Utilities (Unit Tests)', () => {
  const secretKey = 'my-super-secret-key-123456';
  const testData = {
    title: 'Important Alert',
    body: 'Confidential notification message',
    userId: 42,
    metadata: { nested: true, tags: ['a', 'b'] },
  };

  it('should generate an app ID with app_ prefix', () => {
    const appId = generateAppId();
    expect(appId.startsWith('app_')).toBe(true);
    expect(appId.length).toBeGreaterThan(10);
  });

  it('should generate a secret key with sk_ prefix', () => {
    const sk = generateSecretKey();
    expect(sk.startsWith('sk_')).toBe(true);
    expect(sk.length).toBeGreaterThan(30);
  });

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

  it('should throw an error when decrypting with an incorrect secret key or corrupt payload', () => {
    const ciphertext = encryptPayload(testData, secretKey);

    expect(() => {
      decryptPayload(ciphertext, 'wrong-secret-key-abcdef');
    }).toThrow('Invalid or corrupted encrypted payload');

    expect(() => {
      decryptPayload('invalid-string', secretKey);
    }).toThrow('Invalid or corrupted encrypted payload');
  });

  it('should correctly identify non-encrypted strings', () => {
    expect(isPayloadEncrypted('{"plain":"json"}')).toBe(false);
    expect(isPayloadEncrypted('random string')).toBe(false);
    expect(isPayloadEncrypted('')).toBe(false);
    expect(isPayloadEncrypted(null as any)).toBe(false);
    expect(isPayloadEncrypted(undefined as any)).toBe(false);
  });

  it('should encrypt and decrypt using SYSTEM_ENCRYPTION_KEY by default', () => {
    const payload = { alert: 'Database encrypted at rest' };
    const encrypted = encryptPayload(payload);

    expect(isPayloadEncrypted(encrypted)).toBe(true);

    const decrypted = decryptPayload(encrypted);
    expect(decrypted).toEqual(payload);
  });

  describe('encryptNotificationPayload', () => {
    it('should return already encrypted payload as-is', () => {
      const encrypted = encryptPayload({ text: 'already encrypted' });
      expect(encryptNotificationPayload(encrypted)).toBe(encrypted);
    });

    it('should parse valid JSON string and encrypt it', () => {
      const jsonStr = JSON.stringify({ hello: 'world' });
      const encrypted = encryptNotificationPayload(jsonStr);
      expect(isPayloadEncrypted(encrypted)).toBe(true);
      expect(decryptPayload(encrypted)).toEqual({ hello: 'world' });
    });

    it('should handle non-JSON string by wrapping in { body }', () => {
      const rawText = 'Just a regular notification message';
      const encrypted = encryptNotificationPayload(rawText);
      expect(isPayloadEncrypted(encrypted)).toBe(true);
      expect(decryptPayload(encrypted)).toEqual({ body: rawText });
    });

    it('should encrypt object payload', () => {
      const obj = { title: 'Test', count: 5 };
      const encrypted = encryptNotificationPayload(obj);
      expect(isPayloadEncrypted(encrypted)).toBe(true);
      expect(decryptPayload(encrypted)).toEqual(obj);
    });
  });

  describe('decryptNotificationPayload', () => {
    it('should return empty object for empty or falsy payload', () => {
      expect(decryptNotificationPayload('')).toEqual({});
      expect(decryptNotificationPayload(null as any)).toEqual({});
    });

    it('should decrypt encrypted JSON string', () => {
      const obj = { message: 'secret' };
      const cipher = encryptPayload(obj);
      expect(decryptNotificationPayload(cipher)).toEqual(obj);
    });

    it('should decrypt double-stringified payload', () => {
      const cipher = encryptPayload(JSON.stringify({ inner: true }));
      expect(decryptNotificationPayload(cipher)).toEqual({ inner: true });
    });

    it('should fallback to JSON.parse for plaintext JSON', () => {
      const jsonStr = JSON.stringify({ plain: true });
      expect(decryptNotificationPayload(jsonStr)).toEqual({ plain: true });
    });

    it('should fallback to { title, body } for plain unparseable text', () => {
      const text = 'Just some text';
      expect(decryptNotificationPayload(text)).toEqual({
        title: 'Notification',
        body: text,
      });
    });

    it('should fallback to plain text if decryption fails on ciphertext-like string', () => {
      const fakeCipher = 'U2FsdGVkX1_not_really_valid_data';
      expect(decryptNotificationPayload(fakeCipher)).toEqual({
        title: 'Notification',
        body: fakeCipher,
      });
    });
  });
});
