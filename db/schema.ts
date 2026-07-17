import { pgTable, text, integer, real, boolean, jsonb } from 'drizzle-orm/pg-core';

interface TicketReply {
  from: string;
  fromRole: 'Customer' | 'Agent' | 'Admin';
  message: string;
  at: string;
}

/* ── Core ──────────────────────────────────────────────────────────────── */
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name'),
  domain: text('domain'),
  logo: text('logo'),
  industry: text('industry'),
  currency: text('currency'),
  timezone: text('timezone'),
  language: text('language'),
  activeModules: text('activeModules').array(),
  premiumFeatures: text('premiumFeatures').array(),
  billingPlan: text('billingPlan'),
  billingStatus: text('billingStatus'),
  createdAt: text('createdAt'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  email: text('email'),
  role: text('role'),
  roles: text('roles').array(),
  activeRole: text('activeRole'),
  department: text('department'),
  branch: text('branch'),
  avatar: text('avatar'),
  permissions: text('permissions').array(),
  status: text('status'),
  createdAt: text('createdAt'),
});

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  managerId: text('managerId'),
  parentId: text('parentId'),
  budget: real('budget'),
  employeeCount: integer('employeeCount'),
});

export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  location: text('location'),
  isMain: boolean('isMain'),
});

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  userId: text('userId'),
  employeeNumber: text('employeeNumber'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  department: text('department'),
  designation: text('designation'),
  branch: text('branch'),
  status: text('status'),
  joiningDate: text('joiningDate'),
  salary: real('salary'),
});

export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  employeeId: text('employeeId'),
  date: text('date'),
  checkIn: text('checkIn'),
  checkOut: text('checkOut'),
  status: text('status'),
  locationType: text('locationType'),
  latitude: real('latitude'),
  longitude: real('longitude'),
});

export const leaves = pgTable('leaves', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  employeeId: text('employeeId'),
  leaveType: text('leaveType'),
  startDate: text('startDate'),
  endDate: text('endDate'),
  reason: text('reason'),
  status: text('status'),
  approvedBy: text('approvedBy'),
  days: integer('days'),
});

export const onboardings = pgTable('onboardings', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  department: text('department'),
  role: text('role'),
  phase: text('phase'),
  tasks: jsonb('tasks'),
  completedTasks: jsonb('completedTasks'),
  status: text('status'),
  startDate: text('startDate'),
});

export const okrs = pgTable('okrs', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  department: text('department'),
  title: text('title'),
  keyResult: text('keyResult'),
  progress: integer('progress'),
  status: text('status'),
  period: text('period'),
});

export const payslips = pgTable('payslips', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  department: text('department'),
  period: text('period'),
  gross: real('gross'),
  deductions: real('deductions'),
  net: real('net'),
  status: text('status'),
  baseSalary: real('baseSalary'),
  overtimePay: real('overtimePay'),
  allowances: real('allowances'),
  tax: real('tax'),
  socialSec: real('socialSec'),
  medicare: real('medicare'),
  healthIns: real('healthIns'),
});

export const payrollGroups = pgTable('payroll_groups', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  description: text('description'),
  employeeIds: text('employeeIds').array(),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

export const salaryBands = pgTable('salary_bands', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  minSalary: real('minSalary'),
  maxSalary: real('maxSalary'),
  employeeCount: integer('employeeCount'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

/* ── CRM ───────────────────────────────────────────────────────────────── */
export const crmLeads = pgTable('crm_leads', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  phone: text('phone'),
  companyName: text('companyName'),
  status: text('status'),
  source: text('source'),
  value: real('value'),
  assignedTo: text('assignedTo'),
  assignedToName: text('assignedToName'),
  department: text('department'),
  aiLeadScore: integer('aiLeadScore'),
  aiFollowUpSuggested: text('aiFollowUpSuggested'),
  createdAt: text('createdAt'),
  comments: jsonb('comments'),
  activities: jsonb('activities'),
});

export const crmActivities = pgTable('crm_activities', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  leadId: text('leadId'),
  type: text('type'),
  subject: text('subject'),
  description: text('description'),
  performedBy: text('performedBy'),
  performedByName: text('performedByName'),
  createdAt: text('createdAt'),
});

export const crmTasks = pgTable('crm_tasks', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  leadId: text('leadId'),
  leadName: text('leadName'),
  companyName: text('companyName'),
  title: text('title'),
  description: text('description'),
  type: text('type'),
  priority: text('priority'),
  status: text('status'),
  assignedTo: text('assignedTo'),
  assignedToName: text('assignedToName'),
  dueDate: text('dueDate'),
  completedAt: text('completedAt'),
  createdAt: text('createdAt'),
});

