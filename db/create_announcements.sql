CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  title TEXT,
  body TEXT,
  author TEXT,
  channel TEXT,
  date TEXT,
  pinned BOOLEAN,
  created_at TEXT
);
