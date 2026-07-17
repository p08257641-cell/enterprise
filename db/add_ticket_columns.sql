-- Add department direction + replies thread to the support tickets table.
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS replies jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill existing rows that may have NULL replies.
UPDATE tickets SET replies = '[]'::jsonb WHERE replies IS NULL;
