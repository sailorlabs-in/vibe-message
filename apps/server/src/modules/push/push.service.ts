import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Notification as NotificationEntity } from "./notification.entity";
import { NotificationLog as NotificationLogEntity } from "./notification_log.entity";
import { DeviceToken as DeviceTokenEntity } from "../device/device_token.entity";
import { NotificationPayload, PushSubscription } from "../../types";
import { webpush } from "../../utils/webPush";
import { RedisService } from "../redis/redis.service";

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (attempt: number): number => {
  const delay =
    RETRY_CONFIG.initialDelay *
    Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

const isRetryableError = (error: any): boolean => {
  if (error.statusCode) {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return error.statusCode === 429;
    }
    if (error.statusCode >= 500) {
      return true;
    }
  }
  if (
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT" ||
    error.code === "ENOTFOUND"
  ) {
    return true;
  }
  return false;
};

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationLogEntity)
    private notificationLogRepository: Repository<NotificationLogEntity>,
    @InjectRepository(DeviceTokenEntity)
    private deviceTokenRepository: Repository<DeviceTokenEntity>,
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  private async sendToDevice(
    subscription: PushSubscription,
    payload: string,
    attempt: number = 0,
  ): Promise<void> {
    try {
      await webpush.sendNotification(subscription as any, payload);
    } catch (error: any) {
      if (error.statusCode === 410) {
        throw error;
      }
      if (isRetryableError(error) && attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.log(
          `[Push Service] Retry attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms`,
        );
        await sleep(delay);
        return this.sendToDevice(subscription, payload, attempt + 1);
      }
      throw error;
    }
  }

  async sendPushNotification(
    appId: number,
    notification: NotificationPayload,
    targetUserIds?: string[],
    scheduledAt?: Date | string,
  ): Promise<{ notificationId: number; sent: number; failed: number; queued?: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newNotification = this.notificationRepository.create({
        app_id: appId,
        payload_json: JSON.stringify(notification),
        is_silent: notification.silent || false,
        scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
        target_user_ids: targetUserIds ? JSON.stringify(targetUserIds) : null,
      });

      const savedNotification = await queryRunner.manager.save(newNotification);
      await queryRunner.commitTransaction();

      if (scheduledAt) {
        return { notificationId: savedNotification.id, sent: 0, failed: 0, queued: false };
      }

      // Enqueue job in Redis for async delivery
      await this.redisService.client.rpush(
        "vibe:push_queue",
        JSON.stringify({
          notificationId: savedNotification.id,
          appId,
          targetUserIds,
        }),
      );

      return {
        notificationId: savedNotification.id,
        sent: 0,
        failed: 0,
        queued: true,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async executePushDelivery(
    notificationId: number,
    appId: number,
    targetUserIds?: string[],
  ): Promise<{ sent: number; failed: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedNotification = await queryRunner.manager.findOne(NotificationEntity, {
        where: { id: notificationId },
      });

      if (!savedNotification) {
        console.error(`[Push Service] Notification ${notificationId} not found in DB`);
        await queryRunner.commitTransaction();
        return { sent: 0, failed: 0 };
      }

      const notification: NotificationPayload = JSON.parse(savedNotification.payload_json);

      const queryBuilder = queryRunner.manager
        .createQueryBuilder(DeviceTokenEntity, "dt")
        .where("dt.app_id = :appId", { appId })
        .andWhere("dt.is_active = true");

      if (targetUserIds && targetUserIds.length > 0) {
        queryBuilder.andWhere("dt.external_user_id IN (:...targetUserIds)", {
          targetUserIds,
        });
      }

      const devices = await queryBuilder.getMany();

      if (devices.length === 0) {
        await queryRunner.commitTransaction();
        return { sent: 0, failed: 0 };
      }

      let sentCount = 0;
      let failedCount = 0;

      const sendPromises = devices.map(async (device) => {
        try {
          const subscription = JSON.parse(device.subscription_json);
          const payload = JSON.stringify(notification);

          await this.sendToDevice(subscription, payload);

          const log = this.notificationLogRepository.create({
            notification_id: savedNotification.id,
            device_token_id: device.id,
            status: "SENT",
            sent_at: new Date(),
          });
          await queryRunner.manager.save(log);

          sentCount++;
        } catch (error: any) {
          const errorCategory =
            error.statusCode === 410
              ? "SUBSCRIPTION_EXPIRED"
              : isRetryableError(error)
                ? "TRANSIENT_ERROR"
                : "PERMANENT_ERROR";
          const errorMessage = `${errorCategory}: ${error.message || "Unknown error"}`;

          const log = this.notificationLogRepository.create({
            notification_id: savedNotification.id,
            device_token_id: device.id,
            status: "FAILED",
            error_message: errorMessage,
            sent_at: new Date(),
          });
          await queryRunner.manager.save(log);

          failedCount++;

          if (error.statusCode === 410) {
            await queryRunner.manager.update(DeviceTokenEntity, device.id, {
              is_active: false,
            });
          }
        }
      });

      await Promise.all(sendPromises);
      await queryRunner.commitTransaction();

      return {
        sent: sentCount,
        failed: failedCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async getNotificationLogs(
    notificationId: number,
  ): Promise<NotificationLogEntity[]> {
    return this.notificationLogRepository.find({
      where: { notification_id: notificationId },
      relations: ["device_token"],
      order: { sent_at: "DESC" },
    });
  }

  async getAppNotifications(
    appId: number,
    limit: number = 50,
    scheduled: boolean = false,
  ): Promise<NotificationEntity[]> {
    const now = new Date();
    if (scheduled) {
      return this.notificationRepository.createQueryBuilder("n")
        .where("n.app_id = :appId", { appId })
        .andWhere("n.scheduled_at IS NOT NULL")
        .andWhere("n.scheduled_at > :now", { now })
        .orderBy("n.scheduled_at", "ASC")
        .take(limit)
        .getMany();
    } else {
      return this.notificationRepository.createQueryBuilder("n")
        .where("n.app_id = :appId", { appId })
        .andWhere("(n.scheduled_at IS NULL OR n.scheduled_at <= :now)", { now })
        .orderBy("n.created_at", "DESC")
        .take(limit)
        .getMany();
    }
  }

  async deleteNotification(appId: number, notificationId: number): Promise<void> {
    await this.notificationRepository.delete({ app_id: appId, id: notificationId });
  }

  async clearAppNotifications(appId: number): Promise<void> {
    await this.notificationRepository.delete({ app_id: appId });
  }
}
