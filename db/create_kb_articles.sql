CREATE TABLE IF NOT EXISTS kb_articles (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  title TEXT,
  category TEXT,
  body TEXT,
  views INTEGER,
  created_by TEXT,
  created_at TEXT
);
