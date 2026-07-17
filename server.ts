/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Company, Employee, Department, Branch, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, Invoice, SupportTicket, ERPWorkflow, GLAccount, AuditLog, APIKey, POSProduct, POSCategory, POSTerminal, POSShift, POSCustomer, POSSale, POSDiscount, POSReturn, POSDailyReport, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline, OnboardingRecord, SalesOrder } from './src/types';
import * as schema from './db/schema';
import { db, dbAll, dbByCompany, dbById, dbInsert, dbInsertMany, dbUpdate, dbDelete, logAuditDb } from './db/repo';

// In-memory data store for live session (being migrated to PostgreSQL per-entity)
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
function logAudit(companyId: string | undefined, userId: string | undefined, userName: string | undefined, action: string, module: string, details: string) {
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
  logAuditDb(newLog);
}

// Wraps async route handlers so unhandled rejections are forwarded to Express error handler
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- ERP API ROUTES ---

// 1. Tenants (Companies)
app.get('/api/companies', asyncHandler(async (req, res) => {
  res.json(await dbAll(schema.companies));
    }));

app.post('/api/companies', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.companies, newCompany);

  // Seed initial values for the newly created tenant
  const initialGL: GLAccount[] = [
    { id: `gl-1010-${id}`, companyId: id, code: '1010', name: 'Operating Cash Account', type: 'Asset', balance: 50000.00 },
    { id: `gl-1200-${id}`, companyId: id, code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 0.00 },
    { id: `gl-4010-${id}`, companyId: id, code: '4010', name: 'Services Revenue', type: 'Revenue', balance: 0.00 },
    { id: `gl-5010-${id}`, companyId: id, code: '5010', name: 'Cost of Services', type: 'Expense', balance: 0.00 }
  ];
  await dbInsertMany(schema.glAccounts, initialGL);

  logAudit(undefined, 'u-super', 'Sarah Connor', 'CREATE_TENANT', 'Administration', `Created new tenant company: ${name} (${id})`);
  res.status(201).json(newCompany);
    }));

// Update tenant active modules/feature packs
app.post('/api/companies/:id/subscription', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { activeModules, premiumFeatures, billingPlan } = req.body;

  const company = await dbById(schema.companies, id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const updated = await dbUpdate(schema.companies, id, {
    activeModules: activeModules || company.activeModules,
    premiumFeatures: premiumFeatures || company.premiumFeatures,
    billingPlan: billingPlan || company.billingPlan
  });

  logAudit(id, 'u-super', 'Sarah Connor', 'UPDATE_SUBSCRIPTION', 'Administration', `Updated modules: [${activeModules?.join(', ')}], features: [${premiumFeatures?.join(', ')}]`);
  res.json(updated);
    }));

// 2. Users & Departments
app.get('/api/users', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.users);
  if (companyId) {
    res.json(all.filter((u: any) => u.companyId === companyId || u.companyId === ''));
  } else {
    res.json(all);
  }
    }));

app.post('/api/users/invite', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.users, newUser);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'INVITE_USER', 'Administration', `Invited user ${name} (${email}) as ${role} with roles: ${roles?.join(', ') || role}`);
  res.status(201).json(newUser);
    }));

app.post('/api/users/:id/switch-role', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  const user = await dbById<any>(schema.users, id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify the user has this role assigned
  if (!user.roles.includes(newRole)) {
    return res.status(400).json({ error: 'User does not have this role assigned' });
  }

  const oldRole = user.activeRole;
  const updated = await dbUpdate(schema.users, id, { activeRole: newRole });

  logAudit(user.companyId, user.id, user.name, 'ROLE_SWITCH', 'User Management', `Switched active role from ${oldRole} to ${newRole}`);
  res.json(updated);
    }));

app.get('/api/departments', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.departments);
  res.json(companyId ? all.filter((d: any) => d.companyId === companyId) : all);
    }));

app.post('/api/departments', asyncHandler(async (req, res) => {
  const { companyId, name, managerId, parentId, budget } = req.body;
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    companyId,
    name,
    managerId: managerId || undefined,
    parentId: parentId || undefined,
    budget: Number(budget) || 0,
    employeeCount: 0
  };
  await dbInsert(schema.departments, newDept);
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'DEPARTMENT_CREATE', 'HR', `Created department "${name}"`);
  res.status(201).json(newDept);
    }));

app.put('/api/departments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, managerId, parentId, budget } = req.body;
  const dept = await dbById<any>(schema.departments, id);
  if (!dept) return res.status(404).json({ error: 'Department not found' });
  const updated = await dbUpdate(schema.departments, id, {
    name: name ?? dept.name,
    managerId: managerId ?? dept.managerId,
    parentId: parentId ?? dept.parentId,
    budget: budget !== undefined ? Number(budget) : dept.budget,
  });
  logAudit(dept.companyId, 'u-acme-hr', 'Elena Rostova', 'DEPARTMENT_UPDATE', 'HR', `Updated department "${updated.name}"`);
  res.json(updated);
    }));

app.delete('/api/departments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dept = await dbById<any>(schema.departments, id);
  if (!dept) return res.status(404).json({ error: 'Department not found' });
  await dbDelete(schema.departments, id);
  logAudit(dept.companyId, 'u-acme-admin', 'Marcus Chen', 'DEPARTMENT_DELETE', 'Administration', `Deleted department "${dept.name}"`);
  res.json({ success: true });
    }));

app.get('/api/branches', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.branches);
  res.json(companyId ? all.filter((b: any) => b.companyId === companyId) : all);
    }));

app.post('/api/branches', asyncHandler(async (req, res) => {
  const { companyId, name, location, isMain } = req.body;
  const newBranch: Branch = {
    id: `branch-${Date.now()}`,
    companyId,
    name,
    location: location || '',
    isMain: Boolean(isMain)
  };
  await dbInsert(schema.branches, newBranch);
  logAudit(companyId, 'u-acme-admin', 'Marcus Chen', 'BRANCH_CREATE', 'Administration', `Created branch "${name}"`);
  res.status(201).json(newBranch);
    }));

// 3. HR & Employees
app.get('/api/employees', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.employees);
  res.json(companyId ? all.filter((e: any) => e.companyId === companyId) : all);
    }));

app.post('/api/employees', asyncHandler(async (req, res) => {
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

  await dbInsert(schema.employees, newEmp);

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
    }));

// 3.0.1 Update Employee Status (with cross-module sync)
app.put('/api/employees/:id', asyncHandler(async (req, res) => {
  const emp = await dbById<any>(schema.employees, req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  const oldStatus = emp.status;
  const newStatus = req.body.status || oldStatus;
  
  // Update employee
  const updated = await dbUpdate(schema.employees, emp.id, req.body);
  
  // Cross-module sync: When employee is terminated, unassign from active tasks/leads
  if (newStatus === 'Terminated' && oldStatus !== 'Terminated') {
    const userId = updated!.userId || updated!.id;

    // Unassign from active CRM leads
    const compLeads = await dbByCompany<any>(schema.crmLeads, updated!.companyId);
    for (const lead of compLeads) {
      if (lead.assignedTo === userId && lead.status !== 'Won' && lead.status !== 'Lost') {
        await dbUpdate(schema.crmLeads, lead.id, { assignedTo: undefined, assignedToName: undefined });
      }
    }

    // Mark active CRM tasks as cancelled
    const compTasks = await dbByCompany<any>(schema.crmTasks, updated!.companyId);
    for (const task of compTasks) {
      if (task.assignedTo === userId && task.status !== 'Completed') {
        await dbUpdate(schema.crmTasks, task.id, { status: 'Cancelled' });
      }
    }

    logAudit(updated!.companyId, userId, `${updated!.firstName} ${updated!.lastName}`, 'EMPLOYEE_TERMINATED', 'HR', `Employee terminated. Unassigned from active leads and tasks.`);
  }
  
  res.json(updated);
    }));

// 3.1 HR Leaves
app.get('/api/leaves', asyncHandler(async (req, res) => {
  const { companyId, employeeId } = req.query;
  let all = await dbAll<any>(schema.leaves);
  if (companyId) all = all.filter((l: any) => l.companyId === companyId);
  if (employeeId) all = all.filter((l: any) => l.employeeId === employeeId);
  res.json(all);
    }));

app.post('/api/leaves', asyncHandler(async (req, res) => {
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

  await dbInsert(schema.leaves, newLeave);
  logAudit(companyId, employeeId, employeeName, 'LEAVE_REQUEST', 'HR', `Submitted ${leaveType} leave request: ${startDate} to ${endDate}. Reason: ${reason}`);
  res.status(201).json(newLeave);
    }));

app.post('/api/leaves/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const leave = await dbById<any>(schema.leaves, id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  const updatedLeave = await dbUpdate(schema.leaves, id, {
    status: 'Approved',
    approvedBy: userName || 'Admin'
  });

  // Update employee status to 'On Leave'
  const emp = await dbById<any>(schema.employees, leave.employeeId);
  if (emp) await dbUpdate(schema.employees, emp.id, { status: 'On Leave' });

  logAudit(leave.companyId, userId, userName, 'LEAVE_APPROVE', 'HR', `Approved ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  res.json(updatedLeave);
    }));

app.post('/api/leaves/:id/decline', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const leave = await dbById<any>(schema.leaves, id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  const updatedLeave = await dbUpdate(schema.leaves, id, { status: 'Rejected' });

  // Revert employee status to 'Active'
  const emp = await dbById<any>(schema.employees, leave.employeeId);
  if (emp && emp.status === 'On Leave') await dbUpdate(schema.employees, emp.id, { status: 'Active' });

  logAudit(leave.companyId, userId, userName, 'LEAVE_DECLINE', 'HR', `Declined ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  res.json(updatedLeave);
    }));

// 3.2 HR Attendance
app.get('/api/attendance', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let all = await dbAll<any>(schema.attendance);
  if (companyId) all = all.filter((a: any) => a.companyId === companyId);
  res.json(all);
    }));

app.post('/api/attendance/clock', asyncHandler(async (req, res) => {
  const { companyId, employeeId, employeeName, department, action, locationType } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (action === 'in') {
    // Check if already clocked in today
    const all = await dbAll<any>(schema.attendance);
    let record = all.find((a: any) => a.employeeId === employeeId && a.date === todayStr);
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
      await dbInsert(schema.attendance, record);
      logAudit(companyId, employeeId, employeeName, 'ATTENDANCE_IN', 'HR', `Clocked in today at ${timeStr} via ${locationType}`);
    }
    res.json(record);
  } else {
    // Clock out
    const all = await dbAll<any>(schema.attendance);
    const record = all.find((a: any) => a.employeeId === employeeId && a.date === todayStr);
    if (record) {
      const updated = await dbUpdate(schema.attendance, record.id, { checkOut: timeStr });
      logAudit(companyId, employeeId, employeeName, 'ATTENDANCE_OUT', 'HR', `Clocked out today at ${timeStr}`);
      res.json(updated);
    } else {
      res.status(400).json({ error: 'No active clock-in session found for today' });
    }
  }
    }));

// 3.3 HR OKRs
app.get('/api/okrs', asyncHandler(async (req, res) => {
  const { companyId, employeeId } = req.query;
  let all = await dbAll<any>(schema.okrs);
  if (companyId) all = all.filter((o: any) => o.companyId === companyId);
  if (employeeId) all = all.filter((o: any) => o.employeeId === employeeId);
  res.json(all);
    }));

app.post('/api/okrs', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.okrs, newOkr);
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'OKR_CREATE', 'HR', `Assigned new OKR to ${employeeName}: "${title}"`);
  res.status(201).json(newOkr);
    }));

app.post('/api/okrs/:id/progress', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const okr = await dbById<any>(schema.okrs, id);
  if (!okr) return res.status(404).json({ error: 'OKR not found' });

  const prog = Number(progress);
  let status = okr.status;
  if (prog >= 100) status = 'Completed';
  else if (prog < 40) status = 'At Risk';
  else status = 'On Track';

  const updated = await dbUpdate(schema.okrs, id, { progress: prog, status });

  logAudit(okr.companyId, okr.employeeId, okr.employeeName, 'OKR_UPDATE', 'HR', `Updated OKR "${okr.title}" progress to ${progress}%`);
  res.json(updated);
    }));

// 3.3a Onboarding
app.get('/api/onboardings', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.onboardings);
  res.json(companyId ? all.filter((o: any) => o.companyId === companyId) : all);
    }));

app.post('/api/onboardings', asyncHandler(async (req, res) => {
  const { companyId, employeeId, employeeName, department, role, phase, tasks, completedTasks, status, startDate } = req.body;
  const newRecord = {
    id: `onb-${Date.now()}`,
    companyId,
    employeeId,
    employeeName,
    department,
    role,
    phase: phase || 'Pre-Day 1',
    tasks: tasks || [],
    completedTasks: completedTasks || [],
    status: status || 'In Progress',
    startDate: startDate || new Date().toISOString().split('T')[0],
  };
  await dbInsert(schema.onboardings, newRecord);
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'ONBOARDING_CREATE', 'HR', `Started onboarding for ${employeeName}`);
  res.status(201).json(newRecord);
    }));

