-- Add enterprise key support columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS enterprise_key VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS enterprise_key_requested BOOLEAN DEFAULT false;
