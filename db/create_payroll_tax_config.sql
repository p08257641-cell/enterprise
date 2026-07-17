-- Payroll tax / deduction configuration (per company)
-- Column names must match the exact identifiers drizzle generates from the schema.
DROP TABLE IF EXISTS payroll_tax_configs;
CREATE TABLE payroll_tax_configs (
  id text PRIMARY KEY,
  "companyId" text,
  "income_tax_rate" real,
  "social_security_rate" real,
  "medicare_rate" real,
  "allowances" real,
  "health_insurance" real,
  "overtime_rate" real,
  "updated_at" text
);