app.put('/api/onboardings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const record = await dbById<any>(schema.onboardings, id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });
  const updated = await dbUpdate(schema.onboardings, id, updates);
  logAudit(record.companyId, 'u-acme-hr', 'Elena Rostova', 'ONBOARDING_UPDATE', 'HR', `Updated onboarding for ${record.employeeName}`);
  res.json(updated);
    }));

app.delete('/api/onboardings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await dbById<any>(schema.onboardings, id);
  if (!record) return res.status(404).json({ error: 'Onboarding record not found' });
  await dbDelete(schema.onboardings, id);
  logAudit(record.companyId, 'u-acme-hr', 'Elena Rostova', 'ONBOARDING_DELETE', 'HR', `Removed onboarding for ${record.employeeName}`);
  res.json({ success: true });
    }));

// 3.4 Payslips & Payroll
app.get('/api/payslips', asyncHandler(async (req, res) => {
  const { companyId, employeeId } = req.query;
  let all = await dbAll<any>(schema.payslips);
  if (companyId) all = all.filter((p: any) => p.companyId === companyId);
  if (employeeId) all = all.filter((p: any) => p.employeeId === employeeId);
  res.json(all);
    }));

app.post('/api/payroll/run', asyncHandler(async (req, res) => {
  const { companyId, period, structure, userId, userName, employeeIds } = req.body;
  const allEmployees = await dbAll<any>(schema.employees);
  let compEmployees = allEmployees.filter((e: any) => e.companyId === companyId);

  // Filter to specific employees if employeeIds provided
  if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
    compEmployees = compEmployees.filter((e: any) => employeeIds.includes(e.id));
  }

  const allPayslips = await dbAll<any>(schema.payslips);
  const cfgRows = companyId ? await dbByCompany<any>(schema.payrollTaxConfigs, companyId) : [];
  const cfg = cfgRows[0] || DEFAULT_TAX_CONFIG;
  const incomeTaxRate = Number(cfg.incomeTaxRate ?? DEFAULT_TAX_CONFIG.incomeTaxRate);
  const socialSecurityRate = Number(cfg.socialSecurityRate ?? DEFAULT_TAX_CONFIG.socialSecurityRate);
  const medicareRate = Number(cfg.medicareRate ?? DEFAULT_TAX_CONFIG.medicareRate);
  const allowances = Number(cfg.allowances ?? DEFAULT_TAX_CONFIG.allowances);
  const healthIns = Number(cfg.healthInsurance ?? DEFAULT_TAX_CONFIG.healthInsurance);
  const overtimeRate = Number(cfg.overtimeRate ?? DEFAULT_TAX_CONFIG.overtimeRate);
  const generatedSlips: any[] = [];

  for (const emp of compEmployees) {
    const baseSalary = emp.salary;
    const overtimePay = Math.round(baseSalary * overtimeRate); // Simulated overtime
    const gross = baseSalary + overtimePay + allowances;

    const tax = Math.round(baseSalary * incomeTaxRate);
    const socialSec = Math.round(baseSalary * socialSecurityRate);
    const medicare = Math.round(baseSalary * medicareRate);
    const deductions = tax + socialSec + medicare + healthIns;
    const net = gross - deductions;

    // Check if payslip already exists for this period and employee
    const existingIndex = allPayslips.findIndex((p: any) => p.employeeId === emp.id && p.period === period);
    const slip: PayslipRecord = {
      id: existingIndex >= 0 ? allPayslips[existingIndex].id : `ps-${Date.now()}-${emp.id}`,
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
      await dbUpdate(schema.payslips, allPayslips[existingIndex].id, slip);
    } else {
      await dbInsert(schema.payslips, slip);
    }
    generatedSlips.push(slip);
  }

  logAudit(companyId, userId, userName, 'PAYROLL_RUN', 'Payroll', `Processed monthly payroll for ${period}. Net disbursed: $${generatedSlips.reduce((sum: number, s: any) => sum + s.net, 0).toLocaleString()}`);
  res.json(generatedSlips);
    }));

// 3.4.1 Payroll tax / deduction configuration (DB-backed, company-specific)
const DEFAULT_TAX_CONFIG = {
  incomeTaxRate: 0.12,
  socialSecurityRate: 0.062,
  medicareRate: 0.0145,
  allowances: 350,
  healthInsurance: 180,
  overtimeRate: 0.05,
};

app.get('/api/payroll-tax-config', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const rows = await dbByCompany<any>(schema.payrollTaxConfigs, companyId as string);
  res.json(rows[0] || null);
    }));

app.put('/api/payroll-tax-config', asyncHandler(async (req, res) => {
  const { companyId, incomeTaxRate, socialSecurityRate, medicareRate, allowances, healthInsurance, overtimeRate } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const existing = await dbByCompany<any>(schema.payrollTaxConfigs, companyId);
  const values: any = {
    incomeTaxRate: Number(incomeTaxRate ?? DEFAULT_TAX_CONFIG.incomeTaxRate),
    socialSecurityRate: Number(socialSecurityRate ?? DEFAULT_TAX_CONFIG.socialSecurityRate),
    medicareRate: Number(medicareRate ?? DEFAULT_TAX_CONFIG.medicareRate),
    allowances: Number(allowances ?? DEFAULT_TAX_CONFIG.allowances),
    healthInsurance: Number(healthInsurance ?? DEFAULT_TAX_CONFIG.healthInsurance),
    overtimeRate: Number(overtimeRate ?? DEFAULT_TAX_CONFIG.overtimeRate),
    updatedAt: new Date().toISOString(),
  };
  let result;
  if (existing.length > 0) {
    result = await dbUpdate(schema.payrollTaxConfigs, existing[0].id, values);
  } else {
    result = await dbInsert(schema.payrollTaxConfigs, { id: `ptc-${Date.now()}`, companyId, ...values });
  }
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'PAYROLL_TAX_CONFIG', 'Payroll', `Updated payroll tax/deduction rates for ${companyId}.`);
  res.json(result);
    }));

// 3.5 Payroll Groups
app.get('/api/payroll-groups', asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.payrollGroups);
    res.json(companyId ? all.filter((g: any) => g.companyId === companyId) : all);
  } catch (err: any) {
    console.error('GET /api/payroll-groups error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

app.post('/api/payroll-groups', asyncHandler(async (req, res) => {
  try {
    const { companyId, name, description, employeeIds, userId, userName } = req.body;
    const id = `pg-${Date.now()}`;
    const vals: any = { id, companyId, name, description: description || '', createdBy: userId, createdAt: new Date().toISOString() };
    if (employeeIds && employeeIds.length) vals.employeeIds = employeeIds;
    await dbInsert(schema.payrollGroups, vals);
    const group = { id, companyId, name, description: description || '', employeeIds: employeeIds || [], createdBy: userId, createdAt: vals.createdAt };
    logAudit(companyId, userId, userName, 'CREATE', 'Payroll Groups', `Created payroll group: ${name}`);
    res.json(group);
  } catch (err: any) {
    console.error('POST /api/payroll-groups error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

app.delete('/api/payroll-groups/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const group = await dbById<any>(schema.payrollGroups, id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    await dbDelete(schema.payrollGroups, id);
    logAudit(group.companyId, 'system', '', 'DELETE', 'Payroll Groups', `Deleted payroll group: ${group.name}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/payroll-groups/:id error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

// 3.6 Salary Bands
app.get('/api/salary-bands', asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.salaryBands);
    res.json(companyId ? all.filter((b: any) => b.companyId === companyId) : all);
  } catch (err: any) {
    console.error('GET /api/salary-bands error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

app.post('/api/salary-bands', asyncHandler(async (req, res) => {
  try {
    const { companyId, name, minSalary, maxSalary, userId, userName } = req.body;
    const id = `sb-${Date.now()}`;
    const band = { id, companyId, name, minSalary: minSalary || 0, maxSalary: maxSalary || 0, employeeCount: 0, createdBy: userId, createdAt: new Date().toISOString() };
    await dbInsert(schema.salaryBands, band);
    logAudit(companyId, userId, userName, 'CREATE', 'Salary Bands', `Created salary band: ${name}`);
    res.json(band);
  } catch (err: any) {
    console.error('POST /api/salary-bands error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

app.put('/api/salary-bands/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, minSalary, maxSalary, employeeCount } = req.body;
    const updated = await dbUpdate(schema.salaryBands, id, { name, minSalary, maxSalary, employeeCount });
    if (!updated) return res.status(404).json({ error: 'Band not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('PUT /api/salary-bands/:id error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

app.delete('/api/salary-bands/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const band = await dbById<any>(schema.salaryBands, id);
    if (!band) return res.status(404).json({ error: 'Band not found' });
    await dbDelete(schema.salaryBands, id);
    logAudit(band.companyId, 'system', '', 'DELETE', 'Salary Bands', `Deleted salary band: ${band.name}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/salary-bands/:id error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

// 4. CRM Leads
app.get('/api/leads', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.crmLeads);
  res.json(companyId ? all.filter((l: any) => l.companyId === companyId) : all);
    }));

app.post('/api/leads', asyncHandler(async (req, res) => {
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

  await dbInsert(schema.crmLeads, newLead);

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
    }));

app.post('/api/leads/:id/move', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, companyId } = req.body;
  const lead = await dbById<any>(schema.crmLeads, id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const oldStatus = lead.status;
  await dbUpdate(schema.crmLeads, id, { status });

  logAudit(companyId, 'u-acme-sales', 'Samantha Brady', 'LEAD_STAGE_MOVE', 'CRM', `Moved Lead ${lead.firstName} from ${oldStatus} to ${status}`);

  // Deal Won AUTOMATION TRIGGER
  let triggerInvoice = null;
  if (status === 'Won') {
    // Generate draft invoice
    const invId = `inv-${Date.now()}`;
    const invNumber = `INV-2026-0${Math.floor(400 + Math.random() * 599)}`;
    triggerInvoice = {
      id: invId,
      companyId: lead.companyId,
      invoiceNumber: invNumber,
      customerId: lead.id,
      customerName: lead.companyName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: lead.value,
      tax: lead.value * 0.08,
      total: lead.value * 1.08,
      status: 'Draft' as const
    };
    await dbInsert(schema.invoices, triggerInvoice);
    logAudit(lead.companyId, 'u-acme-finance', 'David Vance', 'INVOICE_AUTO_GENERATE', 'Accounting', `Automated billing trigger: Generated draft invoice ${invNumber} for Won Lead of $${lead.value}`);
  }

  const updatedLead = await dbById<any>(schema.crmLeads, id);
  res.json({
    lead: updatedLead,
    invoiceCreated: triggerInvoice
  });
    }));

app.patch('/api/leads/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await dbById<any>(schema.crmLeads, id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const updated = await dbUpdate(schema.crmLeads, id, req.body);
  res.json(updated);
    }));

app.post('/api/leads/:id/assign', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await dbById<any>(schema.crmLeads, id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const { assignedTo, assignedToName, department } = req.body;
  
  // Validate assignment against active employees
  let newAssignedTo = lead.assignedTo;
  let newAssignedToName = lead.assignedToName;
  if (assignedTo) {
    const allEmployees = await dbAll<any>(schema.employees);
    const employee = allEmployees.find((e: any) => (e.userId === assignedTo || e.id === assignedTo) && e.status === 'Active');
    if (!employee) {
      return res.status(400).json({ error: 'Assigned employee not found or not active in HR' });
    }
    // Use employee data as source of truth
    newAssignedTo = employee.userId || employee.id;
    newAssignedToName = `${employee.firstName} ${employee.lastName}`;
  } else {
    newAssignedTo = undefined;
    newAssignedToName = undefined;
  }
  const updated = await dbUpdate(schema.crmLeads, id, {
    assignedTo: newAssignedTo,
    assignedToName: newAssignedToName,
    department: department || undefined
  });
  logAudit(lead.companyId, assignedTo, assignedToName || 'System', 'ASSIGN_LEAD', 'CRM', `Assigned lead ${lead.firstName} ${lead.lastName} to ${newAssignedToName}`);
  res.json(updated);
    }));

app.post('/api/leads/:id/comments', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await dbById<any>(schema.crmLeads, id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const comment = {
    id: `comment-${Date.now()}`,
    leadId: id,
    userId: req.body.userId,
    userName: req.body.userName,
    userAvatar: req.body.userAvatar,
    content: req.body.content,
    timestamp: new Date().toISOString()
  };
  const comments = [...(lead.comments || []), comment];
  const updated = await dbUpdate(schema.crmLeads, id, { comments });
  logAudit(lead.companyId, req.body.userId, req.body.userName, 'ADD_COMMENT', 'CRM', `Commented on lead ${lead.firstName} ${lead.lastName}`);
  res.json(updated);
    }));

// CRM Activities
app.get('/api/crm-activities', asyncHandler(async (req, res) => {
  const { companyId, leadId } = req.query;
  let all = await dbAll<any>(schema.crmActivities);
  if (companyId) all = all.filter((a: any) => a.companyId === companyId);
  if (leadId) all = all.filter((a: any) => a.leadId === leadId);
  res.json(all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }));

app.post('/api/crm-activities', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.crmActivities, activity);
  logAudit(req.body.companyId, req.body.performedBy, req.body.performedByName, 'LOG_ACTIVITY', 'CRM', `Logged ${activity.type}: ${activity.subject}`);
  res.status(201).json(activity);
    }));

