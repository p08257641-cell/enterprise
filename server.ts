/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_BRANCHES,
  INITIAL_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_GL_ACCOUNTS,
  INITIAL_INVOICES,
  INITIAL_INVENTORY,
  INITIAL_TICKETS,
  INITIAL_WORKFLOWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_POS_CATEGORIES,
  INITIAL_POS_PRODUCTS,
  INITIAL_POS_TERMINALS,
  INITIAL_POS_CUSTOMERS,
  INITIAL_POS_SHIFTS,
  INITIAL_POS_SALES,
  INITIAL_POS_DISCOUNTS,
  INITIAL_POS_RETURNS,
  INITIAL_POS_DAILY_REPORTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_EXPENSES,
  INITIAL_FISCAL_PERIODS,
  INITIAL_OPENING_BALANCES,
  INITIAL_BILLS,
  INITIAL_BILL_PAYMENTS,
  INITIAL_CUSTOMER_PAYMENTS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_BANK_RECONCILIATIONS,
  INITIAL_FIXED_ASSETS,
  INITIAL_DEPRECIATION_ENTRIES,
  INITIAL_BUDGETS,
  INITIAL_COST_CENTERS,
  INITIAL_CURRENCY_RATES,
  INITIAL_TAX_CODES,
  INITIAL_TAX_RETURNS,
  INITIAL_INTERCOMPANY_TXNS,
  INITIAL_CONSOLIDATION_RULES,
  INITIAL_COMPLIANCE_CHECKS,
  INITIAL_AUDIT_SNAPSHOTS,
  INITIAL_POLICY_DOCUMENTS,
  INITIAL_FILING_DEADLINES,
  INITIAL_CRM_ACTIVITIES,
  INITIAL_CRM_TASKS,
  INITIAL_CRM_EMAILS
} from './src/data/mockData';
import { Company, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, Invoice, SupportTicket, ERPWorkflow, GLAccount, AuditLog, APIKey, POSProduct, POSCategory, POSTerminal, POSShift, POSCustomer, POSSale, POSDiscount, POSReturn, POSDailyReport, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline } from './src/types';

// In-memory data store for live session
let companies: Company[] = [...INITIAL_COMPANIES];
let users = [...INITIAL_USERS];

// Shared HR & Payroll state tables (Synchronized across perspectives)
let leaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    companyId: 'c-acme',
    employeeId: 'emp-3', // David Vance
    leaveType: 'Annual',
    startDate: '2026-07-14',
    endDate: '2026-07-20',
    reason: 'Family summer trip to Cape Coast',
    status: 'Pending',
    days: 5
  },
  {
    id: 'lr-2',
    companyId: 'c-acme',
    employeeId: 'emp-4', // Samantha Brady
    leaveType: 'Sick',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    reason: 'Annual dental clean and crown check',
    status: 'Pending',
    days: 1
  },
  {
    id: 'lr-3',
    companyId: 'c-acme',
    employeeId: 'emp-5', // Michael Chang
    leaveType: 'Annual',
    startDate: '2026-07-10',
    endDate: '2026-07-18',
    reason: 'Moving to new apartment near factory',
    status: 'Approved',
    days: 6
  }
];

let attendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    companyId: 'c-acme',
    employeeId: 'emp-1',
    date: '2026-07-13',
    checkIn: '08:55 AM',
    status: 'Present',
    locationType: 'Office'
  },
  {
    id: 'att-2',
    companyId: 'c-acme',
    employeeId: 'emp-2',
    date: '2026-07-13',
    checkIn: '09:02 AM',
    status: 'Late',
    locationType: 'Remote'
  },
  {
    id: 'att-3',
    companyId: 'c-acme',
    employeeId: 'emp-3',
    date: '2026-07-13',
    checkIn: '08:43 AM',
    status: 'Present',
    locationType: 'Office'
  },
  {
    id: 'att-4',
    companyId: 'c-acme',
    employeeId: 'emp-4',
    date: '2026-07-13',
    checkIn: '09:10 AM',
    status: 'Present',
    locationType: 'Office'
  }
];

let okrs: OKRRecord[] = [
  {
    id: 'okr-1',
    companyId: 'c-acme',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    department: 'Operations',
    title: 'Optimize operations pipeline capacity by 15%',
    keyResult: 'Increase daily output to 12k units.',
    progress: 60,
    status: 'On Track',
    period: 'Q3 2026'
  },
  {
    id: 'okr-2',
    companyId: 'c-acme',
    employeeId: 'emp-2',
    employeeName: 'Elena Rostova',
    department: 'Human Resources',
    title: 'Complete hiring cycle for 3 senior engineers',
    keyResult: 'Onboard candidates by August 30.',
    progress: 80,
    status: 'On Track',
    period: 'Q3 2026'
  },
  {
    id: 'okr-3',
    companyId: 'c-acme',
    employeeId: 'emp-3',
    employeeName: 'David Vance',
    department: 'Finance',
    title: 'Prepare compliance documentation for annual audit',
    keyResult: 'Submit complete package to external auditors.',
    progress: 45,
    status: 'At Risk',
    period: 'Q3 2026'
  },
  {
    id: 'okr-4',
    companyId: 'c-acme',
    employeeId: 'emp-4',
    employeeName: 'Samantha Brady',
    department: 'Sales',
    title: 'Close 5 enterprise customer contracts',
    keyResult: 'Achieve $250k new ARR.',
    progress: 30,
    status: 'At Risk',
    period: 'Q3 2026'
  },
  {
    id: 'okr-5',
    companyId: 'c-acme',
    employeeId: 'emp-5',
    employeeName: 'Michael Chang',
    department: 'Logistics & Stock',
    title: 'Reorganize primary warehouse stock labeling',
    keyResult: 'Reduce stock locator errors to under 1%.',
    progress: 95,
    status: 'Completed',
    period: 'Q3 2026'
  }
];

let payslips: PayslipRecord[] = [
  {
    id: 'ps-1',
    companyId: 'c-acme',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    department: 'Operations',
    period: 'June 2026',
    gross: 12500,
    deductions: 3125,
    net: 9375,
    status: 'Paid',
    baseSalary: 12500,
    overtimePay: 0,
    allowances: 0,
    tax: 1500,
    socialSec: 775,
    medicare: 181,
    healthIns: 669
  },
  {
    id: 'ps-2',
    companyId: 'c-acme',
    employeeId: 'emp-2',
    employeeName: 'Elena Rostova',
    department: 'Human Resources',
    period: 'June 2026',
    gross: 8200,
    deductions: 2050,
    net: 6150,
    status: 'Paid',
    baseSalary: 8200,
    overtimePay: 0,
    allowances: 0,
    tax: 984,
    socialSec: 508,
    medicare: 119,
    healthIns: 439
  },
  {
    id: 'ps-3',
    companyId: 'c-acme',
    employeeId: 'emp-3',
    employeeName: 'David Vance',
    department: 'Finance',
    period: 'June 2026',
    gross: 9500,
    deductions: 2375,
    net: 7125,
    status: 'Paid',
    baseSalary: 9500,
    overtimePay: 0,
    allowances: 0,
    tax: 1140,
    socialSec: 589,
    medicare: 138,
    healthIns: 508
  }
];
let departments = [...INITIAL_DEPARTMENTS];
let branches = [...INITIAL_BRANCHES];
let employees: Employee[] = [...INITIAL_EMPLOYEES];
let leads: CRMLead[] = [...INITIAL_LEADS];
let crmActivities: CRMActivityLog[] = [...INITIAL_CRM_ACTIVITIES];
let crmTasks: CRMTask[] = [...INITIAL_CRM_TASKS];
let crmEmails: CRMEmailLog[] = [...INITIAL_CRM_EMAILS];
let glAccounts: GLAccount[] = [...INITIAL_GL_ACCOUNTS];
let invoices: Invoice[] = [...INITIAL_INVOICES];
let inventory = [...INITIAL_INVENTORY];
let tickets: SupportTicket[] = [...INITIAL_TICKETS];
let workflows: ERPWorkflow[] = [...INITIAL_WORKFLOWS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let apiKeys: APIKey[] = [
  {
    id: 'key-1',
    companyId: 'c-acme',
    name: 'Production Webhook CRM Sync',
    key: 'erp_live_sec_7df98a90c8aef98e',
    permissions: 'Full Access',
    createdAt: '2025-06-01T12:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z'
  }
];

// POS Module Data Stores
let posCategories: POSCategory[] = [...INITIAL_POS_CATEGORIES];
let posProducts: POSProduct[] = [...INITIAL_POS_PRODUCTS];
let posTerminals: POSTerminal[] = [...INITIAL_POS_TERMINALS];
let posCustomers: POSCustomer[] = [...INITIAL_POS_CUSTOMERS];
let posShifts: POSShift[] = [...INITIAL_POS_SHIFTS];
let posSales: POSSale[] = [...INITIAL_POS_SALES];
let posDiscounts: POSDiscount[] = [...INITIAL_POS_DISCOUNTS];
let posReturns: POSReturn[] = [...INITIAL_POS_RETURNS];
let posDailyReports: POSDailyReport[] = [...INITIAL_POS_DAILY_REPORTS];

// Core Ledger Data Stores
let journalEntries: JournalEntry[] = [...INITIAL_JOURNAL_ENTRIES];
let expenses: Expense[] = [...INITIAL_EXPENSES];
let fiscalPeriods: FiscalPeriod[] = [...INITIAL_FISCAL_PERIODS];
let openingBalances: OpeningBalance[] = [...INITIAL_OPENING_BALANCES];

// Tier 2 Data Stores
let bills: Bill[] = [...INITIAL_BILLS];
let billPayments: BillPayment[] = [...INITIAL_BILL_PAYMENTS];
let customerPayments: CustomerPayment[] = [...INITIAL_CUSTOMER_PAYMENTS];
let bankAccounts: BankAccount[] = [...INITIAL_BANK_ACCOUNTS];
let bankTransactions: BankTransaction[] = [...INITIAL_BANK_TRANSACTIONS];
let bankReconciliations: BankReconciliation[] = [...INITIAL_BANK_RECONCILIATIONS];
let fixedAssets: FixedAsset[] = [...INITIAL_FIXED_ASSETS];
let depreciationEntries: DepreciationEntry[] = [...INITIAL_DEPRECIATION_ENTRIES];
let budgets: Budget[] = [...INITIAL_BUDGETS];
let costCenters: CostCenter[] = [...INITIAL_COST_CENTERS];
let currencyRates: CurrencyRate[] = [...INITIAL_CURRENCY_RATES];

// Tier 3 Data Stores
let taxCodes: TaxCode[] = [...INITIAL_TAX_CODES];
let taxReturns: TaxReturn[] = [...INITIAL_TAX_RETURNS];
let intercompanyTxns: IntercompanyTransaction[] = [...INITIAL_INTERCOMPANY_TXNS];
let consolidationRules: ConsolidationRule[] = [...INITIAL_CONSOLIDATION_RULES];
let complianceChecks: ComplianceCheck[] = [...INITIAL_COMPLIANCE_CHECKS];
let auditSnapshots: AuditSnapshot[] = [...INITIAL_AUDIT_SNAPSHOTS];
let policyDocuments: PolicyDocument[] = [...INITIAL_POLICY_DOCUMENTS];
let filingDeadlines: FilingDeadline[] = [...INITIAL_FILING_DEADLINES];

// Lazy load Gemini AI Client
let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
    return null;
  }
  aiInstance = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiInstance;
}

