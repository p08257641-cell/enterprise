/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HRModule } from './HRModule';
import { ReportsModule } from './ReportsModule';
import {
  Company, User, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice,
  InventoryItem, SupportTicket, AuditLog, APIKey, Department, Branch,
  LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, JournalEntry, Expense, FiscalPeriod, OpeningBalance,
  Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate,
  TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline
} from '../types';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../data/moduleCatalog';

interface ModuleViewsProps {
  activeView: string;
  selectedCompany: Company;
  selectedUser: User;
  employees: Employee[];
  departments: Department[];
  branches: Branch[];
  leads: CRMLead[];
  crmActivities: CRMActivityLog[];
  crmTasks: CRMTask[];
  crmEmails: CRMEmailLog[];
  glAccounts: GLAccount[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  apiKeys: APIKey[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  okrs: OKRRecord[];
  payslips: PayslipRecord[];
  journalEntries: JournalEntry[];
  expenses: Expense[];
  fiscalPeriods: FiscalPeriod[];
  openingBalances: OpeningBalance[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => void;
  onAddLead: (lead: Omit<CRMLead, 'id' | 'status' | 'aiLeadScore' | 'aiFollowUpSuggested' | 'createdAt'>) => void;
  onMoveLead: (leadId: string, status: CRMLead['status']) => void;
  onAssignLead: (leadId: string, userId: string, userName: string, department: string) => void;
  onAddComment: (leadId: string, content: string) => void;
  onAddInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'status'>) => void;
  onPayInvoice: (invId: string) => void;
  onAdjustStock: (itemId: string, qty: number) => void;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'assignedTo' | 'createdAt'>) => void;
  onInviteUser: (usr: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => void;
  onGenerateAPIKey: (name: string, permissions: 'Read Only' | 'Full Access') => void;
  onAddExpense?: (exp: { description: string; category: string; department: string; amount: number }) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeave: (input: { employeeId: string; employeeName: string; department: string; leaveType: string; startDate: string; endDate: string; reason: string; days: number }) => void;
  onClockIn: (mode?: string) => void;
  onClockOut: () => void;
  onAddOKR: (input: { employeeId: string; employeeName: string; department: string; title: string; keyResult: string; period: string }) => void;
  onUpdateOKRProgress: (id: string, progress: number) => void;
  onRunPayroll: (period: string, structure: string) => void;
  onAddGLAccount: (account: { code: string; name: string; type: string }) => void;
  onUpdateGLAccount: (accountId: string, updates: { name?: string; type?: string }) => void;
  onDeleteGLAccount: (accountId: string) => void;
  onCreateJournalEntry: (entry: any) => void;
  onPostJournalEntry: (entryId: string) => void;
  onApproveJournalEntry: (entryId: string) => void;
  onVoidJournalEntry: (entryId: string) => void;
  onApproveExpense: (expenseId: string) => void;
  onCloseFiscalPeriod: (periodId: string) => void;
  onSetOpeningBalance: (ob: { accountId: string; accountCode: string; accountName: string; periodId: string; debit: number; credit: number }) => void;
  // Tier 2
  bills: Bill[];
  billPayments: BillPayment[];
  customerPayments: CustomerPayment[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  bankReconciliations: BankReconciliation[];
  fixedAssets: FixedAsset[];
  depreciationEntries: DepreciationEntry[];
  budgets: Budget[];
  costCenters: CostCenter[];
  currencyRates: CurrencyRate[];
  onCreateBill: (bill: any) => void;
  onApproveBill: (billId: string) => void;
  onPayBill: (billId: string, amount: number, paymentMethod: string, bankAccountId: string) => void;
  onReceiveCustomerPayment: (payment: any) => void;
  onCreateBankAccount: (ba: any) => void;
  onReconcileBank: (rec: any) => void;
  onCreateFixedAsset: (asset: any) => void;
  onDisposeAsset: (assetId: string, disposalPrice: number) => void;
  onRunDepreciation: (period: string) => void;
  onCreateBudget: (budget: any) => void;
  onApproveBudget: (budgetId: string) => void;
  onCreateCostCenter: (cc: any) => void;
  onUpdateCurrencyRate: (rate: any) => void;
  // Tier 3
  taxCodes: TaxCode[];
  taxReturns: TaxReturn[];
  intercompanyTxns: IntercompanyTransaction[];
  consolidationRules: ConsolidationRule[];
  complianceChecks: ComplianceCheck[];
  auditSnapshots: AuditSnapshot[];
  policyDocuments: PolicyDocument[];
  filingDeadlines: FilingDeadline[];
  onCreateTaxReturn: (tr: any) => void;
  onFileTaxReturn: (returnId: string) => void;
  onCreateIntercompanyTxn: (tx: any) => void;
  onApproveIntercompanyTxn: (txId: string) => void;
  onEliminateIntercompanyTxn: (txId: string) => void;
  onCreateConsolidationRule: (rule: any) => void;
  onResolveComplianceCheck: (checkId: string, status: string) => void;
  onAcknowledgePolicy: (policyId: string, employeeId: string) => void;
  onFileDeadline: (filingId: string) => void;
  // Super Admin plan assignment
  tenants: Company[];
  onAssignPlan: (companyId: string, moduleIds: string[], billingPlan: Company['billingPlan']) => void;
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

const PageHeader = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between pb-5 border-b border-slate-200 mb-6">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 page-title">{title}</h1>
      <p className="text-sm text-slate-500 mt-0.5 page-subtitle">{subtitle}</p>
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

const StatCard = ({ label, value, sub, icon, accent = false, color = '' }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean; color?: string; key?: React.Key;
}) => (
  <div className={`rounded-xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-200 ${accent ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
    <div className="flex items-center justify-between">
      <span className="stat-label">{label}</span>
      <i className={`${icon} text-sm ${accent ? 'text-slate-400' : 'text-slate-300'}`}></i>
    </div>
    <div className={`text-2xl font-bold tracking-tight font-sans tabular-nums ${accent ? 'text-white' : color || 'text-slate-900'}`}>{value}</div>
    {sub && <p className={`text-xs leading-snug ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

const Badge = ({ label, variant = 'default' }: { label: string; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' }) => {
  const s = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded badge border ${s[variant]}`}>{label}</span>;
};

const Th = ({ children, right = false }: { children: React.ReactNode; right?: boolean; key?: React.Key }) => (
  <th className={`px-4 py-3 section-title text-slate-400 ${right ? 'text-right' : ''}`}>{children}</th>
);

const TableHead = ({ cols }: { cols: { label: string; right?: boolean }[] }) => (
  <thead className="bg-slate-50/60 border-b border-slate-100">
    <tr>{cols.map(c => <Th key={c.label} right={c.right}>{c.label}</Th>)}</tr>
  </thead>
);

const EmptyRow = ({ cols, message }: { cols: number; message: string }) => (
  <tr><td colSpan={cols} className="text-center py-10 data-value-small text-slate-400">{message}</td></tr>
);

const PrimaryBtn = ({ onClick, icon, children }: { onClick?: () => void; icon?: string; children: React.ReactNode }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold btn px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
    {icon && <i className={`${icon} text-xs`}></i>}{children}
  </button>
);

const SecBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold btn px-4 py-2 rounded-lg transition-all cursor-pointer">
    {children}
  </button>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block data-label text-slate-700 mb-1">{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 ${props.className ?? ''}`} />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 ${props.className ?? ''}`} />
);

// ── Main Component ───────────────────────────────────────────────────────────

export const ModuleViews: React.FC<ModuleViewsProps> = ({
  activeView, selectedCompany, selectedUser,
  employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory,
  tickets, auditLogs, apiKeys,
  leaves, attendance, okrs, payslips,
  journalEntries, expenses, fiscalPeriods, openingBalances,
  onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddInvoice,
  onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense,
  onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll,
  onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount,
  onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry,
  onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance,
  bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations,
  fixedAssets, depreciationEntries, budgets, costCenters, currencyRates,
  onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment,
  onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset,
  onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate,
  taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines,
  onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn,
  onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline,
  tenants, onAssignPlan
}) => {
  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const localLeads = leads.filter(l => l.companyId === selectedCompany.id);
  const localGL = glAccounts.filter(g => g.companyId === selectedCompany.id);
  const localInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const localStock = inventory.filter(s => s.companyId === selectedCompany.id);
  const localTickets = tickets.filter(t => t.companyId === selectedCompany.id);
  const localLogs = auditLogs.filter(l => l.companyId === selectedCompany.id);
  const localAPIKeys = (apiKeys || []).filter(k => k.companyId === selectedCompany.id);
  const localBranches = branches.filter(b => b.companyId === selectedCompany.id);
  const localJournalEntries = journalEntries.filter(j => j.companyId === selectedCompany.id);
  const localExpenses = expenses.filter(e => e.companyId === selectedCompany.id);
  const localFiscalPeriods = fiscalPeriods.filter(f => f.companyId === selectedCompany.id);
  const localOpeningBalances = openingBalances.filter(o => o.companyId === selectedCompany.id);
  const localBills = bills.filter(b => b.companyId === selectedCompany.id);
  const localBillPayments = billPayments.filter(b => b.companyId === selectedCompany.id);
  const localCustomerPayments = customerPayments.filter(p => p.companyId === selectedCompany.id);
  const localBankAccounts = bankAccounts.filter(b => b.companyId === selectedCompany.id);
  const localBankTransactions = bankTransactions.filter(t => t.companyId === selectedCompany.id);
  const localBankReconciliations = bankReconciliations.filter(r => r.companyId === selectedCompany.id);
  const localFixedAssets = fixedAssets.filter(a => a.companyId === selectedCompany.id);
  const localDepreciationEntries = depreciationEntries.filter(d => d.companyId === selectedCompany.id);
  const localBudgets = budgets.filter(b => b.companyId === selectedCompany.id);
  const localCostCenters = costCenters.filter(c => c.companyId === selectedCompany.id);
  const localCurrencyRates = currencyRates.filter(r => r.companyId === selectedCompany.id);
  const localTaxCodes = taxCodes.filter(t => t.companyId === selectedCompany.id);
  const localTaxReturns = taxReturns.filter(t => t.companyId === selectedCompany.id);
  const localIntercompanyTxns = intercompanyTxns.filter(t => t.companyId === selectedCompany.id || t.fromCompanyId === selectedCompany.id || t.toCompanyId === selectedCompany.id);
  const localConsolidationRules = consolidationRules.filter(r => r.companyId === selectedCompany.id);
  const localComplianceChecks = complianceChecks.filter(c => c.companyId === selectedCompany.id);
  const localAuditSnapshots = auditSnapshots.filter(s => s.companyId === selectedCompany.id);
  const localPolicyDocuments = policyDocuments.filter(p => p.companyId === selectedCompany.id);
  const localFilingDeadlines = filingDeadlines.filter(f => f.companyId === selectedCompany.id);

  const isAdmin = selectedUser.activeRole === 'Super Admin' || selectedUser.activeRole === 'Company Admin';
  const isSuperAdmin = selectedUser.activeRole === 'Super Admin';
  const isHR = selectedUser.activeRole === 'HR Manager' || selectedUser.activeRole === 'HR Officer';
  const isHRorAdmin = isAdmin || isHR;

  // Employee name resolution from HR data (single source of truth)
  const resolveUserName = (userId: string): string => {
    const emp = getEmployeeByUserId(employees, userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : getUserNameById([], userId);
  };

  // ── Form States ─────────────────────────────────────────────────────────────
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planTenantId, setPlanTenantId] = useState('');
  const [planModuleIds, setPlanModuleIds] = useState<string[]>([]);
  const [planBilling, setPlanBilling] = useState<Company['billingPlan']>('Core');

  const openPlanModal = () => {
    setPlanTenantId(tenants[0]?.id ?? '');
    setPlanModuleIds([]);
    setPlanBilling('Core');
    setPlanModalOpen(true);
  };
  const togglePlanModule = (id: string) => {
    setPlanModuleIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };
  const planTotal = planPriceForModules(planModuleIds);
  const submitPlan = () => {
    if (!planTenantId) return;
    onAssignPlan(planTenantId, planModuleIds, planBilling);
    setPlanModalOpen(false);
  };

  const [platformTab, setPlatformTab] = useState<'tenants' | 'billing' | 'subscriptions' | 'analytics' | 'users' | 'settings'>(() => {
    if (activeView === 'platform-tenants') return 'tenants';
    if (activeView === 'platform-billing') return 'billing';
    if (activeView === 'platform-subscriptions') return 'subscriptions';
    if (activeView === 'platform-analytics') return 'analytics';
    if (activeView === 'platform-users') return 'users';
    if (activeView === 'platform-settings') return 'settings';
    return 'tenants';
  });

  const [adminTab, setAdminTab] = useState<'branches' | 'departments' | 'users' | 'roles' | 'approvals' | 'settings'>(() => {
    if (activeView === 'admin-users') return 'users';
    if (activeView === 'admin-roles') return 'roles';
    if (activeView === 'admin-branches') return 'branches';
    if (activeView === 'admin-departments') return 'departments';
    if (activeView === 'admin-approvals') return 'approvals';
    if (activeView === 'admin-settings') return 'settings';
    return 'branches';
  });

  // ── Approval Workflow Configuration State ──────────────────────────────────
  const [approvalPolicies, setApprovalPolicies] = useState<Record<string, string[]>>({
    'Leave Requests': ['Department Head', 'Company Admin'],
    'Payroll Processing': ['HR Manager', 'Company Admin'],
    'Expense Claims': ['Finance Manager', 'Company Admin'],
    'Procurement / PO': ['Finance Manager', 'Company Admin'],
    'Recruitment Offers': ['Department Head', 'HR Manager'],
    'Asset Requests': ['Company Admin'],
  });
  const [approvalSaveSuccess, setApprovalSaveSuccess] = useState(false);

  const [hrTab, setHrTab] = useState<'directory' | 'hire' | 'leave' | 'attendance' | 'onboarding' | 'performance' | 'orgchart' | 'exit' | 'departments'>(() => {
    if (activeView === 'hr-attendance') return 'attendance';
    if (activeView === 'hr-leave') return 'leave';
    if (activeView === 'hr-recruitment') return 'hire';
    if (activeView === 'hr-onboarding') return 'onboarding';
    if (activeView === 'hr-performance') return 'performance';
    if (activeView === 'hr-orgchart') return 'orgchart';
    if (activeView === 'hr-exit') return 'exit';
    if (activeView === 'hr-departments') return 'departments';
    return 'directory';
  });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviteRoles, setInviteRoles] = useState<string[]>(['Employee']);
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [inviteBranch, setInviteBranch] = useState('HQ');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [hrSearch, setHrSearch] = useState('');
  const [hrFirst, setHrFirst] = useState(''); const [hrLast, setHrLast] = useState('');
  const [hrEmail, setHrEmail] = useState(''); const [hrDept, setHrDept] = useState('Engineering');
  const [hrRole, setHrRole] = useState('Engineer'); const [hrBranch, setHrBranch] = useState('HQ');
  const [hrSalary, setHrSalary] = useState('6500'); const [hireSuccess, setHireSuccess] = useState<string | null>(null);
  const [exitEmp, setExitEmp] = useState('');
  const [exitType, setExitType] = useState<'Resignation' | 'Termination' | 'Retirement'>('Resignation');
  const [exitReason, setExitReason] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitSuccess, setExitSuccess] = useState(false);

  const [crmTab, setCrmTab] = useState<'pipeline' | 'contacts' | 'activities' | 'tasks' | 'emails' | 'reports'>('pipeline');
  const [crmSearch, setCrmSearch] = useState(''); const [crmFilter, setCrmFilter] = useState('All');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [crmFirst, setCrmFirst] = useState(''); const [crmLast, setCrmLast] = useState('');
  const [crmEmail, setCrmEmail] = useState(''); const [crmPhone, setCrmPhone] = useState('');
  const [crmCompany, setCrmCompany] = useState(''); const [crmValue, setCrmValue] = useState('25000');
  const [crmSource, setCrmSource] = useState<'Website' | 'Referral' | 'LinkedIn' | 'Ad Campaign' | 'Partner'>('Website');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // CRM Collaboration Features
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  // CRM Activity Logging
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [logActivityLeadId, setLogActivityLeadId] = useState('');
  const [logActivityType, setLogActivityType] = useState<'Call' | 'Email' | 'Meeting' | 'Note' | 'Task'>('Call');
  const [logActivitySubject, setLogActivitySubject] = useState('');
  const [logActivityDesc, setLogActivityDesc] = useState('');

  // CRM Contact Detail
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);

  // CRM Task Management
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState<'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Proposal' | 'Other'>('Follow-up');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskLeadId, setTaskLeadId] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  // CRM Email
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailLeadId, setEmailLeadId] = useState('');

  const [accTab, setAccTab] = useState<'ledger' | 'invoices' | 'create' | 'expenses' | 'create-expense' | 'reports' | 'journal' | 'trial' | 'opening-balances' | 'fiscal-periods' | 'ap' | 'ar' | 'bank' | 'fixed-assets' | 'budgets' | 'cost-centers' | 'multi-currency' | 'tax' | 'tax-returns' | 'intercompany' | 'consolidation' | 'compliance' | 'audit-trail' | 'policies' | 'filing-deadlines' | 'reports-pl' | 'reports-bs' | 'reports-cf' | 'reports-aging'>('ledger');
  const [accGroup, setAccGroup] = useState<'gl' | 'invoices' | 'expenses' | 'ap' | 'ar' | 'bank' | 'assets' | 'tax' | 'reports'>('gl');
  const [accSearch, setAccSearch] = useState('');
  const [accFilter, setAccFilter] = useState('All');
  const [invClient, setInvClient] = useState(''); const [invSubtotal, setInvSubtotal] = useState('15000');
  const [invTax, setInvTax] = useState('1200'); const [invSuccess, setInvSuccess] = useState(false);
  const [expName, setExpName] = useState(''); const [expAmount, setExpAmount] = useState('120');
  const [expCategory, setExpCategory] = useState('Supplies'); const [expDept, setExpDept] = useState('IT');
  const [expSuccess, setExpSuccess] = useState(false);

  // GL Account CRUD modal state
  const [showGLModal, setShowGLModal] = useState(false);
  const [editingGLAccount, setEditingGLAccount] = useState<GLAccount | null>(null);
  const [glFormCode, setGlFormCode] = useState('');
  const [glFormName, setGlFormName] = useState('');
  const [glFormType, setGlFormType] = useState<string>('Asset');

  // Journal Entry form state
  const [jeDate, setJeDate] = useState(new Date().toISOString().split('T')[0]);
  const [jeDescription, setJeDescription] = useState('');
  const [jeReference, setJeReference] = useState('');
  const [jeAssignee, setJeAssignee] = useState('');
  const [jeLines, setJeLines] = useState<Array<{ accountId: string; accountCode: string; accountName: string; debit: number; credit: number; description: string }>>([
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' },
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }
  ]);

  // Expense form state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expFormDesc, setExpFormDesc] = useState('');
  const [expFormCategory, setExpFormCategory] = useState('Office Supplies');
  const [expFormDept, setExpFormDept] = useState('Operations');
  const [expFormAmount, setExpFormAmount] = useState('');
  const [expFormAssignee, setExpFormAssignee] = useState('');

  // Bill form state
  const [showBillModal, setShowBillModal] = useState(false);
  const [billVendor, setBillVendor] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billAssignee, setBillAssignee] = useState('');

  // Compliance Check form state
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [compCheckName, setCompCheckName] = useState('');
  const [compCheckDesc, setCompCheckDesc] = useState('');
  const [compCheckCategory, setCompCheckCategory] = useState('Financial');
  const [compCheckDueDate, setCompCheckDueDate] = useState('');
  const [compCheckAssignee, setCompCheckAssignee] = useState('');

  // Filing Deadline form state
  const [showFilingModal, setShowFilingModal] = useState(false);
  const [filingName, setFilingName] = useState('');
  const [filingDesc, setFilingDesc] = useState('');
  const [filingType, setFilingType] = useState('Tax Return');
  const [filingDueDate, setFilingDueDate] = useState('');
  const [filingAssignee, setFilingAssignee] = useState('');

  const [payrollTab, setPayrollTab] = useState<'run' | 'slips' | 'tax' | 'overtime'>('run');
  const [payrollStep, setPayrollStep] = useState<'idle' | 'review' | 'done'>('idle');
  const [paySalaryStructure, setPaySalaryStructure] = useState('Standard');
  const [payMonth, setPayMonth] = useState('July 2026');
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);

  const [procTab, setProcTab] = useState<'orders' | 'vendors' | 'rfq'>('orders');
  const [procOrders, setProcOrders] = useState([
    { id: 'PO-2201', vendor: 'Industrial Tooling Co.', item: 'CNC Drill Bits x50', total: 4500, status: 'Approved', date: '2026-07-05' },
    { id: 'PO-2202', vendor: 'Apex Chemical Lab', item: 'Synthetic Lubricant 200L', total: 8200, status: 'Pending', date: '2026-07-08' },
    { id: 'PO-2203', vendor: 'TechParts Global', item: 'Servo Motors x12', total: 21600, status: 'Received', date: '2026-07-02' },
  ]);
  const [procItem, setProcItem] = useState(''); const [procVendor, setProcVendor] = useState('');
  const [procQty, setProcQty] = useState('10'); const [procPrice, setProcPrice] = useState('500');

  const [salesTab, setSalesTab] = useState<'orders' | 'quotes' | 'customers' | 'targets'>('orders');
  const [salesOrders] = useState([
    { id: 'SO-8801', client: 'Alpha Biotech Group', items: 'Lab Pipettes x200', total: 12400, status: 'Completed', date: '2026-07-06' },
    { id: 'SO-8802', client: 'Beta Robotics LLC', items: 'Hydraulic Cylinders x8', total: 28000, status: 'Processing', date: '2026-07-08' },
    { id: 'SO-8803', client: 'Gamma Pharma Inc.', items: 'Centrifuge Tubes x5000', total: 6750, status: 'Pending', date: '2026-07-09' },
  ]);

  const [invTab, setInvTab] = useState<'stock' | 'adjust' | 'warehouses' | 'transfers' | 'valuation'>('stock');
  const [invSearch, setInvSearch] = useState('');
  const [adjItem, setAdjItem] = useState(''); const [adjQty, setAdjQty] = useState('100');

  const [projTab, setProjTab] = useState<'kanban' | 'milestones' | 'time' | 'resources'>('kanban');
  const [projTasks, setProjTasks] = useState([
    { id: 'T-01', title: 'Design DB Schema', status: 'Done', priority: 'High', assignee: 'Elena R.', due: '2026-07-05' },
    { id: 'T-02', title: 'Integrate SSO Auth', status: 'In Progress', priority: 'Critical', assignee: 'Kaito M.', due: '2026-07-12' },
    { id: 'T-03', title: 'Build BOM Module UI', status: 'In Progress', priority: 'High', assignee: 'Ayasha C.', due: '2026-07-15' },
    { id: 'T-04', title: 'Write API Docs', status: 'To Do', priority: 'Medium', assignee: 'Markus V.', due: '2026-07-20' },
    { id: 'T-05', title: 'Pen-test Endpoints', status: 'To Do', priority: 'Critical', assignee: 'Lila P.', due: '2026-07-25' },
    { id: 'T-06', title: 'UX Accessibility Audit', status: 'Review', priority: 'Low', assignee: 'James O.', due: '2026-07-18' },
  ]);
  const [newTask, setNewTask] = useState(''); const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const [assets, setAssets] = useState([
    { id: 'AST-082', name: 'Laser CNC Cutter v4', category: 'Heavy Machinery', location: 'Plant A', status: 'Operational', value: 85000, qr: 'AST-082-CNC' },
    { id: 'AST-091', name: 'MacBook Pro M3 16"', category: 'IT Hardware', location: 'NYC HQ', status: 'Assigned', value: 3200, qr: 'AST-091-MBP' },
    { id: 'AST-103', name: 'Forklift Hyster 50', category: 'Logistics', location: 'Warehouse B', status: 'Maintenance', value: 42000, qr: 'AST-103-FKL' },
  ]);
  const [assetTab, setAssetTab] = useState<'register' | 'maintenance' | 'depreciation'>('register');
  const [newAssetName, setNewAssetName] = useState(''); const [newAssetCat, setNewAssetCat] = useState('IT Hardware');
  const [newAssetLoc, setNewAssetLoc] = useState('NYC HQ'); const [newAssetVal, setNewAssetVal] = useState('1000');

  const [mfgTab, setMfgTab] = useState<'orders' | 'bom' | 'quality'>('orders');
  const [workOrders] = useState([
    { id: 'WO-501', product: 'Pneumatic Actuator', qty: 250, line: 'Assembly Line B', status: 'In Progress', completion: 65 },
    { id: 'WO-502', product: 'Bio-Vial Stopper', qty: 5000, line: 'Injection Mold 3', status: 'Scheduled', completion: 0 },
    { id: 'WO-503', product: 'Servo Bracket Assy', qty: 120, line: 'Fabrication Bay 1', status: 'Completed', completion: 100 },
  ]);
  const [bomProduct, setBomProduct] = useState('Pneumatic Actuator');
  const bomData = [
    { part: 'Aluminum Housing', qty: 1, unit: 'pcs', cost: 18.50 },
    { part: 'O-Ring Seal Kit', qty: 4, unit: 'pcs', cost: 3.20 },
    { part: 'Stainless Piston Rod', qty: 1, unit: 'pcs', cost: 24.00 },
    { part: 'Spring Coil 12mm', qty: 2, unit: 'pcs', cost: 5.50 },
    { part: 'End Cap Assembly', qty: 2, unit: 'pcs', cost: 8.75 },
  ];

  const posProducts = [
    { id: 'p1', name: 'Lab Vial Kit', price: 45.00, cat: 'Supplies' },
    { id: 'p2', name: 'Safety Gloves L', price: 12.00, cat: 'PPE' },
    { id: 'p3', name: 'Face Shield', price: 28.50, cat: 'PPE' },
    { id: 'p4', name: 'Microscope Slides', price: 18.00, cat: 'Supplies' },
    { id: 'p5', name: 'Nitrile Gloves Box', price: 22.00, cat: 'PPE' },
    { id: 'p6', name: 'pH Test Strips', price: 9.50, cat: 'Supplies' },
  ];
  const [posTab, setPosTab] = useState<'register' | 'sessions' | 'reports'>('register');
  const [posCart, setPosCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [posReceipt, setPosReceipt] = useState<{ ref: string; total: number; ts: string } | null>(null);

  const addToCart = (p: { id: string; name: string; price: number }) => {
    setPosCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const posSubtotal = posCart.reduce((s, i) => s + i.price * i.qty, 0);
  const posTotal = posSubtotal * (1 - posDiscount / 100);

  const [docTab, setDocTab] = useState<'locker' | 'esign' | 'ocr'>('locker');
  const [documents] = useState([
    { id: 'DOC-001', name: 'Employee NDA 2026', type: 'NDA', size: '84 KB', status: 'Signed', date: '2026-06-15' },
    { id: 'DOC-002', name: 'Vendor Contract – Tooling Co.', type: 'Contract', size: '212 KB', status: 'Pending Signature', date: '2026-07-01' },
    { id: 'DOC-003', name: 'ISO Audit Report Q2', type: 'Report', size: '1.2 MB', status: 'Approved', date: '2026-07-05' },
    { id: 'DOC-004', name: 'GDPR Data Policy v3', type: 'Policy', size: '340 KB', status: 'Draft', date: '2026-07-08' },
  ]);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [signDoc, setSignDoc] = useState<string | null>(null);

  const [hdTab, setHdTab] = useState<'queue' | 'create' | 'kb' | 'sla'>('queue');
  const [tktName, setTktName] = useState(''); const [tktEmail, setTktEmail] = useState('');
  const [tktSubject, setTktSubject] = useState(''); const [tktDesc, setTktDesc] = useState('');
  const [tktCat, setTktCat] = useState<'Technical' | 'Billing' | 'Sales' | 'General'>('Technical');
  const [tktPri, setTktPri] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [tktAssignee, setTktAssignee] = useState('');
  const [tktSuccess, setTktSuccess] = useState(false);

  const [visTab, setVisTab] = useState<'checkin' | 'log' | 'badges'>('checkin');
  const [visitors, setVisitors] = useState([
    { id: 'V-201', name: 'Markus Vance', host: 'Elena Rostova', company: 'Apex Inc.', checkIn: '09:15 AM', checkOut: null as string | null, status: 'Inside' },
    { id: 'V-202', name: 'Jin Li', host: 'Kaito Matsuda', company: 'TechParts Global', checkIn: '10:30 AM', checkOut: '11:45 AM', status: 'Checked Out' },
  ]);
  const [visName, setVisName] = useState(''); const [visHost, setVisHost] = useState('');
  const [visCompany, setVisCompany] = useState(''); const [visBadge, setVisBadge] = useState<string | null>(null);

  const [lmsTab, setLmsTab] = useState<'courses' | 'quiz' | 'progress'>('courses');
  const courses = [
    { id: 'C01', title: 'ISO 9001 Quality Management', level: 'Intermediate', duration: '4h 30m', enrolled: 12, completion: 78, cat: 'Compliance' },
    { id: 'C02', title: 'Workplace Safety & OSHA', level: 'Beginner', duration: '2h 15m', enrolled: 28, completion: 91, cat: 'Safety' },
    { id: 'C03', title: 'Advanced Excel for Finance', level: 'Advanced', duration: '6h 00m', enrolled: 7, completion: 45, cat: 'Finance' },
    { id: 'C04', title: 'ERP System Administrator', level: 'Advanced', duration: '8h 00m', enrolled: 4, completion: 30, cat: 'IT' },
  ];
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const quizQuestions = [
    { id: 'q1', q: 'What does ISO stand for?', options: ['International Standards Org', 'Internal Safety Operations', 'International Organization for Standardization', 'Industrial Safety Order'], correct: 'International Organization for Standardization' },
    { id: 'q2', q: 'OSHA stands for:', options: ['Occupational Safety & Health Administration', 'Office Safety Hazard Assessment', 'Operational Standards & Health Act', 'None of the above'], correct: 'Occupational Safety & Health Administration' },
    { id: 'q3', q: 'A corrective action is required when:', options: ['A product is shipped', 'A non-conformance is detected', 'A new employee is hired', 'Payroll is processed'], correct: 'A non-conformance is detected' },
  ];

  const [compTab, setCompTab] = useState<'checklists' | 'policies' | 'incidents'>('checklists');
  const [checks, setChecks] = useState<Record<string, boolean>>({
    'GDPR Data Processing Compliant': true, 'ISO 9001 Audit Passed': false,
    'SOX Financial Controls Active': true, 'OSHA Safety Inspections Current': false,
    'Cybersecurity Policy Updated': true, 'Employee Data Backup Verified': false,
  });
  const [incidents] = useState([
    { id: 'INC-001', title: 'Unauthorized Data Access Attempt', severity: 'High', date: '2026-07-05', status: 'Under Review' },
    { id: 'INC-002', title: 'Equipment Malfunction – Line B', severity: 'Medium', date: '2026-07-08', status: 'Resolved' },
  ]);

  const [commTab, setCommTab] = useState<'feed' | 'compose' | 'chat' | 'email'>('feed');
  const [announcements, setAnnouncements] = useState([
    { id: 'A1', title: 'Q3 All-Hands Meeting — July 15th', body: 'Join us at 10 AM in the main conference hall or via Zoom. Attendance is mandatory.', author: 'Elena Rostova', channel: 'Company', date: '2026-07-08', pinned: true },
    { id: 'A2', title: 'New Safety Protocol for Plant A', body: 'Please review the updated OSHA guidelines uploaded to the Document Locker before Friday.', author: 'James Okoro', channel: 'Operations', date: '2026-07-07', pinned: false },
    { id: 'A3', title: 'IT Maintenance Window — Sunday 2 AM', body: 'ERP system will be unavailable from 2 AM to 4 AM Sunday for scheduled maintenance.', author: 'IT Team', channel: 'IT', date: '2026-07-06', pinned: false },
  ]);
  const [commTitle, setCommTitle] = useState(''); const [commBody, setCommBody] = useState('');
  const [commChannel, setCommChannel] = useState('Company'); const [commSent, setCommSent] = useState(false);

  const [rptTab, setRptTab] = useState<'overview' | 'financial' | 'hr' | 'sales' | 'custom' | 'export'>('overview');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [inviteTab, setInviteTab] = useState<'users' | 'invite'>('users');
  const [invName, setInvName] = useState(''); const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState('HR Manager'); const [invDept, setInvDept] = useState('HR');
  const [invBranch, setInvBranch] = useState('HQ'); const [invSuccess2, setInvSuccess2] = useState(false);

  const [keyName, setKeyName] = useState(''); const [keyPerms, setKeyPerms] = useState<'Read Only' | 'Full Access'>('Read Only');
  const [keySuccess, setKeySuccess] = useState(false);

  const [leaveFormType, setLeaveFormType] = useState('Annual Leave');
  const [leaveFormStart, setLeaveFormStart] = useState('');
  const [leaveFormEnd, setLeaveFormEnd] = useState('');
  const [leaveFormReason, setLeaveFormReason] = useState('');
  const [myLeaveRequests, setMyLeaveRequests] = useState([
    { id: 'ml-1', type: 'Annual Leave', dates: 'Aug 12 – Aug 18', reason: 'Summer holiday', status: 'Approved' },
    { id: 'ml-2', type: 'Sick Leave', dates: 'Jul 2', reason: 'Dental appointment', status: 'Approved' },
  ]);
  const [leaveFormSuccess, setLeaveFormSuccess] = useState(false);

  // ── Dynamic Role Management State ──────────────────────────────────────────
  const [customRoles, setCustomRoles] = useState([
    { id: 'role-1', name: 'Company Admin', permissions: 'Full system access within tenant', rawPermissions: ['admin_all'], users: 1 },
    { id: 'role-ceo', name: 'CEO', permissions: 'Full company access, executive oversight', rawPermissions: ['admin_all', 'executive_view'], users: 0 },
    { id: 'role-2', name: 'HR Manager', permissions: 'HR, Payroll, Attendance, Recruitment, Leave Approvals', rawPermissions: ['hr_view', 'hr_edit', 'leave_approve', 'payroll_manage'], users: 2 },
    { id: 'role-hro', name: 'HR Officer', permissions: 'HR, Payroll, Attendance, Recruitment', rawPermissions: ['hr_view', 'hr_edit', 'leave_approve'], users: 1 },
    { id: 'role-3', name: 'Finance Manager', permissions: 'Accounting, Invoices, Ledger, Expenses, Payroll Processing', rawPermissions: ['accounting_view', 'accounting_edit', 'payroll_manage'], users: 1 },
    { id: 'role-acc', name: 'Accountant', permissions: 'Accounting, Journal Entries, Reports', rawPermissions: ['accounting_view', 'accounting_edit'], users: 1 },
    { id: 'role-4', name: 'Sales Manager', permissions: 'CRM pipeline, Customer contacts, Sales logs', rawPermissions: ['sales_manage'], users: 2 },
    { id: 'role-sr', name: 'Sales Rep', permissions: 'CRM pipeline, Customer contacts', rawPermissions: ['crm_view', 'crm_edit'], users: 2 },
    { id: 'role-se', name: 'Sales Executive', permissions: 'CRM pipeline, Sales targets, Customer contacts', rawPermissions: ['crm_view', 'crm_edit', 'sales_manage'], users: 0 },
    { id: 'role-5', name: 'Inventory Manager', permissions: 'Stock Levels, Warehouse transfers, Procurement POs', rawPermissions: ['inventory_manage'], users: 1 },
    { id: 'role-sk', name: 'Store Keeper', permissions: 'Stock Levels, Warehouse management', rawPermissions: ['inventory_view', 'inventory_edit'], users: 1 },
    { id: 'role-6', name: 'Support Agent', permissions: 'Help Desk tickets, Visitor logs, Internal chat', rawPermissions: ['helpdesk_edit'], users: 3 },
    { id: 'role-dh', name: 'Department Head', permissions: 'Department management, limited admin access', rawPermissions: ['hr_view', 'admin_manage'], users: 0 },
  ]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; permissions: string; rawPermissions: string[]; users: number } | null>(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormPermissions, setRoleFormPermissions] = useState<string[]>([]);

  const handleOpenRoleModal = (roleToEdit: typeof customRoles[0] | null) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleFormName(roleToEdit.name);
      setRoleFormDesc(roleToEdit.permissions);
      setRoleFormPermissions(roleToEdit.rawPermissions);
    } else {
      setEditingRole(null);
      setRoleFormName('');
      setRoleFormDesc('');
      setRoleFormPermissions([]);
    }
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;

    if (editingRole) {
      setCustomRoles(prev => prev.map(r => r.id === editingRole.id ? {
        ...r,
        name: roleFormName,
        permissions: roleFormDesc || 'Custom permissions assigned',
        rawPermissions: roleFormPermissions
      } : r));
    } else {
      const newRole = {
        id: `role-${Date.now()}`,
        name: roleFormName,
        permissions: roleFormDesc || 'Custom permissions assigned',
        rawPermissions: roleFormPermissions,
        users: 0
      };
      setCustomRoles(prev => [...prev, newRole]);
    }
    setShowRoleModal(false);
  };

  // Synchronize local tab states with activeView prop
  useEffect(() => {
    // Platform Management (Super Admin only)
    if (activeView === 'platform-tenants') setPlatformTab('tenants');
    else if (activeView === 'platform-billing') setPlatformTab('billing');
    else if (activeView === 'platform-subscriptions') setPlatformTab('subscriptions');
    else if (activeView === 'platform-analytics') setPlatformTab('analytics');
    else if (activeView === 'platform-users') setPlatformTab('users');
    else if (activeView === 'platform-settings') setPlatformTab('settings');
    else if (activeView === 'platform') setPlatformTab('tenants');

    // Dashboard
    if (activeView === 'dashboard') {
      // Dashboard is now a separate view
    }

    // Administration
    if (activeView === 'admin-users') setAdminTab('users');
    else if (activeView === 'admin-roles') setAdminTab('roles');
    else if (activeView === 'admin-branches') setAdminTab('branches');
    else if (activeView === 'admin-departments') setAdminTab('departments');
    else if (activeView === 'admin-approvals') setAdminTab('approvals');
    else if (activeView === 'admin-settings') setAdminTab('settings');
    else if (activeView === 'admin') setAdminTab('branches');

    // HR
    if (activeView === 'hr-attendance') setHrTab('attendance');
    else if (activeView === 'hr-leave') setHrTab('leave');
    else if (activeView === 'hr-recruitment') setHrTab('hire');
    else if (activeView === 'hr-onboarding') setHrTab('onboarding');
    else if (activeView === 'hr-performance') setHrTab('performance');
    else if (activeView === 'hr-orgchart') setHrTab('orgchart');
    else if (activeView === 'hr-exit') setHrTab('exit');
    else if (activeView === 'hr-departments') setHrTab('departments');
    else if (activeView === 'hr') setHrTab('directory');

    // Payroll
    if (activeView === 'payroll-slips') setPayrollTab('slips');
    else if (activeView === 'payroll-tax') setPayrollTab('tax');
    else if (activeView === 'payroll-overtime') setPayrollTab('overtime');
    else if (activeView === 'payroll') setPayrollTab('run');

    // CRM
    if (activeView === 'crm-contacts') setCrmTab('contacts');
    else if (activeView === 'crm-activities') setCrmTab('activities');
    else if (activeView === 'crm-tasks') setCrmTab('tasks');
    else if (activeView === 'crm-emails') setCrmTab('emails');
    else if (activeView === 'crm-reports') setCrmTab('reports');
    else if (activeView === 'crm') setCrmTab('pipeline');

    // Accounting - set group and tab based on sidebar item
    if (activeView === 'accounting') { setAccGroup('gl'); setAccTab('ledger'); }
    else if (activeView === 'acc-invoices') { setAccGroup('invoices'); setAccTab('invoices'); }
    else if (activeView === 'acc-expenses') { setAccGroup('expenses'); setAccTab('expenses'); }
    else if (activeView === 'acc-ap') { setAccGroup('ap'); setAccTab('ap'); }
    else if (activeView === 'acc-ar') { setAccGroup('ar'); setAccTab('ar'); }
    else if (activeView === 'acc-bank') { setAccGroup('bank'); setAccTab('bank'); }
    else if (activeView === 'acc-assets') { setAccGroup('assets'); setAccTab('fixed-assets'); }
    else if (activeView === 'acc-tax') { setAccGroup('tax'); setAccTab('tax'); }
    else if (activeView === 'acc-reports') { setAccGroup('reports'); setAccTab('reports-pl'); }

    // Sales
    if (activeView === 'sales-quotes') setSalesTab('quotes');
    else if (activeView === 'sales-customers') setSalesTab('customers');
    else if (activeView === 'sales-targets') setSalesTab('targets');
    else if (activeView === 'sales') setSalesTab('orders');

    // Inventory
    if (activeView === 'inv-warehouses') setInvTab('warehouses');
    else if (activeView === 'inv-transfers') setInvTab('transfers');
    else if (activeView === 'inv-valuation') setInvTab('valuation');
    else if (activeView === 'inventory') setInvTab('stock');

    // Procurement
    if (activeView === 'proc-vendors') setProcTab('vendors');
    else if (activeView === 'proc-rfq') setProcTab('rfq');
    else if (activeView === 'procurement') setProcTab('orders');

    // Project
    if (activeView === 'proj-milestones') setProjTab('milestones');
    else if (activeView === 'proj-time') setProjTab('time');
    else if (activeView === 'proj-resources') setProjTab('resources');
    else if (activeView === 'project') setProjTab('kanban');

    // Manufacturing
    if (activeView === 'mfg-orders') setMfgTab('orders');
    else if (activeView === 'mfg-quality') setMfgTab('quality');
    else if (activeView === 'manufacturing') setMfgTab('bom');

    // POS
    if (activeView === 'pos-sessions') setPosTab('sessions');
    else if (activeView === 'pos-reports') setPosTab('reports');
    else if (activeView === 'pos') setPosTab('register');

    // Asset
    if (activeView === 'asset-maintenance') setAssetTab('maintenance');
    else if (activeView === 'asset-depreciation') setAssetTab('depreciation');
    else if (activeView === 'asset') setAssetTab('register');

    // Document
    if (activeView === 'doc-esign') setDocTab('esign');
    else if (activeView === 'doc-ocr') setDocTab('ocr');
    else if (activeView === 'document') setDocTab('locker');

    // Help Desk
    if (activeView === 'hd-sla') setHdTab('sla');
    else if (activeView === 'hd-kb') setHdTab('kb');
    else if (activeView === 'helpdesk') setHdTab('queue');

    // Visitor
    if (activeView === 'vis-log') setVisTab('log');
    else if (activeView === 'vis-badges') setVisTab('badges');
    else if (activeView === 'visitor') setVisTab('checkin');

    // LMS
    if (activeView === 'lms-quizzes') setLmsTab('quiz');
    else if (activeView === 'lms-progress') setLmsTab('progress');
    else if (activeView === 'lms') setLmsTab('courses');

    // Compliance
    if (activeView === 'comp-policies') setCompTab('policies');
    else if (activeView === 'comp-incidents') setCompTab('incidents');
    else if (activeView === 'compliance') setCompTab('checklists');

    // Communication
    if (activeView === 'comm-chat') setCommTab('chat');
    else if (activeView === 'comm-email') setCommTab('email');
    else if (activeView === 'communication') setCommTab('feed');

    // Reports
    if (activeView === 'rep-custom') setRptTab('custom');
    else if (activeView === 'rep-export') setRptTab('export');
    else if (activeView === 'reports') setRptTab('overview');
  }, [activeView]);

  // ══════════════════════════════════════════════════════════════════════════
  // 0. PLATFORM MANAGEMENT (Super Admin Only)
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('platform')) {
    const companies = [
      { id: 'C-001', name: 'TechCorp Industries', domain: 'techcorp.com', plan: 'Enterprise', status: 'Active', users: 45, modules: 8, mrr: 2400 },
      { id: 'C-002', name: 'Global Manufacturing LLC', domain: 'globalmfg.com', plan: 'Premium', status: 'Active', users: 120, modules: 6, mrr: 900 },
      { id: 'C-003', name: 'StartUp Innovations', domain: 'startup.io', plan: 'Core', status: 'Active', users: 15, modules: 4, mrr: 350 },
      { id: 'C-004', name: 'Apex Solutions', domain: 'apex.net', plan: 'Trial', status: 'Trial', users: 8, modules: 3, mrr: 0 },
      { id: 'C-005', name: 'Quantum Dynamics', domain: 'quantum.tech', plan: 'Enterprise', status: 'Past Due', users: 67, modules: 9, mrr: 2400 },
    ];

    return (
      <div>
        <PageHeader title="Platform Management" subtitle="Manage tenant companies, billing, subscriptions, and platform-wide settings." />

        {platformTab === 'tenants' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Total Tenants" value={companies.length} icon="bi bi-buildings" sub="Active companies on platform" />
              <StatCard label="Monthly Revenue" value={`$${companies.reduce((sum, c) => sum + c.mrr, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Platform MRR" accent />
              <StatCard label="Total Users" value={companies.reduce((sum, c) => sum + c.users, 0)} icon="bi bi-people" sub="All platform users" />
              <StatCard label="Avg Modules" value={(companies.reduce((sum, c) => sum + c.modules, 0) / companies.length).toFixed(1)} icon="bi bi-box-seam" sub="Per tenant" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">Tenant Companies</h3>
                <PrimaryBtn icon="bi bi-plus-lg">Add Company</PrimaryBtn>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Company' }, { label: 'Domain' }, { label: 'Plan' }, { label: 'Users' }, { label: 'Modules' }, { label: 'MRR' }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 table-cell-semibold text-slate-900">{company.name}</td>
                      <td className="px-4 py-3 table-cell text-slate-500">{company.domain}</td>
                      <td className="px-4 py-3"><Badge label={company.plan} variant={company.plan === 'Enterprise' ? 'info' : company.plan === 'Premium' ? 'success' : company.plan === 'Trial' ? 'warning' : 'default'} /></td>
                      <td className="px-4 py-3 table-cell-mono text-slate-700">{company.users}</td>
                      <td className="px-4 py-3 table-cell-mono text-slate-700">{company.modules}</td>
                      <td className="px-4 py-3 table-cell-mono text-slate-700">${company.mrr.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={company.status} variant={company.status === 'Active' ? 'success' : company.status === 'Past Due' ? 'danger' : 'warning'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {platformTab === 'billing' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Annual Revenue" value={`$${(companies.reduce((sum, c) => sum + c.mrr, 0) * 12).toLocaleString()}`} icon="bi bi-graph-up-arrow" sub="Platform ARR" accent />
              <StatCard label="Payment Success" value="98.5%" icon="bi bi-check-circle" sub="Last 30 days" />
              <StatCard label="Churn Rate" value="2.1%" icon="bi bi-graph-down" sub="Monthly churn" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-4">Billing Overview</h3>
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="table-cell-semibold text-slate-900">{company.name}</div>
                      <div className="data-value-small text-slate-500">{company.plan} · {company.users} users</div>
                    </div>
                    <div className="text-right">
                      <div className="table-cell-mono font-bold text-slate-900">${company.mrr.toLocaleString()}/mo</div>
                      <Badge label={company.status} variant={company.status === 'Active' ? 'success' : 'danger'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {platformTab === 'subscriptions' && (() => {
          type SuiteModule = {
            name: string;
            icon: string;
            tag: string;
            tenants: number;
            price: string;
            features: string[];
            deps?: string;
          };
          type Suite = {
            suiteName: string;
            suiteTag: string;
            suiteDesc: string;
            accent: string;
            headerGrad: string;
            iconBg: string;
            badgeCls: string;
            modules: SuiteModule[];
          };

          const suites: Suite[] = [
            {
              suiteName: 'People Suite',
              suiteTag: 'Workforce & Talent',
              suiteDesc: 'Everything you need to hire, manage, pay, and grow your people — from first application to final payslip.',
              accent: 'border-violet-200',
              headerGrad: 'from-violet-600 to-violet-800',
              iconBg: 'bg-violet-600',
              badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
              modules: [
                {
                  name: 'HR & Directory',
                  icon: 'bi bi-people-fill',
                  tag: 'Core',
                  tenants: 18,
                  price: '$35/mo',
                  features: [
                    'Employee Records & Digital Files',
                    'Leave & Time-Off Approvals',
                    'Biometric Attendance Logs',
                    'Performance Reviews & OKRs',
                    'Interactive Organisation Charts',
                    'Onboarding Packs & Checklists',
                    'ATS & Applicant Tracking',
                    'Exit Management & Clearance',
                    'Department & Branch Structures',
                  ],
                },
                {
                  name: 'Payroll',
                  icon: 'bi bi-cash-stack',
                  tag: 'Add-on',
                  tenants: 15,
                  price: '$25/mo',
                  features: [
                    'Automated Batch Payroll Runs',
                    'Detailed Payslip Generators',
                    'PAYE Tax Brackets & Deductions',
                    'SSNIT & Statutory Contributions',
                    'Overtime & Allowances Engine',
                    'Direct Deposit & Bank Export',
                    'Salary Grade Configurations',
                    'Multi-currency Pay Support',
                  ],
                  deps: 'Requires HR & Directory',
                },
              ],
            },
            {
              suiteName: 'Finance Suite',
              suiteTag: 'Accounting & Revenue',
              suiteDesc: 'Full double-entry accounting, invoicing, tax compliance, and financial reporting built for Ghanaian SMEs and enterprises.',
              accent: 'border-emerald-200',
              headerGrad: 'from-emerald-600 to-teal-700',
              iconBg: 'bg-emerald-600',
              badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              modules: [
                {
                  name: 'Accounting',
                  icon: 'bi bi-book-half',
                  tag: 'Core',
                  tenants: 14,
                  price: '$40/mo',
                  features: [
                    'General Ledger (Double-Entry)',
                    'Journal Entry Posting & Reversals',
                    'Trial Balance & Balance Sheet',
                    'Income Statement Reports',
                    'Invoice & Accounts Receivable',
                    'Expense Tracking & AP Ledger',
                    'GRA VAT & Withholding Tax',
                    'Bank Reconciliation Feeds',
                    'Multi-currency Support (GHS, USD)',
                    'Profit & Loss Statements',
                  ],
                },
                {
                  name: 'Sales & Orders',
                  icon: 'bi bi-tag-fill',
                  tag: 'Add-on',
                  tenants: 16,
                  price: '$20/mo',
                  features: [
                    'Sales Orders & Fulfillment',
                    'Customer Profiles & History',
                    'Sales Quotation Builder',
                    'Quota & Target Trackers',
                    'Custom Discount & Pricing Rules',
                    'Product Pricing Matrix',
                    'Sales Commission Tracking',
                  ],
                  deps: 'Integrates with Accounting',
                },
              ],
            },
            {
              suiteName: 'Commerce Suite',
              suiteTag: 'Retail, CRM & Operations',
              suiteDesc: 'Sell anywhere, manage customers, run your store floor, and keep your warehouse and supply chain in sync — all in one place.',
              accent: 'border-amber-200',
              headerGrad: 'from-amber-500 to-orange-600',
              iconBg: 'bg-amber-500',
              badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
              modules: [
                {
                  name: 'Point of Sale (POS)',
                  icon: 'bi bi-cash-coin',
                  tag: 'Core',
                  tenants: 9,
                  price: '$30/mo',
                  features: [
                    'Touch POS Terminal & Register',
                    'Real-time Product Catalog',
                    'Barcode & QR Code Scanning',
                    'Shift Open / Close Management',
                    'Cash Drawer & Float Audit',
                    'POS Returns & Exchanges',
                    'Customer Loyalty Points',
                    'Receipt & Invoice Printing',
                    'Offline Mode Support',
                    'Till Reconciliation Reports',
                  ],
                },
                {
                  name: 'CRM & Leads',
                  icon: 'bi bi-funnel-fill',
                  tag: 'Add-on',
                  tenants: 12,
                  price: '$25/mo',
                  features: [
                    'Visual Deal Pipeline (Kanban)',
                    'Customer Contact Cards',
                    'Activity & Task Scheduler',
                    'Win / Loss CRM Analytics',
                    'AI Lead Scoring (Gemini)',
                    'Follow-up Reminders & Alerts',
                    'Email & Call Logging',
                  ],
                },
                {
                  name: 'Operations & Projects',
                  icon: 'bi bi-gear-wide-connected',
                  tag: 'Add-on',
                  tenants: 10,
                  price: '$30/mo',
                  features: [
                    'Kanban Task Boards',
                    'Project Milestone Trackers',
                    'Multi-Warehouse Stock Logs',
                    'Manufacturing Work Orders',
                    'Vendor RFQs & Purchase Orders',
                    'BOM & Assembly Management',
                    'Quality Checklists & Audits',
                    'Asset Register & Depreciation',
                  ],
                },
              ],
            },
            {
              suiteName: 'Intelligence Suite',
              suiteTag: 'AI, Support & Compliance',
              suiteDesc: 'Power your business with AI-driven insights, automated workflows, customer support, and built-in compliance management.',
              accent: 'border-blue-200',
              headerGrad: 'from-blue-600 to-indigo-700',
              iconBg: 'bg-blue-600',
              badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
              modules: [
                {
                  name: 'Intelligence & AI',
                  icon: 'bi bi-cpu-fill',
                  tag: 'Core',
                  tenants: 13,
                  price: '$45/mo',
                  features: [
                    'Gemini AI Co-pilot Chatbot',
                    'AI Smart Trend Insights',
                    'Platform Analytics Dashboard',
                    'Trigger-based Workflow Builder',
                    'Real-time System Telemetry',
                    'Audit Trail & Event Streaming',
                    'Predictive Revenue Forecasting',
                    'Anomaly Detection Alerts',
                  ],
                },
                {
                  name: 'Help Desk & Engagement',
                  icon: 'bi bi-heart-pulse-fill',
                  tag: 'Add-on',
                  tenants: 11,
                  price: '$20/mo',
                  features: [
                    'Support Ticket Queues',
                    'SLA Monitoring & Breach Alerts',
                    'Internal Knowledge Base',
                    'Visitor Check-In Logger',
                    'LMS Course & Training Packs',
                    'Compliance Risk Checklists',
                    'Incident & Risk Logs',
                    'Company Announcements Feed',
                  ],
                },
              ],
            },
          ];

          const allModules = suites.flatMap(s => s.modules);
          const totalActiveSubs = allModules.reduce((sum, m) => sum + m.tenants, 0);
          const popularModule = [...allModules].sort((a, b) => b.tenants - a.tenants)[0].name;
          const totalModules = allModules.length;

          return (
            <div className="space-y-8">
              {/* Suite KPI Bar */}
              <div className="grid gap-4 sm:grid-cols-4">
                <StatCard label="Suite Modules" value={totalModules} icon="bi bi-grid-3x3-gap-fill" sub="Across 4 product suites" />
                <StatCard label="Active Subscriptions" value={totalActiveSubs} icon="bi bi-box-seam" sub="Total active tenant modules" />
                <StatCard label="Avg Revenue/Tenant" value="$180/mo" icon="bi bi-cash-stack" sub="Blended module revenue" accent />
                <StatCard label="Top Module" value={popularModule} icon="bi bi-trophy-fill" sub="Most deployed" />
              </div>

              {/* Plan Builder */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Configured Plans</h2>
                  <p className="text-sm text-slate-500">Build a plan by selecting modules — the price is the sum of module list prices. Assign it to a tenant.</p>
                </div>
                <PrimaryBtn icon="bi bi-plus-lg" onClick={openPlanModal}>Add Plan</PrimaryBtn>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tenant Plans</h3>
                  <span className="text-[10px] text-slate-400 font-sans">{tenants.length} tenants</span>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Tenant' }, { label: 'Plan' }, { label: 'Modules' }, { label: 'Monthly' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {tenants.map(t => {
                      const price = planPriceForModules(t.activeModules);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-3 text-xs font-semibold text-slate-900">{t.name}</td>
                          <td className="px-5 py-3">
                            <Badge
                              label={t.billingPlan}
                              variant={t.billingPlan === 'Enterprise' ? 'info' : t.billingPlan === 'Premium' ? 'success' : t.billingPlan === 'Trial' ? 'warning' : 'default'}
                            />
                          </td>
                          <td className="px-5 py-3 text-xs font-sans tabular-nums text-slate-700">{t.activeModules.length}</td>
                          <td className="px-5 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900">${price.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Suite Banner */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}
                className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20">
                      <i className="bi bi-stars"></i> Enterprise Suite
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-1">One Platform. Four Suites. Infinite Possibilities.</h2>
                  <p className="text-sm text-slate-400">Mix and match modules across People, Finance, Commerce and Intelligence to build the exact ERP your business needs.</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                    <div className="text-lg font-bold text-white tabular-nums">4</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Suites</div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                    <div className="text-lg font-bold text-white tabular-nums">{totalModules}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Modules</div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                    <div className="text-lg font-bold text-white tabular-nums">{companies.length}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tenants</div>
                  </div>
                </div>
              </div>

              {/* Suite Groups */}
              {suites.map((suite) => (
                <div key={suite.suiteName} className={`border rounded-2xl overflow-hidden shadow-xs ${suite.accent}`}>
                  {/* Suite Header */}
                  <div className={`bg-gradient-to-r ${suite.headerGrad} px-6 py-5`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold uppercase tracking-widest border border-white/30 mb-2">
                          {suite.suiteTag}
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-tight">{suite.suiteName}</h3>
                        <p className="text-sm text-white/70 mt-1 max-w-xl">{suite.suiteDesc}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-2xl font-bold text-white tabular-nums">{suite.modules.length}</div>
                        <div className="text-[10px] text-white/60 uppercase tracking-wider">Module{suite.modules.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Module Cards */}
                  <div className="bg-white p-5">
                    <div className={`grid gap-5 ${suite.modules.length === 1 ? 'grid-cols-1 max-w-sm' :
                      suite.modules.length === 2 ? 'sm:grid-cols-2' :
                        'sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                      {suite.modules.map((mod) => (
                        <div key={mod.name}
                          className="rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col"
                        >
                          {/* Module Top */}
                          <div className="p-4 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl ${suite.iconBg} text-white flex items-center justify-center text-base flex-shrink-0`}>
                              <i className={mod.icon}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm leading-tight">{mod.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${suite.badgeCls}`}>
                                  {mod.tag}
                                </span>
                                <span className="text-[10px] text-slate-400 tabular-nums">{mod.tenants} tenants</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold text-slate-900 tabular-nums">{mod.price}</div>
                              <div className="text-[9px] text-slate-400">per company</div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="mx-4 border-t border-slate-100"></div>

                          {/* Features */}
                          <div className="p-4 flex-1">
                            <div className="grid grid-cols-1 gap-1.5">
                              {mod.features.map((f) => (
                                <div key={f} className="flex items-start gap-2">
                                  <i className={`bi bi-check-lg mt-0.5 flex-shrink-0 text-xs font-bold`}
                                    style={{ color: suite.iconBg.replace('bg-', '').includes('violet') ? '#7c3aed' : suite.iconBg.includes('emerald') ? '#059669' : suite.iconBg.includes('amber') ? '#d97706' : '#2563eb' }}>
                                  </i>
                                  <span className="text-xs text-slate-600 leading-snug">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 pb-4">
                            {mod.deps && (
                              <div className="flex items-center gap-1.5 mt-2 p-2 bg-slate-100 rounded-lg">
                                <i className="bi bi-link-45deg text-slate-400 text-xs"></i>
                                <span className="text-[10px] text-slate-500">{mod.deps}</span>
                              </div>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex-1 mr-3">
                                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.round((mod.tenants / companies.length) * 100)}%`,
                                      background: suite.iconBg.includes('violet') ? '#7c3aed' : suite.iconBg.includes('emerald') ? '#059669' : suite.iconBg.includes('amber') ? '#d97706' : '#2563eb'
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 tabular-nums">{Math.round((mod.tenants / companies.length) * 100)}% deployed</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bottom Note */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 flex items-start gap-3">
                <i className="bi bi-info-circle text-slate-400 mt-0.5"></i>
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-0.5">Flexible Modular Pricing</div>
                  <p className="text-xs text-slate-500">Each suite module is independently licensable. Tenants can subscribe to individual modules or bundle full suites for a discounted rate. All modules share a unified data layer — no double entry, no silos.</p>
                </div>
              </div>

              {planModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                  <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[85vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <i className="bi bi-box-seam text-slate-800 text-xs"></i> Add Subscription Plan
                      </h2>
                      <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="px-6 py-4 space-y-4 overflow-y-auto">
                      <div>
                        <Label>Tenant</Label>
                        <Select value={planTenantId} onChange={e => setPlanTenantId(e.target.value)}>
                          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Modules</Label>
                          <span className="text-[10px] text-slate-400">{planModuleIds.length} selected</span>
                        </div>
                        <div className="space-y-3">
                          {([...new Set(MODULE_CATALOG.map(m => m.suite))] as string[]).map(suite => (
                            <div key={suite}>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{suite}</div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {MODULE_CATALOG.filter(m => m.suite === suite).map(m => {
                                  const checked = planModuleIds.includes(m.id);
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => togglePlanModule(m.id)}
                                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all cursor-pointer ${checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}`}
                                    >
                                      <span className="text-xs font-medium">{m.name}</span>
                                      <span className={`text-[11px] font-sans tabular-nums ${checked ? 'text-slate-300' : 'text-slate-400'}`}>${m.price}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Billing Plan</Label>
                        <Select value={planBilling} onChange={e => setPlanBilling(e.target.value as Company['billingPlan'])}>
                          {(['Trial', 'Core', 'Premium', 'Enterprise'] as Company['billingPlan'][]).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Monthly Total</div>
                        <div className="text-xl font-bold text-slate-900 font-sans tabular-nums">${planTotal.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <SecBtn onClick={() => setPlanModalOpen(false)}>Cancel</SecBtn>
                        <PrimaryBtn icon="bi bi-check-lg" onClick={submitPlan}>Assign Plan</PrimaryBtn>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {platformTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Platform Uptime" value="99.99%" icon="bi bi-activity" sub="Last 30 days" />
              <StatCard label="API Requests" value="2.4M" icon="bi bi-cpu" sub="Daily average" />
              <StatCard label="Storage Used" value="1.2 TB" icon="bi bi-hdd" sub="Platform total" />
              <StatCard label="Response Time" value="45ms" icon="bi bi-speedometer" sub="Average latency" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-4">Platform Health</h3>
              <div className="space-y-4">
                {[
                  { service: 'API Gateway', status: 'Operational', uptime: '99.99%' },
                  { service: 'Database Cluster', status: 'Operational', uptime: '99.95%' },
                  { service: 'CDN Network', status: 'Degraded', uptime: '99.8%' },
                  { service: 'Email Service', status: 'Operational', uptime: '99.9%' },
                ].map((service) => (
                  <div key={service.service} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="data-value text-slate-700">{service.service}</span>
                    <div className="text-right">
                      <span className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${service.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {service.status}
                      </span>
                      <span className="data-value-small font-sans tabular-nums text-slate-400">{service.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {platformTab === 'users' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Platform Users" value={3} icon="bi bi-people" sub="Super Admin accounts" />
              <StatCard label="Total Tenant Users" value={companies.reduce((sum, c) => sum + c.users, 0)} icon="bi bi-users" sub="All tenant users" />
              <StatCard label="Active Sessions" value={127} icon="bi bi-activity" sub="Currently logged in" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-4">Platform Administrators</h3>
              <div className="space-y-3">
                {[
                  { name: 'Platform Owner', email: 'admin@erp-platform.com', role: 'Super Admin', status: 'Active' },
                  { name: 'DevOps Lead', email: 'devops@erp-platform.com', role: 'Super Admin', status: 'Active' },
                  { name: 'Support Manager', email: 'support@erp-platform.com', role: 'Super Admin', status: 'Active' },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="table-cell-semibold text-slate-900">{user.name}</div>
                      <div className="data-value-small text-slate-500">{user.email}</div>
                    </div>
                    <Badge label={user.role} variant="info" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {platformTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-4">Platform Configuration</h3>
              <div className="space-y-4">
                {[
                  { setting: 'Default Currency', value: 'USD' },
                  { setting: 'Supported Languages', value: 'English, Spanish, French' },
                  { setting: 'API Rate Limit', value: '1000 req/min' },
                  { setting: 'Data Retention', value: '7 years' },
                  { setting: 'Backup Frequency', value: 'Daily' },
                  { setting: 'Maintenance Window', value: '02:00-04:00 UTC' },
                ].map((item) => (
                  <div key={item.setting} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="data-value text-slate-700">{item.setting}</span>
                    <span className="table-cell-mono text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'dashboard') {
    const activeEmployees = localEmployees.filter(e => e.status === 'Active');
    const onLeave = localEmployees.filter(e => e.status === 'On Leave');
    const openInvoices = localInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
    const openTickets = localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');

    const departments = [...new Set(localEmployees.map(e => e.department))];
    const branches = [...new Set(localEmployees.map(e => e.branch))];

    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Company overview and key metrics." />

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Employees" value={localEmployees.length} sub={`${activeEmployees.length} active · ${onLeave.length} on leave`} icon="bi bi-people" />
          <StatCard label="Departments" value={departments.length} sub={`${branches.length} branch locations`} icon="bi bi-diagram-3" />
          <StatCard label="Open Invoices" value={openInvoices.length} sub={`$${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-file-earmark-text" accent />
          <StatCard label="Support Tickets" value={openTickets.length} sub={`${localTickets.filter(t => t.priority === 'Critical').length} critical priority`} icon="bi bi-ticket" />
        </div>

        {/* Company Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Company Overview</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl">{selectedCompany.logo}</div>
              <div>
                <div className="text-xl font-bold text-slate-900">{selectedCompany.name}</div>
                <div className="text-sm text-slate-500 font-sans tabular-nums">{selectedCompany.domain}</div>
                <div className="text-sm text-slate-400 mt-0.5">{selectedCompany.industry}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400">Billing Plan</div>
                <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.billingPlan}</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400">Active Modules</div>
                <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.activeModules.length} / 21</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400">Status</div>
                <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.billingStatus}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Workforce Distribution</h3>
            <div className="flex items-center justify-center gap-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {departments.slice(0, 5).map((dept, index) => {
                    const deptEmployees = localEmployees.filter(e => e.department === dept);
                    const totalEmployees = localEmployees.length;
                    const percentage = (deptEmployees.length / totalEmployees) * 100;
                    const colors = ['#0f172a', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
                    const offset = index === 0 ? 0 : departments.slice(0, index).reduce<number>((sum, d) => {
                      const employees = localEmployees.filter(e => e.department === d);
                      return sum + (employees.length / totalEmployees) * 100;
                    }, 0);
                    return (
                      <circle
                        key={dept}
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="transparent"
                        stroke={colors[index]}
                        strokeWidth="3"
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={25 - offset}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="space-y-2">
                {departments.slice(0, 5).map((dept, index) => {
                  const deptEmployees = localEmployees.filter(e => e.department === dept);
                  const colors = ['#0f172a', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
                  return (
                    <div key={dept} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index] }}></span>
                      <span className="text-sm text-slate-800 font-medium">{dept}</span>
                      <span className="text-sm text-slate-500">({deptEmployees.length})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. ADMINISTRATION
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('admin')) {
    const depts = ['Engineering', 'Operations', 'Finance', 'HR', 'Sales', 'IT', 'Legal'];
    return (
      <div>
        <PageHeader title="Administration" subtitle="Company configuration, branch management, users, roles and system settings." />

        {adminTab === 'branches' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">Branch Locations</h3>
              {isAdmin && <PrimaryBtn icon="bi bi-plus-lg">Add Branch</PrimaryBtn>}
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Branch Name' }, { label: 'Location' }, { label: 'Type' }, { label: 'Employees' }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'New York Headquarters', location: 'New York, USA', type: 'Main HQ', emp: localEmployees.filter(e => e.branch.includes('New York') || e.branch.includes('HQ')).length, status: 'Active' },
                  { name: 'Chicago Production Plant', location: 'Chicago, USA', type: 'Plant', emp: localEmployees.filter(e => e.branch.includes('Chicago')).length, status: 'Active' },
                  { name: 'London Regional Office', location: 'London, UK', type: 'Regional', emp: 0, status: 'Opening Soon' },
                ].map(b => (
                  <tr key={b.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3.5"><div className="data-value font-semibold text-slate-900">{b.name}</div></td>
                    <td className="px-4 py-3.5 data-value text-slate-500">{b.location}</td>
                    <td className="px-4 py-3.5"><Badge label={b.type} /></td>
                    <td className="px-4 py-3.5 data-value font-sans tabular-nums text-slate-700">{b.emp}</td>
                    <td className="px-4 py-3.5"><Badge label={b.status} variant={b.status === 'Active' ? 'success' : 'warning'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {adminTab === 'departments' && (() => {
          const companyDepts = departments.filter(d => d.companyId === selectedCompany.id);
          const getDeptName = (id?: string) => companyDepts.find(d => d.id === id)?.name;

          // Build tree for organogram
          const roots = companyDepts.filter(d => !d.parentId);
          const getChildren = (parentId: string) => companyDepts.filter(d => d.parentId === parentId);

          const renderOrgNode = (dept: typeof companyDepts[0], depth: number): React.ReactNode => {
            const children = getChildren(dept.id);
            const manager = localEmployees.find(e => e.userId === dept.managerId);
            return (
              <div key={dept.id} className="flex flex-col items-center">
                {/* Node card */}
                <div className={`px-4 py-3 rounded-xl border text-center min-w-[140px] max-w-[180px] transition-all hover:shadow-md ${depth === 0
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : depth === 1
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                  <div className={`text-xs font-bold ${depth === 0 ? 'text-white' : 'text-slate-900'}`}>{dept.name}</div>
                  <div className={`text-[9px] mt-0.5 ${depth === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                    {manager ? `${manager.firstName} ${manager.lastName}` : 'No manager'}
                  </div>
                  <div className={`text-[9px] font-mono mt-0.5 ${depth === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                    {dept.employeeCount} staff
                  </div>
                </div>
                {/* Children */}
                {children.length > 0 && (
                  <>
                    <div className="w-px h-5 bg-slate-300"></div>
                    <div className="flex items-start gap-0 relative">
                      {children.length > 1 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-300" style={{
                          width: `${Math.max(0, (children.length - 1) * 180)}px`
                        }}></div>
                      )}
                      <div className="flex gap-6">
                        {children.map(child => (
                          <div key={child.id} className="flex flex-col items-center">
                            <div className="w-px h-5 bg-slate-300"></div>
                            {renderOrgNode(child, depth + 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          };

          return (
            <div className="space-y-6">
              {/* Department Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Department Structure</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure reporting hierarchy and department assignments.</p>
                  </div>
                  {isAdmin && <PrimaryBtn icon="bi bi-plus-lg">Add Department</PrimaryBtn>}
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Department' }, { label: 'Reports To' }, { label: 'Head Count' }, { label: 'Budget' }, { label: 'Manager' }, { label: '' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {companyDepts.map(dept => {
                      const manager = localEmployees.find(e => e.userId === dept.managerId);
                      const parentName = getDeptName(dept.parentId);
                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full shrink-0 ${!dept.parentId ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                              <span className="text-xs font-semibold text-slate-900">{dept.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {isAdmin ? (
                              <select
                                value={dept.parentId || ''}
                                onChange={() => { }}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[130px]"
                              >
                                <option value="">— Root (Top Level)</option>
                                {companyDepts.filter(d => d.id !== dept.id).map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-slate-500">{parentName || '— Root'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-sans tabular-nums text-slate-700">{dept.employeeCount} staff</td>
                          <td className="px-4 py-3.5 text-xs font-sans tabular-nums text-slate-700">${dept.budget.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {manager ? `${manager.firstName} ${manager.lastName}` : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {isAdmin && <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">Edit</button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual Organogram */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-diagram-3 text-slate-500 text-sm"></i>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Department Organogram</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Visual reporting hierarchy showing which department reports to which.</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 overflow-x-auto">
                  <div className="flex justify-center gap-12">
                    {roots.map(root => renderOrgNode(root, 0))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {adminTab === 'users' && (
          <div className="space-y-4">
            {showInviteForm && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-slate-900">Invite New User</h3>
                  <button onClick={() => setShowInviteForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                {inviteSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
                    User invited successfully!
                  </div>
                )}
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!inviteName || !inviteEmail) return;
                  onInviteUser({
                    name: inviteName,
                    email: inviteEmail,
                    role: inviteRole,
                    roles: inviteRoles,
                    department: inviteDept,
                    branch: inviteBranch
                  });
                  setInviteSuccess(true);
                  setTimeout(() => {
                    setInviteSuccess(false);
                    setShowInviteForm(false);
                    setInviteName('');
                    setInviteEmail('');
                    setInviteRole('Employee');
                    setInviteRoles(['Employee']);
                  }, 2000);
                }} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Full Name *</Label><Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="John Doe" required /></div>
                    <div><Label>Email Address *</Label><Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="john@company.com" required /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Primary Role *</Label>
                      <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)} required>
                        <option value="Employee">Employee</option>
                        {selectedCompany.activeModules.includes('Administration') && <option value="CEO">CEO</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="HR Manager">HR Manager</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="HR Officer">HR Officer</option>}
                        {selectedCompany.activeModules.includes('Accounting') && <option value="Accountant">Accountant</option>}
                        {selectedCompany.activeModules.includes('Accounting') && <option value="Finance Manager">Finance Manager</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Manager">Sales Manager</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Rep">Sales Rep</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Executive">Sales Executive</option>}
                        {selectedCompany.activeModules.includes('Operations') && <option value="Inventory Manager">Inventory Manager</option>}
                        {selectedCompany.activeModules.includes('Operations') && <option value="Store Keeper">Store Keeper</option>}
                        {selectedCompany.activeModules.includes('Help Desk') && <option value="Support Agent">Support Agent</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="Department Head">Department Head</option>}
                      </Select>
                    </div>
                    <div>
                      <Label>Department *</Label>
                      <Select value={inviteDept} onChange={e => setInviteDept(e.target.value)} required>
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="IT">IT</option>
                        <option value="Legal">Legal</option>
                        <option value="Marketing">Marketing</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Additional Roles (multi-select)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {['Employee', 'Department Head', 'CEO', 'HR Manager', 'HR Officer', 'Accountant', 'Finance Manager', 'Sales Manager', 'Sales Rep', 'Sales Executive', 'Inventory Manager', 'Store Keeper', 'Support Agent']
                        .filter(role => {
                          if (role === 'Employee' || role === 'Department Head') return selectedCompany.activeModules.includes('HR');
                          if (role === 'CEO') return selectedCompany.activeModules.includes('Administration');
                          if (['HR Manager', 'HR Officer'].includes(role)) return selectedCompany.activeModules.includes('HR');
                          if (['Accountant', 'Finance Manager'].includes(role)) return selectedCompany.activeModules.includes('Accounting');
                          if (['Sales Manager', 'Sales Rep', 'Sales Executive'].includes(role)) return selectedCompany.activeModules.includes('CRM');
                          if (['Inventory Manager', 'Store Keeper'].includes(role)) return selectedCompany.activeModules.includes('Operations');
                          if (role === 'Support Agent') return selectedCompany.activeModules.includes('Help Desk');
                          return true;
                        })
                        .map(role => (
                          <label key={role} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inviteRoles.includes(role)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setInviteRoles([...inviteRoles, role]);
                                } else {
                                  setInviteRoles(inviteRoles.filter(r => r !== role));
                                }
                              }}
                              className="rounded border-slate-300"
                            />
                            {role}
                          </label>
                        ))}
                    </div>
                  </div>
                  <div>
                    <Label>Branch *</Label>
                    <Select value={inviteBranch} onChange={e => setInviteBranch(e.target.value)} required>
                      <option value="HQ">HQ</option>
                      <option value="Chicago Factory">Chicago Factory</option>
                      <option value="Regional West">Regional West</option>
                      <option value="Regional East">Regional East</option>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <PrimaryBtn icon="bi bi-send">Send Invitation</PrimaryBtn>
                    <SecBtn onClick={() => setShowInviteForm(false)}>Cancel</SecBtn>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">System Users</h3>
                {isAdmin && <PrimaryBtn icon="bi bi-person-plus" onClick={() => setShowInviteForm(true)}>Invite User</PrimaryBtn>}
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'User' }, { label: 'Active Role' }, { label: 'All Roles' }, { label: 'Department' }, { label: 'Status' }, { label: 'Joined' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 8).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center avatar-text text-slate-700">{emp.firstName[0]}{emp.lastName[0]}</div>
                          <div><div className="table-cell-semibold text-slate-900">{emp.firstName} {emp.lastName}</div><div className="data-value-small text-slate-400">{emp.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{emp.designation}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{emp.designation}</td>
                      <td className="px-4 py-3.5 table-cell text-slate-600">{emp.department}</td>
                      <td className="px-4 py-3.5"><Badge label={emp.status} variant={emp.status === 'Active' ? 'success' : 'warning'} /></td>
                      <td className="px-4 py-3.5 table-cell-mono text-slate-400">{emp.joiningDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'roles' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Role Management & Permissions</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage job definitions, modify raw permissions, and create custom security roles.</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenRoleModal(null)}
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
                >
                  <i className="bi bi-plus-lg text-xs"></i> Add Role
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {customRoles.map(r => (
                <div key={r.id} className="p-5 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <i className="bi bi-shield-lock text-slate-500 text-sm"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{r.permissions}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.rawPermissions.map(p => (
                          <span key={p} className="bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-mono">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-[11px] text-slate-400 font-sans tabular-nums">{r.users} users</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenRoleModal(r)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Edit Role
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'approvals' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white"><i className="bi bi-diagram-3 text-sm"></i></div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Approval Workflow Configuration</div>
                  <div className="text-[11px] text-slate-500">Define who approves requests for each module. Select multiple roles as needed.</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setApprovalSaveSuccess(true);
                  setTimeout(() => setApprovalSaveSuccess(false), 3000);
                }}
                className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
              >
                <i className="bi bi-check2 text-xs"></i> Save Policies
              </button>
            </div>
            {approvalSaveSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <i className="bi bi-check-circle-fill"></i> Approval policies saved successfully.
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {Object.entries(approvalPolicies).map(([module, approvers]) => {
                const icons: Record<string, string> = {
                  'Leave Requests': 'bi bi-calendar-check',
                  'Payroll Processing': 'bi bi-cash-stack',
                  'Expense Claims': 'bi bi-receipt',
                  'Procurement / PO': 'bi bi-cart3',
                  'Recruitment Offers': 'bi bi-person-plus',
                  'Asset Requests': 'bi bi-box-seam',
                };
                const descriptions: Record<string, string> = {
                  'Leave Requests': 'Annual, sick, casual, and maternity leave applications',
                  'Payroll Processing': 'Monthly salary processing and payslip generation',
                  'Expense Claims': 'Employee reimbursements and cost reports',
                  'Procurement / PO': 'Purchase orders and vendor requisitions',
                  'Recruitment Offers': 'Job offers, hiring decisions and onboarding',
                  'Asset Requests': 'Equipment requisitions and asset assignments',
                };
                const availableRoles = [
                  'Department Head',
                  'HR Manager',
                  'HR Officer',
                  'Finance Manager',
                  'Company Admin'
                ];

                const toggleRole = (roleName: string) => {
                  setApprovalPolicies(prev => {
                    const currentList = prev[module] || [];
                    const updated = currentList.includes(roleName)
                      ? currentList.filter(r => r !== roleName)
                      : [...currentList, roleName];
                    return { ...prev, [module]: updated };
                  });
                };

                return (
                  <div key={module} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3 min-w-0 max-w-md">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <i className={`${icons[module] || 'bi bi-gear'} text-slate-500 text-sm`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{module}</div>
                        <div className="text-[11px] text-slate-400 leading-normal mt-0.5">{descriptions[module]}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                      {availableRoles.map(roleOption => {
                        const isSelected = (approvers as string[]).includes(roleOption);
                        return (
                          <button
                            key={roleOption}
                            type="button"
                            onClick={() => toggleRole(roleOption)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border cursor-pointer select-none ${isSelected
                              ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                          >
                            {isSelected && <i className="bi bi-check text-xs"></i>}
                            {roleOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <i className="bi bi-info-circle"></i>
                Authorized roles will be able to review, approve, or reject requests. Company Admin always has override rights.
              </div>
            </div>
          </div>
        )}

        {adminTab === 'settings' && (
          <div className="space-y-6">
            {/* ── System Settings ──────────────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">System Settings</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  { title: 'Email Notifications', desc: 'Configure automated email triggers for key ERP events.', icon: 'bi bi-envelope', active: true },
                  { title: 'Two-Factor Authentication', desc: 'Require 2FA for all Company Admin and Manager logins.', icon: 'bi bi-phone', active: false },
                  { title: 'Single Sign-On (SSO)', desc: 'Connect with Google Workspace, Azure AD or Okta.', icon: 'bi bi-key', active: false },
                  { title: 'API Rate Limiting', desc: 'Throttle external API calls to protect platform performance.', icon: 'bi bi-speedometer', active: true },
                  { title: 'Data Backup Schedule', desc: 'Automated nightly backups to encrypted cloud storage.', icon: 'bi bi-cloud-arrow-up', active: true },
                  { title: 'Audit Log Retention', desc: 'Keep audit logs for 12 months (compliance standard).', icon: 'bi bi-journal-text', active: true },
                ].map(s => (
                  <div key={s.title} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><i className={`${s.icon} text-slate-500 text-sm`}></i></div>
                      <div><div className="table-cell-semibold text-slate-900">{s.title}</div><div className="data-value text-slate-500 mt-0.5 leading-snug">{s.desc}</div></div>
                    </div>
                    <div className={`relative h-5 w-9 rounded-full cursor-pointer transition-colors shrink-0 ml-3 mt-0.5 ${s.active ? 'bg-slate-900' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${s.active ? 'left-4' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Add/Edit Role Modal ────────────────────────────────────── */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSaveRole}>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{editingRole ? 'Edit Permissions' : 'Create Custom Role'}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Assign access scopes and customize permission groups.</p>
                  </div>
                  <button type="button" onClick={() => setShowRoleModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><i className="bi bi-x text-xl"></i></button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label>Role Name *</Label>
                    <Input
                      type="text"
                      value={roleFormName}
                      onChange={e => setRoleFormName(e.target.value)}
                      placeholder="e.g. Compliance Officer, Product Manager"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description / Functional Summary</Label>
                    <textarea
                      value={roleFormDesc}
                      onChange={e => setRoleFormDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="Describe what scope of work users in this role perform..."
                    />
                  </div>

                  <div>
                    <Label>System Permissions Checklists</Label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      {[
                        { key: 'admin_all', label: 'Full Admin Access', desc: 'Absolute system access within tenant' },
                        { key: 'hr_view', label: 'HR Directory View', desc: 'Allows viewing of employee list' },
                        { key: 'hr_edit', label: 'HR Directory Edit', desc: 'Add/manage/dismiss personnel' },
                        { key: 'leave_approve', label: 'Leave Approvals', desc: 'Approve or reject leave requests' },
                        { key: 'attendance_manage', label: 'Attendance Management', desc: 'Manage attendance and logs' },
                        { key: 'payroll_manage', label: 'Payroll Management', desc: 'Process monthly payroll runs' },
                        { key: 'accounting_view', label: 'Accounting Read', desc: 'View financial ledger records' },
                        { key: 'accounting_edit', label: 'Accounting Write', desc: 'Invoices, expenses, journal posts' },
                        { key: 'sales_manage', label: 'CRM & Sales', desc: 'Manage CRM leads, sales logs' },
                        { key: 'inventory_manage', label: 'Inventory & Stock', desc: 'Stock control, warehouse, POs' },
                        { key: 'helpdesk_edit', label: 'Support Operations', desc: 'Manage customer support tickets' }
                      ].map(perm => {
                        const hasPerm = roleFormPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${hasPerm
                              ? 'bg-slate-50 border-slate-900/40 text-slate-900'
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasPerm}
                              onChange={() => {
                                setRoleFormPermissions(prev =>
                                  prev.includes(perm.key)
                                    ? prev.filter(p => p !== perm.key)
                                    : [...prev, perm.key]
                                );
                              }}
                              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/50"
                            />
                            <div>
                              <div className="text-[11px] font-bold">{perm.label}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5 leading-normal">{perm.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button type="button" onClick={() => setShowRoleModal(false)} className="text-xs font-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                  <button type="submit" className="text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Save Role Settings</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. HR & DIRECTORY  →  delegated to HRModule
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('hr')) {
    return (
      <HRModule
        activeView={activeView}
        selectedCompany={selectedCompany}
        selectedUser={selectedUser}
        employees={employees}
        departments={departments}
        branches={branches}
        leaves={leaves}
        attendance={attendance}
        okrs={okrs}
        onAddEmployee={onAddEmployee}
        onApproveLeave={onApproveLeave}
        onRejectLeave={onRejectLeave}
        onAddLeave={onAddLeave}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
        onAddOKR={onAddOKR}
        onUpdateOKRProgress={onUpdateOKRProgress}
      />
    );
  }

  // 3. PAYROLL
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('payroll')) {
    const hasPayrollModule = selectedCompany.activeModules.includes('Payroll');

    if (!hasPayrollModule) {
      return (
        <div className="space-y-6">
          <PageHeader title="Payroll & Salary Management" subtitle="Process monthly payroll, manage salary structures, deductions and generate payslips." />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Payroll Module Not Available</h3>
            <p className="text-xs text-amber-600 mb-4">Your company has not subscribed to the Payroll module. Contact your administrator to enable payroll features.</p>
            <p className="text-xs text-slate-500">Employee salary data is available in the Employee Directory.</p>
          </div>
        </div>
      );
    }

    const isEmployeeRole = selectedUser.activeRole === 'Employee';
    // Safety check: Employees can only view slips
    const effectivePayrollTab = isEmployeeRole ? 'slips' : payrollTab;
    const totalPayroll = localEmployees.reduce((s, e) => s + e.salary, 0);

    return (
      <div>
        <PageHeader title="Payroll & Salary Management" subtitle={isEmployeeRole ? "View your payslips, earnings details, and tax deductions." : "Process monthly payroll, manage salary structures, deductions and generate payslips."} />
        {!isEmployeeRole && (
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Payroll" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-cash-stack" sub="Monthly gross obligation" />
            <StatCard label="Employees on Payroll" value={localEmployees.length} icon="bi bi-people" sub="Active salary records" />
            <StatCard label="Avg Salary" value={`$${localEmployees.length ? Math.round(totalPayroll / localEmployees.length).toLocaleString() : 0}`} icon="bi bi-bar-chart" sub="Mean monthly salary" accent />
            <StatCard label="Next Run" value="Aug 1, 2026" icon="bi bi-calendar" sub="Scheduled payroll date" />
          </div>
        )}

        {effectivePayrollTab === 'run' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">Run Payroll</h3>
              {payrollStep === 'idle' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Payroll Period</Label><Select value={payMonth} onChange={e => setPayMonth(e.target.value)}><option>July 2026</option><option>August 2026</option></Select></div>
                    <div><Label>Salary Structure</Label><Select value={paySalaryStructure} onChange={e => setPaySalaryStructure(e.target.value)}><option>Standard</option><option>Executive</option><option>Contractor</option></Select></div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Gross Payroll</span><span className="font-sans tabular-nums font-bold text-slate-900">${totalPayroll.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Tax Withholding (20%)</span><span className="font-sans tabular-nums text-rose-600">-${(totalPayroll * 0.2).toLocaleString()}</span></div>
                    <div className="flex justify-between table-cell mb-2"><span className="text-slate-600">Benefits / Deductions</span><span className="table-cell-mono text-rose-600">-${(totalPayroll * 0.05).toLocaleString()}</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between table-cell font-bold"><span className="text-slate-900">Net Payroll Disbursement</span><span className="table-cell-mono text-slate-900">${(totalPayroll * 0.75).toLocaleString()}</span></div>
                  </div>
                  <PrimaryBtn icon="bi bi-play-circle" onClick={() => setPayrollStep('review')}>Review & Process Payroll</PrimaryBtn>
                </div>
              )}
              {payrollStep === 'review' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>Confirm Payroll Run:</strong> {localEmployees.length} employees · Period: {payMonth} · Net: ${(totalPayroll * 0.75).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <PrimaryBtn icon="bi bi-check-circle" onClick={() => {
                      onRunPayroll(payMonth, paySalaryStructure);
                      setPayrollStep('done');
                    }}>Confirm & Disburse</PrimaryBtn>
                    <SecBtn onClick={() => setPayrollStep('idle')}>Cancel</SecBtn>
                  </div>
                </div>
              )}
              {payrollStep === 'done' && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <i className="bi bi-check-circle-fill text-emerald-600 text-2xl block mb-2"></i>
                  <div className="text-sm font-bold text-emerald-800">Payroll Processed Successfully!</div>
                  <div className="text-xs text-emerald-600 mt-1">{localEmployees.length} payslips generated · {payMonth} · Net ${(totalPayroll * 0.75).toLocaleString()} disbursed</div>
                  <button onClick={() => setPayrollStep('idle')} className="mt-4 text-xs font-semibold text-emerald-700 underline cursor-pointer">Run New Payroll</button>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="section-title text-slate-500 mb-4">Salary Bands</h3>
              <div className="space-y-3">
                {[{ band: 'Executive', range: '$12,000 – $25,000', count: 2 }, { band: 'Senior', range: '$8,000 – $12,000', count: 3 }, { band: 'Mid-level', range: '$5,000 – $8,000', count: 8 }, { band: 'Junior', range: '$3,000 – $5,000', count: 6 }].map(b => (
                  <div key={b.band} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center"><span className="table-cell-semibold text-slate-800">{b.band}</span><span className="data-value-small font-sans tabular-nums text-slate-400">{b.count} employees</span></div>
                    <div className="data-value text-slate-500 mt-0.5">{b.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {effectivePayrollTab === 'slips' && (
          isHRorAdmin ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">Payslips — {payMonth}</h3>
                <PrimaryBtn icon="bi bi-download">Export All</PrimaryBtn>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === payMonth).map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{getEmployeeNameById(employees, slip.employeeId) || slip.employeeName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{slip.department}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{slip.period}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                    </tr>
                  ))}
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === payMonth).length === 0 && (
                    <EmptyRow cols={7} message={`No payroll run found for ${payMonth}. Go to "Run Payroll" to generate.`} />
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ── Employee Self-Service: own payslip only ── */
            (() => {
              const myEmp = localEmployees.find(e => e.email === selectedUser.email);
              const mySlips = myEmp ? payslips.filter(p => p.employeeId === myEmp.id && p.companyId === selectedCompany.id) : [];
              const activeSlip = mySlips.find(s => s.id === selectedSlipId) || mySlips[0] || null;

              if (!activeSlip) {
                return (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-10 text-center">
                    <i className="bi bi-receipt-cutoff text-3xl text-slate-200 block mb-2"></i>
                    <p className="text-sm text-slate-400">No payslips generated for you yet.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="section-title text-slate-900">My Payslip — {activeSlip.period}</h3>
                        <p className="data-value-small text-slate-400 mt-0.5">Status: {activeSlip.status}</p>
                      </div>
                      <PrimaryBtn icon="bi bi-download">Download PDF</PrimaryBtn>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Earnings */}
                      <div>
                        <h4 className="data-value-small font-semibold text-slate-500 uppercase tracking-wider mb-3">Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="data-value text-slate-600">Base Salary</span>
                            <span className="data-value font-sans tabular-nums text-slate-900">${(activeSlip.baseSalary || activeSlip.gross).toLocaleString()}</span>
                          </div>
                          {activeSlip.overtimePay !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Overtime</span>
                              <span className="data-value font-sans tabular-nums text-slate-900">${activeSlip.overtimePay.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.allowances !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Allowances</span>
                              <span className="data-value font-sans tabular-nums text-slate-900">${activeSlip.allowances.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="table-cell-semibold text-slate-900">Total Gross Earnings</span>
                            <span className="table-cell-semibold font-sans tabular-nums text-slate-900">${activeSlip.gross.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h4 className="data-value-small font-semibold text-slate-500 uppercase tracking-wider mb-3">Deductions</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="data-value text-slate-600">Tax Withholding</span>
                            <span className="data-value font-sans tabular-nums text-rose-600">-${(activeSlip.tax || Math.round(activeSlip.gross * 0.12)).toLocaleString()}</span>
                          </div>
                          {activeSlip.socialSec !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Social Security</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.socialSec.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.medicare !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Medicare</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.medicare.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.healthIns !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Health Insurance</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.healthIns.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="table-cell-semibold text-slate-900">Total Deductions</span>
                            <span className="table-cell-semibold font-sans tabular-nums text-rose-600">-${activeSlip.deductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Pay */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="table-cell-semibold text-emerald-800">Net Pay</div>
                          <div className="data-value-small text-emerald-600">Direct Deposited</div>
                        </div>
                        <div className="text-2xl font-bold font-sans tabular-nums text-emerald-700">${activeSlip.net.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Previous payslips list */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="section-title text-slate-900">All Available Payslips</h3>
                    </div>
                    <table className="w-full text-left">
                      <TableHead cols={[{ label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }, { label: '' }]} />
                      <tbody className="divide-y divide-slate-100">
                        {mySlips.map(slip => (
                          <tr key={slip.id} className={`hover:bg-slate-50/40 transition-colors ${activeSlip.id === slip.id ? 'bg-slate-50' : ''}`}>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-900">{slip.period}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                            <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => setSelectedSlipId(slip.id)} className="text-blue-600 hover:text-blue-800 data-value-small font-semibold cursor-pointer mr-3">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )
        )}

        {payrollTab === 'tax' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total Tax Withheld" value={`$${(totalPayroll * 0.2).toLocaleString()}`} icon="bi bi-building-check" sub="This month's PAYE/FICA" color="text-rose-600" />
              <StatCard label="Employer NI/SS" value={`$${(totalPayroll * 0.065).toLocaleString()}`} icon="bi bi-shield-check" sub="Employer contributions" />
              <StatCard label="Pension / 401k" value={`$${(totalPayroll * 0.04).toLocaleString()}`} icon="bi bi-piggy-bank" sub="Retirement deductions" accent />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Tax & Deductions Register</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Gross', right: true }, { label: 'Federal Tax', right: true }, { label: 'State Tax', right: true }, { label: 'Social Sec.', right: true }, { label: 'Medicare', right: true }, { label: 'Net', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 8).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${emp.salary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${Math.round(emp.salary * 0.12).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-500 text-right">-${Math.round(emp.salary * 0.05).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-500 text-right">-${Math.round(emp.salary * 0.062).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-400 text-right">-${Math.round(emp.salary * 0.0145).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-emerald-700 text-right">${Math.round(emp.salary * 0.75).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {payrollTab === 'overtime' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="OT Hours This Month" value="142h" icon="bi bi-clock-history" sub="Across all staff" accent />
              <StatCard label="OT Payout" value={`$${(totalPayroll * 0.08).toLocaleString()}`} icon="bi bi-currency-dollar" sub="1.5x premium rate" />
              <StatCard label="Employees with OT" value={Math.min(4, localEmployees.length)} icon="bi bi-people" sub="Claimed overtime this month" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Overtime Log</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Regular Hours', right: true }, { label: 'OT Hours', right: true }, { label: 'OT Rate', right: true }, { label: 'OT Pay', right: true }, { label: 'Approved By' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 4).map((emp, i) => {
                    const otHours = [12, 8, 18, 6][i] ?? 5;
                    const otRate = Math.round((emp.salary / 160) * 1.5);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{emp.department}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">160h</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">{otHours}h</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${otRate}/hr</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-emerald-700 text-right">${(otHours * otRate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">HR Manager</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 4. CRM
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('crm')) {
    const stages: CRMLead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
    const stageColors: Record<string, string> = {
      New: 'border-slate-300 bg-slate-50',
      Contacted: 'border-blue-200 bg-blue-50/30',
      Qualified: 'border-amber-200 bg-amber-50/30',
      'Proposal Sent': 'border-purple-200 bg-purple-50/30',
      Won: 'border-emerald-200 bg-emerald-50/30',
      Lost: 'border-rose-200 bg-rose-50/30',
    };
    const filtered = localLeads.filter(l => crmFilter === 'All' || l.status === crmFilter)
      .filter(l => `${l.firstName} ${l.lastName} ${l.companyName}`.toLowerCase().includes(crmSearch.toLowerCase()));
    const pipelineValue = localLeads.filter(l => l.status !== 'Lost').reduce((s, l) => s + l.value, 0);
    const crmTabTitles: Record<string, string> = {
      pipeline: 'Lead Pipeline',
      contacts: 'Contacts',
      activities: 'Activities',
      tasks: 'Tasks',
      emails: 'Emails',
      reports: 'CRM Reports',
    };

    return (
      <div>
        <PageHeader title={`CRM — ${crmTabTitles[crmTab] ?? 'Lead Pipeline'}`} subtitle="Track prospects, manage the sales funnel, score leads with AI and dispatch follow-ups."
          action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowLeadForm(true)}>Add Lead</PrimaryBtn>} />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total Leads" value={localLeads.length} icon="bi bi-people" sub="All pipeline contacts" />
          <StatCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Active deal potential" accent />
          <StatCard label="Qualified" value={localLeads.filter(l => l.status === 'Qualified').length} icon="bi bi-star" sub="Ready to propose" />
          <StatCard label="Closed Won" value={localLeads.filter(l => l.status === 'Won').length} icon="bi bi-trophy" sub="Converted deals" />
        </div>

        {showLeadForm && (
          <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="section-title text-slate-500">New Lead Registration</h3><button onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><i className="bi bi-x-lg text-sm"></i></button></div>
            {leadSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg table-cell text-emerald-700 font-semibold">Lead added successfully!</div>}
            <form onSubmit={e => {
              e.preventDefault();
              if (!crmFirst || !crmLast || !crmCompany) return;
              onAddLead({ companyId: selectedCompany.id, firstName: crmFirst, lastName: crmLast, email: crmEmail, phone: crmPhone, companyName: crmCompany, source: crmSource, value: Number(crmValue), assignedTo: selectedUser.id });
              setLeadSuccess(true); setCrmFirst(''); setCrmLast(''); setCrmCompany(''); setCrmEmail(''); setCrmPhone('');
              setTimeout(() => setLeadSuccess(false), 3000);
            }} className="grid gap-4 sm:grid-cols-3">
              <div><Label>First Name *</Label><Input value={crmFirst} onChange={e => setCrmFirst(e.target.value)} placeholder="Jane" required /></div>
              <div><Label>Last Name *</Label><Input value={crmLast} onChange={e => setCrmLast(e.target.value)} placeholder="Smith" required /></div>
              <div><Label>Company *</Label><Input value={crmCompany} onChange={e => setCrmCompany(e.target.value)} placeholder="Acme Corp" required /></div>
              <div><Label>Email</Label><Input type="email" value={crmEmail} onChange={e => setCrmEmail(e.target.value)} placeholder="jane@acme.com" /></div>
              <div><Label>Deal Value (USD)</Label><Input type="number" value={crmValue} onChange={e => setCrmValue(e.target.value)} /></div>
              <div><Label>Source</Label><Select value={crmSource} onChange={e => setCrmSource(e.target.value as typeof crmSource)}>{['Website', 'Referral', 'LinkedIn', 'Ad Campaign', 'Partner'].map(s => <option key={s}>{s}</option>)}</Select></div>
              <div className="sm:col-span-3 pt-1"><PrimaryBtn icon="bi bi-person-plus">Register Lead</PrimaryBtn></div>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        {crmTab === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stages.map(stage => {
              const stageLeads = filtered.filter(l => l.status === stage);
              const isExpanded = expandedStages[stage] || false;
              const visibleLeads = isExpanded ? stageLeads : stageLeads.slice(0, 3);
              const hasMore = stageLeads.length > 3;

              return (
                <div
                  key={stage}
                  className={`rounded-xl border p-3 min-h-[300px] ${stageColors[stage]}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData('leadId');
                    if (leadId && onMoveLead) {
                      onMoveLead(leadId, stage as CRMLead['status']);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="data-value-small font-bold uppercase tracking-wider text-slate-600">{stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="data-value-small font-sans tabular-nums text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                      {hasMore && (
                        <button
                          onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }))}
                          className="p-1 rounded hover:bg-white/50 text-slate-500 transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {visibleLeads.map(l => (
                      <div
                        key={l.id}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('leadId', l.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="data-value font-bold text-slate-900 leading-tight">{l.companyName}</div>
                            <div className="data-value-small text-slate-500 mt-0.5">{l.firstName} {l.lastName}</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadForAssign(l.id); setShowAssignModal(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Assign to user"
                            >
                              <i className="bi bi-person-plus text-xs"></i>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadForComments(l.id); setShowCommentPanel(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Add comment"
                            >
                              <i className="bi bi-chat-text text-xs"></i>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setLogActivityLeadId(l.id); setShowLogActivity(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Log activity"
                            >
                              <i className="bi bi-clock-history text-xs"></i>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {l.assignedTo && (
                            <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-2 py-1">
                              <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center avatar-text font-semibold text-slate-600">{resolveUserName(l.assignedTo).charAt(0)}</div>
                              <span className="data-value-small text-slate-600 truncate max-w-[80px] sm:max-w-[100px]">{resolveUserName(l.assignedTo)}</span>
                            </div>
                          )}
                          {l.department && (() => {
                            const dept = localDepartments.find(d => d.id === l.department);
                            return dept ? (
                              <span className="data-value-small bg-slate-100 text-slate-600 px-2 py-0.5 rounded truncate max-w-[70px] sm:max-w-[90px] md:max-w-[120px]">{dept.name}</span>
                            ) : null;
                          })()}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="data-value-small font-sans tabular-nums font-semibold text-slate-900">${l.value.toLocaleString()}</span>
                          {l.aiLeadScore && <span className="data-value-small bg-slate-900 text-white px-1.5 py-0.5 rounded font-sans tabular-nums">{l.aiLeadScore}%</span>}
                        </div>
                        {l.comments && l.comments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
                            <i className="bi bi-chat-left text-slate-400 text-xs"></i>
                            <span className="data-value-small text-slate-500">{l.comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {hasMore && !isExpanded && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: true }))}
                          className="data-value-small text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          + {stageLeads.length - 3} more leads
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-slate-900">Assign Lead</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <i className="bi bi-x-lg text-lg"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Assign to Employee</Label>
                  <Select value={assignedUser} onChange={e => setAssignedUser(e.target.value)}>
                    <option value="">— Select Employee —</option>
                    {localEmployees.filter(e => e.status === 'Active').map(emp => (
                      <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Assign to Department</Label>
                  <Select value={assignedDepartment} onChange={e => setAssignedDepartment(e.target.value)}>
                    <option value="">— Select Department —</option>
                    {localDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <SecBtn onClick={() => setShowAssignModal(false)}>Cancel</SecBtn>
                  <PrimaryBtn icon="bi bi-person-check" onClick={() => {
                    if (selectedLeadForAssign && (assignedUser || assignedDepartment)) {
                      const emp = localEmployees.find(e => e.userId === assignedUser || e.id === assignedUser);
                      const userName = emp ? `${emp.firstName} ${emp.lastName}` : '';
                      onAssignLead(selectedLeadForAssign, assignedUser, userName, assignedDepartment || '');
                    }
                    setShowAssignModal(false);
                    setSelectedLeadForAssign(null);
                    setAssignedUser('');
                    setAssignedDepartment('');
                  }}>Assign</PrimaryBtn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Panel */}
        {showCommentPanel && selectedLeadForComments && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-slate-900">Lead Comments</h3>
                <button onClick={() => setShowCommentPanel(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <i className="bi bi-x-lg text-lg"></i>
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {localLeads.find(l => l.id === selectedLeadForComments)?.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center avatar-text font-semibold text-slate-600">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="data-value font-semibold text-slate-900">{comment.userName}</span>
                        <span className="data-value-small text-slate-400">{new Date(comment.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="data-value text-slate-700">{comment.content}</div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <button
                      onClick={() => {
                        if (newComment.trim() && selectedLeadForComments) {
                          onAddComment(selectedLeadForComments, newComment);
                          setNewComment('');
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg btn font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Activity Modal */}
        {showLogActivity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-slate-900">Log Activity</h3>
                <button onClick={() => setShowLogActivity(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <i className="bi bi-x-lg text-lg"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Activity Type</Label>
                  <Select value={logActivityType} onChange={e => setLogActivityType(e.target.value as any)}>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Note</option>
                    <option value="Task">Task</option>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={logActivitySubject} onChange={e => setLogActivitySubject(e.target.value)} placeholder="e.g. Discovery Call" required />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea value={logActivityDesc} onChange={e => setLogActivityDesc(e.target.value)} placeholder="What happened during this activity..." rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <SecBtn onClick={() => setShowLogActivity(false)}>Cancel</SecBtn>
                  <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                    if (logActivitySubject.trim() && logActivityLeadId) {
                      onLogCrmActivity({
                        companyId: selectedCompany.id,
                        leadId: logActivityLeadId,
                        type: logActivityType,
                        subject: logActivitySubject,
                        description: logActivityDesc
                      });
                      setShowLogActivity(false);
                      setLogActivitySubject('');
                      setLogActivityDesc('');
                      setLogActivityLeadId('');
                    }
                  }}>Log Activity</PrimaryBtn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Detail Modal */}
        {selectedLeadForDetail && (() => {
          const lead = localLeads.find(l => l.id === selectedLeadForDetail);
          if (!lead) return null;
          const activities = crmActivities.filter(a => a.leadId === lead.id);
          const typeIcons: Record<string, string> = { Call: 'telephone', Email: 'envelope', Meeting: 'camera-video', Note: 'journal-text', Task: 'check2-square' };
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center avatar-text font-bold text-white">{lead.firstName[0]}{lead.lastName[0]}</div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{lead.firstName} {lead.lastName}</h3>
                      <p className="text-xs text-slate-500">{lead.companyName}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLeadForDetail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i className="bi bi-x-lg text-lg"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Email</div>
                    <div className="data-value font-semibold text-slate-900 truncate">{lead.email || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Phone</div>
                    <div className="data-value font-semibold text-slate-900">{lead.phone || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Deal Value</div>
                    <div className="data-value font-semibold text-slate-900">${lead.value.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Stage</div>
                    <Badge label={lead.status} variant={lead.status === 'Won' ? 'success' : lead.status === 'Lost' ? 'danger' : lead.status === 'Qualified' ? 'info' : 'default'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Source</div>
                    <Badge label={lead.source} />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Assigned To</div>
                    <div className="data-value font-semibold text-slate-900">{resolveUserName(lead.assignedTo) || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">AI Score</div>
                    <div className="data-value font-semibold text-slate-900">{lead.aiLeadScore ?? '—'}%</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Created</div>
                    <div className="data-value font-semibold text-slate-900">{new Date(lead.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {lead.aiFollowUpSuggested && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="bi bi-lightbulb text-blue-600"></i>
                      <span className="data-value font-semibold text-blue-900">AI Follow-up Suggestion</span>
                    </div>
                    <p className="text-xs text-blue-700">{lead.aiFollowUpSuggested}</p>
                  </div>
                )}
                <div className="mb-5">
                  <h4 className="section-title text-slate-500 mb-3">Activity Timeline ({activities.length})</h4>
                  {activities.length > 0 ? (
                    <div className="space-y-2">
                      {activities.map(act => (
                        <div key={act.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                            <i className={`bi bi-${typeIcons[act.type] || 'circle'} text-slate-600 text-xs`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="data-value font-semibold text-slate-900">{act.subject}</span>
                              <span className="data-value-small text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">by {resolveUserName(act.performedBy)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No activities logged yet.</p>
                  )}
                </div>
                <div className="mb-5">
                  <h4 className="section-title text-slate-500 mb-3">Comments ({lead.comments?.length || 0})</h4>
                  {lead.comments && lead.comments.length > 0 ? (
                    <div className="space-y-2">
                      {lead.comments.map(c => (
                        <div key={c.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center avatar-text font-semibold text-slate-600 shrink-0">{c.userName.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="data-value font-semibold text-slate-900">{c.userName}</span>
                              <span className="data-value-small text-slate-400">{new Date(c.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No comments yet.</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <PrimaryBtn icon="bi bi-clock-history" onClick={() => { setSelectedLeadForDetail(null); setLogActivityLeadId(lead.id); setShowLogActivity(true); }}>Log Activity</PrimaryBtn>
                  <SecBtn onClick={() => { setSelectedLeadForDetail(null); setSelectedLeadForComments(lead.id); setShowCommentPanel(true); }}>Add Comment</SecBtn>
                </div>
              </div>
            </div>
          );
        })()}

        {crmTab === 'contacts' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">All Contacts</h3>
              <PrimaryBtn icon="bi bi-person-plus" onClick={() => setShowLeadForm(true)}>Add Contact</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Name' }, { label: 'Company' }, { label: 'Email' }, { label: 'Source' }, { label: 'Deal Value', right: true }, { label: 'Stage' }]} />
              <tbody className="divide-y divide-slate-100">
                {localLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => setSelectedLeadForDetail(l.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center avatar-text font-bold text-white shrink-0">{l.firstName[0]}{l.lastName[0]}</div>
                        <div className="text-xs font-semibold text-slate-900">{l.firstName} {l.lastName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{l.companyName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{l.email}</td>
                    <td className="px-4 py-3"><Badge label={l.source} /></td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${l.value.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={l.status} variant={l.status === 'Won' ? 'success' : l.status === 'Lost' ? 'danger' : l.status === 'Qualified' ? 'info' : 'default'} /></td>
                  </tr>
                ))}
                {localLeads.length === 0 && <EmptyRow cols={6} message="No contacts found." />}
              </tbody>
            </table>
          </div>
        )}

        {crmTab === 'activities' && (
          <div className="space-y-3">
            {crmActivities.filter(a => a.companyId === selectedCompany.id).map(act => {
              const lead = localLeads.find(l => l.id === act.leadId);
              const typeIcons: Record<string, string> = { Call: 'telephone', Email: 'envelope', Meeting: 'camera-video', Note: 'journal-text', Task: 'check2-square' };
              const typeColors: Record<string, string> = { Call: 'bg-blue-100 text-blue-600', Email: 'bg-purple-100 text-purple-600', Meeting: 'bg-amber-100 text-amber-600', Note: 'bg-slate-100 text-slate-600', Task: 'bg-emerald-100 text-emerald-600' };
              return (
                <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-4 hover:border-slate-300 transition-all">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[act.type] || 'bg-slate-100 text-slate-600'}`}>
                    <i className={`bi bi-${typeIcons[act.type] || 'circle'} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="table-cell-semibold text-slate-900">{act.subject}</span>
                      <div className="flex items-center gap-2">
                        <Badge label={act.type} variant="info" />
                        {lead && <span className="text-[10px] text-slate-400">{lead.firstName} {lead.lastName}</span>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">by {resolveUserName(act.performedBy)}</p>
                  </div>
                  <span className="data-value-small font-sans tabular-nums text-slate-400 shrink-0">{new Date(act.createdAt).toLocaleDateString()}</span>
                </div>
              );
            })}
            {crmActivities.filter(a => a.companyId === selectedCompany.id).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-calendar2-event text-3xl mb-3 block"></i>
                <p className="text-sm">No activities logged yet. Use the pipeline cards to log calls, emails, and meetings.</p>
              </div>
            )}
          </div>
        )}

        {crmTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title text-slate-900">Tasks & Follow-ups</h3>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowCreateTask(true)}>New Task</PrimaryBtn>
            </div>
            <div className="flex gap-2 mb-4">
              {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                <button key={f} onClick={() => setTaskFilter(f as any)} className={`data-value-small px-3 py-1 rounded-lg border transition-all cursor-pointer ${taskFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{f}</button>
              ))}
            </div>
            {crmTasks.filter(t => t.companyId === selectedCompany.id && (taskFilter === 'All' || t.status === taskFilter)).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-check2-square text-3xl mb-3 block"></i>
                <p className="text-sm">No tasks found. Create a task from a pipeline card or contact detail.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {crmTasks.filter(t => t.companyId === selectedCompany.id && (taskFilter === 'All' || t.status === taskFilter)).map(task => {
                  const priorityColors: Record<string, string> = { Low: 'bg-slate-100 text-slate-600', Medium: 'bg-blue-100 text-blue-700', High: 'bg-amber-100 text-amber-700', Urgent: 'bg-rose-100 text-rose-700' };
                  const statusIcons: Record<string, string> = { Pending: 'bi-circle', 'In Progress': 'bi-play-circle', Completed: 'bi-check-circle-fill', Cancelled: 'bi-x-circle' };
                  const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className={`bg-white border rounded-xl p-4 shadow-xs flex items-start gap-4 transition-all ${task.status === 'Completed' ? 'opacity-60' : isOverdue ? 'border-rose-200' : 'border-slate-200 hover:border-slate-300'}`}>
                      <button onClick={() => onUpdateCrmTask(task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })} className="mt-0.5 cursor-pointer">
                        <i className={`bi ${statusIcons[task.status]} text-lg ${task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}></i>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`data-value font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{task.leadName} — {task.companyName}</p>
                        {task.description && <p className="text-xs text-slate-400 truncate">{task.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-[10px] font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                          {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{task.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showCreateTask && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title text-slate-900">Create Task</h3>
                    <button onClick={() => setShowCreateTask(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><i className="bi bi-x-lg text-lg"></i></button>
                  </div>
                  <div className="space-y-4">
                    <div><Label>Lead</Label><Select value={taskLeadId} onChange={e => setTaskLeadId(e.target.value)}><option value="">Select lead...</option>{localLeads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} — {l.companyName}</option>)}</Select></div>
                    <div><Label>Title</Label><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Follow-up call" required /></div>
                    <div><Label>Description</Label><textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" /></div>
                    <div><Label>Assign To</Label><Select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Type</Label><Select value={taskType} onChange={e => setTaskType(e.target.value as any)}>{['Follow-up', 'Call', 'Email', 'Meeting', 'Proposal', 'Other'].map(t => <option key={t}>{t}</option>)}</Select></div>
                      <div><Label>Priority</Label><Select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>{['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}</Select></div>
                    </div>
                    <div><Label>Due Date</Label><Input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required /></div>
                    <div className="flex gap-2 pt-2">
                      <SecBtn onClick={() => setShowCreateTask(false)}>Cancel</SecBtn>
                      <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                        if (taskTitle.trim() && taskLeadId && taskDueDate) {
                          const lead = localLeads.find(l => l.id === taskLeadId);
                          const assigneeId = taskAssignee || selectedUser.id;
                          const assigneeEmp = localEmployees.find(e => e.userId === assigneeId || e.id === assigneeId);
                          const assigneeName = assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name;
                          if (lead) {
                            onCreateCrmTask({
                              companyId: selectedCompany.id,
                              leadId: taskLeadId,
                              leadName: `${lead.firstName} ${lead.lastName}`,
                              companyName: lead.companyName,
                              title: taskTitle,
                              description: taskDesc,
                              type: taskType,
                              priority: taskPriority,
                              assignedTo: assigneeId,
                              assignedToName: assigneeName,
                              dueDate: new Date(taskDueDate).toISOString()
                            });
                            setShowCreateTask(false);
                            setTaskTitle(''); setTaskDesc(''); setTaskLeadId(''); setTaskDueDate(''); setTaskAssignee('');
                          }
                        }
                      }}>Create Task</PrimaryBtn>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {crmTab === 'emails' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title text-slate-900">Email History</h3>
              <PrimaryBtn icon="bi bi-envelope-plus" onClick={() => setShowSendEmail(true)}>Send Email</PrimaryBtn>
            </div>
            {crmEmails.filter(e => e.companyId === selectedCompany.id).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-envelope text-3xl mb-3 block"></i>
                <p className="text-sm">No emails sent yet. Send an email to a contact to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {crmEmails.filter(e => e.companyId === selectedCompany.id).map(email => {
                  const lead = localLeads.find(l => l.id === email.leadId);
                  return (
                    <div key={email.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="bi bi-envelope-fill text-slate-400 text-xs"></i>
                            <span className="data-value font-semibold text-slate-900">{email.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>To: {email.to}</span>
                            {lead && <span>• {lead.firstName} {lead.lastName}</span>}
                            <span>• by {resolveUserName(email.sentBy)}</span>
                          </div>
                        </div>
                        <span className="data-value-small text-slate-400 shrink-0">{new Date(email.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{email.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {showSendEmail && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title text-slate-900">Send Email</h3>
                    <button onClick={() => setShowSendEmail(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><i className="bi bi-x-lg text-lg"></i></button>
                  </div>
                  <div className="space-y-4">
                    <div><Label>To</Label><Select value={emailLeadId} onChange={e => {
                      setEmailLeadId(e.target.value);
                      const lead = localLeads.find(l => l.id === e.target.value);
                      if (lead) setEmailTo(lead.email);
                    }}><option value="">Select contact...</option>{localLeads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} — {l.email}</option>)}</Select></div>
                    {emailTo && <div className="text-[10px] text-slate-400">Sending to: {emailTo}</div>}
                    <div><Label>Subject</Label><Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email subject" required /></div>
                    <div><Label>Body</Label><textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" placeholder="Write your email..." /></div>
                    <div className="flex gap-2 pt-2">
                      <SecBtn onClick={() => setShowSendEmail(false)}>Cancel</SecBtn>
                      <PrimaryBtn icon="bi bi-send" onClick={() => {
                        if (emailTo && emailSubject.trim() && emailBody.trim() && emailLeadId) {
                          onSendCrmEmail({
                            companyId: selectedCompany.id,
                            leadId: emailLeadId,
                            to: emailTo,
                            subject: emailSubject,
                            body: emailBody
                          });
                          setShowSendEmail(false);
                          setEmailTo(''); setEmailSubject(''); setEmailBody(''); setEmailLeadId('');
                        }
                      }}>Send Email</PrimaryBtn>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {crmTab === 'reports' && (
          <div className="space-y-6">
            {(() => {
              const wonLeads = localLeads.filter(l => l.status === 'Won');
              const avgDaysToClose = wonLeads.length > 0
                ? Math.round(wonLeads.reduce((sum, l) => {
                  const created = new Date(l.createdAt).getTime();
                  const now = Date.now();
                  return sum + (now - created) / (1000 * 60 * 60 * 24);
                }, 0) / wonLeads.length)
                : 0;
              const sources = ['Website', 'Referral', 'LinkedIn', 'Ad Campaign', 'Partner', 'In-Store'];
              const sourceCounts = sources.map(s => ({ source: s, count: localLeads.filter(l => l.source === s).length })).filter(s => s.count > 0);
              const maxSourceCount = Math.max(...sourceCounts.map(s => s.count), 1);
              return (
                <>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <StatCard label="Win Rate" value={`${localLeads.length > 0 ? Math.round((wonLeads.length / localLeads.length) * 100) : 0}%`} icon="bi bi-trophy" sub="Deals closed vs total" color="text-emerald-600" />
                    <StatCard label="Avg Deal Size" value={`$${localLeads.length > 0 ? Math.round(localLeads.reduce((s, l) => s + l.value, 0) / localLeads.length).toLocaleString() : 0}`} icon="bi bi-currency-dollar" sub="Mean pipeline value" accent />
                    <StatCard label="Pipeline Velocity" value={wonLeads.length > 0 ? `${avgDaysToClose} days` : 'N/A'} icon="bi bi-speedometer" sub={wonLeads.length > 0 ? 'Avg days to close' : 'No won deals yet'} />
                    <StatCard label="Lost Deals" value={localLeads.filter(l => l.status === 'Lost').length} icon="bi bi-x-circle" sub="This quarter" color="text-rose-600" />
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                      <h3 className="section-title text-slate-500 mb-5">Pipeline by Stage</h3>
                      <div className="space-y-3">
                        {stages.map(stage => {
                          const count = localLeads.filter(l => l.status === stage).length;
                          const pct = localLeads.length > 0 ? (count / localLeads.length) * 100 : 0;
                          return (
                            <div key={stage} className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-slate-700 w-32 shrink-0">{stage}</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                              <span className="data-value-small font-sans tabular-nums text-slate-500 w-12 text-right">{count} leads</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                      <h3 className="section-title text-slate-500 mb-5">Leads by Source</h3>
                      <div className="space-y-3">
                        {sourceCounts.map(({ source, count }) => (
                          <div key={source} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-700 w-24 shrink-0">{source}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full transition-all" style={{ width: `${(count / maxSourceCount) * 100}%` }} /></div>
                            <span className="data-value-small font-sans tabular-nums text-slate-500 w-12 text-right">{count}</span>
                          </div>
                        ))}
                        {sourceCounts.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data</p>}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ACCOUNTING - CORE LEDGER
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'accounting' || activeView.startsWith('acc-')) {
    const cashAcc = localGL.find(a => a.code === '1010');
    const revAcc = localGL.find(a => a.code === '4010');
    const totalExpenses = localGL.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
    const openInv = localInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Void');
    const totalDebits = localGL.filter(a => a.type === 'Asset' || a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
    const totalCredits = localGL.filter(a => a.type === 'Liability' || a.type === 'Revenue' || a.type === 'Equity').reduce((s, a) => s + a.balance, 0);

    return (
      <div>
        {/* ── Secondary Tab Bar for Accounting Groups ── */}
        {accGroup === 'gl' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'ledger', label: 'Chart of Accounts' }, { id: 'journal', label: 'Journal Entries' }, { id: 'trial', label: 'Trial Balance' }, { id: 'opening-balances', label: 'Opening Balances' }, { id: 'fiscal-periods', label: 'Fiscal Periods' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'bank' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'bank', label: 'Bank Accounts' }, { id: 'multi-currency', label: 'Multi-Currency' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'assets' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'fixed-assets', label: 'Fixed Assets' }, { id: 'budgets', label: 'Budgets' }, { id: 'cost-centers', label: 'Cost Centers' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'tax' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px overflow-x-auto">
            {[{ id: 'tax', label: 'Tax Codes' }, { id: 'tax-returns', label: 'Tax Returns' }, { id: 'intercompany', label: 'Intercompany' }, { id: 'consolidation', label: 'Consolidation' }, { id: 'compliance', label: 'Compliance' }, { id: 'audit-trail', label: 'Audit Trail' }, { id: 'policies', label: 'Policies' }, { id: 'filing-deadlines', label: 'Filing Deadlines' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 whitespace-nowrap ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'reports' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'reports', label: 'Overview' }, { id: 'reports-pl', label: 'Profit & Loss' }, { id: 'reports-bs', label: 'Balance Sheet' }, { id: 'reports-cf', label: 'Cash Flow' }, { id: 'reports-aging', label: 'AR Aging' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}

        {accTab === 'ledger' && (
          <>
            <PageHeader title="General Ledger" subtitle="Chart of accounts, journal entries and financial reporting."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setEditingGLAccount(null); setGlFormCode(''); setGlFormName(''); setGlFormType('Asset'); setShowGLModal(true); }}>Add Account</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Cash & Bank" value={`$${(cashAcc?.balance ?? 0).toLocaleString()}`} icon="bi bi-bank" sub="GL Account 1010" />
              <StatCard label="Revenue YTD" value={`$${(revAcc?.balance ?? 0).toLocaleString()}`} icon="bi bi-graph-up" sub="GL Account 4010" color="text-emerald-600" />
              <StatCard label="Open Invoices" value={openInv.length} icon="bi bi-file-earmark-text" sub={`$${openInv.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} accent />
              <StatCard label="Net Income" value={`$${((revAcc?.balance ?? 0) - totalExpenses).toLocaleString()}`} icon="bi bi-pie-chart" sub="Revenue minus expenses" />
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-slate-500">Chart of Accounts</h3>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search accounts..." className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs data-value focus:outline-none focus:ring-1 focus:ring-slate-300" value={accSearch} onChange={(e) => setAccSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {['All', 'Asset', 'Liability', 'Revenue', 'Expense', 'Equity'].map(type => (
                    <button key={type} onClick={() => setAccFilter(type)} className={`data-value-small px-3 py-1 rounded-lg border transition-all cursor-pointer ${accFilter === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{type}</button>
                  ))}
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Code' }, { label: 'Account Name' }, { label: 'Type' }, { label: 'Balance', right: true }, { label: 'Actions', right: true }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localGL.filter(acc => accFilter === 'All' || acc.type === accFilter).filter(acc => acc.name.toLowerCase().includes(accSearch.toLowerCase()) || acc.code.toLowerCase().includes(accSearch.toLowerCase())).map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{acc.code}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{acc.name}</td>
                        <td className="px-4 py-3"><Badge label={acc.type} variant={acc.type === 'Revenue' ? 'success' : acc.type === 'Expense' ? 'danger' : acc.type === 'Asset' ? 'info' : 'default'} /></td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditingGLAccount(acc); setGlFormCode(acc.code); setGlFormName(acc.name); setGlFormType(acc.type); setShowGLModal(true); }} className="data-value-small text-slate-500 hover:text-slate-900 cursor-pointer mr-2">Edit</button>
                          <button onClick={() => { if (confirm('Delete this account?')) onDeleteGLAccount(acc.id); }} className="data-value-small text-slate-500 hover:text-rose-600 cursor-pointer">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {localGL.filter(acc => accFilter === 'All' || acc.type === accFilter).filter(acc => acc.name.toLowerCase().includes(accSearch.toLowerCase()) || acc.code.toLowerCase().includes(accSearch.toLowerCase())).length === 0 && <EmptyRow cols={5} message="No accounts found matching criteria." />}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="section-title text-slate-500 mb-4">Account Summary</h3>
                <div className="space-y-3">
                  {['Asset', 'Liability', 'Revenue', 'Expense', 'Equity'].map(type => {
                    const typeAccounts = localGL.filter(a => a.type === type);
                    const typeTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
                    return (
                      <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400"></span><span className="data-value text-slate-800">{type}</span></div>
                        <div className="flex items-center gap-3"><span className="data-value-small text-slate-500">{typeAccounts.length} accounts</span><span className="data-value font-sans tabular-nums font-semibold text-slate-900">${typeTotal.toLocaleString()}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'acc-invoices' && (
          <>
            <PageHeader title="Invoices" subtitle="Manage customer invoices, track payments and send reminders."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setAccTab('create')}>New Invoice</PrimaryBtn>} />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Invoice #' }, { label: 'Client' }, { label: 'Issue Date' }, { label: 'Due Date' }, { label: 'Amount', right: true }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{inv.customerName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={inv.status} variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : inv.status === 'Sent' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">{inv.status !== 'Paid' && inv.status !== 'Void' && <button onClick={() => onPayInvoice(inv.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Pay</button>}</td>
                    </tr>
                  ))}
                  {localInvoices.length === 0 && <EmptyRow cols={7} message="No invoices found." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeView === 'acc-expenses' && (
          <>
            <PageHeader title="Expenses" subtitle="Track and manage business expenses by category and department."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowExpenseModal(true)}>Add Expense</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <StatCard label="Total Expenses" value={`$${localExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`} icon="bi bi-credit-card" sub="All recorded expenses" accent />
              <StatCard label="Pending Approval" value={localExpenses.filter(e => e.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting review" />
              <StatCard label="Approved" value={localExpenses.filter(e => e.status === 'Approved').length} icon="bi bi-check-circle" sub="Auto-posted to GL" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Date' }, { label: 'Description' }, { label: 'Category' }, { label: 'Department' }, { label: 'Amount', right: true }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{exp.date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{exp.description}</td>
                      <td className="px-4 py-3"><Badge label={exp.category} variant="default" /></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{exp.department}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${exp.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={exp.status} variant={exp.status === 'Approved' ? 'success' : exp.status === 'Rejected' ? 'danger' : 'warning'} /></td>
                      <td className="px-4 py-3 text-right">{exp.status === 'Pending' && <button onClick={() => onApproveExpense(exp.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Approve</button>}</td>
                    </tr>
                  ))}
                  {localExpenses.length === 0 && <EmptyRow cols={7} message="No expenses recorded." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'journal' && (
          <>
            <PageHeader title="Journal Entry" subtitle="Create and manage journal entries for double-entry bookkeeping." />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
                <h3 className="section-title text-slate-500 mb-5">New Journal Entry</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Entry Date</Label><Input type="date" value={jeDate} onChange={e => setJeDate(e.target.value)} /></div>
                    <div><Label>Reference</Label><Input value={jeReference} onChange={e => setJeReference(e.target.value)} placeholder="JE-2026-001" /></div>
                  </div>
                  <div><Label>Description</Label><Input value={jeDescription} onChange={e => setJeDescription(e.target.value)} placeholder="Enter description..." /></div>
                  <div><Label>Prepared By</Label><Select value={jeAssignee} onChange={e => setJeAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="data-value text-slate-800 mb-3">Line Items</h4>
                    <div className="space-y-3">
                      {jeLines.map((line, idx) => (
                        <div key={idx} className="grid gap-3 sm:grid-cols-5 items-end">
                          <div className="sm:col-span-2">
                            <Label>{idx === 0 ? 'Debit Account' : 'Credit Account'}</Label>
                            <Select value={line.accountId} onChange={e => {
                              const acc = localGL.find(a => a.id === e.target.value);
                              const newLines = [...jeLines];
                              newLines[idx] = { ...newLines[idx], accountId: e.target.value, accountCode: acc?.code || '', accountName: acc?.name || '' };
                              setJeLines(newLines);
                            }}>
                              <option value="">Select account...</option>
                              {localGL.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                            </Select>
                          </div>
                          <div>
                            <Label>Debit</Label>
                            <Input type="number" placeholder="0.00" value={line.debit || ''} onChange={e => { const newLines = [...jeLines]; newLines[idx] = { ...newLines[idx], debit: Number(e.target.value) }; setJeLines(newLines); }} />
                          </div>
                          <div>
                            <Label>Credit</Label>
                            <Input type="number" placeholder="0.00" value={line.credit || ''} onChange={e => { const newLines = [...jeLines]; newLines[idx] = { ...newLines[idx], credit: Number(e.target.value) }; setJeLines(newLines); }} />
                          </div>
                          <div>
                            <button onClick={() => { if (jeLines.length > 2) setJeLines(jeLines.filter((_, i) => i !== idx)); }} className="data-value-small text-rose-500 hover:text-rose-700 cursor-pointer mb-1"><i className="bi bi-trash"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setJeLines([...jeLines, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }])} className="mt-3 data-value-small text-slate-500 hover:text-slate-900 cursor-pointer">+ Add Line Item</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold">
                    <span className="text-slate-600">Totals</span>
                    <div className="flex gap-4">
                      <span className="font-sans tabular-nums text-emerald-600">DR: ${jeLines.reduce((s, l) => s + (l.debit || 0), 0).toLocaleString()}</span>
                      <span className="font-sans tabular-nums text-rose-600">CR: ${jeLines.reduce((s, l) => s + (l.credit || 0), 0).toLocaleString()}</span>
                      {Math.abs(jeLines.reduce((s, l) => s + (l.debit || 0), 0) - jeLines.reduce((s, l) => s + (l.credit || 0), 0)) < 0.01 ? <span className="text-emerald-600"><i className="bi bi-check-circle"></i> Balanced</span> : <span className="text-rose-600"><i className="bi bi-exclamation-circle"></i> Unbalanced</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <PrimaryBtn icon="bi bi-check-circle" onClick={() => {
                      if (!jeDescription) return alert('Description required');
                      if (Math.abs(jeLines.reduce((s, l) => s + (l.debit || 0), 0) - jeLines.reduce((s, l) => s + (l.credit || 0), 0)) > 0.01) return alert('Debit and credit must be equal');
                      const assigneeEmp = localEmployees.find(e => e.userId === jeAssignee || e.id === jeAssignee);
                      onCreateJournalEntry({ date: jeDate, description: jeDescription, reference: jeReference, lines: jeLines, createdBy: jeAssignee || selectedUser.id, createdByName: assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name });
                      setJeDescription(''); setJeReference(''); setJeAssignee(''); setJeLines([{ accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }]);
                    }}>Create Entry</PrimaryBtn>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
                <h3 className="section-title text-slate-500 mb-4">Journal Entries</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {localJournalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <div key={entry.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="data-value text-slate-800">{entry.entryNumber}</div>
                        <Badge label={entry.status} variant={entry.status === 'Approved' ? 'success' : entry.status === 'Posted' ? 'info' : entry.status === 'Void' ? 'danger' : 'warning'} />
                      </div>
                      <div className="data-value-small text-slate-600 mb-1">{entry.description}</div>
                      <div className="data-value-small text-slate-400 mb-2">{entry.date} {entry.reference && `| Ref: ${entry.reference}`}</div>
                      <div className="flex gap-4 mb-2">
                        <span className="data-value-small font-sans tabular-nums text-emerald-600">DR: ${entry.totalDebit.toLocaleString()}</span>
                        <span className="data-value-small font-sans tabular-nums text-rose-600">CR: ${entry.totalCredit.toLocaleString()}</span>
                      </div>
                      {entry.status === 'Draft' && <div className="flex gap-2"><button onClick={() => onPostJournalEntry(entry.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-800">Post</button></div>}
                      {entry.status === 'Posted' && <div className="flex gap-2"><button onClick={() => onApproveJournalEntry(entry.id)} className="data-value-small font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-emerald-700">Approve</button><button onClick={() => onVoidJournalEntry(entry.id)} className="data-value-small font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-50">Void</button></div>}
                    </div>
                  ))}
                  {localJournalEntries.length === 0 && <EmptyRow cols={1} message="No journal entries yet." />}
                </div>
              </div>
            </div>
          </>
        )}

        {accTab === 'trial' && (
          <>
            <PageHeader title="Trial Balance" subtitle="Verify that total debits equal total credits across all accounts." />
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <StatCard label="Total Debits" value={`$${totalDebits.toLocaleString()}`} icon="bi bi-arrow-down-circle" sub="Sum of all debit balances" accent />
              <StatCard label="Total Credits" value={`$${totalCredits.toLocaleString()}`} icon="bi bi-arrow-up-circle" sub="Sum of all credit balances" color="text-emerald-600" />
            </div>
            {Math.abs(totalDebits - totalCredits) > 0.01 && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold"><i className="bi bi-exclamation-triangle mr-1"></i> Trial balance is NOT balanced! Difference: ${Math.abs(totalDebits - totalCredits).toLocaleString()}</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Account Code' }, { label: 'Account Name' }, { label: 'Type' }, { label: 'Debit', right: true }, { label: 'Credit', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localGL.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{acc.code}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{acc.name}</td>
                      <td className="px-4 py-3"><Badge label={acc.type} variant={acc.type === 'Revenue' ? 'success' : acc.type === 'Expense' ? 'danger' : acc.type === 'Asset' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{(acc.type === 'Asset' || acc.type === 'Expense') ? `$${acc.balance.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{(acc.type === 'Liability' || acc.type === 'Revenue' || acc.type === 'Equity') ? `$${acc.balance.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900" colSpan={3}>TOTAL</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${totalDebits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${totalCredits.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'reports' && (
          <>
            <PageHeader title="Financial Reports" subtitle="Generate balance sheets, income statements and cash flow reports." />
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Balance Sheet</h3>
                <div className="space-y-2 text-xs">
                  {['Asset', 'Liability', 'Equity'].map(type => {
                    const typeAccounts = localGL.filter(a => a.type === type);
                    const typeTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
                    return (
                      <div key={type} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">{type}s</span>
                        <span className="font-sans tabular-nums font-semibold text-slate-900">${typeTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Income Statement</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Revenue</span><span className="font-sans tabular-nums font-semibold text-emerald-600">+${(revAcc?.balance ?? 0).toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Expenses</span><span className="font-sans tabular-nums font-semibold text-rose-600">-${totalExpenses.toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 font-bold"><span className="text-slate-900">Net Income</span><span className="font-sans tabular-nums text-slate-900">${((revAcc?.balance ?? 0) - totalExpenses).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Balance Sheet', desc: 'Assets, liabilities and equity snapshot', icon: 'bi bi-bank' },
                { title: 'Income Statement', desc: 'Revenue, expenses and profitability', icon: 'bi bi-graph-up' },
                { title: 'Cash Flow Statement', desc: 'Operating, investing and financing activities', icon: 'bi bi-cash-coin' },
                { title: 'Trial Balance', desc: 'Debit and credit account balances', icon: 'bi bi-file-earmark-spreadsheet' },
                { title: 'Aged Receivables', desc: 'Outstanding invoices by aging period', icon: 'bi bi-clock-history' },
                { title: 'Expense Analysis', desc: 'Expense breakdown by category', icon: 'bi bi-pie-chart' },
              ].map((report, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 hover:border-slate-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><i className={`bi ${report.icon} text-slate-600`}></i></div>
                    <div><div className="data-value font-semibold text-slate-900">{report.title}</div><div className="data-value-small text-slate-500">{report.desc}</div></div>
                  </div>
                  <button className="w-full data-value-small font-semibold bg-slate-900 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Generate Report</button>
                </div>
              ))}
            </div>
          </>
        )}

        {accTab === 'opening-balances' && (
          <>
            <PageHeader title="Opening Balances" subtitle="Set opening balances for accounts at the start of a fiscal period." />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 mb-6">
              <h3 className="section-title text-slate-500 mb-4">Set Opening Balance</h3>
              <div className="grid gap-4 sm:grid-cols-4 items-end">
                <div><Label>Account</Label><Select onChange={e => {
                  const acc = localGL.find(a => a.id === e.target.value);
                  if (acc) { setGlFormCode(acc.code); setGlFormName(acc.name); }
                }}><option value="">Select...</option>{localGL.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}</Select></div>
                <div><Label>Period</Label><Select onChange={e => setJeReference(e.target.value)}><option value="">Select...</option>{localFiscalPeriods.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</Select></div>
                <div><Label>Debit</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Credit</Label><Input type="number" placeholder="0.00" /></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Account Code' }, { label: 'Account Name' }, { label: 'Period' }, { label: 'Debit', right: true }, { label: 'Credit', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localOpeningBalances.map(ob => (
                    <tr key={ob.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{ob.accountCode}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{ob.accountName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{localFiscalPeriods.find(f => f.id === ob.periodId)?.name || ob.periodId}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{ob.debit > 0 ? `$${ob.debit.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{ob.credit > 0 ? `$${ob.credit.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                  {localOpeningBalances.length === 0 && <EmptyRow cols={5} message="No opening balances set." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'fiscal-periods' && (
          <>
            <PageHeader title="Fiscal Periods" subtitle="Manage fiscal year periods, close periods and lock transactions." />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Period' }, { label: 'Start Date' }, { label: 'End Date' }, { label: 'Status' }, { label: 'Closed By' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localFiscalPeriods.map(fp => (
                    <tr key={fp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{fp.name}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{fp.startDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{fp.endDate}</td>
                      <td className="px-4 py-3"><Badge label={fp.status} variant={fp.status === 'Closed' ? 'default' : fp.status === 'Locked' ? 'danger' : 'success'} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fp.closedBy ? 'David Vance' : '-'}</td>
                      <td className="px-4 py-3 text-right">{fp.status === 'Open' && <button onClick={() => { if (confirm(`Close ${fp.name}?`)) onCloseFiscalPeriod(fp.id); }} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Close Period</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Accounts Payable ─────────────────────────────────────── */}
        {activeView === 'acc-ap' && (
          <>
            <PageHeader title="Accounts Payable" subtitle="Manage vendor bills, approve payments and track aging." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowBillModal(true)}>New Bill</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Total Bills" value={localBills.length} icon="bi bi-receipt" />
              <StatCard label="Pending Approval" value={localBills.filter(b => b.status === 'Pending').length} icon="bi bi-hourglass" color="text-amber-600" />
              <StatCard label="Total Outstanding" value={`$${localBills.filter(b => b.status !== 'Paid' && b.status !== 'Void').reduce((s, b) => s + (b.total - b.amountPaid), 0).toLocaleString()}`} icon="bi bi-cash-stack" color="text-rose-600" />
              <StatCard label="Paid This Month" value={`$${localBillPayments.filter(p => p.paymentDate >= '2026-07-01').reduce((s, p) => s + p.amount, 0).toLocaleString()}`} icon="bi bi-check-circle" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Bill #' }, { label: 'Vendor' }, { label: 'Description' }, { label: 'Total' }, { label: 'Paid' }, { label: 'Due Date' }, { label: 'Status' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{bill.billNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{bill.vendorName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{bill.description}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${bill.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">${bill.amountPaid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{bill.dueDate}</td>
                      <td className="px-4 py-3"><Badge label={bill.status} variant={bill.status === 'Paid' ? 'success' : bill.status === 'Overdue' ? 'danger' : bill.status === 'Approved' ? 'info' : bill.status === 'Partially Paid' ? 'warning' : 'default'} /></td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {bill.status === 'Pending' && <button onClick={() => onApproveBill(bill.id)} className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-emerald-700">Approve</button>}
                        {(bill.status === 'Approved' || bill.status === 'Partially Paid') && <button onClick={() => { const amt = prompt(`Pay bill ${bill.billNumber}. Amount:`); if (amt) onPayBill(bill.id, Number(amt), 'Bank Transfer', 'ba-1'); }} className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-800">Pay</button>}
                      </td>
                    </tr>
                  ))}
                  {localBills.length === 0 && <EmptyRow cols={8} message="No bills recorded yet." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Accounts Receivable ───────────────────────────────────── */}
        {activeView === 'acc-ar' && (
          <>
            <PageHeader title="Accounts Receivable" subtitle="Track customer invoice payments and collections." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>Record Payment</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Outstanding AR" value={`$${localInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, i) => s + i.total, 0).toLocaleString()}`} icon="bi bi-hourglass-split" color="text-amber-600" />
              <StatCard label="Overdue" value={`$${localInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0).toLocaleString()}`} icon="bi bi-exclamation-triangle" color="text-rose-600" />
              <StatCard label="Collected This Month" value={`$${localCustomerPayments.filter(p => p.paymentDate >= '2026-07-01').reduce((s, p) => s + p.amount, 0).toLocaleString()}`} icon="bi bi-check-circle" color="text-emerald-600" />
              <StatCard label="Total Invoices" value={localInvoices.length} icon="bi bi-file-earmark-text" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Invoice #' }, { label: 'Customer' }, { label: 'Total' }, { label: 'Issue Date' }, { label: 'Due Date' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{inv.customerName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{inv.dueDate}</td>
                      <td className="px-4 py-3"><Badge label={inv.status} variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : inv.status === 'Sent' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">
                        {inv.status !== 'Paid' && inv.status !== 'Void' && <button onClick={() => { const amt = prompt(`Record payment for ${inv.invoiceNumber}. Amount:`); if (amt) onReceiveCustomerPayment({ invoiceId: inv.id, customerName: inv.customerName, amount: Number(amt), paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', bankAccountId: 'ba-1' }); }} className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-800">Receive Payment</button>}
                      </td>
                    </tr>
                  ))}
                  {localInvoices.length === 0 && <EmptyRow cols={7} message="No invoices found." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Bank Reconciliation ───────────────────────────────────── */}
        {accTab === 'bank' && (
          <>
            <PageHeader title="Bank & Reconciliation" subtitle="Manage bank accounts, view transactions and reconcile statements." />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              {localBankAccounts.map(ba => (
                <div key={ba.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{ba.accountType}</span>
                    <Badge label={ba.isActive ? 'Active' : 'Inactive'} variant={ba.isActive ? 'success' : 'default'} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 font-sans tabular-nums">${(ba.balance ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{ba.bankName} {ba.accountNumber}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ba.name}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recent Transactions</span>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Date' }, { label: 'Description' }, { label: 'Type' }, { label: 'Amount' }, { label: 'Reconciled' }, { label: 'Reference' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBankTransactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">{tx.date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{tx.description}</td>
                      <td className="px-4 py-3"><Badge label={tx.type} variant={tx.type === 'Credit' ? 'success' : 'danger'} /></td>
                      <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.type === 'Credit' ? '+' : '-'}${(tx.amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">{tx.reconciled ? <i className="bi bi-check-circle-fill text-emerald-500 text-sm"></i> : <i className="bi bi-circle text-slate-300 text-sm"></i>}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{tx.reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {localBankReconciliations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Reconciliation History</span>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Period' }, { label: 'Statement Balance' }, { label: 'Book Balance' }, { label: 'Difference' }, { label: 'Status' }, { label: 'Completed By' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localBankReconciliations.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500">{rec.periodStartDate} to {rec.periodEndDate}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(rec.statementBalance ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(rec.bookBalance ?? 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${Math.abs(rec.reconciledDifference ?? 0) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>${Math.abs(rec.reconciledDifference ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3"><Badge label={rec.status} variant={rec.status === 'Completed' ? 'success' : 'danger'} /></td>
                        <td className="px-4 py-3 text-xs text-slate-500">{resolveUserName(rec.completedBy || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Tier 2: Fixed Assets ──────────────────────────────────────────── */}
        {accTab === 'fixed-assets' && (
          <>
            <PageHeader title="Fixed Assets Register" subtitle="Track capital assets, run depreciation schedules and manage disposals." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>Register Asset</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Total Assets" value={localFixedAssets.length} icon="bi bi-collection" />
              <StatCard label="Total Book Value" value={`$${localFixedAssets.reduce((s, a) => s + (a.currentBookValue ?? 0), 0).toLocaleString()}`} icon="bi bi-cash-stack" />
              <StatCard label="Accumulated Depr." value={`$${localFixedAssets.reduce((s, a) => s + (a.accumulatedDepreciation ?? 0), 0).toLocaleString()}`} icon="bi bi-graph-down" color="text-rose-600" />
              <StatCard label="Pending Depreciation" value={localDepreciationEntries.filter(d => d.status === 'Draft').length} icon="bi bi-hourglass" color="text-amber-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Code' }, { label: 'Name' }, { label: 'Category' }, { label: 'Purchase Price' }, { label: 'Book Value' }, { label: 'Location' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localFixedAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900 font-mono">{asset.assetCode}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{asset.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{asset.category}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(asset.purchasePrice ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(asset.currentBookValue ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{asset.location}</td>
                      <td className="px-4 py-3"><Badge label={asset.status} variant={asset.status === 'Active' ? 'success' : asset.status === 'Disposed' ? 'danger' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">
                        {asset.status === 'Active' && <button onClick={() => { const price = prompt(`Dispose ${asset.name}. Disposal price:`); if (price !== null) onDisposeAsset(asset.id, Number(price)); }} className="text-[10px] font-semibold bg-rose-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-rose-700">Dispose</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {localDepreciationEntries.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Depreciation Schedule</span>
                  <PrimaryBtn icon="bi bi-play-circle" onClick={() => onRunDepreciation('August 2026')}>Run Depreciation</PrimaryBtn>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Asset' }, { label: 'Period' }, { label: 'Depreciation' }, { label: 'Accumulated' }, { label: 'Book Value' }, { label: 'Status' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localDepreciationEntries.slice(0, 10).map(de => (
                      <tr key={de.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{de.assetCode} - {de.assetName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{de.period}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600">${(de.depreciationAmount ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">${(de.accumulatedDepreciation ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(de.bookValue ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge label={de.status} variant={de.status === 'Posted' ? 'success' : 'warning'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Tier 2: Budgets ───────────────────────────────────────────────── */}
        {accTab === 'budgets' && (
          <>
            <PageHeader title="Budget Management" subtitle="Create budgets, track variances and approve allocations." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>New Budget</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <StatCard label="Total Budget" value={`$${localBudgets.reduce((s, b) => s + (b.budgetAmount ?? 0), 0).toLocaleString()}`} icon="bi bi-piggy-bank" />
              <StatCard label="Total Actual" value={`$${localBudgets.reduce((s, b) => s + (b.actualAmount ?? 0), 0).toLocaleString()}`} icon="bi bi-cash-stack" />
              <StatCard label="Overall Variance" value={`${localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0) >= 0 ? '+' : ''}$${localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0).toLocaleString()}`} icon="bi bi-graph-up" color={localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Budget' }, { label: 'Account' }, { label: 'Budget Amt' }, { label: 'Actual' }, { label: 'Variance' }, { label: '% Used' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBudgets.map(bud => {
                    const budgetAmt = bud.budgetAmount ?? 0;
                    const actualAmt = bud.actualAmount ?? 0;
                    const varianceAmt = bud.variance ?? (budgetAmt - actualAmt);
                    const pctUsed = budgetAmt > 0 ? Math.round(actualAmt / budgetAmt * 100) : 0;
                    return (
                      <tr key={bud.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{bud.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{bud.accountCode} - {bud.accountName}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${budgetAmt.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${actualAmt.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${varianceAmt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{varianceAmt >= 0 ? '+' : ''}${varianceAmt.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pctUsed > 90 ? 'bg-rose-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pctUsed, 100)}%` }}></div></div>
                            <span className="text-[10px] font-semibold text-slate-500">{pctUsed}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge label={bud.status} variant={bud.status === 'Active' ? 'success' : bud.status === 'Approved' ? 'info' : 'default'} /></td>
                        <td className="px-4 py-3 text-right">
                          {bud.status === 'Draft' && <button onClick={() => onApproveBudget(bud.id)} className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-emerald-700">Approve</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Cost Centers ──────────────────────────────────────────── */}
        {accTab === 'cost-centers' && (
          <>
            <PageHeader title="Cost Centers" subtitle="Departmental cost allocation and spending analysis." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>New Cost Center</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localCostCenters.map(cc => {
                const ccBudget = cc.budget ?? 0;
                const ccActual = cc.actualSpend ?? 0;
                const pctUsed = ccBudget > 0 ? Math.round(ccActual / ccBudget * 100) : 0;
                return (
                  <div key={cc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 tracking-wide">{cc.code}</span>
                      <Badge label={cc.status} variant={cc.status === 'Active' ? 'success' : 'default'} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{cc.name}</h3>
                    <p className="text-[10px] text-slate-400 mb-3">{cc.departmentName} · {cc.managerName}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Budget</span><span className="font-sans tabular-nums font-semibold text-slate-900">${ccBudget.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Actual Spend</span><span className="font-sans tabular-nums font-semibold text-slate-900">${ccActual.toLocaleString()}</span></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pctUsed > 90 ? 'bg-rose-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pctUsed, 100)}%` }}></div></div>
                      <div className="flex justify-between text-[10px]"><span className="text-slate-400">{pctUsed}% utilized</span><span className={`font-semibold ${ccBudget - ccActual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{ccBudget - ccActual >= 0 ? `$${(ccBudget - ccActual).toLocaleString()} remaining` : `$${Math.abs(ccBudget - ccActual).toLocaleString()} over budget`}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Tier 2: Multi-Currency ────────────────────────────────────────── */}
        {accTab === 'multi-currency' && (
          <>
            <PageHeader title="Multi-Currency Management" subtitle="Exchange rates, currency conversion and gain/loss tracking." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localCurrencyRates.map(cr => (
                <div key={cr.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 tracking-wide">{cr.baseCurrency} / {cr.targetCurrency}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold">{cr.source}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-sans tabular-nums">{cr.rate}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Effective: {cr.effectiveDate}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-lg">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Quick Conversion</h3>
              <div className="grid gap-4 sm:grid-cols-3 items-end">
                <div><Label>Amount</Label><Input type="number" defaultValue="10000" id="conv-amount" /></div>
                <div><Label>From</Label><Select id="conv-from"><option>USD</option><option>EUR</option><option>GBP</option></Select></div>
                <div><Label>To</Label><Select id="conv-to"><option>EUR</option><option>USD</option><option>GBP</option></Select></div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between">
                <span className="text-slate-600 font-semibold">Converted Amount</span>
                <span className="font-sans tabular-nums text-slate-900 font-bold">—</span>
              </div>
            </div>
          </>
        )}

        {/* ── Tier 3: Tax Management ────────────────────────────────────────── */}
        {accTab === 'tax' && (
          <>
            <PageHeader title="Tax Management" subtitle="Tax codes, rates, and jurisdiction configuration." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localTaxCodes.map(tc => (
                <div key={tc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 tracking-wide">{tc.code}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tc.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>{tc.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{tc.name}</p>
                  <p className="text-2xl font-bold text-slate-900 font-sans tabular-nums">{tc.rate}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">{tc.jurisdiction} · {tc.type}</p>
                  <p className="text-[10px] text-slate-400">Account: {tc.accountName}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {accTab === 'tax-returns' && (
          <>
            <PageHeader title="Tax Returns" subtitle="File, track, and manage tax returns across jurisdictions." />
            <div className="space-y-3 mb-6">
              {localTaxReturns.map(tr => (
                <div key={tr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tr.type} Return — {tr.period}</h3>
                      <p className="text-[10px] text-slate-400">{tr.jurisdiction} · Due {tr.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tr.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        tr.status === 'Draft' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{tr.status}</span>
                      {tr.status === 'Draft' && <PrimaryBtn onClick={() => onFileTaxReturn(tr.id)} icon="bi bi-send">File</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Taxable Income</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.taxableIncome ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Tax Due</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.taxDue ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Credits</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.credits ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Net Payable</span><span className="font-sans tabular-nums font-bold text-slate-900">${(tr.netPayable ?? 0).toLocaleString()}</span></div>
                  </div>
                  {tr.filedDate && <p className="text-[10px] text-slate-400 mt-2">Filed {tr.filedDate} by {tr.filedBy}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Intercompany ────────────────────────────────────────── */}
        {accTab === 'intercompany' && (
          <>
            <PageHeader title="Intercompany Transactions" subtitle="Track and reconcile transactions between group entities." />
            <div className="space-y-3 mb-6">
              {localIntercompanyTxns.map(tx => (
                <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tx.description}</h3>
                      <p className="text-[10px] text-slate-400">{tx.type} · {tx.fromCompanyName} → {tx.toCompanyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        tx.status === 'Eliminated' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{tx.status}</span>
                      {tx.status === 'Pending' && <PrimaryBtn onClick={() => onApproveIntercompanyTxn(tx.id)} icon="bi bi-check-lg">Approve</PrimaryBtn>}
                      {tx.status === 'Approved' && <PrimaryBtn onClick={() => onEliminateIntercompanyTxn(tx.id)} icon="bi bi-arrow-left-right">Eliminate</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Amount</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tx.amount ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Currency</span><span className="font-semibold text-slate-900">{tx.currency}</span></div>
                    <div><span className="text-slate-500 block">Date</span><span className="font-semibold text-slate-900">{tx.date}</span></div>
                  </div>
                  {tx.eliminationEntryId && <p className="text-[10px] text-slate-400 mt-2">Elimination Entry: {tx.eliminationEntryId}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Consolidation ────────────────────────────────────────── */}
        {accTab === 'consolidation' && (
          <>
            <PageHeader title="Consolidation Rules" subtitle="Group-level rules for combining subsidiary financials." />
            <div className="space-y-3 mb-6">
              {localConsolidationRules.map(rule => (
                <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${rule.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>{rule.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{rule.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Parent Account</span><span className="font-semibold text-slate-900">{rule.parentAccountName}</span></div>
                    <div><span className="text-slate-500 block">Method</span><span className="font-semibold text-slate-900">{rule.method}</span></div>
                    <div><span className="text-slate-500 block">Subsidiaries</span><span className="font-semibold text-slate-900">{rule.subsidiaryIds?.length ?? 0} entities</span></div>
                  </div>
                  {rule.intercompanyEliminationAccountId && <p className="text-[10px] text-slate-400 mt-2">Elimination Account: {rule.intercompanyEliminationAccountId}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Compliance ────────────────────────────────────────── */}
        {accTab === 'compliance' && (
          <>
            <PageHeader title="Compliance Dashboard" subtitle="Track regulatory and policy compliance across the organization." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowComplianceModal(true)}>New Check</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localComplianceChecks.map(cc => (
                <div key={cc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold">{cc.category}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${cc.status === 'Pass' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      cc.status === 'Fail' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{cc.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{cc.checkName}</h3>
                  <p className="text-[10px] text-slate-400 mb-3">{cc.description}</p>
                  <p className="text-[10px] text-slate-400">Assigned: {resolveUserName(cc.assignee)} · Due: {cc.dueDate}</p>
                  {cc.status !== 'Pass' && <div className="mt-3"><PrimaryBtn onClick={() => onResolveComplianceCheck(cc.id, 'Pass')} icon="bi bi-check-lg">Mark Resolved</PrimaryBtn></div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Audit Trail ────────────────────────────────────────── */}
        {accTab === 'audit-trail' && (
          <>
            <PageHeader title="Audit Trail" subtitle="Immutable snapshot log of all financial data changes." />
            <div className="space-y-2 mb-6">
              {localAuditSnapshots.map(as_ => (
                <div key={as_.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${as_.action === 'Create' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        as_.action === 'Update' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>{as_.action}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{as_.entityName}</h4>
                        <p className="text-[10px] text-slate-400">{as_.entityType} · {as_.performedByName} · {as_.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {as_.oldValue !== undefined && as_.oldValue !== null && <p className="text-[10px] text-rose-500 line-through font-sans tabular-nums">{typeof as_.oldValue === 'number' ? `$${as_.oldValue.toLocaleString()}` : String(as_.oldValue)}</p>}
                      {as_.newValue !== undefined && as_.newValue !== null && <p className="text-[10px] text-emerald-600 font-bold font-sans tabular-nums">{typeof as_.newValue === 'number' ? `$${as_.newValue.toLocaleString()}` : String(as_.newValue)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Policy Documents ────────────────────────────────────── */}
        {accTab === 'policies' && (
          <>
            <PageHeader title="Policy Documents" subtitle="Manage and track acknowledgment of accounting policies." />
            <div className="space-y-3 mb-6">
              {localPolicyDocuments.map(pd => (
                <div key={pd.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{pd.title}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${pd.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      pd.status === 'Archived' ? 'bg-slate-50 text-slate-400 border border-slate-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{pd.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{pd.content}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Category</span><span className="font-semibold text-slate-900">{pd.category}</span></div>
                    <div><span className="text-slate-500 block">Version</span><span className="font-semibold text-slate-900">{pd.version}</span></div>
                    <div><span className="text-slate-500 block">Acknowledged</span><span className="font-semibold text-slate-900">{pd.acknowledgedBy?.length ?? 0}/{pd.requiresAcknowledgmentFrom?.length ?? 0}</span></div>
                  </div>
                  {(pd.requiresAcknowledgmentFrom?.length ?? 0) > 0 && (
                    <div className="mt-3"><PrimaryBtn onClick={() => onAcknowledgePolicy(pd.id, employees[0]?.id || '')} icon="bi bi-check2-square">Acknowledge</PrimaryBtn></div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Filing Deadlines ────────────────────────────────────── */}
        {accTab === 'filing-deadlines' && (
          <>
            <PageHeader title="Filing Deadlines" subtitle="Track upcoming statutory and regulatory filing deadlines." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowFilingModal(true)}>New Deadline</PrimaryBtn>} />
            <div className="space-y-3 mb-6">
              {localFilingDeadlines.map(fd => (
                <div key={fd.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{fd.title}</h3>
                      <p className="text-[10px] text-slate-400">{fd.type} · {fd.jurisdiction} · Due {fd.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${fd.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        fd.status === 'Missed' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{fd.status}</span>
                      {fd.status === 'Pending' && <PrimaryBtn onClick={() => onFileDeadline(fd.id)} icon="bi bi-send">File</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Assigned To</span><span className="font-semibold text-slate-900">{resolveUserName(fd.assignee)}</span></div>
                    <div><span className="text-slate-500 block">Related Return</span><span className="font-semibold text-slate-900">{fd.relatedTaxReturnId || '—'}</span></div>
                    <div><span className="text-slate-500 block">Description</span><span className="font-semibold text-slate-900">{fd.description}</span></div>
                  </div>
                  {fd.filedDate && <p className="text-[10px] text-slate-400 mt-2">Filed {fd.filedDate} by {resolveUserName(fd.filedBy || '')}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Advanced Reports ────────────────────────────────────── */}
        {accTab === 'reports-pl' && (
          <>
            <PageHeader title="Profit & Loss Statement" subtitle="Income statement for the current period." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">Period: Current Fiscal Year · {selectedCompany.name}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Revenue</span><span className="font-sans tabular-nums font-bold text-emerald-600">$1,250,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Cost of Goods Sold</span><span className="font-sans tabular-nums font-bold text-slate-900">($480,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-semibold text-slate-900">Gross Profit</span><span className="font-sans tabular-nums font-bold text-slate-900">$770,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Operating Expenses</span><span className="font-sans tabular-nums font-bold text-slate-900">($420,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-semibold text-slate-900">Operating Income</span><span className="font-sans tabular-nums font-bold text-slate-900">$350,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Other Income/Expense</span><span className="font-sans tabular-nums font-bold text-slate-900">($12,000)</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Income Tax</span><span className="font-sans tabular-nums font-bold text-slate-900">($84,500)</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Net Income</span><span className="font-sans tabular-nums font-bold text-slate-900">$253,500</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-bs' && (
          <>
            <PageHeader title="Balance Sheet" subtitle="Assets, liabilities, and equity as of today." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">As of {new Date().toLocaleDateString()} · {selectedCompany.name}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Assets</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Cash & Equivalents</span><span className="font-sans tabular-nums font-semibold text-slate-900">$425,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Accounts Receivable</span><span className="font-sans tabular-nums font-semibold text-slate-900">$185,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Inventory</span><span className="font-sans tabular-nums font-semibold text-slate-900">$320,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Fixed Assets (net)</span><span className="font-sans tabular-nums font-semibold text-slate-900">$580,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Assets</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,510,000</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Liabilities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Accounts Payable</span><span className="font-sans tabular-nums font-semibold text-slate-900">$95,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Deferred Revenue</span><span className="font-sans tabular-nums font-semibold text-slate-900">$45,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Long-term Debt</span><span className="font-sans tabular-nums font-semibold text-slate-900">$300,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Liabilities</span><span className="font-sans tabular-nums font-bold text-slate-900">$440,000</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Equity</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Share Capital</span><span className="font-sans tabular-nums font-semibold text-slate-900">$500,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Retained Earnings</span><span className="font-sans tabular-nums font-semibold text-slate-900">$570,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Equity</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,070,000</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Total Liabilities + Equity</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,510,000</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-cf' && (
          <>
            <PageHeader title="Cash Flow Statement" subtitle="Operating, investing, and financing cash flows." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">Period: Current Fiscal Year · {selectedCompany.name}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Operating Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Net Income</span><span className="font-sans tabular-nums font-semibold text-slate-900">$253,500</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Depreciation</span><span className="font-sans tabular-nums font-semibold text-slate-900">$48,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Change in Working Capital</span><span className="font-sans tabular-nums font-semibold text-slate-900">($32,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Operations</span><span className="font-sans tabular-nums font-bold text-slate-900">$269,500</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Investing Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Capital Expenditures</span><span className="font-sans tabular-nums font-semibold text-slate-900">($120,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Investing</span><span className="font-sans tabular-nums font-bold text-slate-900">($120,000)</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Financing Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Debt Repayment</span><span className="font-sans tabular-nums font-semibold text-slate-900">($50,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Financing</span><span className="font-sans tabular-nums font-bold text-slate-900">($50,000)</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Net Change in Cash</span><span className="font-sans tabular-nums font-bold text-slate-900">$99,500</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-aging' && (
          <>
            <PageHeader title="Accounts Receivable Aging" subtitle="Outstanding receivables broken down by age." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-500 font-semibold">Customer</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">Current</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">1-30 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">31-60 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">61-90 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">90+ Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Acme Corp</td><td className="text-right font-sans tabular-nums">$24,500</td><td className="text-right font-sans tabular-nums">$12,000</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums font-bold">$36,500</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Globex Inc</td><td className="text-right font-sans tabular-nums">$18,200</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$8,500</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums font-bold">$26,700</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Wayne Enterprises</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$42,000</td><td className="text-right font-sans tabular-nums">$15,000</td><td className="text-right font-sans tabular-nums font-bold">$57,000</td></tr>
                  <tr className="border-t-2 border-slate-900 font-bold"><td className="py-2 text-slate-900">Total</td><td className="text-right font-sans tabular-nums">$42,700</td><td className="text-right font-sans tabular-nums">$12,000</td><td className="text-right font-sans tabular-nums">$8,500</td><td className="text-right font-sans tabular-nums">$42,000</td><td className="text-right font-sans tabular-nums">$15,000</td><td className="text-right font-sans tabular-nums">$120,200</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'create' && (
          <div className="max-w-lg">
            {invSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Invoice created successfully!</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">New Invoice</h3>
              <form onSubmit={e => { e.preventDefault(); if (!invClient) return; onAddInvoice({ companyId: selectedCompany.id, customerName: invClient, customerId: `cust-${Date.now()}`, subtotal: Number(invSubtotal), tax: Number(invTax), total: Number(invSubtotal) + Number(invTax), dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }); setInvSuccess(true); setInvClient(''); setTimeout(() => setInvSuccess(false), 3000); }} className="space-y-4">
                <div><Label>Client Name *</Label><Input value={invClient} onChange={e => setInvClient(e.target.value)} placeholder="Acme Corporation" required /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Subtotal (USD)</Label><Input type="number" value={invSubtotal} onChange={e => setInvSubtotal(e.target.value)} /></div>
                  <div><Label>Tax Amount</Label><Input type="number" value={invTax} onChange={e => setInvTax(e.target.value)} /></div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between font-semibold"><span className="text-slate-600">Total Amount</span><span className="font-sans tabular-nums text-slate-900">${(Number(invSubtotal) + Number(invTax)).toLocaleString()}</span></div>
                <PrimaryBtn icon="bi bi-file-earmark-plus">Create Invoice</PrimaryBtn>
              </form>
            </div>
          </div>
        )}

        {/* GL Account Modal */}
        {showGLModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">{editingGLAccount ? 'Edit Account' : 'New GL Account'}</h2>
              <div className="space-y-4">
                <div><Label>Account Code</Label><Input value={glFormCode} onChange={e => setGlFormCode(e.target.value)} placeholder="1010" disabled={!!editingGLAccount} /></div>
                <div><Label>Account Name</Label><Input value={glFormName} onChange={e => setGlFormName(e.target.value)} placeholder="Operating Cash Account" /></div>
                <div><Label>Account Type</Label><Select value={glFormType} onChange={e => setGlFormType(e.target.value)}><option value="Asset">Asset</option><option value="Liability">Liability</option><option value="Equity">Equity</option><option value="Revenue">Revenue</option><option value="Expense">Expense</option></Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowGLModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={() => {
                  if (!glFormCode || !glFormName) return alert('Code and name required');
                  if (editingGLAccount) { onUpdateGLAccount(editingGLAccount.id, { name: glFormName, type: glFormType }); }
                  else { onAddGLAccount({ code: glFormCode, name: glFormName, type: glFormType }); }
                  setShowGLModal(false);
                }}>{editingGLAccount ? 'Save Changes' : 'Create Account'}</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Expense</h2>
              <div className="space-y-4">
                <div><Label>Description</Label><Input value={expFormDesc} onChange={e => setExpFormDesc(e.target.value)} placeholder="Office supplies purchase" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Category</Label><Select value={expFormCategory} onChange={e => setExpFormCategory(e.target.value)}><option>Office Supplies</option><option>Software & IT</option><option>Payroll</option><option>Utilities</option><option>Marketing</option><option>Travel</option><option>Insurance</option><option>Maintenance</option></Select></div>
                  <div><Label>Department</Label><Select value={expFormDept} onChange={e => setExpFormDept(e.target.value)}><option>Operations</option><option>IT</option><option>HR</option><option>Sales</option><option>Finance</option></Select></div>
                </div>
                <div><Label>Submitted By</Label><Select value={expFormAssignee || ''} onChange={e => setExpFormAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                <div><Label>Amount (USD)</Label><Input type="number" value={expFormAmount} onChange={e => setExpFormAmount(e.target.value)} placeholder="0.00" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowExpenseModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={() => {
                  if (!expFormDesc || !expFormAmount) return alert('Description and amount required');
                  const assigneeEmp = localEmployees.find(e => e.userId === expFormAssignee || e.id === expFormAssignee);
                  onAddExpense!({ description: expFormDesc, category: expFormCategory, department: expFormDept, amount: Number(expFormAmount), createdBy: expFormAssignee || selectedUser.id });
                  setShowExpenseModal(false); setExpFormDesc(''); setExpFormAmount(''); setExpFormAssignee('');
                }}>Create Expense</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Bill Modal */}
        {showBillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Vendor Bill</h2>
              <div className="space-y-4">
                <div><Label>Vendor Name *</Label><Input value={billVendor} onChange={e => setBillVendor(e.target.value)} placeholder="Acme Supplies Inc." required /></div>
                <div><Label>Description</Label><Input value={billDesc} onChange={e => setBillDesc(e.target.value)} placeholder="Monthly office supplies" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Amount (USD) *</Label><Input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" required /></div>
                  <div><Label>Due Date *</Label><Input type="date" value={billDueDate} onChange={e => setBillDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Prepared By</Label><Select value={billAssignee} onChange={e => setBillAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowBillModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!billVendor || !billAmount || !billDueDate) return alert('Vendor, amount, and due date required');
                  const assigneeEmp = localEmployees.find(e => e.userId === billAssignee || e.id === billAssignee);
                  onCreateBill({ companyId: selectedCompany.id, vendorName: billVendor, description: billDesc, total: Number(billAmount), amountPaid: 0, dueDate: billDueDate, status: 'Pending', createdBy: billAssignee || selectedUser.id, createdByName: assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name });
                  setShowBillModal(false); setBillVendor(''); setBillDesc(''); setBillAmount(''); setBillDueDate(''); setBillAssignee('');
                }}>Create Bill</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Check Modal */}
        {showComplianceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Compliance Check</h2>
              <div className="space-y-4">
                <div><Label>Check Name *</Label><Input value={compCheckName} onChange={e => setCompCheckName(e.target.value)} placeholder="SOX 404 Internal Controls" required /></div>
                <div><Label>Description</Label><Input value={compCheckDesc} onChange={e => setCompCheckDesc(e.target.value)} placeholder="Annual compliance verification" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Category</Label><Select value={compCheckCategory} onChange={e => setCompCheckCategory(e.target.value)}><option>Financial</option><option>Tax</option><option>Data Privacy</option><option>Industry</option><option>Environmental</option></Select></div>
                  <div><Label>Due Date *</Label><Input type="date" value={compCheckDueDate} onChange={e => setCompCheckDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Assigned To *</Label><Select value={compCheckAssignee} onChange={e => setCompCheckAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowComplianceModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!compCheckName || !compCheckDueDate || !compCheckAssignee) return alert('Name, due date, and assignee required');
                  const assigneeEmp = localEmployees.find(e => e.userId === compCheckAssignee || e.id === compCheckAssignee);
                  // Add to local state (in real app would POST to API)
                  setShowComplianceModal(false); setCompCheckName(''); setCompCheckDesc(''); setCompCheckDueDate(''); setCompCheckAssignee('');
                }}>Create Check</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Filing Deadline Modal */}
        {showFilingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Filing Deadline</h2>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={filingName} onChange={e => setFilingName(e.target.value)} placeholder="Q2 Corporate Tax Return" required /></div>
                <div><Label>Description</Label><Input value={filingDesc} onChange={e => setFilingDesc(e.target.value)} placeholder="Quarterly tax filing" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Type</Label><Select value={filingType} onChange={e => setFilingType(e.target.value)}><option>Tax Return</option><option>Annual Report</option><option>Regulatory Filing</option><option>Audit Report</option></Select></div>
                  <div><Label>Due Date *</Label><Input type="date" value={filingDueDate} onChange={e => setFilingDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Assigned To *</Label><Select value={filingAssignee} onChange={e => setFilingAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowFilingModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!filingName || !filingDueDate || !filingAssignee) return alert('Title, due date, and assignee required');
                  const assigneeEmp = localEmployees.find(e => e.userId === filingAssignee || e.id === filingAssignee);
                  // Add to local state (in real app would POST to API)
                  setShowFilingModal(false); setFilingName(''); setFilingDesc(''); setFilingDueDate(''); setFilingAssignee('');
                }}>Create Deadline</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. SALES
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView.startsWith('sales')) {
    const totalRevenue = salesOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0);
    return (
      <div>
        <PageHeader title="Sales & Order Management" subtitle="Manage sales orders, quotations, customer accounts and territory performance." />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total Orders" value={salesOrders.length} icon="bi bi-cart" sub="All sales orders" />
          <StatCard label="Revenue Closed" value={`$${totalRevenue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Completed order total" accent />
          <StatCard label="Processing" value={salesOrders.filter(o => o.status === 'Processing').length} icon="bi bi-hourglass-split" sub="Orders in progress" />
          <StatCard label="Pending" value={salesOrders.filter(o => o.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting confirmation" />
        </div>
        {salesTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Order ID' }, { label: 'Client' }, { label: 'Items' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {salesOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{o.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{o.client}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{o.items}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{o.date}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${o.total.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={o.status} variant={o.status === 'Completed' ? 'success' : o.status === 'Processing' ? 'info' : 'warning'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {salesTab === 'quotes' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 text-center">
            <i className="bi bi-file-earmark-check text-3xl text-slate-300 block mb-2"></i>
            <p className="text-xs text-slate-400">No open quotations. Create a quotation from a qualified CRM lead.</p>
            <button className="mt-4 text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">New Quotation</button>
          </div>
        )}
        {salesTab === 'customers' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Customer' }, { label: 'Orders' }, { label: 'Total Spend', right: true }, { label: 'Last Order' }, { label: 'Segment' }]} />
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Alpha Biotech Group', orders: 5, spend: 42000, last: '2026-07-06', segment: 'Enterprise' },
                  { name: 'Beta Robotics LLC', orders: 3, spend: 68500, last: '2026-07-08', segment: 'Enterprise' },
                  { name: 'Gamma Pharma Inc.', orders: 8, spend: 31200, last: '2026-07-09', segment: 'Mid-Market' },
                ].map(c => (
                  <tr key={c.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{c.orders}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${c.spend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{c.last}</td>
                    <td className="px-4 py-3"><Badge label={c.segment} variant={c.segment === 'Enterprise' ? 'info' : 'default'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {salesTab === 'targets' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Quota Attainment" value="74%" icon="bi bi-bullseye" sub="vs. $180k monthly target" accent />
              <StatCard label="Revenue Closed" value={`$${salesOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0).toLocaleString()}`} icon="bi bi-graph-up" sub="This month" color="text-emerald-600" />
              <StatCard label="Remaining" value="$46,850" icon="bi bi-flag" sub="To hit monthly target" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="section-title text-slate-500 mb-5">Rep Performance vs Quota</h3>
              <div className="space-y-4">
                {[
                  { rep: 'Ayasha Chen', quota: 60000, achieved: 48200, region: 'North East' },
                  { rep: 'Markus Vance', quota: 55000, achieved: 51000, region: 'Mid-West' },
                  { rep: 'Jin Li', quota: 65000, achieved: 34000, region: 'West Coast' },
                ].map(r => {
                  const pct = Math.round((r.achieved / r.quota) * 100);
                  return (
                    <div key={r.rep}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div><span className="table-cell-semibold text-slate-900">{r.rep}</span><span className="data-value-small text-slate-400 ml-2">{r.region}</span></div>
                        <div className="text-right"><span className="table-cell-mono font-bold text-slate-900">${r.achieved.toLocaleString()}</span><span className="data-value-small text-slate-400 ml-1">/ ${r.quota.toLocaleString()}</span></div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className="data-value-small text-slate-400 mt-1">{pct}% of quota</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. INVENTORY
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'inventory' || activeView.startsWith('inv-')) {
    const lowStock = localStock.filter(i => i.stockLevel <= i.minStockLevel);
    const totalVal = localStock.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0);
    const filteredStock = localStock.filter(i => i.name.toLowerCase().includes(invSearch.toLowerCase()) || i.sku.toLowerCase().includes(invSearch.toLowerCase()));
    return (
      <div>
        <PageHeader title="Inventory & Stock Control" subtitle="Monitor stock levels, manage warehouses, process adjustments and set reorder alerts." />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Stock Valuation" value={`$${totalVal.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total warehoused value" />
          <StatCard label="SKU Count" value={localStock.length} icon="bi bi-box-seam" sub="Distinct products" />
          <StatCard label="Low Stock" value={lowStock.length} icon="bi bi-exclamation-triangle" sub="Below safety threshold" accent />
          <StatCard label="Warehouses" value={[...new Set(localStock.map(i => i.warehouse))].length} icon="bi bi-building" sub="Active locations" />
        </div>
        {invTab === 'stock' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <Input placeholder="Search by SKU or product name…" value={invSearch} onChange={e => setInvSearch(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'SKU' }, { label: 'Product' }, { label: 'Category' }, { label: 'Warehouse' }, { label: 'Stock', right: true }, { label: 'Min', right: true }, { label: 'Unit Price', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {filteredStock.map(item => {
                  const isLow = item.stockLevel <= item.minStockLevel;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/40 transition-colors ${isLow ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-4 py-3 data-value-small font-sans tabular-nums font-bold text-slate-500">{item.sku}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.warehouse}</td>
                      <td className={`px-4 py-3 text-xs font-sans tabular-nums font-bold text-right ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.stockLevel}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400 text-right">{item.minStockLevel}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge label={isLow ? 'Low Stock' : 'OK'} variant={isLow ? 'danger' : 'success'} /></td>
                    </tr>
                  );
                })}
                {filteredStock.length === 0 && <EmptyRow cols={8} message="No items match your search." />}
              </tbody>
            </table>
          </div>
        )}
        {invTab === 'adjust' && (
          <div className="max-w-md">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">Stock Adjustment</h3>
              <div className="space-y-4">
                <div><Label>Select Item</Label>
                  <Select value={adjItem} onChange={e => setAdjItem(e.target.value)}>
                    <option value="">— Select SKU —</option>
                    {localStock.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                  </Select>
                </div>
                <div><Label>Quantity to Add (+) or Remove (-)</Label><Input type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} /></div>
                <PrimaryBtn icon="bi bi-arrow-repeat" onClick={() => { if (adjItem) { onAdjustStock(adjItem, Number(adjQty)); setAdjItem(''); setAdjQty('100'); } }}>Apply Adjustment</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
        {invTab === 'warehouses' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...new Set(localStock.map(i => i.warehouse))].map(wh => {
              const items = localStock.filter(i => i.warehouse === wh);
              const val = items.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0);
              return (
                <div key={wh} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3"><i className="bi bi-building text-slate-400"></i><span className="text-sm font-bold text-slate-900">{wh}</span></div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg"><div className="data-value-small text-slate-400 uppercase tracking-wider">SKUs</div><div className="font-sans tabular-nums font-bold text-slate-900 mt-0.5">{items.length}</div></div>
                    <div className="p-2.5 bg-slate-50 rounded-lg"><div className="data-value-small text-slate-400 uppercase tracking-wider">Valuation</div><div className="font-sans tabular-nums font-bold text-slate-900 mt-0.5">${val.toLocaleString()}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {invTab === 'transfers' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Transfers This Month" value={6} icon="bi bi-arrow-left-right" sub="Inter-warehouse moves" />
              <StatCard label="In Transit" value={2} icon="bi bi-truck" sub="Currently moving" accent />
              <StatCard label="Completed" value={4} icon="bi bi-check-circle" sub="Delivered" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">Stock Transfer Log</h3>
                <PrimaryBtn icon="bi bi-plus-lg">New Transfer</PrimaryBtn>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Transfer ID' }, { label: 'Item' }, { label: 'From' }, { label: 'To' }, { label: 'Qty', right: true }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localStock.slice(0, 4).map((item, i) => {
                    const froms = ['Warehouse A', 'Warehouse B', 'Warehouse A', 'Main Store'];
                    const tos = ['Main Store', 'Warehouse A', 'Warehouse C', 'Warehouse B'];
                    const statuses = ['Completed', 'In Transit', 'Completed', 'In Transit'];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">TRF-{1001 + i}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{froms[i]}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{tos[i]}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">{[50, 200, 75, 120][i]}</td>
                        <td className="px-4 py-3"><Badge label={statuses[i]} variant={statuses[i] === 'Completed' ? 'success' : 'info'} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {invTab === 'valuation' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Total Stock Value" value={`$${localStock.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="At cost price" accent />
              <StatCard label="Highest Value SKU" value={[...localStock].sort((a, b) => b.stockLevel * b.unitPrice - a.stockLevel * a.unitPrice)[0]?.name ?? '—'} icon="bi bi-award" sub="By total stock value" />
              <StatCard label="Low Stock Risk Value" value={`$${localStock.filter(i => i.stockLevel <= i.minStockLevel).reduce((s, i) => s + i.stockLevel * i.unitPrice, 0).toLocaleString()}`} icon="bi bi-exclamation-triangle" sub="Value at risk" color="text-rose-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Stock Valuation Report</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'SKU' }, { label: 'Product' }, { label: 'Qty on Hand', right: true }, { label: 'Unit Cost', right: true }, { label: 'Total Value', right: true }, { label: 'Warehouse' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localStock.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 data-value-small font-sans tabular-nums text-slate-500">{item.sku}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">{item.stockLevel.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${(item.stockLevel * item.unitPrice).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.warehouse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 8. PROCUREMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'procurement' || activeView.startsWith('proc-')) {
    return (
      <div>
        <PageHeader title="Procurement & Vendor Management" subtitle="Create purchase orders, manage vendor relationships and track RFQ bids."
          action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setProcTab('create')}>New Purchase Order</PrimaryBtn>} />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total POs" value={procOrders.length} icon="bi bi-file-earmark-plus" sub="Purchase orders issued" />
          <StatCard label="PO Value" value={`$${procOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total committed spend" accent />
          <StatCard label="Pending Approval" value={procOrders.filter(o => o.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting authorisation" />
          <StatCard label="Received" value={procOrders.filter(o => o.status === 'Received').length} icon="bi bi-check-circle" sub="Delivered orders" />
        </div>
        {procTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'PO Number' }, { label: 'Vendor' }, { label: 'Item Description' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {procOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{o.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{o.vendor}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{o.item}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{o.date}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${o.total.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={o.status} variant={o.status === 'Approved' || o.status === 'Received' ? 'success' : 'warning'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {procTab === 'vendors' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: 'Industrial Tooling Co.', type: 'Manufacturer', rating: 4.8, contact: 'sales@indtools.com', orders: 12 },
              { name: 'Apex Chemical Lab', type: 'Distributor', rating: 4.2, contact: 'orders@apexchem.com', orders: 7 },
              { name: 'TechParts Global', type: 'Wholesale', rating: 4.6, contact: 'b2b@techparts.io', orders: 15 },
            ].map(v => (
              <div key={v.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div><div className="text-sm font-bold text-slate-900">{v.name}</div><div className="data-value text-slate-500 mt-0.5">{v.type} · {v.contact}</div></div>
                  <div className="data-value-small font-sans tabular-nums text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">★ {v.rating}</div>
                </div>
                <div className="data-value text-slate-500">{v.orders} purchase orders placed</div>
              </div>
            ))}
          </div>
        )}
        {procTab === 'rfq' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Open RFQs" value={3} icon="bi bi-file-earmark-text" sub="Awaiting vendor quotes" />
              <StatCard label="Avg Response Time" value="2.4 days" icon="bi bi-clock" sub="Vendor response SLA" accent />
              <StatCard label="Best Savings" value="12%" icon="bi bi-piggy-bank" sub="vs. last quoted price" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">Request for Quotation</h3>
                <PrimaryBtn icon="bi bi-send">Send New RFQ</PrimaryBtn>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'RFQ #' }, { label: 'Item' }, { label: 'Vendors Invited' }, { label: 'Sent On' }, { label: 'Quotes Received' }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'RFQ-001', item: 'Industrial Bearings x500', vendors: 3, sent: '2026-07-01', received: 2, status: 'In Review' },
                    { id: 'RFQ-002', item: 'Hydraulic Seals Kit', vendors: 2, sent: '2026-07-05', received: 2, status: 'Awarded' },
                    { id: 'RFQ-003', item: 'Safety Helmets x100', vendors: 4, sent: '2026-07-08', received: 1, status: 'Open' },
                  ].map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{r.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{r.item}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600">{r.vendors}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{r.sent}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{r.received}/{r.vendors}</td>
                      <td className="px-4 py-3"><Badge label={r.status} variant={r.status === 'Awarded' ? 'success' : r.status === 'In Review' ? 'warning' : 'info'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 9. PROJECT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'project' || activeView.startsWith('proj-')) {
    const cols = ['To Do', 'In Progress', 'Review', 'Done'];
    const priorityColor = (p: string) => p === 'Critical' ? 'border-rose-400 text-rose-700 bg-rose-50' : p === 'High' ? 'border-amber-400 text-amber-700 bg-amber-50' : p === 'Medium' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-500 bg-slate-50';
    return (
      <div>
        <PageHeader title="Project Management — Kanban" subtitle="Track tasks across stages, assign resources, monitor milestones and time logs." />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {cols.map(col => (
            <StatCard key={col} label={col} value={projTasks.filter(t => t.status === col).length} icon="bi bi-kanban" sub="Tasks in this stage" />
          ))}
        </div>

        {projTab === 'kanban' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <Input className="max-w-xs" placeholder="New task title…" value={newTask} onChange={e => setNewTask(e.target.value)} />
              <Select className="w-32" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                if (!newTask.trim()) return;
                setProjTasks(prev => [...prev, { id: `T-0${prev.length + 1}`, title: newTask, status: 'To Do', priority: newTaskPriority, assignee: 'Unassigned', due: '—' }]);
                setNewTask('');
              }}>Add Task</PrimaryBtn>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {cols.map(col => (
                <div key={col} className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 min-h-[400px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="data-value-small font-bold uppercase tracking-wider text-slate-600">{col}</span>
                    <span className="text-[10px] font-sans tabular-nums bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">{projTasks.filter(t => t.status === col).length}</span>
                  </div>
                  <div className="space-y-2">
                    {projTasks.filter(t => t.status === col).map(task => (
                      <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                        <div className="text-xs font-semibold text-slate-900 mb-2 leading-tight">{task.title}</div>
                        <div className="flex items-center justify-between">
                          <span className={`data-value-small font-bold border px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>{task.priority}</span>
                          <span className="text-[10px] text-slate-400 font-sans tabular-nums">{task.due}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5">{task.assignee}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {projTab === 'milestones' && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Total Milestones" value={5} icon="bi bi-flag" sub="Project checkpoints" />
              <StatCard label="Completed" value={2} icon="bi bi-check-circle" sub="On schedule" color="text-emerald-600" />
              <StatCard label="Overdue" value={1} icon="bi bi-exclamation-circle" sub="Needs attention" accent />
            </div>
            {[
              { name: 'MVP Architecture Sign-off', due: '2026-06-30', status: 'Completed', completion: 100 },
              { name: 'Backend API Integration', due: '2026-07-15', status: 'In Progress', completion: 65 },
              { name: 'QA & Security Audit', due: '2026-07-05', status: 'Overdue', completion: 30 },
              { name: 'UAT with Client', due: '2026-07-25', status: 'Upcoming', completion: 0 },
              { name: 'Production Launch', due: '2026-08-01', status: 'Upcoming', completion: 0 },
            ].map(m => (
              <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div><div className="table-cell-semibold text-slate-900">{m.name}</div><div className="data-value-small text-slate-400 mt-0.5">Due: {m.due}</div></div>
                  <Badge label={m.status} variant={m.status === 'Completed' ? 'success' : m.status === 'Overdue' ? 'danger' : m.status === 'In Progress' ? 'info' : 'default'} />
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${m.completion === 100 ? 'bg-emerald-500' : m.status === 'Overdue' ? 'bg-rose-400' : 'bg-slate-800'}`} style={{ width: `${m.completion}%` }} /></div>
                <div className="text-[10px] text-slate-400 mt-1">{m.completion}% complete</div>
              </div>
            ))}
          </div>
        )}

        {projTab === 'time' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Hours Logged This Week" value="142h" icon="bi bi-clock" sub="Across all team members" accent />
              <StatCard label="Billable Hours" value="118h" icon="bi bi-currency-dollar" sub="83% billability" color="text-emerald-600" />
              <StatCard label="Over Budget Tasks" value={2} icon="bi bi-exclamation-triangle" sub="Exceeding estimates" color="text-rose-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Time Log — This Week</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Team Member' }, { label: 'Task' }, { label: 'Date' }, { label: 'Hours Logged', right: true }, { label: 'Billable' }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {projTasks.slice(0, 5).map((task, i) => {
                    const hours = [6.5, 8, 4, 7.5, 5][i] ?? 5;
                    const billable = [true, true, false, true, true][i];
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{task.assignee}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate">{task.title}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">2026-07-0{i + 1}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">{hours}h</td>
                        <td className="px-4 py-3"><Badge label={billable ? 'Billable' : 'Internal'} variant={billable ? 'success' : 'default'} /></td>
                        <td className="px-4 py-3"><Badge label={task.status} variant={task.status === 'Done' ? 'success' : 'info'} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {projTab === 'resources' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="Team Size" value={localEmployees.length} icon="bi bi-people" sub="Allocated to project" />
              <StatCard label="Avg Utilisation" value="78%" icon="bi bi-speedometer" sub="Capacity vs logged hours" accent />
              <StatCard label="Available Capacity" value="22%" icon="bi bi-person-check" sub="Unallocated bandwidth" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Team Resource Allocation</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Team Member' }, { label: 'Department' }, { label: 'Role' }, { label: 'Utilisation', right: true }, { label: 'Tasks Assigned', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 6).map((emp, i) => {
                    const utils = [92, 78, 45, 100, 65, 80];
                    const u = utils[i] ?? 70;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{emp.department}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{emp.designation}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${u >= 90 ? 'bg-rose-400' : u >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${u}%` }} /></div>
                            <span className="text-[10px] font-sans tabular-nums text-slate-600">{u}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">{projTasks.filter(t => t.assignee.includes(emp.firstName)).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }




  // 10. MANUFACTURING
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'manufacturing' || activeView.startsWith('mfg-')) {
    const bomTotal = bomData.reduce((s, b) => s + b.qty * b.cost, 0);
    return (
      <div>
        <PageHeader title="Manufacturing & Production" subtitle="Work orders, Bill of Materials, production tracking and quality control." />
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <StatCard label="Work Orders" value={workOrders.length} icon="bi bi-clipboard2-data" sub="Active production runs" />
          <StatCard label="In Progress" value={workOrders.filter(w => w.status === 'In Progress').length} icon="bi bi-play-circle" sub="Currently manufacturing" accent />
          <StatCard label="Completed" value={workOrders.filter(w => w.status === 'Completed').length} icon="bi bi-check-circle" sub="Finished this period" />
        </div>
        {mfgTab === 'orders' && (
          <div className="space-y-3">
            {workOrders.map(wo => (
              <div key={wo.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-xs font-sans tabular-nums font-bold text-slate-500">{wo.id}</span><Badge label={wo.status} variant={wo.status === 'Completed' ? 'success' : wo.status === 'In Progress' ? 'info' : 'warning'} /></div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{wo.product}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Qty: <span className="font-sans tabular-nums font-semibold text-slate-700">{wo.qty.toLocaleString()}</span> · Line: <span className="font-semibold text-slate-700">{wo.line}</span></div>
                  </div>
                  <div className="text-right"><div className="text-2xl font-bold font-sans tabular-nums text-slate-900">{wo.completion}%</div><div className="text-[10px] text-slate-400">completion</div></div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${wo.completion === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ width: `${wo.completion}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {mfgTab === 'bom' && (
          <div>
            <div className="mb-4 flex items-center gap-3"><Label>Product:</Label>
              <Select className="w-64" value={bomProduct} onChange={e => setBomProduct(e.target.value)}><option>Pneumatic Actuator</option><option>Bio-Vial Stopper</option><option>Servo Bracket Assy</option></Select>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">BOM — {bomProduct}</h3>
                <span className="table-cell-mono font-bold text-slate-900">Total Cost: ${bomTotal.toFixed(2)}</span>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: '#' }, { label: 'Component' }, { label: 'Qty' }, { label: 'Unit' }, { label: 'Unit Cost', right: true }, { label: 'Line Total', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {bomData.map((b, i) => (
                    <tr key={b.part} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{b.part}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{b.qty}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{b.unit}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">${b.cost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${(b.qty * b.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={5} className="px-4 py-3 table-cell font-bold text-slate-700 text-right">Total Material Cost</td>
                    <td className="px-4 py-3 table-cell-mono font-bold text-slate-900 text-right">${bomTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {mfgTab === 'quality' && (
          <div className="space-y-3">
            {[
              { check: 'Dimensional Tolerance Verification', result: 'Passed', date: '2026-07-09', inspector: 'QC Team A' },
              { check: 'Surface Finish Inspection (Ra)', result: 'Passed', date: '2026-07-08', inspector: 'QC Team B' },
              { check: 'Pressure Test (12 Bar)', result: 'Failed', date: '2026-07-07', inspector: 'QC Team A' },
              { check: 'Material Certificate Verification', result: 'Passed', date: '2026-07-06', inspector: 'QC Team C' },
            ].map(q => (
              <div key={q.check} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
                <div><div className="table-cell-semibold text-slate-900">{q.check}</div><div className="data-value text-slate-500 mt-0.5">{q.inspector} · {q.date}</div></div>
                <Badge label={q.result} variant={q.result === 'Passed' ? 'success' : 'danger'} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 11. POINT OF SALE
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'pos' || activeView.startsWith('pos-')) {
    return (
      <div>
        <PageHeader title="Point of Sale" subtitle="Process sales transactions, manage the cash register and issue digital receipts." />
        {posReceipt ? (
          <div className="max-w-sm mx-auto">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
              <i className="bi bi-receipt text-3xl text-slate-400 block mb-2"></i>
              <div className="text-sm font-bold text-slate-900 mb-1">{selectedCompany.name}</div>
              <div className="text-[10px] text-slate-400 font-sans tabular-nums mb-4">{posReceipt.ts}</div>
              <div className="border-t border-dashed border-slate-200 pt-3 pb-3 border-b text-xs space-y-1">
                {posCart.map(i => <div key={i.id} className="flex justify-between"><span>{i.name} x{i.qty}</span><span className="font-sans tabular-nums">${(i.price * i.qty).toFixed(2)}</span></div>)}
              </div>
              {posDiscount > 0 && <div className="flex justify-between text-xs text-rose-600 pt-2"><span>Discount ({posDiscount}%)</span><span>-${(posSubtotal * posDiscount / 100).toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2"><span>TOTAL</span><span className="font-sans tabular-nums">${posReceipt.total.toFixed(2)}</span></div>
              <div className="mt-4 text-[10px] text-slate-400">Ref: {posReceipt.ref}</div>
              <button onClick={() => { setPosReceipt(null); setPosCart([]); setPosDiscount(0); }} className="mt-4 w-full bg-slate-900 text-white text-xs font-semibold py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">New Transaction</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-3">
                {posProducts.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.cat}</div>
                    <div className="mt-2 text-sm font-bold font-sans tabular-nums text-slate-900">${p.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Current Order</h3>
              <div className="space-y-2 min-h-[160px]">
                {posCart.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Tap products to add them.</p>}
                {posCart.map(i => (
                  <div key={i.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{i.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-sans tabular-nums text-slate-500">x{i.qty}</span>
                      <span className="font-sans tabular-nums font-semibold text-slate-900">${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-sans tabular-nums text-slate-900">${posSubtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Discount %</span><input type="number" value={posDiscount} onChange={e => setPosDiscount(Number(e.target.value))} className="w-16 text-right border border-slate-200 rounded px-2 py-0.5 text-xs font-sans tabular-nums" /></div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-2"><span className="text-slate-900">Total</span><span className="font-sans tabular-nums text-slate-900">${posTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={() => {
                if (posCart.length === 0) return;
                setPosReceipt({ ref: `TXN-${Date.now().toString().slice(-6)}`, total: posTotal, ts: new Date().toLocaleString() });
              }} className="mt-4 w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                Charge ${posTotal.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 12. ASSET MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'asset' || activeView.startsWith('asset-')) {
    return (
      <div>
        <PageHeader title="Asset Management" subtitle="Track company assets, manage maintenance schedules and monitor asset depreciation." />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total Assets" value={assets.length} icon="bi bi-collection" sub="Registered in system" />
          <StatCard label="Asset Value" value={`$${assets.reduce((s, a) => s + a.value, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total acquisition cost" accent />
          <StatCard label="Operational" value={assets.filter(a => a.status === 'Operational').length} icon="bi bi-check-circle" sub="Running normally" />
          <StatCard label="In Maintenance" value={assets.filter(a => a.status === 'Maintenance').length} icon="bi bi-wrench" sub="Under servicing" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Asset Register</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Asset ID' }, { label: 'Asset Name' }, { label: 'Category' }, { label: 'Location' }, { label: 'Value', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-500">{a.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{a.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.location}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${a.value.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={a.status} variant={a.status === 'Operational' ? 'success' : a.status === 'Assigned' ? 'info' : 'warning'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Register New Asset</h3>
            <div className="space-y-3">
              <div><Label>Asset Name</Label><Input value={newAssetName} onChange={e => setNewAssetName(e.target.value)} placeholder="Dell Workstation" /></div>
              <div><Label>Category</Label><Select value={newAssetCat} onChange={e => setNewAssetCat(e.target.value)}><option>IT Hardware</option><option>Heavy Machinery</option><option>Logistics</option><option>Furniture</option><option>Vehicles</option></Select></div>
              <div><Label>Location</Label><Input value={newAssetLoc} onChange={e => setNewAssetLoc(e.target.value)} placeholder="NYC HQ" /></div>
              <div><Label>Purchase Value (USD)</Label><Input type="number" value={newAssetVal} onChange={e => setNewAssetVal(e.target.value)} /></div>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                if (!newAssetName) return;
                const id = `AST-${100 + assets.length + 1}`;
                setAssets(prev => [...prev, { id, name: newAssetName, category: newAssetCat, location: newAssetLoc, status: 'Operational', value: Number(newAssetVal), qr: `${id}-${newAssetCat.slice(0, 3).toUpperCase()}` }]);
                setNewAssetName(''); setNewAssetVal('1000');
              }}>Register Asset</PrimaryBtn>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">QR Codes</h4>
              {assets.slice(0, 2).map(a => (
                <div key={a.id} className="p-2.5 mb-2 border border-slate-100 rounded-lg flex items-center gap-3 bg-slate-50">
                  <div className="h-10 w-10 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                    <i className="bi bi-qr-code text-slate-700 text-lg"></i>
                  </div>
                  <div><div className="data-value font-semibold text-slate-800">{a.name}</div><div className="data-value-small font-sans tabular-nums text-slate-400">{a.qr}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 13. DOCUMENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'document' || activeView.startsWith('doc-')) {
    return (
      <div>
        <PageHeader title="Document Management" subtitle="Secure document locker, electronic signatures and OCR document scanning." />
        {docTab === 'locker' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">All Documents</h3>
              <PrimaryBtn icon="bi bi-cloud-upload">Upload Document</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Document' }, { label: 'Type' }, { label: 'Size' }, { label: 'Date' }, { label: 'Status' }, { label: '', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><i className="bi bi-file-earmark-text text-slate-400"></i><span className="text-xs font-semibold text-slate-900">{d.name}</span></div></td>
                    <td className="px-4 py-3"><Badge label={d.type} /></td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{d.size}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{d.date}</td>
                    <td className="px-4 py-3"><Badge label={d.status} variant={d.status === 'Signed' || d.status === 'Approved' ? 'success' : d.status === 'Pending Signature' ? 'warning' : 'default'} /></td>
                    <td className="px-4 py-3 text-right"><button className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {docTab === 'esign' && (
          <div className="max-w-xl">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Electronic Signature Workflow</h3>
              <div className="space-y-3">
                {documents.filter(d => d.status === 'Pending Signature').map(d => (
                  <div key={d.id} className="p-4 border border-amber-200 bg-amber-50/30 rounded-xl flex items-center justify-between">
                    <div><div className="table-cell-semibold text-slate-900">{d.name}</div><div className="data-value text-slate-500 mt-0.5">{d.type} · Added {d.date}</div></div>
                    <button onClick={() => setSignDoc(d.id)} className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Sign Document</button>
                  </div>
                ))}
                {signDoc && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <i className="bi bi-patch-check-fill text-emerald-600 text-2xl mb-2 block"></i>
                    <div className="text-xs font-bold text-emerald-800">Document Signed Successfully</div>
                    <div className="data-value text-emerald-600 mt-1">Signed by {selectedUser.name} · {new Date().toLocaleString()}</div>
                    <button onClick={() => setSignDoc(null)} className="mt-3 text-[10px] font-semibold text-emerald-700 underline cursor-pointer">Close</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {docTab === 'ocr' && (
          <div className="max-w-xl">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">OCR Document Scanner</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-5 hover:border-slate-400 transition-colors cursor-pointer">
                <i className="bi bi-upc-scan text-3xl text-slate-300 block mb-2"></i>
                <p className="text-xs text-slate-500">Drag & drop a document or click to upload</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, JPG · Max 10MB</p>
              </div>
              <PrimaryBtn icon="bi bi-cpu" onClick={() => {
                setOcrLoading(true); setOcrResult(null);
                setTimeout(() => { setOcrLoading(false); setOcrResult('EXTRACTED TEXT:\n\nCompany: Alpha Biotech Group\nDate: July 9, 2026\nRef: NDA-2026-088\n\nThis Non-Disclosure Agreement ("Agreement") is entered into...\n\n[Full text extraction complete — 847 words detected]'); }, 2000);
              }}>{ocrLoading ? 'Processing…' : 'Run OCR Extraction'}</PrimaryBtn>
              {ocrResult && (
                <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">OCR Result</div>
                  <pre className="data-value text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{ocrResult}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 14. HELP DESK
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'helpdesk' || activeView.startsWith('hd-')) {
    return (
      <div>
        <PageHeader title="Help Desk & Support" subtitle="Manage support tickets, SLA monitoring, agent assignment and knowledge base."
          action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setHdTab('create')}>New Ticket</PrimaryBtn>} />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} icon="bi bi-ticket" sub="Unassigned queue" />
          <StatCard label="In Progress" value={localTickets.filter(t => t.status === 'In Progress').length} icon="bi bi-hourglass-split" sub="Being handled" accent />
          <StatCard label="Resolved" value={localTickets.filter(t => t.status === 'Resolved').length} icon="bi bi-check2-circle" sub="Closed today" />
          <StatCard label="Critical" value={localTickets.filter(t => t.priority === 'Critical').length} icon="bi bi-exclamation-octagon" sub="SLA breach risk" color="text-rose-600" />
        </div>
        {hdTab === 'queue' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Ticket #' }, { label: 'Customer' }, { label: 'Subject' }, { label: 'Category' }, { label: 'Priority' }, { label: 'Status' }, { label: 'Created' }]} />
              <tbody className="divide-y divide-slate-100">
                {localTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-600">{t.ticketNumber}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.customerName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">{t.subject}</td>
                    <td className="px-4 py-3"><Badge label={t.category} /></td>
                    <td className="px-4 py-3"><Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} /></td>
                    <td className="px-4 py-3"><Badge label={t.status} variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'info' : 'warning'} /></td>
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {localTickets.length === 0 && <EmptyRow cols={7} message="No tickets in the queue." />}
              </tbody>
            </table>
          </div>
        )}
        {hdTab === 'create' && (
          <div className="max-w-lg">
            {tktSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Ticket submitted successfully!</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Open New Ticket</h3>
              <form onSubmit={e => {
                e.preventDefault();
                if (!tktName || !tktSubject) return;
                onAddTicket({ companyId: selectedCompany.id, customerName: tktName, customerEmail: tktEmail, subject: tktSubject, description: tktDesc, category: tktCat, priority: tktPri });
                setTktSuccess(true); setTktName(''); setTktEmail(''); setTktSubject(''); setTktDesc(''); setTktAssignee('');
                setTimeout(() => setTktSuccess(false), 3000);
              }} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Customer Name *</Label><Input value={tktName} onChange={e => setTktName(e.target.value)} placeholder="John Smith" required /></div>
                  <div><Label>Email</Label><Input type="email" value={tktEmail} onChange={e => setTktEmail(e.target.value)} placeholder="john@example.com" /></div>
                </div>
                <div><Label>Subject *</Label><Input value={tktSubject} onChange={e => setTktSubject(e.target.value)} placeholder="Brief description of issue" required /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Category</Label><Select value={tktCat} onChange={e => setTktCat(e.target.value as typeof tktCat)}><option>Technical</option><option>Billing</option><option>Sales</option><option>General</option></Select></div>
                  <div><Label>Priority</Label><Select value={tktPri} onChange={e => setTktPri(e.target.value as typeof tktPri)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select></div>
                </div>
                <div><Label>Assign To</Label><Select value={tktAssignee} onChange={e => setTktAssignee(e.target.value)}><option value="">Select agent...</option>{localEmployees.filter(e => e.status === 'Active' && (e.department === 'Support' || e.department === 'IT' || e.department === 'Operations')).map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                <div><Label>Description</Label><textarea value={tktDesc} onChange={e => setTktDesc(e.target.value)} rows={3} placeholder="Detailed description…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" /></div>
                <PrimaryBtn icon="bi bi-send">Submit Ticket</PrimaryBtn>
              </form>
            </div>
          </div>
        )}
        {hdTab === 'kb' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'How to reset your password', cat: 'Account', views: 234 },
              { title: 'Setting up Two-Factor Authentication', cat: 'Security', views: 187 },
              { title: 'Understanding your invoice', cat: 'Billing', views: 312 },
              { title: 'How to export data from ERP', cat: 'Technical', views: 98 },
              { title: 'Configuring email notifications', cat: 'Settings', views: 145 },
              { title: 'Adding new team members', cat: 'HR', views: 203 },
            ].map(a => (
              <div key={a.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-start justify-between">
                <div><div className="text-xs font-semibold text-slate-900">{a.title}</div><div className="text-[10px] text-slate-400 mt-1">{a.cat} · {a.views} views</div></div>
                <i className="bi bi-arrow-right text-slate-300 text-sm shrink-0 ml-3"></i>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 15. VISITOR MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'visitor' || activeView.startsWith('vis-')) {
    return (
      <div>
        <PageHeader title="Visitor Management" subtitle="Check in guests, log visits, print badges and manage building access." />
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <StatCard label="Inside Now" value={visitors.filter(v => v.status === 'Inside').length} icon="bi bi-door-open" sub="Currently in building" accent />
          <StatCard label="Today's Visits" value={visitors.length} icon="bi bi-person-badge" sub="Total check-ins today" />
          <StatCard label="Checked Out" value={visitors.filter(v => v.status === 'Checked Out').length} icon="bi bi-box-arrow-right" sub="Departed visitors" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Check-in form */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Check-In Visitor</h3>
            {visBadge && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <i className="bi bi-person-badge text-emerald-600 text-2xl block mb-1"></i>
                <div className="text-xs font-bold text-emerald-800">Badge Printed: {visBadge}</div>
              </div>
            )}
            <div className="space-y-4">
              <div><Label>Visitor Name</Label><Input value={visName} onChange={e => setVisName(e.target.value)} placeholder="John Doe" /></div>
              <div><Label>Visitor Company</Label><Input value={visCompany} onChange={e => setVisCompany(e.target.value)} placeholder="Acme Corp" /></div>
              <div><Label>Host Employee</Label>
                <Select value={visHost} onChange={e => setVisHost(e.target.value)}>
                  <option value="">— Select host —</option>
                  {localEmployees.slice(0, 8).map(e => <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</option>)}
                </Select>
              </div>
              <PrimaryBtn icon="bi bi-person-check" onClick={() => {
                if (!visName || !visHost) return;
                const id = `V-${200 + visitors.length + 1}`;
                setVisitors(prev => [...prev, { id, name: visName, host: visHost, company: visCompany || 'Walk-In', checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'Inside' }]);
                setVisBadge(`BADGE-${id}`); setVisName(''); setVisHost(''); setVisCompany('');
                setTimeout(() => setVisBadge(null), 4000);
              }}>Check In &amp; Print Badge</PrimaryBtn>
            </div>
          </div>
          {/* Visitor Log */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visitor Log</h3></div>
            <div className="divide-y divide-slate-100">
              {visitors.map(v => (
                <div key={v.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/40">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{v.name} <span className="text-slate-400 font-normal">· {v.company}</span></div>
                    <div className="data-value text-slate-500 mt-0.5">Host: {v.host} · In: {v.checkIn}{v.checkOut ? ` · Out: ${v.checkOut}` : ''}</div>
                  </div>
                  <Badge label={v.status} variant={v.status === 'Inside' ? 'success' : 'default'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 16. LMS
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'lms' || activeView.startsWith('lms-')) {
    return (
      <div>
        <PageHeader title="Learning Management System" subtitle="Course library, employee training progress, quizzes and certification issuance." />
        {lmsTab === 'courses' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div><div className="text-sm font-bold text-slate-900">{c.title}</div><div className="data-value text-slate-500 mt-0.5">{c.cat} · {c.level} · {c.duration}</div></div>
                  <Badge label={c.cat} variant="info" />
                </div>
                <div className="mb-2 flex justify-between data-value text-slate-500"><span>{c.enrolled} enrolled</span><span>{c.completion}% avg completion</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${c.completion}%` }} /></div>
                <button onClick={() => setLmsTab('quiz')} className="mt-4 w-full text-xs font-semibold border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">Start Course</button>
              </div>
            ))}
          </div>
        )}
        {lmsTab === 'quiz' && (
          <div className="max-w-xl">
            {quizScore !== null ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 text-center">
                <div className={`text-4xl font-bold font-sans tabular-nums mb-2 ${quizScore >= 2 ? 'text-emerald-600' : 'text-rose-600'}`}>{quizScore}/{quizQuestions.length}</div>
                <div className="text-sm font-bold text-slate-900 mb-1">{quizScore >= 2 ? '🎉 Passed!' : '❌ Not Passed'}</div>
                <p className="text-xs text-slate-500 mb-5">{quizScore >= 2 ? 'Certificate will be generated and added to your profile.' : 'Review the course material and try again.'}</p>
                <button onClick={() => { setQuizScore(null); setQuizAnswers({}); }} className="text-xs font-semibold bg-slate-900 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Retake Quiz</button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">ISO 9001 Quality Management — Quiz</h3>
                <div className="space-y-6">
                  {quizQuestions.map((q, qi) => (
                    <div key={q.id}>
                      <div className="text-xs font-semibold text-slate-900 mb-3">{qi + 1}. {q.q}</div>
                      <div className="space-y-2">
                        {q.options.map(opt => (
                          <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === opt ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name={q.id} value={opt} onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))} className="shrink-0" />
                            <span className="text-xs text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <PrimaryBtn icon="bi bi-send" onClick={() => {
                    const score = quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;
                    setQuizScore(score);
                  }}>Submit Quiz</PrimaryBtn>
                </div>
              </div>
            )}
          </div>
        )}
        {lmsTab === 'progress' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Employee' }, { label: 'Course' }, { label: 'Progress', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {localEmployees.slice(0, 6).map((emp, i) => {
                  const course = courses[i % courses.length];
                  const prog = [100, 65, 30, 80, 45, 100][i] || 50;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{course.title}</td>
                      <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${prog}%` }} /></div><span className="text-[10px] font-sans tabular-nums text-slate-500 w-8">{prog}%</span></div></td>
                      <td className="px-4 py-3"><Badge label={prog === 100 ? 'Completed' : 'In Progress'} variant={prog === 100 ? 'success' : 'info'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 17. COMPLIANCE
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'compliance' || activeView.startsWith('comp-')) {
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    return (
      <div>
        <PageHeader title="Compliance & Risk Management" subtitle="Track regulatory requirements, maintain policy library and log compliance incidents." />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Overall Score" value={`${Math.round((passed / total) * 100)}%`} icon="bi bi-shield-check" sub={`${passed}/${total} requirements met`} />
          <StatCard label="Passed Checks" value={passed} icon="bi bi-check-circle" sub="Compliant controls" color="text-emerald-600" />
          <StatCard label="Failed Checks" value={total - passed} icon="bi bi-x-circle" sub="Requires attention" accent />
          <StatCard label="Open Incidents" value={incidents.filter(i => i.status !== 'Resolved').length} icon="bi bi-exclamation-triangle" sub="Under investigation" />
        </div>
        {compTab === 'checklists' && (
          <div className="space-y-2">
            {Object.entries(checks).map(([label, done]) => (
              <div key={label} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${done ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/20 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <i className={`${done ? 'bi bi-check-circle-fill text-emerald-600' : 'bi bi-x-circle-fill text-rose-500'} text-sm`}></i>
                  </div>
                  <span className="text-xs font-semibold text-slate-900">{label}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => setChecks(prev => ({ ...prev, [label]: !prev[label] }))}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${done ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {done ? 'Mark Fail' : 'Mark Pass'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {compTab === 'policies' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Data Protection & GDPR Policy', version: 'v3.2', updated: '2026-06-01', owner: 'Legal' },
              { title: 'Information Security Policy', version: 'v2.1', updated: '2026-05-15', owner: 'IT' },
              { title: 'Health & Safety Policy (OSHA)', version: 'v4.0', updated: '2026-04-20', owner: 'Operations' },
              { title: 'Anti-Bribery & Corruption Policy', version: 'v1.3', updated: '2026-03-10', owner: 'Legal' },
              { title: 'Remote Work Policy', version: 'v2.0', updated: '2026-07-01', owner: 'HR' },
              { title: 'Business Continuity Plan', version: 'v1.5', updated: '2026-02-28', owner: 'Executive' },
            ].map(p => (
              <div key={p.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-start justify-between">
                <div><div className="text-xs font-semibold text-slate-900">{p.title}</div><div className="text-[10px] text-slate-400 mt-1">{p.version} · Updated {p.updated} · Owner: {p.owner}</div></div>
                <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-2 py-1 rounded-lg ml-3 shrink-0">View</button>
              </div>
            ))}
          </div>
        )}
        {compTab === 'incidents' && (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-sans tabular-nums text-slate-400">{inc.id}</span><Badge label={inc.severity} variant={inc.severity === 'High' ? 'danger' : 'warning'} /></div>
                  <div className="text-xs font-bold text-slate-900">{inc.title}</div>
                  <div className="data-value text-slate-500 mt-0.5">Logged: {inc.date}</div>
                </div>
                <Badge label={inc.status} variant={inc.status === 'Resolved' ? 'success' : 'warning'} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 18. COMMUNICATION
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'communication' || activeView.startsWith('comm-')) {
    return (
      <div>
        <PageHeader title="Communication Hub" subtitle="Company-wide announcements, team messaging and email/SMS broadcast campaigns."
          action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setCommTab('compose')}>New Announcement</PrimaryBtn>} />
        {commTab === 'feed' && (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className={`bg-white border rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all ${a.pinned ? 'border-slate-900' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {a.pinned && <span className="data-value-small font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">📌 Pinned</span>}
                    <Badge label={a.channel} variant="info" />
                  </div>
                  <span className="text-[10px] font-sans tabular-nums text-slate-400">{a.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{a.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
                <div className="mt-3 text-[10px] text-slate-400">Posted by <span className="font-semibold text-slate-600">{a.author}</span></div>
              </div>
            ))}
          </div>
        )}
        {commTab === 'compose' && (
          <div className="max-w-xl">
            {commSent && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Announcement published successfully!</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Compose Announcement</h3>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={commTitle} onChange={e => setCommTitle(e.target.value)} placeholder="Announcement title…" /></div>
                <div><Label>Channel</Label><Select value={commChannel} onChange={e => setCommChannel(e.target.value)}><option>Company</option><option>Operations</option><option>Finance</option><option>IT</option><option>HR</option></Select></div>
                <div><Label>Message</Label><textarea value={commBody} onChange={e => setCommBody(e.target.value)} rows={5} placeholder="Write your announcement…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" /></div>
                <PrimaryBtn icon="bi bi-send" onClick={() => {
                  if (!commTitle || !commBody) return;
                  setAnnouncements(prev => [{ id: `A${prev.length + 1}`, title: commTitle, body: commBody, author: selectedUser.name, channel: commChannel, date: new Date().toISOString().split('T')[0], pinned: false }, ...prev]);
                  setCommSent(true); setCommTitle(''); setCommBody('');
                  setTimeout(() => setCommSent(false), 3000);
                }}>Publish Announcement</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 19. REPORTS & ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════
  const revAcc = glAccounts.find(a => a.type === 'Revenue');
  const totalPayroll = payslips.reduce((s, p) => s + p.gross, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  if (activeView === 'reports' || activeView.startsWith('rep-')) {
    return (
      <ReportsModule
        selectedCompany={selectedCompany}
        selectedUser={selectedUser}
        employees={employees}
        crmLeads={leads}
        invoices={invoices}
        payslips={payslips}
        tickets={tickets}
        expenses={expenses}
        bankTransactions={bankTransactions}
      />
    );
  }
  {
    rptTab === 'overview' && (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue YTD" value={`$${(revAcc?.balance ?? 0).toLocaleString()}`} icon="bi bi-graph-up" sub="Total recognised revenue" color="text-emerald-600" />
          <StatCard label="Total Expenses" value={`$${expenses.toLocaleString()}`} icon="bi bi-graph-down" sub="Operating costs" color="text-rose-600" />
          <StatCard label="Payroll Cost" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-people" sub="Monthly staff cost" accent />
          <StatCard label="Net Margin" value={`${(revAcc?.balance ?? 0) > 0 ? (((revAcc!.balance - expenses) / revAcc!.balance) * 100).toFixed(1) : '0.0'}%`} icon="bi bi-pie-chart" sub="Pre-tax profit margin" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Revenue vs Expenses — Visual</h3>
            <div className="space-y-3">
              {[{ label: 'Q1 Revenue', val: Math.round((revAcc?.balance ?? 0) * 0.22), max: revAcc?.balance ?? 1, color: 'bg-emerald-500' },
              { label: 'Q2 Revenue', val: Math.round((revAcc?.balance ?? 0) * 0.28), max: revAcc?.balance ?? 1, color: 'bg-emerald-400' },
              { label: 'Q1 Expenses', val: Math.round(expenses * 0.48), max: revAcc?.balance ?? 1, color: 'bg-rose-400' },
              { label: 'Q2 Expenses', val: Math.round(expenses * 0.52), max: revAcc?.balance ?? 1, color: 'bg-rose-300' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between data-value mb-1"><span className="text-slate-600">{b.label}</span><span className="font-sans tabular-nums text-slate-900 font-semibold">${b.val.toLocaleString()}</span></div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${b.color} rounded-full`} style={{ width: `${Math.min((b.val / b.max) * 100, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3"><i className="bi bi-robot text-slate-400 text-sm"></i><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Business Insight</span></div>
            {aiInsight ? (
              <p className="text-xs text-slate-300 leading-relaxed">{aiInsight}</p>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">Click below to generate an AI-powered analysis of your business metrics using Gemini.</p>
            )}
            <button onClick={() => {
              setAiLoading(true);
              setTimeout(() => {
                setAiInsight(`Based on current metrics, ${selectedCompany.name} is showing strong revenue growth with a healthy net margin. Payroll represents ${((totalPayroll / (revAcc?.balance ?? 1)) * 100).toFixed(0)}% of revenue — within optimal range. Open invoice backlog of ${localInvoices.filter(i => i.status !== 'Paid').length} orders suggests improving collections process. Recommend reviewing Q3 procurement spend to maintain margins above 35%.`);
                setAiLoading(false);
              }, 2000);
            }} className="mt-4 w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 py-2 rounded-lg cursor-pointer transition-all">
              {aiLoading ? 'Generating…' : '✨ Generate AI Insight'}
            </button>
          </div>
        </div>
      </div>
    )
  }
  {
    rptTab === 'financial' && (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Income Statement</h3>
          <div className="space-y-2 text-xs">
            {[{ label: 'Gross Revenue', val: revAcc?.balance ?? 0, type: 'revenue' },
            { label: 'Operating Expenses', val: -expenses, type: 'expense' },
            { label: 'Monthly Payroll', val: -totalPayroll, type: 'expense' },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{r.label}</span>
                <span className={`font-sans tabular-nums font-semibold ${r.val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {r.val >= 0 ? '+' : ''}${r.val.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-2 font-bold"><span className="text-slate-900">Net Income</span><span className="font-sans tabular-nums text-slate-900">${((revAcc?.balance ?? 0) - expenses - totalPayroll).toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">GL Account Balances</h3>
          <div className="space-y-2">
            {localGL.slice(0, 8).map(acc => (
              <div key={acc.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                <div><span className="text-[10px] font-sans tabular-nums text-slate-400 mr-2">{acc.code}</span><span className="text-xs text-slate-700">{acc.name}</span></div>
                <span className={`text-xs font-sans tabular-nums font-semibold ${acc.type === 'Revenue' ? 'text-emerald-600' : acc.type === 'Expense' ? 'text-rose-600' : 'text-slate-900'}`}>${acc.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  {
    rptTab === 'hr' && (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Headcount by Department</h3>
          {[...new Set(localEmployees.map(e => e.department))].map(dept => {
            const count = localEmployees.filter(e => e.department === dept).length;
            return (<div key={dept} className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-slate-700">{dept}</span><span className="font-sans tabular-nums text-slate-500">{count}</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${(count / localEmployees.length) * 100}%` }} /></div></div>);
          })}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Status Distribution</h3>
          {[{ label: 'Active', count: localEmployees.filter(e => e.status === 'Active').length, color: 'bg-emerald-500' },
          { label: 'On Leave', count: localEmployees.filter(e => e.status === 'On Leave').length, color: 'bg-amber-400' },
          { label: 'Suspended', count: localEmployees.filter(e => e.status === 'Suspended').length, color: 'bg-rose-500' },
          ].map(s => (
            <div key={s.label} className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-slate-700">{s.label}</span><span className="font-sans tabular-nums text-slate-500">{s.count}</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{ width: `${localEmployees.length ? (s.count / localEmployees.length) * 100 : 0}%` }} /></div></div>
          ))}
        </div>
      </div>
    )
  }
  {
    rptTab === 'sales' && (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">CRM Pipeline by Stage</h3>
          {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as CRMLead['status'][]).map(st => {
            const count = localLeads.filter(l => l.status === st).length;
            return (<div key={st} className="mb-2.5"><div className="flex justify-between text-xs mb-1"><span className="text-slate-700">{st}</span><span className="font-sans tabular-nums text-slate-500">{count} leads</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${localLeads.length ? (count / localLeads.length) * 100 : 0}%` }} /></div></div>);
          })}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Invoice Summary</h3>
          {(['Draft', 'Sent', 'Paid', 'Overdue'] as Invoice['status'][]).map(st => {
            const items = localInvoices.filter(i => i.status === st);
            const total = items.reduce((s, i) => s + i.total, 0);
            return (<div key={st} className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-xs"><span className="text-slate-600">{st}</span><div className="text-right"><div className="font-sans tabular-nums font-semibold text-slate-900">${total.toLocaleString()}</div><div className="text-[10px] text-slate-400">{items.length} invoices</div></div></div>);
          })}
        </div>
      </div>
    )
  }

  if (activeView === 'superadmin')

    // ══════════════════════════════════════════════════════════════════════════
    // 20. SUPER ADMIN CONSOLE
    // ══════════════════════════════════════════════════════════════════════════
    if (activeView === 'superadmin') {
      if (selectedUser.activeRole !== 'Super Admin') {
        return (
          <div className="flex flex-col items-center justify-center py-24">
            <i className="bi bi-shield-exclamation text-4xl text-rose-400 mb-4"></i>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
            <p className="text-sm text-slate-500">This console is reserved for Super Administrators only.</p>
          </div>
        );
      }
      return (
        <div>
          <div className="flex items-start justify-between pb-5 border-b border-slate-200 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  System Administrator Console
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform System Console</h1>
              <p className="text-sm text-slate-500 mt-0.5">Global infrastructure controls, tenant management, billing operations and platform configuration.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Server Health */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Infrastructure Health</h3>
              <div className="space-y-3">
                {[
                  { service: 'API Server (Express.js)', status: 'Operational', uptime: '99.99%' },
                  { service: 'Primary Database', status: 'Healthy', uptime: '99.97%' },
                  { service: 'Redis Cache Layer', status: 'Operational', uptime: '100%' },
                  { service: 'File Storage (S3)', status: '62% Capacity', uptime: '100%' },
                  { service: 'Email / SMTP Relay', status: 'Operational', uptime: '99.8%' },
                  { service: 'Job Queue (BullMQ)', status: 'Running', uptime: '99.9%' },
                  { service: 'SSL Certificates', status: 'Valid – 180d', uptime: '—' },
                ].map(s => (
                  <div key={s.service} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="data-value text-slate-700">{s.service}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{s.status}
                      </span>
                      <span className="data-value-small font-sans tabular-nums text-slate-400">{s.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Global Audit Stream</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex justify-between items-baseline">
                      <span className="data-value font-semibold text-slate-800">{log.userName}</span>
                      <span className="data-value-small font-sans tabular-nums text-slate-400 shrink-0 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{log.details}</p>
                    <span className="mt-1 inline-block data-value-small bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans tabular-nums uppercase">{log.module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Config */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-5 text-white">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Platform Configuration</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Platform Version', val: 'v4.2.1 (stable)' },
                    { label: 'Environment', val: 'Production' },
                    { label: 'Node.js Runtime', val: 'v24.15.0' },
                    { label: 'Database Engine', val: 'PostgreSQL 16' },
                    { label: 'Region', val: 'US-East-1' },
                    { label: 'Max Tenants', val: 'Unlimited' },
                  ].map(c => (
                    <div key={c.label} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                      <span className="text-slate-400">{c.label}</span>
                      <span className="font-sans tabular-nums text-slate-200">{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Force Cache Clear', icon: 'bi bi-trash', danger: false },
                    { label: 'Download Audit Export', icon: 'bi bi-download', danger: false },
                    { label: 'Send Platform Notice', icon: 'bi bi-megaphone', danger: false },
                    { label: 'Emergency Maintenance Mode', icon: 'bi bi-exclamation-triangle', danger: true },
                  ].map(a => (
                    <button key={a.label} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${a.danger ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                      <i className={`${a.icon} text-sm`}></i>{a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  // ══════════════════════════════════════════════════════════════════════════
  // 21. API KEYS
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === 'apikeys') {
    return (
      <div>
        <PageHeader title="API Keys & Integrations" subtitle="Generate and manage API credentials, third-party integrations and webhook endpoints." />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {localAPIKeys.map(k => (
              <div key={k.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{k.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Created: {new Date(k.createdAt).toLocaleDateString()} · Expires: {new Date(k.expiresAt).toLocaleDateString()}</div>
                  </div>
                  <Badge label={k.permissions} variant={k.permissions === 'Full Access' ? 'danger' : 'info'} />
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-600 flex-1 truncate">{k.key}</span>
                  <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer shrink-0">Copy</button>
                </div>
              </div>
            ))}
            {localAPIKeys.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center"><p className="text-xs text-slate-400">No API keys generated yet.</p></div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Generate New API Key</h3>
            {keySuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">API key generated!</div>}
            <div className="space-y-4">
              <div><Label>Key Name</Label><Input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="My Integration Key" /></div>
              <div><Label>Permissions</Label><Select value={keyPerms} onChange={e => setKeyPerms(e.target.value as typeof keyPerms)}><option>Read Only</option><option>Full Access</option></Select></div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg data-value text-amber-700"><i className="bi bi-exclamation-triangle mr-1"></i>Full Access keys can modify all company data. Use with caution.</div>
              <PrimaryBtn icon="bi bi-key" onClick={() => {
                if (!keyName) return;
                onGenerateAPIKey(keyName, keyPerms);
                setKeySuccess(true); setKeyName('');
                setTimeout(() => setKeySuccess(false), 3000);
              }}>Generate Key</PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <i className="bi bi-layout-text-sidebar text-4xl text-slate-200 mb-4"></i>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Module Not Found</h2>
      <p className="text-sm text-slate-400">The view <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{activeView}</code> is not registered.</p>
    </div>
  );
};
