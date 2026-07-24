-- Voting / Polls tables
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  "createdBy" TEXT,
  "createdByName" TEXT,
  status TEXT,
  anonymous BOOLEAN,
  "startDate" TEXT,
  "endDate" TEXT,
  "createdAt" TEXT
);

CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY,
  "pollId" TEXT,
  "companyId" TEXT,
  label TEXT,
  "nomineeId" TEXT,
  "nomineeName" TEXT,
  position INTEGER,
  "voteCount" INTEGER
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id TEXT PRIMARY KEY,
  "pollId" TEXT,
  "optionId" TEXT,
  "companyId" TEXT,
  "voterId" TEXT,
  "voterName" TEXT,
  "createdAt" TEXT
);
