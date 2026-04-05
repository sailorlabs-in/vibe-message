import cron from 'node-cron';
import { pool } from '../config/database';
import { sendPushNotification } from '../services/pushService';
import { NotificationPayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// 1.  REGULAR (one-off) SCHEDULED NOTIFICATIONS
//     Notifications in the `notifications` table with scheduled_at_local_time
//     set.  Delivered once per device whose LOCAL time has passed the target
//     time today, and not yet logged.
// ─────────────────────────────────────────────────────────────────────────────

const runRegularScheduler = async () => {
  const notificationsResult = await pool.query(`
    SELECT id, app_id, payload_json, scheduled_at_local_time::text AS scheduled_time
    FROM   notifications
    WHERE  scheduled_at_local_time IS NOT NULL
  `);

  for (const notification of notificationsResult.rows) {
    const { id, app_id, payload_json, scheduled_time } = notification;

    const targetDevicesResult = await pool.query(
      `
      SELECT dt.external_user_id
      FROM   device_tokens dt
      WHERE  dt.app_id    = $1
        AND  dt.is_active = true
        -- device's local clock has reached or passed the scheduled time today
        AND  (CURRENT_TIMESTAMP AT TIME ZONE dt.timezone)::time >= $2::time
        -- not already delivered
        AND  NOT EXISTS (
               SELECT 1 FROM notification_logs nl
               WHERE  nl.notification_id  = $3
                 AND  nl.device_token_id  = dt.id
             )
      `,
      [app_id, scheduled_time, id]
    );

    if (targetDevicesResult.rows.length > 0) {
      const targetUserIds: string[] = targetDevicesResult.rows.map((r: any) => r.external_user_id);
      const payload: NotificationPayload = JSON.parse(payload_json);
      console.log(`[Scheduler] Sending scheduled notification ${id} to ${targetUserIds.length} user(s)...`);
      await sendPushNotification(app_id, payload, targetUserIds);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2.  DRIP CAMPAIGN SCHEDULER
//     For every active drip campaign:
//       • Fetch all steps.
//       • For each step, find devices that:
//           a) belong to the app,
//           b) are active,
//           c) have been subscribed for at least `delay_days` days
//              (i.e. created_at + delay_days days  ≤  NOW()),
//           d) have reached the step's scheduled_at_local_time in their local tz,
//           e) have NOT yet received this step (not in drip_sent_logs).
//       • Send the notification directly (bypasses the `notifications` table)
//         and insert a row into drip_sent_logs to prevent re-delivery.
// ─────────────────────────────────────────────────────────────────────────────

const runDripScheduler = async () => {
  // Fetch every active drip campaign together with its steps
  const campaignsResult = await pool.query(`
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

  if (campaignsResult.rows.length === 0) return;

  for (const row of campaignsResult.rows) {
    const {
      campaign_id,
      app_id,
      step_id,
      step_number,
      delay_days,
      step_time,
      notification_payload_json,
    } = row;

    if (!step_time) {
      console.warn(`[Drip] Step ${step_id} (campaign ${campaign_id}) has no scheduled_at_local_time – skipping.`);
      continue;
    }

    // Find devices that are due for this step RIGHT NOW
    const devicesResult = await pool.query(
      `
      SELECT dt.id AS device_id, dt.external_user_id, dt.app_id
      FROM   device_tokens dt
      WHERE  dt.app_id    = $1
        AND  dt.is_active = true

        -- The device was created at least delay_days ago
        AND  (dt.created_at + ($2 || ' days')::interval) <= NOW()

        -- The device's local clock has reached or passed the step's fire time today
        AND  (CURRENT_TIMESTAMP AT TIME ZONE dt.timezone)::time >= $3::time

        -- This step has NOT been sent to this device yet
        AND  NOT EXISTS (
               SELECT 1 FROM drip_sent_logs dsl
               WHERE  dsl.drip_step_id    = $4
                 AND  dsl.device_token_id = dt.id
             )
      `,
      [app_id, delay_days, step_time, step_id]
    );

    if (devicesResult.rows.length === 0) continue;

    let payload: NotificationPayload;
    try {
      payload = JSON.parse(notification_payload_json);
    } catch {
      console.error(`[Drip] Could not parse payload for step ${step_id} – skipping.`);
      continue;
    }

    const targetUserIds: string[] = devicesResult.rows.map((r: any) => r.external_user_id);
    const deviceIds: number[]     = devicesResult.rows.map((r: any) => r.device_id);

    console.log(
      `[Drip] Campaign ${campaign_id} / step ${step_number} (id=${step_id}) → ` +
      `sending to ${targetUserIds.length} device(s) in app ${app_id}...`
    );

    try {
      await sendPushNotification(app_id, payload, targetUserIds);

      // Mark each device as "received this step" – use INSERT … ON CONFLICT DO NOTHING
      // to stay idempotent in case of race conditions.
      if (deviceIds.length > 0) {
        const valuePlaceholders = deviceIds
          .map((_, idx) => `($1, $${idx + 2})`)
          .join(', ');
        await pool.query(
          `INSERT INTO drip_sent_logs (drip_step_id, device_token_id)
           VALUES ${valuePlaceholders}
           ON CONFLICT DO NOTHING`,
          [step_id, ...deviceIds]
        );
      }
    } catch (err) {
      console.error(`[Drip] Failed to send step ${step_id}:`, err);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  CRON ENTRY-POINT
// ─────────────────────────────────────────────────────────────────────────────

export const startTimezoneSchedulerJob = () => {
  // Runs every minute for finer-grained delivery accuracy.
  // Both sub-jobs are lightweight (indexed queries only); every-minute overhead is negligible.
  cron.schedule('* * * * *', async () => {
    console.log('🌍 [Cron] Timezone-aware scheduler tick...');
    try {
      await runRegularScheduler();
    } catch (err) {
      console.error('❌ [Cron] Regular scheduler error:', err);
    }

    try {
      await runDripScheduler();
    } catch (err) {
      console.error('❌ [Cron] Drip scheduler error:', err);
    }
  });

  console.log('⏰ Timezone-aware scheduler cron job initialized (runs every minute)');
};
