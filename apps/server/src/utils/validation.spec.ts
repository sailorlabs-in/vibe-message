import {
  validateSignup,
  validateLogin,
  validateRegisterDevice,
  validateSendPush,
} from './validation';
import { BadRequestException } from '@nestjs/common';

describe('Validation Utilities (Unit Tests)', () => {
  describe('validateSignup', () => {
    it('should validate and sanitize valid signup data', () => {
      const valid = {
        name: '  Jane Doe  ',
        email: '  Jane.Doe@Example.com  ',
        password: 'Password@123',
      };

      const result = validateSignup(valid);
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane.doe@example.com');
      expect(result.password).toBe('Password@123');
    });

    it('should reject invalid email', () => {
      expect(() => {
        validateSignup({
          name: 'Jane',
          email: 'not-an-email',
          password: 'Password@123',
        });
      }).toThrow(BadRequestException);
    });

    it('should reject weak password', () => {
      expect(() => {
        validateSignup({
          name: 'Jane',
          email: 'jane@example.com',
          password: '123',
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('validateLogin', () => {
    it('should validate valid login credentials', () => {
      const result = validateLogin({
        email: '  USER@EXAMPLE.COM ',
        password: 'secretPassword123',
      });
      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('secretPassword123');
    });

    it('should reject missing email or password', () => {
      expect(() => validateLogin({ email: '' })).toThrow(BadRequestException);
      expect(() => validateLogin({ email: 'user@example.com', password: '' })).toThrow(
        BadRequestException
      );
    });
  });

  describe('validateRegisterDevice', () => {
    it('should validate device registration payload', () => {
      const valid = {
        appId: 'app_123',
        publicKey: 'pub_key_456',
        externalUserId: 'user_789',
        subscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
          keys: {
            auth: 'auth_key',
            p256dh: 'p256_key',
          },
        },
      };

      const result = validateRegisterDevice(valid);
      expect(result.appId).toBe('app_123');
      expect(result.publicKey).toBe('pub_key_456');
      expect(result.externalUserId).toBe('user_789');
    });

    it('should reject invalid push subscription keys', () => {
      expect(() => {
        validateRegisterDevice({
          appId: 'app_123',
          publicKey: 'pub_key',
          externalUserId: 'user_1',
          subscription: {
            endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
            keys: { auth: '' },
          },
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('validateSendPush', () => {
    it('should validate valid push notification payload', () => {
      const valid = {
        appId: 'app_123',
        secretKey: 'sec_key_456',
        notification: {
          title: 'Hello World',
          body: 'Test push notification',
        },
      };

      const result = validateSendPush(valid);
      expect(result.notification.title).toBe('Hello World');
      expect(result.notification.body).toBe('Test push notification');
    });

    it('should reject notification without title', () => {
      expect(() => {
        validateSendPush({
          appId: 'app_123',
          secretKey: 'sec_key',
          notification: { title: '' },
        });
      }).toThrow(BadRequestException);
    });
  });
});
