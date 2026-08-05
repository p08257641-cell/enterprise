CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"body" text,
	"author" text,
	"channel" text,
	"date" text,
	"pinned" boolean,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"key" text,
	"permissions" text,
	"createdAt" text,
	"expiresAt" text
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"date" text,
	"checkIn" text,
	"checkOut" text,
	"status" text,
	"locationType" text,
	"latitude" real,
	"longitude" real
);
--> statement-breakpoint
CREATE TABLE "attendance_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"departmentId" text,
	"workStartTime" text DEFAULT '09:00',
	"grace_minutes" integer DEFAULT 10,
	"late_threshold_minutes" integer DEFAULT 15,
	"penalty_type" text DEFAULT 'warning',
	"deduction_type" text DEFAULT 'percentage',
	"deduction_value" integer DEFAULT 5,
	"max_warnings" integer DEFAULT 3,
	"custom_penalty" text,
	"escalate_after_warnings" integer DEFAULT 1,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"userId" text,
	"userName" text,
	"action" text,
	"module" text,
	"details" text,
	"ipAddress" text,
	"timestamp" text
);
--> statement-breakpoint
CREATE TABLE "audit_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"entityType" text,
	"entityId" text,
	"entityName" text,
	"action" text,
	"before" jsonb,
	"after" jsonb,
	"userId" text,
	"userName" text,
	"ipAddress" text,
	"timestamp" text,
	"performedByName" text,
	"oldValue" jsonb,
	"newValue" jsonb
);
--> statement-breakpoint
CREATE TABLE "bank_account_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"newBankAccount" text,
	"status" text,
	"requestedAt" text
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"bankName" text,
	"accountNumber" text,
	"accountType" text,
	"glAccountId" text,
	"balance" real,
	"isActive" boolean,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "bank_reconciliations" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"bankAccountId" text,
	"periodStartDate" text,
	"periodEndDate" text,
	"statementBalance" real,
	"bookBalance" real,
	"reconciledDifference" real,
	"status" text,
	"reconciledTransactionIds" text[],
	"completedBy" text,
	"completedByName" text,
	"completedAt" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"bankAccountId" text,
	"date" text,
	"description" text,
	"type" text,
	"amount" real,
	"reconciled" boolean,
	"reconciledDate" text,
	"journalEntryId" text,
	"reference" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "bill_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"billId" text,
	"amount" real,
	"paymentDate" text,
	"paymentMethod" text,
	"reference" text,
	"bankAccountId" text,
	"journalEntryId" text,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"vendorName" text,
	"vendorId" text,
	"billNumber" text,
	"invoiceDate" text,
	"dueDate" text,
	"description" text,
	"subtotal" real,
	"tax" real,
	"total" real,
	"amountPaid" real,
	"status" text,
	"glAccountId" text,
	"journalEntryId" text,
	"createdBy" text,
	"createdByName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "bom_items" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"product" text,
	"part" text,
	"qty" real,
	"unit" text,
	"cost" real,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"location" text,
	"isMain" boolean
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"fiscalYear" text,
	"glAccountId" text,
	"accountCode" text,
	"accountName" text,
	"budgetAmount" real,
	"actualAmount" real,
	"variance" real,
	"variancePercent" real,
	"period" text,
	"status" text,
	"items" jsonb DEFAULT '[]'::jsonb,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "chat_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"type" text,
	"members" text[],
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"threadId" text,
	"senderId" text,
	"senderName" text,
	"message" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "chat_reads" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"threadId" text,
	"userId" text,
	"lastReadAt" text
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"domain" text,
	"logo" text,
	"industry" text,
	"currency" text,
	"timezone" text,
	"language" text,
	"activeModules" text[],
	"premiumFeatures" text[],
	"billingPlan" text,
	"billingStatus" text,
	"noticePeriodDays" integer,
	"companyLogo" text,
	"companySignature" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "company_images" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"description" text,
	"category" text,
	"imageData" text,
	"uploadedBy" text,
	"uploadedByName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"category" text,
	"title" text,
	"description" text,
	"status" text,
	"dueDate" text,
	"assignee" text,
	"assigneeName" text,
	"lastChecked" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "consolidation_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"subsidiaryId" text,
	"subsidiaryName" text,
	"eliminationAccount" text,
	"minorityInterestPct" real,
	"isActive" boolean,
	"createdAt" text,
	"name" text,
	"description" text,
	"parentAccountName" text,
	"method" text,
	"subsidiaryIds" text[],
	"intercompanyEliminationAccountId" text
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"code" text,
	"name" text,
	"departmentId" text,
	"departmentName" text,
	"managerName" text,
	"budget" real,
	"actualSpend" real,
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"leadId" text,
	"type" text,
	"subject" text,
	"description" text,
	"performedBy" text,
	"performedByName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "crm_emails" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"leadId" text,
	"to" text,
	"subject" text,
	"body" text,
	"sentBy" text,
	"sentByName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"firstName" text,
	"lastName" text,
	"email" text,
	"phone" text,
	"companyName" text,
	"status" text,
	"source" text,
	"value" real,
	"assignedTo" text,
	"assignedToName" text,
	"department" text,
	"aiLeadScore" integer,
	"aiFollowUpSuggested" text,
	"createdAt" text,
	"comments" jsonb,
	"activities" jsonb
);
--> statement-breakpoint
CREATE TABLE "crm_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"leadId" text,
	"leadName" text,
	"companyName" text,
	"title" text,
	"description" text,
	"type" text,
	"priority" text,
	"status" text,
	"assignedTo" text,
	"assignedToName" text,
	"dueDate" text,
	"completedAt" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"baseCurrency" text,
	"targetCurrency" text,
	"rate" real,
	"effectiveDate" text,
	"source" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "customer_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"invoiceId" text,
	"customerName" text,
	"amount" real,
	"paymentDate" text,
	"paymentMethod" text,
	"reference" text,
	"bankAccountId" text,
	"journalEntryId" text,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"managerId" text,
	"parentId" text,
	"budget" real,
	"employeeCount" integer
);
--> statement-breakpoint
CREATE TABLE "depreciation_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"assetId" text,
	"assetCode" text,
	"assetName" text,
	"period" text,
	"depreciationAmount" real,
	"accumulatedDepreciation" real,
	"bookValue" real,
	"journalEntryId" text,
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"subject" text,
	"body" text,
	"updated" text,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"userId" text,
	"employeeNumber" text,
	"firstName" text,
	"lastName" text,
	"photoUrl" text,
	"email" text,
	"department" text,
	"designation" text,
	"branch" text,
	"status" text,
	"joiningDate" text,
	"salary" real,
	"assigned_taxes" text,
	"assigned_benefits" text,
	"bank_account" text,
	"phone" text,
	"dateOfBirth" text,
	"gender" text,
	"maritalStatus" text,
	"nationality" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postalCode" text,
	"emergencyContactName" text,
	"emergencyContactPhone" text,
	"emergencyContactRelation" text,
	"employmentType" text,
	"workLocation" text,
	"managerId" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "evat_config" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"companyTin" text,
	"companyName" text,
	"securityKey" text,
	"apiMode" text,
	"apiBaseUrl" text,
	"isActive" boolean,
	"lastSignature" text,
	"lastSignatureDate" text,
	"createdAt" text,
	"updatedAt" text
);
--> statement-breakpoint
CREATE TABLE "evat_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"entityType" text,
	"entityId" text,
	"entityNumber" text,
	"status" text,
	"irn" text,
	"sdcCode" text,
	"qrCodeUrl" text,
	"digitalSignature" text,
	"requestPayload" jsonb,
	"responsePayload" jsonb,
	"errorMessage" text,
	"retryCount" integer,
	"submittedAt" text,
	"validatedAt" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "exit_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"exitType" text,
	"lastWorkingDay" text,
	"reason" text,
	"status" text,
	"hodApprovedBy" text,
	"hodApprovedAt" text,
	"hrApprovedBy" text,
	"hrApprovedAt" text,
	"rejectedBy" text,
	"rejectedAt" text,
	"notes" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"description" text,
	"category" text,
	"department" text,
	"amount" real,
	"date" text,
	"status" text,
	"glAccountId" text,
	"journalEntryId" text,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "filing_deadlines" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"filingType" text,
	"jurisdiction" text,
	"dueDate" text,
	"status" text,
	"assignee" text,
	"assigneeName" text,
	"notes" text,
	"createdAt" text,
	"title" text,
	"type" text,
	"relatedTaxReturnId" text,
	"description" text,
	"filedDate" text,
	"filedBy" text
);
--> statement-breakpoint
CREATE TABLE "fiscal_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"startDate" text,
	"endDate" text,
	"status" text,
	"closedBy" text,
	"closedAt" text
);
--> statement-breakpoint
CREATE TABLE "fixed_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"assetCode" text,
	"name" text,
	"description" text,
	"category" text,
	"purchaseDate" text,
	"purchasePrice" real,
	"salvageValue" real,
	"usefulLifeYears" integer,
	"depreciationMethod" text,
	"accumulatedDepreciation" real,
	"currentBookValue" real,
	"location" text,
	"status" text,
	"glAccountId" text,
	"disposalDate" text,
	"disposalPrice" real,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "gl_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"code" text,
	"name" text,
	"type" text,
	"balance" real
);
--> statement-breakpoint
CREATE TABLE "intercompany_txns" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"fromCompanyId" text,
	"fromCompanyName" text,
	"toCompanyId" text,
	"toCompanyName" text,
	"type" text,
	"amount" real,
	"description" text,
	"status" text,
	"eliminationEntryId" text,
	"createdBy" text,
	"createdAt" text,
	"currency" text,
	"date" text
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"sku" text,
	"name" text,
	"category" text,
	"warehouse" text,
	"stockLevel" integer,
	"minStockLevel" integer,
	"unitPrice" real,
	"supplier" text,
	"expiryDate" text,
	"batchNumber" text
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"invoiceNumber" text,
	"customerId" text,
	"customerName" text,
	"issueDate" text,
	"dueDate" text,
	"subtotal" real,
	"tax" real,
	"total" real,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"entryNumber" text,
	"date" text,
	"description" text,
	"reference" text,
	"lines" jsonb,
	"totalDebit" real,
	"totalCredit" real,
	"status" text,
	"createdBy" text,
	"createdByName" text,
	"approvedBy" text,
	"approvedByName" text,
	"postedAt" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "kb_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"category" text,
	"body" text,
	"views" integer,
	"created_by" text,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "leaves" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"leaveType" text,
	"startDate" text,
	"endDate" text,
	"reason" text,
	"status" text,
	"approvedBy" text,
	"days" integer,
	"replacementId" text,
	"replacementName" text
);
--> statement-breakpoint
CREATE TABLE "lms_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"category" text,
	"level" text,
	"duration" text,
	"enrolled" integer,
	"completion" integer,
	"created_by" text,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "maintenance_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"assetId" text,
	"assetName" text,
	"task" text,
	"due" text,
	"owner" text,
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "managed_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"type" text,
	"size" text,
	"status" text,
	"date" text,
	"uploadedBy" text,
	"uploadedByName" text,
	"visibility" text,
	"sharedWith" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "okrs" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"title" text,
	"keyResult" text,
	"progress" integer,
	"status" text,
	"period" text
);
--> statement-breakpoint
CREATE TABLE "onboardings" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"role" text,
	"phase" text,
	"tasks" jsonb,
	"completedTasks" jsonb,
	"status" text,
	"startDate" text
);
--> statement-breakpoint
CREATE TABLE "opening_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"accountId" text,
	"accountCode" text,
	"accountName" text,
	"periodId" text,
	"debit" real,
	"credit" real,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "payroll_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"description" text,
	"employeeIds" text[],
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "payroll_tax_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"custom_taxes" text,
	"custom_benefits" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "payslips" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"period" text,
	"gross" real,
	"deductions" real,
	"net" real,
	"status" text,
	"baseSalary" real,
	"customTaxesTotal" real,
	"customBenefitsTotal" real,
	"breakdown" text
);
--> statement-breakpoint
CREATE TABLE "policy_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"category" text,
	"version" text,
	"content" text,
	"acknowledgedBy" text[],
	"totalEmployees" integer,
	"dueDate" text,
	"createdAt" text,
	"status" text,
	"requiresAcknowledgmentFrom" text[]
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text,
	"companyId" text,
	"label" text,
	"nomineeId" text,
	"nomineeName" text,
	"position" integer,
	"voteCount" integer
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text,
	"optionId" text,
	"companyId" text,
	"voterId" text,
	"voterName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"description" text,
	"category" text,
	"createdBy" text,
	"createdByName" text,
	"status" text,
	"anonymous" boolean,
	"startDate" text,
	"endDate" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"description" text,
	"parentId" text,
	"color" text,
	"icon" text,
	"isActive" boolean,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"firstName" text,
	"lastName" text,
	"email" text,
	"phone" text,
	"dateOfBirth" text,
	"address" text,
	"loyaltyPoints" integer,
	"tier" text,
	"totalPurchases" integer,
	"totalSpent" real,
	"storeCredit" real,
	"notes" text,
	"isActive" boolean,
	"createdAt" text,
	"updatedAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_daily_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"branchId" text,
	"terminalId" text,
	"date" text,
	"totalSales" real,
	"totalTransactions" integer,
	"averageTransactionValue" real,
	"cashSales" real,
	"cardSales" real,
	"digitalWalletSales" real,
	"storeCreditSales" real,
	"refunds" real,
	"discounts" real,
	"taxCollected" real,
	"topSellingProducts" jsonb,
	"paymentMethods" jsonb,
	"hourlySales" jsonb,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_discounts" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"type" text,
	"value" real,
	"applicableProducts" text[],
	"applicableCategories" text[],
	"minPurchaseAmount" real,
	"maxDiscountAmount" real,
	"startDate" text,
	"endDate" text,
	"isActive" boolean,
	"usageCount" integer,
	"maxUsage" integer,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_products" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"sku" text,
	"name" text,
	"description" text,
	"category" text,
	"barcode" text,
	"unitPrice" real,
	"costPrice" real,
	"taxRate" real,
	"discountPrice" real,
	"discountStartDate" text,
	"discountEndDate" text,
	"image" text,
	"isActive" boolean,
	"stockLevel" integer,
	"reorderLevel" integer,
	"createdAt" text,
	"updatedAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_returns" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"terminalId" text,
	"employeeId" text,
	"employeeName" text,
	"customerId" text,
	"customerName" text,
	"originalSaleId" text,
	"originalSaleNumber" text,
	"returnNumber" text,
	"date" text,
	"items" jsonb,
	"subtotal" real,
	"tax" real,
	"total" real,
	"refundMethod" text,
	"refundStatus" text,
	"reason" text,
	"notes" text,
	"createdAt" text,
	"processedAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_sales" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"terminalId" text,
	"shiftId" text,
	"employeeId" text,
	"employeeName" text,
	"customerId" text,
	"customerName" text,
	"saleNumber" text,
	"date" text,
	"subtotal" real,
	"tax" real,
	"discount" real,
	"total" real,
	"paymentMethod" text,
	"paymentStatus" text,
	"status" text,
	"items" jsonb,
	"payments" jsonb,
	"notes" text,
	"createdAt" text,
	"updatedAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_shifts" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"terminalId" text,
	"employeeId" text,
	"employeeName" text,
	"startTime" text,
	"endTime" text,
	"openingBalance" real,
	"closingBalance" real,
	"cashSales" real,
	"cardSales" real,
	"digitalWalletSales" real,
	"storeCreditSales" real,
	"totalSales" real,
	"refunds" real,
	"status" text,
	"notes" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "pos_terminals" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"location" text,
	"branchId" text,
	"isActive" boolean,
	"lastSync" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "profile_update_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"employeeId" text,
	"employeeName" text,
	"department" text,
	"field" text,
	"label" text,
	"currentValue" text,
	"newValue" text,
	"status" text,
	"requestedAt" text,
	"processedAt" text,
	"processedBy" text,
	"rejectionReason" text
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"due" text,
	"status" text,
	"completion" integer,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"title" text,
	"description" text,
	"status" text,
	"priority" text,
	"assignee" text,
	"assigneeName" text,
	"due" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"poNumber" text,
	"vendorId" text,
	"vendorName" text,
	"item" text,
	"qty" integer,
	"unitPrice" real,
	"total" real,
	"status" text,
	"date" text,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "quality_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"check" text,
	"result" text,
	"date" text,
	"inspector" text,
	"notes" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"rfqNumber" text,
	"item" text,
	"vendorsInvited" integer,
	"sentDate" text,
	"quotesReceived" integer,
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "salary_bands" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"minSalary" real,
	"maxSalary" real,
	"employeeCount" integer,
	"createdBy" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "sales_customers" (
	"id" text PRIMARY KEY NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"orderNumber" text,
	"customerName" text,
	"customerId" text,
	"items" jsonb,
	"subtotal" real,
	"tax" real,
	"discount" real,
	"total" real,
	"status" text,
	"priority" text,
	"assignedTo" text,
	"assignedToName" text,
	"orderDate" text,
	"expectedDelivery" text,
	"notes" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "sales_quotations" (
	"id" text PRIMARY KEY NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "sales_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"repId" text,
	"repName" text,
	"month" text,
	"year" text,
	"targetAmount" real,
	"actualAmount" real,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "tax_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"code" text,
	"name" text,
	"rate" real,
	"type" text,
	"glAccountId" text,
	"isActive" boolean,
	"jurisdiction" text,
	"accountName" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "tax_returns" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"period" text,
	"taxCodeId" text,
	"taxCodeName" text,
	"taxableAmount" real,
	"taxAmount" real,
	"status" text,
	"filedDate" text,
	"dueDate" text,
	"createdBy" text,
	"createdAt" text,
	"type" text,
	"jurisdiction" text,
	"taxableIncome" real,
	"taxDue" real,
	"credits" real,
	"netPayable" real,
	"filedBy" text
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"ticketNumber" text,
	"customerName" text,
	"customerEmail" text,
	"subject" text,
	"description" text,
	"category" text,
	"department" text,
	"priority" text,
	"status" text,
	"assignedTo" text,
	"replies" jsonb DEFAULT '[]'::jsonb,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"email" text,
	"passwordHash" text,
	"loginEnabled" boolean,
	"loginDisabledReason" text,
	"role" text,
	"roles" text[],
	"activeRole" text,
	"department" text,
	"branch" text,
	"avatar" text,
	"permissions" text[],
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"type" text,
	"contact" text,
	"email" text,
	"rating" real,
	"ordersCount" integer,
	"status" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "whisper_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"category" text,
	"description" text,
	"location" text,
	"department" text,
	"status" text,
	"assignedTo" text,
	"notes" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"woNumber" text,
	"product" text,
	"qty" integer,
	"line" text,
	"status" text,
	"completion" integer,
	"startDate" text,
	"dueDate" text,
	"createdAt" text
);
--> statement-breakpoint
CREATE TABLE "workflow_triggers" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"event" text,
	"description" text,
	"enabled" boolean,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text,
	"name" text,
	"description" text,
	"isActive" boolean,
	"blocks" jsonb,
	"createdAt" text
);
