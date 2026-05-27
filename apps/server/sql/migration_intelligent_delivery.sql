-- Add timezone to device_tokens
ALTER TABLE device_tokens ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';

-- Add scheduled_at to notifications (for absolute UTC scheduling)
ALTER TABLE notifications ADD COLUMN scheduled_at TIMESTAMP;

-- Table for Drip Campaigns
CREATE TABLE drip_campaigns (
  id SERIAL PRIMARY KEY,
  app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Drip Steps
CREATE TABLE drip_steps (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES drip_campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  notification_payload_json TEXT NOT NULL,
  scheduled_at_local_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_drip_campaigns_app_id ON drip_campaigns(app_id);
CREATE INDEX idx_drip_steps_campaign_id ON drip_steps(campaign_id);
