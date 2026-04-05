import { Router, Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';
import * as deviceService from '../services/deviceService';
import { validateRegisterDevice, validateUnregisterDevice } from '../utils/validation';
import { getVapidPublicKey } from '../utils/webPush';
import { decryptPayload } from '../utils/crypto';

const router = Router();

// Get VAPID public key (needed for client-side push subscription)
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      publicKey: getVapidPublicKey(),
    },
  });
});

/**
 * @swagger
 * /sdk/register-device:
 *   post:
 *     summary: Register a device for push notifications
 *     tags: [External Notifications APIs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *               - publicKey
 *               - subscription
 *               - externalUserId
 *             properties:
 *               appId:
 *                 type: string
 *               publicKey:
 *                 type: string
 *               subscription:
 *                 type: object
 *               externalUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device registered successfully
 */
router.post('/register-device', async (req: Request, res: Response, next: NextFunction) => {
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
      decrypted = decryptPayload(payload, appInfo.public_key);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid payload encryption' });
      return;
    }

    const data = validateRegisterDevice({
      appId,
      ...decrypted
    });

    // Validate SDK credentials (appId + publicKey)
    const app = await appService.validateSdkCredentials(data.appId, data.publicKey);

    // Register device
    const device = await deviceService.registerDevice(
      app.id,
      data.externalUserId,
      data.subscription,
      data.timezone
    );

    res.status(201).json({
      success: true,
      data: {
        deviceId: device.id,
        message: 'Device registered successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Unregister device
router.post('/unregister-device', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appId, payload } = req.body;
    if (!appId || !payload) {
      res.status(400).json({ success: false, message: 'appId and payload are required' });
      return;
    }

    // Validate app exists
    const appInfo = await appService.getAppByPublicId(appId);
    if (!appInfo) {
      res.status(404).json({
        success: false,
        message: 'App not found',
      });
      return;
    }

    let decrypted = {};
    try {
      decrypted = decryptPayload(payload, appInfo.public_key);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid payload encryption' });
      return;
    }

    const data = validateUnregisterDevice({
      appId,
      ...decrypted
    });

    // Unregister device
    await deviceService.unregisterDevice(appInfo.id, data.externalUserId, data.endpoint);

    return res.json({
      success: true,
      message: 'Device unregistered successfully',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
