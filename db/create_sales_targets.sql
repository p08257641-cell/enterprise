CREATE TABLE IF NOT EXISTS sales_targets (
  "id" text PRIMARY KEY,
  "companyId" text,
  "repId" text,
  "repName" text,
  "month" text,
  "year" text,
  "targetAmount" real,
  "actualAmount" real,
  "createdAt" text
);
