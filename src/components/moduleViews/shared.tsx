/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Company, User, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice,
  InventoryItem, SupportTicket, AuditLog, APIKey, Department, Branch,
  LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, SalaryBand, JournalEntry, Expense, FiscalPeriod, OpeningBalance,
  Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate,
  TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline,   OnboardingRecord,
  POSCategory, POSTerminal, POSShift, POSDiscount, POSReturn, POSDailyReport, POSProduct, POSCustomer, POSSale, SalesOrder, SalesCustomer, SalesQuotation, SalesTarget, PayrollTaxConfig, KBArticle, LMSCourse, CommunicationAnnouncement, EmailTemplate
} from '../../types';

export interface ModuleViewsProps {
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
  payrollGroups: PayrollGroup[];
  salaryBands: SalaryBand[];
  journalEntries: JournalEntry[];
  expenses: Expense[];
  fiscalPeriods: FiscalPeriod[];
  openingBalances: OpeningBalance[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onNavigateView: (view: string) => void;
  onAddDepartment: (dept: Omit<Department, 'id' | 'employeeCount'>) => void;
  onUpdateDepartment: (id: string, updates: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
  onboardings: OnboardingRecord[];
  onAddOnboarding: (record: Omit<OnboardingRecord, 'id'>) => void;
  onUpdateOnboarding: (id: string, updates: Partial<OnboardingRecord>) => void;
  onDeleteOnboarding: (id: string) => void;
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
  onAddLead: (lead: Omit<CRMLead, 'id' | 'status' | 'aiLeadScore' | 'aiFollowUpSuggested' | 'createdAt'>) => void;
  onMoveLead: (leadId: string, status: CRMLead['status']) => void;
  onAssignLead: (leadId: string, userId: string, userName: string, department: string) => void;
  onAddComment: (leadId: string, content: string) => void;
  onAddInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'status'>) => void;
  onPayInvoice: (invId: string) => void;
  onAdjustStock: (itemId: string, qty: number) => void;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'assignedTo' | 'createdAt'>) => void;
  onUpdateTicket: (id: string, updates: { status?: string; department?: string; reply?: { message: string }; repliedBy?: string; repliedByRole?: 'Customer' | 'Agent' | 'Admin' }) => void;
  onInviteUser: (usr: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => void;
  onGenerateAPIKey: (name: string, permissions: 'Read Only' | 'Full Access') => void;
  onAddExpense?: (exp: { description: string; category: string; department: string; amount: number; createdBy?: string }) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeave: (input: { employeeId: string; employeeName: string; department: string; leaveType: string; startDate: string; endDate: string; reason: string; days: number }) => void;
  onClockIn: (mode?: string) => void;
  onClockOut: () => void;
  onLogCrmActivity: (activity: any) => void;
  onCreateCrmTask: (task: any) => void;
  onUpdateCrmTask: (taskId: string, updates: any) => void;
  onSendCrmEmail: (email: any) => void;
  onAddOKR: (input: { employeeId: string; employeeName: string; department: string; title: string; keyResult: string; period: string }) => void;
  onUpdateOKRProgress: (id: string, progress: number) => void;
  onRunPayroll: (period: string, structure: string, employeeIds?: string[]) => void;
  onCreatePayrollGroup: (name: string, description: string, employeeIds: string[]) => void;
  onDeletePayrollGroup: (groupId: string) => void;
  onCreateSalaryBand: (name: string, minSalary: number, maxSalary: number) => void;
  onUpdateSalaryBand: (bandId: string, updates: { name?: string; minSalary?: number; maxSalary?: number; employeeCount?: number }) => void;
  onDeleteSalaryBand: (bandId: string) => void;
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
  onUpdateTaxReturn: (id: string, values: any) => void;
  onDeleteTaxReturn: (id: string) => void;
  onCreateIntercompanyTxn: (tx: any) => void;
  onApproveIntercompanyTxn: (txId: string) => void;
  onEliminateIntercompanyTxn: (txId: string) => void;
  onCreateConsolidationRule: (rule: any) => void;
  onResolveComplianceCheck: (checkId: string, status: string) => void;
  onCreateComplianceCheck: (check: { companyId: string; category: string; title: string; description: string; dueDate: string; assignee: string; assigneeName: string; createdBy: string }) => void;
  onUpdateComplianceCheck: (id: string, values: any) => void;
  onDeleteComplianceCheck: (id: string) => void;
  onAcknowledgePolicy: (policyId: string, employeeId: string) => void;
  onFileDeadline: (filingId: string) => void;
  onCreateFilingDeadline: (filing: { companyId: string; filingType: string; jurisdiction: string; dueDate: string; assignee: string; assigneeName: string; notes: string; createdBy: string }) => void;
  onUpdateFilingDeadline: (id: string, values: any) => void;
  onDeleteFilingDeadline: (id: string) => void;
  // Tax Codes CRUD
  onCreateTaxCode: (tc: any) => void;
  onUpdateTaxCode: (id: string, values: any) => void;
  onDeleteTaxCode: (id: string) => void;
  // Payroll tax / deduction configuration (DB-backed)
  payrollTaxConfig?: PayrollTaxConfig | null;
  onUpdatePayrollTaxConfig?: (companyId: string, cfg: Partial<PayrollTaxConfig>) => void;
  // Super Admin plan assignment
  tenants: Company[];
  onAssignPlan: (companyId: string, moduleIds: string[], billingPlan: Company['billingPlan']) => void;
  // POS data
  posProducts: POSProduct[];
  posCustomers: POSCustomer[];
  posSales: POSSale[];
  posCategories: POSCategory[];
  posTerminals: POSTerminal[];
  posShifts: POSShift[];
  posDiscounts: POSDiscount[];
  posReturns: POSReturn[];
  posDailyReports: POSDailyReport[];
  // POS handlers
  onAddPOSProduct: (product: Omit<POSProduct, 'id' | 'createdAt'>) => void;
  onAddPOSCustomer: (customer: Omit<POSCustomer, 'id' | 'createdAt'>) => void;
  onCreatePOSSale: (sale: any) => void;
  onAddPOSCategory: (cat: Omit<POSCategory, 'id' | 'createdAt'>) => void;
  onAddPOSTerminal: (term: Omit<POSTerminal, 'id' | 'createdAt'>) => void;
  onCreatePOSShift: (shift: Omit<POSShift, 'id' | 'createdAt'>) => void;
  onClosePOSShift: (shiftId: string) => void;
  onAddPOSDiscount: (disc: Omit<POSDiscount, 'id' | 'createdAt'>) => void;
  onUpdatePOSDiscount: (id: string, updates: Partial<POSDiscount>) => void;
  onCreatePOSReturn: (ret: Omit<POSReturn, 'id' | 'returnNumber' | 'status' | 'createdAt'>) => void;
  onApprovePOSReturn: (returnId: string) => void;
  onGeneratePOSReport: (report: any) => void;
  // Sales Orders
  salesOrders: SalesOrder[];
  onCreateSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => void;
  onUpdateSalesOrder: (orderId: string, updates: Partial<SalesOrder>) => void;
  // Sales Customers
  salesCustomers: SalesCustomer[];
  onCreateSalesCustomer: (cust: Omit<SalesCustomer, 'id' | 'totalOrders' | 'totalSpend' | 'lastOrderDate' | 'createdAt'>) => void;
  onUpdateSalesCustomer: (custId: string, updates: Partial<SalesCustomer>) => void;
  onDeleteSalesCustomer: (custId: string) => void;
  // Sales Quotations
  salesQuotations: SalesQuotation[];
  onCreateSalesQuotation: (quote: Omit<SalesQuotation, 'id' | 'quoteNumber' | 'status' | 'createdAt'>) => void;
  onUpdateSalesQuotation: (quoteId: string, updates: Partial<SalesQuotation>) => void;
  onDeleteSalesQuotation: (quoteId: string) => void;
  // Sales Targets
  salesTargets: SalesTarget[];
  onCreateSalesTarget: (target: Omit<SalesTarget, 'id' | 'actualAmount' | 'createdAt'>) => void;
  onUpdateSalesTarget: (targetId: string, updates: Partial<SalesTarget>) => void;
  onDeleteSalesTarget: (targetId: string) => void;
  // Knowledge Base
  kbArticles: KBArticle[];
  onAddKbArticle: (article: Omit<KBArticle, 'id' | 'views' | 'createdAt'>) => void;
  // LMS Courses
  lmsCourses: LMSCourse[];
  onAddLmsCourse: (course: Omit<LMSCourse, 'id' | 'enrolled' | 'completion' | 'createdAt'>) => void;
  // Communication announcements
  announcements: CommunicationAnnouncement[];
  onAddAnnouncement: (announcement: Omit<CommunicationAnnouncement, 'id' | 'date' | 'createdAt'>) => void;
  // Email templates
  emailTemplates: EmailTemplate[];
  onAddEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => void;
}

export const ViewModal = ({ title, subtitle, onClose, size = '2xl', children }: {
  title: string; subtitle?: string; onClose: () => void; size?: 'sm' | 'md' | 'lg' | '2xl' | '3xl'; children: React.ReactNode;
}) => {
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className={`w-full ${sizeMap[size]} rounded-xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><i className="bi bi-x-lg text-lg"></i></button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Row-click modal helpers ──────────────────────────────────────────────────
export function useRowModal<T>() {
  const [selected, setSelected] = useState<T | null>(null);
  return { selected, open: (row: T) => setSelected(row), close: () => setSelected(null) };
}

// Smart value formatting helpers for detail modals
const STATUS_RE = /^(pending|sent|draft|open|active|upcoming|in progress|approved|paid|posted)$/i;
const DANGER_RE = /^(void|rejected|closed|locked|overdue|failed|deleted|cancelled|terminated)$/i;
export function formatModalValue(val: any): React.ReactNode {
  if (val === null || val === undefined || val === '') return <span className="text-slate-300">—</span>;
  if (typeof val === 'boolean') {
    return val
      ? <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><i className="bi bi-check-circle-fill text-xs" />Yes</span>
      : <span className="inline-flex items-center gap-1 text-slate-400 font-semibold"><i className="bi bi-dash-circle text-xs" />No</span>;
  }
  if (typeof val === 'number') {
    if (Math.abs(val) >= 1000) return <span className="font-sans tabular-nums">${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>;
    return <span className="font-sans tabular-nums">{val.toLocaleString()}</span>;
  }
  const s = String(val);
  if (STATUS_RE.test(s) || DANGER_RE.test(s)) {
    const variant = DANGER_RE.test(s) ? 'danger' : (s.toLowerCase() === 'approved' || s.toLowerCase() === 'paid' || s.toLowerCase() === 'posted') ? 'success' : 'info';
    return <Badge label={s} variant={variant} />;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return <span className="font-sans">{d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
  }
  return s;
}

export function RowModal<T extends Record<string, any>>({ row, fields, title, subtitle, onClose, size, icon, accentColor }: {
  row: T; fields: { label: string; key: string; mono?: boolean; format?: (val: any, row: T) => React.ReactNode; section?: string; icon?: string; full?: boolean }[];
  title: (row: T) => string; subtitle?: (row: T) => string; onClose: () => void; size?: 'sm' | 'md' | 'lg' | '2xl' | '3xl';
  icon?: string; accentColor?: string;
}) {
  if (!row) return null;
  const accent = accentColor || '#0f172a';
  const sections = Array.from(new Set(fields.map(f => f.section || '')));
  const renderField = (f: any) => (
    <div key={f.key} className={`rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 ${f.full ? 'col-span-2 sm:col-span-3' : ''}`}>
      <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1">
        {f.icon && <i className={`${f.icon} text-[10px]`} />}{f.label}
      </div>
      <div className={`data-value font-semibold text-slate-900 ${f.mono ? 'font-mono' : ''}`}>
        {f.format ? f.format(row[f.key], row) : formatModalValue(row[f.key])}
      </div>
    </div>
  );
  return (
    <ViewModal title={title(row)} subtitle={subtitle?.(row)} onClose={onClose} size={size}>
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1"
        style={{ background: `${accent}0d`, border: `1px solid ${accent}1f` }}
      >
        <div
          className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ background: accent }}
        >
          <i className={`${icon || 'bi bi-card-list'} text-lg`} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{title(row)}</div>
          {subtitle?.(row) && <div className="text-xs text-slate-500 truncate">{subtitle(row)}</div>}
        </div>
      </div>
      {sections.length === 1
        ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{fields.map(renderField)}</div>
        : sections.map(sec => (
            <div key={sec} className="mb-5 last:mb-0">
              {sec && <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: accent }} />{sec}</h3>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fields.filter(f => (f.section || '') === sec).map(renderField)}
              </div>
            </div>
          ))}
    </ViewModal>
  );
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between pb-5 border-b border-slate-200 mb-6">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 page-title">{title}</h1>
      <p className="text-sm text-slate-500 mt-0.5 page-subtitle">{subtitle}</p>
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, sub, icon, accent = false, color = '' }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean; color?: string; key?: React.Key;
}) => (
  <div className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${accent ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
    <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent ? 'bg-white/10' : 'bg-slate-200/60'}`} />
    <div className="flex items-center justify-between">
      <span className={`stat-label ${accent ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm ${accent ? 'bg-white/10 text-slate-200' : 'bg-slate-900/5 text-slate-700'}`}>
        <i className={`${icon} ${color || ''}`}></i>
      </span>
    </div>
    <div className={`text-3xl font-bold tracking-tight font-sans tabular-nums leading-none ${accent ? 'text-white' : color || 'text-slate-900'}`}>{value}</div>
    {sub && <p className={`text-xs leading-snug ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

export const Badge = ({ label, variant = 'default' }: { label: string; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' }) => {
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

export const Th = ({ children, right = false }: { children: React.ReactNode; right?: boolean; key?: React.Key }) => (
  <th className={`px-4 py-3 section-title text-slate-400 ${right ? 'text-right' : ''}`}>{children}</th>
);

export const TableHead = ({ cols }: { cols: { label: string; right?: boolean }[] }) => (
  <thead className="bg-slate-50/60 border-b border-slate-100">
    <tr>{cols.map(c => <Th key={c.label} right={c.right}>{c.label}</Th>)}</tr>
  </thead>
);

export const EmptyRow = ({ cols, message }: { cols: number; message: string }) => (
  <tr><td colSpan={cols} className="text-center py-10 data-value-small text-slate-400">{message}</td></tr>
);

export const PrimaryBtn = ({ onClick, icon, children, type = 'button', disabled }: { onClick?: () => void; icon?: string; children: React.ReactNode; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold btn px-4 py-2 rounded-lg transition-all shadow-xs ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    {icon && <i className={`${icon} text-xs`}></i>}{children}
  </button>
);

export const SecBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold btn px-4 py-2 rounded-lg transition-all cursor-pointer">
    {children}
  </button>
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block data-label text-slate-700 mb-1">{children}</label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 ${props.className ?? ''}`} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 ${props.className ?? ''}`} />
);
