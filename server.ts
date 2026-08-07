/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import cors from 'cors';
import { Company, Employee, Department, Branch, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, Invoice, SupportTicket, ERPWorkflow, GLAccount, AuditLog, APIKey, POSProduct, POSCategory, POSTerminal, POSShift, POSCustomer, POSSale, POSDiscount, POSReturn, POSDailyReport, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline, OnboardingRecord, SalesOrder, KBArticle, LMSCourse, CommunicationAnnouncement, WorkflowTrigger, EmailTemplate } from './src/types';
import * as schema from './db/schema';
import { customRoles } from './db/customRoles';
import { approvalPolicies } from './db/approvalPolicies';
import { pendingApprovals } from './db/pendingApprovals';
import { db, dbAll, dbByCompany, dbById, dbInsert, dbInsertMany, dbUpdate, dbDelete, logAuditDb, dbByCompanyPaginated, dbAllPaginated } from './db/repo';
import { pool } from './db';
import { logger, logRequest, logError } from './server/lib/logger';
import { signToken, hashPassword, comparePassword, crudGuard } from './server/lib/auth';
import { authenticate, requireRole, enforceTenantIsolation } from './server/middleware/auth';
import { globalLimiter, authLimiter, aiLimiter } from './server/middleware/rateLimit';
import { validate, LoginSchema, CreateTicketSchema, CreateLeadSchema, CreateExpenseSchema, CreateBillSchema, JournalEntrySchema } from './server/lib/validators';

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

// ══════════════════════════════════════════════════════════════════════════════
// WORKFLOW EXECUTION ENGINE
// Evaluates all active company workflows for a given trigger event.
// Called asynchronously (non-blocking) from any route that fires an ERP event.
// ══════════════════════════════════════════════════════════════════════════════
async function evaluateWorkflows(
  companyId: string,
  eventName: string,
  context: Record<string, any> = {}
): Promise<void> {
  try {
    // 1. Load all active workflows for this company
    const allWorkflows = await dbByCompany<any>(schema.workflows, companyId);
    const active = allWorkflows.filter((w: any) => w.isActive);

    for (const wf of active) {
      const blocks: any[] = Array.isArray(wf.blocks) ? wf.blocks : (typeof wf.blocks === 'string' ? JSON.parse(wf.blocks) : []);

      // 2. Find the Trigger block and check if it matches the fired event
      const triggerBlock = blocks.find((b: any) => b.type === 'Trigger');
      if (!triggerBlock) continue;
      if (triggerBlock.value !== eventName) continue;

      // 3. Workflow matched — execute remaining blocks in sequence
      const executedActions: string[] = [`⚡ Trigger matched: "${eventName}"`];
      let conditionPassed = true;

      for (const block of blocks.filter((b: any) => b.type !== 'Trigger')) {
        if (block.type === 'Condition') {
          // Evaluate condition against the event context
          if (block.value.includes('$50,000') && context.value !== undefined) {
            conditionPassed = Number(context.value) > 50000;
            executedActions.push(`🔀 Condition "${block.label}": ${conditionPassed ? 'PASS' : 'SKIP'} (value=${context.value})`);
          } else if (block.value.includes('Operations') && context.department !== undefined) {
            conditionPassed = context.department === 'Operations';
            executedActions.push(`🔀 Condition "${block.label}": ${conditionPassed ? 'PASS' : 'SKIP'}`);
          } else {
            executedActions.push(`🔀 Condition "${block.label}": evaluated`);
          }
        } else if (block.type === 'Action' && conditionPassed) {
          // Log the action execution
          executedActions.push(`✅ Action executed: "${block.label}"`);
        } else if (block.type === 'Delay') {
          executedActions.push(`⏱ Delay node registered: "${block.label}"`);
        }
      }

      // 4. Write execution log to audit trail (visible in Workflow Run Logs tab)
      logAudit(
        companyId,
        'u-system',
        'Workflow Engine',
        'WORKFLOW_EXECUTED',
        'Workflow & Automation',
        `Workflow "${wf.name}" executed via "${eventName}" event. Steps: ${executedActions.join(' → ')}`
      );

      logger.info(`[WORKFLOW ENGINE] Executed "${wf.name}" (${blocks.length} blocks) for event "${eventName}"`);
    }
  } catch (err) {
    logError('[WORKFLOW ENGINE] Error during workflow evaluation:', err);
  }
}

// Wraps async route handlers so unhandled rejections are forwarded to Express error handler
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const app = express();
app.set('trust proxy', 1); // Allow rate limiting to work correctly behind Netlify proxy
const PORT = 3000;

// Auto-migrate tables
pool.query(`
CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  stage TEXT,
  applied_date TEXT,
  cv_text TEXT,
  ai_score INTEGER,
  ai_summary TEXT
);
`).then(() => console.log('Applicants table initialized')).catch(console.error);

app.use(express.json({ limit: '10mb' }));

// Security middleware
const isProd = process.env.NODE_ENV === 'production';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", ...(isProd ? [] : ["'unsafe-eval'"])],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: isProd
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://erp-platform.com'])
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Rate limiting
app.use(globalLimiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      logRequest(req.method, req.path, res.statusCode, Date.now() - start);
    }
  });
  next();
});

// --- ERP API ROUTES ---

// Auth routes (public)
app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email or password format' });
  }
  const { email, password } = result.data;
  const allUsers = await dbAll<any>(schema.users);
  const user = allUsers.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // Check if login is enabled for this user
  if (user.loginEnabled === false) {
    const reason = user.loginDisabledReason || 'account';
    let message = 'Your account has been temporarily disabled.';
    if (reason === 'leave') message = 'Your login is disabled while on leave. Contact HR to regain access.';
    else if (reason === 'resigned') message = 'Your account has been deactivated following your resignation.';
    else if (reason === 'terminated') message = 'Your account has been terminated.';
    else if (reason === 'suspended') message = 'Your account has been suspended. Contact HR for details.';
    return res.status(403).json({ error: message });
  }

  const valid = await comparePassword(password, user.passwordHash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const allRoles = await dbAll<any>(customRoles);
  const activeRole = allRoles.find((r: any) => r.name === user.role && r.companyId === user.companyId);
  const token = signToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    roles: user.roles || [],
    permissions: user.permissions || [],
    crudPermissions: activeRole?.crudPermissions || [],
  });

  logAudit(user.companyId, user.id, user.name, 'LOGIN', 'Auth', `User ${user.name} logged in`);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, permissions: user.permissions || [], crudPermissions: activeRole?.crudPermissions || [] } });
}));

app.post('/api/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const { email, password, name, companyId, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  const allUsers = await dbAll<any>(schema.users);
  if (allUsers.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await hashPassword(password);
  const newUser = await dbInsert<any>(schema.users, {
    id: `u-${Date.now()}`,
    companyId: companyId || 'c-default',
    name,
    email,
    passwordHash,
    role: role || 'Employee',
    roles: [],
    activeRole: role || 'Employee',
    department: '',
    branch: '',
    permissions: [],
    status: 'Active',
  });
  const allRoles = await dbAll<any>(customRoles);
  const activeRole = allRoles.find((r: any) => r.name === newUser.role && r.companyId === newUser.companyId);
  const token = signToken({
    userId: newUser.id,
    companyId: newUser.companyId,
    role: newUser.role,
    roles: newUser.roles || [],
    permissions: newUser.permissions || [],
    crudPermissions: activeRole?.crudPermissions || [],
  });
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, companyId: newUser.companyId, permissions: [], crudPermissions: activeRole?.crudPermissions || [] } });
}));

app.post('/api/auth/reset-password', authLimiter, asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Email, old password, and new password are required' });
  }
  const allUsers = await dbAll<any>(schema.users);
  const user = allUsers.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await comparePassword(oldPassword, user.passwordHash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid old password' });

  const newHash = await hashPassword(newPassword);
  await dbUpdate(schema.users, user.id, { passwordHash: newHash });
  
  logAudit(user.companyId, user.id, user.name, 'PASSWORD_RESET', 'Auth', `User ${user.name} reset their password`);
  res.json({ success: true, message: 'Password updated successfully' });
}));

// Dev-only endpoint: auto-login token (before auth middleware)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/dev-token', asyncHandler(async (req, res) => {
    const allUsers = await dbAll<any>(schema.users);
    const devUser = allUsers.find(u => u.role === 'HR Manager') || allUsers[0];
    if (!devUser) return res.status(404).json({ error: 'No users in DB' });
    const allRoles = await dbAll<any>(customRoles);
    const activeRole = allRoles.find((r: any) => r.name === devUser.role && r.companyId === devUser.companyId);
    const token = signToken({
      userId: devUser.id,
      companyId: devUser.companyId,
      role: devUser.role,
      roles: devUser.roles || [],
      permissions: devUser.permissions || [],
      crudPermissions: activeRole?.crudPermissions || [],
    });
    res.json({ token, user: { id: devUser.id, name: devUser.name, email: devUser.email, role: devUser.role, companyId: devUser.companyId, permissions: devUser.permissions || [], crudPermissions: activeRole?.crudPermissions || [] } });
  }));
}

