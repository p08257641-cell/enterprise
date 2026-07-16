import 'dotenv/config';
import { db } from './index';
import * as schema from './schema';
import {
  INITIAL_COMPANIES, INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_BRANCHES,
  INITIAL_EMPLOYEES, INITIAL_LEADS, INITIAL_CRM_ACTIVITIES, INITIAL_CRM_TASKS,
  INITIAL_CRM_EMAILS, INITIAL_GL_ACCOUNTS, INITIAL_INVOICES, INITIAL_INVENTORY,
  INITIAL_TICKETS, INITIAL_WORKFLOWS, INITIAL_AUDIT_LOGS, INITIAL_POS_CATEGORIES,
  INITIAL_POS_PRODUCTS, INITIAL_POS_TERMINALS, INITIAL_POS_CUSTOMERS, INITIAL_POS_SHIFTS,
  INITIAL_POS_SALES, INITIAL_POS_DISCOUNTS, INITIAL_POS_RETURNS, INITIAL_POS_DAILY_REPORTS,
  INITIAL_JOURNAL_ENTRIES, INITIAL_EXPENSES, INITIAL_FISCAL_PERIODS, INITIAL_OPENING_BALANCES,
  INITIAL_BILLS, INITIAL_BILL_PAYMENTS, INITIAL_CUSTOMER_PAYMENTS, INITIAL_BANK_ACCOUNTS,
  INITIAL_BANK_TRANSACTIONS, INITIAL_BANK_RECONCILIATIONS, INITIAL_FIXED_ASSETS,
  INITIAL_DEPRECIATION_ENTRIES, INITIAL_BUDGETS, INITIAL_COST_CENTERS, INITIAL_CURRENCY_RATES,
  INITIAL_TAX_CODES, INITIAL_TAX_RETURNS, INITIAL_INTERCOMPANY_TXNS, INITIAL_CONSOLIDATION_RULES,
  INITIAL_COMPLIANCE_CHECKS, INITIAL_AUDIT_SNAPSHOTS, INITIAL_POLICY_DOCUMENTS, INITIAL_FILING_DEADLINES,
  INITIAL_SALES_ORDERS,
} from '../src/data/mockData';

// HR / API seed data currently defined inline in server.ts (mirrored here for the seed).
const INITIAL_LEAVES = [
  { id: 'lr-1', companyId: 'c-acme', employeeId: 'emp-3', leaveType: 'Annual', startDate: '2026-07-14', endDate: '2026-07-20', reason: 'Family summer trip to Cape Coast', status: 'Pending', days: 5 },
  { id: 'lr-2', companyId: 'c-acme', employeeId: 'emp-4', leaveType: 'Sick', startDate: '2026-07-15', endDate: '2026-07-16', reason: 'Annual dental clean and crown check', status: 'Pending', days: 1 },
  { id: 'lr-3', companyId: 'c-acme', employeeId: 'emp-5', leaveType: 'Annual', startDate: '2026-07-10', endDate: '2026-07-18', reason: 'Moving to new apartment near factory', status: 'Approved', days: 6 },
];
const INITIAL_ATTENDANCE = [
  { id: 'att-1', companyId: 'c-acme', employeeId: 'emp-1', date: '2026-07-13', checkIn: '08:55 AM', status: 'Present', locationType: 'Office' },
  { id: 'att-2', companyId: 'c-acme', employeeId: 'emp-2', date: '2026-07-13', checkIn: '09:02 AM', status: 'Late', locationType: 'Remote' },
  { id: 'att-3', companyId: 'c-acme', employeeId: 'emp-3', date: '2026-07-13', checkIn: '08:43 AM', status: 'Present', locationType: 'Office' },
  { id: 'att-4', companyId: 'c-acme', employeeId: 'emp-4', date: '2026-07-13', checkIn: '09:10 AM', status: 'Present', locationType: 'Office' },
];
const INITIAL_OKRS = [
  { id: 'okr-1', companyId: 'c-acme', employeeId: 'emp-1', employeeName: 'Alex Mercer', department: 'Operations', title: 'Optimize operations pipeline capacity by 15%', keyResult: 'Increase daily output to 12k units.', progress: 60, status: 'On Track', period: 'Q3 2026' },
  { id: 'okr-2', companyId: 'c-acme', employeeId: 'emp-2', employeeName: 'Elena Rostova', department: 'Human Resources', title: 'Complete hiring cycle for 3 senior engineers', keyResult: 'Onboard candidates by August 30.', progress: 80, status: 'On Track', period: 'Q3 2026' },
  { id: 'okr-3', companyId: 'c-acme', employeeId: 'emp-3', employeeName: 'David Vance', department: 'Finance', title: 'Prepare compliance documentation for annual audit', keyResult: 'Submit complete package to external auditors.', progress: 45, status: 'At Risk', period: 'Q3 2026' },
  { id: 'okr-4', companyId: 'c-acme', employeeId: 'emp-4', employeeName: 'Samantha Brady', department: 'Sales', title: 'Close 5 enterprise customer contracts', keyResult: 'Achieve $250k new ARR.', progress: 30, status: 'At Risk', period: 'Q3 2026' },
  { id: 'okr-5', companyId: 'c-acme', employeeId: 'emp-5', employeeName: 'Michael Chang', department: 'Logistics & Stock', title: 'Reorganize primary warehouse stock labeling', keyResult: 'Reduce stock locator errors to under 1%.', progress: 95, status: 'Completed', period: 'Q3 2026' },
];
const INITIAL_PAYSLIPS = [
  { id: 'ps-1', companyId: 'c-acme', employeeId: 'emp-1', employeeName: 'Alex Mercer', department: 'Operations', period: 'June 2026', gross: 12500, deductions: 3125, net: 9375, status: 'Paid', baseSalary: 12500, overtimePay: 0, allowances: 0, tax: 1500, socialSec: 775, medicare: 181, healthIns: 669 },
  { id: 'ps-2', companyId: 'c-acme', employeeId: 'emp-2', employeeName: 'Elena Rostova', department: 'Human Resources', period: 'June 2026', gross: 8200, deductions: 2050, net: 6150, status: 'Paid', baseSalary: 8200, overtimePay: 0, allowances: 0, tax: 984, socialSec: 508, medicare: 119, healthIns: 439 },
  { id: 'ps-3', companyId: 'c-acme', employeeId: 'emp-3', employeeName: 'David Vance', department: 'Finance', period: 'June 2026', gross: 9500, deductions: 2375, net: 7125, status: 'Paid', baseSalary: 9500, overtimePay: 0, allowances: 0, tax: 1140, socialSec: 589, medicare: 138, healthIns: 508 },
];
const INITIAL_API_KEYS = [
  { id: 'key-1', companyId: 'c-acme', name: 'Production Webhook CRM Sync', key: 'erp_live_sec_7df98a90c8aef98e', permissions: 'Full Access', createdAt: '2025-06-01T12:00:00Z', expiresAt: '2026-12-31T23:59:59Z' },
];

