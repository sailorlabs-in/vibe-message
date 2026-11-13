import {
  validateSignup,
  validateLogin,
  validateCreateApp,
  validateUpdateApp,
  validateRegisterDevice,
  validateUnregisterDevice,
  validateSendPush,
  validateUpdateUserStatus,
  validateUpdateUserRole,
  validateUpdateAppLimit,
  validateCreateWarning,
  validateUpdateProfile,
  validateChangePassword,
} from './validation';
import { BadRequestException } from '@nestjs/common';

describe('Validation Utilities (Unit Tests)', () => {
  describe('validateSignup', () => {
    it('should validate valid signup data', () => {
      const result = validateSignup({
        name: ' John Doe ',
        email: ' John@Example.com ',
        password: 'Password123',
      });
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
    });

    it('should throw BadRequestException if name is missing or empty', () => {
      expect(() =>
        validateSignup({ name: '   ', email: 'test@example.com', password: 'Password123' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateSignup({ name: '', email: 'test@example.com', password: 'Password123' })
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email is invalid', () => {
      expect(() =>
        validateSignup({ name: 'John', email: 'invalid-email', password: 'Password123' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateSignup({ name: 'John', email: '', password: 'Password123' })
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is weak', () => {
      expect(() =>
        validateSignup({ name: 'John', email: 'john@example.com', password: 'weak' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateSignup({ name: 'John', email: 'john@example.com', password: 'lowercaseonly1' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateSignup({ name: 'John', email: 'john@example.com', password: 'UPPERCASEONLY1' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateSignup({ name: 'John', email: 'john@example.com', password: 'NoNumberPass' })
      ).toThrow(BadRequestException);
    });
  });

  describe('validateLogin', () => {
    it('should validate valid login data', () => {
      const result = validateLogin({
        email: ' Test@Domain.com ',
        password: 'anypassword',
      });
      expect(result).toEqual({
        email: 'test@domain.com',
        password: 'anypassword',
      });
    });

    it('should throw BadRequestException on invalid email or password', () => {
      expect(() => validateLogin({ email: 'bad', password: 'pass' })).toThrow(
        BadRequestException
      );
      expect(() => validateLogin({ email: 'test@domain.com', password: '' })).toThrow(
        BadRequestException
      );
      expect(() => validateLogin({ email: 'test@domain.com', password: 123 as any })).toThrow(
        BadRequestException
      );
    });
  });

  describe('validateCreateApp', () => {
    it('should validate valid app creation data', () => {
      const res = validateCreateApp({ name: ' My App ', description: ' A cool app ' });
      expect(res).toEqual({ name: 'My App', description: 'A cool app' });

      const resNoDesc = validateCreateApp({ name: 'My App' });
      expect(resNoDesc.description).toBeUndefined();
    });

    it('should throw BadRequestException if name is missing or invalid', () => {
      expect(() => validateCreateApp({ name: '   ' })).toThrow(BadRequestException);
      expect(() => validateCreateApp({ name: null })).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateApp', () => {
    it('should validate valid update fields', () => {
      const res = validateUpdateApp({
        name: ' Updated Name ',
        description: ' New description ',
        is_active: false,
        retention_days: 30,
      });
      expect(res).toEqual({
        name: 'Updated Name',
        description: 'New description',
        is_active: false,
        retention_days: 30,
      });
    });

    it('should accept null retention_days', () => {
      const res = validateUpdateApp({ retention_days: null });
      expect(res.retention_days).toBeNull();
    });

    it('should throw BadRequestException on invalid fields', () => {
      expect(() => validateUpdateApp({})).toThrow(BadRequestException);
      expect(() => validateUpdateApp({ name: '   ' })).toThrow(BadRequestException);
      expect(() => validateUpdateApp({ is_active: 'true' as any })).toThrow(BadRequestException);
      expect(() => validateUpdateApp({ retention_days: -5 })).toThrow(BadRequestException);
      expect(() => validateUpdateApp({ retention_days: 0 })).toThrow(BadRequestException);
    });
  });

  describe('validateRegisterDevice', () => {
    const validData = {
      appId: 'app_123',
      publicKey: 'pk_123',
      externalUserId: 'user_123',
      subscription: {
        endpoint: 'https://push.example.com',
        keys: { p256dh: 'key1', auth: 'auth1' },
      },
      timezone: 'UTC',
    };

    it('should validate valid device registration', () => {
      expect(validateRegisterDevice(validData)).toEqual(validData);
    });

    it('should throw BadRequestException for missing required device fields', () => {
      expect(() => validateRegisterDevice({ ...validData, appId: '' })).toThrow(
        BadRequestException
      );
      expect(() => validateRegisterDevice({ ...validData, publicKey: '' })).toThrow(
        BadRequestException
      );
      expect(() => validateRegisterDevice({ ...validData, externalUserId: '' })).toThrow(
        BadRequestException
      );
      expect(() => validateRegisterDevice({ ...validData, subscription: null })).toThrow(
        BadRequestException
      );
      expect(() =>
        validateRegisterDevice({
          ...validData,
          subscription: { endpoint: '' },
        })
      ).toThrow(BadRequestException);
      expect(() =>
        validateRegisterDevice({
          ...validData,
          subscription: { endpoint: 'https://ok', keys: null },
        })
      ).toThrow(BadRequestException);
      expect(() =>
        validateRegisterDevice({
          ...validData,
          subscription: { endpoint: 'https://ok', keys: { p256dh: '' } },
        })
      ).toThrow(BadRequestException);
    });
  });

  describe('validateUnregisterDevice', () => {
    it('should validate unregister device request', () => {
      const res = validateUnregisterDevice({
        appId: 'app_1',
        externalUserId: 'usr_1',
        endpoint: 'https://endpoint',
      });
      expect(res).toEqual({
        appId: 'app_1',
        externalUserId: 'usr_1',
        endpoint: 'https://endpoint',
      });
    });

    it('should validate unregister device without endpoint', () => {
      const res = validateUnregisterDevice({ appId: 'app_1', externalUserId: 'usr_1' });
      expect(res).toEqual({ appId: 'app_1', externalUserId: 'usr_1' });
    });

    it('should throw BadRequestException on invalid fields', () => {
      expect(() => validateUnregisterDevice({ appId: '', externalUserId: 'u1' })).toThrow(
        BadRequestException
      );
      expect(() => validateUnregisterDevice({ appId: 'a1', externalUserId: '' })).toThrow(
        BadRequestException
      );
    });
  });

  describe('validateSendPush', () => {
    const valid = {
      appId: 'app_1',
      secretKey: 'sk_1',
      targets: { all: true },
      notification: { title: 'Hello', body: 'World' },
    };

    it('should validate valid push notification request', () => {
      expect(validateSendPush(valid)).toEqual(valid);
    });

    it('should validate push notification with scheduledAt', () => {
      const req = { ...valid, scheduledAt: '2026-12-01T00:00:00Z' };
      expect(validateSendPush(req)).toEqual(req);
    });

    it('should validate silent push notification without title', () => {
      const req = {
        appId: 'app_1',
        secretKey: 'sk_1',
        targets: { all: true },
        notification: { silent: true },
      };
      expect(validateSendPush(req)).toEqual(req);
    });

    it('should throw BadRequestException for invalid push parameters', () => {
      expect(() => validateSendPush({ ...valid, appId: '' })).toThrow(BadRequestException);
      expect(() => validateSendPush({ ...valid, secretKey: '' })).toThrow(BadRequestException);
      expect(() => validateSendPush({ ...valid, notification: null })).toThrow(
        BadRequestException
      );
      expect(() =>
        validateSendPush({ ...valid, notification: { title: '' } })
      ).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateUserStatus', () => {
    it('should validate allowed statuses', () => {
      expect(validateUpdateUserStatus({ status: 'APPROVED' })).toEqual({ status: 'APPROVED' });
      expect(validateUpdateUserStatus({ status: 'PENDING' })).toEqual({ status: 'PENDING' });
      expect(validateUpdateUserStatus({ status: 'BANNED' })).toEqual({ status: 'BANNED' });
    });

    it('should throw for invalid status', () => {
      expect(() => validateUpdateUserStatus({ status: 'UNKNOWN' })).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateUserRole', () => {
    it('should validate allowed roles', () => {
      expect(validateUpdateUserRole({ role: 'ADMIN' })).toEqual({ role: 'ADMIN' });
      expect(validateUpdateUserRole({ role: 'SUPER_ADMIN' })).toEqual({ role: 'SUPER_ADMIN' });
    });

    it('should throw for invalid role', () => {
      expect(() => validateUpdateUserRole({ role: 'GUEST' })).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateAppLimit', () => {
    it('should validate valid app limit', () => {
      expect(validateUpdateAppLimit({ appLimit: 5 })).toEqual({ appLimit: 5 });
      expect(validateUpdateAppLimit({ appLimit: null })).toEqual({ appLimit: null });
    });

    it('should throw on negative or invalid app limit', () => {
      expect(() => validateUpdateAppLimit({ appLimit: -1 })).toThrow(BadRequestException);
      expect(() => validateUpdateAppLimit({ appLimit: 'five' as any })).toThrow(
        BadRequestException
      );
    });
  });

  describe('validateCreateWarning', () => {
    it('should validate warning with message', () => {
      expect(validateCreateWarning({ message: '  Watch out!  ' })).toEqual({
        message: 'Watch out!',
      });
    });

    it('should throw if message is empty', () => {
      expect(() => validateCreateWarning({ message: '   ' })).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateProfile', () => {
    it('should validate name and email updates', () => {
      const res = validateUpdateProfile({
        name: ' Jane Doe ',
        email: ' Jane@Example.com ',
      });
      expect(res).toEqual({ name: 'Jane Doe', email: 'jane@example.com' });
    });

    it('should validate partial update (only name or only email)', () => {
      expect(validateUpdateProfile({ name: 'Jane' })).toEqual({ name: 'Jane' });
      expect(validateUpdateProfile({ email: 'jane@example.com' })).toEqual({
        email: 'jane@example.com',
      });
    });

    it('should throw if neither field is provided', () => {
      expect(() => validateUpdateProfile({})).toThrow(BadRequestException);
    });

    it('should throw on empty name or invalid email', () => {
      expect(() => validateUpdateProfile({ name: '   ' })).toThrow(BadRequestException);
      expect(() => validateUpdateProfile({ email: 'bad-email' })).toThrow(BadRequestException);
    });
  });

  describe('validateChangePassword', () => {
    it('should pass on valid password change', () => {
      expect(() =>
        validateChangePassword({
          oldPassword: 'oldPassword1',
          newPassword: 'newPassword2',
        })
      ).not.toThrow();
    });

    it('should throw if old or new password is missing', () => {
      expect(() =>
        validateChangePassword({ oldPassword: '', newPassword: 'newPassword' })
      ).toThrow(BadRequestException);
      expect(() =>
        validateChangePassword({ oldPassword: 'oldPassword', newPassword: '' })
      ).toThrow(BadRequestException);
    });

    it('should throw if new password is too short', () => {
      expect(() =>
        validateChangePassword({ oldPassword: 'oldPassword', newPassword: '123' })
      ).toThrow(BadRequestException);
    });

    it('should throw if new password matches old password', () => {
      expect(() =>
        validateChangePassword({
          oldPassword: 'samePassword',
          newPassword: 'samePassword',
        })
      ).toThrow(BadRequestException);
    });
  });
});
