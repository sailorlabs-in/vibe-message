import { Router, Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import {
  validateUpdateUserStatus,
  validateUpdateAppLimit,
  validateCreateWarning,
} from '../utils/validation';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
import { UserStatus } from '../types';

import { 
  getAdminNotifications 
} from '../services/internalNotificationService';

const router = Router();

// All routes require super admin
router.use(authMiddleware);
router.use(requireRole('SUPER_ADMIN'));

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     summary: Get admin notifications
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin notifications
 */
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await getAdminNotifications();
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, BANNED]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusFilter = req.query.status as UserStatus | undefined;
    const users = await userService.getAllUsers(statusFilter);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// Update user status
router.patch('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const data = validateUpdateUserStatus(req.body);
    const user = await userService.updateUserStatus(userId, data);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user app limit
router.patch('/users/:id/app-limit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const data = validateUpdateAppLimit(req.body);
    const user = await userService.updateUserAppLimit(userId, data);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Create warning for user
router.post('/users/:id/warn', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const data = validateCreateWarning(req.body);
    const warning = await userService.createWarning(userId, req.user!.userId, data);

    res.status(201).json({
      success: true,
      data: warning,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (super admin only)
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const result = await userService.deleteUserBySuperAdmin(userId, req.user!.userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