// Logging helper for audits
function logAudit(companyId: string | undefined, userId: string, userName: string, action: string, module: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    companyId,
    userId,
    userName,
    action,
    module,
    details,
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(newLog);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// --- ERP API ROUTES ---

// 1. Tenants (Companies)
app.get('/api/companies', (req, res) => {
  res.json(companies);
});

// 1.1 Departments
app.get('/api/departments', (req, res) => {
  res.json(departments);
});

// 1.2 Branches
app.get('/api/branches', (req, res) => {
  res.json(branches);
});

app.post('/api/companies', (req, res) => {
  const { name, industry, currency, timezone, language, billingPlan } = req.body;
  const id = `c-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const newCompany: Company = {
    id,
    name,
    domain: `${id.substring(2)}.com`,
    logo: '🏢',
    industry,
    currency,
    timezone,
    language,
    activeModules: ['Administration', 'HR', 'CRM', 'Accounting', 'Inventory', 'Help Desk'],
    premiumFeatures: [],
    billingPlan: billingPlan || 'Trial',
    billingStatus: 'Trialing',
    createdAt: new Date().toISOString()
  };
  companies.push(newCompany);

  // Seed initial values for the newly created tenant
  const initialGL: GLAccount[] = [
    { id: `gl-1010-${id}`, companyId: id, code: '1010', name: 'Operating Cash Account', type: 'Asset', balance: 50000.00 },
    { id: `gl-1200-${id}`, companyId: id, code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 0.00 },
    { id: `gl-4010-${id}`, companyId: id, code: '4010', name: 'Services Revenue', type: 'Revenue', balance: 0.00 },
    { id: `gl-5010-${id}`, companyId: id, code: '5010', name: 'Cost of Services', type: 'Expense', balance: 0.00 }
  ];
  glAccounts.push(...initialGL);

  logAudit(undefined, 'u-super', 'Sarah Connor', 'CREATE_TENANT', 'Administration', `Created new tenant company: ${name} (${id})`);
  res.status(201).json(newCompany);
});

// Update tenant active modules/feature packs
app.post('/api/companies/:id/subscription', (req, res) => {
  const { id } = req.params;
  const { activeModules, premiumFeatures, billingPlan } = req.body;

  const companyIndex = companies.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  companies[companyIndex] = {
    ...companies[companyIndex],
    activeModules: activeModules || companies[companyIndex].activeModules,
    premiumFeatures: premiumFeatures || companies[companyIndex].premiumFeatures,
    billingPlan: billingPlan || companies[companyIndex].billingPlan
  };

  logAudit(id, 'u-super', 'Sarah Connor', 'UPDATE_SUBSCRIPTION', 'Administration', `Updated modules: [${activeModules?.join(', ')}], features: [${premiumFeatures?.join(', ')}]`);
  res.json(companies[companyIndex]);
});

// 2. Users & Departments
app.get('/api/users', (req, res) => {
  const { companyId } = req.query;
  if (companyId) {
    res.json(users.filter(u => u.companyId === companyId || u.companyId === ''));
  } else {
    res.json(users);
  }
});

app.post('/api/users/invite', (req, res) => {
  const { companyId, name, email, role, roles, department, branch } = req.body;
  const newUser = {
    id: `u-${Date.now()}`,
    companyId,
    name,
    email,
    role,
    roles: roles || [role, 'Employee'], // Default to role + Employee if not specified
    activeRole: role,
    department,
    branch,
    avatar: '👤',
    permissions: [role.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_view'],
    status: 'Active' as const,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'INVITE_USER', 'Administration', `Invited user ${name} (${email}) as ${role} with roles: ${roles?.join(', ') || role}`);
  res.status(201).json(newUser);
});

app.post('/api/users/:id/switch-role', (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify the user has this role assigned
  if (!users[userIndex].roles.includes(newRole)) {
    return res.status(400).json({ error: 'User does not have this role assigned' });
  }

  const oldRole = users[userIndex].activeRole;
  users[userIndex].activeRole = newRole;

  logAudit(users[userIndex].companyId, users[userIndex].id, users[userIndex].name, 'ROLE_SWITCH', 'User Management', `Switched active role from ${oldRole} to ${newRole}`);
  res.json(users[userIndex]);
});

app.get('/api/departments', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? departments.filter(d => d.companyId === companyId) : departments);
});

app.get('/api/branches', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? branches.filter(b => b.companyId === companyId) : branches);
});

// 3. HR & Employees
app.get('/api/employees', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? employees.filter(e => e.companyId === companyId) : employees);
});

app.post('/api/employees', (req, res) => {
  const { companyId, firstName, lastName, email, department, designation, branch, salary } = req.body;

  const empId = `emp-${Date.now()}`;
  const empNumber = `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEmp: Employee = {
    id: empId,
    companyId,
    employeeNumber: empNumber,
    firstName,
    lastName,
    email,
    department,
    designation,
    branch,
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: Number(salary) || 5000
  };

  employees.push(newEmp);

  // AUTOMATION TRIGGER 1: Employee Created Automation Flow
  // 1. Generate local email
  const generatedEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme-mfg.com`;
  // 2. Create Audit log
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'EMPLOYEE_CREATE', 'HR', `Created employee ${firstName} ${lastName}. Auto-generated Employee Number: ${empNumber}, Assigning to Dept: ${department}`);

  // 3. Mock send notification to HR and Welcome email to Employee
  console.log(`[ERP AUTOMATION TRIGGERED] Welcome email sent to ${email} (redirected to ${generatedEmail})`);

  res.status(201).json({
    employee: newEmp,
    automationTriggered: {
      step1: "Generated Employee ID: " + empNumber,
      step2: "Created Enterprise Mail: " + generatedEmail,
      step3: "Assigned Department and Designation: " + department + " - " + designation,
      step4: "Dispatched Welcome Onboarding Email",
      step5: "Notified HR Manager Elena Rostova"
    }
  });
});

// 3.0.1 Update Employee Status (with cross-module sync)
app.put('/api/employees/:id', (req, res) => {
  const idx = employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  
  const oldStatus = employees[idx].status;
  const newStatus = req.body.status || oldStatus;
  
  // Update employee
  employees[idx] = { ...employees[idx], ...req.body };
  
  // Cross-module sync: When employee is terminated, unassign from active tasks/leads
  if (newStatus === 'Terminated' && oldStatus !== 'Terminated') {
    const userId = employees[idx].userId || employees[idx].id;
    
    // Unassign from active CRM leads
    leads.forEach(lead => {
      if (lead.assignedTo === userId && lead.status !== 'Won' && lead.status !== 'Lost') {
        lead.assignedTo = undefined;
        lead.assignedToName = undefined;
      }
    });
    
    // Mark active CRM tasks as cancelled
    crmTasks.forEach(task => {
      if (task.assignedTo === userId && task.status !== 'Completed') {
        task.status = 'Cancelled';
      }
    });
    
    logAudit(employees[idx].companyId, userId, `${employees[idx].firstName} ${employees[idx].lastName}`, 'EMPLOYEE_TERMINATED', 'HR', `Employee terminated. Unassigned from active leads and tasks.`);
  }
  
  res.json(employees[idx]);
});

// 3.1 HR Leaves
app.get('/api/leaves', (req, res) => {
  const { companyId, employeeId } = req.query;
  let filtered = leaveRequests;
  if (companyId) filtered = filtered.filter(l => l.companyId === companyId);
  if (employeeId) filtered = filtered.filter(l => l.employeeId === employeeId);
  res.json(filtered);
});

app.post('/api/leaves', (req, res) => {
  const { companyId, employeeId, employeeName, department, leaveType, startDate, endDate, reason, days } = req.body;
  const newLeave: LeaveRequest = {
    id: `lr-${Date.now()}`,
    companyId,
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'Pending',
    days: Number(days) || 1
  };

  leaveRequests.push(newLeave);
  logAudit(companyId, employeeId, employeeName, 'LEAVE_REQUEST', 'HR', `Submitted ${leaveType} leave request: ${startDate} to ${endDate}. Reason: ${reason}`);
  res.status(201).json(newLeave);
});

app.post('/api/leaves/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const leave = leaveRequests.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  leave.status = 'Approved';
  leave.approvedBy = userName || 'Admin';

  // Update employee status to 'On Leave'
  const emp = employees.find(e => e.id === leave.employeeId);
  if (emp) emp.status = 'On Leave';

  logAudit(leave.companyId, userId, userName, 'LEAVE_APPROVE', 'HR', `Approved ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  res.json(leave);
});

app.post('/api/leaves/:id/decline', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const leave = leaveRequests.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  leave.status = 'Rejected';

  // Revert employee status to 'Active'
  const emp = employees.find(e => e.id === leave.employeeId);
  if (emp && emp.status === 'On Leave') emp.status = 'Active';

  logAudit(leave.companyId, userId, userName, 'LEAVE_DECLINE', 'HR', `Declined ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  res.json(leave);
});

// 3.2 HR Attendance
app.get('/api/attendance', (req, res) => {
  const { companyId } = req.query;
  let filtered = attendanceRecords;
  if (companyId) filtered = filtered.filter(a => a.companyId === companyId);
  res.json(filtered);
});

app.post('/api/attendance/clock', (req, res) => {
  const { companyId, employeeId, employeeName, department, action, locationType } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (action === 'in') {
    // Check if already clocked in today
    let record = attendanceRecords.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!record) {
      record = {
        id: `att-${Date.now()}`,
        companyId,
        employeeId,
        date: todayStr,
        checkIn: timeStr,
        status: 'Present',
        locationType: locationType || 'Office'
      };
      attendanceRecords.push(record);
      logAudit(companyId, employeeId, employeeName, 'ATTENDANCE_IN', 'HR', `Clocked in today at ${timeStr} via ${locationType}`);
    }
    res.json(record);
  } else {
    // Clock out
    const record = attendanceRecords.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (record) {
      record.checkOut = timeStr;
      logAudit(companyId, employeeId, employeeName, 'ATTENDANCE_OUT', 'HR', `Clocked out today at ${timeStr}`);
      res.json(record);
    } else {
      res.status(400).json({ error: 'No active clock-in session found for today' });
    }
  }
});

// 3.3 HR OKRs
app.get('/api/okrs', (req, res) => {
  const { companyId, employeeId } = req.query;
  let filtered = okrs;
  if (companyId) filtered = filtered.filter(o => o.companyId === companyId);
  if (employeeId) filtered = filtered.filter(o => o.employeeId === employeeId);
  res.json(filtered);
});

app.post('/api/okrs', (req, res) => {
  const { companyId, employeeId, employeeName, department, title, keyResult, status, period } = req.body;
  const newOkr: OKRRecord = {
    id: `okr-${Date.now()}`,
    companyId,
    employeeId,
    employeeName,
    department,
    title,
    keyResult,
    progress: 0,
    status: status || 'On Track',
    period: period || 'Q3 2026'
  };
  okrs.push(newOkr);
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'OKR_CREATE', 'HR', `Assigned new OKR to ${employeeName}: "${title}"`);
  res.status(201).json(newOkr);
});

app.post('/api/okrs/:id/progress', (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const okr = okrs.find(o => o.id === id);
  if (!okr) return res.status(404).json({ error: 'OKR not found' });

  okr.progress = Number(progress);
  if (okr.progress >= 100) {
    okr.status = 'Completed';
  } else if (okr.progress < 40) {
    okr.status = 'At Risk';
  } else {
    okr.status = 'On Track';
  }

  logAudit(okr.companyId, okr.employeeId, okr.employeeName, 'OKR_UPDATE', 'HR', `Updated OKR "${okr.title}" progress to ${progress}%`);
  res.json(okr);
});

// 3.4 Payslips & Payroll
app.get('/api/payslips', (req, res) => {
  const { companyId, employeeId } = req.query;
  let filtered = payslips;
  if (companyId) filtered = filtered.filter(p => p.companyId === companyId);
  if (employeeId) filtered = filtered.filter(p => p.employeeId === employeeId);
  res.json(filtered);
});

app.post('/api/payroll/run', (req, res) => {
  const { companyId, period, structure, userId, userName } = req.body;
  const compEmployees = employees.filter(e => e.companyId === companyId);

  const generatedSlips: PayslipRecord[] = [];

  compEmployees.forEach(emp => {
    const baseSalary = emp.salary;
    const overtimePay = Math.round(baseSalary * 0.05); // Simulated overtime
    const allowances = 350;
    const gross = baseSalary + overtimePay + allowances;

    const tax = Math.round(baseSalary * 0.12);
    const socialSec = Math.round(baseSalary * 0.062);
    const medicare = Math.round(baseSalary * 0.0145);
    const healthIns = 180;
    const deductions = tax + socialSec + medicare + healthIns;
    const net = gross - deductions;

    // Check if payslip already exists for this period and employee
    const existingIndex = payslips.findIndex(p => p.employeeId === emp.id && p.period === period);
    const slip: PayslipRecord = {
      id: existingIndex >= 0 ? payslips[existingIndex].id : `ps-${Date.now()}-${emp.id}`,
      companyId,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      period,
      gross,
      deductions,
      net,
      status: 'Paid',
      baseSalary,
      overtimePay,
      allowances,
      tax,
      socialSec,
      medicare,
      healthIns
    };

    if (existingIndex >= 0) {
      payslips[existingIndex] = slip;
    } else {
      payslips.push(slip);
    }
    generatedSlips.push(slip);
  });

  logAudit(companyId, userId, userName, 'PAYROLL_RUN', 'Payroll', `Processed monthly payroll for ${period}. Net disbursed: $${generatedSlips.reduce((sum, s) => sum + s.net, 0).toLocaleString()}`);
  res.json(generatedSlips);
});

// 4. CRM Leads
app.get('/api/leads', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? leads.filter(l => l.companyId === companyId) : leads);
});

app.post('/api/leads', async (req, res) => {
  const { companyId, firstName, lastName, email, phone, companyName, source, value, assignedTo } = req.body;
  const leadId = `lead-${Date.now()}`;

  let newLead: CRMLead = {
    id: leadId,
    companyId,
    firstName,
    lastName,
    email,
    phone,
    companyName,
    status: 'New',
    source,
    value: Number(value) || 10000,
    assignedTo: assignedTo || 'u-acme-sales',
    aiLeadScore: 65, // default
    aiFollowUpSuggested: 'Lead registered. Contact via phone to schedule initial requirements review.',
    createdAt: new Date().toISOString()
  };

  // AI LEAD SCORING INTEGRATION
  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Assess this ERP customer lead. 
        Name: ${firstName} ${lastName}
        Email: ${email}
        Company: ${companyName}
        Estimated deal value: $${value}
        Source: ${source}
        Provide a JSON response with 'score' (number 0-100 indicating conversion likelihood) and 'followUp' (concise 2-sentence actionable sales playbook recommendation).`,
        config: {
          responseMimeType: 'application/json',
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.score !== undefined) newLead.aiLeadScore = parsed.score;
      if (parsed.followUp) newLead.aiFollowUpSuggested = parsed.followUp;
    } catch (err) {
      console.error("Gemini Lead Scoring failed, using default values:", err);
    }
  }

  leads.push(newLead);

  // AUTOMATION TRIGGER 2: Lead Created CRM automation
  // If Lead value > 50000, trigger specialized high-value alert action!
  let autoResults = ["Assigned Account Manager: Samantha Brady", "Drafted standard introductory playbook"];
  if (newLead.value > 50000) {
    autoResults.push("HIGH-VALUE DEAL DETECTED: Automatically created critical priority task for Sales Manager");
    autoResults.push("Generated specialized high-volume production pricing prospectus");
  }

  logAudit(companyId, 'u-acme-sales', 'Samantha Brady', 'LEAD_CREATE', 'CRM', `Added CRM Lead: ${firstName} ${lastName} from ${companyName}. AI lead score calculated: ${newLead.aiLeadScore}`);

  res.status(201).json({
    lead: newLead,
    automations: autoResults
  });
});

