/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Applicant, 
  Company, User, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice,
  InventoryItem, SupportTicket, AuditLog, APIKey, Department, Branch, CustomRole, ApprovalPolicy, PendingApproval,
  LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, SalaryBand, JournalEntry, Expense, FiscalPeriod, OpeningBalance,
  Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate,
  TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline,   OnboardingRecord,
  POSCategory, POSTerminal, POSShift, POSDiscount, POSReturn, POSDailyReport, POSProduct, POSCustomer, POSSale, SalesOrder, SalesCustomer, SalesQuotation, SalesTarget, PayrollTaxConfig, AttendanceSettings, KBArticle, LMSCourse, CommunicationAnnouncement, EmailTemplate, ProjectTask, ProjectMilestone,
  Vendor, PurchaseOrder, RFQ, WorkOrder, BOMItem, QualityCheck, MaintenanceTask, ManagedDocument, ExitRequest, BankAccountUpdateRequest
 } from '../../types';

export interface ModuleViewsProps {
  searchTerm?: string;
  activeView: string;
  selectedCompany: Company;
  selectedUser: User;
  users: User[];
  customRoles: CustomRole[];
  employees: Employee[];
  applicants?: any[];
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
  onGenerateLeads?: () => void;
  onMoveLead: (leadId: string, status: CRMLead['status']) => void;
  onAssignLead: (leadId: string, userId: string, userName: string, department: string) => void;
  onAddComment: (leadId: string, content: string) => void;
  onAddInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'status'>) => void;
  onPayInvoice: (invId: string) => void;
  onAdjustStock: (itemId: string, qty: number) => void;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'assignedTo' | 'createdAt'>) => void;
  onUpdateTicket: (id: string, updates: { status?: string; department?: string; assignedTo?: string; reply?: { message: string }; repliedBy?: string; repliedByRole?: 'Customer' | 'Agent' | 'Admin' }) => void;
  onInviteUser: (usr: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => void;
  onUpdateUserSignature?: any;
  onAddApplicant?: any;
  onUpdateApplicant?: any;
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
  onUpdateBankAccount: (id: string, updates: Partial<import('../../types').BankAccount>) => void;
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
  onCreateComplianceCheck: (check: { companyId: string; category: string; title: string; description: string; dueDate: string; assignee: string; assigneeName: string; createdBy: string; status?: string }) => void;
  onUpdateComplianceCheck: (id: string, values: any) => void;
  onDeleteComplianceCheck: (id: string) => void;
  onDeletePolicyDocument?: (id: string) => void;
  onClearIncidents?: () => void;
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
  // Attendance settings (DB-backed)
  attendanceSettings?: AttendanceSettings | null;
  onUpdateAttendanceSettings?: (companyId: string, cfg: Partial<AttendanceSettings>) => void;
  // Super Admin plan assignment
  tenants: Company[];
  onAssignPlan: (companyId: string, moduleIds: string[], billingPlan: Company['billingPlan']) => void;
  onUpdateTenantContract?: (tenantId: string, updates: Partial<Company>) => void;
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
  bankAccountUpdates?: import('../../types').BankAccountUpdateRequest[];
  onRequestBankAccountUpdate?: (input: { companyId: string; employeeId: string; employeeName: string; bankName: string; accountName: string; accountNumber: string; sortCode?: string; routingNumber?: string }) => void;
  onApproveBankAccountUpdate?: (id: string, employeeId: string, newBankAccount: string, approverName: string) => void;
  onRejectBankAccountUpdate?: (id: string, processedBy: string) => void;
  profileUpdateRequests?: import('../../types').ProfileUpdateRequest[];
  onSubmitProfileUpdate?: (input: { companyId: string; employeeId: string; employeeName: string; department: string; field: string; label: string; currentValue: string; newValue: string }) => void;
  onApproveProfileUpdate?: (id: string) => void;
  onRejectProfileUpdate?: (id: string, reason?: string) => void;
  // LMS Courses
  lmsCourses: LMSCourse[];
  onAddLmsCourse: (course: Omit<LMSCourse, 'id' | 'enrolled' | 'completion' | 'createdAt'>) => void;
  // Communication announcements
  announcements: CommunicationAnnouncement[];
  onAddAnnouncement: (announcement: Omit<CommunicationAnnouncement, 'id' | 'date' | 'createdAt'>) => void;
  // Email templates
  emailTemplates: EmailTemplate[];
  onAddEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => void;
  // Team chat
  chatMessages: any[];
  chatGroups?: import('../../types').ChatGroup[];
  chatReads?: any[];
  onSendChatMessage: (message: { companyId: string; threadId: string; senderId: string; senderName: string; message: string }) => void;
  onMarkThreadRead?: (threadId: string) => void;
  onCreateChatGroup?: (group: Omit<import('../../types').ChatGroup, 'id' | 'createdAt' | 'companyId' | 'createdBy'>) => void;
  onUpdateChatGroupMembers?: (groupId: string, members: string[]) => void;
  // Voting / Polls
  polls: import('../../types').Poll[];
  pollOptions: import('../../types').PollOption[];
  pollVotes: import('../../types').PollVote[];
  onCreatePoll: (poll: { companyId: string; title: string; description: string; category: string; createdBy: string; createdByName: string; anonymous: boolean; endDate: string; options: { label: string; nomineeId?: string; nomineeName?: string }[] }) => void;
  onClosePoll: (pollId: string) => void;
  onUpdatePoll: (pollId: string, updates: { endDate?: string; status?: string }) => void;
  onVotePoll: (pollId: string, optionId: string, voterId: string, voterName: string) => void;
  // Company Image Gallery
  companyImages: import('../../types').CompanyImage[];
  onUploadCompanyImage: (image: { companyId: string; title: string; description: string; category: string; imageData: string; uploadedBy: string; uploadedByName: string }) => void;
  onDeleteCompanyImage: (imageId: string) => void;
  // Project tasks & milestones
  projectTasks: ProjectTask[];
  projectMilestones: ProjectMilestone[];
  onCreateProjectTask: (task: { companyId: string; title: string; description?: string; status?: string; priority?: string; assignee?: string; assigneeName?: string; due?: string }) => void;
  onUpdateProjectTask: (id: string, values: any) => void;
  onDeleteProjectTask: (id: string) => void;
  onCreateProjectMilestone: (ms: { companyId: string; name: string; due?: string; status?: string; completion?: number }) => void;
  onUpdateProjectMilestone: (id: string, values: any) => void;
  onDeleteProjectMilestone: (id: string) => void;
  // Procurement
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  rfqs: RFQ[];
  onCreateVendor: (data: { name: string; type: string; contact: string; email: string; rating: number }) => void;
  onUpdateVendor: (id: string, values: any) => void;
  onDeleteVendor: (id: string) => void;
  onCreatePurchaseOrder: (data: { vendorId: string; vendorName: string; item: string; qty: number; unitPrice: number }) => void;
  onUpdatePurchaseOrder: (id: string, values: any) => void;
  onDeletePurchaseOrder: (id: string) => void;
  onCreateRFQ: (data: { item: string; vendorsInvited: number }) => void;
  onUpdateRFQ: (id: string, values: any) => void;
  onDeleteRFQ: (id: string) => void;
  // Manufacturing
  workOrders: WorkOrder[];
  bomItems: BOMItem[];
  qualityChecks: QualityCheck[];
  onCreateWorkOrder: (data: { product: string; qty: number; line: string; dueDate?: string }) => void;
  onUpdateWorkOrder: (id: string, values: any) => void;
  onDeleteWorkOrder: (id: string) => void;
  onCreateBOMItem: (data: { product: string; part: string; qty: number; unit: string; cost: number }) => void;
  onDeleteBOMItem: (id: string) => void;
  onCreateQualityCheck: (data: { check: string; result: string; inspector: string; notes?: string }) => void;
  onUpdateQualityCheck: (id: string, values: any) => void;
  onDeleteQualityCheck: (id: string) => void;
  // Asset Maintenance
  maintenanceTasks: MaintenanceTask[];
  onCreateMaintenanceTask: (data: { assetId: string; assetName: string; task: string; due: string; owner: string }) => void;
  onUpdateMaintenanceTask: (id: string, values: any) => void;
  onDeleteMaintenanceTask: (id: string) => void;
  // Documents
  managedDocuments: ManagedDocument[];
  onCreateDocument: (data: { name: string; type: string; size?: string; visibility?: string; sharedWith?: string[] }) => void;
  onUpdateDocument: (id: string, values: any) => void;
  onDeleteDocument: (id: string) => void;
  // Exit Requests
  exitRequests: ExitRequest[];
  onSubmitExitRequest: (input: { companyId: string; employeeId: string; employeeName: string; department: string; exitType: string; lastWorkingDay: string; reason: string }) => void;
  onApproveExitRequest: (id: string, status: string, approverName: string) => void;
  onRejectExitRequest: (id: string, rejectedBy: string) => void;
  // Bank Account Updates
  onUpdateCompanySettings: (companyId: string, updates: Record<string, any>) => void;
  onCreateRole: (roleInput: { name: string; description: string; modules: string[]; submenus: string[]; crudPermissions?: string[] }) => void;
  onUpdateRole: (roleId: string, updates: { name?: string; description?: string; modules?: string[]; submenus?: string[]; crudPermissions?: string[] }) => void;
  onDeleteRole: (roleId: string) => void;
  approvalPolicies: ApprovalPolicy[];
  pendingApprovals: PendingApproval[];
  onUpdateApprovalPolicies: (policies: { module: string; description: string; approverRoles: string[]; enabled: boolean }[]) => void;
  onRefreshPendingApprovals: () => void;
}

