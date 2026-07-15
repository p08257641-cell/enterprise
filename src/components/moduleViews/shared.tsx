/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Company, User, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice,
  InventoryItem, SupportTicket, AuditLog, APIKey, Department, Branch,
  LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, JournalEntry, Expense, FiscalPeriod, OpeningBalance,
  Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate,
  TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline
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
  <div className={`rounded-xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-200 ${accent ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
    <div className="flex items-center justify-between">
      <span className="stat-label">{label}</span>
      <i className={`${icon} text-sm ${accent ? 'text-slate-400' : 'text-slate-300'}`}></i>
    </div>
    <div className={`text-2xl font-bold tracking-tight font-sans tabular-nums ${accent ? 'text-white' : color || 'text-slate-900'}`}>{value}</div>
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

export const PrimaryBtn = ({ onClick, icon, children }: { onClick?: () => void; icon?: string; children: React.ReactNode }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold btn px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
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
