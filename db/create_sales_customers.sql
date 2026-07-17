CREATE TABLE IF NOT EXISTS sales_customers (
  "id" text PRIMARY KEY,
  "companyId" text,
  "name" text,
  "email" text,
  "phone" text,
  "company" text,
  "address" text,
  "totalOrders" real,
  "totalSpend" real,
  "lastOrderDate" text,
  "notes" text,
  "createdAt" text
);