app.post('/api/leads/:id/move', (req, res) => {
  const { id } = req.params;
  const { status, companyId } = req.body;
  const leadIndex = leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const oldStatus = leads[leadIndex].status;
  leads[leadIndex].status = status;

  logAudit(companyId, 'u-acme-sales', 'Samantha Brady', 'LEAD_STAGE_MOVE', 'CRM', `Moved Lead ${leads[leadIndex].firstName} from ${oldStatus} to ${status}`);

  // Deal Won AUTOMATION TRIGGER
  let triggerInvoice = null;
  if (status === 'Won') {
    // Generate draft invoice
    const invId = `inv-${Date.now()}`;
    const invNumber = `INV-2026-0${Math.floor(400 + Math.random() * 599)}`;
    triggerInvoice = {
      id: invId,
      companyId: leads[leadIndex].companyId,
      invoiceNumber: invNumber,
      customerId: leads[leadIndex].id,
      customerName: leads[leadIndex].companyName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: leads[leadIndex].value,
      tax: leads[leadIndex].value * 0.08,
      total: leads[leadIndex].value * 1.08,
      status: 'Draft' as const
    };
    invoices.push(triggerInvoice);
    logAudit(leads[leadIndex].companyId, 'u-acme-finance', 'David Vance', 'INVOICE_AUTO_GENERATE', 'Accounting', `Automated billing trigger: Generated draft invoice ${invNumber} for Won Lead of $${leads[leadIndex].value}`);
  }

  res.json({
    lead: leads[leadIndex],
    invoiceCreated: triggerInvoice
  });
});

app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  leads[idx] = { ...leads[idx], ...req.body };
  res.json(leads[idx]);
});

app.post('/api/leads/:id/assign', (req, res) => {
  const { id } = req.params;
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  const { assignedTo, assignedToName, department } = req.body;
  
  // Validate assignment against active employees
  if (assignedTo) {
    const employee = employees.find(e => (e.userId === assignedTo || e.id === assignedTo) && e.status === 'Active');
    if (!employee) {
      return res.status(400).json({ error: 'Assigned employee not found or not active in HR' });
    }
    // Use employee data as source of truth
    leads[idx].assignedTo = employee.userId || employee.id;
    leads[idx].assignedToName = `${employee.firstName} ${employee.lastName}`;
  } else {
    leads[idx].assignedTo = undefined;
    leads[idx].assignedToName = undefined;
  }
  leads[idx].department = department || undefined;
  logAudit(leads[idx].companyId, assignedTo, assignedToName || 'System', 'ASSIGN_LEAD', 'CRM', `Assigned lead ${leads[idx].firstName} ${leads[idx].lastName} to ${leads[idx].assignedToName}`);
  res.json(leads[idx]);
});

app.post('/api/leads/:id/comments', (req, res) => {
  const { id } = req.params;
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  const comment = {
    id: `comment-${Date.now()}`,
    leadId: id,
    userId: req.body.userId,
    userName: req.body.userName,
    userAvatar: req.body.userAvatar,
    content: req.body.content,
    timestamp: new Date().toISOString()
  };
  leads[idx].comments = [...(leads[idx].comments || []), comment];
  logAudit(leads[idx].companyId, req.body.userId, req.body.userName, 'ADD_COMMENT', 'CRM', `Commented on lead ${leads[idx].firstName} ${leads[idx].lastName}`);
  res.json(leads[idx]);
});

// CRM Activities
app.get('/api/crm-activities', (req, res) => {
  const { companyId, leadId } = req.query;
  let result = crmActivities;
  if (companyId) result = result.filter(a => a.companyId === companyId);
  if (leadId) result = result.filter(a => a.leadId === leadId);
  res.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.post('/api/crm-activities', (req, res) => {
  const activity: CRMActivityLog = {
    id: `act-${Date.now()}`,
    companyId: req.body.companyId,
    leadId: req.body.leadId,
    type: req.body.type,
    subject: req.body.subject,
    description: req.body.description,
    performedBy: req.body.performedBy,
    performedByName: req.body.performedByName,
    createdAt: new Date().toISOString()
  };
  crmActivities.push(activity);
  logAudit(req.body.companyId, req.body.performedBy, req.body.performedByName, 'LOG_ACTIVITY', 'CRM', `Logged ${activity.type}: ${activity.subject}`);
  res.status(201).json(activity);
});

// CRM Tasks
app.get('/api/crm-tasks', (req, res) => {
  const { companyId, leadId, status } = req.query;
  let result = crmTasks;
  if (companyId) result = result.filter(t => t.companyId === companyId);
  if (leadId) result = result.filter(t => t.leadId === leadId);
  if (status) result = result.filter(t => t.status === status);
  res.json(result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
});

app.post('/api/crm-tasks', (req, res) => {
  let assignedTo = req.body.assignedTo;
  let assignedToName = req.body.assignedToName;
  
  // Validate assignment against active employees
  if (assignedTo) {
    const employee = employees.find(e => (e.userId === assignedTo || e.id === assignedTo) && e.status === 'Active');
    if (!employee) {
      return res.status(400).json({ error: 'Assigned employee not found or not active in HR' });
    }
    assignedTo = employee.userId || employee.id;
    assignedToName = `${employee.firstName} ${employee.lastName}`;
  }
  
  const task: CRMTask = {
    id: `task-${Date.now()}`,
    companyId: req.body.companyId,
    leadId: req.body.leadId,
    leadName: req.body.leadName,
    companyName: req.body.companyName,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type || 'Follow-up',
    priority: req.body.priority || 'Medium',
    status: 'Pending',
    assignedTo,
    assignedToName,
    dueDate: req.body.dueDate,
    createdAt: new Date().toISOString()
  };
  crmTasks.push(task);
  logAudit(req.body.companyId, assignedTo, assignedToName, 'CREATE_TASK', 'CRM', `Created task: ${task.title}`);
  res.status(201).json(task);
});

app.patch('/api/crm-tasks/:id', (req, res) => {
  const idx = crmTasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  crmTasks[idx] = { ...crmTasks[idx], ...req.body };
  if (req.body.status === 'Completed' && !crmTasks[idx].completedAt) {
    crmTasks[idx].completedAt = new Date().toISOString();
  }
  logAudit(crmTasks[idx].companyId, req.body.completedBy || crmTasks[idx].assignedTo, req.body.completedByName || crmTasks[idx].assignedToName, 'UPDATE_TASK', 'CRM', `Updated task: ${crmTasks[idx].title} → ${crmTasks[idx].status}`);
  res.json(crmTasks[idx]);
});

// CRM Emails
app.get('/api/crm-emails', (req, res) => {
  const { companyId, leadId } = req.query;
  let result = crmEmails;
  if (companyId) result = result.filter(e => e.companyId === companyId);
  if (leadId) result = result.filter(e => e.leadId === leadId);
  res.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.post('/api/crm-emails', (req, res) => {
  const email: CRMEmailLog = {
    id: `email-${Date.now()}`,
    companyId: req.body.companyId,
    leadId: req.body.leadId,
    to: req.body.to,
    subject: req.body.subject,
    body: req.body.body,
    sentBy: req.body.sentBy,
    sentByName: req.body.sentByName,
    createdAt: new Date().toISOString()
  };
  crmEmails.push(email);
  // Also log as activity
  const activity: CRMActivityLog = {
    id: `act-${Date.now()}`,
    companyId: email.companyId,
    leadId: email.leadId,
    type: 'Email',
    subject: email.subject,
    description: email.body,
    performedBy: email.sentBy,
    performedByName: email.sentByName,
    createdAt: email.createdAt
  };
  crmActivities.push(activity);
  logAudit(req.body.companyId, req.body.sentBy, req.body.sentByName, 'SEND_EMAIL', 'CRM', `Sent email: ${email.subject}`);
  res.status(201).json(email);
});

// 5. Accounting & Ledger
app.get('/api/accounting', (req, res) => {
  const { companyId } = req.query;
  res.json({
    accounts: companyId ? glAccounts.filter(g => g.companyId === companyId) : glAccounts,
    invoices: companyId ? invoices.filter(i => i.companyId === companyId) : invoices
  });
});

app.post('/api/invoices', (req, res) => {
  const { companyId, customerName, subtotal, tax, dueDate } = req.body;
  const total = Number(subtotal) + Number(tax);
  const invNumber = `INV-2026-0${Math.floor(400 + Math.random() * 599)}`;

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    companyId,
    invoiceNumber: invNumber,
    customerId: `cust-${Date.now()}`,
    customerName,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: Number(subtotal),
    tax: Number(tax),
    total,
    status: 'Sent'
  };

  invoices.push(newInvoice);

  // Re-calculate General Ledger balances to reflect transaction journalizing
  // Debit Accounts Receivable, Credit Revenue
  const arAccountIndex = glAccounts.findIndex(a => a.companyId === companyId && a.code === '1200');
  const revAccountIndex = glAccounts.findIndex(a => a.companyId === companyId && a.code === '4010');

  if (arAccountIndex !== -1) glAccounts[arAccountIndex].balance += total;
  if (revAccountIndex !== -1) glAccounts[revAccountIndex].balance += Number(subtotal);

  logAudit(companyId, 'u-acme-finance', 'David Vance', 'INVOICE_CREATE', 'Accounting', `Dispatched Invoice ${invNumber} of $${total} to ${customerName}. Adjusting general ledger accounts: DR Accounts Receivable, CR Sales Revenue`);

  res.status(201).json(newInvoice);
});

app.post('/api/invoices/:id/pay', (req, res) => {
  const { id } = req.params;
  const { companyId } = req.body;
  const invIndex = invoices.findIndex(i => i.id === id);
  if (invIndex === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  invoices[invIndex].status = 'Paid';
  const amount = invoices[invIndex].total;

  // Debit Cash Account, Credit Accounts Receivable
  const cashAccountIndex = glAccounts.findIndex(a => a.companyId === companyId && a.code === '1010');
  const arAccountIndex = glAccounts.findIndex(a => a.companyId === companyId && a.code === '1200');

  if (cashAccountIndex !== -1) glAccounts[cashAccountIndex].balance += amount;
  if (arAccountIndex !== -1) glAccounts[arAccountIndex].balance -= amount;

  logAudit(companyId, 'u-acme-finance', 'David Vance', 'INVOICE_PAY', 'Accounting', `Processed payment for invoice ${invoices[invIndex].invoiceNumber}. DR Cash Operating Account ($${amount}), CR Accounts Receivable`);

  res.json(invoices[invIndex]);
});

// ═══════════════════════════════════════════════════════════════════════════
// CORE LEDGER - Accounting Module API Routes
// ═══════════════════════════════════════════════════════════════════════════

// 5.1 GL Account CRUD
app.get('/api/gl-accounts', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? glAccounts.filter(a => a.companyId === companyId) : glAccounts);
});

app.post('/api/gl-accounts', (req, res) => {
  const { companyId, code, name, type } = req.body;
  const existing = glAccounts.find(a => a.companyId === companyId && a.code === code);
  if (existing) {
    return res.status(400).json({ error: 'Account code already exists for this company' });
  }
  const newAccount: GLAccount = {
    id: `gl-${Date.now()}`,
    companyId,
    code,
    name,
    type,
    balance: 0
  };
  glAccounts.push(newAccount);
  logAudit(companyId, 'u-acme-finance', 'David Vance', 'GL_ACCOUNT_CREATE', 'Accounting', `Created new GL account: ${code} - ${name} (${type})`);
  res.status(201).json(newAccount);
});

app.put('/api/gl-accounts/:id', (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  const index = glAccounts.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Account not found' });
  if (name) glAccounts[index].name = name;
  if (type) glAccounts[index].type = type;
  logAudit(glAccounts[index].companyId, 'u-acme-finance', 'David Vance', 'GL_ACCOUNT_UPDATE', 'Accounting', `Updated GL account: ${glAccounts[index].code} - ${glAccounts[index].name}`);
  res.json(glAccounts[index]);
});

app.delete('/api/gl-accounts/:id', (req, res) => {
  const { id } = req.params;
  const index = glAccounts.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Account not found' });
  const account = glAccounts[index];
  if (account.balance !== 0) {
    return res.status(400).json({ error: 'Cannot delete account with non-zero balance' });
  }
  glAccounts.splice(index, 1);
  logAudit(account.companyId, 'u-acme-finance', 'David Vance', 'GL_ACCOUNT_DELETE', 'Accounting', `Deleted GL account: ${account.code} - ${account.name}`);
  res.json({ success: true });
});

// 5.2 Journal Entries
app.get('/api/journal-entries', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? journalEntries.filter(j => j.companyId === companyId) : journalEntries);
});

app.post('/api/journal-entries', (req, res) => {
  const { companyId, date, description, reference, lines, createdBy, createdByName } = req.body;

  const totalDebit = lines.reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({ error: 'Debit and credit totals must be equal' });
  }

  const entryNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;
  const newEntry: JournalEntry = {
    id: `je-${Date.now()}`,
    companyId,
    entryNumber,
    date,
    description,
    reference,
    lines: lines.map((l: any, i: number) => ({
      id: `jl-${Date.now()}-${i}`,
      accountId: l.accountId,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      description: l.description
    })),
    totalDebit,
    totalCredit,
    status: 'Draft',
    createdBy,
    createdByName,
    createdAt: new Date().toISOString()
  };

  journalEntries.push(newEntry);
  logAudit(companyId, createdBy, createdByName, 'JOURNAL_ENTRY_CREATE', 'Accounting', `Created journal entry ${entryNumber}: ${description}. Total: $${totalDebit}`);
  res.status(201).json(newEntry);
});

