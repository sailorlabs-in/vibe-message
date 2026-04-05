import { getClient } from '../config/database';
import { DripCampaign, DripStep } from '../types';
import { NotFoundError } from '../utils/errors';

export interface DripStepInput {
  dayDelay: number;
  time: string;         // "HH:MM" local time
  title: string;
  body: string;
}

export interface DripCampaignWithSteps extends DripCampaign {
  steps: DripStep[];
}

/**
 * Get the active drip campaign (and its steps) for an app's internal integer ID.
 * Returns null if no campaign exists yet.
 */
export const getDripCampaign = async (
  internalAppId: number
): Promise<DripCampaignWithSteps | null> => {
  const client = await getClient();
  try {
    const campaignResult = await client.query(
      `SELECT * FROM drip_campaigns WHERE app_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`,
      [internalAppId]
    );

    if (campaignResult.rows.length === 0) {
      return null;
    }

    const campaign: DripCampaign = campaignResult.rows[0];

    const stepsResult = await client.query(
      `SELECT * FROM drip_steps WHERE campaign_id = $1 ORDER BY step_number ASC`,
      [campaign.id]
    );

    return {
      ...campaign,
      steps: stepsResult.rows,
    };
  } finally {
    client.release();
  }
};

/**
 * Save (upsert) a drip campaign for an app.
 * This replaces all existing steps for the campaign atomically in a transaction.
 */
export const saveDripCampaign = async (
  internalAppId: number,
  name: string,
  steps: DripStepInput[],
  isActive: boolean = true
): Promise<DripCampaignWithSteps> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Deactivate any existing campaigns for this app
    await client.query(
      `UPDATE drip_campaigns SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE app_id = $1`,
      [internalAppId]
    );

    // Insert fresh campaign record
    const campaignResult = await client.query(
      `INSERT INTO drip_campaigns (app_id, name, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [internalAppId, name, isActive]
    );

    const campaign: DripCampaign = campaignResult.rows[0];

    // Insert all steps
    const insertedSteps: DripStep[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const payload = JSON.stringify({ title: step.title, body: step.body });
      // Normalize "HH:MM" -> "HH:MM:00" for the TIME column
      const scheduledTime = step.time.length === 5 ? `${step.time}:00` : step.time;

      const stepResult = await client.query(
        `INSERT INTO drip_steps (campaign_id, step_number, delay_days, notification_payload_json, scheduled_at_local_time)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [campaign.id, i + 1, step.dayDelay, payload, scheduledTime]
      );
      insertedSteps.push(stepResult.rows[0]);
    }

    await client.query('COMMIT');

    return { ...campaign, steps: insertedSteps };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Soft-delete / deactivate the drip campaign for an app.
 */
export const deactivateDripCampaign = async (
  internalAppId: number
): Promise<void> => {
  const client = await getClient();
  try {
    const result = await client.query(
      `UPDATE drip_campaigns SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE app_id = $1`,
      [internalAppId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('No active drip campaign found for this app');
    }
  } finally {
    client.release();
  }
};
