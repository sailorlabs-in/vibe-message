-- Add SMTP configuration and frontend control toggles to system_settings table
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255) NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255) NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR(255) NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS smtp_from VARCHAR(255) NULL;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS hide_forgot_password BOOLEAN DEFAULT false;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS hide_email_verification BOOLEAN DEFAULT false;
