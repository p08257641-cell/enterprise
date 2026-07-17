CREATE TABLE IF NOT EXISTS sales_quotations (
  "id" text PRIMARY KEY,
  "companyId" text,
  "quoteNumber" text,
  "customerName" text,
  "customerId" text,
  "items" jsonb,
  "subtotal" real,
  "tax" real,
  "total" real,
  "validUntil" text,
  "status" text,
  "assignedTo" text,
  "assignedToName" text,
  "notes" text,
  "createdAt" text
);
