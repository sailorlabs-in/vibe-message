import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PushService } from "../push/push.service";
import { SystemSettings } from "../system/system_settings.entity";
import { App as AppEntity } from "../app/app.entity";
import { Notification } from "../push/notification.entity";
import { DeviceToken } from "../device/device_token.entity";
import { DripCampaign, DripSentLog } from "../drip/drip.entity";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private pushService: PushService,
    @InjectRepository(SystemSettings)
    private systemSettingsRepo: Repository<SystemSettings>,
    @InjectRepository(AppEntity)
    private appRepo: Repository<AppEntity>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(DeviceToken)
    private deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(DripCampaign)
    private dripCampaignRepo: Repository<DripCampaign>,
    @InjectRepository(DripSentLog)
    private dripSentLogRepo: Repository<DripSentLog>,
    private redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    try {
      const lockKey = "vibe:cleanup_lock";
      const acquired = await this.redisService.client.set(lockKey, "locked", "PX", 3600000, "NX"); // 1 hour lock
      if (acquired !== "OK") {
        this.logger.debug("🧹 [Cron] Notification cleanup lock already acquired. Skipping.");
        return;
      }

      this.logger.log("🧹 [Cron] Running daily notification cleanup job...");
      const settings = await this.systemSettingsRepo.findOne({
        where: { id: 1 },
      });
      const defaultRetention = settings?.default_retention_days ?? 14;

      const apps = await this.appRepo.find({
        select: ["id", "retention_days"],
      });

      let deletedCount = 0;
      for (const app of apps) {
        const retentionDays = app.retention_days ?? defaultRetention;
        const deleteResult = await this.notificationRepo
          .createQueryBuilder()
          .delete()
          .where("app_id = :appId", { appId: app.id })
          .andWhere(`created_at < NOW() - INTERVAL '1 day' * :days`, {
            days: retentionDays,
          })
          .execute();
        deletedCount += deleteResult.affected || 0;
      }
      this.logger.log(
        `✅ [Cron] Cleanup complete. Deleted ${deletedCount} expired notifications.`,
      );
    } catch (error) {
      this.logger.error("❌ [Cron] Error during notification cleanup:", error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTimezoneScheduler() {
    try {
      const lockKey = "vibe:cron_lock";
      const acquired = await this.redisService.client.set(lockKey, "locked", "PX", 50000, "NX"); // 50 seconds lock
      if (acquired !== "OK") {
        this.logger.debug("🌍 [Cron] Timezone-aware scheduler lock already acquired by another replica. Skipping.");
        return;
      }

      this.logger.log("🌍 [Cron] Timezone-aware scheduler tick (Lock Acquired)...");
      try {
        await this.runRegularScheduler();
      } catch (err) {
        this.logger.error("❌ [Cron] Regular scheduler error:", err);
      }

      try {
        await this.runDripScheduler();
      } catch (err) {
        this.logger.error("❌ [Cron] Drip scheduler error:", err);
      }
    } catch (error) {
      this.logger.error("❌ [Cron] Distributed locking error:", error);
    }
  }

  private async runRegularScheduler() {
    const notifications = await this.notificationRepo
      .createQueryBuilder("n")
      .where("n.scheduled_at_local_time IS NOT NULL")
      .andWhere("n.created_at >= NOW() - INTERVAL '36 hours'")
      .getMany();

    for (const notification of notifications) {
      const { id, app_id, payload_json, scheduled_at_local_time } =
        notification;

      const targetDevicesResult = await this.deviceTokenRepo
        .createQueryBuilder("dt")
        .select("dt.external_user_id", "external_user_id")
        .where("dt.app_id = :appId", { appId: app_id })
        .andWhere("dt.is_active = true")
        .andWhere(
          `(CURRENT_TIMESTAMP AT TIME ZONE (CASE WHEN dt.timezone = 'Asia/Calcutta' THEN 'Asia/Kolkata' ELSE dt.timezone END))::time >= :scheduledTime::time`,
          { scheduledTime: scheduled_at_local_time },
        )
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("1")
            .from("notification_logs", "nl")
            .where("nl.notification_id = :notificationId")
            .andWhere("nl.device_token_id = dt.id")
            .getQuery();
          return `NOT EXISTS ${subQuery}`;
        })
        .setParameter("notificationId", id)
        .getRawMany();

      if (targetDevicesResult.length > 0) {
        const targetUserIds = targetDevicesResult.map(
          (r: any) => r.external_user_id,
        );
        const payload =
          typeof payload_json === "string"
            ? JSON.parse(payload_json)
            : payload_json;
        this.logger.log(
          `[Scheduler] Sending scheduled notification ${id} to ${targetUserIds.length} user(s)...`,
        );
        await this.pushService.sendPushNotification(
          app_id,
          payload,
          targetUserIds,
        );
      }
    }
  }

  private async runDripScheduler() {
    const campaignsResult = await this.dripCampaignRepo
      .createQueryBuilder("dc")
      .select([
        "dc.id AS campaign_id",
        "dc.app_id AS app_id",
        "ds.id AS step_id",
        "ds.step_number AS step_number",
        "ds.delay_days AS delay_days",
        "ds.scheduled_at_local_time::text AS step_time",
        "ds.notification_payload_json AS notification_payload_json",
      ])
      .innerJoin("drip_steps", "ds", "ds.campaign_id = dc.id")
      .where("dc.is_active = true")
      .orderBy("dc.id", "ASC")
      .addOrderBy("ds.step_number", "ASC")
      .getRawMany();

    if (campaignsResult.length === 0) return;

    for (const row of campaignsResult) {
      const {
        campaign_id,
        app_id,
        step_id,
        step_number,
        delay_days,
        step_time,
        notification_payload_json,
      } = row;

      if (!step_time) continue;

      const devicesResult = await this.deviceTokenRepo
        .createQueryBuilder("dt")
        .select([
          "dt.id AS device_id",
          "dt.external_user_id AS external_user_id",
          "dt.app_id AS app_id",
        ])
        .where("dt.app_id = :appId", { appId: app_id })
        .andWhere("dt.is_active = true")
        .andWhere(
          `(COALESCE(dt.drip_anchor_date, dt.created_at) + (:delayDays * INTERVAL '1 day')) <= NOW()`,
          { delayDays: delay_days },
        )
        .andWhere(
          `(CURRENT_TIMESTAMP AT TIME ZONE (CASE WHEN dt.timezone = 'Asia/Calcutta' THEN 'Asia/Kolkata' ELSE dt.timezone END))::time >= :stepTime::time`,
          { stepTime: step_time },
        )
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("1")
            .from("drip_sent_logs", "dsl")
            .where("dsl.drip_step_id = :stepId")
            .andWhere("dsl.device_token_id = dt.id")
            .getQuery();
          return `NOT EXISTS ${subQuery}`;
        })
        .setParameter("stepId", step_id)
        .getRawMany();

      if (devicesResult.length === 0) continue;

      let payload: any;
      try {
        payload =
          typeof notification_payload_json === "string"
            ? JSON.parse(notification_payload_json)
            : notification_payload_json;
      } catch {
        continue;
      }

      const targetUserIds = devicesResult.map((r: any) => r.external_user_id);
      const deviceIds = devicesResult.map((r: any) => r.device_id);

      this.logger.log(
        `[Drip] Campaign ${campaign_id} / step ${step_number} (id=${step_id}) → sending to ${targetUserIds.length} device(s)...`,
      );

      try {
        await this.pushService.sendPushNotification(
          app_id,
          payload,
          targetUserIds,
        );

        if (deviceIds.length > 0) {
          await this.dripSentLogRepo
            .createQueryBuilder()
            .insert()
            .into(DripSentLog)
            .values(
              deviceIds.map((deviceId: number) => ({
                drip_step_id: step_id,
                device_token_id: deviceId,
              })),
            )
            .orIgnore()
            .execute();
        }
      } catch (err) {
        this.logger.error(`[Drip] Failed to send step ${step_id}:`, err);
      }
    }
  }
}