app.post('/api/journal-entries/:id/post', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = journalEntries.find(j => j.id === id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  if (entry.status !== 'Draft') return res.status(400).json({ error: 'Only draft entries can be posted' });

  // Update GL account balances
  entry.lines.forEach(line => {
    const accountIndex = glAccounts.findIndex(a => a.id === line.accountId);
    if (accountIndex !== -1) {
      glAccounts[accountIndex].balance += line.debit - line.credit;
    }
  });

  entry.status = 'Posted';
  entry.postedAt = new Date().toISOString();
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_POST', 'Accounting', `Posted journal entry ${entry.entryNumber}. Total: $${entry.totalDebit}`);
  res.json(entry);
});

app.post('/api/journal-entries/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = journalEntries.find(j => j.id === id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  if (entry.status !== 'Posted') return res.status(400).json({ error: 'Only posted entries can be approved' });

  entry.status = 'Approved';
  entry.approvedBy = userId;
  entry.approvedByName = userName;
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_APPROVE', 'Accounting', `Approved journal entry ${entry.entryNumber}`);
  res.json(entry);
});

app.post('/api/journal-entries/:id/void', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = journalEntries.find(j => j.id === id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });

  // Reverse GL balances if entry was posted or approved
  if (entry.status === 'Posted' || entry.status === 'Approved') {
    entry.lines.forEach(line => {
      const accountIndex = glAccounts.findIndex(a => a.id === line.accountId);
      if (accountIndex !== -1) {
        glAccounts[accountIndex].balance -= line.debit - line.credit;
      }
    });
  }

  entry.status = 'Void';
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_VOID', 'Accounting', `Voided journal entry ${entry.entryNumber}`);
  res.json(entry);
});

// 5.3 Expenses (rewritten with persistence + GL posting)
app.get('/api/expenses', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? expenses.filter(e => e.companyId === companyId) : expenses);
});

app.post('/api/expenses', (req, res) => {
  const { companyId, description, category, department, amount, createdBy } = req.body;

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    companyId,
    description,
    category,
    department,
    amount: Number(amount),
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    createdBy: createdBy || 'u-acme-finance',
    createdAt: new Date().toISOString()
  };

  expenses.push(newExpense);
  logAudit(companyId, createdBy || 'u-acme-finance', 'David Vance', 'EXPENSE_CREATE', 'Accounting', `Created expense: ${description} of $${amount} in ${category}`);
  res.status(201).json(newExpense);
});

app.post('/api/expenses/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const expIndex = expenses.findIndex(e => e.id === id);
  if (expIndex === -1) return res.status(404).json({ error: 'Expense not found' });

  expenses[expIndex].status = 'Approved';

  // Auto-create journal entry for approved expense
  const expenseAccountId = glAccounts.find(a => a.companyId === expenses[expIndex].companyId && a.type === 'Expense')?.id || 'gl-5010';
  const cashAccountId = glAccounts.find(a => a.companyId === expenses[expIndex].companyId && a.code === '1010')?.id || 'gl-1010';

  const entryNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;
  const newEntry: JournalEntry = {
    id: `je-${Date.now()}`,
    companyId: expenses[expIndex].companyId,
    entryNumber,
    date: expenses[expIndex].date,
    description: `Expense: ${expenses[expIndex].description}`,
    reference: expenses[expIndex].id,
    lines: [
      { id: `jl-${Date.now()}-1`, accountId: expenseAccountId, accountCode: '5010', accountName: 'Expense Account', debit: expenses[expIndex].amount, credit: 0, description: expenses[expIndex].description },
      { id: `jl-${Date.now()}-2`, accountId: cashAccountId, accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: expenses[expIndex].amount, description: 'Cash payment' }
    ],
    totalDebit: expenses[expIndex].amount,
    totalCredit: expenses[expIndex].amount,
    status: 'Posted',
    createdBy: userId || 'u-acme-finance',
    createdByName: userName || 'David Vance',
    postedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  journalEntries.push(newEntry);
  expenses[expIndex].journalEntryId = newEntry.id;

  // Update GL balances
  const expAccIdx = glAccounts.findIndex(a => a.id === expenseAccountId);
  const cashAccIdx = glAccounts.findIndex(a => a.id === cashAccountId);
  if (expAccIdx !== -1) glAccounts[expAccIdx].balance += expenses[expIndex].amount;
  if (cashAccIdx !== -1) glAccounts[cashAccIdx].balance -= expenses[expIndex].amount;

  logAudit(expenses[expIndex].companyId, userId, userName, 'EXPENSE_APPROVE', 'Accounting', `Approved expense: ${expenses[expIndex].description}. Auto-posted JE ${entryNumber}`);
  res.json(expenses[expIndex]);
});

// 5.4 Trial Balance
app.get('/api/trial-balance', (req, res) => {
  const { companyId } = req.query;
  const accounts = companyId ? glAccounts.filter(a => a.companyId === companyId) : glAccounts;

  let totalDebits = 0;
  let totalCredits = 0;

  const trialBalance = accounts.map(acc => {
    let debit = 0;
    let credit = 0;
    if (acc.type === 'Asset' || acc.type === 'Expense') {
      debit = acc.balance;
      totalDebits += acc.balance;
    } else {
      credit = acc.balance;
      totalCredits += acc.balance;
    }
    return {
      id: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit,
      credit
    };
  });

  res.json({
    accounts: trialBalance,
    totalDebits,
    totalCredits,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    asOfDate: new Date().toISOString().split('T')[0]
  });
});

// 5.5 Fiscal Periods
app.get('/api/fiscal-periods', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? fiscalPeriods.filter(f => f.companyId === companyId) : fiscalPeriods);
});

app.post('/api/fiscal-periods', (req, res) => {
  const { companyId, name, startDate, endDate } = req.body;
  const newPeriod: FiscalPeriod = {
    id: `fp-${Date.now()}`,
    companyId,
    name,
    startDate,
    endDate,
    status: 'Open'
  };
  fiscalPeriods.push(newPeriod);
  logAudit(companyId, 'u-acme-finance', 'David Vance', 'FISCAL_PERIOD_CREATE', 'Accounting', `Created fiscal period: ${name}`);
  res.status(201).json(newPeriod);
});

app.post('/api/fiscal-periods/:id/close', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const period = fiscalPeriods.find(f => f.id === id);
  if (!period) return res.status(404).json({ error: 'Fiscal period not found' });
  if (period.status !== 'Open') return res.status(400).json({ error: 'Only open periods can be closed' });

  period.status = 'Closed';
  period.closedBy = userId;
  period.closedAt = new Date().toISOString();
  logAudit(period.companyId, userId, userName, 'FISCAL_PERIOD_CLOSE', 'Accounting', `Closed fiscal period: ${period.name}`);
  res.json(period);
});

// 5.6 Opening Balances
app.get('/api/opening-balances', (req, res) => {
  const { companyId, periodId } = req.query;
  let filtered = openingBalances;
  if (companyId) filtered = filtered.filter(o => o.companyId === companyId);
  if (periodId) filtered = filtered.filter(o => o.periodId === periodId);
  res.json(filtered);
});

app.post('/api/opening-balances', (req, res) => {
  const { companyId, accountId, accountCode, accountName, periodId, debit, credit } = req.body;

  // Check if balance already exists for this account and period
  const existingIndex = openingBalances.findIndex(o => o.companyId === companyId && o.accountId === accountId && o.periodId === periodId);
  const newBalance: OpeningBalance = {
    id: existingIndex >= 0 ? openingBalances[existingIndex].id : `ob-${Date.now()}`,
    companyId,
    accountId,
    accountCode,
    accountName,
    periodId,
    debit: Number(debit) || 0,
    credit: Number(credit) || 0,
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    openingBalances[existingIndex] = newBalance;
  } else {
    openingBalances.push(newBalance);
  }

  logAudit(companyId, 'u-acme-finance', 'David Vance', 'OPENING_BALANCE_SET', 'Accounting', `Set opening balance for ${accountCode} - ${accountName}: DR $${debit} CR $${credit}`);
  res.status(201).json(newBalance);
});

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2 - AP / AR / Bank / Fixed Assets / Budgets / Cost Centers / Multi-Currency
// ═══════════════════════════════════════════════════════════════════════════

// --- Accounts Payable (Bills) ---
app.get('/api/bills', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? bills.filter(b => b.companyId === companyId) : bills);
});

app.post('/api/bills', (req, res) => {
  const { companyId, vendorName, vendorId, billNumber, invoiceDate, dueDate, description, subtotal, tax, total, createdBy, createdByName } = req.body;
  const newBill: Bill = {
    id: `bill-${Date.now()}`,
    companyId, vendorName, vendorId, billNumber, invoiceDate, dueDate, description,
    subtotal: Number(subtotal) || 0, tax: Number(tax) || 0, total: Number(total) || 0,
    amountPaid: 0, status: 'Pending', createdBy, createdByName,
    createdAt: new Date().toISOString()
  };
  bills.push(newBill);
  logAudit(companyId, createdBy, createdByName, 'CREATE_BILL', 'Accounting', `Created bill ${billNumber} from ${vendorName}: $${total}`);
  res.status(201).json(newBill);
});

app.post('/api/bills/:id/pay', (req, res) => {
  const { id } = req.params;
  const { amount, paymentDate, paymentMethod, reference, bankAccountId, createdBy } = req.body;
  const idx = bills.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Bill not found' });
  bills[idx].amountPaid += Number(amount);
  bills[idx].status = bills[idx].amountPaid >= bills[idx].total ? 'Paid' : 'Partially Paid';
  const payment: BillPayment = {
    id: `bp-${Date.now()}`, companyId: bills[idx].companyId, billId: id,
    amount: Number(amount), paymentDate, paymentMethod, reference, bankAccountId,
    createdBy, createdAt: new Date().toISOString()
  };
  billPayments.push(payment);
  // Update bank balance
  if (bankAccountId) {
    const baIdx = bankAccounts.findIndex(b => b.id === bankAccountId);
    if (baIdx !== -1) bankAccounts[baIdx].balance -= Number(amount);
  }
  logAudit(bills[idx].companyId, createdBy, 'System', 'PAY_BILL', 'Accounting', `Paid $${amount} on bill ${bills[idx].billNumber}`);
  res.json(bills[idx]);
});

app.post('/api/bills/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = bills.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Bill not found' });
  bills[idx].status = 'Approved';
  logAudit(bills[idx].companyId, userId, userName, 'APPROVE_BILL', 'Accounting', `Approved bill ${bills[idx].billNumber}`);
  res.json(bills[idx]);
});

// --- Accounts Receivable (Customer Payments) ---
app.get('/api/customer-payments', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? customerPayments.filter(p => p.companyId === companyId) : customerPayments);
});

app.post('/api/customer-payments', (req, res) => {
  const { companyId, invoiceId, customerName, amount, paymentDate, paymentMethod, reference, bankAccountId, createdBy } = req.body;
  const payment: CustomerPayment = {
    id: `cp-${Date.now()}`, companyId, invoiceId, customerName,
    amount: Number(amount), paymentDate, paymentMethod, reference, bankAccountId,
    createdBy, createdAt: new Date().toISOString()
  };
  customerPayments.push(payment);
  // Update invoice status
  const invIdx = invoices.findIndex(i => i.id === invoiceId);
  if (invIdx !== -1) {
    invoices[invIdx].status = 'Paid';
  }
  // Update bank balance
  if (bankAccountId) {
    const baIdx = bankAccounts.findIndex(b => b.id === bankAccountId);
    if (baIdx !== -1) bankAccounts[baIdx].balance += Number(amount);
  }
  logAudit(companyId, createdBy, 'System', 'RECEIVE_PAYMENT', 'Accounting', `Received $${amount} from ${customerName}`);
  res.status(201).json(payment);
});

