import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { ApprovedGuard } from "../../common/guards/approved.guard";
import { CreateAppRequest, UpdateAppRequest } from "../../types";
import { InternalNotificationService } from "../system/internal-notification.service";
import { PushService } from "../push/push.service";
import { DeviceService } from "../device/device.service";
import { DripService } from "../drip/drip.service";
import { UserService } from "../user/user.service";
import { getDevicePlatform } from "../../utils/webPush";

@ApiTags("Apps")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("apps")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly internalNotificationService: InternalNotificationService,
    private readonly pushService: PushService,
    private readonly deviceService: DeviceService,
    private readonly dripService: DripService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(ApprovedGuard)
  @Get()
  async getUserApps(@Req() req: any, @Query("userId") userId?: string) {
    const targetUserId = userId ? parseInt(userId, 10) : undefined;
    const apps = await this.appService.getUserApps(
      req.user.userId,
      req.user.role,
      targetUserId,
    );
    return { success: true, data: apps };
  }

  @UseGuards(ApprovedGuard)
  @Post()
  async createApp(@Req() req: any, @Body() data: CreateAppRequest) {
    const app = await this.appService.createApp(req.user.userId, data);
    return { success: true, data: app };
  }

  @Get("system/public")
  async getSystemAppPublic() {
    const app = await this.internalNotificationService.getOrCreateInternalApp();
    return {
      success: true,
      data: {
        public_app_id: app.public_app_id,
        public_key: app.public_key || "",
      },
    };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id")
  async getAppById(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    return { success: true, data: app };
  }

  @UseGuards(ApprovedGuard)
  @Patch(":id")
  async updateApp(
    @Req() req: any,
    @Param("id") id: string,
    @Body() data: UpdateAppRequest,
  ) {
    const app = await this.appService.updateApp(
      id,
      req.user.userId,
      req.user.role,
      data,
    );
    return { success: true, data: app };
  }

  @UseGuards(ApprovedGuard)
  @Post(":id/rotate-secret")
  async rotateAppSecret(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.rotateAppSecret(
      id,
      req.user.userId,
      req.user.role,
    );
    return { success: true, data: app };
  }

  @UseGuards(ApprovedGuard)
  @Delete(":id")
  async deleteApp(@Req() req: any, @Param("id") id: string) {
    await this.appService.deleteApp(id, req.user.userId, req.user.role);
    return { success: true, message: "App deleted successfully" };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id/notifications")
  async getAppNotifications(
    @Req() req: any,
    @Param("id") id: string,
    @Query("scheduled") scheduled?: string,
  ) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    const isScheduled = scheduled === "true";
    const notifications = await this.pushService.getAppNotifications(
      app.id,
      100,
      isScheduled,
    );
    return { success: true, data: notifications };
  }

  @UseGuards(ApprovedGuard)
  @Delete(":id/notifications")
  async clearAppNotifications(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    if (app.currentUserRole === "viewer") {
      throw new ForbiddenException("Viewers cannot clear notification history");
    }
    await this.pushService.clearAppNotifications(app.id);
    return {
      success: true,
      message: "Notification history cleared successfully",
    };
  }

  @UseGuards(ApprovedGuard)
  @Delete(":id/notifications/:notificationId")
  async deleteNotification(
    @Req() req: any,
    @Param("id") id: string,
    @Param("notificationId") notificationId: string,
  ) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    if (app.currentUserRole === "viewer") {
      throw new ForbiddenException("Viewers cannot delete notifications");
    }
    await this.pushService.deleteNotification(
      app.id,
      parseInt(notificationId, 10),
    );
    return {
      success: true,
      message: "Notification deleted successfully",
    };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id/notifications/:notificationId/logs")
  async getNotificationLogs(
    @Req() req: any,
    @Param("id") id: string,
    @Param("notificationId") notificationId: string,
  ) {
    await this.appService.getAppById(id, req.user.userId, req.user.role);
    const logs = await this.pushService.getNotificationLogs(
      parseInt(notificationId, 10),
    );
    const mappedLogs = logs.map((log) => ({
      id: log.id,
      notification_id: log.notification_id,
      device_token_id: log.device_token_id,
      status: log.status,
      error_message: log.error_message,
      sent_at: log.sent_at,
      device_token: log.device_token
        ? {
            id: log.device_token.id,
            external_user_id: log.device_token.external_user_id,
            platform: getDevicePlatform(log.device_token.subscription_json),
          }
        : undefined,
    }));
    return { success: true, data: mappedLogs };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id/subscribers")
  async getAppSubscribers(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    const devices = await this.deviceService.getDevicesByApp(app.id);
    const subscribers = devices.map((d) => ({
      id: d.id,
      external_user_id: d.external_user_id,
      is_active: d.is_active,
      created_at: d.created_at,
      updated_at: d.updated_at,
      platform: getDevicePlatform(d.subscription_json),
    }));
    return { success: true, data: subscribers };
  }

  @UseGuards(ApprovedGuard)
  @Delete(":id/subscribers")
  async clearAppSubscribers(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    if (app.currentUserRole === "viewer") {
      throw new ForbiddenException("Viewers cannot clear subscribers");
    }
    await this.deviceService.unregisterAllDevicesForApp(app.id);
    return {
      success: true,
      message: "All devices unregistered successfully for this app",
    };
  }

  @UseGuards(ApprovedGuard)
  @Post(":id/push")
  async sendPushNotificationDirectly(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    if (app.currentUserRole === "viewer") {
      throw new ForbiddenException("Viewers cannot send push notifications");
    }
    let targetUserIds: string[] | undefined;
    if (body.targets?.externalUserIds?.length > 0) {
      targetUserIds = body.targets.externalUserIds;
    }
    const result = await this.pushService.sendPushNotification(
      app.id,
      body.notification,
      targetUserIds,
      body.scheduledAt,
    );
    return {
      success: true,
      data: {
        notificationId: result.notificationId,
        sent: result.sent,
        failed: result.failed,
        message: result.queued
          ? "Notification queued for delivery in background"
          : `Notification sent to ${result.sent} device(s), ${result.failed} failed`,
      },
    };
  }

  @Get("user/warnings")
  async getUserWarnings(@Req() req: any) {
    const warnings = await this.userService.getUserWarnings(req.user.userId);
    return { success: true, data: warnings };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id/drip-campaign")
  async getDripCampaign(@Req() req: any, @Param("id") id: string) {
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    const campaign = await this.dripService.getDripCampaign(app.id);
    return { success: true, data: campaign };
  }

  @UseGuards(ApprovedGuard)
  @Post(":id/drip-campaign")
  async saveDripCampaign(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    const { name, steps, is_active } = body;
    const campaignName =
      typeof name === "string" && name.trim() ? name.trim() : "Drip Campaign";
    const isActive = typeof is_active === "boolean" ? is_active : true;
    const app = await this.appService.getAppById(
      id,
      req.user.userId,
      req.user.role,
    );
    if (app.currentUserRole === "viewer") {
      throw new ForbiddenException("Viewers cannot save drip campaigns");
    }
    const campaign = await this.dripService.saveDripCampaign(
      app.id,
      campaignName,
      steps,
      isActive,
    );
    return { success: true, data: campaign };
  }

  @UseGuards(ApprovedGuard)
  @Get(":id/members")
  async getMembers(@Req() req: any, @Param("id") id: string) {
    const members = await this.appService.getAppMembers(
      id,
      req.user.userId,
      req.user.role,
    );
    return { success: true, data: members };
  }

  @UseGuards(ApprovedGuard)
  @Post(":id/members")
  async shareApp(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { email: string; role: "moderator" | "viewer" },
  ) {
    const result = await this.appService.shareApp(
      id,
      req.user.userId,
      req.user.role,
      body.email,
      body.role,
    );
    return { success: true, data: result };
  }

  @UseGuards(ApprovedGuard)
  @Patch(":id/members/:userId")
  async updateMemberRole(
    @Req() req: any,
    @Param("id") id: string,
    @Param("userId") memberUserId: string,
    @Body() body: { role: "moderator" | "viewer" },
  ) {
    const result = await this.appService.updateAppMemberRole(
      id,
      req.user.userId,
      req.user.role,
      parseInt(memberUserId, 10),
      body.role,
    );
    return { success: true, data: result };
  }

  @UseGuards(ApprovedGuard)
  @Delete(":id/members/:userId")
  async removeMember(
    @Req() req: any,
    @Param("id") id: string,
    @Param("userId") memberUserId: string,
  ) {
    const result = await this.appService.removeAppMember(
      id,
      req.user.userId,
      req.user.role,
      parseInt(memberUserId, 10),
    );
    return { success: true, data: result };
  }
}
