import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { Response } from 'express';
// SDK tracking and registration controller
import { AppService } from '../app/app.service';
import { DeviceService } from '../device/device.service';
import { getVapidPublicKey } from '../../utils/webPush';
import { decryptPayload } from '../../utils/crypto';
import { validateRegisterDevice, validateUnregisterDevice } from '../../utils/validation';
import { PushService } from '../push/push.service';

class TrackNotificationDto {
  @ApiProperty({
    description: 'The notification log ID received inside the push payload (notificationLogId field)',
    example: 42,
    type: Number,
  })
  logId!: number;

  @ApiProperty({
    description: 'Delivery outcome reported by the service worker',
    enum: ['DELIVERED', 'FAILED'],
    example: 'DELIVERED',
  })
  status!: 'DELIVERED' | 'FAILED';

  @ApiProperty({
    description: 'Optional error details when status is FAILED',
    example: 'SW_SHOW_NOTIFICATION_ERROR: Permission denied',
    required: false,
    type: String,
  })
  errorMessage?: string;
}

@ApiTags('External Notifications APIs')
@Controller('sdk')
export class SdkController {
  constructor(
    private readonly appService: AppService,
    private readonly deviceService: DeviceService,
    private readonly pushService: PushService
  ) {}

  @ApiOperation({ summary: 'Get VAPID public key', description: 'Returns the VAPID public key required to subscribe to push notifications via the browser PushManager API.' })
  @ApiResponse({ status: 200, description: 'VAPID public key returned successfully', schema: { example: { success: true, data: { publicKey: 'BOrBn7_jKh4Q...' } } } })
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { success: true, data: { publicKey: getVapidPublicKey() } };
  }

  @Post('register-device')
  async registerDevice(@Body() body: any, @Res() res: Response) {
    try {
      const { appId, payload } = body;
      if (!appId || !payload) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'appId and payload are required' });
      }

      const appInfo = await this.appService.getAppByPublicId(appId);
      if (!appInfo) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'App not found' });
      }

      let decrypted: any = {};
      try {
        decrypted = decryptPayload(payload, appInfo.public_key);
      } catch {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid payload encryption' });
      }

      const data = validateRegisterDevice({ appId, ...decrypted });

      const app = await this.appService.validateSdkCredentials(data.appId, data.publicKey);

      const device = await this.deviceService.registerDevice(
        app.id,
        data.externalUserId,
        data.subscription,
        data.timezone
      );

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: {
          deviceId: device.id,
          message: 'Device registered successfully',
        },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  @Post('unregister-device')
  async unregisterDevice(@Body() body: any, @Res() res: Response) {
    try {
      const { appId, payload } = body;
      if (!appId || !payload) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'appId and payload are required' });
      }

      const appInfo = await this.appService.getAppByPublicId(appId);
      if (!appInfo) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'App not found' });
      }

      let decrypted: any = {};
      try {
        decrypted = decryptPayload(payload, appInfo.public_key);
      } catch {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid payload encryption' });
      }

      const data = validateUnregisterDevice({ appId, ...decrypted });

      await this.deviceService.unregisterDevice(appInfo.id, data.externalUserId, data.endpoint);

      return res.json({
        success: true,
        message: 'Device unregistered successfully',
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  @ApiOperation({
    summary: 'Track notification delivery status',
    description:
      'Callback endpoint invoked by service workers or client SDKs to report delivery success (DELIVERED) or failure (FAILED) for a dispatched push notification.',
  })
  @ApiBody({
    type: TrackNotificationDto,
    description: 'Notification delivery status payload',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification delivery tracked successfully',
    schema: {
      example: {
        success: true,
        message: 'Notification delivery tracked successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (missing fields, invalid logId or invalid status)',
    schema: {
      example: {
        success: false,
        message: 'status must be DELIVERED or FAILED',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Internal server error',
      },
    },
  })
  @Post('track')
  async trackNotification(
    @Body() body: TrackNotificationDto,
    @Res() res: Response
  ) {
    try {
      const { logId, status, errorMessage } = body;

      // Validate required fields
      if (!logId || !status) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'logId and status are required' });
      }

      // Validate logId is a safe positive integer (guards against integer overflow in Postgres)
      const parsedLogId = Number(logId);
      if (!Number.isInteger(parsedLogId) || parsedLogId <= 0 || parsedLogId > 2147483647) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid logId' });
      }

      // Validate status is one of the allowed values
      const allowedStatuses: Array<'DELIVERED' | 'FAILED'> = ['DELIVERED', 'FAILED'];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'status must be DELIVERED or FAILED' });
      }

      await this.pushService.updateLogStatus(parsedLogId, status, errorMessage);

      return res.status(HttpStatus.OK).json({ success: true, message: 'Notification delivery tracked successfully' });
    } catch (error: any) {
      console.error('[SDK Track] Error updating notification log status:', error?.message || error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}
