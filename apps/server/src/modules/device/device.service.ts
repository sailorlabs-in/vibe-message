import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { DeviceToken as DeviceTokenEntity } from "./device_token.entity";
import { PushSubscription } from "../../types";

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceTokenEntity)
    private deviceTokenRepository: Repository<DeviceTokenEntity>,
  ) {}

  async registerDevice(
    appId: number,
    externalUserId: string,
    subscription: PushSubscription,
    timezone: string = "UTC",
  ): Promise<DeviceTokenEntity> {
    const subscriptionJson = JSON.stringify(subscription);
    const endpoint = subscription.endpoint;

    // Use QueryBuilder to find by JSONB field
    const existingDevice = await this.deviceTokenRepository
      .createQueryBuilder("dt")
      .where("dt.app_id = :appId", { appId })
      .andWhere("dt.external_user_id = :externalUserId", { externalUserId })
      .andWhere("dt.subscription_json::jsonb->>'endpoint' = :endpoint", {
        endpoint,
      })
      .getOne();

    if (existingDevice) {
      existingDevice.subscription_json = subscriptionJson;
      existingDevice.timezone = timezone;
      existingDevice.is_active = true;
      return this.deviceTokenRepository.save(existingDevice);
    }

    // Try to insert
    try {
      const newDevice = this.deviceTokenRepository.create({
        app_id: appId,
        external_user_id: externalUserId,
        subscription_json: subscriptionJson,
        timezone: timezone,
        drip_anchor_date: new Date(),
      });
      return await this.deviceTokenRepository.save(newDevice);
    } catch (error: any) {
      // Conflict on unique constraint (app_id, external_user_id, md5(subscription_json))
      if (error.code === "23505") {
        const conflictDevice = await this.deviceTokenRepository.findOne({
          where: {
            app_id: appId,
            external_user_id: externalUserId,
          },
        });

        if (conflictDevice) {
          conflictDevice.timezone = timezone;
          conflictDevice.is_active = true;
          return this.deviceTokenRepository.save(conflictDevice);
        }
      }
      throw error;
    }
  }

  async unregisterDevice(
    appId: number,
    externalUserId: string,
    endpoint?: string,
  ): Promise<void> {
    if (endpoint) {
      const qb = this.deviceTokenRepository
        .createQueryBuilder()
        .update(DeviceTokenEntity)
        .set({ is_active: false })
        .where("app_id = :appId", { appId })
        .andWhere("external_user_id = :externalUserId", { externalUserId })
        .andWhere("subscription_json::jsonb->>'endpoint' = :endpoint", {
          endpoint,
        });
      await qb.execute();
    } else {
      await this.deviceTokenRepository.update(
        { app_id: appId, external_user_id: externalUserId },
        { is_active: false },
      );
    }
  }

  async unregisterAllDevicesForApp(appId: number): Promise<void> {
    await this.deviceTokenRepository.update(
      { app_id: appId },
      { is_active: false },
    );
  }

  async unregisterAllDevicesSystemWide(): Promise<void> {
    await this.deviceTokenRepository.update({}, { is_active: false });
  }

  async getDevicesByApp(
    appId: number,
    externalUserIds?: string[],
  ): Promise<DeviceTokenEntity[]> {
    const whereClause: any = { app_id: appId, is_active: true };
    if (externalUserIds && externalUserIds.length > 0) {
      whereClause.external_user_id = In(externalUserIds);
    }

    return this.deviceTokenRepository.find({ where: whereClause });
  }

  async getDeviceById(deviceId: number): Promise<DeviceTokenEntity> {
    const device = await this.deviceTokenRepository.findOne({
      where: { id: deviceId },
    });
    if (!device) {
      throw new NotFoundException("Device token not found");
    }
    return device;
  }
}
