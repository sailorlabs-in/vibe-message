-- Migration: Add drip_anchor_date to device_tokens
-- Run this once on your existing database. Safe to run multiple times (idempotent).
--
-- Purpose: drip_anchor_date records when a user's device was FIRST ever registered.
-- Unlike created_at (which is effectively the same), this column is explicitly
-- preserved on all UPDATE/reactivation paths in deviceService.ts so that the
-- drip-campaign delay clock is never reset when a user logs out and back in.

ALTER TABLE device_tokens
  ADD COLUMN IF NOT EXISTS drip_anchor_date TIMESTAMP DEFAULT NULL;

-- Backfill existing rows: anchor = their created_at (safe; changes nothing for active campaigns)
UPDATE device_tokens
SET drip_anchor_date = created_at
WHERE drip_anchor_date IS NULL;

-- Add a NOT NULL default going forward (optional but clean)
ALTER TABLE device_tokens
  ALTER COLUMN drip_anchor_date SET DEFAULT CURRENT_TIMESTAMP;
