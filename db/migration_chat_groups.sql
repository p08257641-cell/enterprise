CREATE TABLE IF NOT EXISTS chat_groups (
  id text PRIMARY KEY,
  "companyId" text,
  name text,
  type text,
  members text[],
  "createdBy" text,
  "createdAt" text
);
