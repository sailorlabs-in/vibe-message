import cron from 'node-cron';
import { pool } from '../config/database';

export const startCleanupJob = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 [Cron] Running daily notification cleanup job...');
    try {
      // 1. Get global default retention from system settings
      const settingsResult = await pool.query('SELECT default_retention_days FROM system_settings WHERE id = 1');
      const defaultRetention = settingsResult.rows.length ? settingsResult.rows[0].default_retention_days : 14;

      // 2. Fetch all apps and their configured retention rules
      const appsResult = await pool.query('SELECT id, retention_days FROM apps');
      
      let deletedCount = 0;
      for (const app of appsResult.rows) {
        // Fallback to system default if the app hasn't configured a custom retention period
        const retentionDays = app.retention_days ?? defaultRetention;
        
        // Delete notifications older than retentionDays for this app
        // Note: notification_logs will be automatically deleted by PostgreSQL ON DELETE CASCADE
        const deleteQuery = `
          DELETE FROM notifications 
          WHERE app_id = $1 
          AND created_at < NOW() - INTERVAL '${retentionDays} days'
        `;
        const result = await pool.query(deleteQuery, [app.id]);
        deletedCount += result.rowCount || 0;
      }

      console.log(`✅ [Cron] Cleanup complete. Deleted ${deletedCount} expired notifications.`);
    } catch (error) {
      console.error('❌ [Cron] Error during notification cleanup:', error);
    }
  });

  console.log('⏰ Notification cleanup cron job scheduled (Runs daily at midnight)');
};