// --- Bank Accounts ---
app.get('/api/bank-accounts', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? bankAccounts.filter(b => b.companyId === companyId) : bankAccounts);
});

app.post('/api/bank-accounts', (req, res) => {
  const { companyId, name, bankName, accountNumber, accountType, glAccountId } = req.body;
  const newAccount: BankAccount = {
    id: `ba-${Date.now()}`, companyId, name, bankName, accountNumber, accountType, glAccountId,
    balance: 0, isActive: true, createdAt: new Date().toISOString()
  };
  bankAccounts.push(newAccount);
  logAudit(companyId, 'u-acme-finance', 'David Vance', 'CREATE_BANK_ACCOUNT', 'Accounting', `Created bank account ${name}`);
  res.status(201).json(newAccount);
});

// --- Bank Transactions ---
app.get('/api/bank-transactions', (req, res) => {
  const { companyId, bankAccountId } = req.query;
  let filtered = bankTransactions;
  if (companyId) filtered = filtered.filter(t => t.companyId === companyId);
  if (bankAccountId) filtered = filtered.filter(t => t.bankAccountId === bankAccountId);
  res.json(filtered);
});

app.post('/api/bank-transactions', (req, res) => {
  const { companyId, bankAccountId, date, description, type, amount, reference, createdBy } = req.body;
  const tx: BankTransaction = {
    id: `btx-${Date.now()}`, companyId, bankAccountId, date, description, type,
    amount: Number(amount), reconciled: false, reference,
    createdAt: new Date().toISOString()
  };
  bankTransactions.push(tx);
  // Update bank balance
  const baIdx = bankAccounts.findIndex(b => b.id === bankAccountId);
  if (baIdx !== -1) {
    bankAccounts[baIdx].balance += type === 'Credit' ? Number(amount) : -Number(amount);
  }
  logAudit(companyId, createdBy, 'System', 'BANK_TRANSACTION', 'Accounting', `${type} $${amount}: ${description}`);
  res.status(201).json(tx);
});

// --- Bank Reconciliation ---
app.get('/api/bank-reconciliations', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? bankReconciliations.filter(r => r.companyId === companyId) : bankReconciliations);
});

app.post('/api/bank-reconciliations', (req, res) => {
  const { companyId, bankAccountId, periodStartDate, periodEndDate, statementBalance, reconciledTransactionIds, completedBy, completedByName } = req.body;
  const ba = bankAccounts.find(b => b.id === bankAccountId);
  const bookBalance = ba ? ba.balance : 0;
  const newRec: BankReconciliation = {
    id: `br-${Date.now()}`, companyId, bankAccountId, periodStartDate, periodEndDate,
    statementBalance: Number(statementBalance), bookBalance,
    reconciledDifference: Number(statementBalance) - bookBalance,
    status: Math.abs(Number(statementBalance) - bookBalance) < 0.01 ? 'Completed' : 'Discrepancy',
    reconciledTransactionIds: reconciledTransactionIds || [],
    completedBy, completedByName,
    completedAt: new Date().toISOString(), createdAt: new Date().toISOString()
  };
  bankReconciliations.push(newRec);
  // Mark transactions as reconciled
  (reconciledTransactionIds || []).forEach((txId: string) => {
    const txIdx = bankTransactions.findIndex(t => t.id === txId);
    if (txIdx !== -1) {
      bankTransactions[txIdx].reconciled = true;
      bankTransactions[txIdx].reconciledDate = periodEndDate;
    }
  });
  logAudit(companyId, completedBy, completedByName, 'BANK_RECONCILIATION', 'Accounting', `Reconciled ${bankAccountId} for period ending ${periodEndDate}`);
  res.status(201).json(newRec);
});

// --- Fixed Assets ---
app.get('/api/fixed-assets', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? fixedAssets.filter(a => a.companyId === companyId) : fixedAssets);
});

app.post('/api/fixed-assets', (req, res) => {
  const { companyId, assetCode, name, description, category, purchaseDate, purchasePrice, salvageValue, usefulLifeYears, depreciationMethod, location, createdBy } = req.body;
  const newAsset: FixedAsset = {
    id: `fa-${Date.now()}`, companyId, assetCode, name, description, category, purchaseDate,
    purchasePrice: Number(purchasePrice), salvageValue: Number(salvageValue),
    usefulLifeYears: Number(usefulLifeYears), depreciationMethod, accumulatedDepreciation: 0,
    currentBookValue: Number(purchasePrice), location, status: 'Active',
    createdAt: new Date().toISOString()
  };
  fixedAssets.push(newAsset);
  logAudit(companyId, createdBy, 'System', 'CREATE_FIXED_ASSET', 'Accounting', `Registered asset ${assetCode}: ${name}`);
  res.status(201).json(newAsset);
});

app.post('/api/fixed-assets/:id/dispose', (req, res) => {
  const { id } = req.params;
  const { disposalPrice, disposalDate, userId, userName } = req.body;
  const idx = fixedAssets.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
  fixedAssets[idx].status = 'Disposed';
  fixedAssets[idx].disposalDate = disposalDate;
  fixedAssets[idx].disposalPrice = Number(disposalPrice);
  logAudit(fixedAssets[idx].companyId, userId, userName, 'DISPOSE_ASSET', 'Accounting', `Disposed asset ${fixedAssets[idx].assetCode}: ${fixedAssets[idx].name}`);
  res.json(fixedAssets[idx]);
});

// --- Depreciation Entries ---
app.get('/api/depreciation-entries', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? depreciationEntries.filter(d => d.companyId === companyId) : depreciationEntries);
});

app.post('/api/depreciation-entries/run', (req, res) => {
  const { companyId, period, createdBy } = req.body;
  const activeAssets = fixedAssets.filter(a => a.companyId === companyId && a.status === 'Active');
  const newEntries: DepreciationEntry[] = [];
  activeAssets.forEach(asset => {
    const annualDep = (asset.purchasePrice - asset.salvageValue) / asset.usefulLifeYears;
    const monthlyDep = Math.round(annualDep / 12 * 100) / 100;
    const entry: DepreciationEntry = {
      id: `de-${Date.now()}-${asset.id}`, companyId, assetId: asset.id,
      assetCode: asset.assetCode, assetName: asset.name, period,
      depreciationAmount: monthlyDep,
      accumulatedDepreciation: asset.accumulatedDepreciation + monthlyDep,
      bookValue: asset.currentBookValue - monthlyDep,
      status: 'Draft', createdAt: new Date().toISOString()
    };
    depreciationEntries.push(entry);
    newEntries.push(entry);
    // Update asset
    const aIdx = fixedAssets.findIndex(a => a.id === asset.id);
    if (aIdx !== -1) {
      fixedAssets[aIdx].accumulatedDepreciation += monthlyDep;
      fixedAssets[aIdx].currentBookValue -= monthlyDep;
      if (fixedAssets[aIdx].currentBookValue <= fixedAssets[aIdx].salvageValue) {
        fixedAssets[aIdx].status = 'Fully Depreciated';
      }
    }
  });
  logAudit(companyId, createdBy, 'System', 'RUN_DEPRECIATION', 'Accounting', `Ran depreciation for ${activeAssets.length} assets - ${period}`);
  res.status(201).json(newEntries);
});

app.post('/api/depreciation-entries/:id/post', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = depreciationEntries.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Depreciation entry not found' });
  depreciationEntries[idx].status = 'Posted';
  logAudit(depreciationEntries[idx].companyId, userId, userName, 'POST_DEPRECIATION', 'Accounting', `Posted depreciation for ${depreciationEntries[idx].assetCode}`);
  res.json(depreciationEntries[idx]);
});

// --- Budgets ---
app.get('/api/budgets', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? budgets.filter(b => b.companyId === companyId) : budgets);
});

app.post('/api/budgets', (req, res) => {
  const { companyId, name, fiscalYear, glAccountId, accountCode, accountName, budgetAmount, period, createdBy } = req.body;
  const newBudget: Budget = {
    id: `bud-${Date.now()}`, companyId, name, fiscalYear, glAccountId, accountCode, accountName,
    budgetAmount: Number(budgetAmount), actualAmount: 0, variance: Number(budgetAmount),
    variancePercent: 100, period, status: 'Draft', createdBy,
    createdAt: new Date().toISOString()
  };
  budgets.push(newBudget);
  logAudit(companyId, createdBy, 'System', 'CREATE_BUDGET', 'Accounting', `Created budget ${name}: $${budgetAmount}`);
  res.status(201).json(newBudget);
});

app.post('/api/budgets/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = budgets.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  budgets[idx].status = 'Approved';
  budgets[idx].status = 'Active';
  logAudit(budgets[idx].companyId, userId, userName, 'APPROVE_BUDGET', 'Accounting', `Approved budget ${budgets[idx].name}`);
  res.json(budgets[idx]);
});

// --- Cost Centers ---
app.get('/api/cost-centers', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? costCenters.filter(c => c.companyId === companyId) : costCenters);
});

app.post('/api/cost-centers', (req, res) => {
  const { companyId, code, name, departmentId, departmentName, managerName, budget, createdBy } = req.body;
  const newCC: CostCenter = {
    id: `cc-${Date.now()}`, companyId, code, name, departmentId, departmentName, managerName,
    budget: Number(budget), actualSpend: 0, status: 'Active',
    createdAt: new Date().toISOString()
  };
  costCenters.push(newCC);
  logAudit(companyId, createdBy, 'System', 'CREATE_COST_CENTER', 'Accounting', `Created cost center ${code}: ${name}`);
  res.status(201).json(newCC);
});

// --- Multi-Currency ---
app.get('/api/currency-rates', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? currencyRates.filter(r => r.companyId === companyId) : currencyRates);
});

app.post('/api/currency-rates', (req, res) => {
  const { companyId, baseCurrency, targetCurrency, rate, source, createdBy } = req.body;
  const newRate: CurrencyRate = {
    id: `cr-${Date.now()}`, companyId, baseCurrency, targetCurrency,
    rate: Number(rate), effectiveDate: new Date().toISOString().split('T')[0],
    source, createdAt: new Date().toISOString()
  };
  currencyRates.push(newRate);
  logAudit(companyId, createdBy, 'System', 'UPDATE_CURRENCY_RATE', 'Accounting', `Updated ${baseCurrency}/${targetCurrency} rate: ${rate}`);
  res.status(201).json(newRate);
});

app.post('/api/currency-rates/convert', (req, res) => {
  const { companyId, amount, fromCurrency, toCurrency } = req.body;
  const rate = currencyRates.find(r => r.companyId === companyId && r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency);
  if (!rate) return res.status(404).json({ error: 'Exchange rate not found' });
  res.json({ amount: Number(amount), fromCurrency, toCurrency, rate: rate.rate, convertedAmount: Math.round(Number(amount) * rate.rate * 100) / 100 });
});

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3 - Tax / Intercompany / Compliance / Audit / Reporting
// ═══════════════════════════════════════════════════════════════════════════

// --- Tax Codes ---
app.get('/api/tax-codes', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? taxCodes.filter(t => t.companyId === companyId) : taxCodes);
});

app.post('/api/tax-codes', (req, res) => {
  const { companyId, code, name, rate, type, glAccountId, createdBy } = req.body;
  const newCode: TaxCode = {
    id: `tc-${Date.now()}`, companyId, code, name, rate: Number(rate), type, glAccountId,
    isActive: true, createdAt: new Date().toISOString()
  };
  taxCodes.push(newCode);
  logAudit(companyId, createdBy, 'System', 'CREATE_TAX_CODE', 'Accounting', `Created tax code ${code}: ${name} (${rate}%)`);
  res.status(201).json(newCode);
});

// --- Tax Returns ---
app.get('/api/tax-returns', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? taxReturns.filter(t => t.companyId === companyId) : taxReturns);
});

app.post('/api/tax-returns', (req, res) => {
  const { companyId, period, taxCodeId, taxCodeName, taxableAmount, taxAmount, dueDate, createdBy } = req.body;
  const newReturn: TaxReturn = {
    id: `tr-${Date.now()}`, companyId, period, taxCodeId, taxCodeName,
    taxableAmount: Number(taxableAmount), taxAmount: Number(taxAmount),
    status: 'Draft', dueDate, createdBy, createdAt: new Date().toISOString()
  };
  taxReturns.push(newReturn);
  logAudit(companyId, createdBy, 'System', 'CREATE_TAX_RETURN', 'Accounting', `Created tax return for ${period}: $${taxAmount}`);
  res.status(201).json(newReturn);
});