export const crmEmails = pgTable('crm_emails', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  leadId: text('leadId'),
  to: text('to'),
  subject: text('subject'),
  body: text('body'),
  sentBy: text('sentBy'),
  sentByName: text('sentByName'),
  createdAt: text('createdAt'),
});

/* ── Accounting / Ledger ───────────────────────────────────────────────── */
export const glAccounts = pgTable('gl_accounts', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  code: text('code'),
  name: text('name'),
  type: text('type'),
  balance: real('balance'),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  invoiceNumber: text('invoiceNumber'),
  customerId: text('customerId'),
  customerName: text('customerName'),
  issueDate: text('issueDate'),
  dueDate: text('dueDate'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total: real('total'),
  status: text('status'),
});

export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  sku: text('sku'),
  name: text('name'),
  category: text('category'),
  warehouse: text('warehouse'),
  stockLevel: integer('stockLevel'),
  minStockLevel: integer('minStockLevel'),
  unitPrice: real('unitPrice'),
  supplier: text('supplier'),
  expiryDate: text('expiryDate'),
  batchNumber: text('batchNumber'),
});

export const payrollTaxConfigs = pgTable('payroll_tax_configs', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  incomeTaxRate: real('income_tax_rate'),
  socialSecurityRate: real('social_security_rate'),
  medicareRate: real('medicare_rate'),
  allowances: real('allowances'),
  healthInsurance: real('health_insurance'),
  overtimeRate: real('overtime_rate'),
  updatedAt: text('updated_at'),
});

export const kbArticles = pgTable('kb_articles', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  title: text('title'),
  category: text('category'),
  body: text('body'),
  views: integer('views'),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
});

export const lmsCourses = pgTable('lms_courses', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  title: text('title'),
  category: text('category'),
  level: text('level'),
  duration: text('duration'),
  enrolled: integer('enrolled'),
  completion: integer('completion'),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  title: text('title'),
  body: text('body'),
  author: text('author'),
  channel: text('channel'),
  date: text('date'),
  pinned: boolean('pinned'),
  createdAt: text('created_at'),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  ticketNumber: text('ticketNumber'),
  customerName: text('customerName'),
  customerEmail: text('customerEmail'),
  subject: text('subject'),
  description: text('description'),
  category: text('category'),
  department: text('department'),
  priority: text('priority'),
  status: text('status'),
  assignedTo: text('assignedTo'),
  replies: jsonb('replies').$type<TicketReply[]>().default([]),
  createdAt: text('createdAt'),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  userId: text('userId'),
  userName: text('userName'),
  action: text('action'),
  module: text('module'),
  details: text('details'),
  ipAddress: text('ipAddress'),
  timestamp: text('timestamp'),
});

export const workflows = pgTable('workflows', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  description: text('description'),
  isActive: boolean('isActive'),
  blocks: jsonb('blocks'),
  createdAt: text('createdAt'),
});

export const workflowTriggers = pgTable('workflow_triggers', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  event: text('event'),
  description: text('description'),
  enabled: boolean('enabled'),
  createdAt: text('created_at'),
});

export const emailTemplates = pgTable('email_templates', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  subject: text('subject'),
  body: text('body'),
  updated: text('updated'),
  createdAt: text('created_at'),
});

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  key: text('key'),
  permissions: text('permissions'),
  createdAt: text('createdAt'),
  expiresAt: text('expiresAt'),
});

/* ── POS ──────────────────────────────────────────────────────────────── */
export const posCategories = pgTable('pos_categories', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  description: text('description'),
  parentId: text('parentId'),
  color: text('color'),
  icon: text('icon'),
  isActive: boolean('isActive'),
  createdAt: text('createdAt'),
});

