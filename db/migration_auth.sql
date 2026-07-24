ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" text;
