ALTER TABLE managed_documents ADD COLUMN IF NOT EXISTS "uploadedByName" text;
ALTER TABLE managed_documents ADD COLUMN IF NOT EXISTS "visibility" text DEFAULT 'everyone';
ALTER TABLE managed_documents ADD COLUMN IF NOT EXISTS "sharedWith" text DEFAULT '[]';