app.post('/api/tax-returns/:id/file', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = taxReturns.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tax return not found' });
  taxReturns[idx].status = 'Filed';
  taxReturns[idx].filedDate = new Date().toISOString().split('T')[0];
  logAudit(taxReturns[idx].companyId, userId, userName, 'FILE_TAX_RETURN', 'Accounting', `Filed tax return ${taxReturns[idx].period}`);
  res.json(taxReturns[idx]);
});

// --- Intercompany Transactions ---
app.get('/api/intercompany-transactions', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? intercompanyTxns.filter(t => t.companyId === companyId || t.fromCompanyId === companyId || t.toCompanyId === companyId) : intercompanyTxns);
});

app.post('/api/intercompany-transactions', (req, res) => {
  const { companyId, fromCompanyId, fromCompanyName, toCompanyId, toCompanyName, type, amount, description, createdBy } = req.body;
  const newTx: IntercompanyTransaction = {
    id: `ic-${Date.now()}`, companyId, fromCompanyId, fromCompanyName, toCompanyId, toCompanyName,
    type, amount: Number(amount), description, status: 'Pending',
    createdBy, createdAt: new Date().toISOString()
  };
  intercompanyTxns.push(newTx);
  logAudit(companyId, createdBy, 'System', 'CREATE_INTERCOMPANY', 'Accounting', `Created intercompany ${type}: $${amount} from ${fromCompanyName} to ${toCompanyName}`);
  res.status(201).json(newTx);
});

app.post('/api/intercompany-transactions/:id/approve', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = intercompanyTxns.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  intercompanyTxns[idx].status = 'Approved';
  logAudit(intercompanyTxns[idx].companyId, userId, userName, 'APPROVE_INTERCOMPANY', 'Accounting', `Approved intercompany transaction ${id}`);
  res.json(intercompanyTxns[idx]);
});

app.post('/api/intercompany-transactions/:id/eliminate', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = intercompanyTxns.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  intercompanyTxns[idx].status = 'Eliminated';
  intercompanyTxns[idx].eliminationEntryId = `elim-${Date.now()}`;
  logAudit(intercompanyTxns[idx].companyId, userId, userName, 'ELIMINATE_INTERCOMPANY', 'Accounting', `Eliminated intercompany transaction ${id}`);
  res.json(intercompanyTxns[idx]);
});

// --- Consolidation Rules ---
app.get('/api/consolidation-rules', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? consolidationRules.filter(r => r.companyId === companyId) : consolidationRules);
});

app.post('/api/consolidation-rules', (req, res) => {
  const { companyId, subsidiaryId, subsidiaryName, eliminationAccount, minorityInterestPct, createdBy } = req.body;
  const newRule: ConsolidationRule = {
    id: `constr-${Date.now()}`, companyId, subsidiaryId, subsidiaryName, eliminationAccount,
    minorityInterestPct: Number(minorityInterestPct), isActive: true,
    createdAt: new Date().toISOString()
  };
  consolidationRules.push(newRule);
  logAudit(companyId, createdBy, 'System', 'CREATE_CONSOLIDATION_RULE', 'Accounting', `Created consolidation rule for ${subsidiaryName}`);
  res.status(201).json(newRule);
});

// --- Compliance Checks ---
app.get('/api/compliance-checks', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? complianceChecks.filter(c => c.companyId === companyId) : complianceChecks);
});

app.post('/api/compliance-checks', (req, res) => {
  const { companyId, category, title, description, dueDate, assignee, assigneeName, createdBy } = req.body;
  const newCheck: ComplianceCheck = {
    id: `comp-${Date.now()}`, companyId, category, title, description,
    status: 'Open', dueDate, assignee, assigneeName,
    createdAt: new Date().toISOString()
  };
  complianceChecks.push(newCheck);
  logAudit(companyId, createdBy, 'System', 'CREATE_COMPLIANCE_CHECK', 'Compliance', `Created compliance check: ${title}`);
  res.status(201).json(newCheck);
});

app.post('/api/compliance-checks/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { status, userId, userName } = req.body;
  const idx = complianceChecks.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Compliance check not found' });
  complianceChecks[idx].status = status || 'Compliant';
  complianceChecks[idx].lastChecked = new Date().toISOString().split('T')[0];
  logAudit(complianceChecks[idx].companyId, userId, userName, 'RESOLVE_COMPLIANCE', 'Compliance', `Resolved compliance check: ${complianceChecks[idx].title}`);
  res.json(complianceChecks[idx]);
});

// --- Audit Snapshots ---
app.get('/api/audit-snapshots', (req, res) => {
  const { companyId, entityType, entityId } = req.query;
  let filtered = auditSnapshots;
  if (companyId) filtered = filtered.filter(s => s.companyId === companyId);
  if (entityType) filtered = filtered.filter(s => s.entityType === entityType);
  if (entityId) filtered = filtered.filter(s => s.entityId === entityId);
  res.json(filtered);
});

// --- Policy Documents ---
app.get('/api/policy-documents', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? policyDocuments.filter(p => p.companyId === companyId) : policyDocuments);
});

app.post('/api/policy-documents', (req, res) => {
  const { companyId, title, category, version, content, dueDate, createdBy } = req.body;
  const newPolicy: PolicyDocument = {
    id: `pd-${Date.now()}`, companyId, title, category, version, content,
    acknowledgedBy: [], totalEmployees: 0, dueDate,
    createdAt: new Date().toISOString()
  };
  policyDocuments.push(newPolicy);
  logAudit(companyId, createdBy, 'System', 'CREATE_POLICY', 'Compliance', `Created policy document: ${title}`);
  res.status(201).json(newPolicy);
});

app.post('/api/policy-documents/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body;
  const idx = policyDocuments.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Policy not found' });
  if (!policyDocuments[idx].acknowledgedBy.includes(employeeId)) {
    policyDocuments[idx].acknowledgedBy.push(employeeId);
  }
  res.json(policyDocuments[idx]);
});

// --- Filing Deadlines ---
app.get('/api/filing-deadlines', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? filingDeadlines.filter(f => f.companyId === companyId) : filingDeadlines);
});

app.post('/api/filing-deadlines', (req, res) => {
  const { companyId, filingType, jurisdiction, dueDate, assignee, assigneeName, notes, createdBy } = req.body;
  const newFiling: FilingDeadline = {
    id: `fd-${Date.now()}`, companyId, filingType, jurisdiction, dueDate,
    status: 'Upcoming', assignee, assigneeName, notes,
    createdAt: new Date().toISOString()
  };
  filingDeadlines.push(newFiling);
  logAudit(companyId, createdBy, 'System', 'CREATE_FILING', 'Compliance', `Created filing deadline: ${filingType} - ${jurisdiction}`);
  res.status(201).json(newFiling);
});

app.post('/api/filing-deadlines/:id/file', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const idx = filingDeadlines.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Filing deadline not found' });
  filingDeadlines[idx].status = 'Filed';
  logAudit(filingDeadlines[idx].companyId, userId, userName, 'FILE_DEADLINE', 'Compliance', `Filed: ${filingDeadlines[idx].filingType}`);
  res.json(filingDeadlines[idx]);
});

// --- Advanced Reporting ---
app.get('/api/reports/profit-loss', (req, res) => {
  const { companyId, period } = req.query;
  const companyGL = glAccounts.filter(g => g.companyId === companyId);
  const revenue = companyGL.filter(a => a.type === 'Revenue').map(a => ({ account: a.name, code: a.code, amount: Math.abs(a.balance) }));
  const expenses = companyGL.filter(a => a.type === 'Expense').map(a => ({ account: a.name, code: a.code, amount: a.balance }));
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  res.json({ period: period || 'Q3 2026', revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses });
});

app.get('/api/reports/balance-sheet', (req, res) => {
  const { companyId } = req.query;
  const companyGL = glAccounts.filter(g => g.companyId === companyId);
  const assets = companyGL.filter(a => a.type === 'Asset').map(a => ({ account: a.name, code: a.code, amount: a.balance }));
  const liabilities = companyGL.filter(a => a.type === 'Liability').map(a => ({ account: a.name, code: a.code, amount: a.balance }));
  const equity = companyGL.filter(a => a.type === 'Equity').map(a => ({ account: a.name, code: a.code, amount: a.balance }));
  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const totalEquity = equity.reduce((s, e) => s + e.amount, 0);
  res.json({ assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity });
});

app.get('/api/reports/cash-flow', (req, res) => {
  const { companyId } = req.query;
  const companyJE = journalEntries.filter(j => j.companyId === companyId && j.status === 'Posted');
  const operating = companyJE.filter(j => j.description.toLowerCase().includes('revenue') || j.description.toLowerCase().includes('expense') || j.description.toLowerCase().includes('payroll'))
    .reduce((s, j) => s + j.totalDebit - j.totalCredit, 0);
  const investing = -5000;
  const financing = -12000;
  res.json({ operating, investing, financing, netCashFlow: operating + investing + financing, period: 'Q3 2026' });
});

app.get('/api/reports/aging', (req, res) => {
  const { companyId, type } = req.query;
  if (type === 'ar') {
    const outstanding = invoices.filter(i => i.companyId === companyId && i.status !== 'Paid' && i.status !== 'Void');
    const aging = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
    outstanding.forEach(inv => {
      const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
      if (days <= 0) aging.current += inv.total;
      else if (days <= 30) aging.days30 += inv.total;
      else if (days <= 60) aging.days60 += inv.total;
      else if (days <= 90) aging.days90 += inv.total;
      else aging.over90 += inv.total;
    });
    res.json({ type: 'AR', aging, total: outstanding.reduce((s, i) => s + i.total, 0), count: outstanding.length });
  } else {
    const outstanding = bills.filter(b => b.companyId === companyId && b.status !== 'Paid' && b.status !== 'Void');
    const aging = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
    outstanding.forEach(bill => {
      const days = Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / 86400000);
      const owed = bill.total - bill.amountPaid;
      if (days <= 0) aging.current += owed;
      else if (days <= 30) aging.days30 += owed;
      else if (days <= 60) aging.days60 += owed;
      else if (days <= 90) aging.days90 += owed;
      else aging.over90 += owed;
    });
    res.json({ type: 'AP', aging, total: outstanding.reduce((s, b) => s + (b.total - b.amountPaid), 0), count: outstanding.length });
  }
});

// 6. Inventory Items
app.get('/api/inventory', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? inventory.filter(i => i.companyId === companyId) : inventory);
});

app.post('/api/inventory/adjust', (req, res) => {
  const { id, adjustment, companyId } = req.body;
  const itemIndex = inventory.findIndex(i => i.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const oldStock = inventory[itemIndex].stockLevel;
  inventory[itemIndex].stockLevel = Math.max(0, inventory[itemIndex].stockLevel + Number(adjustment));

  logAudit(companyId, 'u-acme-inventory', 'Marcus Brody', 'STOCK_ADJUST', 'Inventory', `Adjusted SKU ${inventory[itemIndex].sku} stock level by ${adjustment} (from ${oldStock} to ${inventory[itemIndex].stockLevel})`);

  // Low stock trigger automation dispatch
  let lowStockAlert = false;
  if (inventory[itemIndex].stockLevel <= inventory[itemIndex].minStockLevel) {
    lowStockAlert = true;
    console.log(`[LOW STOCK AUTOMATION TRIGGERED] Creating purchase order request draft with Supplier: ${inventory[itemIndex].supplier}`);
  }

  res.json({
    item: inventory[itemIndex],
    lowStockAlert
  });
});

// 7. Support Tickets
app.get('/api/tickets', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? tickets.filter(t => t.companyId === companyId) : tickets);
});

app.post('/api/tickets', (req, res) => {
  const { companyId, customerName, customerEmail, subject, description, category, priority } = req.body;
  const ticketId = `tick-${Date.now()}`;
  const tktNumber = `TKT-10${Math.floor(10 + Math.random() * 89)}`;

  const newTicket: SupportTicket = {
    id: ticketId,
    companyId,
    ticketNumber: tktNumber,
    customerName,
    customerEmail,
    subject,
    description,
    category,
    priority,
    status: 'Open',
    assignedTo: 'u-acme-admin',
    createdAt: new Date().toISOString()
  };

  tickets.push(newTicket);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'TICKET_CREATE', 'Help Desk', `Received support ticket ${tktNumber} from ${customerName}. Category: ${category}`);

  res.status(201).json(newTicket);
});

// 8. Workflows (Automation Builder)
app.get('/api/workflows', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? workflows.filter(w => w.companyId === companyId) : workflows);
});

app.post('/api/workflows', (req, res) => {
  const { companyId, name, description, blocks } = req.body;
  const newWf: ERPWorkflow = {
    id: `wf-${Date.now()}`,
    companyId,
    name,
    description,
    isActive: true,
    blocks: blocks || [],
    createdAt: new Date().toISOString()
  };
  workflows.push(newWf);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'WORKFLOW_CREATE', 'Administration', `Configured cross-module workflow: ${name}`);
  res.status(201).json(newWf);
});

// 9. API Keys settings
app.get('/api/apikeys', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? apiKeys.filter(k => k.companyId === companyId) : apiKeys);
});

