/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Company {
  id: string;
  name: string;
  domain: string;
  logo: string;
  industry: string;
  currency: string;
  timezone: string;
  language: string;
  activeModules: string[];
  premiumFeatures: string[]; // List of premium features enabled
  billingPlan: 'Trial' | 'Core' | 'Premium' | 'Enterprise';
  billingStatus: 'Active' | 'Past Due' | 'Trialing';
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string; // Primary/base role: Super Admin, Company Admin, Employee, etc.
  roles: string[]; // All assigned roles (includes primary role)
  activeRole: string; // Currently active role for permissions and UI
  department?: string;
  branch?: string;
  avatar?: string;
  permissions: string[];
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  managerId?: string;
  parentId?: string;
  budget: number;
  employeeCount: number;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  location: string;
  isMain: boolean;
}

export interface Employee {
  id: string;
  companyId: string;
  userId?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  branch: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  joiningDate: string;
  salary: number;
}

export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  locationType: 'Office' | 'GPS' | 'Remote';
  latitude?: number;
  longitude?: number;
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  days?: number;
}

export interface OnboardingRecord {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  phase: string;
  tasks: string[];
  completedTasks: string[];
  status: 'In Progress' | 'Completed' | 'Pending';
  startDate: string;
}

export interface OKRRecord {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  keyResult: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Completed';
  period: string;
}

export interface PayslipRecord {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  gross: number;
  deductions: number;
  net: number;
  status: 'Paid' | 'Processing';
  baseSalary: number;
  overtimePay: number;
  allowances: number;
  tax: number;
  socialSec: number;
  medicare: number;
  healthIns: number;
}