export const posProducts = pgTable('pos_products', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  sku: text('sku'),
  name: text('name'),
  description: text('description'),
  category: text('category'),
  barcode: text('barcode'),
  unitPrice: real('unitPrice'),
  costPrice: real('costPrice'),
  taxRate: real('taxRate'),
  discountPrice: real('discountPrice'),
  discountStartDate: text('discountStartDate'),
  discountEndDate: text('discountEndDate'),
  image: text('image'),
  isActive: boolean('isActive'),
  stockLevel: integer('stockLevel'),
  reorderLevel: integer('reorderLevel'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

export const posTerminals = pgTable('pos_terminals', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  location: text('location'),
  branchId: text('branchId'),
  isActive: boolean('isActive'),
  lastSync: text('lastSync'),
  createdAt: text('createdAt'),
});

export const posShifts = pgTable('pos_shifts', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  terminalId: text('terminalId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  startTime: text('startTime'),
  endTime: text('endTime'),
  openingBalance: real('openingBalance'),
  closingBalance: real('closingBalance'),
  cashSales: real('cashSales'),
  cardSales: real('cardSales'),
  digitalWalletSales: real('digitalWalletSales'),
  storeCreditSales: real('storeCreditSales'),
  totalSales: real('totalSales'),
  refunds: real('refunds'),
  status: text('status'),
  notes: text('notes'),
  createdAt: text('createdAt'),
});

export const posCustomers = pgTable('pos_customers', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: text('dateOfBirth'),
  address: text('address'),
  loyaltyPoints: integer('loyaltyPoints'),
  tier: text('tier'),
  totalPurchases: integer('totalPurchases'),
  totalSpent: real('totalSpent'),
  storeCredit: real('storeCredit'),
  notes: text('notes'),
  isActive: boolean('isActive'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

export const posSales = pgTable('pos_sales', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  terminalId: text('terminalId'),
  shiftId: text('shiftId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  customerId: text('customerId'),
  customerName: text('customerName'),
  saleNumber: text('saleNumber'),
  date: text('date'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  discount: real('discount'),
  total: real('total'),
  paymentMethod: text('paymentMethod'),
  paymentStatus: text('paymentStatus'),
  status: text('status'),
  items: jsonb('items'),
  payments: jsonb('payments'),
  notes: text('notes'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

export const posDiscounts = pgTable('pos_discounts', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  type: text('type'),
  value: real('value'),
  applicableProducts: text('applicableProducts').array(),
  applicableCategories: text('applicableCategories').array(),
  minPurchaseAmount: real('minPurchaseAmount'),
  maxDiscountAmount: real('maxDiscountAmount'),
  startDate: text('startDate'),
  endDate: text('endDate'),
  isActive: boolean('isActive'),
  usageCount: integer('usageCount'),
  maxUsage: integer('maxUsage'),
  createdAt: text('createdAt'),
});

export const posReturns = pgTable('pos_returns', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  terminalId: text('terminalId'),
  employeeId: text('employeeId'),
  employeeName: text('employeeName'),
  customerId: text('customerId'),
  customerName: text('customerName'),
  originalSaleId: text('originalSaleId'),
  originalSaleNumber: text('originalSaleNumber'),
  returnNumber: text('returnNumber'),
  date: text('date'),
  items: jsonb('items'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total: real('total'),
  refundMethod: text('refundMethod'),
  refundStatus: text('refundStatus'),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: text('createdAt'),
  processedAt: text('processedAt'),
});

export const posDailyReports = pgTable('pos_daily_reports', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  branchId: text('branchId'),
  terminalId: text('terminalId'),
  date: text('date'),
  totalSales: real('totalSales'),
  totalTransactions: integer('totalTransactions'),
  averageTransactionValue: real('averageTransactionValue'),
  cashSales: real('cashSales'),
  cardSales: real('cardSales'),
  digitalWalletSales: real('digitalWalletSales'),
  storeCreditSales: real('storeCreditSales'),
  refunds: real('refunds'),
  discounts: real('discounts'),
  taxCollected: real('taxCollected'),
  topSellingProducts: jsonb('topSellingProducts'),
  paymentMethods: jsonb('paymentMethods'),
  hourlySales: jsonb('hourlySales'),
  createdAt: text('createdAt'),
});

/* ── Core Ledger ──────────────────────────────────────────────────────── */
export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  entryNumber: text('entryNumber'),
  date: text('date'),
  description: text('description'),
  reference: text('reference'),
  lines: jsonb('lines'),
  totalDebit: real('totalDebit'),
  totalCredit: real('totalCredit'),
  status: text('status'),
  createdBy: text('createdBy'),
  createdByName: text('createdByName'),
  approvedBy: text('approvedBy'),
  approvedByName: text('approvedByName'),
  postedAt: text('postedAt'),
  createdAt: text('createdAt'),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  description: text('description'),
  category: text('category'),
  department: text('department'),
  amount: real('amount'),
  date: text('date'),
  status: text('status'),
  glAccountId: text('glAccountId'),
  journalEntryId: text('journalEntryId'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

export const fiscalPeriods = pgTable('fiscal_periods', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  startDate: text('startDate'),
  endDate: text('endDate'),
  status: text('status'),
  closedBy: text('closedBy'),
  closedAt: text('closedAt'),
});

export const openingBalances = pgTable('opening_balances', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  accountId: text('accountId'),
  accountCode: text('accountCode'),
  accountName: text('accountName'),
  periodId: text('periodId'),
  debit: real('debit'),
  credit: real('credit'),
  createdAt: text('createdAt'),
});

/* ── Tier 2 ───────────────────────────────────────────────────────────── */
export const bills = pgTable('bills', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  vendorName: text('vendorName'),
  vendorId: text('vendorId'),
  billNumber: text('billNumber'),
  invoiceDate: text('invoiceDate'),
  dueDate: text('dueDate'),
  description: text('description'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total: real('total'),
  amountPaid: real('amountPaid'),
  status: text('status'),
  glAccountId: text('glAccountId'),
  journalEntryId: text('journalEntryId'),
  createdBy: text('createdBy'),
  createdByName: text('createdByName'),
  createdAt: text('createdAt'),
});

export const billPayments = pgTable('bill_payments', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  billId: text('billId'),
  amount: real('amount'),
  paymentDate: text('paymentDate'),
  paymentMethod: text('paymentMethod'),
  reference: text('reference'),
  bankAccountId: text('bankAccountId'),
  journalEntryId: text('journalEntryId'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

export const customerPayments = pgTable('customer_payments', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  invoiceId: text('invoiceId'),
  customerName: text('customerName'),
  amount: real('amount'),
  paymentDate: text('paymentDate'),
  paymentMethod: text('paymentMethod'),
  reference: text('reference'),
  bankAccountId: text('bankAccountId'),
  journalEntryId: text('journalEntryId'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

export const salesOrders = pgTable('sales_orders', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  orderNumber: text('orderNumber'),
  customerName: text('customerName'),
  customerId: text('customerId'),
  items: jsonb('items'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  discount: real('discount'),
  total: real('total'),
  status: text('status'),
  priority: text('priority'),
  assignedTo: text('assignedTo'),
  assignedToName: text('assignedToName'),
  orderDate: text('orderDate'),
  expectedDelivery: text('expectedDelivery'),
  notes: text('notes'),
  createdAt: text('createdAt'),
});

export const salesCustomers = pgTable('sales_customers', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  totalOrders: real('totalOrders'),
  totalSpend: real('totalSpend'),
  lastOrderDate: text('lastOrderDate'),
  notes: text('notes'),
  createdAt: text('createdAt'),
});

export const salesQuotations = pgTable('sales_quotations', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  quoteNumber: text('quoteNumber'),
  customerName: text('customerName'),
  customerId: text('customerId'),
  items: jsonb('items'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total: real('total'),
  validUntil: text('validUntil'),
  status: text('status'),
  assignedTo: text('assignedTo'),
  assignedToName: text('assignedToName'),
  notes: text('notes'),
  createdAt: text('createdAt'),
});

export const salesTargets = pgTable('sales_targets', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  repId: text('repId'),
  repName: text('repName'),
  month: text('month'),
  year: text('year'),
  targetAmount: real('targetAmount'),
  actualAmount: real('actualAmount'),
  createdAt: text('createdAt'),
});

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  bankName: text('bankName'),
  accountNumber: text('accountNumber'),
  accountType: text('accountType'),
  glAccountId: text('glAccountId'),
  balance: real('balance'),
  isActive: boolean('isActive'),
  createdAt: text('createdAt'),
});

export const bankTransactions = pgTable('bank_transactions', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  bankAccountId: text('bankAccountId'),
  date: text('date'),
  description: text('description'),
  type: text('type'),
  amount: real('amount'),
  reconciled: boolean('reconciled'),
  reconciledDate: text('reconciledDate'),
  journalEntryId: text('journalEntryId'),
  reference: text('reference'),
  createdAt: text('createdAt'),
});

export const bankReconciliations = pgTable('bank_reconciliations', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  bankAccountId: text('bankAccountId'),
  periodStartDate: text('periodStartDate'),
  periodEndDate: text('periodEndDate'),
  statementBalance: real('statementBalance'),
  bookBalance: real('bookBalance'),
  reconciledDifference: real('reconciledDifference'),
  status: text('status'),
  reconciledTransactionIds: text('reconciledTransactionIds').array(),
  completedBy: text('completedBy'),
  completedByName: text('completedByName'),
  completedAt: text('completedAt'),
  createdAt: text('createdAt'),
});

export const fixedAssets = pgTable('fixed_assets', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  assetCode: text('assetCode'),
  name: text('name'),
  description: text('description'),
  category: text('category'),
  purchaseDate: text('purchaseDate'),
  purchasePrice: real('purchasePrice'),
  salvageValue: real('salvageValue'),
  usefulLifeYears: integer('usefulLifeYears'),
  depreciationMethod: text('depreciationMethod'),
  accumulatedDepreciation: real('accumulatedDepreciation'),
  currentBookValue: real('currentBookValue'),
  location: text('location'),
  status: text('status'),
  glAccountId: text('glAccountId'),
  disposalDate: text('disposalDate'),
  disposalPrice: real('disposalPrice'),
  createdAt: text('createdAt'),
});

export const depreciationEntries = pgTable('depreciation_entries', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  assetId: text('assetId'),
  assetCode: text('assetCode'),
  assetName: text('assetName'),
  period: text('period'),
  depreciationAmount: real('depreciationAmount'),
  accumulatedDepreciation: real('accumulatedDepreciation'),
  bookValue: real('bookValue'),
  journalEntryId: text('journalEntryId'),
  status: text('status'),
  createdAt: text('createdAt'),
});

