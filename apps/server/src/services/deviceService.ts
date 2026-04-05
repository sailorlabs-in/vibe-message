import { query } from '../config/database';
import {
  DeviceToken,
  PushSubscription,
  RegisterDeviceRequest,
  UnregisterDeviceRequest,
} from '../types';
import { NotFoundError } from '../utils/errors';

export const registerDevice = async (
  appId: number,
  externalUserId: string,
  subscription: PushSubscription,
  timezone: string = 'UTC'
): Promise<DeviceToken> => {
  const subscriptionJson = JSON.stringify(subscription);
  const endpoint = subscription.endpoint;

  // 1. Check if this exact device (same endpoint) already exists for this user
  const existingResult = await query(
    `SELECT * FROM device_tokens 
     WHERE app_id = $1 AND external_user_id = $2 
     AND subscription_json::jsonb->>'endpoint' = $3`,
    [appId, externalUserId, endpoint]
  );

  if (existingResult.rows.length > 0) {
    // Update existing device — subscription keys may have rotated, timezone might have updated
    const updateResult = await query(
      `UPDATE device_tokens 
       SET subscription_json = $1, timezone = $2, is_active = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [subscriptionJson, timezone, existingResult.rows[0].id]
    );
    return updateResult.rows[0];
  }

  // 2. Insert new device token (different browser/device for same user)
  const insertResult = await query(
    `INSERT INTO device_tokens (app_id, external_user_id, subscription_json, timezone, drip_anchor_date)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [appId, externalUserId, subscriptionJson, timezone]
  );

  if (insertResult.rows.length > 0) {
    return insertResult.rows[0];
  }

  // 3. Conflict on exact same subscription_json — fetch existing
  // Also update timezone if it changed
  const conflictResult = await query(
    `UPDATE device_tokens 
     SET timezone = $4, is_active = true, updated_at = CURRENT_TIMESTAMP
     WHERE app_id = $1 AND external_user_id = $2 
     AND md5(subscription_json) = md5($3)
     RETURNING *`,
    [appId, externalUserId, subscriptionJson, timezone]
  );

  return conflictResult.rows[0];
};

export const unregisterDevice = async (
  appId: number,
  externalUserId: string,
  endpoint?: string
): Promise<void> => {
  if (endpoint) {
    // Deactivate only the specific device (matched by push endpoint)
    await query(
      `UPDATE device_tokens 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE app_id = $1 AND external_user_id = $2 
       AND subscription_json::jsonb->>'endpoint' = $3`,
      [appId, externalUserId, endpoint]
    );
  } else {
    // Deactivate ALL devices for this user (backward compatibility)
    await query(
      `UPDATE device_tokens 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE app_id = $1 AND external_user_id = $2`,
      [appId, externalUserId]
    );
  }
};

export const unregisterAllDevicesForApp = async (appId: number): Promise<void> => {
  await query(
    `UPDATE device_tokens 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE app_id = $1`,
    [appId]
  );
};

export const unregisterAllDevicesSystemWide = async (): Promise<void> => {
  await query(
    `UPDATE device_tokens 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP`
  );
};

export const getDevicesByApp = async (
  appId: number,
  externalUserIds?: string[]
): Promise<DeviceToken[]> => {
  let queryText = `
    SELECT * FROM device_tokens 
    WHERE app_id = $1 AND is_active = true
  `;
  const params: any[] = [appId];

  if (externalUserIds && externalUserIds.length > 0) {
    queryText += ` AND external_user_id = ANY($2)`;
    params.push(externalUserIds);
  }

  const result = await query(queryText, params);
  return result.rows;
};

export const getDeviceById = async (deviceId: number): Promise<DeviceToken> => {
  const result = await query(
    'SELECT * FROM device_tokens WHERE id = $1',
    [deviceId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Device token not found');
  }

  return result.rows[0];
};
