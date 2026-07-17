CREATE TABLE IF NOT EXISTS workflow_triggers (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  name TEXT,
  event TEXT,
  description TEXT,
  enabled BOOLEAN,
  created_at TEXT
);