export const budgets = pgTable('budgets', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  fiscalYear: text('fiscalYear'),
  glAccountId: text('glAccountId'),
  accountCode: text('accountCode'),
  accountName: text('accountName'),
  budgetAmount: real('budgetAmount'),
  actualAmount: real('actualAmount'),
  variance: real('variance'),
  variancePercent: real('variancePercent'),
  period: text('period'),
  status: text('status'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
});

export const costCenters = pgTable('cost_centers', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  code: text('code'),
  name: text('name'),
  departmentId: text('departmentId'),
  departmentName: text('departmentName'),
  managerName: text('managerName'),
  budget: real('budget'),
  actualSpend: real('actualSpend'),
  status: text('status'),
  createdAt: text('createdAt'),
});

export const currencyRates = pgTable('currency_rates', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  baseCurrency: text('baseCurrency'),
  targetCurrency: text('targetCurrency'),
  rate: real('rate'),
  effectiveDate: text('effectiveDate'),
  source: text('source'),
  createdAt: text('createdAt'),
});

/* ── Tier 3 ───────────────────────────────────────────────────────────── */
export const taxCodes = pgTable('tax_codes', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  code: text('code'),
  name: text('name'),
  rate: real('rate'),
  type: text('type'),
  glAccountId: text('glAccountId'),
  isActive: boolean('isActive'),
  jurisdiction: text('jurisdiction'),
  accountName: text('accountName'),
  createdAt: text('createdAt'),
});