// CRM Tasks
app.get('/api/crm-tasks', asyncHandler(async (req, res) => {
  const { companyId, leadId, status } = req.query;
  let all = await dbAll<any>(schema.crmTasks);
  if (companyId) all = all.filter((t: any) => t.companyId === companyId);
  if (leadId) all = all.filter((t: any) => t.leadId === leadId);
  if (status) all = all.filter((t: any) => t.status === status);
  res.json(all.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    }));

app.post('/api/crm-tasks', asyncHandler(async (req, res) => {
  let assignedTo = req.body.assignedTo;
  let assignedToName = req.body.assignedToName;
  
  // Validate assignment against active employees
  if (assignedTo) {
    const allEmployees = await dbAll<any>(schema.employees);
    const employee = allEmployees.find((e: any) => (e.userId === assignedTo || e.id === assignedTo) && e.status === 'Active');
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
  await dbInsert(schema.crmTasks, task);
  logAudit(req.body.companyId, assignedTo, assignedToName, 'CREATE_TASK', 'CRM', `Created task: ${task.title}`);
  res.status(201).json(task);
    }));

app.patch('/api/crm-tasks/:id', asyncHandler(async (req, res) => {
  const task = await dbById<any>(schema.crmTasks, req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const values: any = { ...req.body };
  if (req.body.status === 'Completed' && !task.completedAt) {
    values.completedAt = new Date().toISOString();
  }
  const updated = await dbUpdate(schema.crmTasks, task.id, values);
  logAudit(task.companyId, req.body.completedBy || task.assignedTo, req.body.completedByName || task.assignedToName, 'UPDATE_TASK', 'CRM', `Updated task: ${task.title} → ${updated!.status}`);
  res.json(updated);
    }));

// CRM Emails
app.get('/api/crm-emails', asyncHandler(async (req, res) => {
  const { companyId, leadId } = req.query;
  let all = await dbAll<any>(schema.crmEmails);
  if (companyId) all = all.filter((e: any) => e.companyId === companyId);
  if (leadId) all = all.filter((e: any) => e.leadId === leadId);
  res.json(all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }));

app.post('/api/crm-emails', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.crmEmails, email);
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
  await dbInsert(schema.crmActivities, activity);
  logAudit(req.body.companyId, req.body.sentBy, req.body.sentByName, 'SEND_EMAIL', 'CRM', `Sent email: ${email.subject}`);
  res.status(201).json(email);
    }));

// 5. Accounting & Ledger
app.get('/api/accounting', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const accounts = companyId ? await dbByCompany<any>(schema.glAccounts, companyId as string) : await dbAll<any>(schema.glAccounts);
  const invoicesAll = companyId ? await dbByCompany<any>(schema.invoices, companyId as string) : await dbAll<any>(schema.invoices);
  res.json({ accounts, invoices: invoicesAll });
    }));

app.post('/api/invoices', asyncHandler(async (req, res) => {
  const { companyId, customerName, subtotal, tax, dueDate, userId, userName } = req.body;
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

  await dbInsert(schema.invoices, newInvoice);

  // Re-calculate General Ledger balances to reflect transaction journalizing
  // Debit Accounts Receivable, Credit Revenue
  const allGL = await dbByCompany<any>(schema.glAccounts, companyId);
  const ar = allGL.find((a: any) => a.code === '1200');
  const rev = allGL.find((a: any) => a.code === '4010');

  if (ar) await dbUpdate(schema.glAccounts, ar.id, { balance: Number(ar.balance) + total });
  if (rev) await dbUpdate(schema.glAccounts, rev.id, { balance: Number(rev.balance) + Number(subtotal) });

  logAudit(companyId, userId, userName, 'INVOICE_CREATE', 'Accounting', `Dispatched Invoice ${invNumber} of $${total} to ${customerName}. Adjusting general ledger accounts: DR Accounts Receivable, CR Sales Revenue`);

  res.status(201).json(newInvoice);
    }));

app.post('/api/invoices/:id/pay', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId, userId, userName } = req.body;
  const inv = await dbById<any>(schema.invoices, id);
  if (!inv) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const amount = inv.total;
  const updatedInv = await dbUpdate(schema.invoices, id, { status: 'Paid' });

  // Debit Cash Account, Credit Accounts Receivable
  const allGL = await dbByCompany<any>(schema.glAccounts, companyId);
  const cash = allGL.find((a: any) => a.code === '1010');
  const ar = allGL.find((a: any) => a.code === '1200');

  if (cash) await dbUpdate(schema.glAccounts, cash.id, { balance: Number(cash.balance) + Number(amount) });
  if (ar) await dbUpdate(schema.glAccounts, ar.id, { balance: Number(ar.balance) - Number(amount) });

  logAudit(companyId, userId, userName, 'INVOICE_PAY', 'Accounting', `Processed payment for invoice ${inv.invoiceNumber}. DR Cash Operating Account ($${amount}), CR Accounts Receivable`);

  res.json(updatedInv);
    }));

// 5b. Sales Orders
app.get('/api/sales-orders', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.salesOrders, companyId as string) : await dbAll<any>(schema.salesOrders);
  res.json(all);
    }));

app.post('/api/sales-orders', asyncHandler(async (req, res) => {
  const { companyId, customerName, customerId, items, subtotal, tax, discount, priority, assignedTo, assignedToName, expectedDelivery, notes } = req.body;
  const total = Number(subtotal) + Number(tax) - Number(discount || 0);

  const existingOrders = await dbByCompany<any>(schema.salesOrders, companyId);
  const seqNum = existingOrders.length + 1;
  const orderNumber = `SO-2026-${String(seqNum).padStart(4, '0')}`;

  const newOrder: SalesOrder = {
    id: `so-${Date.now()}`,
    companyId,
    orderNumber,
    customerName,
    customerId: customerId || '',
    items: items || [],
    subtotal: Number(subtotal),
    tax: Number(tax),
    discount: Number(discount || 0),
    total,
    status: 'Pending',
    priority: priority || 'Medium',
    assignedTo: assignedTo || '',
    assignedToName: assignedToName || '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: expectedDelivery || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  await dbInsert(schema.salesOrders, newOrder);
  logAudit(companyId, 'u-acme-sales', 'Sales Rep', 'SALES_ORDER_CREATE', 'Sales', `Created sales order ${orderNumber} for ${customerName} — Total: $${total}`);
  res.status(201).json(newOrder);
    }));

app.patch('/api/sales-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const order = await dbById<any>(schema.salesOrders, id);
  if (!order) return res.status(404).json({ error: 'Sales order not found' });
  const updated = await dbUpdate(schema.salesOrders, id, updates);
  logAudit(order.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_ORDER_UPDATE', 'Sales', `Updated sales order ${order.orderNumber} — Status: ${updates.status || order.status}`);
  res.json(updated);
    }));

app.delete('/api/sales-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await dbById<any>(schema.salesOrders, id);
  if (!order) return res.status(404).json({ error: 'Sales order not found' });
  await dbDelete(schema.salesOrders, id);
  logAudit(order.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_ORDER_DELETE', 'Sales', `Deleted sales order ${order.orderNumber}`);
  res.json({ success: true });
    }));

// 5c. Sales Customers
app.get('/api/sales-customers', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.salesCustomers, companyId as string) : await dbAll<any>(schema.salesCustomers);
  res.json(all);
    }));

app.post('/api/sales-customers', asyncHandler(async (req, res) => {
  const { companyId, name, email, phone, company, address, notes } = req.body;
  const newCust = {
    id: `sc-${Date.now()}`,
    companyId,
    name: name || '',
    email: email || '',
    phone: phone || '',
    company: company || '',
    address: address || '',
    totalOrders: 0,
    totalSpend: 0,
    lastOrderDate: '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  await dbInsert(schema.salesCustomers, newCust);
  logAudit(companyId, 'u-acme-sales', 'Sales Rep', 'SALES_CUSTOMER_CREATE', 'Sales', `Created customer ${name}`);
  res.status(201).json(newCust);
    }));

app.patch('/api/sales-customers/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const cust = await dbById<any>(schema.salesCustomers, id);
  if (!cust) return res.status(404).json({ error: 'Customer not found' });
  const updated = await dbUpdate(schema.salesCustomers, id, updates);
  logAudit(cust.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_CUSTOMER_UPDATE', 'Sales', `Updated customer ${cust.name}`);
  res.json(updated);
    }));

app.delete('/api/sales-customers/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cust = await dbById<any>(schema.salesCustomers, id);
  if (!cust) return res.status(404).json({ error: 'Customer not found' });
  await dbDelete(schema.salesCustomers, id);
  logAudit(cust.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_CUSTOMER_DELETE', 'Sales', `Deleted customer ${cust.name}`);
  res.json({ success: true });
    }));

// 5d. Sales Quotations
app.get('/api/sales-quotations', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.salesQuotations, companyId as string) : await dbAll<any>(schema.salesQuotations);
  res.json(all);
    }));

app.post('/api/sales-quotations', asyncHandler(async (req, res) => {
  const { companyId, customerName, customerId, items, subtotal, tax, validUntil, assignedTo, assignedToName, notes } = req.body;
  const total = Number(subtotal) + Number(tax);
  const existing = await dbByCompany<any>(schema.salesQuotations, companyId);
  const seqNum = existing.length + 1;
  const quoteNumber = `QT-2026-${String(seqNum).padStart(4, '0')}`;
  const newQuote = {
    id: `sq-${Date.now()}`,
    companyId,
    quoteNumber,
    customerName: customerName || '',
    customerId: customerId || '',
    items: items || [],
    subtotal: Number(subtotal),
    tax: Number(tax),
    total,
    validUntil: validUntil || '',
    status: 'Draft',
    assignedTo: assignedTo || '',
    assignedToName: assignedToName || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  await dbInsert(schema.salesQuotations, newQuote);
  logAudit(companyId, 'u-acme-sales', 'Sales Rep', 'SALES_QUOTE_CREATE', 'Sales', `Created quotation ${quoteNumber} for ${customerName}`);
  res.status(201).json(newQuote);
    }));

app.patch('/api/sales-quotations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const quote = await dbById<any>(schema.salesQuotations, id);
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  const updated = await dbUpdate(schema.salesQuotations, id, updates);
  logAudit(quote.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_QUOTE_UPDATE', 'Sales', `Updated quotation ${quote.quoteNumber} — Status: ${updates.status || quote.status}`);
  res.json(updated);
    }));

app.delete('/api/sales-quotations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quote = await dbById<any>(schema.salesQuotations, id);
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  await dbDelete(schema.salesQuotations, id);
  logAudit(quote.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_QUOTE_DELETE', 'Sales', `Deleted quotation ${quote.quoteNumber}`);
  res.json({ success: true });
    }));

// 5e. Sales Targets
app.get('/api/sales-targets', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.salesTargets, companyId as string) : await dbAll<any>(schema.salesTargets);
  res.json(all);
    }));

app.post('/api/sales-targets', asyncHandler(async (req, res) => {
  const { companyId, repId, repName, month, year, targetAmount } = req.body;
  const newTarget = {
    id: `st-${Date.now()}`,
    companyId,
    repId: repId || '',
    repName: repName || '',
    month: month || '',
    year: year || '',
    targetAmount: Number(targetAmount),
    actualAmount: 0,
    createdAt: new Date().toISOString(),
  };
  await dbInsert(schema.salesTargets, newTarget);
  logAudit(companyId, 'u-acme-sales', 'Sales Rep', 'SALES_TARGET_CREATE', 'Sales', `Set target for ${repName}: $${targetAmount}`);
  res.status(201).json(newTarget);
    }));

app.patch('/api/sales-targets/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const target = await dbById<any>(schema.salesTargets, id);
  if (!target) return res.status(404).json({ error: 'Target not found' });
  const updated = await dbUpdate(schema.salesTargets, id, updates);
  logAudit(target.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_TARGET_UPDATE', 'Sales', `Updated target for ${target.repName}`);
  res.json(updated);
    }));

app.delete('/api/sales-targets/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await dbById<any>(schema.salesTargets, id);
  if (!target) return res.status(404).json({ error: 'Target not found' });
  await dbDelete(schema.salesTargets, id);
  logAudit(target.companyId, 'u-acme-sales', 'Sales Rep', 'SALES_TARGET_DELETE', 'Sales', `Deleted target for ${target.repName}`);
  res.json({ success: true });
    }));

// ═══════════════════════════════════════════════════════════════════════════
// CORE LEDGER - Accounting Module API Routes
// ═══════════════════════════════════════════════════════════════════════════

// 5.1 GL Account CRUD
app.get('/api/gl-accounts', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.glAccounts, companyId as string) : await dbAll<any>(schema.glAccounts);
  res.json(all);
    }));

app.post('/api/gl-accounts', asyncHandler(async (req, res) => {
  const { companyId, code, name, type, userId, userName } = req.body;
  const allGL = await dbByCompany<any>(schema.glAccounts, companyId);
  const existing = allGL.find((a: any) => a.code === code);
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
  await dbInsert(schema.glAccounts, newAccount);
  logAudit(companyId, userId, userName, 'GL_ACCOUNT_CREATE', 'Accounting', `Created new GL account: ${code} - ${name} (${type})`);
  res.status(201).json(newAccount);
    }));

