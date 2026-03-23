import { Router, Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';
import * as userService from '../services/userService';
import * as pushService from '../services/pushService';
import * as deviceService from '../services/deviceService';
import { validateCreateApp, validateUpdateApp } from '../utils/validation';
import { authMiddleware } from '../middleware/auth';
import { requireApproved } from '../middleware/roleCheck';

/**
 * @swagger
 * tags:
 *   name: Apps
 *   description: Application management endpoints
 */

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /apps:
 *   get:
 *     summary: Get user's apps
 *     tags: [Apps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's apps
 */
router.get('/', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const apps = await appService.getUserApps(req.user!.userId, req.user!.role, targetUserId);

    res.json({
      success: true,
      data: apps,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /apps:
 *   post:
 *     summary: Create a new app
 *     tags: [Apps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: App created successfully
 */
router.post('/', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validateCreateApp(req.body);
    const app = await appService.createApp(req.user!.userId, data);

    res.status(201).json({
      success: true,
      data: app,
    });
  } catch (error) {
    next(error);
  }
});

// Get system app public credentials (for notifications when user has no apps)
router.get('/system/public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getOrCreateInternalApp } = require('../services/internalNotificationService');
    const app = await getOrCreateInternalApp();

    res.json({
      success: true,
      data: {
        public_app_id: app.public_app_id,
        public_key: app.public_key || '', // Ensure public_key is returned
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get app by ID
router.get('/:id', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const app = await appService.getAppById(publicAppId, req.user!.userId, req.user!.role);

    res.json({
      success: true,
      data: app,
    });
  } catch (error) {
    next(error);
  }
});

// Update app
router.patch('/:id', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const data = validateUpdateApp(req.body);
    const app = await appService.updateApp(publicAppId, req.user!.userId, req.user!.role, data);

    res.json({
      success: true,
      data: app,
    });
  } catch (error) {
    next(error);
  }
});

// Rotate app secret
router.post('/:id/rotate-secret', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const app = await appService.rotateAppSecret(publicAppId, req.user!.userId, req.user!.role);

    res.json({
      success: true,
      data: app,
    });
  } catch (error) {
    next(error);
  }
});

// Delete app (soft delete)
router.delete('/:id', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    await appService.deleteApp(publicAppId, req.user!.userId, req.user!.role);

    res.json({
      success: true,
      message: 'App deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get app notifications (History)
router.get('/:id/notifications', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const app = await appService.getAppById(publicAppId, req.user!.userId, req.user!.role);
    const notifications = await pushService.getAppNotifications(app.id, 100);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

// Get app notification logs (Analytics)
router.get('/:id/notifications/:notificationId/logs', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const notificationId = parseInt(req.params.notificationId, 10);
    // Verifying app ownership first
    await appService.getAppById(publicAppId, req.user!.userId, req.user!.role);
    
    const logs = await pushService.getNotificationLogs(notificationId);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// Get app subscribers (Device Tokens)
router.get('/:id/subscribers', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const app = await appService.getAppById(publicAppId, req.user!.userId, req.user!.role);
    const devices = await deviceService.getDevicesByApp(app.id);

    // Map to remove sensitive subscription JSON
    const subscribers = devices.map(d => ({
      id: d.id,
      external_user_id: d.external_user_id,
      is_active: d.is_active,
      created_at: d.created_at,
      updated_at: d.updated_at
    }));

    res.json({
      success: true,
      data: subscribers,
    });
  } catch (error) {
    next(error);
  }
});

// Send push notification directly (Admin panel)
router.post('/:id/push', requireApproved, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicAppId = req.params.id;
    const app = await appService.getAppById(publicAppId, req.user!.userId, req.user!.role);
    
    // Using existing pushService, but without the payload encryption reqs of external API
    const notification = req.body.notification;
    let targetUserIds: string[] | undefined;
    
    if (req.body.targets && req.body.targets.externalUserIds && req.body.targets.externalUserIds.length > 0) {
      targetUserIds = req.body.targets.externalUserIds;
    }

    const result = await pushService.sendPushNotification(
      app.id,
      notification,
      targetUserIds
    );

    res.json({
      success: true,
      data: {
        notificationId: result.notificationId,
        sent: result.sent,
        failed: result.failed,
        message: `Notification sent to ${result.sent} device(s), ${result.failed} failed`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user warnings (for settings page)
router.get('/user/warnings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warnings = await userService.getUserWarnings(req.user!.userId);

    res.json({
      success: true,
      data: warnings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
