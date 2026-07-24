-- Full schema migration: creates all missing tables and adds missing columns.
-- Uses IF NOT EXISTS for safety; re-runnable.

-- Core
CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY, name text, domain text, logo text, industry text,
  currency text, timezone text, language text,
  "activeModules" text[], "premiumFeatures" text[],
  "billingPlan" text, "billingStatus" text, "noticePeriodDays" integer,
  "companyLogo" text, "companySignature" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY, "companyId" text, name text, email text, role text,
  roles text[], "activeRole" text, department text, branch text, avatar text,
  permissions text[], status text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY, "companyId" text, name text, "managerId" text,
  "parentId" text, budget real, "employeeCount" integer
);

CREATE TABLE IF NOT EXISTS branches (
  id text PRIMARY KEY, "companyId" text, name text, location text, "isMain" boolean
);

-- Employees (create if missing, then add new columns)
CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY, "companyId" text, "userId" text, "employeeNumber" text,
  "firstName" text, "lastName" text, email text, department text,
  designation text, branch text, status text, "joiningDate" text, salary real,
  assigned_taxes text, assigned_benefits text, bank_account text
);

ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "dateOfBirth" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "maritalStatus" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "postalCode" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactName" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactPhone" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactRelation" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "employmentType" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "workLocation" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "managerId" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bio text;

-- HR
CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, date text,
  checkIn text, checkOut text, status text, locationType text,
  latitude real, longitude real
);

CREATE TABLE IF NOT EXISTS attendance_settings (
  id text PRIMARY KEY, "companyId" text,
  grace_minutes integer DEFAULT 10, late_threshold_minutes integer DEFAULT 15,
  penalty_type text DEFAULT 'warning', deduction_type text DEFAULT 'percentage',
  deduction_value integer DEFAULT 5, max_warnings integer DEFAULT 3,
  custom_penalty text, escalate_after_warnings integer DEFAULT 1, updated_at text
);

CREATE TABLE IF NOT EXISTS leaves (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "leaveType" text,
  "startDate" text, "endDate" text, reason text, status text, "approvedBy" text,
  days integer, "replacementId" text, "replacementName" text
);

CREATE TABLE IF NOT EXISTS onboardings (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, role text, phase text, tasks jsonb, "completedTasks" jsonb,
  status text, "startDate" text
);

CREATE TABLE IF NOT EXISTS okrs (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, title text, "keyResult" text, progress integer, status text,
  period text
);

CREATE TABLE IF NOT EXISTS payslips (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, period text, gross real, deductions real, net real, status text,
  "baseSalary" real, "customTaxesTotal" real, "customBenefitsTotal" real, breakdown text
);

