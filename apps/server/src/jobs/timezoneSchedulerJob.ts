import cron from 'node-cron';
import { pool } from '../config/database';
import { sendPushNotification } from '../services/pushService';
import { NotificationPayload } from '../types';

export const startTimezoneSchedulerJob = () => {
  // Run every 15 minutes, or every minute? Every 15 minutes might miss some boundaries depending on cron execution time.
  // Actually, running every minute is safer to catch exact HH:MM matches, but every 15 minutes matching HH:MM (00, 15, 30, 45) is also common.
  // We'll run it every 5 minutes to be safe but check exactly matching hours/minutes.
  // Wait, if it runs every 15 minutes, we need to match a TIME RANGE or just the exact hour?
  // Usually delivery times are rounded to the hour. E.g. '09:00:00'. We can run every 15 minutes and check if local time is >= scheduled_time and < scheduled_time + 15 mins.
  // We will run every 15 minutes.
  
  cron.schedule('*/15 * * * *', async () => {
    console.log('🌍 [Cron] Running intelligent timezone delivery scheduler...');
    try {
      // 1. Fetch all notifications that have a scheduled_at_local_time
      const notificationsResult = await pool.query(`
        SELECT id, app_id, payload_json, scheduled_at_local_time::text as scheduled_time
        FROM notifications 
        WHERE scheduled_at_local_time IS NOT NULL
      `);

      if (notificationsResult.rows.length === 0) return;

      for (const notification of notificationsResult.rows) {
        const { id, app_id, payload_json, scheduled_time } = notification;

        // Find devices that should receive this notification NOW
        // Condition:
        // 1. the device belongs to the app.
        // 2. device is active.
        // 3. The device's local time (rounded down to 15 min interval) is equal to or greater than scheduled time.
        // Even simpler: date_part('hour', CURRENT_TIMESTAMP AT TIME ZONE timezone) = date_part('hour', scheduled_time) 
        // AND not sent yet!
        // We will just fetch devices that haven't received it yet, and locally we are past their scheduled time today.
        
        const targetDevicesResult = await pool.query(`
          SELECT dt.external_user_id
          FROM device_tokens dt
          WHERE dt.app_id = $1
            AND dt.is_active = true
            -- Compare time: currently locally past the scheduled time 
            AND (CURRENT_TIMESTAMP AT TIME ZONE dt.timezone)::time >= $2::time
            -- But don't send if already sent
            AND NOT EXISTS (
              SELECT 1 FROM notification_logs nl 
              WHERE nl.notification_id = $3 
              AND nl.device_token_id = dt.id
            )
        `, [app_id, scheduled_time, id]);

        if (targetDevicesResult.rows.length > 0) {
          const targetUserIds = targetDevicesResult.rows.map(row => row.external_user_id);
          const payload: NotificationPayload = JSON.parse(payload_json);
          
          console.log(`[Timezone Scheduler] Sending notification ${id} to ${targetUserIds.length} users...`);
          
          // Send push to these specific users.
          await sendPushNotification(app_id, payload, targetUserIds);
        }
      }
    } catch (error) {
      console.error('❌ [Cron] Error during timezone delivery scheduler:', error);
    }
  });

  console.log('⏰ Timezone delivery scheduler cron job initialized (Runs every 15 minutes)');
};
