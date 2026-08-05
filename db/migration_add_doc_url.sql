ALTER TABLE managed_documents DROP COLUMN IF EXISTS fileurl; ALTER TABLE managed_documents ADD COLUMN "fileUrl" TEXT;
