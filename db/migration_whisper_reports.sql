-- Whisper Reports table (anonymous reporting from login page)
CREATE TABLE IF NOT EXISTS whisper_reports (
  id text PRIMARY KEY,
  "companyId" text,
  category text,
  description text,
  location text,
  department text,
  status text DEFAULT 'New',
  "assignedTo" text,
  notes text,
  "createdAt" text
);

-- Add login control fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "loginEnabled" boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "loginDisabledReason" text;

-- Set existing users to have login enabled by default
UPDATE users SET "loginEnabled" = true WHERE "loginEnabled" IS NULL;
