CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  name TEXT,
  subject TEXT,
  body TEXT,
  updated TEXT,
  created_at TEXT
);