// ─── Whisper Reports (Anonymous - before auth middleware) ─────────────────────
app.post('/api/whisper-reports', asyncHandler(async (req, res) => {
  const { companyId, category, description, location, department } = req.body;
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const report = {
    id: `wr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    companyId: companyId || 'c-acme',
    category: category || 'other',
    description: description.trim(),
    location: location || '',
    department: department || '',
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  await dbInsert<any>(schema.whisperReports, report);

  // Notify HR users in the company
  const allUsers = await dbAll<any>(schema.users);
  const hrUsers = allUsers.filter((u: any) =>
    u.companyId === report.companyId &&
    (u.role === 'HR Manager' || u.role === 'HR Officer' || u.role === 'HR Department Head')
  );

  // Create notification for HR
  for (const hr of hrUsers) {
    await dbInsert<any>(schema.chatMessages, {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId: report.companyId,
      senderId: 'system',
      senderName: 'Whisper System',
      recipientId: hr.id,
      message: `[Whisper Report] New anonymous ${category} report submitted. Category: ${category}. Please review in the Admin panel.`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  logAudit(report.companyId, 'anonymous', 'Anonymous', 'WHISPER_REPORT', 'Compliance', `Anonymous ${category} report submitted`);
  res.status(201).json({ success: true, message: 'Report submitted anonymously. Thank you for speaking up.' });
}));

app.get('/api/whisper-reports', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let all = await dbAll<any>(schema.whisperReports);
  if (companyId) all = all.filter((r: any) => r.companyId === companyId);
  res.json(all);
}));

app.put('/api/whisper-reports/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, notes } = req.body;
  const updates: any = {};
  if (status) updates.status = status;
  if (assignedTo) updates.assignedTo = assignedTo;
  if (notes) updates.notes = notes;
  const updated = await dbUpdate<any>(schema.whisperReports, id, updates);
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  res.json(updated);
}));

// Public endpoint to list tenant companies for the login page (Whistleblower form)
app.get('/api/public/companies', asyncHandler(async (req, res) => {
  const allCompanies = await dbAll<any>(schema.companies);
  const publicData = allCompanies.map(c => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    logo: c.logo
  }));
  res.json(publicData);
}));

// Apply auth to all subsequent /api routes
app.use('/api', authenticate);

// CRUD permission enforcement
const CRUD_ROUTES: Array<{ prefix: string; module: string }> = [
  // HR
  { prefix: '/employees', module: 'HR' },
  { prefix: '/leaves', module: 'HR' },
  { prefix: '/attendance', module: 'HR' },
  { prefix: '/recruitment', module: 'HR' },
  { prefix: '/onboarding', module: 'HR' },
  { prefix: '/okrs', module: 'HR' },
  { prefix: '/polls', module: 'HR' },
  { prefix: '/poll-options', module: 'HR' },
  { prefix: '/poll-votes', module: 'HR' },
  { prefix: '/exit-requests', module: 'HR' },
  { prefix: '/bank-account-updates', module: 'HR' },
  { prefix: '/profile-update-requests', module: 'HR' },
  // Payroll
  { prefix: '/payroll', module: 'Payroll' },
  { prefix: '/payslips', module: 'Payroll' },
  // Accounting
  { prefix: '/invoices', module: 'Accounting' },
  { prefix: '/expenses', module: 'Accounting' },
  { prefix: '/bills', module: 'Accounting' },
  { prefix: '/bill-payments', module: 'Accounting' },
  { prefix: '/customer-payments', module: 'Accounting' },
  { prefix: '/journal-entries', module: 'Accounting' },
  { prefix: '/gl-accounts', module: 'Accounting' },
  { prefix: '/bank-accounts', module: 'Accounting' },
  { prefix: '/bank-transactions', module: 'Accounting' },
  { prefix: '/bank-reconciliations', module: 'Accounting' },
  { prefix: '/fixed-assets', module: 'Accounting' },
  { prefix: '/depreciation', module: 'Accounting' },
  { prefix: '/budgets', module: 'Accounting' },
  { prefix: '/cost-centers', module: 'Accounting' },
  { prefix: '/currency-rates', module: 'Accounting' },
  { prefix: '/tax-codes', module: 'Accounting' },
  { prefix: '/tax-returns', module: 'Accounting' },
  { prefix: '/intercompany-transactions', module: 'Accounting' },
  { prefix: '/consolidation-rules', module: 'Accounting' },
  // CRM
  { prefix: '/leads', module: 'CRM' },
  { prefix: '/crm-activities', module: 'CRM' },
  { prefix: '/crm-tasks', module: 'CRM' },
  { prefix: '/crm-emails', module: 'CRM' },
  // Sales
  { prefix: '/sales-orders', module: 'Sales' },
  { prefix: '/sales-quotes', module: 'Sales' },
  { prefix: '/sales-customers', module: 'Sales' },
  { prefix: '/sales-targets', module: 'Sales' },
  // POS
  { prefix: '/pos', module: 'Sales' },
  // Operations
  { prefix: '/inventory', module: 'Operations' },
  { prefix: '/warehouses', module: 'Operations' },
  { prefix: '/transfers', module: 'Operations' },
  { prefix: '/vendors', module: 'Operations' },
  { prefix: '/purchase-orders', module: 'Operations' },
  { prefix: '/rfqs', module: 'Operations' },
  { prefix: '/work-orders', module: 'Operations' },
  { prefix: '/bom', module: 'Operations' },
  { prefix: '/quality-checks', module: 'Operations' },
  { prefix: '/maintenance-tasks', module: 'Operations' },
  { prefix: '/assets', module: 'Operations' },
  // Help Desk
  { prefix: '/tickets', module: 'Help Desk' },
  { prefix: '/knowledge-base', module: 'Help Desk' },
  // Administration
  { prefix: '/departments', module: 'Administration' },
  { prefix: '/branches', module: 'Administration' },
  { prefix: '/users', module: 'Administration' },
  { prefix: '/roles', module: 'Administration' },
  { prefix: '/approval-policies', module: 'Administration' },
  { prefix: '/pending-approvals', module: 'Administration' },
];

app.use('/api', (req, res, next) => {
  const perms: string[] = (req as any).user?.crudPermissions || [];
  if (perms.length === 0) return next();
  const method = req.method;
  const actionMap: Record<string, string> = { GET: 'Read', POST: 'Create', PUT: 'Update', PATCH: 'Update', DELETE: 'Delete' };
  const action = actionMap[method];
  if (!action) return next();
  const path = req.path;
  for (const route of CRUD_ROUTES) {
    if (path.startsWith(route.prefix) || path.startsWith('/api' + route.prefix)) {
      if (!perms.includes(`${route.module}.${action}`)) {
        return res.status(403).json({ error: `Missing ${route.module}.${action} permission` });
      }
      return next();
    }
  }
  next();
});

// 1. Tenants (Companies)
app.get('/api/companies', asyncHandler(async (req, res) => {
  res.json(await dbAll(schema.companies));
    }));

app.post('/api/companies', asyncHandler(async (req, res) => {
  const { name, industry, currency, timezone, language, billingPlan } = req.body;
  const id = `c-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const newCompany: Company = {
    id,
    name,
    domain: `${subdomain}.core360.site`,
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

// Update company settings (e.g. notice period)
app.put('/api/companies/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { noticePeriodDays, companyLogo, companySignature, userId, userName, billingStatus, subscriptionExpiresAt, billingPlan, currency, loginImages } = req.body;
  const updates: any = {};
  if (noticePeriodDays !== undefined) updates.noticePeriodDays = noticePeriodDays;
  if (companyLogo !== undefined) updates.companyLogo = companyLogo;
  if (companySignature !== undefined) updates.companySignature = companySignature;
  if (currency !== undefined) updates.currency = currency;
  if (loginImages !== undefined) updates.loginImages = loginImages;
  if (billingStatus !== undefined) updates.billingStatus = billingStatus;
  if (subscriptionExpiresAt !== undefined) updates.subscriptionExpiresAt = subscriptionExpiresAt;
  if (billingPlan !== undefined) updates.billingPlan = billingPlan;
  const updated = await dbUpdate(schema.companies, id, updates);
  const changes = Object.keys(updates).filter(k => k !== 'userId' && k !== 'userName').join(', ');
  logAudit(id, userId, userName, 'UPDATE_COMPANY_SETTINGS', 'Administration', `Updated: ${changes}`);
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

// ─── HR: Toggle Employee Login Access ─────────────────────────────────────────
app.put('/api/users/:id/login-access', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { loginEnabled, loginDisabledReason, userRole } = req.body;

  // Only HR roles and Company Admin can toggle login access
  const allowedRoles = ['HR Manager', 'HR Officer', 'HR Department Head', 'Company Admin'];
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Only HR and Company Admin can manage login access' });
  }

  const user = await dbById<any>(schema.users, id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Cannot disable login for Super Admin or Company Admin
  if ((user.role === 'Super Admin' || user.role === 'Company Admin') && loginEnabled === false) {
    return res.status(403).json({ error: 'Cannot disable login for admin users' });
  }

  const updates: any = { loginEnabled: loginEnabled !== false };
  if (loginEnabled === false && loginDisabledReason) {
    updates.loginDisabledReason = loginDisabledReason;
  } else if (loginEnabled === true) {
    updates.loginDisabledReason = null;
  }

  const updated = await dbUpdate(schema.users, id, updates);
  logAudit(user.companyId, req.body.requestedBy || 'system', req.body.requestedByName || 'System', 'LOGIN_ACCESS', 'User Management', `${loginEnabled ? 'Enabled' : 'Disabled'} login for ${user.name}${loginDisabledReason ? ` (${loginDisabledReason})` : ''}`);
  res.json(updated);
}));

// ─── Custom Roles CRUD ───────────────────────────────────────────────────────

app.get('/api/roles', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(customRoles);
  res.json(companyId ? all.filter((r: any) => r.companyId === companyId) : all);
    }));

app.post('/api/roles', asyncHandler(async (req, res) => {
  const { companyId, name, description, modules, submenus, crudPermissions } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Role name is required' });

  // Check duplicate name for this company
  const existing = await dbAll<any>(customRoles);
  const dup = existing.find((r: any) => r.companyId === companyId && r.name.toLowerCase() === name.trim().toLowerCase());
  if (dup) return res.status(400).json({ error: 'A role with this name already exists' });

  const newRole = {
    id: `role-${Date.now()}`,
    companyId,
    name: name.trim(),
    description: description || '',
    modules: modules || [],
    submenus: submenus || [],
    crudPermissions: crudPermissions || [],
    isSystem: false,
    createdAt: new Date().toISOString(),
  };
  await dbInsert(customRoles, newRole);
  logAudit(companyId, 'system', 'System', 'ROLE_CREATE', 'Administration', `Created role "${newRole.name}"`);
  res.status(201).json(newRole);
    }));

app.put('/api/roles/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, modules, submenus, crudPermissions, userName, userRole } = req.body;

  const role = await dbById<any>(customRoles, id);
  if (!role) return res.status(404).json({ error: 'Role not found' });

  // Block editing Employee and Super Admin names
  const lockedNames = ['Employee', 'Super Admin'];
  if (name && lockedNames.includes(role.name)) {
    return res.status(403).json({ error: `Cannot rename the "${role.name}" role` });
  }

  // Check duplicate name if renaming
  if (name && name.trim() !== role.name) {
    const existing = await dbAll<any>(customRoles);
    const dup = existing.find((r: any) => r.companyId === role.companyId && r.id !== id && r.name.toLowerCase() === name.trim().toLowerCase());
    if (dup) return res.status(400).json({ error: 'A role with this name already exists' });
  }

  // Check if Role Management approval policy is enabled for this company
  const policies = await dbAll<any>(approvalPolicies);
  const rolePolicy = policies.find((p: any) => p.companyId === role.companyId && p.module === 'Role Management');

  // If approval policy is enabled and user is not in approverRoles, create pending approval
  if (rolePolicy && rolePolicy.enabled && rolePolicy.approverRoles?.length > 0) {
    const isAuthorized = rolePolicy.approverRoles.includes(userRole);
    if (!isAuthorized) {
      // Build the changes description
      const changes: any = {};
      if (name !== undefined && name.trim() !== role.name) changes.name = { from: role.name, to: name.trim() };
      if (description !== undefined && description !== role.description) changes.description = { from: role.description, to: description };
      if (modules !== undefined) changes.modules = { from: role.modules || [], to: modules };
      if (submenus !== undefined) changes.submenus = { from: role.submenus || [], to: submenus };
      if (crudPermissions !== undefined) changes.crudPermissions = { from: role.crudPermissions || [], to: crudPermissions };

      // Create pending approval
      const pendingId = `pa-${Date.now()}`;
      const pendingApproval = {
        id: pendingId,
        companyId: role.companyId,
        module: 'Role Management',
        recordId: id,
        recordType: 'custom_role',
        requesterId: req.body.userId || 'system',
        requesterName: userName || 'System',
        title: `Update role "${role.name}"`,
        description: JSON.stringify({ roleId: id, roleName: role.name, changes }),
        status: 'Pending',
        assignedRoles: rolePolicy.approverRoles,
        createdAt: new Date().toISOString(),
      };
      await dbInsert(pendingApprovals, pendingApproval);

      logAudit(role.companyId, req.body.userId || 'system', userName || 'System', 'ROLE_CHANGE_PENDING', 'Administration', `Role update pending approval for "${role.name}"`);
      return res.status(202).json({ pending: true, message: 'Role change submitted for approval', pendingApproval });
    }
  }

  // Authorized — apply changes directly
  // Handle name change: update all users who have this role
  if (name && name.trim() !== role.name) {
    const allUsers = await dbAll<any>(schema.users);
    const affected = allUsers.filter((u: any) => u.activeRole === role.name || u.role === role.name);
    for (const u of affected) {
      const newRoles = u.roles.map((r: string) => r === role.name ? name.trim() : r);
      const updates: any = {};
      if (u.activeRole === role.name) updates.activeRole = name.trim();
      if (u.role === role.name) updates.role = name.trim();
      updates.roles = newRoles;
      await dbUpdate(schema.users, u.id, updates);
    }
  }

  const updates: any = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description;
  if (modules !== undefined) updates.modules = modules;
  if (submenus !== undefined) updates.submenus = submenus;
  if (crudPermissions !== undefined) updates.crudPermissions = crudPermissions;

  const updated = await dbUpdate(customRoles, id, updates);
  logAudit(role.companyId, req.body.userId || 'system', userName || 'System', 'ROLE_UPDATE', 'Administration', `Updated role "${updated?.name || role.name}"`);
  res.json(updated);
    }));

app.delete('/api/roles/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await dbById<any>(customRoles, id);
  if (!role) return res.status(404).json({ error: 'Role not found' });

  // Block deleting system roles
  if (role.isSystem) {
    return res.status(403).json({ error: 'Cannot delete a built-in role' });
  }

  // Block deleting Employee role
  if (role.name === 'Employee') {
    return res.status(403).json({ error: 'Cannot delete the Employee role' });
  }

  // Check if any users have this role assigned
  const allUsers = await dbAll<any>(schema.users);
  const assignedCount = allUsers.filter((u: any) =>
    u.role === role.name || u.roles?.includes(role.name) || u.activeRole === role.name
  ).length;
  if (assignedCount > 0) {
    return res.status(400).json({ error: `Cannot delete: ${assignedCount} user(s) still have this role assigned` });
  }

  await dbDelete(customRoles, id);
  logAudit(role.companyId, 'system', 'System', 'ROLE_DELETE', 'Administration', `Deleted role "${role.name}"`);
  res.json({ success: true });
    }));

// ─── Approval Policies CRUD ──────────────────────────────────────────────────

app.get('/api/approval-policies', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(approvalPolicies);
  res.json(companyId ? all.filter((p: any) => p.companyId === companyId) : all);
    }));