app.put('/api/gl-accounts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, type, userId, userName } = req.body;
  const account = await dbById<any>(schema.glAccounts, id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  const values: any = {};
  if (name) values.name = name;
  if (type) values.type = type;
  const updated = await dbUpdate(schema.glAccounts, id, values);
  logAudit(account.companyId, userId, userName, 'GL_ACCOUNT_UPDATE', 'Accounting', `Updated GL account: ${account.code} - ${account.name}`);
  res.json(updated);
    }));

app.delete('/api/gl-accounts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await dbById<any>(schema.glAccounts, id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  if (Number(account.balance) !== 0) {
    return res.status(400).json({ error: 'Cannot delete account with non-zero balance' });
  }
  await dbDelete(schema.glAccounts, id);
  logAudit(account.companyId, req.body.userId, req.body.userName, 'GL_ACCOUNT_DELETE', 'Accounting', `Deleted GL account: ${account.code} - ${account.name}`);
  res.json({ success: true });
    }));

// 5.2 Journal Entries
app.get('/api/journal-entries', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.journalEntries, companyId as string) : await dbAll<any>(schema.journalEntries);
  res.json(all);
    }));

app.post('/api/journal-entries', asyncHandler(async (req, res) => {
  const { companyId, date, description, reference, lines, createdBy, createdByName } = req.body;

  const totalDebit = lines.reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({ error: 'Debit and credit totals must be equal' });
  }

  const allJE = await dbByCompany<any>(schema.journalEntries, companyId);
  const entryNumber = `JE-2026-${String(allJE.length + 1).padStart(3, '0')}`;
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

  await dbInsert(schema.journalEntries, newEntry);
  logAudit(companyId, createdBy, createdByName, 'JOURNAL_ENTRY_CREATE', 'Accounting', `Created journal entry ${entryNumber}: ${description}. Total: $${totalDebit}`);
  res.status(201).json(newEntry);
    }));

app.post('/api/journal-entries/:id/post', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = await dbById<any>(schema.journalEntries, id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  if (entry.status !== 'Draft') return res.status(400).json({ error: 'Only draft entries can be posted' });

  // Update GL account balances
  for (const line of entry.lines) {
    const acc = await dbById<any>(schema.glAccounts, line.accountId);
    if (acc) {
      await dbUpdate(schema.glAccounts, line.accountId, { balance: Number(acc.balance) + Number(line.debit) - Number(line.credit) });
    }
  }

  const updated = await dbUpdate(schema.journalEntries, id, { status: 'Posted', postedAt: new Date().toISOString() });
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_POST', 'Accounting', `Posted journal entry ${entry.entryNumber}. Total: $${entry.totalDebit}`);
  res.json(updated);
    }));

app.post('/api/journal-entries/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = await dbById<any>(schema.journalEntries, id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  if (entry.status !== 'Posted') return res.status(400).json({ error: 'Only posted entries can be approved' });

  const updated = await dbUpdate(schema.journalEntries, id, { status: 'Approved', approvedBy: userId, approvedByName: userName });
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_APPROVE', 'Accounting', `Approved journal entry ${entry.entryNumber}`);
  res.json(updated);
    }));

app.post('/api/journal-entries/:id/void', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = await dbById<any>(schema.journalEntries, id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });

  // Reverse GL balances if entry was posted or approved
  if (entry.status === 'Posted' || entry.status === 'Approved') {
    for (const line of entry.lines) {
      const acc = await dbById<any>(schema.glAccounts, line.accountId);
      if (acc) {
        await dbUpdate(schema.glAccounts, line.accountId, { balance: Number(acc.balance) - (Number(line.debit) - Number(line.credit)) });
      }
    }
  }

  const updated = await dbUpdate(schema.journalEntries, id, { status: 'Void' });
  logAudit(entry.companyId, userId, userName, 'JOURNAL_ENTRY_VOID', 'Accounting', `Voided journal entry ${entry.entryNumber}`);
  res.json(updated);
    }));

// 5.3 Expenses (rewritten with persistence + GL posting)
app.get('/api/expenses', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.expenses, companyId as string) : await dbAll<any>(schema.expenses);
  res.json(all);
    }));

app.post('/api/expenses', asyncHandler(async (req, res) => {
  const { companyId, description, category, department, amount, createdBy, createdByName, userId, userName } = req.body;

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    companyId,
    description,
    category,
    department,
    amount: Number(amount),
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    createdBy: createdBy || userId || 'u-acme-finance',
    createdByName: createdByName || userName,
    createdAt: new Date().toISOString()
  };

  await dbInsert(schema.expenses, newExpense);
  logAudit(companyId, createdBy || userId, createdByName || userName, 'EXPENSE_CREATE', 'Accounting', `Created expense: ${description} of $${amount} in ${category}`);
  res.status(201).json(newExpense);
    }));

app.post('/api/expenses/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const expense = await dbById<any>(schema.expenses, id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });

  // Auto-create journal entry for approved expense
  const allGL = await dbByCompany<any>(schema.glAccounts, expense.companyId);
  const expenseAccountId = allGL.find((a: any) => a.type === 'Expense')?.id || 'gl-5010';
  const cashAccountId = allGL.find((a: any) => a.code === '1010')?.id || 'gl-1010';

  const allJE = await dbByCompany<any>(schema.journalEntries, expense.companyId);
  const entryNumber = `JE-2026-${String(allJE.length + 1).padStart(3, '0')}`;
  const newEntry: JournalEntry = {
    id: `je-${Date.now()}`,
    companyId: expense.companyId,
    entryNumber,
    date: expense.date,
    description: `Expense: ${expense.description}`,
    reference: expense.id,
    lines: [
      { id: `jl-${Date.now()}-1`, accountId: expenseAccountId, accountCode: '5010', accountName: 'Expense Account', debit: expense.amount, credit: 0, description: expense.description },
      { id: `jl-${Date.now()}-2`, accountId: cashAccountId, accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: expense.amount, description: 'Cash payment' }
    ],
    totalDebit: expense.amount,
    totalCredit: expense.amount,
    status: 'Posted',
    createdBy: userId || 'u-acme-finance',
    createdByName: userName || 'David Vance',
    postedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.journalEntries, newEntry);

  // Update GL balances
  const expAcc = allGL.find((a: any) => a.id === expenseAccountId);
  const cashAcc = allGL.find((a: any) => a.id === cashAccountId);
  if (expAcc) await dbUpdate(schema.glAccounts, expenseAccountId, { balance: Number(expAcc.balance) + expense.amount });
  if (cashAcc) await dbUpdate(schema.glAccounts, cashAccountId, { balance: Number(cashAcc.balance) - expense.amount });

  const updated = await dbUpdate(schema.expenses, id, { status: 'Approved', journalEntryId: newEntry.id });
  logAudit(expense.companyId, userId, userName, 'EXPENSE_APPROVE', 'Accounting', `Approved expense: ${expense.description}. Auto-posted JE ${entryNumber}`);
  res.json(updated);
    }));

// 5.4 Trial Balance
app.get('/api/trial-balance', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const accounts = companyId ? await dbByCompany<any>(schema.glAccounts, companyId as string) : await dbAll<any>(schema.glAccounts);

  let totalDebits = 0;
  let totalCredits = 0;

  const trialBalance = accounts.map((acc: any) => {
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
    }));

// 5.5 Fiscal Periods
app.get('/api/fiscal-periods', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.fiscalPeriods, companyId as string) : await dbAll<any>(schema.fiscalPeriods);
  res.json(all);
    }));

app.post('/api/fiscal-periods', asyncHandler(async (req, res) => {
  const { companyId, name, startDate, endDate, userId, userName } = req.body;
  const newPeriod: FiscalPeriod = {
    id: `fp-${Date.now()}`,
    companyId,
    name,
    startDate,
    endDate,
    status: 'Open'
  };
  await dbInsert(schema.fiscalPeriods, newPeriod);
  logAudit(companyId, userId, userName, 'FISCAL_PERIOD_CREATE', 'Accounting', `Created fiscal period: ${name}`);
  res.status(201).json(newPeriod);
    }));

app.post('/api/fiscal-periods/:id/close', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const period = await dbById<any>(schema.fiscalPeriods, id);
  if (!period) return res.status(404).json({ error: 'Fiscal period not found' });
  if (period.status !== 'Open') return res.status(400).json({ error: 'Only open periods can be closed' });

  const updated = await dbUpdate(schema.fiscalPeriods, id, { status: 'Closed', closedBy: userId, closedAt: new Date().toISOString() });
  logAudit(period.companyId, userId, userName, 'FISCAL_PERIOD_CLOSE', 'Accounting', `Closed fiscal period: ${period.name}`);
  res.json(updated);
    }));

// 5.6 Opening Balances
app.get('/api/opening-balances', asyncHandler(async (req, res) => {
  const { companyId, periodId } = req.query;
  let all = await dbAll<any>(schema.openingBalances);
  if (companyId) all = all.filter(o => o.companyId === companyId);
  if (periodId) all = all.filter(o => o.periodId === periodId);
  res.json(all);
    }));

app.post('/api/opening-balances', asyncHandler(async (req, res) => {
  const { companyId, accountId, accountCode, accountName, periodId, debit, credit, userId, userName } = req.body;

  // Check if balance already exists for this account and period
  const all = await dbAll<any>(schema.openingBalances);
  const existing = all.find(o => o.companyId === companyId && o.accountId === accountId && o.periodId === periodId);
  const newBalance: OpeningBalance = {
    id: existing ? existing.id : `ob-${Date.now()}`,
    companyId,
    accountId,
    accountCode,
    accountName,
    periodId,
    debit: Number(debit) || 0,
    credit: Number(credit) || 0,
    createdAt: new Date().toISOString()
  };

  if (existing) {
    await dbUpdate(schema.openingBalances, existing.id, newBalance);
  } else {
    await dbInsert(schema.openingBalances, newBalance);
  }

  logAudit(companyId, userId, userName, 'OPENING_BALANCE_SET', 'Accounting', `Set opening balance for ${accountCode} - ${accountName}: DR $${debit} CR $${credit}`);
  res.status(201).json(newBalance);
    }));

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2 - AP / AR / Bank / Fixed Assets / Budgets / Cost Centers / Multi-Currency
// ═══════════════════════════════════════════════════════════════════════════

// --- Accounts Payable (Bills) ---
app.get('/api/bills', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.bills, companyId as string) : await dbAll<any>(schema.bills);
  res.json(all);
    }));

app.post('/api/bills', asyncHandler(async (req, res) => {
  const { companyId, vendorName, vendorId, billNumber, invoiceDate, dueDate, description, subtotal, tax, total, createdBy, createdByName } = req.body;
  const newBill: Bill = {
    id: `bill-${Date.now()}`,
    companyId, vendorName, vendorId, billNumber, invoiceDate, dueDate, description,
    subtotal: Number(subtotal) || 0, tax: Number(tax) || 0, total: Number(total) || 0,
    amountPaid: 0, status: 'Pending', createdBy, createdByName,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.bills, newBill);
  logAudit(companyId, createdBy, createdByName, 'CREATE_BILL', 'Accounting', `Created bill ${billNumber} from ${vendorName}: $${total}`);
  res.status(201).json(newBill);
    }));

app.post('/api/bills/:id/pay', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, paymentDate, paymentMethod, reference, bankAccountId, createdBy } = req.body;
  const bill = await dbById<any>(schema.bills, id);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  const amountPaid = Number(bill.amountPaid) + Number(amount);
  const status = amountPaid >= bill.total ? 'Paid' : 'Partially Paid';
  const updated = await dbUpdate(schema.bills, id, { amountPaid, status });
  const payment: BillPayment = {
    id: `bp-${Date.now()}`, companyId: bill.companyId, billId: id,
    amount: Number(amount), paymentDate, paymentMethod, reference, bankAccountId,
    createdBy, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.billPayments, payment);
  // Update bank balance
  if (bankAccountId) {
    const ba = await dbById<any>(schema.bankAccounts, bankAccountId);
    if (ba) await dbUpdate(schema.bankAccounts, bankAccountId, { balance: Number(ba.balance) - Number(amount) });
  }
  logAudit(bill.companyId, createdBy, 'System', 'PAY_BILL', 'Accounting', `Paid $${amount} on bill ${bill.billNumber}`);
  res.json(updated);
    }));

app.post('/api/bills/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const bill = await dbById<any>(schema.bills, id);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  const updated = await dbUpdate(schema.bills, id, { status: 'Approved' });
  logAudit(bill.companyId, userId, userName, 'APPROVE_BILL', 'Accounting', `Approved bill ${bill.billNumber}`);
  res.json(updated);
    }));

// --- Accounts Receivable (Customer Payments) ---
app.get('/api/customer-payments', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.customerPayments, companyId as string) : await dbAll<any>(schema.customerPayments);
  res.json(all);
    }));

