CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  "companyId" text,
  "threadId" text,
  "senderId" text,
  "senderName" text,
  message text,
  "createdAt" text
);
