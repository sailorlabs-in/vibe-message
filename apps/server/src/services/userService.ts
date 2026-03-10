import { query } from '../config/database';
import {
  User,
  UserResponse,
  UserStatus,
  UpdateUserStatusRequest,
  UpdateAppLimitRequest,
  CreateWarningRequest,
  Warning,
} from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

const userToResponse = (user: User): UserResponse => {
  const { password_hash, ...userResponse } = user;
  return userResponse;
};

export const getAllUsers = async (statusFilter?: UserStatus): Promise<UserResponse[]> => {
  let queryText = 'SELECT * FROM users WHERE role = $1';
  const params: any[] = ['ADMIN'];

  if (statusFilter) {
    queryText += ' AND status = $2';
    params.push(statusFilter);
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, params);
  return result.rows.map(userToResponse);
};

export const updateUserStatus = async (
  userId: number,
  data: UpdateUserStatusRequest
): Promise<UserResponse> => {
  const result = await query(
    `UPDATE users 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND role = $3
     RETURNING *`,
    [data.status, userId, 'ADMIN']
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found or cannot modify super admin');
  }

  const user = result.rows[0];

  // Send notification to user
  const {
    notifyUserApproved,
    notifyUserBanned,
  } = require('./internalNotificationService');

  if (data.status === 'APPROVED') {
    notifyUserApproved(userId, user.name).catch((err) =>
      console.error('Failed to send approval notification:', err)
    );
  } else if (data.status === 'BANNED') {
    notifyUserBanned(userId).catch((err) =>
      console.error('Failed to send ban notification:', err)
    );
  }

  return userToResponse(user);
};

export const updateUserAppLimit = async (
  userId: number,
  data: UpdateAppLimitRequest
): Promise<UserResponse> => {
  const result = await query(
    `UPDATE users 
     SET app_limit = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND role = $3
     RETURNING *`,
    [data.appLimit, userId, 'ADMIN']
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found or cannot modify super admin');
  }

  // Notify user about app limit change
  const { notifyUserAppLimitChanged } = require('./internalNotificationService');
  notifyUserAppLimitChanged(userId, data.appLimit).catch((err) =>
    console.error('Failed to send app limit notification:', err)
  );

  return userToResponse(result.rows[0]);
};

export const createWarning = async (
  userId: number,
  createdBy: number,
  data: CreateWarningRequest
): Promise<Warning> => {
  // Verify user exists
  const userCheck = await query(
    'SELECT id FROM users WHERE id = $1',
    [userId]
  );

  if (userCheck.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const result = await query(
    `INSERT INTO warnings (user_id, message, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, data.message, createdBy]
  );

  // Notify user about warning
  const { notifyUserWarned } = require('./internalNotificationService');
  notifyUserWarned(userId, data.message).catch((err) =>
    console.error('Failed to send warning notification:', err)
  );

  return result.rows[0];
};

export const getUserWarnings = async (userId: number): Promise<Warning[]> => {
  const result = await query(
    'SELECT * FROM warnings WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result.rows;
};

export const updateUserProfile = async (
  userId: number,
  name?: string,
  email?: string
): Promise<UserResponse> => {
  // Check if email is already taken by another user
  if (email) {
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      throw new ForbiddenError('Email is already in use');
    }
  }

  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (name) {
    updates.push(`name = $${paramCount++}`);
    params.push(name);
  }

  if (email) {
    updates.push(`email = $${paramCount++}`);
    params.push(email);
  }

  if (updates.length === 0) {
    throw new ValidationError('At least one field (name or email) must be provided');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(userId);

  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  return userToResponse(result.rows[0]);
};

export const deleteUserAccount = async (userId: number): Promise<void> => {
  // Prevent super admin from deleting their own account
  const userCheck = await query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (userCheck.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  if (userCheck.rows[0].role === 'SUPER_ADMIN') {
    throw new ForbiddenError('Super admin cannot delete their own account');
  }

  // Delete user (cascade will handle apps, devices, etc.)
  await query('DELETE FROM users WHERE id = $1', [userId]);
};

export const deleteUserBySuperAdmin = async (
  targetUserId: number,
  superAdminId: number
): Promise<{ deletedAppsCount: number }> => {
  // Verify super admin
  const adminCheck = await query(
    'SELECT role FROM users WHERE id = $1',
    [superAdminId]
  );

  if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Only super admin can delete users');
  }

  // Prevent deleting another super admin
  const targetCheck = await query(
    'SELECT role FROM users WHERE id = $1',
    [targetUserId]
  );

  if (targetCheck.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  if (targetCheck.rows[0].role === 'SUPER_ADMIN') {
    throw new ForbiddenError('Cannot delete super admin accounts');
  }

  // Get count of apps that will be deleted
  const appsCount = await query(
    'SELECT COUNT(*) as count FROM apps WHERE user_id = $1',
    [targetUserId]
  );

  // Delete user (cascade will handle everything)
  await query('DELETE FROM users WHERE id = $1', [targetUserId]);

  return { deletedAppsCount: parseInt(appsCount.rows[0].count) };
};
