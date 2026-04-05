import { Router, Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';
import * as pushService from '../services/pushService';
import { validateSendPush } from '../utils/validation';
import { pushLimiter } from '../middleware/rateLimiter';
import { decryptPayload } from '../utils/crypto';

const router = Router();

/**
 * @swagger
 * /push/send:
 *   post:
 *     summary: Send push notification
 *     tags: [External Notifications APIs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *               - secretKey
 *               - notification
 *             properties:
 *               appId:
 *                 type: string
 *               secretKey:
 *                 type: string
 *               notification:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   data:
 *                     type: object
 *               targets:
 *                 type: object
 *                 properties:
 *                   all:
 *                     type: boolean
 *                   externalUserIds:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/send', pushLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appId, payload } = req.body;
    if (!appId || !payload) {
      res.status(400).json({ success: false, message: 'appId and payload are required' });
      return;
    }

    const appInfo = await appService.getAppByPublicId(appId);
    if (!appInfo) {
      res.status(404).json({ success: false, message: 'App not found' });
      return;
    }

    let decrypted = {};
    try {
      decrypted = decryptPayload(payload, appInfo.secret_key);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid payload encryption' });
      return;
    }

    const data = validateSendPush({
      appId,
      secretKey: appInfo.secret_key, // Re-inject secretKey to pass validation
      ...decrypted
    });

    // Validate app credentials (reused logic for robustness)
    const app = await appService.validateAppCredentials(data.appId, data.secretKey);

    // Determine target users
    let targetUserIds: string[] | undefined;

    if (data.targets) {
      if (data.targets.externalUserIds && data.targets.externalUserIds.length > 0) {
        targetUserIds = data.targets.externalUserIds;
      }
      // If targets.all is true, targetUserIds remains undefined (send to all)
    }

    // Send push notification
    const result = await pushService.sendPushNotification(
      app.id,
      data.notification,
      targetUserIds,
      data.scheduledAtLocalTime
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

export default router;