export const ViewModal = ({ title, subtitle, onClose, size = '2xl', actions, children }: {
  title: string; subtitle?: string; onClose: () => void; size?: 'sm' | 'md' | 'lg' | '2xl' | '3xl'; actions?: React.ReactNode; children: React.ReactNode;
}) => {
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fade-in overflow-hidden">
      <div className={`w-full min-w-0 ${sizeMap[size]} max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <h2 className="fs-sm fw-semibold text-slate-900 truncate">{title}</h2>
            {subtitle && <p className="fs-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0 ml-3">
            {actions && <div>{actions}</div>}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><i className="bi bi-x-lg fs-lg"></i></button>
          </div>
        </div>
        <div className="overflow-y-auto px-4 sm:px-6 py-5 space-y-5 flex-1">{children}</div>
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
      ? <span className="inline-flex items-center gap-1 text-emerald-600 fw-semibold"><i className="bi bi-check-circle-fill fs-xs" />Yes</span>
      : <span className="inline-flex items-center gap-1 text-slate-400 fw-semibold"><i className="bi bi-dash-circle fs-xs" />No</span>;
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

export function RowModal<T extends Record<string, any>>({ row, fields, title, subtitle, onClose, size, icon, accentColor, actions }: {
  row: T; fields: { label: string; key: string; mono?: boolean; format?: (val: any, row: T) => React.ReactNode; section?: string; icon?: string; full?: boolean }[];
  title: (row: T) => string; subtitle?: (row: T) => string; onClose: () => void; size?: 'sm' | 'md' | 'lg' | '2xl' | '3xl';
  icon?: string; accentColor?: string; actions?: (row: T) => React.ReactNode;
}) {
  if (!row) return null;
  const accent = accentColor || '#0f172a';
  const sections = Array.from(new Set(fields.map(f => f.section || '')));
  const renderField = (f: any) => (
    <div key={f.key} className={`rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 ${f.full ? 'col-span-1 sm:col-span-2 md:col-span-3' : ''}`}>
      <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1">
        {f.icon && <i className={`${f.icon} text-[10px]`} />}{f.label}
      </div>
      <div className={`data-value fw-semibold text-slate-900 ${f.mono ? 'font-mono' : ''}`}>
        {f.format ? f.format(row[f.key], row) : formatModalValue(row[f.key])}
      </div>
    </div>
  );
  return (
    <ViewModal title={title(row)} subtitle={subtitle?.(row)} onClose={onClose} size={size} actions={actions ? actions(row) : undefined}>
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1"
        style={{ background: `${accent}0d`, border: `1px solid ${accent}1f` }}
      >
        <div
          className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ background: accent }}
        >
          <i className={`${icon || 'bi bi-card-list'} fs-lg`} />
        </div>
        <div className="min-w-0">
          <div className="fs-sm fw-bold text-slate-900 truncate">{title(row)}</div>
          {subtitle?.(row) && <div className="fs-xs text-slate-500 truncate">{subtitle(row)}</div>}
        </div>
      </div>
      {sections.length === 1
        ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{fields.map(renderField)}</div>
        : sections.map(sec => (
            <div key={sec} className="mb-5 last:mb-0">
              {sec && <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: accent }} />{sec}</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {fields.filter(f => (f.section || '') === sec).map(renderField)}
              </div>
            </div>
          ))}
    </ViewModal>
  );
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-5 border-b border-slate-200 mb-6 gap-3">
    <div>
      <h1 className="fs-xl fw-bold tracking-tight text-slate-900 page-title">{title}</h1>
      <p className="fs-sm text-slate-500 mt-0.5 page-subtitle">{subtitle}</p>
    </div>
    {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, sub, icon, accent = false, color = '' }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean; color?: string; key?: React.Key;
}) => (
  <div className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${accent ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
    <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent ? 'bg-white/10' : 'bg-slate-200/60'}`} />
    <div className="flex items-center justify-between">
      <span className={`stat-label ${accent ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl fs-sm ${accent ? 'bg-white/10 text-slate-200' : 'bg-slate-900/5 text-slate-700'}`}>
        <i className={`${icon} ${color || ''}`}></i>
      </span>
    </div>
    <div className={`fs-3xl fw-bold tracking-tight font-sans tabular-nums leading-none ${accent ? 'text-white' : color || 'text-slate-900'}`}>{value}</div>
    {sub && <p className={`fs-xs leading-snug ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
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

export const Th = ({ children, right = false, colSpan }: { children: React.ReactNode; right?: boolean; colSpan?: number; key?: React.Key }) => (
  <th colSpan={colSpan} className={`px-4 py-3 section-title text-slate-400 ${right ? 'text-right' : ''}`}>{children}</th>
);

export const TableHead = ({ cols }: { cols: { label: string; right?: boolean; colSpan?: number }[] }) => (
  <thead className="bg-slate-50/60 border-b border-slate-100">
    <tr>{cols.map(c => <Th key={c.label} right={c.right} colSpan={c.colSpan}>{c.label}</Th>)}</tr>
  </thead>
);

export const EmptyRow = ({ cols, message }: { cols: number; message: string }) => (
  <tr><td colSpan={cols} className="text-center py-10 data-value-small text-slate-400">{message}</td></tr>
);

export const PrimaryBtn = ({ onClick, icon, children, type = 'button', disabled }: { onClick?: () => void; icon?: string; children: React.ReactNode; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white fw-semibold btn px-4 py-2 rounded-lg transition-all shadow-xs ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    {icon && <i className={`${icon} fs-xs`}></i>}{children}
  </button>
);

export const SecBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold btn px-4 py-2 rounded-lg transition-all cursor-pointer">
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

export const toast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  if (typeof window !== 'undefined') {
    alert(`[${type.toUpperCase()}] ${msg}`);
  }
};