const INITIAL_PAYROLL_GROUPS = [
  { id: 'pg-1', companyId: 'c-acme', name: 'Engineering Team', description: 'All engineering staff', employeeIds: ['emp-1', 'emp-5'], createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'pg-2', companyId: 'c-acme', name: 'Management', description: 'Senior management and executives', employeeIds: ['emp-1', 'emp-2'], createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
];

const INITIAL_SALARY_BANDS = [
  { id: 'sb-1', companyId: 'c-acme', name: 'Executive', minSalary: 12000, maxSalary: 25000, employeeCount: 2, createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'sb-2', companyId: 'c-acme', name: 'Senior', minSalary: 8000, maxSalary: 12000, employeeCount: 3, createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'sb-3', companyId: 'c-acme', name: 'Mid-level', minSalary: 5000, maxSalary: 8000, employeeCount: 8, createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'sb-4', companyId: 'c-acme', name: 'Junior', minSalary: 3000, maxSalary: 5000, employeeCount: 6, createdBy: 'u-admin', createdAt: '2026-07-01T00:00:00Z' },
];

const INITIAL_ONBOARDINGS = [
  { id: 'ob-1', companyId: 'c-acme', employeeId: 'emp-5', employeeName: 'Michael Chang', department: 'Logistics & Stock', role: 'Warehouse Supervisor', phase: 'Orientation', tasks: ['Welcome email', 'IT setup', 'Policy acknowledgment'], completedTasks: ['Welcome email', 'IT setup'], status: 'In Progress', startDate: '2026-07-01' },
];

const TABLES = [
  schema.filingDeadlines, schema.policyDocuments, schema.auditSnapshots, schema.complianceChecks,
  schema.consolidationRules, schema.intercompanyTxns, schema.taxReturns, schema.taxCodes,
  schema.currencyRates, schema.costCenters, schema.budgets, schema.depreciationEntries,
  schema.fixedAssets, schema.bankReconciliations, schema.bankTransactions, schema.bankAccounts,
  schema.customerPayments, schema.billPayments, schema.bills, schema.openingBalances,
  schema.fiscalPeriods, schema.expenses, schema.journalEntries, schema.posDailyReports,
  schema.posReturns, schema.posDiscounts, schema.posSales, schema.posCustomers,
  schema.posShifts, schema.posTerminals, schema.posProducts, schema.posCategories,
  schema.apiKeys, schema.workflows, schema.auditLogs, schema.tickets, schema.inventory,
  schema.invoices, schema.glAccounts, schema.crmEmails, schema.crmTasks, schema.crmActivities,
  schema.crmLeads, schema.payslips, schema.payrollGroups, schema.salaryBands, schema.okrs, schema.leaves, schema.attendance,
  schema.onboardings, schema.employees, schema.branches, schema.departments, schema.users, schema.companies,
];

async function seed() {
  console.log('Clearing tables…');
  for (const t of TABLES) {
    await db.delete(t);
  }

  console.log('Inserting seed data…');
  await db.insert(schema.companies).values(INITIAL_COMPANIES);
  await db.insert(schema.users).values(INITIAL_USERS);
  await db.insert(schema.departments).values(INITIAL_DEPARTMENTS);
  await db.insert(schema.branches).values(INITIAL_BRANCHES);
  await db.insert(schema.employees).values(INITIAL_EMPLOYEES);
  await db.insert(schema.leaves).values(INITIAL_LEAVES);
  await db.insert(schema.attendance).values(INITIAL_ATTENDANCE);
  await db.insert(schema.okrs).values(INITIAL_OKRS);
  await db.insert(schema.payslips).values(INITIAL_PAYSLIPS);
  await db.insert(schema.payrollGroups).values(INITIAL_PAYROLL_GROUPS);
  await db.insert(schema.salaryBands).values(INITIAL_SALARY_BANDS);
  await db.insert(schema.onboardings).values(INITIAL_ONBOARDINGS);
  await db.insert(schema.crmLeads).values(INITIAL_LEADS);
  await db.insert(schema.crmActivities).values(INITIAL_CRM_ACTIVITIES);
  await db.insert(schema.crmTasks).values(INITIAL_CRM_TASKS);
  await db.insert(schema.crmEmails).values(INITIAL_CRM_EMAILS);
  await db.insert(schema.glAccounts).values(INITIAL_GL_ACCOUNTS);
  await db.insert(schema.invoices).values(INITIAL_INVOICES);
  await db.insert(schema.inventory).values(INITIAL_INVENTORY);
  await db.insert(schema.tickets).values(INITIAL_TICKETS);
  await db.insert(schema.auditLogs).values(INITIAL_AUDIT_LOGS);
  await db.insert(schema.workflows).values(INITIAL_WORKFLOWS);
  await db.insert(schema.apiKeys).values(INITIAL_API_KEYS);
  await db.insert(schema.posCategories).values(INITIAL_POS_CATEGORIES);
  await db.insert(schema.posProducts).values(INITIAL_POS_PRODUCTS);
  await db.insert(schema.posTerminals).values(INITIAL_POS_TERMINALS);
  await db.insert(schema.posCustomers).values(INITIAL_POS_CUSTOMERS);
  await db.insert(schema.posShifts).values(INITIAL_POS_SHIFTS);
  await db.insert(schema.posSales).values(INITIAL_POS_SALES);
  await db.insert(schema.posDiscounts).values(INITIAL_POS_DISCOUNTS);
  await db.insert(schema.posReturns).values(INITIAL_POS_RETURNS);
  await db.insert(schema.posDailyReports).values(INITIAL_POS_DAILY_REPORTS);
  await db.insert(schema.journalEntries).values(INITIAL_JOURNAL_ENTRIES);
  await db.insert(schema.expenses).values(INITIAL_EXPENSES);
  await db.insert(schema.fiscalPeriods).values(INITIAL_FISCAL_PERIODS);
  await db.insert(schema.openingBalances).values(INITIAL_OPENING_BALANCES);
  await db.insert(schema.bills).values(INITIAL_BILLS);
  await db.insert(schema.billPayments).values(INITIAL_BILL_PAYMENTS);
  await db.insert(schema.customerPayments).values(INITIAL_CUSTOMER_PAYMENTS);
  await db.insert(schema.bankAccounts).values(INITIAL_BANK_ACCOUNTS);
  await db.insert(schema.bankTransactions).values(INITIAL_BANK_TRANSACTIONS);
  await db.insert(schema.bankReconciliations).values(INITIAL_BANK_RECONCILIATIONS);
  await db.insert(schema.fixedAssets).values(INITIAL_FIXED_ASSETS);
  await db.insert(schema.depreciationEntries).values(INITIAL_DEPRECIATION_ENTRIES);
  await db.insert(schema.budgets).values(INITIAL_BUDGETS);
  await db.insert(schema.costCenters).values(INITIAL_COST_CENTERS);
  await db.insert(schema.currencyRates).values(INITIAL_CURRENCY_RATES);
  await db.insert(schema.taxCodes).values(INITIAL_TAX_CODES);
  await db.insert(schema.taxReturns).values(INITIAL_TAX_RETURNS);
  await db.insert(schema.intercompanyTxns).values(INITIAL_INTERCOMPANY_TXNS);
  await db.insert(schema.consolidationRules).values(INITIAL_CONSOLIDATION_RULES);
  await db.insert(schema.complianceChecks).values(INITIAL_COMPLIANCE_CHECKS);
  await db.insert(schema.auditSnapshots).values(INITIAL_AUDIT_SNAPSHOTS);
  await db.insert(schema.policyDocuments).values(INITIAL_POLICY_DOCUMENTS);
  await db.insert(schema.filingDeadlines).values(INITIAL_FILING_DEADLINES);
  await db.insert(schema.salesOrders).values(INITIAL_SALES_ORDERS);

  console.log('Seed complete ✅');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed ❌', e);
  process.exit(1);
});