export interface PayrollGroup {
  id: string;
  companyId: string;
  name: string;
  description: string;
  employeeIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface SalaryBand {
  id: string;
  companyId: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
  createdBy: string;
  createdAt: string;
}

export interface CRMLead {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  source: 'Website' | 'Referral' | 'LinkedIn' | 'Ad Campaign' | 'Partner' | 'In-Store';
  value: number;
  assignedTo?: string; // User ID
  assignedToName?: string; // Display name
  department?: string; // Department assignment
  aiLeadScore?: number; // Calculated by Gemini (0-100)
  aiFollowUpSuggested?: string;
  createdAt: string;
  comments?: LeadComment[]; // Collaboration comments
  activities?: LeadActivity[]; // Activity history
}

export interface LeadComment {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface CRMActivityLog {
  id: string;
  companyId: string;
  leadId: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Note' | 'Task';
  subject: string;
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface CRMTask {
  id: string;
  companyId: string;
  leadId: string;
  leadName: string;
  companyName: string;
  title: string;
  description: string;
  type: 'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Proposal' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export interface CRMEmailLog {
  id: string;
  companyId: string;
  leadId: string;
  to: string;
  subject: string;
  body: string;
  sentBy: string;
  sentByName: string;
  createdAt: string;
}

export interface GLAccount {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface Transaction {
  id: string;
  companyId: string;
  accountId: string;
  date: string;
  description: string;
  type: 'Debit' | 'Credit';
  amount: number;
  reference?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';
}

export interface InventoryItem {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  stockLevel: number;
  minStockLevel: number; // Reorder point
  unitPrice: number;
  supplier: string;
  expiryDate?: string;
  batchNumber?: string;
}

export interface TicketReply {
  from: string;
  fromRole: 'Customer' | 'Agent' | 'Admin';
  message: string;
  at: string;
}

export interface PayrollTaxConfig {
  id: string;
  companyId: string;
  incomeTaxRate: number;
  socialSecurityRate: number;
  medicareRate: number;
  allowances: number;
  healthInsurance: number;
  overtimeRate: number;
  updatedAt: string;
}

export interface KBArticle {
  id: string;
  companyId: string;
  title: string;
  category: string;
  body: string;
  views: number;
  createdBy: string;
  createdAt: string;
}

export interface LMSCourse {
  id: string;
  companyId: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  enrolled: number;
  completion: number;
  createdBy: string;
  createdAt: string;
}

export interface CommunicationAnnouncement {
  id: string;
  companyId: string;
  title: string;
  body: string;
  author: string;
  channel: string;
  date: string;
  pinned: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  companyId: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: 'Technical' | 'Billing' | 'Sales' | 'General';
  department?: string; // department the ticket is directed to
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Noted' | 'Closed';
  assignedTo?: string; // User ID
  replies?: TicketReply[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  companyId?: string; // null means platform-level
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface WorkflowBlock {
  id: string;
  type: 'Trigger' | 'Condition' | 'Action' | 'Delay';
  label: string;
  value: string; // e.g. "CRM Lead Created", "Send Email", "Wait 3 Days"
  config: Record<string, any>;
}

export interface ERPWorkflow {
  id: string;
  companyId: string;
  name: string;
  description: string;
  isActive: boolean;
  blocks: WorkflowBlock[];
  createdAt: string;
}

export interface WorkflowTrigger {
  id: string;
  companyId: string;
  name: string;
  event: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  companyId: string;
  name: string;
  subject: string;
  body: string;
  updated: string;
  createdAt: string;
}

export interface APIKey {
  id: string;
  companyId: string;
  name: string;
  key: string;
  permissions: 'Read Only' | 'Full Access';
  createdAt: string;
  expiresAt: string;
}

// POS Module Types
export interface POSProduct {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  barcode?: string;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  image?: string;
  isActive: boolean;
  stockLevel: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface POSCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface POSTerminal {
  id: string;
  companyId: string;
  name: string;
  location: string;
  branchId: string;
  isActive: boolean;
  lastSync: string;
  createdAt: string;
}

export interface POSShift {
  id: string;
  companyId: string;
  terminalId: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  cashSales: number;
  cardSales: number;
  digitalWalletSales: number;
  storeCreditSales: number;
  totalSales: number;
  refunds: number;
  status: 'Open' | 'Closed';
  notes?: string;
  createdAt: string;
}

export interface POSCustomer {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalPurchases: number;
  totalSpent: number;
  storeCredit: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface POSSale {
  id: string;
  companyId: string;
  terminalId: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  customerId?: string;
  customerName?: string;
  saleNumber: string;
  date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Digital Wallet' | 'Store Credit' | 'Split';
  paymentStatus: 'Paid' | 'Partial' | 'Refunded' | 'Void';
  status: 'Completed' | 'Void' | 'Refunded';
  items: POSSaleItem[];
  payments: POSPayment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POSSaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  returned?: number;
}

export interface POSPayment {
  id: string;
  method: 'Cash' | 'Card' | 'Digital Wallet' | 'Store Credit';
  amount: number;
  reference?: string;
  cardType?: string;
  digitalWalletType?: string;
}

export interface POSDiscount {
  id: string;
  companyId: string;
  name: string;
  type: 'Percentage' | 'Fixed Amount' | 'BOGO';
  value: number;
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[]; // Category IDs
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
}

export interface POSReturn {
  id: string;
  companyId: string;
  terminalId: string;
  employeeId: string;
  employeeName: string;
  customerId?: string;
  customerName?: string;
  originalSaleId: string;
  originalSaleNumber: string;
  returnNumber: string;
  date: string;
  items: POSReturnItem[];
  subtotal: number;
  tax: number;
  total: number;
  refundMethod: 'Cash' | 'Card' | 'Store Credit';
  refundStatus: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  reason: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface POSReturnItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  reason: string;
  condition: 'Good' | 'Damaged' | 'Defective';
}

export interface POSDailyReport {
  id: string;
  companyId: string;
  branchId: string;
  terminalId: string;
  date: string;
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  cashSales: number;
  cardSales: number;
  digitalWalletSales: number;
  storeCreditSales: number;
  refunds: number;
  discounts: number;
  taxCollected: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  paymentMethods: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  hourlySales: {
    hour: number;
    sales: number;
    transactions: number;
  }[];
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE LEDGER - Accounting Module Types
// ═══════════════════════════════════════════════════════════════════════════

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Approved' | 'Void';
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  postedAt?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  companyId: string;
  description: string;
  category: string;
  department: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  glAccountId?: string;
  journalEntryId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface FiscalPeriod {
  id: string;
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Locked';
  closedBy?: string;
  closedAt?: string;
}

export interface OpeningBalance {
  id: string;
  companyId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  periodId: string;
  debit: number;
  credit: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2 - AP / AR / Bank / Fixed Assets / Budgets / Cost Centers / Multi-Currency
// ═══════════════════════════════════════════════════════════════════════════

export interface Bill {
  id: string;
  companyId: string;
  vendorName: string;
  vendorId?: string;
  billNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Void';
  glAccountId?: string;
  journalEntryId?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface BillPayment {
  id: string;
  companyId: string;
  billId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Check' | 'Cash' | 'Card';
  reference?: string;
  bankAccountId?: string;
  journalEntryId?: string;
  createdBy: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  companyId: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Check' | 'Cash' | 'Card';
  reference?: string;
  bankAccountId?: string;
  journalEntryId?: string;
  createdBy: string;
  createdAt: string;
}

export interface SalesOrderItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  companyId: string;
  orderNumber: string;
  customerName: string;
  customerId: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: string;
  assignedToName?: string;
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesCustomer {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  notes: string;
  createdAt: string;
}

export interface SalesQuotation {
  id: string;
  companyId: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesTarget {
  id: string;
  companyId: string;
  repId: string;
  repName: string;
  month: string;
  year: string;
  targetAmount: number;
  actualAmount: number;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  companyId: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountType: 'Checking' | 'Savings' | 'Credit Card' | 'Petty Cash';
  glAccountId: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  companyId: string;
  bankAccountId: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  reconciled: boolean;
  reconciledDate?: string;
  journalEntryId?: string;
  reference?: string;
  createdAt: string;
}

export interface BankReconciliation {
  id: string;
  companyId: string;
  bankAccountId: string;
  periodStartDate: string;
  periodEndDate: string;
  statementBalance: number;
  bookBalance: number;
  reconciledDifference: number;
  status: 'In Progress' | 'Completed' | 'Discrepancy';
  reconciledTransactionIds: string[];
  completedBy?: string;
  completedByName?: string;
  completedAt?: string;
  createdAt: string;
}

export interface FixedAsset {
  id: string;
  companyId: string;
  assetCode: string;
  name: string;
  description: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'Straight-Line' | 'Declining Balance' | 'Sum of Years';
  accumulatedDepreciation: number;
  currentBookValue: number;
  location: string;
  status: 'Active' | 'Disposed' | 'Fully Depreciated';
  glAccountId?: string;
  disposalDate?: string;
  disposalPrice?: number;
  createdAt: string;
}

export interface DepreciationEntry {
  id: string;
  companyId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  period: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
  journalEntryId?: string;
  status: 'Draft' | 'Posted';
  createdAt: string;
}

export interface Budget {
  id: string;
  companyId: string;
  name: string;
  fiscalYear: string;
  glAccountId: string;
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  period: string;
  status: 'Draft' | 'Approved' | 'Active';
  createdBy: string;
  createdAt: string;
}

export interface CostCenter {
  id: string;
  companyId: string;
  code: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  managerName?: string;
  budget: number;
  actualSpend: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface CurrencyRate {
  id: string;
  companyId: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3 - Advanced Reporting / Tax / Intercompany / Compliance / Audit
// ═══════════════════════════════════════════════════════════════════════════

export interface TaxCode {
  id: string;
  companyId: string;
  code: string;
  name: string;
  rate: number;
  type: 'VAT' | 'GST' | 'WHT' | 'Sales Tax' | 'Exempt';
  glAccountId?: string;
  isActive: boolean;
  jurisdiction?: string;
  accountName?: string;
  createdAt: string;
}

export interface TaxReturn {
  id: string;
  companyId: string;
  period: string;
  taxCodeId: string;
  taxCodeName: string;
  taxableAmount: number;
  taxAmount: number;
  status: 'Draft' | 'Filed' | 'Paid' | 'Overdue';
  filedDate?: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  type?: string;
  jurisdiction?: string;
  taxableIncome?: number;
  taxDue?: number;
  credits?: number;
  netPayable?: number;
  filedBy?: string;
}

export interface IntercompanyTransaction {
  id: string;
  companyId: string;
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  type: 'Invoice' | 'Payment' | 'Loan' | 'Dividend' | 'Service Fee';
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Eliminated' | 'Settled';
  eliminationEntryId?: string;
  createdBy: string;
  createdAt: string;
  currency?: string;
  date?: string;
}

export interface ConsolidationRule {
  id: string;
  companyId: string;
  subsidiaryId: string;
  subsidiaryName: string;
  eliminationAccount: string;
  minorityInterestPct: number;
  isActive: boolean;
  createdAt: string;
  name?: string;
  description?: string;
  parentAccountName?: string;
  method?: string;
  subsidiaryIds?: string[];
  intercompanyEliminationAccountId?: string;
}

export interface ComplianceCheck {
  id: string;
  companyId: string;
  category: 'SOX' | 'Tax' | 'Labor' | 'Data Privacy' | 'Financial' | 'Environmental';
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Compliant' | 'Non-Compliant' | 'Overdue';
  dueDate: string;
  assignee: string;
  assigneeName: string;
  lastChecked?: string;
  createdAt: string;
}

export interface AuditSnapshot {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: 'Create' | 'Update' | 'Delete' | 'Approve' | 'Void' | 'Post';
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  userId: string;
  userName: string;
  ipAddress: string;
  timestamp: string;
  performedByName?: string;
  oldValue?: any;
  newValue?: any;
}

export interface PolicyDocument {
  id: string;
  companyId: string;
  title: string;
  category: 'HR' | 'Finance' | 'Security' | 'Operations' | 'Legal';
  version: string;
  content: string;
  acknowledgedBy: string[];
  totalEmployees: number;
  dueDate: string;
  createdAt: string;
  status?: string;
  requiresAcknowledgmentFrom?: string[];
}

export interface FilingDeadline {
  id: string;
  companyId: string;
  filingType: string;
  jurisdiction: string;
  dueDate: string;
  status: 'Upcoming' | 'Filed' | 'Overdue' | 'Extension';
  assignee: string;
  assigneeName: string;
  notes?: string;
  createdAt: string;
  title?: string;
  type?: string;
  relatedTaxReturnId?: string;
  description?: string;
  filedDate?: string;
  filedBy?: string;
}