app.post('/api/apikeys', (req, res) => {
  const { companyId, name, permissions } = req.body;
  const newKey: APIKey = {
    id: `key-${Date.now()}`,
    companyId,
    name,
    key: `erp_live_sec_${Math.random().toString(16).substring(2, 18)}`,
    permissions: permissions || 'Read Only',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  apiKeys.push(newKey);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'API_KEY_GENERATE', 'Administration', `Generated Public API Key: ${name}`);
  res.status(201).json(newKey);
});

// --- POS MODULE API ROUTES ---

// 1. POS Categories
app.get('/api/pos/categories', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? posCategories.filter(c => c.companyId === companyId) : posCategories);
});

app.post('/api/pos/categories', (req, res) => {
  const { companyId, name, description, parentId, color, icon } = req.body;
  const newCategory: POSCategory = {
    id: `pos-cat-${Date.now()}`,
    companyId,
    name,
    description,
    parentId,
    color,
    icon,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  posCategories.push(newCategory);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_CATEGORY', 'POS', `Created category: ${name}`);
  res.status(201).json(newCategory);
});

// 2. POS Products
app.get('/api/pos/products', (req, res) => {
  const { companyId, category, isActive } = req.query;
  let filtered = posProducts;
  if (companyId) filtered = filtered.filter(p => p.companyId === companyId);
  if (category) filtered = filtered.filter(p => p.category === category);
  if (isActive !== undefined) filtered = filtered.filter(p => p.isActive === (isActive === 'true'));
  res.json(filtered);
});

app.post('/api/pos/products', (req, res) => {
  const { companyId, sku, name, description, category, barcode, unitPrice, costPrice, taxRate, discountPrice, discountStartDate, discountEndDate, image, stockLevel, reorderLevel } = req.body;
  const newProduct: POSProduct = {
    id: `pos-prod-${Date.now()}`,
    companyId,
    sku,
    name,
    description,
    category,
    barcode,
    unitPrice: Number(unitPrice),
    costPrice: Number(costPrice),
    taxRate: Number(taxRate),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    discountStartDate,
    discountEndDate,
    image,
    isActive: true,
    stockLevel: Number(stockLevel),
    reorderLevel: Number(reorderLevel),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  posProducts.push(newProduct);

  // Update inventory if exists
  const existingInventory = inventory.find(i => i.sku === sku);
  if (existingInventory) {
    existingInventory.stockLevel = Number(stockLevel);
  } else {
    inventory.push({
      id: `inv-${Date.now()}`,
      companyId,
      sku,
      name,
      category,
      warehouse: 'Main Store',
      stockLevel: Number(stockLevel),
      minStockLevel: Number(reorderLevel),
      unitPrice: Number(unitPrice),
      supplier: 'Default Supplier'
    });
  }

  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_PRODUCT', 'POS', `Created product: ${name} (${sku})`);
  res.status(201).json(newProduct);
});

app.put('/api/pos/products/:id', (req, res) => {
  const { id } = req.params;
  const index = posProducts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  posProducts[index] = {
    ...posProducts[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // Sync with inventory
  const invIndex = inventory.findIndex(i => i.sku === posProducts[index].sku);
  if (invIndex !== -1) {
    inventory[invIndex].stockLevel = posProducts[index].stockLevel;
    inventory[invIndex].unitPrice = posProducts[index].unitPrice;
  }

  logAudit(posProducts[index].companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_PRODUCT', 'POS', `Updated product: ${posProducts[index].name}`);
  res.json(posProducts[index]);
});

// 3. POS Terminals
app.get('/api/pos/terminals', (req, res) => {
  const { companyId, branchId } = req.query;
  let filtered = posTerminals;
  if (companyId) filtered = filtered.filter(t => t.companyId === companyId);
  if (branchId) filtered = filtered.filter(t => t.branchId === branchId);
  res.json(filtered);
});

app.post('/api/pos/terminals', (req, res) => {
  const { companyId, name, location, branchId } = req.body;
  const newTerminal: POSTerminal = {
    id: `pos-term-${Date.now()}`,
    companyId,
    name,
    location,
    branchId,
    isActive: true,
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  posTerminals.push(newTerminal);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_TERMINAL', 'POS', `Created terminal: ${name}`);
  res.status(201).json(newTerminal);
});

// 4. POS Customers
app.get('/api/pos/customers', (req, res) => {
  const { companyId, search } = req.query;
  let filtered = posCustomers;
  if (companyId) filtered = filtered.filter(c => c.companyId === companyId);
  if (search) {
    const searchLower = search.toString().toLowerCase();
    filtered = filtered.filter(c =>
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower)
    );
  }
  res.json(filtered);
});

app.post('/api/pos/customers', (req, res) => {
  const { companyId, firstName, lastName, email, phone, dateOfBirth, address, notes } = req.body;
  const newCustomer: POSCustomer = {
    id: `pos-cust-${Date.now()}`,
    companyId,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    address,
    loyaltyPoints: 0,
    tier: 'Bronze',
    totalPurchases: 0,
    totalSpent: 0,
    storeCredit: 0,
    notes,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  posCustomers.push(newCustomer);

  // Sync with CRM leads if possible
  leads.push({
    id: `lead-${Date.now()}`,
    companyId,
    firstName,
    lastName,
    email: email || '',
    phone: phone || '',
    companyName: 'POS Customer',
    status: 'Qualified',
    source: 'In-Store',
    value: 0,
    createdAt: new Date().toISOString()
  });

  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_CUSTOMER', 'POS', `Created customer: ${firstName} ${lastName}`);
  res.status(201).json(newCustomer);
});

app.put('/api/pos/customers/:id', (req, res) => {
  const { id } = req.params;
  const index = posCustomers.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  posCustomers[index] = {
    ...posCustomers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  logAudit(posCustomers[index].companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_CUSTOMER', 'POS', `Updated customer: ${posCustomers[index].firstName} ${posCustomers[index].lastName}`);
  res.json(posCustomers[index]);
});

// 5. POS Shifts
app.get('/api/pos/shifts', (req, res) => {
  const { companyId, terminalId, status } = req.query;
  let filtered = posShifts;
  if (companyId) filtered = filtered.filter(s => s.companyId === companyId);
  if (terminalId) filtered = filtered.filter(s => s.terminalId === terminalId);
  if (status) filtered = filtered.filter(s => s.status === status);
  res.json(filtered);
});

app.post('/api/pos/shifts', (req, res) => {
  const { companyId, terminalId, employeeId, employeeName, openingBalance } = req.body;
  const newShift: POSShift = {
    id: `pos-shift-${Date.now()}`,
    companyId,
    terminalId,
    employeeId,
    employeeName,
    startTime: new Date().toISOString(),
    openingBalance: Number(openingBalance),
    cashSales: 0,
    cardSales: 0,
    digitalWalletSales: 0,
    storeCreditSales: 0,
    totalSales: 0,
    refunds: 0,
    status: 'Open',
    createdAt: new Date().toISOString()
  };
  posShifts.push(newShift);
  logAudit(companyId, employeeId, employeeName, 'START_POS_SHIFT', 'POS', `Started shift at terminal ${terminalId}`);
  res.status(201).json(newShift);
});

app.post('/api/pos/shifts/:id/close', (req, res) => {
  const { id } = req.params;
  const { closingBalance, notes } = req.body;
  const index = posShifts.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Shift not found' });

  posShifts[index] = {
    ...posShifts[index],
    endTime: new Date().toISOString(),
    closingBalance: Number(closingBalance),
    status: 'Closed',
    notes
  };

  logAudit(posShifts[index].companyId, posShifts[index].employeeId, posShifts[index].employeeName, 'CLOSE_POS_SHIFT', 'POS', `Closed shift - Sales: $${posShifts[index].totalSales}`);
  res.json(posShifts[index]);
});

// 6. POS Sales
app.get('/api/pos/sales', (req, res) => {
  const { companyId, terminalId, shiftId, startDate, endDate } = req.query;
  let filtered = posSales;
  if (companyId) filtered = filtered.filter(s => s.companyId === companyId);
  if (terminalId) filtered = filtered.filter(s => s.terminalId === terminalId);
  if (shiftId) filtered = filtered.filter(s => s.shiftId === shiftId);
  if (startDate) filtered = filtered.filter(s => s.date >= startDate.toString());
  if (endDate) filtered = filtered.filter(s => s.date <= endDate.toString());
  res.json(filtered);
});

app.post('/api/pos/sales', (req, res) => {
  const { companyId, terminalId, shiftId, employeeId, employeeName, customerId, customerName, items, payments, notes } = req.body;

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
  const discount = items.reduce((sum: number, item: any) => sum + (item.discount || 0), 0);
  const tax = items.reduce((sum: number, item: any) => sum + (item.tax || 0), 0);
  const total = subtotal + tax - discount;

  const saleNumber = `SALE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newSale: POSSale = {
    id: `pos-sale-${Date.now()}`,
    companyId,
    terminalId,
    shiftId,
    employeeId,
    employeeName,
    customerId,
    customerName,
    saleNumber,
    date: new Date().toISOString(),
    subtotal,
    tax,
    discount,
    total,
    paymentMethod: payments[0]?.method || 'Cash',
    paymentStatus: 'Paid',
    status: 'Completed',
    items,
    payments,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posSales.push(newSale);

  // Update shift totals
  const shiftIndex = posShifts.findIndex(s => s.id === shiftId);
  if (shiftIndex !== -1) {
    posShifts[shiftIndex].totalSales += total;
    posShifts[shiftIndex].cashSales += payments.filter((p: any) => p.method === 'Cash').reduce((sum: number, p: any) => sum + p.amount, 0);
    posShifts[shiftIndex].cardSales += payments.filter((p: any) => p.method === 'Card').reduce((sum: number, p: any) => sum + p.amount, 0);
    posShifts[shiftIndex].digitalWalletSales += payments.filter((p: any) => p.method === 'Digital Wallet').reduce((sum: number, p: any) => sum + p.amount, 0);
    posShifts[shiftIndex].storeCreditSales += payments.filter((p: any) => p.method === 'Store Credit').reduce((sum: number, p: any) => sum + p.amount, 0);
  }

  // Update product stock
  items.forEach((item: any) => {
    const prodIndex = posProducts.findIndex(p => p.id === item.productId);
    if (prodIndex !== -1) {
      posProducts[prodIndex].stockLevel -= item.quantity;
      posProducts[prodIndex].updatedAt = new Date().toISOString();
    }

    // Update inventory
    const invIndex = inventory.findIndex(i => i.sku === item.sku);
    if (invIndex !== -1) {
      inventory[invIndex].stockLevel -= item.quantity;
    }
  });

  // Update customer
  if (customerId) {
    const custIndex = posCustomers.findIndex(c => c.id === customerId);
    if (custIndex !== -1) {
      posCustomers[custIndex].totalPurchases += 1;
      posCustomers[custIndex].totalSpent += total;
      posCustomers[custIndex].loyaltyPoints += Math.floor(total / 10); // 1 point per $10
      posCustomers[custIndex].updatedAt = new Date().toISOString();

      // Update tier
      if (posCustomers[custIndex].loyaltyPoints >= 5000) posCustomers[custIndex].tier = 'Platinum';
      else if (posCustomers[custIndex].loyaltyPoints >= 2000) posCustomers[custIndex].tier = 'Gold';
      else if (posCustomers[custIndex].loyaltyPoints >= 1000) posCustomers[custIndex].tier = 'Silver';
    }
  }

  // Post to accounting
  const salesAccountId = glAccounts.find(a => a.companyId === companyId && a.type === 'Revenue')?.id;
  if (salesAccountId) {
    glAccounts.push({
      id: `txn-${Date.now()}`,
      companyId,
      accountId: salesAccountId,
      date: new Date().toISOString().split('T')[0],
      description: `POS Sale ${saleNumber}`,
      type: 'Credit',
      amount: total,
      reference: saleNumber
    } as any);
  }

  logAudit(companyId, employeeId, employeeName, 'CREATE_POS_SALE', 'POS', `Sale ${saleNumber} - Total: $${total}`);
  res.status(201).json(newSale);
});

app.post('/api/pos/sales/:id/void', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const index = posSales.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Sale not found' });

  // Restore stock
  posSales[index].items.forEach(item => {
    const prodIndex = posProducts.findIndex(p => p.id === item.productId);
    if (prodIndex !== -1) {
      posProducts[prodIndex].stockLevel += item.quantity;
      posProducts[prodIndex].updatedAt = new Date().toISOString();
    }

    const invIndex = inventory.findIndex(i => i.sku === item.sku);
    if (invIndex !== -1) {
      inventory[invIndex].stockLevel += item.quantity;
    }
  });

  posSales[index].status = 'Void';
  posSales[index].updatedAt = new Date().toISOString();

  logAudit(posSales[index].companyId, posSales[index].employeeId, posSales[index].employeeName, 'VOID_POS_SALE', 'POS', `Voided sale ${posSales[index].saleNumber} - Reason: ${reason}`);
  res.json(posSales[index]);
});

// 7. POS Discounts
app.get('/api/pos/discounts', (req, res) => {
  const { companyId, isActive } = req.query;
  let filtered = posDiscounts;
  if (companyId) filtered = filtered.filter(d => d.companyId === companyId);
  if (isActive !== undefined) filtered = filtered.filter(d => d.isActive === (isActive === 'true'));
  res.json(filtered);
});

app.post('/api/pos/discounts', (req, res) => {
  const { companyId, name, type, value, applicableProducts, applicableCategories, minPurchaseAmount, maxDiscountAmount, startDate, endDate, maxUsage } = req.body;
  const newDiscount: POSDiscount = {
    id: `pos-disc-${Date.now()}`,
    companyId,
    name,
    type,
    value: Number(value),
    applicableProducts,
    applicableCategories,
    minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
    startDate,
    endDate,
    isActive: true,
    usageCount: 0,
    maxUsage: maxUsage ? Number(maxUsage) : undefined,
    createdAt: new Date().toISOString()
  };
  posDiscounts.push(newDiscount);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_DISCOUNT', 'POS', `Created discount: ${name}`);
  res.status(201).json(newDiscount);
});

app.put('/api/pos/discounts/:id', (req, res) => {
  const { id } = req.params;
  const index = posDiscounts.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ error: 'Discount not found' });

  posDiscounts[index] = {
    ...posDiscounts[index],
    ...req.body
  };

  logAudit(posDiscounts[index].companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_DISCOUNT', 'POS', `Updated discount: ${posDiscounts[index].name}`);
  res.json(posDiscounts[index]);
});

// 8. POS Returns
app.get('/api/pos/returns', (req, res) => {
  const { companyId, terminalId, startDate, endDate } = req.query;
  let filtered = posReturns;
  if (companyId) filtered = filtered.filter(r => r.companyId === companyId);
  if (terminalId) filtered = filtered.filter(r => r.terminalId === terminalId);
  if (startDate) filtered = filtered.filter(r => r.date >= startDate.toString());
  if (endDate) filtered = filtered.filter(r => r.date <= endDate.toString());
  res.json(filtered);
});

app.post('/api/pos/returns', (req, res) => {
  const { companyId, terminalId, employeeId, employeeName, customerId, customerName, originalSaleId, originalSaleNumber, items, refundMethod, reason, notes } = req.body;

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
  const tax = items.reduce((sum: number, item: any) => sum + (item.tax || 0), 0);
  const total = subtotal + tax;

  const returnNumber = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReturn: POSReturn = {
    id: `pos-ret-${Date.now()}`,
    companyId,
    terminalId,
    employeeId,
    employeeName,
    customerId,
    customerName,
    originalSaleId,
    originalSaleNumber,
    returnNumber,
    date: new Date().toISOString(),
    items,
    subtotal,
    tax,
    total,
    refundMethod,
    refundStatus: 'Pending',
    reason,
    notes,
    createdAt: new Date().toISOString()
  };

  posReturns.push(newReturn);
  logAudit(companyId, employeeId, employeeName, 'CREATE_POS_RETURN', 'POS', `Return ${returnNumber} - Original sale: ${originalSaleNumber}`);
  res.status(201).json(newReturn);
});

app.post('/api/pos/returns/:id/approve', (req, res) => {
  const { id } = req.params;
  const index = posReturns.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Return not found' });

  // Restore stock
  posReturns[index].items.forEach(item => {
    const prodIndex = posProducts.findIndex(p => p.id === item.productId);
    if (prodIndex !== -1) {
      posProducts[prodIndex].stockLevel += item.quantity;
      posProducts[prodIndex].updatedAt = new Date().toISOString();
    }

    const invIndex = inventory.findIndex(i => i.sku === item.sku);
    if (invIndex !== -1) {
      inventory[invIndex].stockLevel += item.quantity;
    }
  });

  // Process refund to customer
  if (posReturns[index].customerId) {
    const custIndex = posCustomers.findIndex(c => c.id === posReturns[index].customerId);
    if (custIndex !== -1 && posReturns[index].refundMethod === 'Store Credit') {
      posCustomers[custIndex].storeCredit += posReturns[index].total;
      posCustomers[custIndex].updatedAt = new Date().toISOString();
    }
  }

  // Update shift
  const shiftIndex = posShifts.findIndex(s => s.id === posShifts.find(s => s.terminalId === posReturns[index].terminalId && s.status === 'Open')?.id);
  if (shiftIndex !== -1) {
    posShifts[shiftIndex].refunds += posReturns[index].total;
  }

  posReturns[index].refundStatus = 'Processed';
  posReturns[index].processedAt = new Date().toISOString();

  logAudit(posReturns[index].companyId, posReturns[index].employeeId, posReturns[index].employeeName, 'APPROVE_POS_RETURN', 'POS', `Approved return ${posReturns[index].returnNumber} - $${posReturns[index].total}`);
  res.json(posReturns[index]);
});

// 9. POS Reports
app.get('/api/pos/reports/daily', (req, res) => {
  const { companyId, branchId, terminalId, date } = req.query;
  let filtered = posDailyReports;
  if (companyId) filtered = filtered.filter(r => r.companyId === companyId);
  if (branchId) filtered = filtered.filter(r => r.branchId === branchId);
  if (terminalId) filtered = filtered.filter(r => r.terminalId === terminalId);
  if (date) filtered = filtered.filter(r => r.date === date);
  res.json(filtered);
});

app.post('/api/pos/reports/generate', (req, res) => {
  const { companyId, branchId, terminalId, date } = req.body;

  // Filter sales for the date
  const daySales = posSales.filter(s =>
    s.companyId === companyId &&
    s.terminalId === terminalId &&
    s.date.startsWith(date)
  );

  const totalSales = daySales.reduce((sum, s) => sum + s.total, 0);
  const cashSales = daySales.reduce((sum, s) => sum + s.payments.filter((p: any) => p.method === 'Cash').reduce((sum: number, p: any) => sum + p.amount, 0), 0);
  const cardSales = daySales.reduce((sum, s) => sum + s.payments.filter((p: any) => p.method === 'Card').reduce((sum: number, p: any) => sum + p.amount, 0), 0);
  const digitalWalletSales = daySales.reduce((sum, s) => sum + s.payments.filter((p: any) => p.method === 'Digital Wallet').reduce((sum: number, p: any) => sum + p.amount, 0), 0);
  const storeCreditSales = daySales.reduce((sum, s) => sum + s.payments.filter((p: any) => p.method === 'Store Credit').reduce((sum: number, p: any) => sum + p.amount, 0), 0);

  // Calculate top selling products
  const productSales: Record<string, { productName: string; quantity: number; revenue: number }> = {};
  daySales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { productName: item.productName, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    });
  });

  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({ productId: '', ...p }));

  // Calculate hourly sales
  const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sales: 0,
    transactions: 0
  }));

  daySales.forEach(sale => {
    const hour = new Date(sale.date).getHours();
    hourlySales[hour].sales += sale.total;
    hourlySales[hour].transactions += 1;
  });

  const newReport: POSDailyReport = {
    id: `pos-report-${Date.now()}`,
    companyId,
    branchId,
    terminalId,
    date,
    totalSales,
    totalTransactions: daySales.length,
    averageTransactionValue: daySales.length > 0 ? totalSales / daySales.length : 0,
    cashSales,
    cardSales,
    digitalWalletSales,
    storeCreditSales,
    refunds: posReturns.filter(r => r.companyId === companyId && r.terminalId === terminalId && r.date.startsWith(date) && r.refundStatus === 'Processed').reduce((sum, r) => sum + r.total, 0),
    discounts: daySales.reduce((sum, s) => sum + s.discount, 0),
    taxCollected: daySales.reduce((sum, s) => sum + s.tax, 0),
    topSellingProducts,
    paymentMethods: [
      { method: 'Cash', amount: cashSales, percentage: totalSales > 0 ? (cashSales / totalSales) * 100 : 0 },
      { method: 'Card', amount: cardSales, percentage: totalSales > 0 ? (cardSales / totalSales) * 100 : 0 },
      { method: 'Digital Wallet', amount: digitalWalletSales, percentage: totalSales > 0 ? (digitalWalletSales / totalSales) * 100 : 0 },
      { method: 'Store Credit', amount: storeCreditSales, percentage: totalSales > 0 ? (storeCreditSales / totalSales) * 100 : 0 }
    ],
    hourlySales,
    createdAt: new Date().toISOString()
  };

  posDailyReports.push(newReport);
  res.status(201).json(newReport);
});

// 10. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const { companyId } = req.query;
  res.json(companyId ? auditLogs.filter(l => l.companyId === companyId) : auditLogs);
});


// --- GEMINI CO-PILOT ENTERPRISE ENDPOINTS ---

app.post('/api/ai/chat', async (req, res) => {
  const { prompt, context, selectedCompanyId } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.status(200).json({
      reply: "⚠️ **Gemini API is not fully configured on your host server yet.** You can supply your API key in **Settings > Secrets** in the AI Studio UI.\n\nHere is a simulated response designed around your requested query:\n\n*Based on ERP metrics for company **" + (selectedCompanyId || 'Acme') + "**, the automated action is optimized. Please hook up your API key to activate production-grade responses!*"
    });
  }

  // Inject current ERP database context dynamically depending on selected company
  const compData = companies.find(c => c.id === selectedCompanyId) || companies[0];
  const compEmployees = employees.filter(e => e.companyId === selectedCompanyId);
  const compLeads = leads.filter(l => l.companyId === selectedCompanyId);
  const compGL = glAccounts.filter(g => g.companyId === selectedCompanyId);
  const compInvoices = invoices.filter(i => i.companyId === selectedCompanyId);
  const compStock = inventory.filter(v => v.companyId === selectedCompanyId);
  const compPOSSales = posSales.filter(s => s.companyId === selectedCompanyId);
  const compPOSProducts = posProducts.filter(p => p.companyId === selectedCompanyId);
  const compPOSCustomers = posCustomers.filter(c => c.companyId === selectedCompanyId);

  const databaseContextString = `
    CURRENT ERP DB DUMP FOR SYSTEM CONTEXT (Tenant: ${compData.name}):
    Active Modules: ${compData.activeModules.join(', ')}
    Premium Feature Packs Enabled: ${compData.premiumFeatures.join(', ')}
    Currency: ${compData.currency}
    Timezone: ${compData.timezone}
    Department Count: ${departments.filter(d => d.companyId === selectedCompanyId).length}
    Total Employees Registered: ${compEmployees.length} (Key: ${compEmployees.map(e => `${e.firstName} ${e.lastName} - ${e.designation}`).join(', ')})
    Active Sales Leads: ${compLeads.map(l => `${l.companyName} ($${l.value}, score: ${l.aiLeadScore}, Status: ${l.status})`).join('; ')}
    Financial Accounts Balances: ${compGL.map(a => `${a.name} (Code ${a.code}): ${compData.currency} ${a.balance}`).join('; ')}
    Recent Invoices Issued: ${compInvoices.map(i => `${i.invoiceNumber} to ${i.customerName} ($${i.total}, Status: ${i.status})`).join('; ')}
    Critical Warehoused Assets: ${compStock.map(s => `${s.name} (Stock: ${s.stockLevel}, Min limit: ${s.minStockLevel})`).join('; ')}
    POS Today's Sales: ${compPOSSales.length} transactions totaling $${compPOSSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
    POS Products: ${compPOSProducts.length} items across ${new Set(compPOSProducts.map(p => p.category)).size} categories
    POS Customers: ${compPOSCustomers.length} registered customers
  `;

  let systemDirective = `You are the chief AI ERP advisor for the Enterprise ERP SaaS system. 
  You assist corporate admins, HR officers, finance leaders, and developers with custom queries, automated summaries, resumes assessments, lead strategies, financial projections and audit optimizations.
  Maintain a clear, professional, concise, data-driven and actionable tone. Access to raw databases has been granted below:
  ${databaseContextString}`;

  if (context === 'forecasting') {
    systemDirective += "\nSpecialization: Focus exclusively on sales forecasting, financial cash-flow forecasts, profit and loss analysis and trend recommendations. Use actual GL accounts provided where possible.";
  } else if (context === 'screening') {
    systemDirective += "\nSpecialization: You are a professional HR candidate screener. Analyze simulated resumes or files. Score conversion suitability (1-5), detail match index for relevant roles, identify strengths, and write 3 exact custom target interview questions.";
  } else if (context === 'ocr') {
    systemDirective += "\nSpecialization: You are an intelligent document and invoice OCR parser. Extract invoice number, supplier details, amounts, tax rates, items lists, or flag irregularities and compliance items.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemDirective,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini API execution error:", err);
    res.status(500).json({ error: "Failed to generate AI insights from model. Error: " + err.message });
  }
});


// --- VITE MIDDLEWARE & STATIC ASSET SERVER COEXISTENCE ---

async function start() {
  if (process.env.DISABLE_HMR === 'true' || process.env.NODE_ENV === 'production') {
    // Production/Build static asset rendering
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Hot Dev Server environment setup
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ERP Full-Stack Server booted and running on http://localhost:${PORT}`);
  });
}

start();