app.post('/api/customer-payments', asyncHandler(async (req, res) => {
  const { companyId, invoiceId, customerName, amount, paymentDate, paymentMethod, reference, bankAccountId, createdBy } = req.body;
  const payment: CustomerPayment = {
    id: `cp-${Date.now()}`, companyId, invoiceId, customerName,
    amount: Number(amount), paymentDate, paymentMethod, reference, bankAccountId,
    createdBy, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.customerPayments, payment);
  // Update invoice status
  if (invoiceId) {
    await dbUpdate(schema.invoices, invoiceId, { status: 'Paid' });
  }
  // Update bank balance
  if (bankAccountId) {
    const ba = await dbById<any>(schema.bankAccounts, bankAccountId);
    if (ba) await dbUpdate(schema.bankAccounts, bankAccountId, { balance: Number(ba.balance) + Number(amount) });
  }
  logAudit(companyId, createdBy, 'System', 'RECEIVE_PAYMENT', 'Accounting', `Received $${amount} from ${customerName}`);
  res.status(201).json(payment);
    }));

// --- Bill Payments ---
app.get('/api/bill-payments', asyncHandler(async (req, res) => {
  const { companyId, billId } = req.query;
  let all = await dbAll<any>(schema.billPayments);
  if (companyId) all = all.filter((p: any) => p.companyId === companyId);
  if (billId) all = all.filter((p: any) => p.billId === billId);
  res.json(all);
    }));

// --- Bank Accounts ---
app.get('/api/bank-accounts', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.bankAccounts, companyId as string) : await dbAll<any>(schema.bankAccounts);
  res.json(all);
    }));

app.post('/api/bank-accounts', asyncHandler(async (req, res) => {
  const { companyId, name, bankName, accountNumber, accountType, glAccountId, userId, userName } = req.body;
  const newAccount: BankAccount = {
    id: `ba-${Date.now()}`, companyId, name, bankName, accountNumber, accountType, glAccountId,
    balance: 0, isActive: true, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.bankAccounts, newAccount);
  logAudit(companyId, userId, userName, 'CREATE_BANK_ACCOUNT', 'Accounting', `Created bank account ${name}`);
  res.status(201).json(newAccount);
    }));

// --- Bank Transactions ---
app.get('/api/bank-transactions', asyncHandler(async (req, res) => {
  const { companyId, bankAccountId } = req.query;
  let all = await dbAll<any>(schema.bankTransactions);
  if (companyId) all = all.filter(t => t.companyId === companyId);
  if (bankAccountId) all = all.filter(t => t.bankAccountId === bankAccountId);
  res.json(all);
    }));

app.post('/api/bank-transactions', asyncHandler(async (req, res) => {
  const { companyId, bankAccountId, date, description, type, amount, reference, createdBy } = req.body;
  const tx: BankTransaction = {
    id: `btx-${Date.now()}`, companyId, bankAccountId, date, description, type,
    amount: Number(amount), reconciled: false, reference,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.bankTransactions, tx);
  // Update bank balance
  const ba = await dbById<any>(schema.bankAccounts, bankAccountId);
  if (ba) {
    await dbUpdate(schema.bankAccounts, bankAccountId, { balance: Number(ba.balance) + (type === 'Credit' ? Number(amount) : -Number(amount)) });
  }
  logAudit(companyId, createdBy, 'System', 'BANK_TRANSACTION', 'Accounting', `${type} $${amount}: ${description}`);
  res.status(201).json(tx);
    }));

// --- Bank Reconciliation ---
app.get('/api/bank-reconciliations', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.bankReconciliations, companyId as string) : await dbAll<any>(schema.bankReconciliations);
  res.json(all);
    }));

app.post('/api/bank-reconciliations', asyncHandler(async (req, res) => {
  const { companyId, bankAccountId, periodStartDate, periodEndDate, statementBalance, reconciledTransactionIds, completedBy, completedByName } = req.body;
  const ba = await dbById<any>(schema.bankAccounts, bankAccountId);
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
  await dbInsert(schema.bankReconciliations, newRec);
  // Mark transactions as reconciled
  for (const txId of (reconciledTransactionIds || [])) {
    const tx = await dbById<any>(schema.bankTransactions, txId);
    if (tx) {
      await dbUpdate(schema.bankTransactions, txId, { reconciled: true, reconciledDate: periodEndDate });
    }
  }
  logAudit(companyId, completedBy, completedByName, 'BANK_RECONCILIATION', 'Accounting', `Reconciled ${bankAccountId} for period ending ${periodEndDate}`);
  res.status(201).json(newRec);
    }));

// --- Fixed Assets ---
app.get('/api/fixed-assets', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.fixedAssets, companyId as string) : await dbAll<any>(schema.fixedAssets);
  res.json(all);
    }));

app.post('/api/fixed-assets', asyncHandler(async (req, res) => {
  const { companyId, assetCode, name, description, category, purchaseDate, purchasePrice, salvageValue, usefulLifeYears, depreciationMethod, location, createdBy } = req.body;
  const newAsset: FixedAsset = {
    id: `fa-${Date.now()}`, companyId, assetCode, name, description, category, purchaseDate,
    purchasePrice: Number(purchasePrice), salvageValue: Number(salvageValue),
    usefulLifeYears: Number(usefulLifeYears), depreciationMethod, accumulatedDepreciation: 0,
    currentBookValue: Number(purchasePrice), location, status: 'Active',
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.fixedAssets, newAsset);
  logAudit(companyId, createdBy, 'System', 'CREATE_FIXED_ASSET', 'Accounting', `Registered asset ${assetCode}: ${name}`);
  res.status(201).json(newAsset);
    }));

app.post('/api/fixed-assets/:id/dispose', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { disposalPrice, disposalDate, userId, userName } = req.body;
  const asset = await dbById<any>(schema.fixedAssets, id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const updated = await dbUpdate(schema.fixedAssets, id, { status: 'Disposed', disposalDate, disposalPrice: Number(disposalPrice) });
  logAudit(asset.companyId, userId, userName, 'DISPOSE_ASSET', 'Accounting', `Disposed asset ${asset.assetCode}: ${asset.name}`);
  res.json(updated);
    }));

// --- Depreciation Entries ---
app.get('/api/depreciation-entries', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.depreciationEntries, companyId as string) : await dbAll<any>(schema.depreciationEntries);
  res.json(all);
    }));

app.post('/api/depreciation-entries/run', asyncHandler(async (req, res) => {
  const { companyId, period, createdBy } = req.body;
  const allAssets = await dbByCompany<any>(schema.fixedAssets, companyId);
  const activeAssets = allAssets.filter((a: any) => a.status === 'Active');
  const newEntries: DepreciationEntry[] = [];
  for (const asset of activeAssets) {
    const annualDep = (asset.purchasePrice - asset.salvageValue) / asset.usefulLifeYears;
    const monthlyDep = Math.round(annualDep / 12 * 100) / 100;
    const entry: DepreciationEntry = {
      id: `de-${Date.now()}-${asset.id}`, companyId, assetId: asset.id,
      assetCode: asset.assetCode, assetName: asset.name, period,
      depreciationAmount: monthlyDep,
      accumulatedDepreciation: Number(asset.accumulatedDepreciation) + monthlyDep,
      bookValue: Number(asset.currentBookValue) - monthlyDep,
      status: 'Draft', createdAt: new Date().toISOString()
    };
    await dbInsert(schema.depreciationEntries, entry);
    newEntries.push(entry);
    // Update asset
    const status = (Number(asset.currentBookValue) - monthlyDep) <= Number(asset.salvageValue) ? 'Fully Depreciated' : 'Active';
    await dbUpdate(schema.fixedAssets, asset.id, {
      accumulatedDepreciation: Number(asset.accumulatedDepreciation) + monthlyDep,
      currentBookValue: Number(asset.currentBookValue) - monthlyDep,
      status
    });
  }
  logAudit(companyId, createdBy, 'System', 'RUN_DEPRECIATION', 'Accounting', `Ran depreciation for ${activeAssets.length} assets - ${period}`);
  res.status(201).json(newEntries);
    }));

app.post('/api/depreciation-entries/:id/post', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const entry = await dbById<any>(schema.depreciationEntries, id);
  if (!entry) return res.status(404).json({ error: 'Depreciation entry not found' });
  const updated = await dbUpdate(schema.depreciationEntries, id, { status: 'Posted' });
  logAudit(entry.companyId, userId, userName, 'POST_DEPRECIATION', 'Accounting', `Posted depreciation for ${entry.assetCode}`);
  res.json(updated);
    }));

// --- Budgets ---
app.get('/api/budgets', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.budgets, companyId as string) : await dbAll<any>(schema.budgets);
  res.json(all);
    }));

app.post('/api/budgets', asyncHandler(async (req, res) => {
  const { companyId, name, fiscalYear, glAccountId, accountCode, accountName, budgetAmount, period, createdBy } = req.body;
  const newBudget: Budget = {
    id: `bud-${Date.now()}`, companyId, name, fiscalYear, glAccountId, accountCode, accountName,
    budgetAmount: Number(budgetAmount), actualAmount: 0, variance: Number(budgetAmount),
    variancePercent: 100, period, status: 'Draft', createdBy,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.budgets, newBudget);
  logAudit(companyId, createdBy, 'System', 'CREATE_BUDGET', 'Accounting', `Created budget ${name}: $${budgetAmount}`);
  res.status(201).json(newBudget);
    }));

app.post('/api/budgets/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const budget = await dbById<any>(schema.budgets, id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  const updated = await dbUpdate(schema.budgets, id, { status: 'Active' });
  logAudit(budget.companyId, userId, userName, 'APPROVE_BUDGET', 'Accounting', `Approved budget ${budget.name}`);
  res.json(updated);
    }));

// --- Cost Centers ---
app.get('/api/cost-centers', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.costCenters, companyId as string) : await dbAll<any>(schema.costCenters);
  res.json(all);
    }));

app.post('/api/cost-centers', asyncHandler(async (req, res) => {
  const { companyId, code, name, departmentId, departmentName, managerName, budget, createdBy } = req.body;
  const newCC: CostCenter = {
    id: `cc-${Date.now()}`, companyId, code, name, departmentId, departmentName, managerName,
    budget: Number(budget), actualSpend: 0, status: 'Active',
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.costCenters, newCC);
  logAudit(companyId, createdBy, 'System', 'CREATE_COST_CENTER', 'Accounting', `Created cost center ${code}: ${name}`);
  res.status(201).json(newCC);
    }));

// --- Multi-Currency ---
app.get('/api/currency-rates', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.currencyRates, companyId as string) : await dbAll<any>(schema.currencyRates);
  res.json(all);
    }));

app.post('/api/currency-rates', asyncHandler(async (req, res) => {
  const { companyId, baseCurrency, targetCurrency, rate, source, createdBy } = req.body;
  const newRate: CurrencyRate = {
    id: `cr-${Date.now()}`, companyId, baseCurrency, targetCurrency,
    rate: Number(rate), effectiveDate: new Date().toISOString().split('T')[0],
    source, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.currencyRates, newRate);
  logAudit(companyId, createdBy, 'System', 'UPDATE_CURRENCY_RATE', 'Accounting', `Updated ${baseCurrency}/${targetCurrency} rate: ${rate}`);
  res.status(201).json(newRate);
    }));

app.post('/api/currency-rates/convert', asyncHandler(async (req, res) => {
  const { companyId, amount, fromCurrency, toCurrency } = req.body;
  const all = await dbByCompany<any>(schema.currencyRates, companyId);
  const rate = all.find((r: any) => r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency);
  if (!rate) return res.status(404).json({ error: 'Exchange rate not found' });
  res.json({ amount: Number(amount), fromCurrency, toCurrency, rate: rate.rate, convertedAmount: Math.round(Number(amount) * rate.rate * 100) / 100 });
    }));

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3 - Tax / Intercompany / Compliance / Audit / Reporting
// ═══════════════════════════════════════════════════════════════════════════

// --- Tax Codes ---
app.get('/api/tax-codes', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.taxCodes, companyId as string) : await dbAll<any>(schema.taxCodes);
  res.json(all);
    }));

app.post('/api/tax-codes', asyncHandler(async (req, res) => {
  const { companyId, code, name, rate, type, glAccountId, createdBy, createdByName, userId, userName } = req.body;
  const newCode: TaxCode = {
    id: `tc-${Date.now()}`, companyId, code, name, rate: Number(rate), type, glAccountId,
    isActive: true, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.taxCodes, newCode);
  logAudit(companyId, createdBy || userId, createdByName || userName || 'System', 'CREATE_TAX_CODE', 'Accounting', `Created tax code ${code}: ${name} (${rate}%)`);
  res.status(201).json(newCode);
    }));

app.put('/api/tax-codes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, rate, type, glAccountId, isActive, userId, userName } = req.body;
  const code = await dbById<any>(schema.taxCodes, id);
  if (!code) return res.status(404).json({ error: 'Tax code not found' });
  const values: any = {};
  if (name !== undefined) values.name = name;
  if (rate !== undefined) values.rate = Number(rate);
  if (type !== undefined) values.type = type;
  if (glAccountId !== undefined) values.glAccountId = glAccountId;
  if (isActive !== undefined) values.isActive = isActive;
  const updated = await dbUpdate(schema.taxCodes, id, values);
  logAudit(code.companyId, userId, userName, 'UPDATE_TAX_CODE', 'Accounting', `Updated tax code ${code.code}: ${name ?? code.name}`);
  res.json(updated);
    }));