CREATE TABLE IF NOT EXISTS payroll_groups (
  id text PRIMARY KEY, "companyId" text, name text, description text,
  "employeeIds" text[], createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS salary_bands (
  id text PRIMARY KEY, "companyId" text, name text, "minSalary" real,
  "maxSalary" real, "employeeCount" integer, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS payroll_tax_configs (
  id text PRIMARY KEY, "companyId" text, custom_taxes text, custom_benefits text, updated_at text
);

CREATE TABLE IF NOT EXISTS profile_update_requests (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, field text, label text, "currentValue" text, "newValue" text,
  status text, "requestedAt" text, "processedAt" text, "processedBy" text, "rejectionReason" text
);

CREATE TABLE IF NOT EXISTS bank_account_updates (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, "newBankAccount" text, status text, "requestedAt" text
);

-- CRM
CREATE TABLE IF NOT EXISTS crm_leads (
  id text PRIMARY KEY, "companyId" text, "firstName" text, "lastName" text,
  email text, phone text, "companyName" text, status text, source text,
  value real, "assignedTo" text, "assignedToName" text, department text,
  "aiLeadScore" integer, "aiFollowUpSuggested" text, "createdAt" text,
  comments jsonb, activities jsonb
);

CREATE TABLE IF NOT EXISTS crm_activities (
  id text PRIMARY KEY, "companyId" text, "leadId" text, type text, subject text,
  description text, "performedBy" text, "performedByName" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id text PRIMARY KEY, "companyId" text, "leadId" text, "leadName" text,
  "companyName" text, title text, description text, type text, priority text,
  status text, "assignedTo" text, "assignedToName" text, "dueDate" text,
  "completedAt" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS crm_emails (
  id text PRIMARY KEY, "companyId" text, "leadId" text, "to" text, subject text,
  body text, "sentBy" text, "sentByName" text, "createdAt" text
);

-- Accounting
CREATE TABLE IF NOT EXISTS gl_accounts (
  id text PRIMARY KEY, "companyId" text, code text, name text, type text, balance real
);

CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY, "companyId" text, "invoiceNumber" text, "customerId" text,
  "customerName" text, "issueDate" text, "dueDate" text, subtotal real,
  tax real, total real, status text
);

CREATE TABLE IF NOT EXISTS inventory (
  id text PRIMARY KEY, "companyId" text, sku text, name text, category text,
  warehouse text, "stockLevel" integer, "minStockLevel" integer, "unitPrice" real,
  supplier text, "expiryDate" text, "batchNumber" text
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY, "companyId" text, "entryNumber" text, date text,
  description text, reference text, lines jsonb, "totalDebit" real,
  "totalCredit" real, status text, createdBy text, "createdByName" text,
  "approvedBy" text, "approvedByName" text, "postedAt" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS expenses (
  id text PRIMARY KEY, "companyId" text, description text, category text,
  department text, amount real, date text, status text, "glAccountId" text,
  "journalEntryId" text, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS fiscal_periods (
  id text PRIMARY KEY, "companyId" text, name text, "startDate" text,
  "endDate" text, status text, "closedBy" text, "closedAt" text
);

CREATE TABLE IF NOT EXISTS opening_balances (
  id text PRIMARY KEY, "companyId" text, "accountId" text, "accountCode" text,
  "accountName" text, "periodId" text, debit real, credit real, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bills (
  id text PRIMARY KEY, "companyId" text, "vendorName" text, "vendorId" text,
  "billNumber" text, "invoiceDate" text, "dueDate" text, description text,
  subtotal real, tax real, total real, "amountPaid" real, status text,
  "glAccountId" text, "journalEntryId" text, createdBy text, "createdByName" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bill_payments (
  id text PRIMARY KEY, "companyId" text, "billId" text, amount real,
  "paymentDate" text, "paymentMethod" text, reference text, "bankAccountId" text,
  "journalEntryId" text, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS customer_payments (
  id text PRIMARY KEY, "companyId" text, "invoiceId" text, "customerName" text,
  amount real, "paymentDate" text, "paymentMethod" text, reference text,
  "bankAccountId" text, "journalEntryId" text, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id text PRIMARY KEY, "companyId" text, name text, "bankName" text,
  "accountNumber" text, "accountType" text, "glAccountId" text, balance real,
  "isActive" boolean, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id text PRIMARY KEY, "companyId" text, "bankAccountId" text, date text,
  description text, type text, amount real, reconciled boolean,
  "reconciledDate" text, "journalEntryId" text, reference text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id text PRIMARY KEY, "companyId" text, "bankAccountId" text,
  "periodStartDate" text, "periodEndDate" text, "statementBalance" real,
  "bookBalance" real, "reconciledDifference" real, status text,
  "reconciledTransactionIds" text[], completedBy text, "completedByName" text,
  "completedAt" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id text PRIMARY KEY, "companyId" text, "assetCode" text, name text,
  description text, category text, "purchaseDate" text, "purchasePrice" real,
  "salvageValue" real, "usefulLifeYears" integer, "depreciationMethod" text,
  "accumulatedDepreciation" real, "currentBookValue" real, location text,
  status text, "glAccountId" text, "disposalDate" text, "disposalPrice" real, "createdAt" text
);

CREATE TABLE IF NOT EXISTS depreciation_entries (
  id text PRIMARY KEY, "companyId" text, "assetId" text, "assetCode" text,
  "assetName" text, period text, "depreciationAmount" real,
  "accumulatedDepreciation" real, "bookValue" real, "journalEntryId" text,
  status text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS budgets (
  id text PRIMARY KEY, "companyId" text, name text, "fiscalYear" text,
  "glAccountId" text, "accountCode" text, "accountName" text, "budgetAmount" real,
  "actualAmount" real, variance real, "variancePercent" real, period text,
  status text, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS cost_centers (
  id text PRIMARY KEY, "companyId" text, code text, name text, "departmentId" text,
  "departmentName" text, "managerName" text, budget real, "actualSpend" real,
  status text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS currency_rates (
  id text PRIMARY KEY, "companyId" text, "baseCurrency" text, "targetCurrency" text,
  rate real, "effectiveDate" text, source text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS tax_codes (
  id text PRIMARY KEY, "companyId" text, code text, name text, rate real, type text,
  "glAccountId" text, "isActive" boolean, jurisdiction text, "accountName" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS tax_returns (
  id text PRIMARY KEY, "companyId" text, period text, "taxCodeId" text, "taxCodeName" text,
  "taxableAmount" real, "taxAmount" real, status text, "filedDate" text, "dueDate" text,
  createdBy text, "createdAt" text, type text, jurisdiction text, "taxableIncome" real,
  "taxDue" real, credits real, "netPayable" real, "filedBy" text
);

CREATE TABLE IF NOT EXISTS intercompany_txns (
  id text PRIMARY KEY, "companyId" text, "fromCompanyId" text, "fromCompanyName" text,
  "toCompanyId" text, "toCompanyName" text, type text, amount real, description text,
  status text, "eliminationEntryId" text, createdBy text, "createdAt" text,
  currency text, date text
);

CREATE TABLE IF NOT EXISTS consolidation_rules (
  id text PRIMARY KEY, "companyId" text, "subsidiaryId" text, "subsidiaryName" text,
  "eliminationAccount" text, "minorityInterestPct" real, "isActive" boolean,
  "createdAt" text, name text, description text, "parentAccountName" text, method text,
  "subsidiaryIds" text[], "intercompanyEliminationAccountId" text
);

CREATE TABLE IF NOT EXISTS compliance_checks (
  id text PRIMARY KEY, "companyId" text, category text, title text, description text,
  status text, "dueDate" text, assignee text, "assigneeName" text, "lastChecked" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS audit_snapshots (
  id text PRIMARY KEY, "companyId" text, "entityType" text, "entityId" text,
  "entityName" text, action text, "before" jsonb, "after" jsonb, "userId" text,
  "userName" text, "ipAddress" text, timestamp text, "performedByName" text,
  "oldValue" jsonb, "newValue" jsonb
);

CREATE TABLE IF NOT EXISTS policy_documents (
  id text PRIMARY KEY, "companyId" text, title text, category text, version text,
  content text, "acknowledgedBy" text[], "totalEmployees" integer, "dueDate" text,
  "createdAt" text, status text, "requiresAcknowledgmentFrom" text[]
);

CREATE TABLE IF NOT EXISTS filing_deadlines (
  id text PRIMARY KEY, "companyId" text, "filingType" text, jurisdiction text,
  "dueDate" text, status text, assignee text, "assigneeName" text, notes text,
  "createdAt" text, title text, type text, "relatedTaxReturnId" text,
  description text, "filedDate" text, "filedBy" text
);

-- Support / KB / LMS
CREATE TABLE IF NOT EXISTS kb_articles (
  id text PRIMARY KEY, "companyId" text, title text, category text, body text,
  views integer, created_by text, created_at text
);

CREATE TABLE IF NOT EXISTS lms_courses (
  id text PRIMARY KEY, "companyId" text, title text, category text, level text,
  duration text, enrolled integer, completion integer, created_by text, created_at text
);

CREATE TABLE IF NOT EXISTS announcements (
  id text PRIMARY KEY, "companyId" text, title text, body text, author text,
  channel text, date text, pinned boolean, created_at text
);

CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY, "companyId" text, "ticketNumber" text, "customerName" text,
  "customerEmail" text, subject text, description text, category text,
  department text, priority text, status text, "assignedTo" text,
  replies jsonb, "createdAt" text
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY, "companyId" text, "userId" text, "userName" text,
  action text, module text, details text, "ipAddress" text, timestamp text
);

CREATE TABLE IF NOT EXISTS workflows (
  id text PRIMARY KEY, "companyId" text, name text, description text,
  "isActive" boolean, blocks jsonb, "createdAt" text
);

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id text PRIMARY KEY, "companyId" text, name text, event text,
  description text, enabled boolean, created_at text
);

CREATE TABLE IF NOT EXISTS email_templates (
  id text PRIMARY KEY, "companyId" text, name text, subject text,
  body text, updated text, created_at text
);

CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY, "companyId" text, name text, key text,
  permissions text, "createdAt" text, "expiresAt" text
);

-- POS
CREATE TABLE IF NOT EXISTS pos_categories (
  id text PRIMARY KEY, "companyId" text, name text, description text,
  "parentId" text, color text, icon text, "isActive" boolean, "createdAt" text
);

CREATE TABLE IF NOT EXISTS pos_products (
  id text PRIMARY KEY, "companyId" text, sku text, name text, description text,
  category text, barcode text, "unitPrice" real, "costPrice" real, "taxRate" real,
  "discountPrice" real, "discountStartDate" text, "discountEndDate" text,
  image text, "isActive" boolean, "stockLevel" integer, "reorderLevel" integer,
  "createdAt" text, "updatedAt" text
);

CREATE TABLE IF NOT EXISTS pos_terminals (
  id text PRIMARY KEY, "companyId" text, name text, location text, "branchId" text,
  "isActive" boolean, "lastSync" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS pos_shifts (
  id text PRIMARY KEY, "companyId" text, "terminalId" text, "employeeId" text,
  "employeeName" text, "startTime" text, "endTime" text, "openingBalance" real,
  "closingBalance" real, "cashSales" real, "cardSales" real,
  "digitalWalletSales" real, "storeCreditSales" real, "totalSales" real,
  refunds real, status text, notes text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS pos_customers (
  id text PRIMARY KEY, "companyId" text, "firstName" text, "lastName" text,
  email text, phone text, "dateOfBirth" text, address text, "loyaltyPoints" integer,
  tier text, "totalOrders" integer, "totalSpent" real, "storeCredit" real,
  notes text, "isActive" boolean, "createdAt" text, "updatedAt" text
);

CREATE TABLE IF NOT EXISTS pos_sales (
  id text PRIMARY KEY, "companyId" text, "terminalId" text, "shiftId" text,
  "employeeId" text, "employeeName" text, "customerId" text, "customerName" text,
  "saleNumber" text, date text, subtotal real, tax real, discount real, total real,
  "paymentMethod" text, "paymentStatus" text, status text, items jsonb,
  payments jsonb, notes text, "createdAt" text, "updatedAt" text
);

CREATE TABLE IF NOT EXISTS pos_discounts (
  id text PRIMARY KEY, "companyId" text, name text, type text, value real,
  "applicableProducts" text[], "applicableCategories" text[],
  "minPurchaseAmount" real, "maxDiscountAmount" real, "startDate" text,
  "endDate" text, "isActive" boolean, "usageCount" integer, "maxUsage" integer,
  "createdAt" text
);

CREATE TABLE IF NOT EXISTS pos_returns (
  id text PRIMARY KEY, "companyId" text, "terminalId" text, "employeeId" text,
  "employeeName" text, "customerId" text, "customerName" text, "originalSaleId" text,
  "originalSaleNumber" text, "returnNumber" text, date text, items jsonb,
  subtotal real, tax real, total real, "refundMethod" text, "refundStatus" text,
  reason text, notes text, "createdAt" text, "processedAt" text
);

CREATE TABLE IF NOT EXISTS pos_daily_reports (
  id text PRIMARY KEY, "companyId" text, "branchId" text, "terminalId" text,
  date text, "totalSales" real, "totalTransactions" integer,
  "averageTransactionValue" real, "cashSales" real, "cardSales" real,
  "digitalWalletSales" real, "storeCreditSales" real, refunds real,
  discounts real, "taxCollected" real, "topSellingProducts" jsonb,
  "paymentMethods" jsonb, "hourlySales" jsonb, "createdAt" text
);

-- Sales
CREATE TABLE IF NOT EXISTS sales_orders (
  id text PRIMARY KEY, "companyId" text, "orderNumber" text, "customerName" text,
  "customerId" text, items jsonb, subtotal real, tax real, discount real,
  total real, status text, priority text, "assignedTo" text, "assignedToName" text,
  "orderDate" text, "expectedDelivery" text, notes text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS sales_customers (
  id text PRIMARY KEY, "companyId" text, name text, email text, phone text,
  company text, address text, "totalOrders" real, "totalSpend" real,
  "lastOrderDate" text, notes text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS sales_quotations (
  id text PRIMARY KEY, "companyId" text, "quoteNumber" text, "customerName" text,
  "customerId" text, items jsonb, subtotal real, tax real, total real,
  "validUntil" text, status text, "assignedTo" text, "assignedToName" text,
  notes text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS sales_targets (
  id text PRIMARY KEY, "companyId" text, "repId" text, "repName" text,
  month text, year text, "targetAmount" real, "actualAmount" real, "createdAt" text
);

-- Projects
CREATE TABLE IF NOT EXISTS project_tasks (
  id text PRIMARY KEY, "companyId" text, title text, description text,
  status text, priority text, assignee text, "assigneeName" text, due text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id text PRIMARY KEY, "companyId" text, name text, due text, status text,
  completion integer, "createdAt" text
);

-- Procurement
CREATE TABLE IF NOT EXISTS vendors (
  id text PRIMARY KEY, "companyId" text, name text, type text, contact text,
  email text, rating real, "ordersCount" integer, status text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id text PRIMARY KEY, "companyId" text, "poNumber" text, "vendorId" text,
  "vendorName" text, item text, qty integer, "unitPrice" real, total real,
  status text, date text, createdBy text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS rfqs (
  id text PRIMARY KEY, "companyId" text, "rfqNumber" text, item text,
  "vendorsInvited" integer, "sentDate" text, "quotesReceived" integer,
  status text, "createdAt" text
);

-- Manufacturing
CREATE TABLE IF NOT EXISTS work_orders (
  id text PRIMARY KEY, "companyId" text, "woNumber" text, product text,
  qty integer, line text, status text, completion integer, "startDate" text,
  "dueDate" text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS bom_items (
  id text PRIMARY KEY, "companyId" text, product text, part text,
  qty real, unit text, cost real, "createdAt" text
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id text PRIMARY KEY, "companyId" text, check text, result text, date text,
  inspector text, notes text, "createdAt" text
);

CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id text PRIMARY KEY, "companyId" text, "assetId" text, "assetName" text,
  task text, due text, owner text, status text, "createdAt" text
);

-- Document Management
CREATE TABLE IF NOT EXISTS managed_documents (
  id text PRIMARY KEY, "companyId" text, name text, type text, size text,
  status text, date text, "uploadedBy" text, "createdAt" text
);

-- Exit Management
CREATE TABLE IF NOT EXISTS exit_requests (
  id text PRIMARY KEY, "companyId" text, "employeeId" text, "employeeName" text,
  department text, "exitType" text, "lastWorkingDay" text, reason text, status text,
  "hodApprovedBy" text, "hodApprovedAt" text, "hrApprovedBy" text, "hrApprovedAt" text,
  "rejectedBy" text, "rejectedAt" text, notes text, "createdAt" text
);
