import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { PushService } from '../push/push.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private dataSource: DataSource,
    private pushService: PushService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('🧹 [Cron] Running daily notification cleanup job...');
    try {
      const settingsResult = await this.dataSource.query('SELECT default_retention_days FROM system_settings WHERE id = 1');
      const defaultRetention = settingsResult.length ? settingsResult[0].default_retention_days : 14;

      const appsResult = await this.dataSource.query('SELECT id, retention_days FROM apps');
      
      let deletedCount = 0;
      for (const app of appsResult) {
        const retentionDays = app.retention_days ?? defaultRetention;
        const deleteQuery = `
          DELETE FROM notifications 
          WHERE app_id = $1 
          AND created_at < NOW() - INTERVAL '${retentionDays} days'
        `;
        const result = await this.dataSource.query(deleteQuery, [app.id]);
        deletedCount += result[1] || 0; // Postgres driver via TypeORM sometimes returns [results, rowCount]
      }
      this.logger.log(`✅ [Cron] Cleanup complete. Deleted expired notifications.`);
    } catch (error) {
      this.logger.error('❌ [Cron] Error during notification cleanup:', error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTimezoneScheduler() {
    this.logger.log('🌍 [Cron] Timezone-aware scheduler tick...');
    try {
      await this.runRegularScheduler();
    } catch (err) {
      this.logger.error('❌ [Cron] Regular scheduler error:', err);
    }

    try {
      await this.runDripScheduler();
    } catch (err) {
      this.logger.error('❌ [Cron] Drip scheduler error:', err);
    }
  }

  private async runRegularScheduler() {
    const notificationsResult = await this.dataSource.query(`
      SELECT id, app_id, payload_json, scheduled_at_local_time::text AS scheduled_time
      FROM   notifications
      WHERE  scheduled_at_local_time IS NOT NULL
    `);

    for (const notification of notificationsResult) {
      const { id, app_id, payload_json, scheduled_time } = notification;

      const targetDevicesResult = await this.dataSource.query(
        `
        SELECT dt.external_user_id
        FROM   device_tokens dt
        WHERE  dt.app_id    = $1
          AND  dt.is_active = true
          AND  (CURRENT_TIMESTAMP AT TIME ZONE (CASE WHEN dt.timezone = 'Asia/Calcutta' THEN 'Asia/Kolkata' ELSE dt.timezone END))::time >= $2::time
          AND  NOT EXISTS (
                 SELECT 1 FROM notification_logs nl
                 WHERE  nl.notification_id  = $3
                   AND  nl.device_token_id  = dt.id
               )
        `,
        [app_id, scheduled_time, id]
      );

      if (targetDevicesResult.length > 0) {
        const targetUserIds = targetDevicesResult.map((r: any) => r.external_user_id);
        const payload = typeof payload_json === 'string' ? JSON.parse(payload_json) : payload_json;
        this.logger.log(`[Scheduler] Sending scheduled notification ${id} to ${targetUserIds.length} user(s)...`);
        await this.pushService.sendPushNotification(app_id, payload, targetUserIds);
      }
    }
  }

  private async runDripScheduler() {
    const campaignsResult = await this.dataSource.query(`
      SELECT
        dc.id          AS campaign_id,
        dc.app_id,
        ds.id          AS step_id,
        ds.step_number,
        ds.delay_days,
        ds.scheduled_at_local_time::text AS step_time,
        ds.notification_payload_json
      FROM drip_campaigns dc
      JOIN drip_steps     ds ON ds.campaign_id = dc.id
      WHERE dc.is_active = true
      ORDER BY dc.id, ds.step_number
    `);

    if (campaignsResult.length === 0) return;

    for (const row of campaignsResult) {
      const { campaign_id, app_id, step_id, step_number, delay_days, step_time, notification_payload_json } = row;

      if (!step_time) continue;

      const devicesResult = await this.dataSource.query(
        `
        SELECT dt.id AS device_id, dt.external_user_id, dt.app_id
        FROM   device_tokens dt
        WHERE  dt.app_id    = $1
          AND  dt.is_active = true
          AND  (COALESCE(dt.drip_anchor_date, dt.created_at) + ($2 || ' days')::interval) <= NOW()
          AND  (CURRENT_TIMESTAMP AT TIME ZONE (CASE WHEN dt.timezone = 'Asia/Calcutta' THEN 'Asia/Kolkata' ELSE dt.timezone END))::time >= $3::time
          AND  NOT EXISTS (
                 SELECT 1 FROM drip_sent_logs dsl
                 WHERE  dsl.drip_step_id    = $4
                   AND  dsl.device_token_id = dt.id
               )
        `,
        [app_id, delay_days, step_time, step_id]
      );

      if (devicesResult.length === 0) continue;

      let payload: any;
      try {
        payload = typeof notification_payload_json === 'string' ? JSON.parse(notification_payload_json) : notification_payload_json;
      } catch {
        continue;
      }

      const targetUserIds = devicesResult.map((r: any) => r.external_user_id);
      const deviceIds = devicesResult.map((r: any) => r.device_id);

      this.logger.log(`[Drip] Campaign ${campaign_id} / step ${step_number} (id=${step_id}) → sending to ${targetUserIds.length} device(s)...`);

      try {
        await this.pushService.sendPushNotification(app_id, payload, targetUserIds);

        if (deviceIds.length > 0) {
          const valuePlaceholders = deviceIds.map((_, idx) => `($1, $${idx + 2})`).join(', ');
          await this.dataSource.query(
            `INSERT INTO drip_sent_logs (drip_step_id, device_token_id)
             VALUES ${valuePlaceholders}
             ON CONFLICT DO NOTHING`,
            [step_id, ...deviceIds]
          );
        }
      } catch (err) {
        this.logger.error(`[Drip] Failed to send step ${step_id}:`, err);
      }
    }
  }
}