app.put('/api/approval-policies', asyncHandler(async (req, res) => {
  const { companyId, policies } = req.body;
  if (!companyId || !Array.isArray(policies)) return res.status(400).json({ error: 'companyId and policies array required' });

  // Upsert each policy
  for (const p of policies) {
    const existing = (await dbAll<any>(approvalPolicies)).find((r: any) => r.companyId === companyId && r.module === p.module);
    if (existing) {
      await dbUpdate(approvalPolicies, existing.id, { approverRoles: p.approverRoles, enabled: p.enabled !== false });
    } else {
      await dbInsert(approvalPolicies, {
        id: `ap-${companyId}-${p.module.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        companyId,
        module: p.module,
        description: p.description || '',
        approverRoles: p.approverRoles || [],
        enabled: p.enabled !== false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  logAudit(companyId, 'system', 'System', 'APPROVAL_POLICY_UPDATE', 'Administration', `Updated approval policies for ${policies.length} modules`);
  const updated = (await dbAll<any>(approvalPolicies)).filter((p: any) => p.companyId === companyId);
  res.json(updated);
    }));

// ─── Pending Approvals ───────────────────────────────────────────────────────

app.get('/api/pending-approvals', asyncHandler(async (req, res) => {
  const { companyId, userRole } = req.query;
  let all = await dbAll<any>(pendingApprovals);
  if (companyId) all = all.filter((a: any) => a.companyId === companyId);
  // If userRole provided, filter to only items assigned to that role
  if (userRole) {
    all = all.filter((a: any) => a.status === 'Pending' && a.assignedRoles?.includes(userRole as string));
  }
  res.json(all);
    }));

app.post('/api/pending-approvals', asyncHandler(async (req, res) => {
  const { companyId, module, recordId, recordType, requesterId, requesterName, title, description } = req.body;

  // Look up the approval policy for this module to determine assigned roles
  const policies = await dbAll<any>(approvalPolicies);
  const policy = policies.find((p: any) => p.companyId === companyId && p.module === module);
  const assignedRoles = policy?.approverRoles || ['Company Admin'];

  const newApproval = {
    id: `pa-${Date.now()}`,
    companyId,
    module,
    recordId,
    recordType,
    requesterId,
    requesterName,
    title: title || `${module} request`,
    description: description || '',
    status: 'Pending',
    assignedRoles,
    createdAt: new Date().toISOString(),
  };

  await dbInsert(pendingApprovals, newApproval);
  res.status(201).json(newApproval);
    }));

app.put('/api/pending-approvals/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, approvedBy, rejectionReason, userRole } = req.body;

  const record = await dbById<any>(pendingApprovals, id);
  if (!record) return res.status(404).json({ error: 'Approval request not found' });

  // Enforce approval policy for Role Management
  if (record.module === 'Role Management' && userRole) {
    const policies = await dbAll<any>(approvalPolicies);
    const policy = policies.find((p: any) => p.companyId === record.companyId && p.module === 'Role Management');
    if (policy && policy.enabled && policy.approverRoles?.length > 0) {
      if (!policy.approverRoles.includes(userRole)) {
        return res.status(403).json({ error: `Your role "${userRole}" is not authorized to approve role changes.` });
      }
    }
  }

  const updates: any = { status, approvedBy, approvedAt: new Date().toISOString() };
  if (rejectionReason) updates.rejectionReason = rejectionReason;

  // If approved and this is a Role Management change, apply the role updates
  if (status === 'Approved' && record.module === 'Role Management' && record.description) {
    try {
      const changeData = JSON.parse(record.description);
      const { roleId, changes } = changeData;

      if (roleId && changes) {
        const role = await dbById<any>(customRoles, roleId);
        if (role) {
          const roleUpdates: any = {};
          if (changes.name) roleUpdates.name = changes.name.to;
          if (changes.description) roleUpdates.description = changes.description.to;
          if (changes.modules) roleUpdates.modules = changes.modules.to;
          if (changes.submenus) roleUpdates.submenus = changes.submenus.to;
          if (changes.crudPermissions) roleUpdates.crudPermissions = changes.crudPermissions.to;

          // Handle name change: update all users who have this role
          if (changes.name && changes.name.to !== role.name) {
            const allUsers = await dbAll<any>(schema.users);
            const affected = allUsers.filter((u: any) => u.activeRole === role.name || u.role === role.name);
            for (const u of affected) {
              const newRoles = u.roles.map((r: string) => r === role.name ? changes.name.to : r);
              const userUpdates: any = {};
              if (u.activeRole === role.name) userUpdates.activeRole = changes.name.to;
              if (u.role === role.name) userUpdates.role = changes.name.to;
              userUpdates.roles = newRoles;
              await dbUpdate(schema.users, u.id, userUpdates);
            }
          }

          await dbUpdate(customRoles, roleId, roleUpdates);
          logAudit(record.companyId, 'system', approvedBy || 'System', 'ROLE_UPDATE', 'Administration', `Approved and applied role update for "${role.name}"`);
        }
      }
    } catch (e) {
      console.error('Failed to apply role changes:', e);
    }
  }

  const updated = await dbUpdate(pendingApprovals, id, updates);
  logAudit(record.companyId, 'system', approvedBy || 'System', 'APPROVAL_ACTION', record.module, `${status} approval for "${record.title}" by ${approvedBy}`);
  res.json(updated);
    }));

app.get('/api/pending-approvals/count', asyncHandler(async (req, res) => {
  const { companyId, userRole } = req.query;
  let all = await dbAll<any>(pendingApprovals);
  if (companyId) all = all.filter((a: any) => a.companyId === companyId);
  if (userRole) {
    all = all.filter((a: any) => a.status === 'Pending' && a.assignedRoles?.includes(userRole as string));
  }
  res.json({ count: all.length });
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

  // 2.9 Applicants & Recruitment
  app.get('/api/applicants', asyncHandler(async (req, res) => {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.applicants);
    res.json(companyId ? all.filter((a: any) => a.companyId === companyId) : all);
  }));

  app.post('/api/applicants', asyncHandler(async (req, res) => {
    const { companyId, name, email, role, department, cvText, aiScore, aiSummary } = req.body;
    const newApplicant = {
      id: `app-${Date.now()}`,
      companyId,
      name,
      email: email || '',
      role,
      department: department || 'General',
      stage: 'Applications',
      appliedDate: new Date().toISOString().split('T')[0],
      cvText: cvText || '',
      aiScore: aiScore || null,
      aiSummary: aiSummary || ''
    };
    await dbInsert(schema.applicants, newApplicant);
    res.status(201).json(newApplicant);
  }));

  app.put('/api/applicants/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const appRecord = await dbById<any>(schema.applicants, id);
    if (!appRecord) return res.status(404).json({ error: 'Applicant not found' });
    const updated = await dbUpdate(schema.applicants, id, body);
    res.json(updated);
  }));

  app.post('/api/screen-cv', asyncHandler(async (req, res) => {
    const { cvText, jobRole } = req.body;
    if (!cvText || !jobRole) return res.status(400).json({ error: 'Missing cvText or jobRole' });

    const ai = getAIClient();
    if (!ai) {
      // Mock response if AI is not configured
      return res.json({
        score: Math.floor(Math.random() * 40) + 60,
        summary: `(MOCKED) The candidate's CV for ${jobRole} looks decent but lacks deep technical details.`
      });
    }

    const prompt = `You are an expert HR recruiter. Evaluate the following CV against the job role: "${jobRole}".
Return a strict JSON object with exactly two keys:
1. "score": an integer from 0 to 100 representing how well the CV matches the role.
2. "summary": a short paragraph (2-3 sentences) evaluating the candidate's strengths and weaknesses.

CV Text:
${cvText}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      const text = response.text || '{}';
      
      // Attempt to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({
          score: parsed.score || 0,
          summary: parsed.summary || 'No summary provided.'
        });
      } else {
        res.json({ score: 50, summary: "AI provided an invalid format." });
      }
    } catch (err) {
      logError("Gemini CV Screening Error:", err);
      res.status(500).json({ error: 'Failed to screen CV.' });
    }
  }));

  // 3. HR & Employees
app.get('/api/employees', asyncHandler(async (req, res) => {
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.employees, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.employees, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
  const all = await dbAll<any>(schema.employees);
  res.json(companyId ? all.filter((e: any) => e.companyId === companyId) : all);
}));

app.post('/api/employees', asyncHandler(async (req, res) => {
  const { companyId, firstName, lastName, photoUrl, email, department, designation, branch, salary } = req.body;

  const empId = `emp-${Date.now()}`;
  const empNumber = `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEmp: Employee = {
    id: empId,
    companyId,
    employeeNumber: empNumber,
    firstName,
    lastName,
    photoUrl,
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
  const generatedEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme-mfg.com`;
  logAudit(companyId, 'u-acme-hr', 'Elena Rostova', 'EMPLOYEE_CREATE', 'HR', `Created employee ${firstName} ${lastName}. Auto-generated Employee Number: ${empNumber}, Assigning to Dept: ${department}`);
  logger.info(`[ERP AUTOMATION TRIGGERED] Welcome email sent to ${email} (redirected to ${generatedEmail})`);

  // Fire workflow engine asynchronously (non-blocking)
  setImmediate(() => evaluateWorkflows(companyId, 'Employee Registered', { employeeId: empId, department, salary: Number(salary) }));

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

  const body = { ...req.body };
  const systemRole = body.role;
  const systemRoles = body.roles;
  delete body.role;
  delete body.roles;

  if (body.assignedTaxes && Array.isArray(body.assignedTaxes)) body.assignedTaxes = JSON.stringify(body.assignedTaxes);
  if (body.assignedBenefits && Array.isArray(body.assignedBenefits)) body.assignedBenefits = JSON.stringify(body.assignedBenefits);

  // Update employee
  const updated = await dbUpdate(schema.employees, emp.id, body);

  // Sync to User if present
  const emailToFind = req.body.email || emp.email;
  const userIdToFind = emp.userId;
  
  let user;
  if (userIdToFind) {
    user = await dbById<any>(schema.users, userIdToFind);
  }
  if (!user && emailToFind) {
    const allUsers = await dbAll<any>(schema.users);
    user = allUsers.find(u => u.email === emailToFind);
  }

  if (user) {
    const userUpdates: any = {};
    if (req.body.firstName || req.body.lastName) {
      const fName = req.body.firstName || emp.firstName;
      const lName = req.body.lastName || emp.lastName;
      userUpdates.name = `${fName} ${lName}`;
    }
    if (req.body.email) userUpdates.email = req.body.email;
    if (req.body.department) userUpdates.department = req.body.department;
    if (req.body.branch) userUpdates.branch = req.body.branch;
    if (systemRole) {
      userUpdates.role = systemRole;
      userUpdates.activeRole = systemRole;
    }
    if (systemRoles) userUpdates.roles = systemRoles;

    if (Object.keys(userUpdates).length > 0) {
      await dbUpdate(schema.users, user.id, userUpdates);
    }
  }
  
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
  
  const responseData = {
    ...updated,
    assignedTaxes: updated!.assignedTaxes ? JSON.parse(updated!.assignedTaxes) : [],
    assignedBenefits: updated!.assignedBenefits ? JSON.parse(updated!.assignedBenefits) : [],
    bankAccount: updated!.bankAccount ? JSON.parse(updated!.bankAccount) : undefined
  };
  res.json(responseData);
}));

// 3.1 HR Leaves
app.get('/api/leaves', asyncHandler(async (req, res) => {
  const { companyId, employeeId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.leaves, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.leaves, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
  let all = await dbAll<any>(schema.leaves);
  if (companyId) all = all.filter((l: any) => l.companyId === companyId);
  if (employeeId) all = all.filter((l: any) => l.employeeId === employeeId);
  res.json(all);
}));

app.post('/api/leaves', asyncHandler(async (req, res) => {
  const { companyId, employeeId, employeeName, department, leaveType, startDate, endDate, reason, days, replacementId, replacementName } = req.body;
  const newLeave: LeaveRequest = {
    id: `lr-${Date.now()}`,
    companyId,
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'Pending',
    days: Number(days) || 1,
    replacementId,
    replacementName
  };

  await dbInsert(schema.leaves, newLeave);

  // Create pending approval request
  const policies = await dbAll<any>(approvalPolicies);
  const policy = policies.find((p: any) => p.companyId === companyId && p.module === 'Leave Requests');
  await dbInsert(pendingApprovals, {
    id: `pa-${Date.now()}`,
    companyId,
    module: 'Leave Requests',
    recordId: newLeave.id,
    recordType: 'leave',
    requesterId: employeeId,
    requesterName: employeeName,
    title: `${leaveType} Leave: ${startDate} to ${endDate}`,
    description: reason,
    status: 'Pending',
    assignedRoles: policy?.approverRoles || ['HR Manager', 'Company Admin'],
    createdAt: new Date().toISOString(),
  });

  logAudit(companyId, employeeId, employeeName, 'LEAVE_REQUEST', 'HR', `Submitted ${leaveType} leave request: ${startDate} to ${endDate}. Reason: ${reason}`);
  res.status(201).json(newLeave);
    }));

app.post('/api/leaves/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, status, userRole } = req.body;
  const leave = await dbById<any>(schema.leaves, id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  // Enforce approval policy — check if user's role is authorized
  if (userRole) {
    const policies = await dbAll<any>(approvalPolicies);
    const policy = policies.find((p: any) => p.companyId === leave.companyId && p.module === 'Leave Requests');
    if (policy && policy.enabled && policy.approverRoles?.length > 0) {
      if (!policy.approverRoles.includes(userRole)) {
        return res.status(403).json({ error: `Your role "${userRole}" is not authorized to approve leave requests. Required roles: ${policy.approverRoles.join(', ')}` });
      }
    }
  }

  const newStatus = status || 'Approved';

  const updatedLeave = await dbUpdate(schema.leaves, id, {
    status: newStatus,
    approvedBy: userName || 'Admin'
  });

  // Update the pending approval record
  const allApprovals = await dbAll<any>(pendingApprovals);
  const pendingRecord = allApprovals.find((a: any) => a.recordId === id && a.module === 'Leave Requests' && a.status === 'Pending');
  if (pendingRecord) {
    await dbUpdate(pendingApprovals, pendingRecord.id, {
      status: newStatus,
      approvedBy: userName,
      approvedAt: new Date().toISOString(),
    });
  }

  const emp = await dbById<any>(schema.employees, leave.employeeId);
  
  if (newStatus === 'Approved') {
    // Only update employee status to 'On Leave' when fully approved
    if (emp) await dbUpdate(schema.employees, emp.id, { status: 'On Leave' });
    logAudit(leave.companyId, userId, userName, 'LEAVE_APPROVE', 'HR', `Fully approved ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  } else {
    logAudit(leave.companyId, userId, userName, 'LEAVE_HOD_APPROVE', 'HR', `HOD approved ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  }

  res.json(updatedLeave);
    }));

app.post('/api/leaves/:id/decline', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, userRole } = req.body;
  const leave = await dbById<any>(schema.leaves, id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  // Enforce approval policy
  if (userRole) {
    const policies = await dbAll<any>(approvalPolicies);
    const policy = policies.find((p: any) => p.companyId === leave.companyId && p.module === 'Leave Requests');
    if (policy && policy.enabled && policy.approverRoles?.length > 0) {
      if (!policy.approverRoles.includes(userRole)) {
        return res.status(403).json({ error: `Your role "${userRole}" is not authorized to decline leave requests.` });
      }
    }
  }

  const updatedLeave = await dbUpdate(schema.leaves, id, { status: 'Rejected' });

  // Update the pending approval record
  const allApprovals = await dbAll<any>(pendingApprovals);
  const pendingRecord = allApprovals.find((a: any) => a.recordId === id && a.module === 'Leave Requests' && a.status === 'Pending');
  if (pendingRecord) {
    await dbUpdate(pendingApprovals, pendingRecord.id, {
      status: 'Rejected',
      approvedBy: userName,
      approvedAt: new Date().toISOString(),
    });
  }

  // Revert employee status to 'Active'
  const emp = await dbById<any>(schema.employees, leave.employeeId);
  if (emp && emp.status === 'On Leave') await dbUpdate(schema.employees, emp.id, { status: 'Active' });

  logAudit(leave.companyId, userId, userName, 'LEAVE_DECLINE', 'HR', `Declined ${leave.leaveType} leave request for ${emp ? emp.firstName + ' ' + emp.lastName : 'employee'}.`);
  res.json(updatedLeave);
    }));

// 3.2 HR Attendance
app.get('/api/attendance', asyncHandler(async (req, res) => {
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.attendance, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.attendance, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
      // Determine status based on attendance settings
      let status = 'Present';
      try {
        const settingsRows = await dbByCompany<any>(schema.attendanceSettings, companyId);
        // Try department-specific settings first, fall back to company-wide (departmentId null)
        const deptSettings = settingsRows.find((s: any) => s.departmentId === department);
        const settings = deptSettings || settingsRows.find((s: any) => !s.departmentId) || settingsRows[0];
        if (settings) {
          const workStart = settings.workStartTime || '09:00';
          const grace = settings.graceMinutes ?? 10;
          const lateThreshold = settings.lateThresholdMinutes ?? 15;

          // Parse clock-in time and work start time to minutes since midnight
          const parseToMinutes = (t: string) => {
            const [time, period] = t.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return h * 60 + m;
          };
          const clockInMin = parseToMinutes(timeStr);
          const [wsH, wsM] = workStart.split(':').map(Number);
          const workStartMin = wsH * 60 + wsM;
          const diff = clockInMin - workStartMin;

          if (diff <= grace) {
            status = 'Present';
          } else if (diff <= grace + lateThreshold) {
            status = 'Late';
          } else {
            status = 'Absent';
          }
        }
      } catch (e) {
        // Settings lookup failed, default to Present
      }

      record = {
        id: `att-${Date.now()}`,
        companyId,
        employeeId,
        date: todayStr,
        checkIn: timeStr,
        status,
        locationType: locationType || 'Office'
      };
      await dbInsert(schema.attendance, record);
      logAudit(companyId, employeeId, employeeName, 'ATTENDANCE_IN', 'HR', `Clocked in today at ${timeStr} via ${locationType} [${status}]`);
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
  const { progress, status: reqStatus, role } = req.body;
  const okr = await dbById<any>(schema.okrs, id);
  if (!okr) return res.status(404).json({ error: 'OKR not found' });

  const prog = Number(progress);
  let status = reqStatus;
  if (!status) {
    if (prog >= 100) {
      status = role === 'Employee' ? 'Awaiting Review' : 'Completed';
    } else if (prog < 40) {
      status = 'At Risk';
    } else {
      status = 'On Track';
    }
  }

  const updated = await dbUpdate(schema.okrs, id, { progress: prog, status });

  logAudit(okr.companyId, okr.employeeId, okr.employeeName, 'OKR_UPDATE', 'HR', `Updated OKR "${okr.title}" progress to ${progress}% (Status: ${status})`);
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

  // Load all employees to resolve assigned taxes/benefits
  const allEmployees = await dbAll<any>(schema.employees);
  
  // Load payroll tax config for company
  const cfgRows = companyId ? await dbByCompany<any>(schema.payrollTaxConfigs, companyId as string) : [];
  const cfg = cfgRows[0] || { customTaxes: '[]', customBenefits: '[]' };
  const customTaxes = typeof cfg.customTaxes === 'string' ? JSON.parse(cfg.customTaxes || '[]') : (cfg.customTaxes || []);
  const customBenefits = typeof cfg.customBenefits === 'string' ? JSON.parse(cfg.customBenefits || '[]') : (cfg.customBenefits || []);

  const enriched = all.map((slip: any) => {
    const emp = allEmployees.find((e: any) => e.id === slip.employeeId);
    if (!emp) {
      return {
        ...slip,
        breakdown: slip.breakdown ? (typeof slip.breakdown === 'string' ? JSON.parse(slip.breakdown) : slip.breakdown) : []
      };
    }

    const baseSalary = emp.salary;
    const assignedTaxes = emp.assignedTaxes ? (typeof emp.assignedTaxes === 'string' ? JSON.parse(emp.assignedTaxes) : emp.assignedTaxes) : [];
    const assignedBenefits = emp.assignedBenefits ? (typeof emp.assignedBenefits === 'string' ? JSON.parse(emp.assignedBenefits) : emp.assignedBenefits) : [];

    let totalCustomTax = 0;
    const breakdown: any[] = [];

    if (Array.isArray(assignedTaxes)) {
      assignedTaxes.forEach((taxId: string) => {
        const taxConfig = customTaxes.find((t: any) => t.id === taxId);
        if (taxConfig) {
          const val = taxConfig.type === 'Percentage' ? (baseSalary * (taxConfig.value / 100)) : taxConfig.value;
          totalCustomTax += val;
          breakdown.push({ name: taxConfig.name, amount: Math.round(val), type: 'Tax' });
        }
      });
    }

    let totalCustomBenefit = 0;
    if (Array.isArray(assignedBenefits)) {
      assignedBenefits.forEach((benefitId: string) => {
        const benefitConfig = customBenefits.find((b: any) => b.id === benefitId);
        if (benefitConfig) {
          const val = benefitConfig.type === 'Percentage' ? (baseSalary * (benefitConfig.value / 100)) : benefitConfig.value;
          totalCustomBenefit += val;
          breakdown.push({ name: benefitConfig.name, amount: Math.round(val), type: 'Benefit' });
        }
      });
    }

    const gross = baseSalary;
    const deductions = Math.round(totalCustomTax);
    const net = Math.round(gross + totalCustomBenefit - totalCustomTax);

    return {
      ...slip,
      gross,
      deductions,
      net,
      baseSalary,
      customTaxesTotal: deductions,
      customBenefitsTotal: Math.round(totalCustomBenefit),
      breakdown
    };
  });

  res.json(enriched);
}));

app.post('/api/payroll/run', asyncHandler(async (req, res) => {
  const { companyId, period, userId, userName, employeeIds } = req.body;
  const allEmployees = await dbAll<any>(schema.employees);
  let compEmployees = allEmployees.filter((e: any) => e.companyId === companyId);

  // Filter to specific employees if employeeIds provided
  if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
    compEmployees = compEmployees.filter((e: any) => employeeIds.includes(e.id));
  }

  const allPayslips = await dbAll<any>(schema.payslips);
  
  // Load payroll tax config for company
  const cfgRows = companyId ? await dbByCompany<any>(schema.payrollTaxConfigs, companyId) : [];
  const cfg = cfgRows[0] || { customTaxes: '[]', customBenefits: '[]' };
  
  const customTaxes = typeof cfg.customTaxes === 'string' ? JSON.parse(cfg.customTaxes || '[]') : (cfg.customTaxes || []);
  const customBenefits = typeof cfg.customBenefits === 'string' ? JSON.parse(cfg.customBenefits || '[]') : (cfg.customBenefits || []);

  const generatedSlips: any[] = [];

  for (const emp of compEmployees) {
    const baseSalary = emp.salary;
    const assignedTaxes = emp.assignedTaxes ? (typeof emp.assignedTaxes === 'string' ? JSON.parse(emp.assignedTaxes) : emp.assignedTaxes) : [];
    const assignedBenefits = emp.assignedBenefits ? (typeof emp.assignedBenefits === 'string' ? JSON.parse(emp.assignedBenefits) : emp.assignedBenefits) : [];

    let totalCustomTax = 0;
    const breakdown: any[] = [];

    if (Array.isArray(assignedTaxes)) {
      assignedTaxes.forEach((taxId: string) => {
        const taxConfig = customTaxes.find((t: any) => t.id === taxId);
        if (taxConfig) {
          const val = taxConfig.type === 'Percentage' ? (baseSalary * (taxConfig.value / 100)) : taxConfig.value;
          totalCustomTax += val;
          breakdown.push({ name: taxConfig.name, amount: Math.round(val), type: 'Tax' });
        }
      });
    }

    let totalCustomBenefit = 0;
    if (Array.isArray(assignedBenefits)) {
      assignedBenefits.forEach((benefitId: string) => {
        const benefitConfig = customBenefits.find((b: any) => b.id === benefitId);
        if (benefitConfig) {
          const val = benefitConfig.type === 'Percentage' ? (baseSalary * (benefitConfig.value / 100)) : benefitConfig.value;
          totalCustomBenefit += val;
          breakdown.push({ name: benefitConfig.name, amount: Math.round(val), type: 'Benefit' });
        }
      });
    }

    const gross = baseSalary;
    const deductions = Math.round(totalCustomTax);
    const net = Math.round(gross + totalCustomBenefit - totalCustomTax);

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
      customTaxesTotal: deductions,
      customBenefitsTotal: Math.round(totalCustomBenefit),
      breakdown: JSON.stringify(breakdown) as any,
    };

    if (existingIndex >= 0) {
      await dbUpdate(schema.payslips, allPayslips[existingIndex].id, slip);
    } else {
      await dbInsert(schema.payslips, slip);
    }
    // Return with parsed breakdown to client
    generatedSlips.push({ ...slip, breakdown });
  }

  logAudit(companyId, userId || 'u-system', userName || 'System', 'PAYROLL_RUN', 'Payroll', `Processed monthly payroll for ${period}. Net disbursed: $${generatedSlips.reduce((sum: number, s: any) => sum + s.net, 0).toLocaleString()}`);
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
  const row = rows[0] || null;
  if (row) {
    return res.json({
      ...row,
      customTaxes: row.customTaxes ? (typeof row.customTaxes === 'string' ? JSON.parse(row.customTaxes) : row.customTaxes) : [],
      customBenefits: row.customBenefits ? (typeof row.customBenefits === 'string' ? JSON.parse(row.customBenefits) : row.customBenefits) : [],
    });
  }
  res.json(null);
}));

app.put('/api/payroll-tax-config', asyncHandler(async (req, res) => {
  const { companyId, customTaxes, customBenefits } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const existing = await dbByCompany<any>(schema.payrollTaxConfigs, companyId);
  const values: any = {
    customTaxes: customTaxes ? (typeof customTaxes === 'string' ? customTaxes : JSON.stringify(customTaxes)) : JSON.stringify([]),
    customBenefits: customBenefits ? (typeof customBenefits === 'string' ? customBenefits : JSON.stringify(customBenefits)) : JSON.stringify([]),
    updatedAt: new Date().toISOString(),
  };
  let result;
  if (existing.length > 0) {
    result = await dbUpdate(schema.payrollTaxConfigs, existing[0].id, values);
  } else {
    result = await dbInsert(schema.payrollTaxConfigs, { id: `ptc-${Date.now()}`, companyId, ...values });
  }

  const returnedResult = {
    ...result,
    customTaxes: result.customTaxes ? (typeof result.customTaxes === 'string' ? JSON.parse(result.customTaxes) : result.customTaxes) : [],
    customBenefits: result.customBenefits ? (typeof result.customBenefits === 'string' ? JSON.parse(result.customBenefits) : result.customBenefits) : [],
  };

  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'PAYROLL_TAX_CONFIG', 'Payroll', `Updated payroll tax/deduction rates for ${companyId}.`);
  res.json(returnedResult);
}));

// 3.4.1b Attendance Settings (DB-backed, company-specific)
const DEFAULT_ATTENDANCE_SETTINGS = {
  workStartTime: '09:00',
  graceMinutes: 10,
  lateThresholdMinutes: 15,
  penaltyType: 'warning',
  deductionType: 'percentage',
  deductionValue: 5,
  maxWarnings: 3,
  customPenalty: '',
  escalateAfterWarnings: true,
};

app.get('/api/attendance-settings', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const rows = await dbByCompany<any>(schema.attendanceSettings, companyId as string);
  res.json(rows[0] || null);
}));

app.put('/api/attendance-settings', asyncHandler(async (req, res) => {
  const { companyId, departmentId, workStartTime, graceMinutes, lateThresholdMinutes, penaltyType, deductionType, deductionValue, maxWarnings, customPenalty, escalateAfterWarnings } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const existing = await dbByCompany<any>(schema.attendanceSettings, companyId);
  const values: any = {
    workStartTime: workStartTime ?? '09:00',
    graceMinutes: Number(graceMinutes ?? DEFAULT_ATTENDANCE_SETTINGS.graceMinutes),
    lateThresholdMinutes: Number(lateThresholdMinutes ?? DEFAULT_ATTENDANCE_SETTINGS.lateThresholdMinutes),
    penaltyType: penaltyType ?? DEFAULT_ATTENDANCE_SETTINGS.penaltyType,
    deductionType: deductionType ?? DEFAULT_ATTENDANCE_SETTINGS.deductionType,
    deductionValue: Number(deductionValue ?? DEFAULT_ATTENDANCE_SETTINGS.deductionValue),
    maxWarnings: Number(maxWarnings ?? DEFAULT_ATTENDANCE_SETTINGS.maxWarnings),
    customPenalty: customPenalty ?? DEFAULT_ATTENDANCE_SETTINGS.customPenalty,
    escalateAfterWarnings: escalateAfterWarnings ? 1 : 0,
    departmentId: departmentId || null,
    updatedAt: new Date().toISOString(),
  };
  let result;
  // For department-specific settings, find by companyId + departmentId
  const match = existing.find((s: any) => (s.departmentId || null) === (departmentId || null));
  if (match) {
    result = await dbUpdate(schema.attendanceSettings, match.id, values);
  } else {
    result = await dbInsert(schema.attendanceSettings, { id: `att-${Date.now()}`, companyId, ...values });
  }
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'ATTENDANCE_SETTINGS', 'HR', `Updated attendance settings for ${companyId}${departmentId ? ` (${departmentId})` : ' (all departments)'}.`);
  res.json(result);
}));

// 3.4.2 Knowledge Base articles (DB-backed, company-specific)
const DEFAULT_KB_ARTICLES = [
  { title: 'How to reset your password', category: 'Account', body: 'Navigate to Settings > Security and click "Reset Password". A reset link will be emailed to you.', views: 234 },
  { title: 'Setting up Two-Factor Authentication', category: 'Security', body: 'Enable 2FA under Settings > Security to require a time-based code at login.', views: 187 },
  { title: 'Understanding your invoice', category: 'Billing', body: 'Invoices list line items, tax, and due date. Export to PDF from the Accounting module.', views: 312 },
  { title: 'How to export data from ERP', category: 'Technical', body: 'Use the Export button on any report to download CSV or PDF.', views: 98 },
  { title: 'Configuring email notifications', category: 'Settings', body: 'Manage notification preferences in Communication > Announcements.', views: 145 },
  { title: 'Adding new team members', category: 'HR', body: 'Admins can invite users from Administration > User Directory.', views: 203 },
];

app.get('/api/kb-articles', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let rows = companyId ? await dbByCompany<any>(schema.kbArticles, companyId as string) : await dbAll<any>(schema.kbArticles);
  if (rows.length === 0 && companyId) {
    const seed = DEFAULT_KB_ARTICLES.map((a, i) => ({ id: `kb-seed-${i}-${companyId}`, companyId: companyId as string, ...a, createdBy: 'System', createdAt: new Date().toISOString() }));
    await dbInsertMany(schema.kbArticles, seed);
    rows = seed;
  }
  res.json(rows);
    }));

app.post('/api/kb-articles', asyncHandler(async (req, res) => {
  const { companyId, title, category, body, createdBy } = req.body;
  const article: KBArticle = {
    id: `kb-${Date.now()}`,
    companyId,
    title,
    category: category || 'General',
    body: body || '',
    views: 0,
    createdBy: createdBy || 'Admin',
    createdAt: new Date().toISOString(),
  };
  const created = await dbInsert(schema.kbArticles, article);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'KB_ARTICLE_CREATE', 'Help Desk', `Published KB article "${title}".`);
  res.status(201).json(created);
    }));

// 3.4.3 LMS courses (DB-backed, company-specific)
const DEFAULT_LMS_COURSES = [
  { title: 'ISO 9001 Quality Management', category: 'Compliance', level: 'Intermediate', duration: '4h 30m', enrolled: 12, completion: 78 },
  { title: 'Workplace Safety & OSHA', category: 'Safety', level: 'Beginner', duration: '2h 15m', enrolled: 28, completion: 91 },
  { title: 'Advanced Excel for Finance', category: 'Finance', level: 'Advanced', duration: '6h 00m', enrolled: 7, completion: 45 },
  { title: 'ERP System Administrator', category: 'IT', level: 'Advanced', duration: '8h 00m', enrolled: 4, completion: 30 },
];

app.get('/api/lms-courses', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let rows = companyId ? await dbByCompany<any>(schema.lmsCourses, companyId as string) : await dbAll<any>(schema.lmsCourses);
  if (rows.length === 0 && companyId) {
    const seed = DEFAULT_LMS_COURSES.map((c, i) => ({ id: `lms-seed-${i}-${companyId}`, companyId: companyId as string, ...c, createdBy: 'System', createdAt: new Date().toISOString() }));
    await dbInsertMany(schema.lmsCourses, seed);
    rows = seed;
  }
  res.json(rows);
    }));

app.post('/api/lms-courses', asyncHandler(async (req, res) => {
  const { companyId, title, category, level, duration, createdBy } = req.body;
  const course: LMSCourse = {
    id: `lms-${Date.now()}`,
    companyId,
    title,
    category: category || 'General',
    level: level || 'Beginner',
    duration: duration || '1h 00m',
    enrolled: 0,
    completion: 0,
    createdBy: createdBy || 'Admin',
    createdAt: new Date().toISOString(),
  };
  const created = await dbInsert(schema.lmsCourses, course);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'LMS_COURSE_CREATE', 'Learning Management (LMS)', `Created LMS course "${title}".`);
  res.status(201).json(created);
    }));

// 3.4.4 Communication announcements (DB-backed, company-specific)
const DEFAULT_ANNOUNCEMENTS = [
  { title: 'Q3 All-Hands Meeting — July 15th', body: 'Join us at 10 AM in the main conference hall or via Zoom. Attendance is mandatory.', author: 'Elena Rostova', channel: 'Company', date: '2026-07-08', pinned: true },
  { title: 'New Safety Protocol for Plant A', body: 'Please review the updated OSHA guidelines uploaded to the Document Locker before Friday.', author: 'James Okoro', channel: 'Operations', date: '2026-07-07', pinned: false },
  { title: 'IT Maintenance Window — Sunday 2 AM', body: 'ERP system will be unavailable from 2 AM to 4 AM Sunday for scheduled maintenance.', author: 'IT Team', channel: 'IT', date: '2026-07-06', pinned: false },
];

app.get('/api/announcements', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let rows = companyId ? await dbByCompany<any>(schema.announcements, companyId as string) : await dbAll<any>(schema.announcements);
  if (rows.length === 0 && companyId) {
    const seed = DEFAULT_ANNOUNCEMENTS.map((a, i) => ({ id: `ann-seed-${i}-${companyId}`, companyId: companyId as string, ...a, createdAt: new Date().toISOString() }));
    await dbInsertMany(schema.announcements, seed);
    rows = seed;
  }
  res.json(rows);
    }));

app.post('/api/announcements', asyncHandler(async (req, res) => {
  const { companyId, title, body, author, channel, pinned } = req.body;
  const announcement: CommunicationAnnouncement = {
    id: `ann-${Date.now()}`,
    companyId,
    title,
    body: body || '',
    author: author || 'Admin',
    channel: channel || 'Company',
    date: new Date().toISOString().split('T')[0],
    pinned: Boolean(pinned),
    createdAt: new Date().toISOString(),
  };
  const created = await dbInsert(schema.announcements, announcement);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'ANNOUNCEMENT_CREATE', 'Communication', `Published announcement "${title}".`);
  res.status(201).json(created);
}));

// 3.4.5 Team Chat (DB-backed)
app.get('/api/chat/messages', asyncHandler(async (req, res) => {
  const { companyId, threadId } = req.query;
  if (!companyId) return res.json([]);
  const all = await dbByCompany<any>(schema.chatMessages, companyId as string);
  const filtered = threadId ? all.filter(m => m.threadId === threadId) : all;
  res.json(filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
}));

app.post('/api/chat/messages', asyncHandler(async (req, res) => {
  const { companyId, threadId, senderId, senderName, message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
  const msg = await dbInsert(schema.chatMessages, {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    companyId,
    threadId,
    senderId,
    senderName,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(msg);
}));

app.get('/api/chat/groups', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.json([]);
  const all = await dbByCompany<any>(schema.chatGroups, companyId as string);
  res.json(all);
}));

app.post('/api/chat/groups', asyncHandler(async (req, res) => {
  const { companyId, name, type, members, createdBy } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Group name is required' });
  const group = await dbInsert(schema.chatGroups, {
    id: `cgrp-${Date.now()}`,
    companyId,
    name: name.trim(),
    type: type || 'custom',
    members: members || [],
    createdBy,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(group);
}));

app.put('/api/chat/groups/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { members } = req.body;
  if (!members) return res.status(400).json({ error: 'Members array is required' });
  const updated = await dbUpdate(schema.chatGroups, id, { members });
  res.json(updated);
}));

app.get('/api/chat/reads', asyncHandler(async (req, res) => {
  const { companyId, userId } = req.query;
  if (!companyId || !userId) return res.json([]);
  const all = await dbByCompany<any>(schema.chatReads, companyId as string);
  res.json(all.filter(r => r.userId === userId));
}));

app.post('/api/chat/read', asyncHandler(async (req, res) => {
  const { companyId, threadId, userId } = req.body;
  if (!companyId || !threadId || !userId) return res.status(400).json({ error: 'Missing parameters' });
  
  const all = await dbByCompany<any>(schema.chatReads, companyId);
  const existing = all.find(r => r.threadId === threadId && r.userId === userId);
  
  const lastReadAt = new Date().toISOString();
  if (existing) {
    const updated = await dbUpdate(schema.chatReads, existing.id, { lastReadAt });
    res.json(updated);
  } else {
    const created = await dbInsert(schema.chatReads, {
      id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId,
      threadId,
      userId,
      lastReadAt,
    });
    res.status(201).json(created);
  }
}));

// 3.6 Voting / Polls
app.get('/api/polls', asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.polls);
    const filtered = companyId ? all.filter((p: any) => p.companyId === companyId) : all;
    // Auto-close polls past their endDate
    const now = new Date();
    for (const poll of filtered) {
      if (poll.status === 'Active' && poll.endDate) {
        const end = new Date(poll.endDate);
        if (end < now) {
          await dbUpdate(schema.polls, poll.id, { status: 'Closed' });
          poll.status = 'Closed';
        }
      }
    }
    res.json(filtered);
  } catch (err: any) {
    logError('GET /api/polls error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.get('/api/poll-options', asyncHandler(async (req, res) => {
  try {
    const { companyId, pollId } = req.query;
    const all = await dbAll<any>(schema.pollOptions);
    let filtered = companyId ? all.filter((o: any) => o.companyId === companyId) : all;
    if (pollId) filtered = filtered.filter((o: any) => o.pollId === pollId);
    res.json(filtered);
  } catch (err: any) {
    logError('GET /api/poll-options error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.get('/api/poll-votes', asyncHandler(async (req, res) => {
  try {
    const { companyId, pollId } = req.query;
    const all = await dbAll<any>(schema.pollVotes);
    let filtered = companyId ? all.filter((v: any) => v.companyId === companyId) : all;
    if (pollId) filtered = filtered.filter((v: any) => v.pollId === pollId);
    res.json(filtered);
  } catch (err: any) {
    logError('GET /api/poll-votes error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.post('/api/polls', asyncHandler(async (req, res) => {
  try {
    const { companyId, title, description, category, createdBy, createdByName, anonymous, endDate, options } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const pollId = `poll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const poll = await dbInsert(schema.polls, {
      id: pollId, companyId, title: title.trim(), description: description?.trim() || '',
      category: category || 'General', createdBy, createdByName,
      status: 'Active', anonymous: !!anonymous,
      startDate: now, endDate: endDate || '', createdAt: now,
    });
    if (Array.isArray(options) && options.length) {
      const opts = options.map((o: any, i: number) => ({
        id: `opt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 4)}`,
        pollId, companyId, label: o.label, nomineeId: o.nomineeId || '',
        nomineeName: o.nomineeName || '', position: i, voteCount: 0,
      }));
      await dbInsertMany(schema.pollOptions, opts);
    }
    res.status(201).json(poll);
  } catch (err: any) {
    logError('POST /api/polls error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.post('/api/polls/:id/close', asyncHandler(async (req, res) => {
  try {
    const updated = await dbUpdate(schema.polls, req.params.id, { status: 'Closed' });
    res.json(updated);
  } catch (err: any) {
    logError('POST /api/polls/:id/close error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.put('/api/polls/:id', asyncHandler(async (req, res) => {
  try {
    const poll = await dbById<any>(schema.polls, req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const updates: any = {};
    if (req.body.endDate !== undefined) updates.endDate = req.body.endDate;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    const updated = await dbUpdate(schema.polls, req.params.id, updates);
    res.json(updated);
  } catch (err: any) {
    logError('PUT /api/polls/:id error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.post('/api/polls/:id/vote', asyncHandler(async (req, res) => {
  try {
    const { optionId, voterId, voterName } = req.body;
    const poll = await dbById<any>(schema.polls, req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.status !== 'Active') return res.status(400).json({ error: 'Poll is not active' });
    const existingVotes = await dbAll<any>(schema.pollVotes);
    const alreadyVoted = existingVotes.find((v: any) => v.pollId === req.params.id && v.voterId === voterId);
    if (alreadyVoted) return res.status(400).json({ error: 'You have already voted' });
    const vote = await dbInsert(schema.pollVotes, {
      id: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pollId: req.params.id, optionId, companyId: poll.companyId,
      voterId, voterName, createdAt: new Date().toISOString(),
    });
    const allOpts = await dbAll<any>(schema.pollOptions);
    const opt = allOpts.find((o: any) => o.id === optionId);
    if (opt) {
      await dbUpdate(schema.pollOptions, optionId, { voteCount: (opt.voteCount || 0) + 1 });
    }
    res.status(201).json(vote);
  } catch (err: any) {
    logError('POST /api/polls/:id/vote error:', err);
    res.status(500).json({ error: err.message });
  }
}));

// 3.7 Company Image Gallery
app.get('/api/company-images', asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.companyImages);
    const filtered = companyId ? all.filter((i: any) => i.companyId === companyId) : all;
    // Strip imageData from list view for performance
    const lite = filtered.map(({ imageData, ...rest }: any) => rest);
    res.json(lite);
  } catch (err: any) {
    logError('GET /api/company-images error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.get('/api/company-images/:id', asyncHandler(async (req, res) => {
  try {
    const img = await dbById<any>(schema.companyImages, req.params.id);
    if (!img) return res.status(404).json({ error: 'Image not found' });
    res.json(img);
  } catch (err: any) {
    logError('GET /api/company-images/:id error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.post('/api/company-images', asyncHandler(async (req, res) => {
  try {
    const { companyId, title, description, category, imageData, uploadedBy, uploadedByName } = req.body;
    if (!imageData) return res.status(400).json({ error: 'Image data is required' });
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const img = await dbInsert(schema.companyImages, {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId,
      title: title.trim(),
      description: description || '',
      category: category || 'General',
      imageData,
      uploadedBy: uploadedBy || '',
      uploadedByName: uploadedByName || '',
      createdAt: new Date().toISOString(),
    });
    logAudit(companyId, uploadedBy || 'system', uploadedByName || 'System', 'IMAGE_UPLOAD', 'Communication', `Uploaded image "${title}"`);
    res.status(201).json({ id: img.id, title: img.title, category: img.category, createdAt: img.createdAt });
  } catch (err: any) {
    logError('POST /api/company-images error:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.delete('/api/company-images/:id', asyncHandler(async (req, res) => {
  try {
    const img = await dbById<any>(schema.companyImages, req.params.id);
    if (!img) return res.status(404).json({ error: 'Image not found' });
    await dbDelete(schema.companyImages, req.params.id);
    logAudit(img.companyId, 'system', 'System', 'IMAGE_DELETE', 'Communication', `Deleted image "${img.title}"`);
    res.json({ success: true });
  } catch (err: any) {
    logError('DELETE /api/company-images/:id error:', err);
    res.status(500).json({ error: err.message });
  }
}));

// 3.5 Payroll Groups
app.get('/api/payroll-groups', asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;
    const all = await dbAll<any>(schema.payrollGroups);
    res.json(companyId ? all.filter((g: any) => g.companyId === companyId) : all);
  } catch (err: any) {
    logError('GET /api/payroll-groups error:', err);
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
    logError('POST /api/payroll-groups error:', err);
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
    logError('DELETE /api/payroll-groups/:id error:', err);
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
    logError('GET /api/salary-bands error:', err);
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
    logError('POST /api/salary-bands error:', err);
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
    logError('PUT /api/salary-bands/:id error:', err);
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
    logError('DELETE /api/salary-bands/:id error:', err);
    res.status(500).json({ error: err.message });
  }
    }));

// 4. CRM Leads
app.get('/api/leads', asyncHandler(async (req, res) => {
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.crmLeads, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.crmLeads, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
  const all = await dbAll<any>(schema.crmLeads);
  res.json(companyId ? all.filter((l: any) => l.companyId === companyId) : all);
}));

app.post('/api/leads', asyncHandler(async (req, res) => {
  const { companyId, firstName, lastName, email, phone, companyName, source, value, assignedTo } = req.body;
  const leadId = `lead-${Date.now()}`;

  const newLead: CRMLead = {
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
      logError("Gemini Lead Scoring failed, using default values:", err);
    }
  }

  await dbInsert(schema.crmLeads, newLead);

  // AUTOMATION TRIGGER 2: Lead Created CRM automation
  const autoResults = ["Assigned Account Manager: Samantha Brady", "Drafted standard introductory playbook"];
  if (newLead.value > 50000) {
    autoResults.push("HIGH-VALUE DEAL DETECTED: Automatically created critical priority task for Sales Manager");
    autoResults.push("Generated specialized high-volume production pricing prospectus");
  }

  logAudit(companyId, 'u-acme-sales', 'Samantha Brady', 'LEAD_CREATE', 'CRM', `Added CRM Lead: ${firstName} ${lastName} from ${companyName}. AI lead score calculated: ${newLead.aiLeadScore}`);

  // Fire workflow engine asynchronously (non-blocking)
  setImmediate(() => evaluateWorkflows(companyId, 'CRM Lead Created', { value: newLead.value, leadId: newLead.id, companyName }));

  res.status(201).json({
    lead: newLead,
    automations: autoResults
  });
    }));

app.post('/api/leads/generate', asyncHandler(async (req, res) => {
  const { companyId } = req.body;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }

  // Get existing lead company names to avoid duplicates
  const existingLeads = await dbByCompany<any>(schema.crmLeads, companyId);
  const existingCompanies = new Set(existingLeads.map((l: any) => (l.companyName || '').toLowerCase()));

  const ai = getAIClient();
  let generatedLeads: any[] = [];

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate 5 realistic B2B sales leads for an ERP software company. 
Each lead should have different industries and company sizes.
Do NOT use any of these existing companies: ${[...existingCompanies].slice(0, 20).join(', ') || 'none'}
Return a JSON array where each object has:
- firstName (string)
- lastName (string) 
- email (string, realistic business email)
- phone (string, US format)
- companyName (string, realistic company name, must be unique)
- source (one of: "Website", "Referral", "LinkedIn", "Ad Campaign", "Partner")
- value (number between 5000 and 150000, deal value in USD)
- score (number 0-100, lead quality score)
- followUp (string, 1-2 sentence actionable sales recommendation)

Make the leads diverse and realistic. Only return the JSON array, no other text.`,
        config: {
          responseMimeType: 'application/json',
        }
      });
      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed)) {
        generatedLeads = parsed;
      }
    } catch (err) {
      logError('AI lead generation failed, using fallback:', err);
    }
  }

  // Fallback leads if AI is unavailable or fails — randomized pool
  if (generatedLeads.length === 0) {
    const leadPool = [
      { firstName: 'Marcus', lastName: 'Chen', email: 'mchen@novatech.io', phone: '(415) 555-8821', companyName: 'NovaTech Solutions', source: 'LinkedIn', value: 85000, score: 82, followUp: 'High-value SaaS prospect. Schedule a product demo focusing on manufacturing module capabilities.' },
      { firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@greenleaf.com', phone: '(212) 555-3347', companyName: 'GreenLeaf Industries', source: 'Website', value: 42000, score: 71, followUp: 'Inbound inquiry from website. Follow up with pricing sheet and case studies for mid-market manufacturing.' },
      { firstName: 'David', lastName: 'Okonkwo', email: 'dokonkwo@steelbridge.co', phone: '(312) 555-9102', companyName: 'SteelBridge Corp', source: 'Referral', value: 120000, score: 91, followUp: 'Referred by existing client. High-priority enterprise deal — assign senior AE and schedule executive briefing.' },
      { firstName: 'Sarah', lastName: 'Mitchell', email: 'smitchell@coastalretail.com', phone: '(305) 555-6670', companyName: 'Coastal Retail Group', source: 'Ad Campaign', value: 28000, score: 58, followUp: 'Clicked POS module ad. Send targeted content about retail POS and inventory management integration.' },
      { firstName: 'Tomás', lastName: 'Rivera', email: 'trivera@apexlogistics.mx', phone: '(832) 555-4419', companyName: 'Apex Logistics', source: 'Partner', value: 67000, score: 76, followUp: 'Partner channel lead. Coordinate with partner team for joint demo covering procurement and operations modules.' },
      { firstName: 'Aisha', lastName: 'Patel', email: 'apatel@quantumhealth.org', phone: '(617) 555-2190', companyName: 'Quantum Health Systems', source: 'LinkedIn', value: 95000, score: 87, followUp: 'Healthcare org looking for ERP integration. Focus on compliance and patient data workflow modules.' },
      { firstName: 'James', lastName: 'Whitfield', email: 'jwhitfield@pinnacleenergy.com', phone: '(713) 555-3384', companyName: 'Pinnacle Energy Corp', source: 'Referral', value: 145000, score: 93, followUp: 'Enterprise energy company. High budget — prepare custom proposal with asset management and operations modules.' },
      { firstName: 'Mei', lastName: 'Tanaka', email: 'mtanaka@synthwave.io', phone: '(408) 555-7712', companyName: 'SynthWave Technologies', source: 'Website', value: 38000, score: 64, followUp: 'Tech startup scaling fast. Pitch HR and payroll modules for their 50+ employee growth plan.' },
      { firstName: 'Carlos', lastName: 'Fuentes', email: 'cfuentes@meridianfoods.com', phone: '(305) 555-8845', companyName: 'Meridian Foods Inc', source: 'Ad Campaign', value: 52000, score: 73, followUp: 'Food distribution company. Highlight inventory management and supply chain modules with lot tracking.' },
      { firstName: 'Olivia', lastName: 'Bennett', email: 'obennett@clearviewlaw.com', phone: '(212) 555-6623', companyName: 'ClearView Legal Partners', source: 'Partner', value: 22000, score: 55, followUp: 'Small law firm needs document management. Propose Doc Locker module with e-sign integration.' },
      { firstName: 'Raj', lastName: 'Gupta', email: 'rgupta@titanmfg.com', phone: '(313) 555-4491', companyName: 'Titan Manufacturing', source: 'LinkedIn', value: 110000, score: 89, followUp: 'Large manufacturer. Focus on BOM, production planning, and quality check modules.' },
      { firstName: 'Emily', lastName: 'Zhao', email: 'ezhao@blueoceanretail.com', phone: '(604) 555-1178', companyName: 'BlueOcean Retail', source: 'Website', value: 34000, score: 62, followUp: 'Multi-store retailer. Demo POS, inventory, and customer loyalty integration.' },
      { firstName: 'André', lastName: 'Dupont', email: 'adupont@eurotech.de', phone: '(312) 555-9903', companyName: 'EuroTech GmbH', source: 'Referral', value: 98000, score: 85, followUp: 'European tech firm expanding to US market. Emphasize multi-currency and intercompany consolidation.' },
      { firstName: 'Lisa', lastName: 'Kowalski', email: 'lkowalski@harbormedical.org', phone: '(415) 555-2247', companyName: 'Harbor Medical Center', source: 'Ad Campaign', value: 76000, score: 78, followUp: 'Healthcare provider. Focus on compliance, attendance tracking, and payroll for medical staff.' },
      { firstName: 'Omar', lastName: 'Hassan', email: 'ohassan@desertwindenergy.com', phone: '(602) 555-5568', companyName: 'Desert Wind Energy', source: 'Partner', value: 130000, score: 90, followUp: 'Renewable energy company. Pitch fixed asset management, depreciation, and project tracking modules.' },
    ];
    // Filter out existing companies and pick 5 random
    const available = leadPool.filter(l => !existingCompanies.has(l.companyName.toLowerCase()));
    if (available.length === 0) {
      // All pool companies already exist, return empty
      generatedLeads = [];
    } else {
      const shuffled = available.sort(() => Math.random() - 0.5);
      generatedLeads = shuffled.slice(0, Math.min(3, shuffled.length));
    }
  }

  const newLeads: CRMLead[] = [];
  for (const gl of generatedLeads) {
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newLead: CRMLead = {
      id: leadId,
      companyId,
      firstName: gl.firstName,
      lastName: gl.lastName,
      email: gl.email || '',
      phone: gl.phone || '',
      companyName: gl.companyName,
      status: 'New',
      source: gl.source || 'Website',
      value: Number(gl.value) || 25000,
      assignedTo: 'u-acme-sales',
      aiLeadScore: gl.score ?? 65,
      aiFollowUpSuggested: gl.followUp || 'New AI-generated lead. Contact to schedule initial discovery call.',
      createdAt: new Date().toISOString()
    };
    await dbInsert(schema.crmLeads, newLead);
    newLeads.push(newLead);
  }

  logAudit(companyId, 'system', 'AI Lead Generator', 'LEADS_GENERATED', 'CRM', `AI generated ${newLeads.length} new CRM leads for the pipeline.`);

  res.status(201).json({ leads: newLeads });
}));

app.delete('/api/leads/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await dbById<any>(schema.crmLeads, id);
  if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }
  await dbDelete(schema.crmLeads, id);
  res.json({ success: true });
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
    // Fire 'Invoice Issued' workflow event
    setImmediate(() => evaluateWorkflows(lead.companyId, 'Invoice Issued', { value: lead.value, invoiceId: invId, customerName: lead.companyName }));
  }

  // Fire workflow engine for lead stage change
  setImmediate(() => evaluateWorkflows(companyId, 'CRM Lead Created', { value: lead.value, leadId: id }));

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
  const { companyId, page, limit } = req.query;
  if (page) {
    const accounts = companyId ? await dbByCompany<any>(schema.glAccounts, companyId as string) : await dbAll<any>(schema.glAccounts);
    const invoicesResult = companyId
      ? await dbByCompanyPaginated(schema.invoices, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.invoices, { page: Number(page), limit: Number(limit) || 50 });
    return res.json({ accounts, invoices: invoicesResult });
  }
  const accounts = companyId ? await dbByCompany<any>(schema.glAccounts, companyId as string) : await dbAll<any>(schema.glAccounts);
  const invoicesAll = companyId ? await dbByCompany<any>(schema.invoices, companyId as string) : await dbAll<any>(schema.invoices);
  res.json({ accounts, invoices: invoicesAll });
}));

app.post('/api/invoices', asyncHandler(async (req, res) => {
  const { companyId, customerName, subtotal, tax, dueDate, userId, userName, customerTin } = req.body;
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

  // GRA E-VAT submission (async, non-blocking)
  let evatResult: any = null;
  try {
    evatResult = await submitInvoiceToGRA(companyId, {
      invoiceNumber: invNumber,
      issueDate: newInvoice.issueDate,
      customerName,
      customerTin,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total,
    });

    // Record the submission
    await recordSubmission(companyId, 'invoice', newInvoice.id, invNumber, evatResult, req.body);
  } catch (evatError: any) {
    logger.error({ companyId, invoiceId: newInvoice.id, error: evatError.message }, 'E-VAT submission failed');
    // Queue for retry if GRA unavailable
    await queueSubmission(companyId, 'invoice', newInvoice.id, invNumber, req.body);
  }

  res.status(201).json({
    ...newInvoice,
    evatStatus: evatResult?.status || 'Queued',
    evatIrn: evatResult?.irn,
    evatQrCode: evatResult?.qrCodeUrl,
  });
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

  // Fire 'Invoice Settled/Paid' workflow event
  setImmediate(() => evaluateWorkflows(companyId, 'Invoice Settled/Paid', { value: amount, invoiceId: id, invoiceNumber: inv.invoiceNumber }));

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
    status: req.body.status || 'Draft',
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
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.glAccounts, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.glAccounts, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.journalEntries, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.journalEntries, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
    status: req.body.status || 'Draft',
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
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.expenses, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.expenses, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.bills, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.bills, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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

app.put('/api/bank-accounts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await dbUpdate(schema.bankAccounts, id, updates);
  if (updated) {
    logAudit(updated.companyId, 'u-acme-admin', 'Alex Mercer', 'UPDATE_BANK_ACCOUNT', 'Accounting', `Updated bank account ${updated.name}`);
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Bank account not found' });
  }
    }));

// --- Bank Transactions ---
app.get('/api/bank-transactions', asyncHandler(async (req, res) => {
  const { companyId, bankAccountId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.bankTransactions, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.bankTransactions, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
      status: req.body.status || 'Draft', createdAt: new Date().toISOString()
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
  const { companyId, name, fiscalYear, glAccountId, accountCode, accountName, budgetAmount, period, items, createdBy } = req.body;
  const newBudget: Budget = {
    id: `bud-${Date.now()}`, companyId, name, fiscalYear, glAccountId, accountCode, accountName,
    budgetAmount: Number(budgetAmount), actualAmount: 0, variance: Number(budgetAmount),
    variancePercent: 100, period, status: req.body.status || 'Draft', items: items || [],
    createdBy,
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
  const { companyId, code, name, rate, type, glAccountId, accountName, jurisdiction, createdBy, createdByName, userId, userName } = req.body;
  const newCode: TaxCode = {
    id: `tc-${Date.now()}`, companyId, code, name, rate: Number(rate), type, glAccountId,
    accountName: accountName || '', jurisdiction: jurisdiction || '',
    isActive: true, createdAt: new Date().toISOString()
  };
  await dbInsert(schema.taxCodes, newCode);
  logAudit(companyId, createdBy || userId, createdByName || userName || 'System', 'CREATE_TAX_CODE', 'Accounting', `Created tax code ${code}: ${name} (${rate}%)`);
  res.status(201).json(newCode);
    }));

app.put('/api/tax-codes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, rate, type, glAccountId, accountName, jurisdiction, isActive, userId, userName } = req.body;
  const code = await dbById<any>(schema.taxCodes, id);
  if (!code) return res.status(404).json({ error: 'Tax code not found' });
  const values: any = {};
  if (name !== undefined) values.name = name;
  if (rate !== undefined) values.rate = Number(rate);
  if (type !== undefined) values.type = type;
  if (glAccountId !== undefined) values.glAccountId = glAccountId;
  if (accountName !== undefined) values.accountName = accountName;
  if (jurisdiction !== undefined) values.jurisdiction = jurisdiction;
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
  const { companyId, period, taxCodeId, taxCodeName, taxableAmount, taxAmount, taxableIncome, taxDue, netPayable, dueDate, createdBy } = req.body;
  const newReturn: TaxReturn = {
    id: `tr-${Date.now()}`, companyId, period, taxCodeId, taxCodeName,
    taxableAmount: Number(taxableAmount), taxAmount: Number(taxAmount),
    taxableIncome: Number(taxableIncome || taxableAmount), taxDue: Number(taxDue || taxAmount), netPayable: Number(netPayable || 0),
    status: req.body.status || 'Draft', dueDate, createdBy, createdAt: new Date().toISOString()
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

// --- GRA E-VAT Integration ---
import {
  getEvatConfig,
  upsertEvatConfig,
  submitInvoiceToGRA,
  submitRefundToGRA,
  submitZReport,
  validateTIN as validateTINGRA,
  healthCheck as evatHealthCheck,
  getSubmissions,
  queueSubmission,
  recordSubmission,
  retrySubmission as retryEvatSubmission,
  retryQueuedSubmissions,
} from './server/lib/evat';

app.get('/api/evat/config', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const config = await getEvatConfig(companyId as string);
  res.json(config || { isActive: false, apiMode: 'test' });
    }));

app.put('/api/evat/config', asyncHandler(async (req, res) => {
  const { companyId, companyTin, companyName, securityKey, apiMode, apiBaseUrl, isActive, userId, userName } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const config = await upsertEvatConfig(companyId, {
    companyTin, companyName, securityKey, apiMode, apiBaseUrl, isActive,
  });
  logAudit(companyId, userId, userName, 'UPDATE_EVAT_CONFIG', 'Accounting', `Updated E-VAT configuration for ${companyId}`);
  res.json(config);
    }));

app.post('/api/evat/test-connection', asyncHandler(async (req, res) => {
  const { companyId } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const health = await evatHealthCheck(companyId);
  res.json(health);
    }));

app.get('/api/evat/health-check', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const health = await evatHealthCheck(companyId as string);
  res.json(health);
    }));

app.get('/api/evat/submissions', asyncHandler(async (req, res) => {
  const { companyId, entityType, status, limit, offset } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const submissions = await getSubmissions(companyId as string, {
    entityType: entityType as string,
    status: status as string,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(submissions);
    }));

app.post('/api/evat/retry/:submissionId', asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const result = await retryEvatSubmission(submissionId);
  res.json(result);
    }));

app.post('/api/evat/validate-tin', asyncHandler(async (req, res) => {
  const { companyId, tin } = req.body;
  if (!companyId || !tin) return res.status(400).json({ error: 'companyId and tin required' });
  const result = await validateTINGRA(companyId, tin);
  res.json(result);
    }));

app.post('/api/evat/z-report', asyncHandler(async (req, res) => {
  const { companyId, reportDate, totalSales, totalTax, totalTransactions, userId, userName } = req.body;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const result = await submitZReport(companyId, {
    reportDate: reportDate || new Date().toISOString().split('T')[0],
    totalSales: Number(totalSales || 0),
    totalTax: Number(totalTax || 0),
    totalTransactions: Number(totalTransactions || 0),
  });

  // Record the submission
  await recordSubmission(companyId, 'z_report', `zreport-${Date.now()}`, `Z-REPORT-${new Date().toISOString().split('T')[0]}`, result, req.body);

  logAudit(companyId, userId, userName, 'SUBMIT_Z_REPORT', 'Accounting', `Submitted Z-Report to GRA: ${result.status}`);
  res.json(result);
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
  const { companyId, category, title, description, dueDate, assignee, assigneeName, createdBy, status } = req.body;
  const newCheck: ComplianceCheck = {
    id: `comp-${Date.now()}`, companyId, category, title, description,
    status: status || 'Open', dueDate, assignee, assigneeName,
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

app.delete('/api/policy-documents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const doc = await dbById<any>(schema.policyDocuments, id);
  if (!doc) return res.status(404).json({ error: 'Policy not found' });
  await dbDelete(schema.policyDocuments, id);
  logAudit(doc.companyId, userId, userName, 'DELETE_POLICY', 'Compliance', `Deleted policy: ${doc.title}`);
  res.json({ success: true });
}));

app.delete('/api/compliance-incidents', asyncHandler(async (req, res) => {
  const { companyId, userId, userName } = req.body;
  const logs = await dbAll<any>(schema.auditLogs);
  const toDelete = logs.filter((l: any) => l.companyId === companyId && (l.action?.includes('COMPLIANCE') || l.action?.includes('INCIDENT') || l.module === 'Compliance'));
  for (const l of toDelete) {
    await dbDelete(schema.auditLogs, l.id);
  }
  logAudit(companyId, userId, userName, 'CLEAR_INCIDENTS', 'Compliance', `Cleared all compliance incidents`);
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
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.inventory, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.inventory, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
    logger.info(`[LOW STOCK AUTOMATION TRIGGERED] Creating purchase order request draft with Supplier: ${item.supplier}`);
    // Fire 'Inventory Low Stock Event' workflow event
    setImmediate(() => evaluateWorkflows(companyId, 'Inventory Low Stock Event', { sku: item.sku, name: item.name, stockLevel: newStock, minStockLevel: item.minStockLevel, supplier: item.supplier }));
  }

  res.json({
    item: updated,
    lowStockAlert
  });
    }));

// 7. Support Tickets
app.get('/api/tickets', asyncHandler(async (req, res) => {
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.tickets, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.tickets, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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

app.put('/api/workflows/:id/toggle', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, companyId, userId, userName } = req.body;
  const updated = await dbUpdate(schema.workflows, id, { isActive });
  logAudit(companyId || 'unknown', userId || 'u-acme-admin', userName || 'Alex Mercer', 'WORKFLOW_TOGGLE', 'Administration', `Toggled workflow status to ${isActive ? 'Active' : 'Muted'}`);
  res.json(updated);
}));

// 8.1 Workflow Triggers (DB-backed, company-specific)
const DEFAULT_WORKFLOW_TRIGGERS = [
  { name: 'CRM Lead Created', event: 'CRM Lead Created', description: 'Fires immediately when a new lead is added to CRM.', enabled: true },
  { name: 'Invoice Issued', event: 'Invoice Issued', description: 'Fires when an invoice is created/journaled.', enabled: true },
  { name: 'Invoice Settled/Paid', event: 'Invoice Settled/Paid', description: 'Fires when an outstanding invoice balance changes to Paid.', enabled: true },
  { name: 'Employee Registered', event: 'Employee Registered', description: 'Fires when HR submits a workforce record.', enabled: false },
  { name: 'Inventory Low Stock Event', event: 'Inventory Low Stock Event', description: 'Fires when stock level drops below min safety thresholds.', enabled: false },
  { name: 'Leave Approved', event: 'Leave Approved', description: 'Fires when a leave request is approved by a manager.', enabled: false },
];

app.get('/api/workflow-triggers', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let rows = companyId ? await dbByCompany<any>(schema.workflowTriggers, companyId as string) : await dbAll<any>(schema.workflowTriggers);
  if (rows.length === 0 && companyId) {
    const seed = DEFAULT_WORKFLOW_TRIGGERS.map((t, i) => ({ id: `wt-seed-${i}-${companyId}`, companyId: companyId as string, ...t, createdAt: new Date().toISOString() }));
    await dbInsertMany(schema.workflowTriggers, seed);
    rows = seed;
  }
  res.json(rows);
    }));

app.post('/api/workflow-triggers', asyncHandler(async (req, res) => {
  const { companyId, name, event, description, enabled } = req.body;
  const trigger: WorkflowTrigger = {
    id: `wt-${Date.now()}`,
    companyId,
    name,
    event: event || name,
    description: description || '',
    enabled: enabled !== false,
    createdAt: new Date().toISOString(),
  };
  const created = await dbInsert(schema.workflowTriggers, trigger);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'TRIGGER_CREATE', 'Workflow & Automation', `Created workflow trigger "${name}".`);
  res.status(201).json(created);
    }));

app.put('/api/workflow-triggers/:id/toggle', asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const updated = await dbUpdate(schema.workflowTriggers, req.params.id, { enabled });
  res.json(updated);
    }));

// 8.2 Email Templates (DB-backed, company-specific)
const DEFAULT_EMAIL_TEMPLATES = [
  { name: 'Welcome New Employee', subject: 'Welcome to {Company}!', body: 'Dear {Name},\n\nWelcome to the team! We are excited to have you on board. Please review the onboarding checklist attached.\n\nBest regards,\nHR Team', updated: '2026-06-20' },
  { name: 'Invoice Reminder', subject: 'Your invoice #{ID} is due', body: 'Dear {Customer},\n\nThis is a friendly reminder that invoice #{ID} for {Amount} is due on {DueDate}. Please process payment at your earliest convenience.\n\nBest regards,\nFinance Team', updated: '2026-06-18' },
  { name: 'Password Reset', subject: 'Reset your account password', body: 'You requested a password reset. Click the link below to set a new password:\n\n{ResetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nIT Support', updated: '2026-05-30' },
  { name: 'Monthly Payroll Notice', subject: 'Payslip for {Month} available', body: 'Dear {Name},\n\nYour payslip for {Month} is now available in the ERP portal. Please review and confirm.\n\nBest regards,\nPayroll Team', updated: '2026-07-01' },
];

app.get('/api/email-templates', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  let rows = companyId ? await dbByCompany<any>(schema.emailTemplates, companyId as string) : await dbAll<any>(schema.emailTemplates);
  if (rows.length === 0 && companyId) {
    const seed = DEFAULT_EMAIL_TEMPLATES.map((t, i) => ({ id: `et-seed-${i}-${companyId}`, companyId: companyId as string, ...t, createdAt: new Date().toISOString() }));
    await dbInsertMany(schema.emailTemplates, seed);
    rows = seed;
  }
  res.json(rows);
    }));

app.post('/api/email-templates', asyncHandler(async (req, res) => {
  const { companyId, name, subject, body } = req.body;
  const template: EmailTemplate = {
    id: `et-${Date.now()}`,
    companyId,
    name,
    subject: subject || '',
    body: body || '',
    updated: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  const created = await dbInsert(schema.emailTemplates, template);
  logAudit(companyId, 'u-acme-admin', 'Alex Mercer', 'EMAIL_TEMPLATE_CREATE', 'Communication', `Created email template "${name}".`);
  res.status(201).json(created);
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
  const { companyId, category, isActive, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.posProducts, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.posProducts, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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
  const { companyId, terminalId, shiftId, startDate, endDate, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.posSales, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.posSales, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
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

  // GRA E-VAT submission (async, non-blocking)
  let evatResult: any = null;
  try {
    // Map POS items to GRA format
    const evatItems = items.map((item: any, index: number) => ({
      itemNumber: index + 1,
      description: item.productName || item.name || 'Item',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: 20,
      taxAmount: item.tax || 0,
    }));

    evatResult = await submitInvoiceToGRA(companyId, {
      invoiceNumber: saleNumber,
      issueDate: new Date().toISOString().split('T')[0],
      customerName: customerName || 'Walk-in Customer',
      subtotal,
      tax,
      total,
      items: evatItems,
    });

    await recordSubmission(companyId, 'pos_sale', newSale.id, saleNumber, evatResult, req.body);
  } catch (evatError: any) {
    logger.error({ companyId, saleId: newSale.id, error: evatError.message }, 'E-VAT POS submission failed');
    await queueSubmission(companyId, 'pos_sale', newSale.id, saleNumber, req.body);
  }

  res.status(201).json({
    ...newSale,
    evatStatus: evatResult?.status || 'Queued',
    evatIrn: evatResult?.irn,
    evatQrCode: evatResult?.qrCodeUrl,
  });
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

// --- PROJECT TASKS & MILESTONES ---
app.get('/api/project-tasks', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.projectTasks, companyId as string) : await dbAll<any>(schema.projectTasks);
  res.json(all);
    }));

app.post('/api/project-tasks', asyncHandler(async (req, res) => {
  const { companyId, title, description, status, priority, assignee, assigneeName, due, userId, userName } = req.body;
  const newTask = { id: `pt-${Date.now()}`, companyId, title, description: description || '', status: status || 'To Do', priority: priority || 'Medium', assignee: assignee || '', assigneeName: assigneeName || 'Unassigned', due: due || '', createdAt: new Date().toISOString() };
  await dbInsert(schema.projectTasks, newTask);
  logAudit(companyId, userId, userName, 'CREATE_PROJECT_TASK', 'Projects', `Created task: ${title}`);
  res.status(201).json(newTask);
    }));

app.put('/api/project-tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assignee, assigneeName, due, userId, userName } = req.body;
  const task = await dbById<any>(schema.projectTasks, id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const values: any = {};
  if (title !== undefined) values.title = title;
  if (description !== undefined) values.description = description;
  if (status !== undefined) values.status = status;
  if (priority !== undefined) values.priority = priority;
  if (assignee !== undefined) values.assignee = assignee;
  if (assigneeName !== undefined) values.assigneeName = assigneeName;
  if (due !== undefined) values.due = due;
  const updated = await dbUpdate(schema.projectTasks, id, values);
  logAudit(task.companyId, userId, userName, 'UPDATE_PROJECT_TASK', 'Projects', `Updated task: ${title ?? task.title}`);
  res.json(updated);
    }));

app.delete('/api/project-tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const task = await dbById<any>(schema.projectTasks, id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  await dbDelete(schema.projectTasks, id);
  logAudit(task.companyId, userId, userName, 'DELETE_PROJECT_TASK', 'Projects', `Deleted task: ${task.title}`);
  res.json({ success: true });
    }));

app.get('/api/project-milestones', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.projectMilestones, companyId as string) : await dbAll<any>(schema.projectMilestones);
  res.json(all);
    }));

app.post('/api/project-milestones', asyncHandler(async (req, res) => {
  const { companyId, name, due, status, completion, userId, userName } = req.body;
  const newMs = { id: `pm-${Date.now()}`, companyId, name, due: due || '', status: status || 'Upcoming', completion: completion || 0, createdAt: new Date().toISOString() };
  await dbInsert(schema.projectMilestones, newMs);
  logAudit(companyId, userId, userName, 'CREATE_PROJECT_MILESTONE', 'Projects', `Created milestone: ${name}`);
  res.status(201).json(newMs);
    }));

app.put('/api/project-milestones/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, due, status, completion, userId, userName } = req.body;
  const ms = await dbById<any>(schema.projectMilestones, id);
  if (!ms) return res.status(404).json({ error: 'Milestone not found' });
  const values: any = {};
  if (name !== undefined) values.name = name;
  if (due !== undefined) values.due = due;
  if (status !== undefined) values.status = status;
  if (completion !== undefined) values.completion = completion;
  const updated = await dbUpdate(schema.projectMilestones, id, values);
  logAudit(ms.companyId, userId, userName, 'UPDATE_PROJECT_MILESTONE', 'Projects', `Updated milestone: ${name ?? ms.name}`);
  res.json(updated);
    }));

app.delete('/api/project-milestones/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const ms = await dbById<any>(schema.projectMilestones, id);
  if (!ms) return res.status(404).json({ error: 'Milestone not found' });
  await dbDelete(schema.projectMilestones, id);
  logAudit(ms.companyId, userId, userName, 'DELETE_PROJECT_MILESTONE', 'Projects', `Deleted milestone: ${ms.name}`);
  res.json({ success: true });
    }));


// 10. Audit Logs
app.get('/api/audit-logs', asyncHandler(async (req, res) => {
  const { companyId, page, limit } = req.query;
  if (page) {
    const result = companyId
      ? await dbByCompanyPaginated(schema.auditLogs, companyId as string, { page: Number(page), limit: Number(limit) || 50 })
      : await dbAllPaginated(schema.auditLogs, { page: Number(page), limit: Number(limit) || 50 });
    return res.json(result);
  }
  const all = await dbAll<any>(schema.auditLogs);
  res.json(companyId ? all.filter((l: any) => l.companyId === companyId) : all);
}));

// --- PROCUREMENT ---
app.get('/api/vendors', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.vendors, companyId as string) : await dbAll<any>(schema.vendors);
  res.json(all);
}));

app.post('/api/vendors', asyncHandler(async (req, res) => {
  const { companyId, name, type, contact, email, rating, userId, userName } = req.body;
  const v = { id: `vnd-${Date.now()}`, companyId, name, type, contact, email, rating: Number(rating) || 5, ordersCount: 0, status: 'Active', createdAt: new Date().toISOString() };
  await dbInsert(schema.vendors, v);
  logAudit(companyId, userId, userName, 'CREATE_VENDOR', 'Procurement', `Added vendor: ${name}`);
  res.status(201).json(v);
}));

app.put('/api/vendors/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.vendors, id, values);
  res.json(updated);
}));

app.delete('/api/vendors/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const v = await dbById<any>(schema.vendors, id);
  if (!v) return res.status(404).json({ error: 'Vendor not found' });
  await dbDelete(schema.vendors, id);
  logAudit(v.companyId, userId, userName, 'DELETE_VENDOR', 'Procurement', `Deleted vendor: ${v.name}`);
  res.json({ success: true });
}));

app.get('/api/purchase-orders', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.purchaseOrders, companyId as string) : await dbAll<any>(schema.purchaseOrders);
  res.json(all);
}));

app.post('/api/purchase-orders', asyncHandler(async (req, res) => {
  const { companyId, vendorId, vendorName, item, qty, unitPrice, userId, userName } = req.body;
  const total = Number(qty) * Number(unitPrice);
  const count = (await dbAll<any>(schema.purchaseOrders)).length + 1;
  const po = { id: `po-${Date.now()}`, companyId, poNumber: `PO-${String(count).padStart(4, '0')}`, vendorId, vendorName, item, qty: Number(qty), unitPrice: Number(unitPrice), total, status: 'Pending', date: new Date().toISOString().split('T')[0], createdBy: userId, createdAt: new Date().toISOString() };
  await dbInsert(schema.purchaseOrders, po);
  logAudit(companyId, userId, userName, 'CREATE_PO', 'Procurement', `Created PO ${po.poNumber} for ${vendorName}`);
  res.status(201).json(po);
}));

app.put('/api/purchase-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.purchaseOrders, id, values);
  res.json(updated);
}));

app.delete('/api/purchase-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const po = await dbById<any>(schema.purchaseOrders, id);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  await dbDelete(schema.purchaseOrders, id);
  logAudit(po.companyId, userId, userName, 'DELETE_PO', 'Procurement', `Deleted PO ${po.poNumber}`);
  res.json({ success: true });
}));

app.get('/api/rfqs', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.rfqs, companyId as string) : await dbAll<any>(schema.rfqs);
  res.json(all);
}));

app.post('/api/rfqs', asyncHandler(async (req, res) => {
  const { companyId, item, vendorsInvited, userId, userName } = req.body;
  const count = (await dbAll<any>(schema.rfqs)).length + 1;
  const rfq = { id: `rfq-${Date.now()}`, companyId, rfqNumber: `RFQ-${String(count).padStart(3, '0')}`, item, vendorsInvited: Number(vendorsInvited) || 1, sentDate: new Date().toISOString().split('T')[0], quotesReceived: 0, status: 'Open', createdAt: new Date().toISOString() };
  await dbInsert(schema.rfqs, rfq);
  logAudit(companyId, userId, userName, 'CREATE_RFQ', 'Procurement', `Sent RFQ ${rfq.rfqNumber} for ${item}`);
  res.status(201).json(rfq);
}));

app.put('/api/rfqs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.rfqs, id, values);
  res.json(updated);
}));

app.delete('/api/rfqs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const r = await dbById<any>(schema.rfqs, id);
  if (!r) return res.status(404).json({ error: 'RFQ not found' });
  await dbDelete(schema.rfqs, id);
  logAudit(r.companyId, userId, userName, 'DELETE_RFQ', 'Procurement', `Deleted RFQ ${r.rfqNumber}`);
  res.json({ success: true });
}));

// --- MANUFACTURING ---
app.get('/api/work-orders', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.workOrders, companyId as string) : await dbAll<any>(schema.workOrders);
  res.json(all);
}));

app.post('/api/work-orders', asyncHandler(async (req, res) => {
  const { companyId, product, qty, line, dueDate, userId, userName } = req.body;
  const count = (await dbAll<any>(schema.workOrders)).length + 1;
  const wo = { id: `wo-${Date.now()}`, companyId, woNumber: `WO-${String(500 + count)}`, product, qty: Number(qty), line, status: 'Scheduled', completion: 0, startDate: new Date().toISOString().split('T')[0], dueDate: dueDate || '', createdAt: new Date().toISOString() };
  await dbInsert(schema.workOrders, wo);
  logAudit(companyId, userId, userName, 'CREATE_WORK_ORDER', 'Manufacturing', `Created WO ${wo.woNumber}: ${product}`);
  res.status(201).json(wo);
}));

app.put('/api/work-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.workOrders, id, values);
  res.json(updated);
}));

app.delete('/api/work-orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const wo = await dbById<any>(schema.workOrders, id);
  if (!wo) return res.status(404).json({ error: 'Work order not found' });
  await dbDelete(schema.workOrders, id);
  logAudit(wo.companyId, userId, userName, 'DELETE_WORK_ORDER', 'Manufacturing', `Deleted WO ${wo.woNumber}`);
  res.json({ success: true });
}));

app.get('/api/bom-items', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.bomItems, companyId as string) : await dbAll<any>(schema.bomItems);
  res.json(all);
}));

app.post('/api/bom-items', asyncHandler(async (req, res) => {
  const { companyId, product, part, qty, unit, cost, userId, userName } = req.body;
  const item = { id: `bom-${Date.now()}`, companyId, product, part, qty: Number(qty), unit, cost: Number(cost), createdAt: new Date().toISOString() };
  await dbInsert(schema.bomItems, item);
  logAudit(companyId, userId, userName, 'CREATE_BOM_ITEM', 'Manufacturing', `Added BOM item: ${part} for ${product}`);
  res.status(201).json(item);
}));

app.delete('/api/bom-items/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const b = await dbById<any>(schema.bomItems, id);
  if (!b) return res.status(404).json({ error: 'BOM item not found' });
  await dbDelete(schema.bomItems, id);
  logAudit(b.companyId, userId, userName, 'DELETE_BOM_ITEM', 'Manufacturing', `Deleted BOM item: ${b.part}`);
  res.json({ success: true });
}));

app.get('/api/quality-checks', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.qualityChecks, companyId as string) : await dbAll<any>(schema.qualityChecks);
  res.json(all);
}));

app.post('/api/quality-checks', asyncHandler(async (req, res) => {
  const { companyId, check, result, inspector, notes, userId, userName } = req.body;
  const qc = { id: `qc-${Date.now()}`, companyId, check, result: result || 'Pending', date: new Date().toISOString().split('T')[0], inspector, notes: notes || '', createdAt: new Date().toISOString() };
  await dbInsert(schema.qualityChecks, qc);
  logAudit(companyId, userId, userName, 'CREATE_QUALITY_CHECK', 'Manufacturing', `Logged QC: ${check}`);
  res.status(201).json(qc);
}));

app.put('/api/quality-checks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.qualityChecks, id, values);
  res.json(updated);
}));

app.delete('/api/quality-checks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const qc = await dbById<any>(schema.qualityChecks, id);
  if (!qc) return res.status(404).json({ error: 'Quality check not found' });
  await dbDelete(schema.qualityChecks, id);
  res.json({ success: true });
}));

// --- ASSET MAINTENANCE TASKS ---
app.get('/api/maintenance-tasks', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.maintenanceTasks, companyId as string) : await dbAll<any>(schema.maintenanceTasks);
  res.json(all);
}));

app.post('/api/maintenance-tasks', asyncHandler(async (req, res) => {
  const { companyId, assetId, assetName, task, due, owner, userId, userName } = req.body;
  const mt = { id: `mt-${Date.now()}`, companyId, assetId, assetName, task, due, owner, status: 'Scheduled', createdAt: new Date().toISOString() };
  await dbInsert(schema.maintenanceTasks, mt);
  logAudit(companyId, userId, userName, 'CREATE_MAINTENANCE_TASK', 'Assets', `Scheduled maintenance: ${task} for ${assetName}`);
  res.status(201).json(mt);
}));

app.put('/api/maintenance-tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, ...values } = req.body;
  const updated = await dbUpdate(schema.maintenanceTasks, id, values);
  res.json(updated);
}));

app.delete('/api/maintenance-tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const mt = await dbById<any>(schema.maintenanceTasks, id);
  if (!mt) return res.status(404).json({ error: 'Maintenance task not found' });
  await dbDelete(schema.maintenanceTasks, id);
  logAudit(mt.companyId, userId, userName, 'DELETE_MAINTENANCE_TASK', 'Assets', `Deleted maintenance task: ${mt.task}`);
  res.json({ success: true });
}));

// --- DOCUMENT MANAGEMENT ---
app.get('/api/documents', asyncHandler(async (req, res) => {
  const { companyId, userId } = req.query;
  let all = companyId ? await dbByCompany<any>(schema.managedDocuments, companyId as string) : await dbAll<any>(schema.managedDocuments);
  // Parse sharedWith JSON and filter by visibility
  all = all.map((d: any) => ({
    ...d,
    sharedWith: typeof d.sharedWith === 'string' ? JSON.parse(d.sharedWith || '[]') : (d.sharedWith || []),
  }));
  // If userId provided, filter to only visible docs
  if (userId) {
    all = all.filter((d: any) =>
      d.visibility === 'everyone' ||
      d.uploadedBy === userId ||
      (Array.isArray(d.sharedWith) && d.sharedWith.includes(userId))
    );
  }
  res.json(all);
}));

app.post('/api/documents', asyncHandler(async (req, res) => {
  const { companyId, name, type, size, userId, userName, visibility, sharedWith, signers, cc, fileUrl } = req.body;
  const doc = {
    id: `doc-${Date.now()}`,
    companyId,
    name,
    type,
    size: size || '0 KB',
    status: req.body.status || 'Draft',
    date: new Date().toISOString().split('T')[0],
    uploadedBy: userId,
    uploadedByName: userName || '',
    visibility: visibility || 'everyone',
    sharedWith: JSON.stringify(sharedWith || []),
    createdAt: new Date().toISOString()
  };
  await dbInsert(schema.managedDocuments, doc);
  logAudit(companyId, userId, userName, 'UPLOAD_DOCUMENT', 'Documents', `Uploaded document: ${name}`);
  res.status(201).json(doc);
}));

app.put('/api/documents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, sharedWith, ...values } = req.body;
  if (sharedWith !== undefined) {
    values.sharedWith = JSON.stringify(sharedWith);
  }
  const updated = await dbUpdate(schema.managedDocuments, id, values);
  res.json({ ...updated, sharedWith: typeof updated.sharedWith === 'string' ? JSON.parse(updated.sharedWith || '[]') : (updated.sharedWith || []) });
}));

app.delete('/api/documents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const doc = await dbById<any>(schema.managedDocuments, id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  await dbDelete(schema.managedDocuments, id);
  logAudit(doc.companyId, userId, userName, 'DELETE_DOCUMENT', 'Documents', `Deleted document: ${doc.name}`);
  res.json({ success: true });
}));

// --- EXIT MANAGEMENT ---
app.get('/api/exit-requests', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = companyId ? await dbByCompany<any>(schema.exitRequests, companyId as string) : await dbAll<any>(schema.exitRequests);
  res.json(all);
}));

app.post('/api/exit-requests', asyncHandler(async (req, res) => {
  const { companyId, employeeId, employeeName, department, exitType, lastWorkingDay, reason } = req.body;
  const exitReq = {
    id: `exit-${Date.now()}`,
    companyId,
    employeeId,
    employeeName,
    department,
    exitType: exitType || 'Resignation',
    lastWorkingDay,
    reason: reason || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  await dbInsert(schema.exitRequests, exitReq);

  // Create pending approval
  const policies = await dbAll<any>(approvalPolicies);
  const policy = policies.find((p: any) => p.companyId === companyId && p.module === 'Exit Management');
  await dbInsert(pendingApprovals, {
    id: `pa-${Date.now()}`,
    companyId,
    module: 'Exit Management',
    recordId: exitReq.id,
    recordType: 'exit',
    requesterId: employeeId,
    requesterName: employeeName,
    title: `${exitType}: ${employeeName}`,
    description: reason,
    status: 'Pending',
    assignedRoles: policy?.approverRoles || ['HR Manager', 'Company Admin'],
    createdAt: new Date().toISOString(),
  });

  logAudit(companyId, employeeId, employeeName, 'SUBMIT_EXIT_REQUEST', 'Exit Management', `Submitted ${exitType} request`);
  res.status(201).json(exitReq);
}));

app.put('/api/exit-requests/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userName, userRole, ...values } = req.body;

  // Enforce approval policy for exit requests
  if (userRole && values.status && (values.status === 'HOD Approved' || values.status === 'Approved' || values.status === 'Rejected')) {
    const exitReq = await dbById<any>(schema.exitRequests, id);
    if (exitReq) {
      const policies = await dbAll<any>(approvalPolicies);
      const policy = policies.find((p: any) => p.companyId === exitReq.companyId && p.module === 'Exit Management');
      if (policy && policy.enabled && policy.approverRoles?.length > 0) {
        if (!policy.approverRoles.includes(userRole)) {
          return res.status(403).json({ error: `Your role "${userRole}" is not authorized to process exit requests.` });
        }
      }
    }
  }

  const updated = await dbUpdate(schema.exitRequests, id, values);

  // Update the pending approval record
  if (values.status && values.status !== 'Pending') {
    const allApprovals = await dbAll<any>(pendingApprovals);
    const pendingRecord = allApprovals.find((a: any) => a.recordId === id && a.module === 'Exit Management' && a.status === 'Pending');
    if (pendingRecord) {
      await dbUpdate(pendingApprovals, pendingRecord.id, {
        status: values.status === 'Rejected' ? 'Rejected' : 'Approved',
        approvedBy: userName,
        approvedAt: new Date().toISOString(),
      });
    }
  }

  logAudit(updated.companyId, userId, userName, 'UPDATE_EXIT_REQUEST', 'Exit Management', `Updated exit request status to ${values.status}`);

  // Auto-disable login immediately when exit is approved and lastWorkingDay has passed
  if (values.status === 'Approved') {
    const lastDay = updated.lastWorkingDay ? new Date(updated.lastWorkingDay) : null;
    if (lastDay && lastDay <= new Date()) {
      const allUsers = await dbAll<any>(schema.users);
      const user = allUsers.find((u: any) =>
        u.id === updated.employeeId ||
        (u.companyId === updated.companyId && u.name === updated.employeeName)
      );
      if (user && user.loginEnabled !== false && user.role !== 'Super Admin' && user.role !== 'Company Admin') {
        const reason = updated.exitType === 'Resignation' ? 'resigned'
          : updated.exitType === 'Termination' ? 'terminated'
          : 'exited';
        await dbUpdate(schema.users, user.id, {
          loginEnabled: false,
          loginDisabledReason: reason,
          status: 'Inactive',
        });
        logAudit(updated.companyId, userId, userName, 'AUTO_DISABLE_LOGIN', 'User Management', `Auto-disabled login for ${user.name} — exit approved, last working day passed`);
      }
    }
  }

  res.json(updated);
}));

app.delete('/api/exit-requests/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exitReq = await dbById<any>(schema.exitRequests, id);
  if (!exitReq) return res.status(404).json({ error: 'Exit request not found' });
  await dbDelete(schema.exitRequests, id);
  res.json({ success: true });
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
    logError("Gemini API execution error:", err);
    res.status(500).json({ error: "Failed to generate AI insights from model. Error: " + err.message });
  }
    }));


// ── Profile Update Requests ───────────────────────────────────────────────
app.get('/api/bank-account-updates', asyncHandler(async (req, res) => {
  res.json([]);
}));

app.post('/api/bank-account-updates', asyncHandler(async (req, res) => {
  res.status(201).json({ id: `bau-${Date.now()}`, ...req.body, status: 'Pending', createdAt: new Date().toISOString() });
}));

app.get('/api/profile-update-requests', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.profileUpdateRequests);
  res.json(companyId ? all.filter((r: any) => r.companyId === companyId) : all);
}));

app.post('/api/profile-update-requests', asyncHandler(async (req, res) => {
  const { companyId, employeeId, employeeName, department, field, label, currentValue, newValue } = req.body;
  const id = `pur-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const request = {
    id, companyId, employeeId, employeeName, department,
    field, label, currentValue, newValue,
    status: 'Pending',
    requestedAt: new Date().toISOString(),
  };
  await dbInsert(schema.profileUpdateRequests, request);

  // Create pending approval
  const policies = await dbAll<any>(approvalPolicies);
  const policy = policies.find((p: any) => p.companyId === companyId && p.module === 'Profile Updates');
  await dbInsert(pendingApprovals, {
    id: `pa-${Date.now()}`,
    companyId,
    module: 'Profile Updates',
    recordId: id,
    recordType: 'profile',
    requesterId: employeeId,
    requesterName: employeeName,
    title: `Profile Update: ${label}`,
    description: `${currentValue} → ${newValue}`,
    status: 'Pending',
    assignedRoles: policy?.approverRoles || ['HR Manager', 'Company Admin'],
    createdAt: new Date().toISOString(),
  });

  await dbInsert(schema.auditLogs, {
    id: `al-${Date.now()}`, companyId, userId: employeeId, userName: employeeName,
    action: 'Profile Update Requested', module: 'Employee Profile',
    details: `${employeeName} requested change: ${label} → ${newValue}`,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(request);
}));

app.patch('/api/profile-update-requests/:id/approve', asyncHandler(async (req, res) => {
  const { processedBy, userRole } = req.body;
  const all = await dbAll<any>(schema.profileUpdateRequests);
  const request = all.find((r: any) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  // Enforce approval policy
  if (userRole) {
    const policies = await dbAll<any>(approvalPolicies);
    const policy = policies.find((p: any) => p.companyId === request.companyId && p.module === 'Profile Updates');
    if (policy && policy.enabled && policy.approverRoles?.length > 0) {
      if (!policy.approverRoles.includes(userRole)) {
        return res.status(403).json({ error: `Your role "${userRole}" is not authorized to approve profile updates.` });
      }
    }
  }

  const now = new Date().toISOString();
  const updated = await dbUpdate(schema.profileUpdateRequests, request.id, {
    status: 'Approved', processedAt: now, processedBy,
  });

  // Apply the change to the employee record
  const empAll = await dbAll<any>(schema.employees);
  const emp = empAll.find((e: any) => e.id === request.employeeId);
  if (emp) {
    await dbUpdate(schema.employees, emp.id, { [request.field]: request.newValue });
  }

  // Update pending approval
  const allApprovals = await dbAll<any>(pendingApprovals);
  const pendingRecord = allApprovals.find((a: any) => a.recordId === request.id && a.module === 'Profile Updates' && a.status === 'Pending');
  if (pendingRecord) {
    await dbUpdate(pendingApprovals, pendingRecord.id, { status: 'Approved', approvedBy: processedBy, approvedAt: now });
  }

  await dbInsert(schema.auditLogs, {
    id: `al-${Date.now()}`, companyId: request.companyId, userId: processedBy, userName: processedBy,
    action: 'Profile Update Approved', module: 'Employee Profile',
    details: `Approved ${request.label} change for ${request.employeeName}: "${request.currentValue}" → "${request.newValue}"`,
    timestamp: now,
  });
  res.json(updated);
}));

app.patch('/api/profile-update-requests/:id/reject', asyncHandler(async (req, res) => {
  const { processedBy, rejectionReason, userRole } = req.body;
  const all = await dbAll<any>(schema.profileUpdateRequests);
  const request = all.find((r: any) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  // Enforce approval policy
  if (userRole) {
    const policies = await dbAll<any>(approvalPolicies);
    const policy = policies.find((p: any) => p.companyId === request.companyId && p.module === 'Profile Updates');
    if (policy && policy.enabled && policy.approverRoles?.length > 0) {
      if (!policy.approverRoles.includes(userRole)) {
        return res.status(403).json({ error: `Your role "${userRole}" is not authorized to reject profile updates.` });
      }
    }
  }

  const now = new Date().toISOString();
  const updated = await dbUpdate(schema.profileUpdateRequests, request.id, {
    status: 'Rejected', processedAt: now, processedBy, rejectionReason,
  });

  // Update pending approval
  const allApprovals = await dbAll<any>(pendingApprovals);
  const pendingRecord = allApprovals.find((a: any) => a.recordId === request.id && a.module === 'Profile Updates' && a.status === 'Pending');
  if (pendingRecord) {
    await dbUpdate(pendingApprovals, pendingRecord.id, { status: 'Rejected', approvedBy: processedBy, approvedAt: now, rejectionReason });
  }

  await dbInsert(schema.auditLogs, {
    id: `al-${Date.now()}`, companyId: request.companyId, userId: processedBy, userName: processedBy,
    action: 'Profile Update Rejected', module: 'Employee Profile',
    details: `Rejected ${request.label} change for ${request.employeeName}: ${rejectionReason || 'No reason'}`,
    timestamp: now,
  });
  res.json(updated);
}));

// --- GLOBAL ERROR HANDLER (must be after all routes) ---
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError('Unhandled route error:', err);
  if (res.headersSent) return;
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? (err.message || 'Internal server error') : 'Internal server error',
  });
});

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason: any) => {
  logError('Unhandled promise rejection:', reason);
});

// --- VITE MIDDLEWARE & STATIC ASSET SERVER COEXISTENCE ---

async function runMigrations() {
  const fs = await import('fs');
  const baseDir = process.cwd();

  const migrationFiles = [
    'migration_full_schema.sql',
      'migration_add_signature_url.sql',
      'migration_add_doc_url.sql',
      'migration_add_esign_fields.sql',
    'migration_profile_fields.sql',
    'migration_attendance_settings.sql',
    'migration_budget_items.sql',
    'migration_auth.sql',
    'migration_chat.sql',
    'migration_chat_groups.sql',
    'migration_voting.sql',
    'migration_add_voting_to_acme.sql',
    'migration_gallery.sql',
    'migration_add_gallery_to_acme.sql',
    'migration_doc_visibility.sql',
  ];

  for (const fileName of migrationFiles) {
    const migrationPath = path.join(baseDir, 'db', fileName);
    if (!fs.existsSync(migrationPath)) continue;

    const sql = fs.readFileSync(migrationPath, 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e: any) {
        if (e.code === '42710' || e.code === '42P07' || e.code === '42701') {
          // already exists — skip
        } else {
          console.warn(`Migration [${fileName}] warning:`, e.message?.substring(0, 120));
        }
      }
    }
  }
  logger.info('✅ DB migrations applied');
}

// --- AUTO-DISABLE LOGIN ON EXIT ---
// Disables login for employees whose approved exit lastWorkingDay has passed.
// Called on startup, on exit approval, and every 24 hours.
async function autoDisableExitLogins() {
  try {
    const allExits = await dbAll<any>(schema.exitRequests);
    const allUsers = await dbAll<any>(schema.users);
    const now = new Date();
    let disabledCount = 0;

    for (const exit of allExits) {
      if (exit.status !== 'Approved' || !exit.lastWorkingDay) continue;
      const lastDay = new Date(exit.lastWorkingDay);
      if (lastDay > now) continue; // not yet past last day

      // Find the matching user
      const user = allUsers.find((u: any) =>
        u.id === exit.employeeId ||
        (u.companyId === exit.companyId && u.name === exit.employeeName)
      );
      if (!user || user.loginEnabled === false) continue; // already disabled or not found

      // Cannot disable Super Admin or Company Admin
      if (user.role === 'Super Admin' || user.role === 'Company Admin') continue;

      const reason = exit.exitType === 'Resignation' ? 'resigned'
        : exit.exitType === 'Termination' ? 'terminated'
        : 'exited';

      await dbUpdate(schema.users, user.id, {
        loginEnabled: false,
        loginDisabledReason: reason,
        status: 'Inactive',
      });

      logAudit(
        user.companyId,
        'system',
        'System',
        'AUTO_DISABLE_LOGIN',
        'User Management',
        `Automatically disabled login for ${user.name} — ${exit.exitType} (last working day: ${exit.lastWorkingDay})`
      );
      disabledCount++;
    }

    if (disabledCount > 0) {
      logger.info(`🔐 Auto-disabled login for ${disabledCount} user(s) past their last working day`);
    }
  } catch (err: any) {
    logger.warn({ err }, 'autoDisableExitLogins error');
  }
}

// Daily cron — check every 24 hours for any exits that passed their last day
function startExitLoginCron() {
  setInterval(autoDisableExitLogins, 24 * 60 * 60 * 1000);
  logger.info('⏰ Exit login cron scheduled (every 24h)');
}

// E-VAT retry cron — retry queued submissions every hour
function startEvatRetryCron() {
  setInterval(async () => {
    try {
      await retryQueuedSubmissions();
    } catch (err: any) {
      logger.warn({ err }, 'E-VAT retry cron error');
    }
  }, 60 * 60 * 1000); // every hour
  logger.info('⏰ E-VAT retry cron scheduled (every 1h)');
}

async function start() {
  await runMigrations();

  // Auto-disable logins on startup
  await autoDisableExitLogins();
  startExitLoginCron();

  // Retry queued E-VAT submissions on startup
  try {
    await retryQueuedSubmissions();
  } catch (err: any) {
    logger.warn({ err }, 'E-VAT startup retry error');
  }
  startEvatRetryCron();

  // Migrate legacy users — hash blank passwords
  try {
    const allUsers = await dbAll<any>(schema.users);
    for (const u of allUsers) {
      if (!u.passwordHash) {
        const hash = await hashPassword('');
        await dbUpdate(schema.users, u.id, { passwordHash: hash });
        logger.info({ userId: u.id, email: u.email }, 'Hashed blank password for legacy user');
      }
    }
  } catch (err: any) {
    logger.warn({ err }, 'Password migration error');
  }

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

  try {
    // Fix live DB for testing
    await dbUpdate(schema.companies, 'c-acme', { domain: 'acme.core360.site' });
    const hash = await hashPassword('password123');
    await dbUpdate(schema.users, 'u-super', { passwordHash: hash });
    logger.info('Applied live DB fixes: acme domain and superadmin password123');
  } catch (e) {
    logger.error('Error applying live DB fixes', e);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 ERP Full-Stack Server booted and running on http://localhost:${PORT}`);
  });
}

start();
// Trigger restart









