-- GRA E-VAT Integration Tables
-- Run: & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d enterprise -f db\migration_evat.sql

CREATE TABLE IF NOT EXISTS evat_config (
  id TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "companyTin" TEXT,
  "companyName" TEXT,
  "securityKey" TEXT,
  "apiMode" TEXT DEFAULT 'test',
  "apiBaseUrl" TEXT,
  "isActive" BOOLEAN DEFAULT false,
  "lastSignature" TEXT,
  "lastSignatureDate" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

CREATE TABLE IF NOT EXISTS evat_submissions (
  id TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityNumber" TEXT,
  "status" TEXT DEFAULT 'Pending',
  "irn" TEXT,
  "sdcCode" TEXT,
  "qrCodeUrl" TEXT,
  "digitalSignature" TEXT,
  "requestPayload" jsonb,
  "responsePayload" jsonb,
  "errorMessage" TEXT,
  "retryCount" INTEGER DEFAULT 0,
  "submittedAt" TEXT,
  "validatedAt" TEXT,
  "createdAt" TEXT
);

CREATE INDEX IF NOT EXISTS idx_evat_config_company ON evat_config("companyId");
CREATE INDEX IF NOT EXISTS idx_evat_submissions_company ON evat_submissions("companyId");
CREATE INDEX IF NOT EXISTS idx_evat_submissions_entity ON evat_submissions("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_evat_submissions_status ON evat_submissions("status");