app.delete('/api/tax-codes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const code = await dbById<any>(schema.taxCodes, id);
  if (!code) return res.status(404).json({ error: 'Tax code not found' });
  await dbDelete(schema.taxCodes, id);
  logAudit(code.companyId, userId, userName, 'DELETE_TAX_CODE', 'Accounting', `Deleted tax code ${code.code}: ${code.name}`);
  res.json({ success: true });
    }));

// --- Tax Returns ---
app.get('/api/tax-returns', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.taxReturns, companyId as string) : await dbAll<any>(schema.taxReturns);
  res.json(all);
    }));

app.post('/api/tax-returns', asyncHandler(async (req, res) => {
  const { companyId, period, taxCodeId, taxCodeName, taxableAmount, taxAmount, dueDate, createdBy } = req.body;
  const newReturn: TaxReturn = {
    id: `tr-${Date.now()}`, companyId, period, taxCodeId, taxCodeName,
    taxableAmount: Number(taxableAmount), taxAmount: Number(taxAmount),
    status: 'Draft', dueDate, createdBy, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.taxReturns, newReturn);
  logAudit(companyId, createdBy, 'System', 'CREATE_TAX_RETURN', 'Accounting', `Created tax return for ${period}: $${taxAmount}`);
  res.status(201).json(newReturn);
    }));

app.put('/api/tax-returns/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { period, taxCodeId, taxCodeName, taxableAmount, taxAmount, dueDate, status, userId, userName } = req.body;
  const ret = await dbById<any>(schema.taxReturns, id);
  if (!ret) return res.status(404).json({ error: 'Tax return not found' });
  const values: any = {};
  if (period !== undefined) values.period = period;
  if (taxCodeId !== undefined) values.taxCodeId = taxCodeId;
  if (taxCodeName !== undefined) values.taxCodeName = taxCodeName;
  if (taxableAmount !== undefined) values.taxableAmount = Number(taxableAmount);
  if (taxAmount !== undefined) values.taxAmount = Number(taxAmount);
  if (dueDate !== undefined) values.dueDate = dueDate;
  if (status !== undefined) values.status = status;
  const updated = await dbUpdate(schema.taxReturns, id, values);
  logAudit(ret.companyId, userId, userName, 'UPDATE_TAX_RETURN', 'Accounting', `Updated tax return for ${ret.period}`);
  res.json(updated);
    }));

app.delete('/api/tax-returns/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const ret = await dbById<any>(schema.taxReturns, id);
  if (!ret) return res.status(404).json({ error: 'Tax return not found' });
  await dbDelete(schema.taxReturns, id);
  logAudit(ret.companyId, userId, userName, 'DELETE_TAX_RETURN', 'Accounting', `Deleted tax return for ${ret.period}`);
  res.json({ success: true });
    }));

app.post('/api/tax-returns/:id/file', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const ret = await dbById<any>(schema.taxReturns, id);
  if (!ret) return res.status(404).json({ error: 'Tax return not found' });
  const updated = await dbUpdate(schema.taxReturns, id, { status: 'Filed', filedDate: new Date().toISOString().split('T')[0] });
  logAudit(ret.companyId, userId, userName, 'FILE_TAX_RETURN', 'Accounting', `Filed tax return ${ret.period}`);
  res.json(updated);
    }));

// --- Intercompany Transactions ---
app.get('/api/intercompany-transactions', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.intercompanyTxns);
  res.json(companyId ? all.filter((t: any) => t.companyId === companyId || t.fromCompanyId === companyId || t.toCompanyId === companyId) : all);
    }));

app.post('/api/intercompany-transactions', asyncHandler(async (req, res) => {
  const { companyId, fromCompanyId, fromCompanyName, toCompanyId, toCompanyName, type, amount, description, createdBy } = req.body;
  const newTx: IntercompanyTransaction = {
    id: `ic-${Date.now()}`, companyId, fromCompanyId, fromCompanyName, toCompanyId, toCompanyName,
    type, amount: Number(amount), description, status: 'Pending',
    createdBy, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.intercompanyTxns, newTx);
  logAudit(companyId, createdBy, 'System', 'CREATE_INTERCOMPANY', 'Accounting', `Created intercompany ${type}: $${amount} from ${fromCompanyName} to ${toCompanyName}`);
  res.status(201).json(newTx);
    }));

app.post('/api/intercompany-transactions/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const tx = await dbById<any>(schema.intercompanyTxns, id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  const updated = await dbUpdate(schema.intercompanyTxns, id, { status: 'Approved' });
  logAudit(tx.companyId, userId, userName, 'APPROVE_INTERCOMPANY', 'Accounting', `Approved intercompany transaction ${id}`);
  res.json(updated);
    }));

app.post('/api/intercompany-transactions/:id/eliminate', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const tx = await dbById<any>(schema.intercompanyTxns, id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  const updated = await dbUpdate(schema.intercompanyTxns, id, { status: 'Eliminated', eliminationEntryId: `elim-${Date.now()}` });
  logAudit(tx.companyId, userId, userName, 'ELIMINATE_INTERCOMPANY', 'Accounting', `Eliminated intercompany transaction ${id}`);
  res.json(updated);
    }));

// --- Consolidation Rules ---
app.get('/api/consolidation-rules', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.consolidationRules, companyId as string) : await dbAll<any>(schema.consolidationRules);
  res.json(all);
    }));

app.post('/api/consolidation-rules', asyncHandler(async (req, res) => {
  const { companyId, subsidiaryId, subsidiaryName, eliminationAccount, minorityInterestPct, createdBy } = req.body;
  const newRule: ConsolidationRule = {
    id: `constr-${Date.now()}`, companyId, subsidiaryId, subsidiaryName, eliminationAccount,
    minorityInterestPct: Number(minorityInterestPct), isActive: true,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.consolidationRules, newRule);
  logAudit(companyId, createdBy, 'System', 'CREATE_CONSOLIDATION_RULE', 'Accounting', `Created consolidation rule for ${subsidiaryName}`);
  res.status(201).json(newRule);
    }));

// --- Compliance Checks ---
app.get('/api/compliance-checks', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.complianceChecks, companyId as string) : await dbAll<any>(schema.complianceChecks);
  res.json(all);
    }));

app.post('/api/compliance-checks', asyncHandler(async (req, res) => {
  const { companyId, category, title, description, dueDate, assignee, assigneeName, createdBy } = req.body;
  const newCheck: ComplianceCheck = {
    id: `comp-${Date.now()}`, companyId, category, title, description,
    status: 'Open', dueDate, assignee, assigneeName,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.complianceChecks, newCheck);
  logAudit(companyId, createdBy, 'System', 'CREATE_COMPLIANCE_CHECK', 'Compliance', `Created compliance check: ${title}`);
  res.status(201).json(newCheck);
    }));

app.put('/api/compliance-checks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, title, description, dueDate, assignee, assigneeName, status, userId, userName } = req.body;
  const check = await dbById<any>(schema.complianceChecks, id);
  if (!check) return res.status(404).json({ error: 'Compliance check not found' });
  const values: any = {};
  if (category !== undefined) values.category = category;
  if (title !== undefined) values.title = title;
  if (description !== undefined) values.description = description;
  if (dueDate !== undefined) values.dueDate = dueDate;
  if (assignee !== undefined) values.assignee = assignee;
  if (assigneeName !== undefined) values.assigneeName = assigneeName;
  if (status !== undefined) values.status = status;
  const updated = await dbUpdate(schema.complianceChecks, id, values);
  logAudit(check.companyId, userId, userName, 'UPDATE_COMPLIANCE', 'Compliance', `Updated compliance check: ${title ?? check.title}`);
  res.json(updated);
    }));

app.delete('/api/compliance-checks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const check = await dbById<any>(schema.complianceChecks, id);
  if (!check) return res.status(404).json({ error: 'Compliance check not found' });
  await dbDelete(schema.complianceChecks, id);
  logAudit(check.companyId, userId, userName, 'DELETE_COMPLIANCE', 'Compliance', `Deleted compliance check: ${check.title}`);
  res.json({ success: true });
    }));

app.post('/api/compliance-checks/:id/resolve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, userId, userName } = req.body;
  const check = await dbById<any>(schema.complianceChecks, id);
  if (!check) return res.status(404).json({ error: 'Compliance check not found' });
  const updated = await dbUpdate(schema.complianceChecks, id, { status: status || 'Compliant', lastChecked: new Date().toISOString().split('T')[0] });
  logAudit(check.companyId, userId, userName, 'RESOLVE_COMPLIANCE', 'Compliance', `Resolved compliance check: ${check.title}`);
  res.json(updated);
    }));

// --- Audit Snapshots ---
app.get('/api/audit-snapshots', asyncHandler(async (req, res) => {
  const { companyId, entityType, entityId } = req.query;
  let all = await dbAll<any>(schema.auditSnapshots);
  if (companyId) all = all.filter(s => s.companyId === companyId);
  if (entityType) all = all.filter(s => s.entityType === entityType);
  if (entityId) all = all.filter(s => s.entityId === entityId);
  res.json(all);
    }));

// --- Policy Documents ---
app.get('/api/policy-documents', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.policyDocuments, companyId as string) : await dbAll<any>(schema.policyDocuments);
  res.json(all);
    }));

app.post('/api/policy-documents', asyncHandler(async (req, res) => {
  const { companyId, title, category, version, content, dueDate, createdBy } = req.body;
  const newPolicy: PolicyDocument = {
    id: `pd-${Date.now()}`, companyId, title, category, version, content,
    acknowledgedBy: [], totalEmployees: 0, dueDate,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.policyDocuments, newPolicy);
  logAudit(companyId, createdBy, 'System', 'CREATE_POLICY', 'Compliance', `Created policy document: ${title}`);
  res.status(201).json(newPolicy);
    }));

app.post('/api/policy-documents/:id/acknowledge', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body;
  const policy = await dbById<any>(schema.policyDocuments, id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  const acknowledgedBy = Array.isArray(policy.acknowledgedBy) ? policy.acknowledgedBy : [];
  if (!acknowledgedBy.includes(employeeId)) {
    acknowledgedBy.push(employeeId);
  }
  const updated = await dbUpdate(schema.policyDocuments, id, { acknowledgedBy });
  res.json(updated);
    }));

// --- Filing Deadlines ---
app.get('/api/filing-deadlines', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.filingDeadlines, companyId as string) : await dbAll<any>(schema.filingDeadlines);
  res.json(all);
    }));

app.post('/api/filing-deadlines', asyncHandler(async (req, res) => {
  const { companyId, filingType, jurisdiction, dueDate, assignee, assigneeName, notes, createdBy } = req.body;
  const newFiling: FilingDeadline = {
    id: `fd-${Date.now()}`, companyId, filingType, jurisdiction, dueDate,
    status: 'Upcoming', assignee, assigneeName, notes,
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.filingDeadlines, newFiling);
  logAudit(companyId, createdBy, 'System', 'CREATE_FILING', 'Compliance', `Created filing deadline: ${filingType} - ${jurisdiction}`);
  res.status(201).json(newFiling);
    }));

app.put('/api/filing-deadlines/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { filingType, jurisdiction, dueDate, assignee, assigneeName, notes, status, userId, userName } = req.body;
  const filing = await dbById<any>(schema.filingDeadlines, id);
  if (!filing) return res.status(404).json({ error: 'Filing deadline not found' });
  const values: any = {};
  if (filingType !== undefined) values.filingType = filingType;
  if (jurisdiction !== undefined) values.jurisdiction = jurisdiction;
  if (dueDate !== undefined) values.dueDate = dueDate;
  if (assignee !== undefined) values.assignee = assignee;
  if (assigneeName !== undefined) values.assigneeName = assigneeName;
  if (notes !== undefined) values.notes = notes;
  if (status !== undefined) values.status = status;
  const updated = await dbUpdate(schema.filingDeadlines, id, values);
  logAudit(filing.companyId, userId, userName, 'UPDATE_FILING', 'Compliance', `Updated filing deadline: ${filing.filingType}`);
  res.json(updated);
    }));

app.delete('/api/filing-deadlines/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const filing = await dbById<any>(schema.filingDeadlines, id);
  if (!filing) return res.status(404).json({ error: 'Filing deadline not found' });
  await dbDelete(schema.filingDeadlines, id);
  logAudit(filing.companyId, userId, userName, 'DELETE_FILING', 'Compliance', `Deleted filing deadline: ${filing.filingType}`);
  res.json({ success: true });
    }));

app.post('/api/filing-deadlines/:id/file', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const filing = await dbById<any>(schema.filingDeadlines, id);
  if (!filing) return res.status(404).json({ error: 'Filing deadline not found' });
  const updated = await dbUpdate(schema.filingDeadlines, id, { status: 'Filed' });
  logAudit(filing.companyId, userId, userName, 'FILE_DEADLINE', 'Compliance', `Filed: ${filing.filingType}`);
  res.json(updated);
    }));

