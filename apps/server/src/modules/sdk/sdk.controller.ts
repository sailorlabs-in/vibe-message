import { Controller, Get, Post, Body, Res, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AppService } from "../app/app.service";
import { DeviceService } from "../device/device.service";
import { getVapidPublicKey } from "../../utils/webPush";
import { decryptPayload } from "../../utils/crypto";
import {
  validateRegisterDevice,
  validateUnregisterDevice,
} from "../../utils/validation";

@ApiTags("External Notifications APIs")
@Controller("sdk")
export class SdkController {
  constructor(
    private readonly appService: AppService,
    private readonly deviceService: DeviceService,
  ) {}

  @Get("vapid-public-key")
  getVapidPublicKey() {
    return { success: true, data: { publicKey: getVapidPublicKey() } };
  }

  @Post("register-device")
  async registerDevice(@Body() body: any, @Res() res: Response) {
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
        decrypted = decryptPayload(payload, appInfo.public_key);
      } catch (e) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Invalid payload encryption" });
      }

      const data = validateRegisterDevice({ appId, ...decrypted });

      const app = await this.appService.validateSdkCredentials(
        data.appId,
        data.publicKey,
      );

      const device = await this.deviceService.registerDevice(
        app.id,
        data.externalUserId,
        data.subscription,
        data.timezone,
      );

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: {
          deviceId: device.id,
          message: "Device registered successfully",
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

  @Post("unregister-device")
  async unregisterDevice(@Body() body: any, @Res() res: Response) {
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
        decrypted = decryptPayload(payload, appInfo.public_key);
      } catch (e) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Invalid payload encryption" });
      }

      const data = validateUnregisterDevice({ appId, ...decrypted });

      await this.deviceService.unregisterDevice(
        appInfo.id,
        data.externalUserId,
        data.endpoint,
      );

      return res.json({
        success: true,
        message: "Device unregistered successfully",
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
