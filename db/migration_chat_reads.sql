CREATE TABLE IF NOT EXISTS chat_reads (
  "id" text PRIMARY KEY,
  "companyId" text,
  "threadId" text,
  "userId" text,
  "lastReadAt" text
);