// --- Advanced Reporting ---
app.get('/api/reports/profit-loss', asyncHandler(async (req, res) => {
  const { companyId, period } = req.query;
  const companyGL = await dbByCompany<any>(schema.glAccounts, companyId as string);
  const revenue = companyGL.filter((a: any) => a.type === 'Revenue').map((a: any) => ({ account: a.name, code: a.code, amount: Math.abs(a.balance) }));
  const expenses = companyGL.filter((a: any) => a.type === 'Expense').map((a: any) => ({ account: a.name, code: a.code, amount: a.balance }));
  const totalRevenue = revenue.reduce((s: number, r: any) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  res.json({ period: period || 'Q3 2026', revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses });
    }));

app.get('/api/reports/balance-sheet', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const companyGL = await dbByCompany<any>(schema.glAccounts, companyId as string);
  const assets = companyGL.filter((a: any) => a.type === 'Asset').map((a: any) => ({ account: a.name, code: a.code, amount: a.balance }));
  const liabilities = companyGL.filter((a: any) => a.type === 'Liability').map((a: any) => ({ account: a.name, code: a.code, amount: a.balance }));
  const equity = companyGL.filter((a: any) => a.type === 'Equity').map((a: any) => ({ account: a.name, code: a.code, amount: a.balance }));
  const totalAssets = assets.reduce((s: number, a: any) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s: number, l: any) => s + l.amount, 0);
  const totalEquity = equity.reduce((s: number, e: any) => s + e.amount, 0);
  res.json({ assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity });
    }));

app.get('/api/reports/cash-flow', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const companyJE = (await dbByCompany<any>(schema.journalEntries, companyId as string)).filter((j: any) => j.status === 'Posted');
  const operating = companyJE.filter((j: any) => j.description.toLowerCase().includes('revenue') || j.description.toLowerCase().includes('expense') || j.description.toLowerCase().includes('payroll'))
    .reduce((s: number, j: any) => s + j.totalDebit - j.totalCredit, 0);
  const investing = -5000;
  const financing = -12000;
  res.json({ operating, investing, financing, netCashFlow: operating + investing + financing, period: 'Q3 2026' });
    }));

app.get('/api/reports/aging', asyncHandler(async (req, res) => {
  const { companyId, type } = req.query;
  if (type === 'ar') {
    const allInv = await dbByCompany<any>(schema.invoices, companyId as string);
    const outstanding = allInv.filter((i: any) => i.status !== 'Paid' && i.status !== 'Void');
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
    const allBills = await dbByCompany<any>(schema.bills, companyId as string);
    const outstanding = allBills.filter((b: any) => b.status !== 'Paid' && b.status !== 'Void');
    const aging = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
    outstanding.forEach((bill: any) => {
      const days = Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / 86400000);
      const owed = bill.total - bill.amountPaid;
      if (days <= 0) aging.current += owed;
      else if (days <= 30) aging.days30 += owed;
      else if (days <= 60) aging.days60 += owed;
      else if (days <= 90) aging.days90 += owed;
      else aging.over90 += owed;
    });
    res.json({ type: 'AP', aging, total: outstanding.reduce((s: number, b: any) => s + (b.total - b.amountPaid), 0), count: outstanding.length });
  }
    }));

// 6. Inventory Items
app.get('/api/inventory', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.inventory, companyId as string) : await dbAll<any>(schema.inventory);
  res.json(all);
    }));

app.post('/api/inventory/adjust', asyncHandler(async (req, res) => {
  const { id, adjustment, companyId } = req.body;
  const item = await dbById<any>(schema.inventory, id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const oldStock = item.stockLevel;
  const newStock = Math.max(0, item.stockLevel + Number(adjustment));

  const updated = await dbUpdate(schema.inventory, id, { stockLevel: newStock });

  logAudit(companyId, 'u-acme-inventory', 'Marcus Brody', 'STOCK_ADJUST', 'Inventory', `Adjusted SKU ${item.sku} stock level by ${adjustment} (from ${oldStock} to ${newStock})`);

  // Low stock trigger automation dispatch
  let lowStockAlert = false;
  if (newStock <= item.minStockLevel) {
    lowStockAlert = true;
    console.log(`[LOW STOCK AUTOMATION TRIGGERED] Creating purchase order request draft with Supplier: ${item.supplier}`);
  }

  res.json({
    item: updated,
    lowStockAlert
  });
    }));

// 7. Support Tickets
app.get('/api/tickets', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.tickets, companyId as string) : await dbAll<any>(schema.tickets);
  res.json(all);
    }));

app.post('/api/tickets', asyncHandler(async (req, res) => {
  const { companyId, customerName, customerEmail, subject, description, category, priority, department } = req.body;
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
    department: department || undefined,
    priority,
    status: 'Open',
    assignedTo: 'u-acme-admin',
    replies: [],
    createdAt: new Date().toISOString()
  };

  await dbInsert(schema.tickets, newTicket);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'TICKET_CREATE', 'Help Desk', `Received support ticket ${tktNumber} from ${customerName}. Category: ${category}${department ? ` · Directed to: ${department}` : ''}`);

  res.status(201).json(newTicket);
    }));

app.put('/api/tickets/:id', asyncHandler(async (req, res) => {
  const { status, department, reply, repliedBy, repliedByRole } = req.body;
  const ticket = await dbById<any>(schema.tickets, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates: any = {};
  if (status) updates.status = status;
  if (department !== undefined) updates.department = department || null;

  if (reply && reply.message) {
    const replies = Array.isArray(ticket.replies) ? ticket.replies : [];
    replies.push({
      from: repliedBy || 'System',
      fromRole: repliedByRole || 'Agent',
      message: reply.message,
      at: new Date().toISOString()
    });
    updates.replies = replies;
  }

  const updated = await dbUpdate(schema.tickets, req.params.id, updates);
  logAudit(ticket.companyId, 'u-acme-admin', 'Alex Mercer', 'TICKET_UPDATE', 'Help Desk', `Updated ticket ${ticket.ticketNumber}.${status ? ` Status → ${status}.` : ''}${reply && reply.message ? ' Added reply.' : ''}`);
  res.json(updated);
    }));

// 8. Workflows (Automation Builder)
app.get('/api/workflows', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.workflows, companyId as string) : await dbAll<any>(schema.workflows);
  res.json(all);
    }));

app.post('/api/workflows', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.workflows, newWf);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'WORKFLOW_CREATE', 'Administration', `Configured cross-module workflow: ${name}`);
  res.status(201).json(newWf);
    }));

// 9. API Keys settings
app.get('/api/apikeys', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.apiKeys, companyId as string) : await dbAll<any>(schema.apiKeys);
  res.json(all);
    }));

app.post('/api/apikeys', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.apiKeys, newKey);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'API_KEY_GENERATE', 'Administration', `Generated Public API Key: ${name}`);
  res.status(201).json(newKey);
    }));

// --- POS MODULE API ROUTES ---

// 1. POS Categories
app.get('/api/pos/categories', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.posCategories, companyId as string) : await dbAll<any>(schema.posCategories);
  res.json(all);
    }));

app.post('/api/pos/categories', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posCategories, newCategory);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_CATEGORY', 'POS', `Created category: ${name}`);
  res.status(201).json(newCategory);
    }));

// 2. POS Products
app.get('/api/pos/products', asyncHandler(async (req, res) => {
  const { companyId, category, isActive } = req.query;
  let all = await dbAll<any>(schema.posProducts);
  if (companyId) all = all.filter(p => p.companyId === companyId);
  if (category) all = all.filter(p => p.category === category);
  if (isActive !== undefined) all = all.filter(p => p.isActive === (isActive === 'true'));
  res.json(all);
    }));

app.post('/api/pos/products', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posProducts, newProduct);

  // Update inventory if exists
  const allInv = await dbByCompany<any>(schema.inventory, companyId);
  const existingInventory = allInv.find((i: any) => i.sku === sku);
  if (existingInventory) {
    await dbUpdate(schema.inventory, existingInventory.id, { stockLevel: Number(stockLevel) });
  } else {
    await dbInsert(schema.inventory, {
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
    }));

app.put('/api/pos/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await dbById<any>(schema.posProducts, id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const updated = await dbUpdate(schema.posProducts, id, { ...req.body, updatedAt: new Date().toISOString() });

  // Sync with inventory
  const allInv = await dbByCompany<any>(schema.inventory, product.companyId);
  const inv = allInv.find((i: any) => i.sku === updated!.sku);
  if (inv) {
    await dbUpdate(schema.inventory, inv.id, {
      stockLevel: updated!.stockLevel,
      unitPrice: updated!.unitPrice
    });
  }

  logAudit(product.companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_PRODUCT', 'POS', `Updated product: ${product.name}`);
  res.json(updated);
    }));

// 3. POS Terminals
app.get('/api/pos/terminals', asyncHandler(async (req, res) => {
  const { companyId, branchId } = req.query;
  let all = await dbAll<any>(schema.posTerminals);
  if (companyId) all = all.filter(t => t.companyId === companyId);
  if (branchId) all = all.filter(t => t.branchId === branchId);
  res.json(all);
    }));

app.post('/api/pos/terminals', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posTerminals, newTerminal);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_TERMINAL', 'POS', `Created terminal: ${name}`);
  res.status(201).json(newTerminal);
    }));

// 4. POS Customers
app.get('/api/pos/customers', asyncHandler(async (req, res) => {
  const { companyId, search } = req.query;
  let all = await dbAll<any>(schema.posCustomers);
  if (companyId) all = all.filter(c => c.companyId === companyId);
  if (search) {
    const searchLower = (search as string).toLowerCase();
    all = all.filter(c =>
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower)
    );
  }
  res.json(all);
    }));

app.post('/api/pos/customers', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posCustomers, newCustomer);

  // Sync with CRM leads if possible
  await dbInsert(schema.crmLeads, {
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
    }));

app.put('/api/pos/customers/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await dbById<any>(schema.posCustomers, id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const updated = await dbUpdate(schema.posCustomers, id, { ...req.body, updatedAt: new Date().toISOString() });

  logAudit(customer.companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_CUSTOMER', 'POS', `Updated customer: ${customer.firstName} ${customer.lastName}`);
  res.json(updated);
    }));

// 5. POS Shifts
app.get('/api/pos/shifts', asyncHandler(async (req, res) => {
  const { companyId, terminalId, status } = req.query;
  let all = await dbAll<any>(schema.posShifts);
  if (companyId) all = all.filter(s => s.companyId === companyId);
  if (terminalId) all = all.filter(s => s.terminalId === terminalId);
  if (status) all = all.filter(s => s.status === status);
  res.json(all);
    }));

app.post('/api/pos/shifts', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posShifts, newShift);
  logAudit(companyId, employeeId, employeeName, 'START_POS_SHIFT', 'POS', `Started shift at terminal ${terminalId}`);
  res.status(201).json(newShift);
    }));

app.post('/api/pos/shifts/:id/close', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { closingBalance, notes } = req.body;
  const shift = await dbById<any>(schema.posShifts, id);
  if (!shift) return res.status(404).json({ error: 'Shift not found' });

  const updated = await dbUpdate(schema.posShifts, id, {
    endTime: new Date().toISOString(),
    closingBalance: Number(closingBalance),
    status: 'Closed',
    notes
  });

  logAudit(shift.companyId, shift.employeeId, shift.employeeName, 'CLOSE_POS_SHIFT', 'POS', `Closed shift - Sales: $${shift.totalSales}`);
  res.json(updated);
    }));

// 6. POS Sales
app.get('/api/pos/sales', asyncHandler(async (req, res) => {
  const { companyId, terminalId, shiftId, startDate, endDate } = req.query;
  let all = await dbAll<any>(schema.posSales);
  if (companyId) all = all.filter(s => s.companyId === companyId);
  if (terminalId) all = all.filter(s => s.terminalId === terminalId);
  if (shiftId) all = all.filter(s => s.shiftId === shiftId);
  if (startDate) all = all.filter(s => s.date >= startDate.toString());
  if (endDate) all = all.filter(s => s.date <= endDate.toString());
  res.json(all);
    }));

