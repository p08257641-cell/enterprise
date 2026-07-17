CREATE TABLE IF NOT EXISTS lms_courses (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  title TEXT,
  category TEXT,
  level TEXT,
  duration TEXT,
  enrolled INTEGER,
  completion INTEGER,
  created_by TEXT,
  created_at TEXT
);
