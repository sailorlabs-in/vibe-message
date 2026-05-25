import { Controller, Post, Body, Res, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AppService } from "../app/app.service";
import { PushService } from "./push.service";
import { validateSendPush } from "../../utils/validation";
import { decryptPayload } from "../../utils/crypto";

@ApiTags("External Notifications APIs")
@Controller("push")
export class PushController {
  constructor(
    private readonly appService: AppService,
    private readonly pushService: PushService,
  ) {}

  @Post("send")
  async sendPush(@Body() body: any, @Res() res: Response) {
    try {
      const { appId, payload } = body;
      if (!appId || !payload) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "appId and payload are required" });
      }

      const appInfo = await this.appService.getAppByPublicId(appId);
      if (!appInfo) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "App not found" });
      }

      let decrypted: any = {};
      try {
        decrypted = decryptPayload(payload, appInfo.secret_key);
      } catch (e) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Invalid payload encryption" });
      }

      const data = validateSendPush({
        appId,
        secretKey: appInfo.secret_key,
        ...decrypted,
      });

      const app = await this.appService.validateAppCredentials(
        data.appId,
        data.secretKey,
      );

      let targetUserIds: string[] | undefined;
      if (data.targets) {
        if (
          data.targets.externalUserIds &&
          data.targets.externalUserIds.length > 0
        ) {
          targetUserIds = data.targets.externalUserIds;
        }
      }

      const result = await this.pushService.sendPushNotification(
        app.id,
        data.notification,
        targetUserIds,
        data.scheduledAt,
      );

      return res.json({
        success: true,
        data: {
          notificationId: result.notificationId,
          sent: result.sent,
          failed: result.failed,
          message: result.queued
            ? "Notification queued for delivery in background"
            : `Notification sent to ${result.sent} device(s), ${result.failed} failed`,
        },
      });
    } catch (error: any) {
      if (error.status) {
        return res
          .status(error.status)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