app.post('/api/pos/sales', asyncHandler(async (req, res) => {
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

  await dbInsert(schema.posSales, newSale);

  // Update shift totals
  if (shiftId) {
    const shift = await dbById<any>(schema.posShifts, shiftId);
    if (shift) {
      await dbUpdate(schema.posShifts, shiftId, {
        totalSales: Number(shift.totalSales) + total,
        cashSales: Number(shift.cashSales) + payments.filter((p: any) => p.method === 'Cash').reduce((sum: number, p: any) => sum + p.amount, 0),
        cardSales: Number(shift.cardSales) + payments.filter((p: any) => p.method === 'Card').reduce((sum: number, p: any) => sum + p.amount, 0),
        digitalWalletSales: Number(shift.digitalWalletSales) + payments.filter((p: any) => p.method === 'Digital Wallet').reduce((sum: number, p: any) => sum + p.amount, 0),
        storeCreditSales: Number(shift.storeCreditSales) + payments.filter((p: any) => p.method === 'Store Credit').reduce((sum: number, p: any) => sum + p.amount, 0)
      });
    }
  }

  // Update product stock
  for (const item of items) {
    const product = await dbById<any>(schema.posProducts, item.productId);
    if (product) {
      await dbUpdate(schema.posProducts, item.productId, {
        stockLevel: Number(product.stockLevel) - item.quantity,
        updatedAt: new Date().toISOString()
      });
    }

    // Update inventory
    const allInv = await dbByCompany<any>(schema.inventory, companyId);
    const inv = allInv.find((i: any) => i.sku === item.sku);
    if (inv) {
      await dbUpdate(schema.inventory, inv.id, { stockLevel: Number(inv.stockLevel) - item.quantity });
    }
  }

  // Update customer
  if (customerId) {
    const customer = await dbById<any>(schema.posCustomers, customerId);
    if (customer) {
      const loyaltyPoints = Number(customer.loyaltyPoints) + Math.floor(total / 10);
      let tier = customer.tier;
      if (loyaltyPoints >= 5000) tier = 'Platinum';
      else if (loyaltyPoints >= 2000) tier = 'Gold';
      else if (loyaltyPoints >= 1000) tier = 'Silver';
      await dbUpdate(schema.posCustomers, customerId, {
        totalPurchases: Number(customer.totalPurchases) + 1,
        totalSpent: Number(customer.totalSpent) + total,
        loyaltyPoints,
        tier,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Post to accounting - record as bank transaction
  const allGL = await dbByCompany<any>(schema.glAccounts, companyId);
  const salesAccountId = allGL.find((a: any) => a.type === 'Revenue')?.id;
  if (salesAccountId) {
    const bankAccount = await dbByCompany<any>(schema.bankAccounts, companyId);
    const defaultBankId = bankAccount[0]?.id;
    if (defaultBankId) {
      await dbInsert(schema.bankTransactions, {
        id: `txn-${Date.now()}`,
        companyId,
        bankAccountId: defaultBankId,
        date: new Date().toISOString().split('T')[0],
        description: `POS Sale ${saleNumber}`,
        type: 'Credit',
        amount: total,
        reconciled: false,
        reference: saleNumber,
        createdAt: new Date().toISOString()
      });
    }
  }

  logAudit(companyId, employeeId, employeeName, 'CREATE_POS_SALE', 'POS', `Sale ${saleNumber} - Total: $${total}`);
  res.status(201).json(newSale);
    }));

app.post('/api/pos/sales/:id/void', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const sale = await dbById<any>(schema.posSales, id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  // Restore stock
  for (const item of sale.items) {
    const product = await dbById<any>(schema.posProducts, item.productId);
    if (product) {
      await dbUpdate(schema.posProducts, item.productId, {
        stockLevel: Number(product.stockLevel) + item.quantity,
        updatedAt: new Date().toISOString()
      });
    }

    const allInv = await dbByCompany<any>(schema.inventory, sale.companyId);
    const inv = allInv.find((i: any) => i.sku === item.sku);
    if (inv) {
      await dbUpdate(schema.inventory, inv.id, { stockLevel: Number(inv.stockLevel) + item.quantity });
    }
  }

  const updated = await dbUpdate(schema.posSales, id, { status: 'Void', updatedAt: new Date().toISOString() });

  logAudit(sale.companyId, sale.employeeId, sale.employeeName, 'VOID_POS_SALE', 'POS', `Voided sale ${sale.saleNumber} - Reason: ${reason}`);
  res.json(updated);
    }));

// 7. POS Discounts
app.get('/api/pos/discounts', asyncHandler(async (req, res) => {
  const { companyId, isActive } = req.query;
  let all = await dbAll<any>(schema.posDiscounts);
  if (companyId) all = all.filter(d => d.companyId === companyId);
  if (isActive !== undefined) all = all.filter(d => d.isActive === (isActive === 'true'));
  res.json(all);
    }));

app.post('/api/pos/discounts', asyncHandler(async (req, res) => {
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
  await dbInsert(schema.posDiscounts, newDiscount);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'CREATE_POS_DISCOUNT', 'POS', `Created discount: ${name}`);
  res.status(201).json(newDiscount);
    }));

app.put('/api/pos/discounts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const discount = await dbById<any>(schema.posDiscounts, id);
  if (!discount) return res.status(404).json({ error: 'Discount not found' });

  const updated = await dbUpdate(schema.posDiscounts, id, req.body);

  logAudit(discount.companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_POS_DISCOUNT', 'POS', `Updated discount: ${discount.name}`);
  res.json(updated);
    }));

// 8. POS Returns
app.get('/api/pos/returns', asyncHandler(async (req, res) => {
  const { companyId, terminalId, startDate, endDate } = req.query;
  let all = await dbAll<any>(schema.posReturns);
  if (companyId) all = all.filter(r => r.companyId === companyId);
  if (terminalId) all = all.filter(r => r.terminalId === terminalId);
  if (startDate) all = all.filter(r => r.date >= startDate.toString());
  if (endDate) all = all.filter(r => r.date <= endDate.toString());
  res.json(all);
    }));

app.post('/api/pos/returns', asyncHandler(async (req, res) => {
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

  await dbInsert(schema.posReturns, newReturn);
  logAudit(companyId, employeeId, employeeName, 'CREATE_POS_RETURN', 'POS', `Return ${returnNumber} - Original sale: ${originalSaleNumber}`);
  res.status(201).json(newReturn);
    }));

app.post('/api/pos/returns/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ret = await dbById<any>(schema.posReturns, id);
  if (!ret) return res.status(404).json({ error: 'Return not found' });

  // Restore stock
  for (const item of ret.items) {
    const product = await dbById<any>(schema.posProducts, item.productId);
    if (product) {
      await dbUpdate(schema.posProducts, item.productId, {
        stockLevel: Number(product.stockLevel) + item.quantity,
        updatedAt: new Date().toISOString()
      });
    }

    const allInv = await dbByCompany<any>(schema.inventory, ret.companyId);
    const inv = allInv.find((i: any) => i.sku === item.sku);
    if (inv) {
      await dbUpdate(schema.inventory, inv.id, { stockLevel: Number(inv.stockLevel) + item.quantity });
    }
  }

  // Process refund to customer
  if (ret.customerId && ret.refundMethod === 'Store Credit') {
    const customer = await dbById<any>(schema.posCustomers, ret.customerId);
    if (customer) {
      await dbUpdate(schema.posCustomers, ret.customerId, {
        storeCredit: Number(customer.storeCredit) + ret.total,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Update shift
  const allShifts = await dbByCompany<any>(schema.posShifts, ret.companyId);
  const openShift = allShifts.find((s: any) => s.terminalId === ret.terminalId && s.status === 'Open');
  if (openShift) {
    await dbUpdate(schema.posShifts, openShift.id, { refunds: Number(openShift.refunds) + ret.total });
  }

  const updated = await dbUpdate(schema.posReturns, id, { refundStatus: 'Processed', processedAt: new Date().toISOString() });

  logAudit(ret.companyId, ret.employeeId, ret.employeeName, 'APPROVE_POS_RETURN', 'POS', `Approved return ${ret.returnNumber} - $${ret.total}`);
  res.json(updated);
    }));

// 9. POS Reports
app.get('/api/pos/reports/daily', asyncHandler(async (req, res) => {
  const { companyId, branchId, terminalId, date } = req.query;
  let all = await dbAll<any>(schema.posDailyReports);
  if (companyId) all = all.filter(r => r.companyId === companyId);
  if (branchId) all = all.filter(r => r.branchId === branchId);
  if (terminalId) all = all.filter(r => r.terminalId === terminalId);
  if (date) all = all.filter(r => r.date === date);
  res.json(all);
    }));

app.post('/api/pos/reports/generate', asyncHandler(async (req, res) => {
  const { companyId, branchId, terminalId, date } = req.body;

  // Filter sales for the date
  const allSales = await dbByCompany<any>(schema.posSales, companyId);
  const daySales = allSales.filter((s: any) =>
    s.terminalId === terminalId &&
    s.date.startsWith(date)
  );

  const totalSales = daySales.reduce((sum: number, s: any) => sum + s.total, 0);
  const cashSales = daySales.reduce((sum: number, s: any) => sum + s.payments.filter((p: any) => p.method === 'Cash').reduce((sum2: number, p: any) => sum2 + p.amount, 0), 0);
  const cardSales = daySales.reduce((sum: number, s: any) => sum + s.payments.filter((p: any) => p.method === 'Card').reduce((sum2: number, p: any) => sum2 + p.amount, 0), 0);
  const digitalWalletSales = daySales.reduce((sum: number, s: any) => sum + s.payments.filter((p: any) => p.method === 'Digital Wallet').reduce((sum2: number, p: any) => sum2 + p.amount, 0), 0);
  const storeCreditSales = daySales.reduce((sum: number, s: any) => sum + s.payments.filter((p: any) => p.method === 'Store Credit').reduce((sum2: number, p: any) => sum2 + p.amount, 0), 0);

  // Calculate top selling products
  const productSales: Record<string, { productName: string; quantity: number; revenue: number }> = {};
  daySales.forEach((sale: any) => {
    sale.items.forEach((item: any) => {
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

  daySales.forEach((sale: any) => {
    const hour = new Date(sale.date).getHours();
    hourlySales[hour].sales += sale.total;
    hourlySales[hour].transactions += 1;
  });

  const allReturns = await dbByCompany<any>(schema.posReturns, companyId);
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
    refunds: allReturns.filter((r: any) => r.terminalId === terminalId && r.date.startsWith(date) && r.refundStatus === 'Processed').reduce((sum: number, r: any) => sum + r.total, 0),
    discounts: daySales.reduce((sum: number, s: any) => sum + s.discount, 0),
    taxCollected: daySales.reduce((sum: number, s: any) => sum + s.tax, 0),
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

  await dbInsert(schema.posDailyReports, newReport);
  res.status(201).json(newReport);
    }));

// 10. Audit Logs
app.get('/api/audit-logs', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.auditLogs);
  res.json(companyId ? all.filter((l: any) => l.companyId === companyId) : all);
    }));


// --- GEMINI CO-PILOT ENTERPRISE ENDPOINTS ---

app.post('/api/ai/chat', asyncHandler(async (req, res) => {
  const { prompt, context, selectedCompanyId } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.status(200).json({
      reply: "⚠️ **Gemini API is not fully configured on your host server yet.** You can supply your API key in **Settings > Secrets** in the AI Studio UI.\n\nHere is a simulated response designed around your requested query:\n\n*Based on ERP metrics for company **" + (selectedCompanyId || 'Acme') + "**, the automated action is optimized. Please hook up your API key to activate production-grade responses!*"
    });
  }

  // Inject current ERP database context dynamically depending on selected company
  const allCompanies = await dbAll<any>(schema.companies);
  const compData = allCompanies.find((c: any) => c.id === selectedCompanyId) || allCompanies[0];
  const compEmployees = await dbByCompany<any>(schema.employees, selectedCompanyId);
  const compLeads = await dbByCompany<any>(schema.crmLeads, selectedCompanyId);
  const compGL = await dbByCompany<any>(schema.glAccounts, selectedCompanyId);
  const compInvoices = await dbByCompany<any>(schema.invoices, selectedCompanyId);
  const compStock = await dbByCompany<any>(schema.inventory, selectedCompanyId);
  const compPOSSales = await dbByCompany<any>(schema.posSales, selectedCompanyId);
  const compPOSProducts = await dbByCompany<any>(schema.posProducts, selectedCompanyId);
  const compPOSCustomers = await dbByCompany<any>(schema.posCustomers, selectedCompanyId);
  const compDepartments = await dbByCompany<any>(schema.departments, selectedCompanyId);

  const databaseContextString = `
    CURRENT ERP DB DUMP FOR SYSTEM CONTEXT (Tenant: ${compData.name}):
    Active Modules: ${compData.activeModules.join(', ')}
    Premium Feature Packs Enabled: ${compData.premiumFeatures.join(', ')}
    Currency: ${compData.currency}
    Timezone: ${compData.timezone}
    Department Count: ${compDepartments.length}
    Total Employees Registered: ${compEmployees.length} (Key: ${compEmployees.map((e: any) => `${e.firstName} ${e.lastName} - ${e.designation}`).join(', ')})
    Active Sales Leads: ${compLeads.map((l: any) => `${l.companyName} ($${l.value}, score: ${l.aiLeadScore}, Status: ${l.status})`).join('; ')}
    Financial Accounts Balances: ${compGL.map((a: any) => `${a.name} (Code ${a.code}): ${compData.currency} ${a.balance}`).join('; ')}
    Recent Invoices Issued: ${compInvoices.map((i: any) => `${i.invoiceNumber} to ${i.customerName} ($${i.total}, Status: ${i.status})`).join('; ')}
    Critical Warehoused Assets: ${compStock.map((s: any) => `${s.name} (Stock: ${s.stockLevel}, Min limit: ${s.minStockLevel})`).join('; ')}
    POS Today's Sales: ${compPOSSales.length} transactions totaling $${compPOSSales.reduce((sum: number, s: any) => sum + s.total, 0).toFixed(2)}
    POS Products: ${compPOSProducts.length} items across ${new Set(compPOSProducts.map((p: any) => p.category)).size} categories
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
    }));


// --- GLOBAL ERROR HANDLER (must be after all routes) ---
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled route error:', err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled promise rejection:', reason);
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
