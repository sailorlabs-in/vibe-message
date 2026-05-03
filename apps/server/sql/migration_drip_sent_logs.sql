-- Migration: Add drip_sent_logs table
-- This table tracks which drip campaign step has already been sent to each device,
-- preventing duplicate deliveries across cron runs.

CREATE TABLE IF NOT EXISTS drip_sent_logs (
  id SERIAL PRIMARY KEY,
  drip_step_id   INTEGER NOT NULL REFERENCES drip_steps(id)   ON DELETE CASCADE,
  device_token_id INTEGER NOT NULL REFERENCES device_tokens(id) ON DELETE CASCADE,
  sent_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (drip_step_id, device_token_id)
);

CREATE INDEX IF NOT EXISTS idx_drip_sent_logs_step_id   ON drip_sent_logs(drip_step_id);
CREATE INDEX IF NOT EXISTS idx_drip_sent_logs_device_id ON drip_sent_logs(device_token_id);
