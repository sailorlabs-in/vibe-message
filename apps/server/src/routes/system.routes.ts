import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();

// Get system settings (Accessible by ADMIN and SUPER_ADMIN for UI config)
router.get('/settings', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT default_retention_days FROM system_settings WHERE id = 1');
    const defaultRetentionDays = result.rows.length ? result.rows[0].default_retention_days : 14;
    res.json({
      success: true,
      data: { default_retention_days: defaultRetentionDays }
    });
  } catch (error) {
    next(error);
  }
});

// Update system settings (SUPER_ADMIN only)
router.put('/settings', authMiddleware, requireRole('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { default_retention_days } = req.body;
    
    if (typeof default_retention_days !== 'number' || default_retention_days < 1) {
      return res.status(400).json({ success: false, message: 'Invalid retention days value.' });
    }

    await query(
      'UPDATE system_settings SET default_retention_days = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [default_retention_days]
    );

    return res.json({
      success: true,
      data: { default_retention_days }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
