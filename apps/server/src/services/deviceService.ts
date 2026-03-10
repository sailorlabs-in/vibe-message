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
  subscription: PushSubscription
): Promise<DeviceToken> => {
  const subscriptionJson = JSON.stringify(subscription);

  // Try to update existing device token first
  const updateResult = await query(
    `UPDATE device_tokens 
     SET subscription_json = $1, is_active = true, updated_at = CURRENT_TIMESTAMP
     WHERE app_id = $2 AND external_user_id = $3
     RETURNING *`,
    [subscriptionJson, appId, externalUserId]
  );

  if (updateResult.rows.length > 0) {
    return updateResult.rows[0];
  }

  // Insert new device token
  const insertResult = await query(
    `INSERT INTO device_tokens (app_id, external_user_id, subscription_json)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [appId, externalUserId, subscriptionJson]
  );

  if (insertResult.rows.length > 0) {
    return insertResult.rows[0];
  }

  // If we get here, there was a conflict, fetch the existing record
  const existingResult = await query(
    `SELECT * FROM device_tokens 
     WHERE app_id = $1 AND external_user_id = $2`,
    [appId, externalUserId]
  );

  return existingResult.rows[0];
};

export const unregisterDevice = async (
  appId: number,
  externalUserId: string
): Promise<void> => {
  await query(
    `UPDATE device_tokens 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE app_id = $1 AND external_user_id = $2`,
    [appId, externalUserId]
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
