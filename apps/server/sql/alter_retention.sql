ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_retention BOOLEAN DEFAULT false;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS retention_days INTEGER;

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  default_retention_days INTEGER NOT NULL DEFAULT 14,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (id, default_retention_days) 
VALUES (1, 14) 
ON CONFLICT (id) DO NOTHING;