export const taxReturns = pgTable('tax_returns', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  period: text('period'),
  taxCodeId: text('taxCodeId'),
  taxCodeName: text('taxCodeName'),
  taxableAmount: real('taxableAmount'),
  taxAmount: real('taxAmount'),
  status: text('status'),
  filedDate: text('filedDate'),
  dueDate: text('dueDate'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
  type: text('type'),
  jurisdiction: text('jurisdiction'),
  taxableIncome: real('taxableIncome'),
  taxDue: real('taxDue'),
  credits: real('credits'),
  netPayable: real('netPayable'),
  filedBy: text('filedBy'),
});

export const intercompanyTxns = pgTable('intercompany_txns', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  fromCompanyId: text('fromCompanyId'),
  fromCompanyName: text('fromCompanyName'),
  toCompanyId: text('toCompanyId'),
  toCompanyName: text('toCompanyName'),
  type: text('type'),
  amount: real('amount'),
  description: text('description'),
  status: text('status'),
  eliminationEntryId: text('eliminationEntryId'),
  createdBy: text('createdBy'),
  createdAt: text('createdAt'),
  currency: text('currency'),
  date: text('date'),
});

export const consolidationRules = pgTable('consolidation_rules', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  subsidiaryId: text('subsidiaryId'),
  subsidiaryName: text('subsidiaryName'),
  eliminationAccount: text('eliminationAccount'),
  minorityInterestPct: real('minorityInterestPct'),
  isActive: boolean('isActive'),
  createdAt: text('createdAt'),
  name: text('name'),
  description: text('description'),
  parentAccountName: text('parentAccountName'),
  method: text('method'),
  subsidiaryIds: text('subsidiaryIds').array(),
  intercompanyEliminationAccountId: text('intercompanyEliminationAccountId'),
});

