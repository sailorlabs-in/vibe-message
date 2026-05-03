import {
  SignupRequest,
  LoginRequest,
  CreateAppRequest,
  UpdateAppRequest,
  RegisterDeviceRequest,
  UnregisterDeviceRequest,
  SendPushRequest,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  UpdateAppLimitRequest,
  CreateWarningRequest,
} from '../types';
import { BadRequestException } from '@nestjs/common';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
};

export const validateSignup = (data: any): SignupRequest => {
  let { name, email, password } = data;

  if (name && typeof name === 'string') {
    name = name.trim();
  }

  if (email && typeof email === 'string') {
    email = email.trim();
  }

  if (!name || name.length === 0) {
    throw new BadRequestException('Name is required');
  }

  if (!email || !isValidEmail(email)) {
    throw new BadRequestException('Valid email is required');
  }

  if (!password || !isStrongPassword(password)) {
    throw new BadRequestException(
      'Password must be at least 8 characters with uppercase, lowercase, and number'
    );
  }

  return { name, email: email.toLowerCase(), password };
};

export const validateLogin = (data: any): LoginRequest => {
  let { email, password } = data;

  if (email && typeof email === 'string') {
    email = email.trim();
  }

  if (!email || !isValidEmail(email)) {
    throw new BadRequestException('Valid email is required');
  }

  if (!password || typeof password !== 'string') {
    throw new BadRequestException('Password is required');
  }

  return { email: email.toLowerCase(), password };
};

export const validateCreateApp = (data: any): CreateAppRequest => {
  const { name, description } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestException('App name is required');
  }

  return {
    name: name.trim(),
    description: description ? String(description).trim() : undefined,
  };
};

export const validateUpdateApp = (data: any): UpdateAppRequest => {
  const { name, description, is_active, retention_days } = data;
  const updates: UpdateAppRequest = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('App name must be a non-empty string');
    }
    updates.name = name.trim();
  }

  if (description !== undefined) {
    updates.description = description ? String(description).trim() : undefined;
  }

  if (is_active !== undefined) {
    if (typeof is_active !== 'boolean') {
      throw new BadRequestException('is_active must be a boolean');
    }
    updates.is_active = is_active;
  }

  if (retention_days !== undefined) {
    if (retention_days !== null && (typeof retention_days !== 'number' || retention_days < 1)) {
      throw new BadRequestException('retention_days must be a positive number or null');
    }
    updates.retention_days = retention_days;
  }

  if (Object.keys(updates).length === 0) {
    throw new BadRequestException('At least one field must be provided for update');
  }

  return updates;
};

export const validateRegisterDevice = (data: any): RegisterDeviceRequest => {
  const { appId, publicKey, externalUserId, subscription, timezone } = data;

  if (!appId || typeof appId !== 'string') {
    throw new BadRequestException('appId is required');
  }

  if (!publicKey || typeof publicKey !== 'string') {
    throw new BadRequestException('publicKey is required');
  }

  if (!externalUserId || typeof externalUserId !== 'string') {
    throw new BadRequestException('externalUserId is required');
  }

  if (!subscription || typeof subscription !== 'object') {
    throw new BadRequestException('subscription is required');
  }

  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    throw new BadRequestException('subscription.endpoint is required');
  }

  if (!subscription.keys || typeof subscription.keys !== 'object') {
    throw new BadRequestException('subscription.keys is required');
  }

  if (!subscription.keys.p256dh || !subscription.keys.auth) {
    throw new BadRequestException('subscription.keys.p256dh and auth are required');
  }

  return { appId, publicKey, externalUserId, subscription, timezone };
};

export const validateUnregisterDevice = (data: any): UnregisterDeviceRequest => {
  const { appId, externalUserId, endpoint } = data;

  if (!appId || typeof appId !== 'string') {
    throw new BadRequestException('appId is required');
  }

  if (!externalUserId || typeof externalUserId !== 'string') {
    throw new BadRequestException('externalUserId is required');
  }

  const result: UnregisterDeviceRequest = { appId, externalUserId };
  if (endpoint && typeof endpoint === 'string') {
    result.endpoint = endpoint;
  }

  return result;
};

export const validateSendPush = (data: any): SendPushRequest => {
  const { appId, secretKey, targets, notification, scheduledAtLocalTime } = data;

  if (!appId || typeof appId !== 'string') {
    throw new BadRequestException('appId is required');
  }

  if (!secretKey || typeof secretKey !== 'string') {
    throw new BadRequestException('secretKey is required');
  }

  if (!notification || typeof notification !== 'object') {
    throw new BadRequestException('notification is required');
  }

  if (!notification.title || typeof notification.title !== 'string') {
    throw new BadRequestException('notification.title is required');
  }

  const req: SendPushRequest = { appId, secretKey, targets, notification };
  
  if (scheduledAtLocalTime && typeof scheduledAtLocalTime === 'string') {
    req.scheduledAtLocalTime = scheduledAtLocalTime;
  }
  
  return req;
};

export const validateUpdateUserStatus = (data: any): UpdateUserStatusRequest => {
  const { status } = data;

  if (!status || !['PENDING', 'APPROVED', 'BANNED'].includes(status)) {
    throw new BadRequestException('status must be PENDING, APPROVED, or BANNED');
  }

  return { status };
};

export const validateUpdateUserRole = (data: any): UpdateUserRoleRequest => {
  const { role } = data;

  if (!role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    throw new BadRequestException('role must be ADMIN or SUPER_ADMIN');
  }

  return { role };
};

export const validateUpdateAppLimit = (data: any): UpdateAppLimitRequest => {
  const { appLimit } = data;

  if (appLimit !== null && (typeof appLimit !== 'number' || appLimit < 0)) {
    throw new BadRequestException('appLimit must be a positive number or null');
  }

  return { appLimit };
};

export const validateCreateWarning = (data: any): CreateWarningRequest => {
  const { message } = data;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new BadRequestException('Warning message is required');
  }

  return { message: message.trim() };
};

export const validateUpdateProfile = (data: any): { name?: string; email?: string } => {
  let { name, email } = data;
  const updates: { name?: string; email?: string } = {};

  if (name !== undefined) {
    if (typeof name === 'string') {
      name = name.trim();
    }
    if (typeof name !== 'string' || name.length === 0) {
      throw new BadRequestException('Name must be a non-empty string');
    }
    updates.name = name;
  }

  if (email !== undefined) {
    if (typeof email === 'string') {
      email = email.trim();
    }
    if (!isValidEmail(email)) {
      throw new BadRequestException('Valid email is required');
    }
    updates.email = email.toLowerCase();
  }

  if (Object.keys(updates).length === 0) {
    throw new BadRequestException('At least one field (name or email) must be provided');
  }

  return updates;
};

export const validateChangePassword = (data: any): void => {
  if (!data.oldPassword || typeof data.oldPassword !== 'string') {
    throw new BadRequestException('Current password is required');
  }

  if (!data.newPassword || typeof data.newPassword !== 'string') {
    throw new BadRequestException('New password is required');
  }

  if (data.newPassword.length < 6) {
    throw new BadRequestException('New password must be at least 6 characters');
  }

  if (data.oldPassword === data.newPassword) {
    throw new BadRequestException('New password must be different from current password');
  }
};