export const complianceChecks = pgTable('compliance_checks', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  category: text('category'),
  title: text('title'),
  description: text('description'),
  status: text('status'),
  dueDate: text('dueDate'),
  assignee: text('assignee'),
  assigneeName: text('assigneeName'),
  lastChecked: text('lastChecked'),
  createdAt: text('createdAt'),
});

export const auditSnapshots = pgTable('audit_snapshots', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  entityType: text('entityType'),
  entityId: text('entityId'),
  entityName: text('entityName'),
  action: text('action'),
  before: jsonb('before'),
  after: jsonb('after'),
  userId: text('userId'),
  userName: text('userName'),
  ipAddress: text('ipAddress'),
  timestamp: text('timestamp'),
  performedByName: text('performedByName'),
  oldValue: jsonb('oldValue'),
  newValue: jsonb('newValue'),
});

export const policyDocuments = pgTable('policy_documents', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  title: text('title'),
  category: text('category'),
  version: text('version'),
  content: text('content'),
  acknowledgedBy: text('acknowledgedBy').array(),
  totalEmployees: integer('totalEmployees'),
  dueDate: text('dueDate'),
  createdAt: text('createdAt'),
  status: text('status'),
  requiresAcknowledgmentFrom: text('requiresAcknowledgmentFrom').array(),
});

export const filingDeadlines = pgTable('filing_deadlines', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  filingType: text('filingType'),
  jurisdiction: text('jurisdiction'),
  dueDate: text('dueDate'),
  status: text('status'),
  assignee: text('assignee'),
  assigneeName: text('assigneeName'),
  notes: text('notes'),
  createdAt: text('createdAt'),
  title: text('title'),
  type: text('type'),
  relatedTaxReturnId: text('relatedTaxReturnId'),
  description: text('description'),
  filedDate: text('filedDate'),
  filedBy: text('filedBy'),
});

export const projectTasks = pgTable('project_tasks', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  title: text('title'),
  description: text('description'),
  status: text('status'),
  priority: text('priority'),
  assignee: text('assignee'),
  assigneeName: text('assigneeName'),
  due: text('due'),
  createdAt: text('createdAt'),
});

export const projectMilestones = pgTable('project_milestones', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  due: text('due'),
  status: text('status'),
  completion: integer('completion'),
  createdAt: text('createdAt'),
});
