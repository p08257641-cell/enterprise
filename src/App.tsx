/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company, User, Employee, Applicant, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice, InventoryItem, SupportTicket, AuditLog, APIKey, ERPWorkflow, Department, Branch, POSProduct, POSCustomer, POSSale, POSCategory, POSTerminal, POSShift, POSDiscount, POSReturn, POSDailyReport, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, SalaryBand, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline, OnboardingRecord, SalesOrder, SalesCustomer, SalesQuotation, SalesTarget, PayrollTaxConfig, AttendanceSettings, KBArticle, LMSCourse, CommunicationAnnouncement, WorkflowTrigger, EmailTemplate, ProjectTask, ProjectMilestone, Vendor, PurchaseOrder, RFQ, WorkOrder, BOMItem, QualityCheck, MaintenanceTask, ManagedDocument, ExitRequest, BankAccountUpdateRequest, Poll, PollOption, PollVote, CompanyImage, CustomRole, ApprovalPolicy, PendingApproval, ChatGroup } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RoleDashboards } from './components/RoleDashboards';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { AIAssistant } from './components/AIAssistant';
import { ModuleViews } from './components/ModuleViews';
import { TenantSetup } from './components/TenantSetup';
import { FadeIn, Skeleton } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingChat } from './components/FloatingChat';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './contexts/AuthContext';
// No lucide-react imports needed
import { modalAlert, toast } from './utils/modal';

const safeJson = async (res: Response): Promise<any> => {
  try {
    if (!res.ok) {
      if (res.status >= 400) {
        toast(`Error loading data: ${res.status} ${res.statusText}`, 'error', 'Data Load Error');
      }
      return [];
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch (e) {
    return [];
  }
};

export default function App() {
  const { user: authUser, token, isLoading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Core database tables
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
const [onboardings, setOnboardings] = useState<OnboardingRecord[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [crmActivities, setCrmActivities] = useState<CRMActivityLog[]>([]);
  const [crmTasks, setCrmTasks] = useState<CRMTask[]>([]);
  const [crmEmails, setCrmEmails] = useState<CRMEmailLog[]>([]);
  const [glAccounts, setGlAccounts] = useState<GLAccount[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>([]);
  const [lmsCourses, setLmsCourses] = useState<LMSCourse[]>([]);
  const [announcements, setAnnouncements] = useState<CommunicationAnnouncement[]>([]);
  const [workflowTriggers, setWorkflowTriggers] = useState<WorkflowTrigger[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatReads, setChatReads] = useState<any[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [companyImages, setCompanyImages] = useState<CompanyImage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [workflows, setWorkflows] = useState<ERPWorkflow[]>([]);

  // Synchronised HR & Payroll State
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [okrs, setOkrs] = useState<OKRRecord[]>([]);
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [payrollTaxConfig, setPayrollTaxConfig] = useState<PayrollTaxConfig | null>(null);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);
  const [payrollGroups, setPayrollGroups] = useState<PayrollGroup[]>([]);
  const [salaryBands, setSalaryBands] = useState<SalaryBand[]>([]);

  // POS Module State
  const [posProducts, setPosProducts] = useState<POSProduct[]>([]);
  const [posCustomers, setPosCustomers] = useState<POSCustomer[]>([]);
  const [posSales, setPosSales] = useState<POSSale[]>([]);
  const [posCategories, setPosCategories] = useState<POSCategory[]>([]);
  const [posTerminals, setPosTerminals] = useState<POSTerminal[]>([]);
  const [posShifts, setPosShifts] = useState<POSShift[]>([]);
  const [posDiscounts, setPosDiscounts] = useState<POSDiscount[]>([]);
  const [posReturns, setPosReturns] = useState<POSReturn[]>([]);
  const [posDailyReports, setPosDailyReports] = useState<POSDailyReport[]>([]);

  // Core Ledger State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriod[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);

  // Tier 2 State
  const [bills, setBills] = useState<Bill[]>([]);
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [salesCustomers, setSalesCustomers] = useState<SalesCustomer[]>([]);
  const [salesQuotations, setSalesQuotations] = useState<SalesQuotation[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliation[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [depreciationEntries, setDepreciationEntries] = useState<DepreciationEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);

  // Tier 3 State
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [intercompanyTxns, setIntercompanyTxns] = useState<IntercompanyTransaction[]>([]);
  const [consolidationRules, setConsolidationRules] = useState<ConsolidationRule[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditSnapshots, setAuditSnapshots] = useState<AuditSnapshot[]>([]);
  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocument[]>([]);
  const [filingDeadlines, setFilingDeadlines] = useState<FilingDeadline[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);

  // Operations & Projects module state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [managedDocuments, setManagedDocuments] = useState<ManagedDocument[]>([]);
  const [exitRequests, setExitRequests] = useState<ExitRequest[]>([]);
  const [bankAccountUpdates, setBankAccountUpdates] = useState<BankAccountUpdateRequest[]>([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState<import('./types').ProfileUpdateRequest[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [approvalPolicies, setApprovalPolicies] = useState<ApprovalPolicy[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  // Navigation states
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTenantSetup, setShowTenantSetup] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Licensing Matrice config panel modal state inside tenant settings
  const [showLicensingPanel, setShowLicensingPanel] = useState(false);

  // Initial Fetch on mount (waits for auth to be ready)
  useEffect(() => {
    if (authLoading || !token) return;
    async function loadData() {
      try {
        const [cRes, uRes, eRes, appRes, dRes, bRes, lRes, aRes, iRes, tRes, wRes, kRes, logRes, posProdRes, posCustRes, posSalesRes, posCatRes, posTermRes, posShiftRes, posDiscRes, posRetRes, posReportRes, leavesRes, attRes, okrsRes, slipsRes, jeRes, expRes, fpRes, obRes, billRes, bpPayRes, cpRes, baRes, btxRes, brRes, faRes, deRes, budRes, ccRes, onbRes, pgRes, sbRes, soRes, scRes, sqRes, stRes, kbRes, lmsRes, annRes, wtRes, etRes, chatRes, chatGroupsRes, pollsRes, pollOptsRes, pollVotesRes, imgRes, rolesRes, policiesRes, approvalsRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/users'),
          fetch('/api/employees'),
            fetch('/api/applicants'),
          fetch('/api/departments'),
          fetch('/api/branches'),
          fetch('/api/leads'),
          fetch('/api/accounting'),
          fetch('/api/inventory'),
          fetch('/api/tickets'),
          fetch('/api/workflows'),
          fetch('/api/apikeys'),
          fetch('/api/audit-logs'),
          fetch('/api/pos/products'),
          fetch('/api/pos/customers'),
          fetch('/api/pos/sales'),
          fetch('/api/pos/categories'),
          fetch('/api/pos/terminals'),
          fetch('/api/pos/shifts'),
          fetch('/api/pos/discounts'),
          fetch('/api/pos/returns'),
          fetch('/api/pos/reports/daily'),
          fetch('/api/leaves'),
          fetch('/api/attendance'),
          fetch('/api/okrs'),
          fetch('/api/payslips'),
          fetch('/api/journal-entries'),
          fetch('/api/expenses'),
          fetch('/api/fiscal-periods'),
          fetch('/api/opening-balances'),
          fetch('/api/bills'),
          fetch('/api/bill-payments'),
          fetch('/api/customer-payments'),
          fetch('/api/bank-accounts'),
          fetch('/api/bank-transactions'),
          fetch('/api/bank-reconciliations'),
          fetch('/api/fixed-assets'),
          fetch('/api/depreciation-entries'),
          fetch('/api/budgets'),
          fetch('/api/cost-centers'),
          fetch('/api/onboardings'),
          fetch('/api/payroll-groups'),
          fetch('/api/salary-bands'),
          fetch('/api/sales-orders'),
          fetch('/api/sales-customers'),
          fetch('/api/sales-quotations'),
          fetch('/api/sales-targets'),
          fetch('/api/kb-articles'),
          fetch('/api/lms-courses'),
          fetch('/api/announcements'),
          fetch('/api/workflow-triggers'),
          fetch('/api/email-templates'),
          fetch(`/api/chat/messages?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/chat/groups?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/polls?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/poll-options?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/poll-votes?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/company-images?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/roles?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/approval-policies?companyId=${authUser?.companyId || ''}`),
          fetch(`/api/pending-approvals?companyId=${authUser?.companyId || ''}`)
        ]);

        const cData = await safeJson(cRes);
        const uData = await safeJson(uRes);
        const eData = await safeJson(eRes);
        const dData = await safeJson(dRes);
        const bData = await safeJson(bRes);
        const lData = await safeJson(lRes);
        const accData = await safeJson(aRes);
        const invData = await safeJson(iRes);
        const tData = await safeJson(tRes);
        const wData = await safeJson(wRes);
        const kData = await safeJson(kRes);
        const logData = await safeJson(logRes);
        const posProdData = await safeJson(posProdRes);
        const posCustData = await safeJson(posCustRes);
        const posSalesData = await safeJson(posSalesRes);
        const posCatData = await safeJson(posCatRes);
        const posTermData = await safeJson(posTermRes);
        const posShiftData = await safeJson(posShiftRes);
        const posDiscData = await safeJson(posDiscRes);
        const posRetData = await safeJson(posRetRes);
        const posReportData = await safeJson(posReportRes);
        const leavesData = await safeJson(leavesRes);
        const attData = await safeJson(attRes);
        const okrsData = await safeJson(okrsRes);
        const slipsData = await safeJson(slipsRes);
        const jeData = await safeJson(jeRes);
        const expData = await safeJson(expRes);
        const fpData = await safeJson(fpRes);
        const obData = await safeJson(obRes);
        const billData = await safeJson(billRes);
        const bpPayData = await safeJson(bpPayRes);
        const cpData = await safeJson(cpRes);
        const baData = await safeJson(baRes);
        const btxData = await safeJson(btxRes);
        const brData = await safeJson(brRes);
        const faData = await safeJson(faRes);
        const deData = await safeJson(deRes);
        const budData = await safeJson(budRes);
        const ccData = await safeJson(ccRes);
        const onbData = await safeJson(onbRes);
        const pgData = await safeJson(pgRes);
        const sbData = await safeJson(sbRes);
        const soData = await safeJson(soRes);
        const kbData = await safeJson(kbRes);
        const lmsData = await safeJson(lmsRes);
        const annData = await safeJson(annRes);
        const wtData = await safeJson(wtRes);
        const etData = await safeJson(etRes);
        const chatData = await safeJson(chatRes);
        const chatGroupsData = await safeJson(chatGroupsRes);
        const pollsData = await safeJson(pollsRes);
        const pollOptsData = await safeJson(pollOptsRes);
        const pollVotesData = await safeJson(pollVotesRes);
        const imgData = await safeJson(imgRes);
        const rolesData = await safeJson(rolesRes);
        const policiesData = await safeJson(policiesRes);
        const approvalsData = await safeJson(approvalsRes);

        setCompanies(cData);
        setUsers(uData);
        setEmployees(eData);
        setDepartments(dData);
        setBranches(bData);
        setLeads(lData);
        setGlAccounts(accData.accounts || []);
        setInvoices(accData.invoices || []);
        setInventory(invData);
        setTickets(tData);
        setWorkflows(wData);
        setApiKeys(kData);
        setAuditLogs(logData);
        setPosProducts(posProdData);
        setPosCustomers(posCustData);
        setPosSales(posSalesData);
        setPosCategories(posCatData);
        setPosTerminals(posTermData);
        setPosShifts(posShiftData);
        setPosDiscounts(posDiscData);
        setPosReturns(posRetData);
        setPosDailyReports(posReportData);
        setLeaves(leavesData);
        setAttendance(attData);
        setOkrs(okrsData);
        setOnboardings(onbData);
        setPayrollGroups(pgData);
        setSalaryBands(sbData);
        setSalesOrders(soData);

        const scData = await safeJson(scRes);
        const sqData = await safeJson(sqRes);
        const stData = await safeJson(stRes);
        setSalesCustomers(scData);
        setSalesQuotations(sqData);
        setSalesTargets(stData);
        setKbArticles(kbData);
        setLmsCourses(lmsData);
        setAnnouncements(annData);
        setWorkflowTriggers(wtData);
        setEmailTemplates(etData);
        setChatMessages(chatData);
        setChatGroups(chatGroupsData);
        setPolls(pollsData);
        setPollOptions(pollOptsData);
        setPollVotes(pollVotesData);
        setCompanyImages(imgData);
        setCustomRoles(Array.isArray(rolesData) ? rolesData : []);
        setApprovalPolicies(policiesData);
        setPendingApprovals(approvalsData);

        // Fetch CRM activities
        const actRes = await fetch('/api/crm-activities');
        setCrmActivities(await safeJson(actRes));

        // Fetch CRM tasks
        const taskRes = await fetch('/api/crm-tasks');
        setCrmTasks(await safeJson(taskRes));

        // Fetch CRM emails
        const emailRes = await fetch('/api/crm-emails');
        setCrmEmails(await safeJson(emailRes));
        setPayslips(slipsData);
        setJournalEntries(jeData);
        setExpenses(expData);
        setFiscalPeriods(fpData);
        setOpeningBalances(obData);
        setBills(billData);
        setBillPayments(bpPayData);
        setCustomerPayments(cpData);
        setBankAccounts(baData);
        setBankTransactions(btxData);
        setBankReconciliations(brData);
        setFixedAssets(faData);
        setDepreciationEntries(deData);
        setBudgets(budData);
        setCostCenters(ccData);

        // Fetch currency rates separately
        try {
          const crRes = await fetch('/api/currency-rates');
          const crData = await safeJson(crRes);
          setCurrencyRates(crData);
        } catch (e) { console.error('Failed to load currency rates:', e); }

        // Fetch Tier 3 data
        try {
          const [tcRes, trRes, icRes, conRes, compRes, asRes, pdRes, fdRes] = await Promise.all([
            fetch('/api/tax-codes'),
            fetch('/api/tax-returns'),
            fetch('/api/intercompany-transactions'),
            fetch('/api/consolidation-rules'),
            fetch('/api/compliance-checks'),
            fetch('/api/audit-snapshots'),
            fetch('/api/policy-documents'),
            fetch('/api/filing-deadlines')
          ]);
          setTaxCodes(await safeJson(tcRes));
          setTaxReturns(await safeJson(trRes));
          setIntercompanyTxns(await safeJson(icRes));
          setConsolidationRules(await safeJson(conRes));
          setComplianceChecks(await safeJson(compRes));
          setAuditSnapshots(await safeJson(asRes));
          setPolicyDocuments(await safeJson(pdRes));
          setFilingDeadlines(await safeJson(fdRes));
        } catch (e) { console.error('Failed to load Tier 3 data:', e); }

        // Fetch project data
        try {
          const [ptRes, pmRes] = await Promise.all([
            fetch('/api/project-tasks'),
            fetch('/api/project-milestones')
          ]);
          setProjectTasks(await safeJson(ptRes));
          setProjectMilestones(await safeJson(pmRes));
        } catch (e) { console.error('Failed to load project data:', e); }

        // Fetch Operations & Projects module data
        try {
          const [vnRes, poRes, rfqRes, woRes, bomRes, qcRes, mtRes, docRes] = await Promise.all([
            fetch('/api/vendors'),
            fetch('/api/purchase-orders'),
            fetch('/api/rfqs'),
            fetch('/api/work-orders'),
            fetch('/api/bom-items'),
            fetch('/api/quality-checks'),
            fetch('/api/maintenance-tasks'),
            fetch(`/api/documents?companyId=${selectedCompany?.id || ''}&userId=${selectedUser?.id || ''}`),
          ]);
          setVendors(await safeJson(vnRes));
          setPurchaseOrders(await safeJson(poRes));
          setRfqs(await safeJson(rfqRes));
          setWorkOrders(await safeJson(woRes));
          setBomItems(await safeJson(bomRes));
          setQualityChecks(await safeJson(qcRes));
          setMaintenanceTasks(await safeJson(mtRes));
          setManagedDocuments(await safeJson(docRes));
        } catch (e) { console.error('Failed to load Operations & Projects data:', e); }

        // Fetch exit requests
        try {
          const exitRes = await fetch('/api/exit-requests');
          setExitRequests(await safeJson(exitRes));
        } catch (e) { console.error('Failed to load exit requests:', e); }

        // Fetch bank account updates
        try {
          const bauRes = await fetch('/api/bank-account-updates');
          setBankAccountUpdates(await safeJson(bauRes));
        } catch (e) { console.error('Failed to load bank account updates:', e); }

        // Fetch profile update requests
        try {
          const purRes = await fetch('/api/profile-update-requests');
          setProfileUpdateRequests(await safeJson(purRes));
        } catch (e) { console.error('Failed to load profile update requests:', e); }

        // Select default tenant matching the subdomain (e.g. companyA.core360.site)
        // Fall back to the logged-in user's company, or the first company.
        if (cData.length > 0) {
          const hostname = window.location.hostname;
          const subdomainCompany = cData.find((c: any) => c.domain === hostname);
          const userCompany = authUser ? cData.find((c: any) => c.id === authUser.companyId) : null;
          setSelectedCompany(subdomainCompany || userCompany || cData[0]);
        }
        // Set selectedUser to the logged-in user
        if (authUser && uData.length > 0) {
          const match = uData.find((u: any) => u.id === authUser.id);
          if (match) setSelectedUser(match);
        }
        } catch (err) {
          console.error("Error loading full-stack database tables:", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [authLoading, token]);

  // Load payroll tax/deduction config for the active company
  useEffect(() => {
    if (!selectedCompany) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/payroll-tax-config?companyId=${selectedCompany.id}`);
        const cfg = await safeJson(res);
        if (!cancelled) setPayrollTaxConfig(cfg || null);
      } catch (e) { console.error('Failed to load payroll tax config:', e); }
    })();
    return () => { cancelled = true; };
  }, [selectedCompany]);

  // Load attendance settings for the active company
  useEffect(() => {
    if (!selectedCompany) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/attendance-settings?companyId=${selectedCompany.id}`);
        const cfg = await safeJson(res);
        if (!cancelled) setAttendanceSettings(cfg || null);
      } catch (e) { console.error('Failed to load attendance settings:', e); }
    })();
    return () => { cancelled = true; };
  }, [selectedCompany]);

  // Reload chat messages whenever selected company changes
  useEffect(() => {
    if (!selectedCompany || !selectedUser) return;
    let cancelled = false;
    const loadChat = async () => {
      try {
        const [msgsRes, readsRes] = await Promise.all([
          fetch(`/api/chat/messages?companyId=${selectedCompany.id}`),
          fetch(`/api/chat/reads?companyId=${selectedCompany.id}&userId=${selectedUser.id}`)
        ]);
        const msgs = await safeJson(msgsRes);
        const reads = await safeJson(readsRes);
        if (!cancelled) {
          if (Array.isArray(msgs)) setChatMessages(msgs);
          if (Array.isArray(reads)) setChatReads(reads);
        }
      } catch (e) { console.error('Failed to load chat data:', e); }
    };
    loadChat();
    // Poll every 60 seconds to surface messages sent by other users
    const interval = setInterval(loadChat, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedCompany, selectedUser]);

  // --- ACTIONS HANDLERS (PERSIST ON EXPRESS BACKEND IN MEMORY) ---

  const handleAddCompany = async (companyInput: {
    name: string;
    industry: string;
    currency: string;
    timezone: string;
    language: string;
    billingPlan: Company['billingPlan'];
  }) => {
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyInput)
      });
      const newComp = await safeJson(res);
      setCompanies([...companies, newComp]);
      setSelectedCompany(newComp);
      
      // Reload logs and GL accounts
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
      const accRes = await fetch('/api/accounting');
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserSignature = async (id: string, signatureUrl: string) => {
      try {
        const res = await fetch(`/api/users/${id}/signature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signatureUrl, ...actorBody() }) });
        const updated = await safeJson(res);
        if (selectedUser?.id === id) { setSelectedUser(updated); }
      } catch (err) { console.error(err); }
    };

    const handleUpdateCompanySettings = async (companyId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, userId: selectedUser.id, userName: selectedUser.name }),
      });
      const updated = await safeJson(res);
      setCompanies(companies.map(c => c.id === companyId ? updated : c));
      if (selectedCompany.id === companyId) setSelectedCompany(updated);
      toast('Company settings updated', 'success', 'Settings Saved');
    } catch (err) { console.error(err); toast('Failed to update settings', 'error', 'Error'); }
  };

  const handleUpdateSubscription = async (activeMods: string[], premiumFeats: string[], bPlan?: Company['billingPlan']) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeModules: activeMods,
          premiumFeatures: premiumFeats,
          billingPlan: bPlan
        })
      });
      const updated = await safeJson(res);
      
      // Update local states
      setCompanies(companies.map(c => c.id === selectedCompany.id ? updated : c));
      setSelectedCompany(updated);

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPlan = async (companyId: string, activeMods: string[], bPlan: Company['billingPlan']) => {
    try {
      const res = await fetch(`/api/companies/${companyId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeModules: activeMods, billingPlan: bPlan })
      });
      const updated = await safeJson(res);
      setCompanies(companies.map(c => (c.id === companyId ? updated : c)));
      if (selectedCompany && selectedCompany.id === companyId) setSelectedCompany(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddApplicant = async (appInput: Partial<Applicant>) => {
      try {
        const res = await fetch('/api/applicants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: selectedCompany.id, ...appInput })
        });
        const data = await safeJson(res);
        setApplicants([...applicants, data]);
        toast('Applicant added successfully', 'success', 'Added');
      } catch (err) { console.error(err); toast('Failed to add applicant', 'error', 'Error'); }
    };

    const handleUpdateApplicant = async (id: string, updates: Partial<Applicant>) => {
      try {
        const res = await fetch(`/api/applicants/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        const data = await safeJson(res);
        setApplicants(applicants.map(a => a.id === id ? data : a));
      } catch (err) { console.error(err); toast('Failed to update applicant', 'error', 'Error'); }
    };

    const handleAddEmployee = async (empInput: Omit<Employee, Applicant, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empInput)
      });
      const data = await safeJson(res);
      
      setEmployees([...employees, data.employee]);
      setNotificationCount(prev => prev + 1);
      toast('Employee registered successfully', 'success', 'Employee Added');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to register employee', 'error', 'Error');
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await safeJson(res);
      setEmployees(employees.map(e => e.id === id ? { ...e, ...data } : e));
      toast('Employee updated successfully', 'success', 'Updated');
    } catch (err) {
      console.error(err);
      toast('Failed to update employee', 'error', 'Error');
    }
  };

  const handleAddDepartment = async (deptInput: Omit<Department, 'id' | 'employeeCount'>) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptInput)
      });
      const data = await safeJson(res);
      setDepartments([...departments, data]);
      toast('Department created successfully', 'success', 'Department Added');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to create department', 'error', 'Error');
    }
  };

  const handleAddBranch = async (branchInput: Omit<Branch, 'id'>) => {
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchInput)
      });
      const data = await safeJson(res);
      setBranches([...branches, data.branch]);
      toast('Branch created successfully', 'success', 'Branch Added');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to create branch', 'error', 'Error');
    }
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await safeJson(res);
      setDepartments(departments.map(d => d.id === id ? { ...d, ...data } : d));
      toast('Department updated successfully', 'success', 'Updated');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); toast('Failed to update department', 'error', 'Error'); }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      setDepartments(departments.filter(d => d.id !== id));
      toast('Department deleted', 'success', 'Deleted');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); toast('Failed to delete department', 'error', 'Error'); }
  };

  const handleAddOnboarding = async (record: Omit<OnboardingRecord, 'id'>) => {
    try {
      const res = await fetch('/api/onboardings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const data = await safeJson(res);
      setOnboardings([...onboardings, data]);
      toast('Onboarding record created', 'success', 'Onboarding Added');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); toast('Failed to create onboarding', 'error', 'Error'); }
  };

  const handleUpdateOnboarding = async (id: string, updates: Partial<OnboardingRecord>) => {
    try {
      const res = await fetch(`/api/onboardings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await safeJson(res);
      setOnboardings(onboardings.map(o => o.id === id ? { ...o, ...data } : o));
      toast('Onboarding updated', 'success', 'Updated');
    } catch (err) { console.error(err); toast('Failed to update onboarding', 'error', 'Error'); }
  };

  const handleDeleteOnboarding = async (id: string) => {
    try {
      await fetch(`/api/onboardings/${id}`, { method: 'DELETE' });
      setOnboardings(onboardings.filter(o => o.id !== id));
      toast('Onboarding deleted', 'success', 'Deleted');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); toast('Failed to delete onboarding', 'error', 'Error'); }
  };

  // Exit request handlers
  const handleSubmitExitRequest = async (input: { companyId: string; employeeId: string; employeeName: string; department: string; exitType: string; lastWorkingDay: string; reason: string }) => {
    try {
      const res = await fetch('/api/exit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await safeJson(res);
      setExitRequests([...exitRequests, data]);
      toast('Exit request submitted', 'success', 'Submitted');
    } catch (err) { console.error(err); toast('Failed to submit exit request', 'error', 'Error'); }
  };

  const handleApproveExitRequest = async (id: string, status: string, approverName: string) => {
    try {
      const updates: any = { status, userRole: selectedUser.activeRole || selectedUser.role, userId: selectedUser.id, userName: approverName };
      if (status === 'HOD Approved') {
        updates.hodApprovedBy = approverName;
        updates.hodApprovedAt = new Date().toISOString();
      } else if (status === 'Approved') {
        updates.hrApprovedBy = approverName;
        updates.hrApprovedAt = new Date().toISOString();
      }
      const res = await fetch(`/api/exit-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await safeJson(res);
      setExitRequests(exitRequests.map(e => e.id === id ? data : e));
      toast(`Exit request ${status.toLowerCase()}`, 'success', 'Approved');
    } catch (err) { console.error(err); toast('Failed to approve exit request', 'error', 'Error'); }
  };

  const handleRejectExitRequest = async (id: string, rejectedBy: string) => {
    try {
      const res = await fetch(`/api/exit-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', rejectedBy, rejectedAt: new Date().toISOString(), userRole: selectedUser.activeRole || selectedUser.role, userId: selectedUser.id, userName: rejectedBy }),
      });
      const data = await safeJson(res);
      setExitRequests(exitRequests.map(e => e.id === id ? data : e));
      toast('Exit request rejected', 'info', 'Rejected');
    } catch (err) { console.error(err); toast('Failed to reject exit request', 'error', 'Error'); }
  };

  const handleRequestBankAccountUpdate = async (input: { companyId: string; employeeId: string; employeeName: string; bankName: string; accountName: string; accountNumber: string; sortCode?: string; routingNumber?: string }) => {
    try {
      const res = await fetch('/api/bank-account-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await safeJson(res);
      setBankAccountUpdates([...bankAccountUpdates, data]);
      toast('Bank account update requested', 'success', 'Submitted');
    } catch (err) { console.error(err); toast('Failed to submit bank account request', 'error', 'Error'); }
  };

  const handleApproveBankAccountUpdate = async (id: string, employeeId: string, newBankAccount: string, approverName: string) => {
    try {
      // 1. Update the request status
      const res = await fetch(`/api/bank-account-updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', userId: selectedUser.id, userName: approverName }),
      });
      const data = await safeJson(res);
      setBankAccountUpdates(bankAccountUpdates.map(e => e.id === id ? data : e));
      
      // 2. Update the employee's bank account
      await handleUpdateEmployee(employeeId, { bankAccount: newBankAccount });
      
      toast(`Bank account request approved`, 'success', 'Approved');
    } catch (err) { console.error(err); toast('Failed to approve request', 'error', 'Error'); }
  };

  const handleRejectBankAccountUpdate = async (id: string, rejectorName: string) => {
    try {
      const res = await fetch(`/api/bank-account-updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', userId: selectedUser.id, userName: rejectorName }),
      });
      const data = await safeJson(res);
      setBankAccountUpdates(bankAccountUpdates.map(e => e.id === id ? data : e));
      toast('Bank account update rejected', 'info', 'Rejected');
    } catch (err) { console.error(err); toast('Failed to reject request', 'error', 'Error'); }
  };

  const handleSubmitProfileUpdate = async (input: { companyId: string; employeeId: string; employeeName: string; department: string; field: string; label: string; currentValue: string; newValue: string }) => {
    try {
      const res = await fetch('/api/profile-update-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await safeJson(res);
      setProfileUpdateRequests([...profileUpdateRequests, data]);
      toast('Profile update submitted for HR approval', 'success', 'Submitted');
    } catch (err) { console.error(err); toast('Failed to submit profile update', 'error', 'Error'); }
  };

  const handleApproveProfileUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/profile-update-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedBy: selectedUser.name, userRole: selectedUser.activeRole || selectedUser.role }),
      });
      const data = await safeJson(res);
      setProfileUpdateRequests(profileUpdateRequests.map(r => r.id === id ? data : r));
      // Refresh employees to reflect the change
      try {
        const empRes = await fetch(`/api/employees?companyId=${selectedCompany.id}`);
        const empData = await safeJson(empRes);
        setEmployees(empData);
      } catch (_) {}
      toast('Profile update approved and applied', 'success', 'Approved');
    } catch (err) { console.error(err); toast('Failed to approve profile update', 'error', 'Error'); }
  };

  const handleRejectProfileUpdate = async (id: string, reason?: string) => {
    try {
      const res = await fetch(`/api/profile-update-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedBy: selectedUser.name, rejectionReason: reason, userRole: selectedUser.activeRole || selectedUser.role }),
      });
      const data = await safeJson(res);
      setProfileUpdateRequests(profileUpdateRequests.map(r => r.id === id ? data : r));
      toast('Profile update rejected', 'info', 'Rejected');
    } catch (err) { console.error(err); toast('Failed to reject profile update', 'error', 'Error'); }
  };

  const handleAddLead = async (leadInput: Omit<CRMLead, 'id' | 'status' | 'aiLeadScore' | 'aiFollowUpSuggested' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadInput)
      });
      const data = await safeJson(res);
      setLeads([...leads, data.lead]);
      toast('Lead registered successfully', 'success', 'Lead Added');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to register lead', 'error', 'Error');
    }
  };

  const handleGenerateLeads = async () => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/leads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id })
      });
      const data = await safeJson(res);
      if (data.leads && Array.isArray(data.leads)) {
        setLeads([...leads, ...data.leads]);
        toast(`${data.leads.length} leads generated`, 'success', 'AI Generated');
      }

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to generate leads', 'error', 'Error');
    }
  };

  const handleMoveLead = async (leadId: string, status: CRMLead['status']) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/leads/${leadId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, companyId: selectedCompany.id })
      });
      const data = await safeJson(res);

      setLeads(leads.map(l => l.id === leadId ? data.lead : l));
      toast(`Lead moved to ${status}`, 'success', 'Pipeline Updated');
      if (data.invoiceCreated) {
        setInvoices([data.invoiceCreated, ...invoices]);
        setNotificationCount(prev => prev + 1);
        toast('Invoice auto-created for won deal', 'success', 'Invoice Created');
      }

      // Reload audits & GL
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await safeJson(logRes));
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
    } catch (err) {
      console.error(err);
      toast('Failed to move lead', 'error', 'Error');
    }
  };

  const handleAddInvoice = async (invInput: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'status'>) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invInput)
      });
      const newInv = await safeJson(res);
      setInvoices([newInv, ...invoices]);
      toast('Invoice created successfully', 'success', 'Invoice Added');

      // Reload audits & ledger
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await safeJson(logRes));
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
    } catch (err) {
      console.error(err);
      toast('Failed to create invoice', 'error', 'Error');
    }
  };

  const handlePayInvoice = async (invId: string) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/invoices/${invId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id })
      });
      const paid = await safeJson(res);
      setInvoices(invoices.map(i => i.id === invId ? paid : i));
      toast('Payment recorded successfully', 'success', 'Payment Received');

      // Reload audits & ledger balances
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await safeJson(logRes));
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole })
      });
      const updatedUser = await safeJson(res);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? updatedUser
          : u
      ));
      
      // If switching the current user's role, update selectedUser as well
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
        setActiveView('dashboard');
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const handleCreateRole = async (roleInput: { name: string; description: string; modules: string[]; submenus: string[]; crudPermissions?: string[] }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...roleInput, companyId: selectedCompany.id })
      });
      const data = await safeJson(res);
      if (data.error) { toast(data.error, 'error', 'Error'); return; }
      setCustomRoles([...customRoles, data]);
      toast('Role created successfully', 'success', 'Role Added');
    } catch (err) { console.error(err); toast('Failed to create role', 'error', 'Error'); }
  };

  const handleRefreshPendingApprovals = async () => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/pending-approvals?companyId=${selectedCompany.id}`);
      const data = await safeJson(res);
      setPendingApprovals(data);
    } catch (err) { console.error(err); }
  };

  const handleUpdateRole = async (roleId: string, updates: { name?: string; description?: string; modules?: string[]; submenus?: string[]; crudPermissions?: string[] }) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          userName: selectedUser.name,
          userRole: selectedUser.activeRole || selectedUser.role,
          userId: selectedUser.id,
        })
      });
      const data = await safeJson(res);

      // Handle pending approval (202 status)
      if (res.status === 202 && data.pending) {
        toast(data.message || 'Role change submitted for approval', 'info', 'Pending Approval');
        handleRefreshPendingApprovals();
        return;
      }

      if (data.error) { toast(data.error, 'error', 'Error'); return; }
      setCustomRoles(customRoles.map(r => r.id === roleId ? data : r));
      // If role name changed, also update users who had this role
      if (updates.name) {
        const uRes = await fetch('/api/users');
        const uData = await safeJson(uRes);
        setUsers(uData);
      }
      toast('Role updated successfully', 'success', 'Updated');
    } catch (err) { console.error(err); toast('Failed to update role', 'error', 'Error'); }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
      const data = await safeJson(res);
      if (data.error) { toast(data.error, 'error', 'Error'); return; }
      setCustomRoles(customRoles.filter(r => r.id !== roleId));
      toast('Role deleted', 'success', 'Deleted');
    } catch (err) { console.error(err); toast('Failed to delete role', 'error', 'Error'); }
  };

  const handleUpdateApprovalPolicies = async (policies: { module: string; description: string; approverRoles: string[]; enabled: boolean }[]) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/approval-policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id, policies })
      });
      const data = await safeJson(res);
      setApprovalPolicies(data);
      toast('Approval policies saved', 'success', 'Saved');
    } catch (err) { console.error(err); toast('Failed to save approval policies', 'error', 'Error'); }
  };

  const handleApproveLeave = async (leaveId: string, status: string = 'Approved') => {
    if (!selectedUser || !selectedCompany) return;
    try {
      const res = await fetch(`/api/leaves/${leaveId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name, status, userRole: selectedUser.activeRole || selectedUser.role })
      });
      const data = await safeJson(res);
      if (data.error) { toast(data.error, 'error', 'Authorization Failed'); return; }
      toast('Leave request approved', 'success', 'Approved');
      
      // Reload leaves, employees, audits
      const [lRes, eRes, logRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees'),
            fetch('/api/applicants'),
        fetch('/api/audit-logs')
      ]);
      setLeaves(await safeJson(lRes));
      setEmployees(await safeJson(eRes));
        setApplicants(await safeJson(appRes));
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to approve leave', 'error', 'Error');
    }
  };

  const handleDeclineLeave = async (leaveId: string) => {
    if (!selectedUser || !selectedCompany) return;
    try {
      const res = await fetch(`/api/leaves/${leaveId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name, userRole: selectedUser.activeRole || selectedUser.role })
      });
      const data = await safeJson(res);
      if (data.error) { toast(data.error, 'error', 'Authorization Failed'); return; }
      toast('Leave request declined', 'info', 'Declined');
      
      // Reload leaves, employees, audits
      const [lRes, eRes, logRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees'),
            fetch('/api/applicants'),
        fetch('/api/audit-logs')
      ]);
      setLeaves(await safeJson(lRes));
      setEmployees(await safeJson(eRes));
        setApplicants(await safeJson(appRes));
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to decline leave', 'error', 'Error');
    }
  };

  const handleCreateLeave = async (leaveInput: {
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    days: number;
    replacementId?: string;
    replacementName?: string;
  }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leaveInput, companyId: selectedCompany.id })
      });
      const data = await safeJson(res);
      setLeaves([...leaves, data]);
      toast('Leave request submitted', 'success', 'Leave Created');
    } catch (err) {
      console.error(err);
      toast('Failed to create leave request', 'error', 'Error');
    }
  };

  const handleClockAttendance = async (action: 'in' | 'out', locationType?: string) => {
    if (!selectedUser || !selectedCompany) return;
    const companyEmployees = employees.filter(e => e.companyId === selectedCompany.id);
    const emp = companyEmployees.find(e => e.email === selectedUser.email) || companyEmployees.find(e => `${e.firstName} ${e.lastName}` === selectedUser.name) || companyEmployees[0];
    if (!emp) {
      toast('No employee record found for your account. Please contact HR.', 'error', 'Clock In Failed');
      return;
    }
    
    try {
      await fetch('/api/attendance/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          employeeId: emp.id,
          employeeName: selectedUser.name,
          department: emp.department,
          action,
          locationType
        })
      });
      toast(action === 'in' ? 'Clocked in successfully' : 'Clocked out successfully', 'success', action === 'in' ? 'Clock In' : 'Clock Out');
      
      const attRes = await fetch('/api/attendance');
      setAttendance(await safeJson(attRes));
    } catch (err) {
      console.error(err);
      toast('Failed to clock attendance', 'error', 'Error');
    }
  };

  const handleCreateOKR = async (okrInput: {
    employeeId: string;
    employeeName: string;
    department: string;
    title: string;
    keyResult: string;
    period: string;
  }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/okrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...okrInput, companyId: selectedCompany.id })
      });
      const data = await safeJson(res);
      setOkrs([...okrs, data]);
      toast('OKR created successfully', 'success', 'OKR Added');
    } catch (err) {
      console.error(err);
      toast('Failed to create OKR', 'error', 'Error');
    }
  };

  const handleUpdateOKRProgress = async (okrId: string, progress: number, status?: string) => {
    try {
      await fetch(`/api/okrs/${okrId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, status, role: selectedUser?.activeRole || selectedUser?.role })
      });
      toast('OKR progress updated', 'success', 'Updated');
      
      const oRes = await fetch('/api/okrs');
      setOkrs(await safeJson(oRes));
    } catch (err) {
      console.error(err);
      toast('Failed to update OKR', 'error', 'Error');
    }
  };

  const handleRunPayroll = async (period: string, structure: string, employeeIds?: string[]) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      await fetch('/api/payroll/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          period,
          structure,
          userId: selectedUser.id,
          userName: selectedUser.name,
          employeeIds: employeeIds || []
        })
      });
      toast('Payroll processed successfully', 'success', 'Payroll Run');
      
      // Reload payslips, ledger, audits
      const [pRes, aRes, logRes] = await Promise.all([
        fetch('/api/payslips'),
        fetch('/api/accounting'),
        fetch('/api/audit-logs')
      ]);
      setPayslips(await safeJson(pRes));
      const accData = await safeJson(aRes);
      setGlAccounts(accData.accounts || []);
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to run payroll', 'error', 'Error');
    }
  };

  const handleCreatePayrollGroup = async (name: string, description: string, employeeIds: string[]) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/payroll-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          name,
          description,
          employeeIds,
          userId: selectedUser.id,
          userName: selectedUser.name
        })
      });
      const group = await safeJson(res);
      setPayrollGroups([...payrollGroups, group]);
      toast('Payroll group created', 'success', 'Group Added');
    } catch (err) {
      console.error(err);
      toast('Failed to create payroll group', 'error', 'Error');
    }
  };

  const handleDeletePayrollGroup = async (groupId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/payroll-groups/${groupId}`, { method: 'DELETE' });
      setPayrollGroups(payrollGroups.filter(g => g.id !== groupId));
      toast('Payroll group deleted', 'success', 'Deleted');
    } catch (err) {
      console.error(err);
      toast('Failed to delete payroll group', 'error', 'Error');
    }
  };

  const handleCreateSalaryBand = async (name: string, minSalary: number, maxSalary: number) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/salary-bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          name,
          minSalary,
          maxSalary,
          userId: selectedUser.id,
          userName: selectedUser.name
        })
      });
      const band = await safeJson(res);
      setSalaryBands([...salaryBands, band]);
      toast('Salary band created', 'success', 'Band Added');
    } catch (err) {
      console.error(err);
      toast('Failed to create salary band', 'error', 'Error');
    }
  };

  const handleUpdateSalaryBand = async (bandId: string, updates: { name?: string; minSalary?: number; maxSalary?: number; employeeCount?: number }) => {
    try {
      const res = await fetch(`/api/salary-bands/${bandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setSalaryBands(salaryBands.map(b => b.id === bandId ? updated : b));
      toast('Salary band updated', 'success', 'Updated');
    } catch (err) {
      console.error(err);
      toast('Failed to update salary band', 'error', 'Error');
    }
  };

  const handleDeleteSalaryBand = async (bandId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/salary-bands/${bandId}`, { method: 'DELETE' });
      setSalaryBands(salaryBands.filter(b => b.id !== bandId));
      toast('Salary band deleted', 'success', 'Deleted');
    } catch (err) {
      console.error(err);
      toast('Failed to delete salary band', 'error', 'Error');
    }
  };

  const handleAdjustStock = async (itemId: string, qty: number) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, adjustment: qty, companyId: selectedCompany.id })
      });
      const data = await safeJson(res);
      setInventory(inventory.map(i => i.id === itemId ? data.item : i));
      toast('Stock adjusted successfully', 'success', 'Stock Updated');

      if (data.lowStockAlert) {
        setNotificationCount(prev => prev + 1);
        toast('Low stock alert triggered', 'warning', 'Low Stock');
      }

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to adjust stock', 'error', 'Error');
    }
  };

  const handleAddTicket = async (tktInput: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'assignedTo' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tktInput)
      });
      const newTkt = await safeJson(res);
      setTickets([newTkt, ...tickets]);
      toast('Support ticket created', 'success', 'Ticket Added');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to create ticket', 'error', 'Error');
    }
  };

  const handleUpdateTicket = async (id: string, updates: { status?: string; department?: string; assignedTo?: string; reply?: { message: string }; repliedBy?: string; repliedByRole?: 'Customer' | 'Agent' | 'Admin' }) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setTickets(tickets.map(t => t.id === id ? { ...t, ...updated } : t));
      toast('Ticket updated', 'success', 'Updated');

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to update ticket', 'error', 'Error');
    }
  };

  const handleUpdatePayrollTaxConfig = async (companyId: string, cfg: Partial<PayrollTaxConfig>) => {
    try {
      const res = await fetch('/api/payroll-tax-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...cfg })
      });
      const updated = await safeJson(res);
      setPayrollTaxConfig(updated);

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAttendanceSettings = async (companyId: string, cfg: Partial<AttendanceSettings>) => {
    try {
      const res = await fetch('/api/attendance-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...cfg })
      });
      const updated = await safeJson(res);
      setAttendanceSettings(updated);

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddKbArticle = async (article: Omit<KBArticle, 'id' | 'views' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/kb-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      const created = await safeJson(res);
      setKbArticles([created, ...kbArticles]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLmsCourse = async (course: Omit<LMSCourse, 'id' | 'enrolled' | 'completion' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/lms-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      const created = await safeJson(res);
      setLmsCourses([created, ...lmsCourses]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAnnouncement = async (announcement: Omit<CommunicationAnnouncement, 'id' | 'date' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      const created = await safeJson(res);
      setAnnouncements([created, ...announcements]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChatGroup = async (group: Omit<ChatGroup, 'id' | 'createdAt' | 'companyId' | 'createdBy'>) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/chat/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...group, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const created = await safeJson(res);
      setChatGroups(prev => [...prev, created]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateChatGroupMembers = async (groupId: string, members: string[]) => {
    try {
      const res = await fetch(`/api/chat/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members })
      });
      const updated = await safeJson(res);
      setChatGroups(prev => prev.map(g => g.id === groupId ? updated : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (message: { companyId: string; threadId: string; senderId: string; senderName: string; message: string }) => {
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      const created = await safeJson(res);
      setChatMessages(prev => [...prev, created]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkThreadRead = async (threadId: string) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id, userId: selectedUser.id, threadId })
      });
      const updatedRead = await safeJson(res);
      setChatReads(prev => {
        const existing = prev.find(r => r.threadId === threadId);
        if (existing) {
          return prev.map(r => r.threadId === threadId ? updatedRead : r);
        }
        return [...prev, updatedRead];
      });
    } catch (err) {
      console.error('Failed to mark thread read', err);
    }
  };

  const handleCreatePoll = async (poll: { companyId: string; title: string; description: string; category: string; createdBy: string; createdByName: string; anonymous: boolean; endDate: string; options: { label: string; nomineeId?: string; nomineeName?: string }[] }) => {
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poll)
      });
      const created = await safeJson(res);
      setPolls(prev => [created, ...prev]);
      // Fetch updated options
      const optsRes = await fetch(`/api/poll-options?companyId=${poll.companyId}`);
      setPollOptions(await safeJson(optsRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await fetch(`/api/polls/${pollId}/close`, { method: 'POST' });
      setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status: 'Closed' as const } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePoll = async (pollId: string, updates: { endDate?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await safeJson(res);
        setPolls(prev => prev.map(p => p.id === pollId ? { ...p, ...updated } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string, voterId: string, voterName: string) => {
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, voterId, voterName })
      });
      if (res.ok) {
        const vote = await safeJson(res);
        setPollVotes(prev => [...prev, vote]);
        // Update option vote count locally
        setPollOptions(prev => prev.map(o => o.id === optionId ? { ...o, voteCount: o.voteCount + 1 } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadCompanyImage = async (image: { companyId: string; title: string; description: string; category: string; imageData: string; uploadedBy: string; uploadedByName: string }) => {
    try {
      const res = await fetch('/api/company-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image),
      });
      if (res.ok) {
        const saved = await safeJson(res);
        setCompanyImages(prev => [{ ...image, id: saved.id, createdAt: saved.createdAt } as CompanyImage, ...prev]);
        toast('Image uploaded successfully', 'success', 'Gallery');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompanyImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/company-images/${imageId}`, { method: 'DELETE' });
      if (res.ok) {
        setCompanyImages(prev => prev.filter(i => i.id !== imageId));
        toast('Image deleted', 'success', 'Gallery');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWorkflowTrigger = async (triggerId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/workflow-triggers/${triggerId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const updated = await safeJson(res);
      setWorkflowTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, enabled } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      const created = await safeJson(res);
      setEmailTemplates([created, ...emailTemplates]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWorkflow = async (wfInput: Omit<ERPWorkflow, 'id' | 'createdAt' | 'isActive'>) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wfInput)
      });
      const newWf = await safeJson(res);
      setWorkflows([...workflows, newWf]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWorkflow = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active, companyId: selectedCompany?.id, ...actorBody() })
      });
      const data = await safeJson(res);
      setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: active } : w));
      toast(active ? 'Workflow enabled' : 'Workflow disabled', 'success', active ? 'Enabled' : 'Disabled');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to toggle workflow', 'error', 'Error');
    }
  };

  const handleInviteUser = async (usrInput: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...usrInput, companyId: selectedCompany.id })
      });
      const newUser = await safeJson(res);
      setUsers([...users, newUser]);
      toast('User invited successfully', 'success', 'User Invited');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to invite user', 'error', 'Error');
    }
  };

  const handleGenerateAPIKey = async (name: string, permissions: 'Read Only' | 'Full Access') => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions, companyId: selectedCompany.id })
      });
      const newKey = await safeJson(res);
      setApiKeys([...apiKeys, newKey]);
      toast('API key generated', 'success', 'Key Created');

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to generate API key', 'error', 'Error');
    }
  };

  // POS Handlers
  const handleAddPOSProduct = async (productInput: Omit<POSProduct, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/pos/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productInput)
      });
      if (!res.ok) {
        const err = await safeJson(res);
        toast(err.error || 'Failed to add POS product', 'error', 'Error');
        return;
      }
      const data = await safeJson(res);
      setPosProducts([...posProducts, data]);
      toast('POS product added', 'success', 'Product Added');
      
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to add POS product', 'error', 'Error');
    }
  };

  const handleAddPOSCustomer = async (customerInput: Omit<POSCustomer, 'id' | 'loyaltyPoints' | 'tier' | 'totalPurchases' | 'totalSpent' | 'storeCredit' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInput)
      });
      if (!res.ok) {
        const err = await safeJson(res);
        toast(err.error || 'Failed to add POS customer', 'error', 'Error');
        return;
      }
      const data = await safeJson(res);
      setPosCustomers([...posCustomers, data]);
      toast('POS customer registered', 'success', 'Customer Added');
      
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to add POS customer', 'error', 'Error');
    }
  };

  const handleCreatePOSSale = async (saleInput: any) => {
    try {
      const res = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleInput)
      });
      const data = await safeJson(res);
      setPosSales([...posSales, data]);
      setNotificationCount(prev => prev + 1);
      toast('Sale completed successfully', 'success', 'Sale Recorded');
      
      // Reload POS data to update stock
      const [posProdRes, posCustRes] = await Promise.all([
        fetch('/api/pos/products'),
        fetch('/api/pos/customers')
      ]);
      setPosProducts(await safeJson(posProdRes));
      setPosCustomers(await safeJson(posCustRes));
      
      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPOSCategory = async (catInput: Omit<POSCategory, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/pos/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catInput),
      });
      const newCat = await safeJson(res);
      setPosCategories([...posCategories, newCat]);
    } catch (e) { console.error('Failed to create POS category:', e); }
  };

  const handleAddPOSTerminal = async (termInput: Omit<POSTerminal, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/pos/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termInput),
      });
      const newTerm = await safeJson(res);
      setPosTerminals([...posTerminals, newTerm]);
    } catch (e) { console.error('Failed to create POS terminal:', e); }
  };

  const handleCreatePOSShift = async (shiftInput: Omit<POSShift, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/pos/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftInput),
      });
      const newShift = await safeJson(res);
      setPosShifts([...posShifts, newShift]);
    } catch (e) { console.error('Failed to create POS shift:', e); }
  };

  const handleClosePOSShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/pos/shifts/${shiftId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const updated = await safeJson(res);
      setPosShifts(posShifts.map(s => s.id === shiftId ? updated : s));
    } catch (e) { console.error('Failed to close POS shift:', e); }
  };

  const handleAddPOSDiscount = async (discInput: Omit<POSDiscount, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/pos/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discInput),
      });
      const newDisc = await safeJson(res);
      setPosDiscounts([...posDiscounts, newDisc]);
    } catch (e) { console.error('Failed to create POS discount:', e); }
  };

  const handleUpdatePOSDiscount = async (id: string, updates: Partial<POSDiscount>) => {
    try {
      const res = await fetch(`/api/pos/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await safeJson(res);
      setPosDiscounts(posDiscounts.map(d => d.id === id ? updated : d));
    } catch (e) { console.error('Failed to update POS discount:', e); }
  };

  const handleCreatePOSReturn = async (retInput: Omit<POSReturn, 'id' | 'returnNumber' | 'status' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/pos/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retInput),
      });
      const newRet = await safeJson(res);
      setPosReturns([...posReturns, newRet]);
    } catch (e) { console.error('Failed to create POS return:', e); }
  };

  const handleApprovePOSReturn = async (returnId: string) => {
    try {
      const res = await fetch(`/api/pos/returns/${returnId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const updated = await safeJson(res);
      setPosReturns(posReturns.map(r => r.id === returnId ? updated : r));
    } catch (e) { console.error('Failed to approve POS return:', e); }
  };

  const handleGeneratePOSReport = async (reportInput: any) => {
    try {
      const res = await fetch('/api/pos/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportInput),
      });
      const newReport = await safeJson(res);
      setPosDailyReports([...posDailyReports, newReport]);
    } catch (e) { console.error('Failed to generate POS report:', e); }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<CRMLead>) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const lead = await safeJson(res);
      setLeads(leads.map(l => l.id === leadId ? lead : l));

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignLead = async (leadId: string, userId: string, userName: string, department: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: userId, assignedToName: userName, department })
      });
      const lead = await safeJson(res);
      setLeads(leads.map(l => l.id === leadId ? lead : l));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (leadId: string, content: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser?.id, userName: selectedUser?.name, content })
      });
      const lead = await safeJson(res);
      setLeads(leads.map(l => l.id === leadId ? lead : l));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogCrmActivity = async (activity: { companyId: string; leadId: string; type: string; subject: string; description: string }) => {
    try {
      const res = await fetch('/api/crm-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activity, performedBy: selectedUser?.id, performedByName: selectedUser?.name })
      });
      const data = await safeJson(res);
      setCrmActivities([data, ...crmActivities]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCrmTask = async (task: Omit<CRMTask, 'id' | 'status' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/crm-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await safeJson(res);
      setCrmTasks([data, ...crmTasks]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCrmTask = async (taskId: string, updates: Partial<CRMTask>) => {
    try {
      const res = await fetch(`/api/crm-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await safeJson(res);
      setCrmTasks(crmTasks.map(t => t.id === taskId ? data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCrmEmail = async (email: { companyId: string; leadId: string; to: string; subject: string; body: string }) => {
    try {
      const res = await fetch('/api/crm-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...email, sentBy: selectedUser?.id, sentByName: selectedUser?.name })
      });
      const data = await safeJson(res);
      setCrmEmails([data, ...crmEmails]);
      // Also update activities since the API logs it
      const actRes = await fetch('/api/crm-activities');
      setCrmActivities(await safeJson(actRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInventoryItem = async (invInput: Omit<InventoryItem, 'id'>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invInput)
      });
      const data = await safeJson(res);
      setInventory([...inventory, data.item]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAuditLog = async (logInput: Omit<AuditLog, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logInput)
      });
      const data = await safeJson(res);
      setAuditLogs([...auditLogs, data.log]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAPIKey = async (keyInput: Omit<APIKey, 'id' | 'key' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyInput)
      });
      const data = await safeJson(res);
      setApiKeys([...apiKeys, data.key]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWorkflow = async (wfInput: Omit<ERPWorkflow, 'id' | 'createdAt' | 'isActive'>) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wfInput)
      });
      const data = await safeJson(res);
      setWorkflows([...workflows, data.workflow]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE LEDGER Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddGLAccount = async (accountInput: { code: string; name: string; type: string }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/gl-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...accountInput, companyId: selectedCompany.id })
      });
      if (!res.ok) {
        const err = await safeJson(res);
        toast(err.error || 'Failed to add account', 'error', 'Error');
        return;
      }
      const newAccount = await safeJson(res);
      setGlAccounts([...glAccounts, newAccount]);
      toast('GL account created', 'success', 'Account Added');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to add GL account', 'error', 'Error');
    }
  };

  const handleUpdateGLAccount = async (accountId: string, updates: { name?: string; type?: string }) => {
    try {
      const res = await fetch(`/api/gl-accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setGlAccounts(glAccounts.map(a => a.id === accountId ? updated : a));
      toast('GL account updated', 'success', 'Updated');
    } catch (err) {
      console.error(err);
      toast('Failed to update GL account', 'error', 'Error');
    }
  };

  const handleDeleteGLAccount = async (accountId: string) => {
    try {
      const res = await fetch(`/api/gl-accounts/${accountId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await safeJson(res);
        toast(err.error || 'Failed to delete account', 'error', 'Error');
        return;
      }
      setGlAccounts(glAccounts.filter(a => a.id !== accountId));
      toast('GL account deleted', 'success', 'Deleted');
    } catch (err) {
      console.error(err);
      toast('Failed to delete GL account', 'error', 'Error');
    }
  };

  const handleCreateJournalEntry = async (entryInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entryInput,
          companyId: selectedCompany.id,
          createdBy: selectedUser.id,
          createdByName: selectedUser.name
        })
      });
      if (!res.ok) {
        const err = await safeJson(res);
        toast(err.error || 'Failed to create journal entry', 'error', 'Error');
        return;
      }
      const newEntry = await safeJson(res);
      setJournalEntries([...journalEntries, newEntry]);
      toast('Journal entry created', 'success', 'Entry Added');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to create journal entry', 'error', 'Error');
    }
  };

  const handlePostJournalEntry = async (entryId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/journal-entries/${entryId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      toast('Journal entry posted', 'success', 'Posted');
      // Reload GL accounts to reflect balance changes
      const accRes = await fetch('/api/accounting');
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to post journal entry', 'error', 'Error');
    }
  };

  const handleApproveJournalEntry = async (entryId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/journal-entries/${entryId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      toast('Journal entry approved', 'success', 'Approved');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to approve journal entry', 'error', 'Error');
    }
  };

  const handleVoidJournalEntry = async (entryId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/journal-entries/${entryId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      toast('Journal entry voided', 'info', 'Voided');
      // Reload GL accounts to reflect reversed balances
      const accRes = await fetch('/api/accounting');
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to void journal entry', 'error', 'Error');
    }
  };

  const handleCreateExpense = async (expInput: { description: string; category: string; department: string; amount: number }) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newExp = await safeJson(res);
      setExpenses([...expenses, newExp]);
      toast('Expense submitted', 'success', 'Expense Added');
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to submit expense', 'error', 'Error');
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setExpenses(expenses.map(e => e.id === expenseId ? updated : e));
      toast('Expense approved', 'success', 'Approved');
      // Reload GL accounts and journal entries
      const [accRes, jeRes] = await Promise.all([
        fetch('/api/accounting'),
        fetch('/api/journal-entries')
      ]);
      const accData = await safeJson(accRes);
      setGlAccounts(accData.accounts || []);
      setJournalEntries(await safeJson(jeRes));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
      toast('Failed to approve expense', 'error', 'Error');
    }
  };

  const handleCloseFiscalPeriod = async (periodId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/fiscal-periods/${periodId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setFiscalPeriods(fiscalPeriods.map(f => f.id === periodId ? updated : f));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetOpeningBalance = async (obInput: { accountId: string; accountCode: string; accountName: string; periodId: string; debit: number; credit: number }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/opening-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...obInput, companyId: selectedCompany.id })
      });
      const newOb = await safeJson(res);
      const exists = openingBalances.find(o => o.accountId === obInput.accountId && o.periodId === obInput.periodId);
      if (exists) {
        setOpeningBalances(openingBalances.map(o => o.id === newOb.id ? newOb : o));
      } else {
        setOpeningBalances([...openingBalances, newOb]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateBill = async (billInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...billInput, companyId: selectedCompany.id, createdBy: selectedUser.id, createdByName: selectedUser.name })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newBill = await safeJson(res);
      setBills([...bills, newBill]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleApproveBill = async (billId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/bills/${billId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setBills(bills.map(b => b.id === billId ? updated : b));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handlePayBill = async (billId: string, amount: number, paymentMethod: string, bankAccountId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/bills/${billId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentDate: new Date().toISOString().split('T')[0], paymentMethod, bankAccountId, createdBy: selectedUser.id })
      });
      const updated = await safeJson(res);
      setBills(bills.map(b => b.id === billId ? updated : b));
      // Reload bank data
      const [baRes, bpRes] = await Promise.all([fetch('/api/bank-accounts'), fetch('/api/bills')]);
      setBankAccounts(await safeJson(baRes));
      setBills(await safeJson(bpRes));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleReceiveCustomerPayment = async (paymentInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/customer-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newPayment = await safeJson(res);
      setCustomerPayments([...customerPayments, newPayment]);
      // Reload invoices and bank
      const [invRes, baRes] = await Promise.all([fetch('/api/accounting'), fetch('/api/bank-accounts')]);
      const accData = await safeJson(invRes);
      setInvoices(accData.invoices || []);
      setBankAccounts(await safeJson(baRes));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateSalesOrder = async (orderInput: Omit<SalesOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderInput, companyId: selectedCompany.id })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newOrder = await safeJson(res);
      setSalesOrders([newOrder, ...salesOrders]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleUpdateSalesOrder = async (orderId: string, updates: Partial<SalesOrder>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/sales-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setSalesOrders(salesOrders.map(o => o.id === orderId ? updated : o));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateSalesCustomer = async (custInput: Omit<SalesCustomer, 'id' | 'totalOrders' | 'totalSpend' | 'lastOrderDate' | 'createdAt'>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/sales-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...custInput, companyId: selectedCompany.id })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newCust = await safeJson(res);
      setSalesCustomers([newCust, ...salesCustomers]);
    } catch (err) { console.error(err); }
  };

  const handleUpdateSalesCustomer = async (custId: string, updates: Partial<SalesCustomer>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/sales-customers/${custId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setSalesCustomers(salesCustomers.map(c => c.id === custId ? updated : c));
    } catch (err) { console.error(err); }
  };

  const handleDeleteSalesCustomer = async (custId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/sales-customers/${custId}`, { method: 'DELETE' });
      setSalesCustomers(salesCustomers.filter(c => c.id !== custId));
    } catch (err) { console.error(err); }
  };

  const handleCreateSalesQuotation = async (quoteInput: Omit<SalesQuotation, 'id' | 'quoteNumber' | 'status' | 'createdAt'>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/sales-quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quoteInput, companyId: selectedCompany.id })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newQuote = await safeJson(res);
      setSalesQuotations([newQuote, ...salesQuotations]);
    } catch (err) { console.error(err); }
  };

  const handleUpdateSalesQuotation = async (quoteId: string, updates: Partial<SalesQuotation>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/sales-quotations/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setSalesQuotations(salesQuotations.map(q => q.id === quoteId ? updated : q));
    } catch (err) { console.error(err); }
  };

  const handleDeleteSalesQuotation = async (quoteId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/sales-quotations/${quoteId}`, { method: 'DELETE' });
      setSalesQuotations(salesQuotations.filter(q => q.id !== quoteId));
    } catch (err) { console.error(err); }
  };

  const handleCreateSalesTarget = async (targetInput: Omit<SalesTarget, 'id' | 'actualAmount' | 'createdAt'>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/sales-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetInput, companyId: selectedCompany.id })
      });
      if (!res.ok) { const err = await safeJson(res); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newTarget = await safeJson(res);
      setSalesTargets([newTarget, ...salesTargets]);
    } catch (err) { console.error(err); }
  };

  const handleUpdateSalesTarget = async (targetId: string, updates: Partial<SalesTarget>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/sales-targets/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setSalesTargets(salesTargets.map(t => t.id === targetId ? updated : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteSalesTarget = async (targetId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/sales-targets/${targetId}`, { method: 'DELETE' });
      setSalesTargets(salesTargets.filter(t => t.id !== targetId));
    } catch (err) { console.error(err); }
  };

  const handleCreateBankAccount = async (baInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baInput, companyId: selectedCompany.id })
      });
      const newBA = await safeJson(res);
      setBankAccounts([...bankAccounts, newBA]);
    } catch (err) { console.error(err); }
  };

  const handleUpdateBankAccount = async (id: string, updates: Partial<import('./types').BankAccount>) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await safeJson(res);
      setBankAccounts(bankAccounts.map(b => b.id === id ? updated : b));
    } catch (err) { console.error(err); }
  };

  const handleReconcileBank = async (recInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/bank-reconciliations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recInput, companyId: selectedCompany.id, completedBy: selectedUser.id, completedByName: selectedUser.name })
      });
      const newRec = await safeJson(res);
      setBankReconciliations([...bankReconciliations, newRec]);
      const txRes = await fetch('/api/bank-transactions');
      setBankTransactions(await safeJson(txRes));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateFixedAsset = async (assetInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/fixed-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assetInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newAsset = await safeJson(res);
      setFixedAssets([...fixedAssets, newAsset]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleDisposeAsset = async (assetId: string, disposalPrice: number) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/fixed-assets/${assetId}/dispose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposalPrice, disposalDate: new Date().toISOString().split('T')[0], userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setFixedAssets(fixedAssets.map(a => a.id === assetId ? updated : a));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleRunDepreciation = async (period: string) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/depreciation-entries/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id, period, createdBy: selectedUser.id })
      });
      const newEntries = await safeJson(res);
      setDepreciationEntries([...depreciationEntries, ...newEntries]);
      // Reload fixed assets
      const faRes = await fetch('/api/fixed-assets');
      setFixedAssets(await safeJson(faRes));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateBudget = async (budgetInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...budgetInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newBudget = await safeJson(res);
      setBudgets([...budgets, newBudget]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleApproveBudget = async (budgetId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/budgets/${budgetId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setBudgets(budgets.map(b => b.id === budgetId ? updated : b));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateCostCenter = async (ccInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/cost-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ccInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newCC = await safeJson(res);
      setCostCenters([...costCenters, newCC]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleUpdateCurrencyRate = async (rateInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/currency-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rateInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newRate = await safeJson(res);
      setCurrencyRates([...currencyRates.filter(r => !(r.baseCurrency === rateInput.baseCurrency && r.targetCurrency === rateInput.targetCurrency)), newRate]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3 Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateTaxReturn = async (trInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/tax-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trInput, companyId: selectedCompany.id, createdBy: selectedUser.id, createdByName: selectedUser.name })
      });
      const newTR = await safeJson(res);
      setTaxReturns([...taxReturns, newTR]);
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleFileTaxReturn = async (returnId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/tax-returns/${returnId}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setTaxReturns(taxReturns.map(t => t.id === returnId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateIntercompanyTxn = async (txInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/intercompany-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newTx = await safeJson(res);
      setIntercompanyTxns([...intercompanyTxns, newTx]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleApproveIntercompanyTxn = async (txId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/intercompany-transactions/${txId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setIntercompanyTxns(intercompanyTxns.map(t => t.id === txId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleEliminateIntercompanyTxn = async (txId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/intercompany-transactions/${txId}/eliminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setIntercompanyTxns(intercompanyTxns.map(t => t.id === txId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateConsolidationRule = async (ruleInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/consolidation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ruleInput, companyId: selectedCompany.id, createdBy: selectedUser.id })
      });
      const newRule = await safeJson(res);
      setConsolidationRules([...consolidationRules, newRule]);
    } catch (err) { console.error(err); }
  };

  const handleResolveComplianceCheck = async (checkId: string, status: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/compliance-checks/${checkId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setComplianceChecks(complianceChecks.map(c => c.id === checkId ? updated : c));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleAcknowledgePolicy = async (policyId: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/policy-documents/${policyId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const updated = await safeJson(res);
      setPolicyDocuments(policyDocuments.map(p => p.id === policyId ? updated : p));
    } catch (err) { console.error(err); }
  };

  const handleFileDeadline = async (filingId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/filing-deadlines/${filingId}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      const updated = await safeJson(res);
      setFilingDeadlines(filingDeadlines.map(f => f.id === filingId ? updated : f));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await safeJson(logRes));
    } catch (err) { console.error(err); }
  };

  const handleCreateComplianceCheck = async (checkInput: { companyId: string; category: string; title: string; description: string; dueDate: string; assignee: string; assigneeName: string; createdBy: string }) => {
    try {
      const res = await fetch('/api/compliance-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInput)
      });
      const newCheck = await safeJson(res);
      setComplianceChecks([...complianceChecks, newCheck]);
    } catch (err) { console.error(err); }
  };

  const handleCreateFilingDeadline = async (filingInput: { companyId: string; filingType: string; jurisdiction: string; dueDate: string; assignee: string; assigneeName: string; notes: string; createdBy: string }) => {
    try {
      const res = await fetch('/api/filing-deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filingInput)
      });
      const newFiling = await safeJson(res);
      setFilingDeadlines([...filingDeadlines, newFiling]);
    } catch (err) { console.error(err); }
  };

  const refreshAuditLogs = async () => {
    try { const res = await fetch('/api/audit-logs'); setAuditLogs(await safeJson(res)); } catch (err) { console.error(err); }
  };
  const actorBody = () => ({ userId: selectedUser?.id, userName: selectedUser?.name });

  const handleCreateTaxCode = async (tcInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/tax-codes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tcInput, companyId: selectedCompany.id, createdBy: selectedUser.id, createdByName: selectedUser.name })
      });
      setTaxCodes([...taxCodes, await safeJson(res)]);
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleUpdateTaxCode = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/tax-codes/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await safeJson(res);
      setTaxCodes(taxCodes.map(t => t.id === id ? updated : t));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleDeleteTaxCode = async (id: string) => {
    try {
      await fetch(`/api/tax-codes/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setTaxCodes(taxCodes.filter(t => t.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleUpdateTaxReturn = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/tax-returns/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await safeJson(res);
      setTaxReturns(taxReturns.map(t => t.id === id ? updated : t));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleDeleteTaxReturn = async (id: string) => {
    try {
      await fetch(`/api/tax-returns/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setTaxReturns(taxReturns.filter(t => t.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleUpdateComplianceCheck = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/compliance-checks/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await safeJson(res);
      setComplianceChecks(complianceChecks.map(c => c.id === id ? updated : c));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleDeleteComplianceCheck = async (id: string) => {
    try {
      await fetch(`/api/compliance-checks/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setComplianceChecks(complianceChecks.filter(c => c.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleDeletePolicyDocument = async (id: string) => {
    try {
      await fetch(`/api/policy-documents/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setPolicyDocuments(policyDocuments.filter(p => p.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleClearIncidents = async () => {
    try {
      await fetch('/api/compliance-incidents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleUpdateFilingDeadline = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/filing-deadlines/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await safeJson(res);
      setFilingDeadlines(filingDeadlines.map(f => f.id === id ? updated : f));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleDeleteFilingDeadline = async (id: string) => {
    try {
      await fetch(`/api/filing-deadlines/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setFilingDeadlines(filingDeadlines.filter(f => f.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleCreateProjectTask = async (task: { companyId: string; title: string; description?: string; status?: string; priority?: string; assignee?: string; assigneeName?: string; due?: string }) => {
    try {
      const res = await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...task, ...actorBody() }) });
      const newTask = await safeJson(res);
      setProjectTasks([...projectTasks, newTask]);
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleUpdateProjectTask = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/project-tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res);
      setProjectTasks(projectTasks.map(t => t.id === id ? updated : t));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProjectTask = async (id: string) => {
    try {
      await fetch(`/api/project-tasks/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setProjectTasks(projectTasks.filter(t => t.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleCreateProjectMilestone = async (ms: { companyId: string; name: string; due?: string; status?: string; completion?: number }) => {
    try {
      const res = await fetch('/api/project-milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ms, ...actorBody() }) });
      const newMs = await safeJson(res);
      setProjectMilestones([...projectMilestones, newMs]);
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleUpdateProjectMilestone = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/project-milestones/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res);
      setProjectMilestones(projectMilestones.map(m => m.id === id ? updated : m));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProjectMilestone = async (id: string) => {
    try {
      await fetch(`/api/project-milestones/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setProjectMilestones(projectMilestones.filter(m => m.id !== id));
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };

  // --- PROCUREMENT HANDLERS ---
  const handleCreateVendor = async (data: { name: string; type: string; contact: string; email: string; rating: number }) => {
    try {
      const res = await fetch('/api/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      if (!res.ok) {
        const err = await safeJson(res);
        await modalAlert(err.error || 'Failed to create vendor', { variant: 'danger' });
        return;
      }
      const v = await safeJson(res); setVendors(prev => [...prev, v]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateVendor = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      if (!res.ok) {
        const err = await safeJson(res);
        await modalAlert(err.error || 'Failed to update vendor', { variant: 'danger' });
        return;
      }
      const updated = await safeJson(res); setVendors(vendors.map(v => v.id === id ? updated : v));
    } catch (err) { console.error(err); }
  };
  const handleDeleteVendor = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      if (!res.ok) {
        const err = await safeJson(res);
        await modalAlert(err.error || 'Failed to delete vendor', { variant: 'danger' });
        return;
      }
      setVendors(vendors.filter(v => v.id !== id));
    } catch (err) { console.error(err); }
  };
  const handleCreatePurchaseOrder = async (data: { vendorId: string; vendorName: string; item: string; qty: number; unitPrice: number }) => {
    try {
      const res = await fetch('/api/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      if (!res.ok) {
        const err = await safeJson(res);
        await modalAlert(err.error || 'Failed to create purchase order', { variant: 'danger' });
        return;
      }
      const po = await safeJson(res); setPurchaseOrders(prev => [...prev, po]);
    } catch (err) { console.error(err); }
  };
  const handleUpdatePurchaseOrder = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      if (!res.ok) {
        const err = await safeJson(res);
        await modalAlert(err.error || 'Failed to update purchase order', { variant: 'danger' });
        return;
      }
      const updated = await safeJson(res); setPurchaseOrders(purchaseOrders.map(po => po.id === id ? updated : po));
    } catch (err) { console.error(err); }
  };
  const handleDeletePurchaseOrder = async (id: string) => {
    try {
      await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
    } catch (err) { console.error(err); }
  };
  const handleCreateRFQ = async (data: { item: string; vendorsInvited: number }) => {
    try {
      const res = await fetch('/api/rfqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const rfq = await safeJson(res); setRfqs(prev => [...prev, rfq]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateRFQ = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/rfqs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res); setRfqs(rfqs.map(r => r.id === id ? updated : r));
    } catch (err) { console.error(err); }
  };
  const handleDeleteRFQ = async (id: string) => {
    try {
      await fetch(`/api/rfqs/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setRfqs(rfqs.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- MANUFACTURING HANDLERS ---
  const handleCreateWorkOrder = async (data: { product: string; qty: number; line: string; dueDate?: string }) => {
    try {
      const res = await fetch('/api/work-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const wo = await safeJson(res); setWorkOrders(prev => [...prev, wo]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateWorkOrder = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/work-orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res); setWorkOrders(workOrders.map(wo => wo.id === id ? updated : wo));
    } catch (err) { console.error(err); }
  };
  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await fetch(`/api/work-orders/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setWorkOrders(workOrders.filter(wo => wo.id !== id));
    } catch (err) { console.error(err); }
  };
  const handleCreateBOMItem = async (data: { product: string; part: string; qty: number; unit: string; cost: number }) => {
    try {
      const res = await fetch('/api/bom-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const item = await safeJson(res); setBomItems(prev => [...prev, item]);
    } catch (err) { console.error(err); }
  };
  const handleDeleteBOMItem = async (id: string) => {
    try {
      await fetch(`/api/bom-items/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setBomItems(bomItems.filter(b => b.id !== id));
    } catch (err) { console.error(err); }
  };
  const handleCreateQualityCheck = async (data: { check: string; result: string; inspector: string; notes?: string }) => {
    try {
      const res = await fetch('/api/quality-checks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const qc = await safeJson(res); setQualityChecks(prev => [...prev, qc]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateQualityCheck = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/quality-checks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res); setQualityChecks(qualityChecks.map(q => q.id === id ? updated : q));
    } catch (err) { console.error(err); }
  };
  const handleDeleteQualityCheck = async (id: string) => {
    try {
      await fetch(`/api/quality-checks/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setQualityChecks(qualityChecks.filter(q => q.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- ASSET MAINTENANCE HANDLERS ---
  const handleCreateMaintenanceTask = async (data: { assetId: string; assetName: string; task: string; due: string; owner: string }) => {
    try {
      const res = await fetch('/api/maintenance-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const mt = await safeJson(res); setMaintenanceTasks(prev => [...prev, mt]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateMaintenanceTask = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/maintenance-tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res); setMaintenanceTasks(maintenanceTasks.map(mt => mt.id === id ? updated : mt));
    } catch (err) { console.error(err); }
  };
  const handleDeleteMaintenanceTask = async (id: string) => {
    try {
      await fetch(`/api/maintenance-tasks/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setMaintenanceTasks(maintenanceTasks.filter(mt => mt.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- DOCUMENT HANDLERS ---
  const handleCreateDocument = async (data: { name: string; type: string; size?: string }) => {
    try {
      const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, companyId: selectedCompany?.id, ...actorBody() }) });
      const doc = await safeJson(res); setManagedDocuments(prev => [...prev, doc]);
    } catch (err) { console.error(err); }
  };
  const handleUpdateDocument = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...actorBody() }) });
      const updated = await safeJson(res); setManagedDocuments(managedDocuments.map(d => d.id === id ? updated : d));
    } catch (err) { console.error(err); }
  };
  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actorBody()) });
      setManagedDocuments(managedDocuments.filter(d => d.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleClearNotifications = () => {
    setNotificationCount(0);
  };



    // Show login page if not authenticated
    if (!authLoading && !token) {
      return <LoginPage />;
    }

    if (loading || !selectedCompany || !selectedUser) {
      return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
          {/* Skeleton sidebar rail */}
          <div className="hidden w-64 shrink-0 flex-col gap-2 border-r border-slate-200 bg-white p-4 md:flex">
            <Skeleton className="h-9 w-40" />
            <div className="mt-6 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
          {/* Skeleton content */}
          <div className="flex flex-1 flex-col">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <div className="flex-1 space-y-6 p-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      );
    }

  return (
    <>
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Left Sidebar Rail */}
      <Sidebar
        selectedCompany={selectedCompany}
        selectedUser={selectedUser}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        customRoles={customRoles}
        pendingApprovals={pendingApprovals}
      />

      {/* Main Content Layout Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Dynamic Context Header */}
        <Header
          selectedUser={selectedUser}
          notificationCount={notificationCount}
          pendingApprovalCount={pendingApprovals.filter(a => a.status === 'Pending' && a.companyId === selectedCompany.id).length}
          pendingApprovals={pendingApprovals}
          selectedCompanyId={selectedCompany.id}
          onClearNotifications={handleClearNotifications}
          onSearch={setSearchTerm}
          onSwitchRole={handleSwitchRole}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigateView={setActiveView}
        />

        {/* Dynamic Dashboard/Controls View stage */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          {/* Quick Platform Actions Banner for Super Admin */}
          {selectedUser.activeRole === 'Super Admin' && activeView === 'dashboard' && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="fs-xs fw-semibold text-slate-900 uppercase tracking-wider block">Global Platform Controls Active</span>
                <p className="fs-xs text-slate-500 mt-0.5">As platform Super Admin, you can provision completely new corporate tenants, manage billing structures, or login as company admins.</p>
              </div>
              <button
                onClick={() => setShowTenantSetup(true)}
                className="bg-slate-900 hover:bg-slate-850 text-white fw-semibold fs-xs px-4 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <i className="bi bi-plus-lg fs-xs"></i>
                Spawn Tenant Organization
              </button>
            </div>
          )}

          {/* Quick Subscription Settings Widget for Company Admins inside settings */}
          {selectedUser.activeRole === 'Company Admin' && activeView === 'dashboard' && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div>
                <span className="fs-xs fw-semibold text-slate-900 uppercase tracking-wider block">Modular SaaS Subscription Center</span>
                <p className="fs-xs text-slate-500 mt-0.5">Configure active business modules, install feature packs, or upgrade licensing tiers.</p>
              </div>
              <button
                onClick={() => setShowLicensingPanel(true)}
                className="bg-slate-900 hover:bg-slate-850 text-white fw-semibold fs-xs px-4 py-2 rounded transition-all cursor-pointer whitespace-nowrap"
              >
                Licensing Panel
              </button>
            </div>
          )}

          <ErrorBoundary resetKey={activeView}>
          <FadeIn key={activeView}>
          {activeView === 'dashboard' ? (
            <RoleDashboards
              selectedCompany={selectedCompany}
              selectedUser={selectedUser}
              employees={employees}
              leads={leads}
              glAccounts={glAccounts}
              bankAccountUpdates={bankAccountUpdates}
              profileUpdateRequests={profileUpdateRequests}
              onSubmitProfileUpdate={handleSubmitProfileUpdate}
              invoices={invoices}
              inventory={inventory}
              tickets={tickets}
              auditLogs={auditLogs}
              companies={companies}
              departments={departments}
              leaves={leaves}
              attendance={attendance}
              okrs={okrs}
              payslips={payslips}
              expenses={expenses}
              journalEntries={journalEntries}
              bills={bills}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleDeclineLeave}
              onApproveExpense={handleApproveExpense}
              onApproveBill={handleApproveBill}
              onApproveJournalEntry={handleApproveJournalEntry}
              onPayInvoice={handlePayInvoice}
              onRequestBankAccountUpdate={handleRequestBankAccountUpdate}
              onAdjustStock={handleAdjustStock}
              onNavigateView={setActiveView}
            />
          ) : activeView === 'workflow' || activeView.startsWith('wf-') ? (
            <WorkflowBuilder
              selectedCompany={selectedCompany}
              workflows={workflows}
              activeView={activeView}
              workflowTriggers={workflowTriggers}
              onToggleWorkflowTrigger={handleToggleWorkflowTrigger}
              auditLogs={auditLogs}
              onSaveWorkflow={handleSaveWorkflow}
              onToggleWorkflow={handleToggleWorkflow}
              invoices={invoices}
              employees={employees}
              expenses={expenses}
              inventory={inventory}
              leads={leads}
              attendance={attendance}
            />
          ) : activeView === 'ai-copilot' || activeView.startsWith('ai-') ? (
            <AIAssistant selectedCompany={selectedCompany} activeView={activeView} />
          ) : (
            <ModuleViews
              searchTerm={searchTerm}
              activeView={activeView}
              onNavigateView={setActiveView}
              selectedCompany={selectedCompany}
              selectedUser={selectedUser}
              users={users}
              customRoles={customRoles}
              employees={employees}
              bankAccountUpdates={bankAccountUpdates}
              onRequestBankAccountUpdate={handleRequestBankAccountUpdate}
              onApproveBankAccountUpdate={handleApproveBankAccountUpdate}
              onRejectBankAccountUpdate={handleRejectBankAccountUpdate}
              profileUpdateRequests={profileUpdateRequests}
              onSubmitProfileUpdate={handleSubmitProfileUpdate}
              onApproveProfileUpdate={handleApproveProfileUpdate}
              onRejectProfileUpdate={handleRejectProfileUpdate}
              departments={departments}
              branches={branches}
              leads={leads}
              crmActivities={crmActivities}
              crmTasks={crmTasks}
              crmEmails={crmEmails}
              glAccounts={glAccounts}
              invoices={invoices}
              inventory={inventory}
              tickets={tickets}
              auditLogs={auditLogs}
              apiKeys={apiKeys}
              leaves={leaves}
              attendance={attendance}
              okrs={okrs}
              payslips={payslips}
              payrollGroups={payrollGroups}
              salaryBands={salaryBands}
              journalEntries={journalEntries}
              expenses={expenses}
              fiscalPeriods={fiscalPeriods}
              openingBalances={openingBalances}
              onAddEmployee={handleAddEmployee}
              onAddLead={handleAddLead}
              onGenerateLeads={handleGenerateLeads}
              onMoveLead={handleMoveLead}
              onAssignLead={handleAssignLead}
              onAddComment={handleAddComment}
              onLogCrmActivity={handleLogCrmActivity}
              onCreateCrmTask={handleCreateCrmTask}
              onUpdateCrmTask={handleUpdateCrmTask}
              onSendCrmEmail={handleSendCrmEmail}
              onAddInvoice={handleAddInvoice}
              onPayInvoice={handlePayInvoice}
              onAdjustStock={handleAdjustStock}
              onAddTicket={handleAddTicket}
              onUpdateTicket={handleUpdateTicket}
              onInviteUser={handleInviteUser}
              onGenerateAPIKey={handleGenerateAPIKey}
              onAddExpense={handleCreateExpense}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleDeclineLeave}
              onAddLeave={handleCreateLeave}
              onClockIn={(mode) => handleClockAttendance('in', mode)}
              onClockOut={() => handleClockAttendance('out')}
              onAddOKR={handleCreateOKR}
              onUpdateEmployee={handleUpdateEmployee}
              onAddDepartment={handleAddDepartment}
              onAddBranch={handleAddBranch}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
              onboardings={onboardings}
              onAddOnboarding={handleAddOnboarding}
              onUpdateOnboarding={handleUpdateOnboarding}
              onDeleteOnboarding={handleDeleteOnboarding}
              onUpdateOKRProgress={handleUpdateOKRProgress}
              onRunPayroll={handleRunPayroll}
              payrollTaxConfig={payrollTaxConfig}
              onUpdatePayrollTaxConfig={handleUpdatePayrollTaxConfig}
              attendanceSettings={attendanceSettings}
              onUpdateAttendanceSettings={handleUpdateAttendanceSettings}
              onCreatePayrollGroup={handleCreatePayrollGroup}
              onDeletePayrollGroup={handleDeletePayrollGroup}
              onCreateSalaryBand={handleCreateSalaryBand}
              onUpdateSalaryBand={handleUpdateSalaryBand}
              onDeleteSalaryBand={handleDeleteSalaryBand}
              onAddGLAccount={handleAddGLAccount}
              onUpdateGLAccount={handleUpdateGLAccount}
              onDeleteGLAccount={handleDeleteGLAccount}
              onCreateJournalEntry={handleCreateJournalEntry}
              onPostJournalEntry={handlePostJournalEntry}
              onApproveJournalEntry={handleApproveJournalEntry}
              onVoidJournalEntry={handleVoidJournalEntry}
              onApproveExpense={handleApproveExpense}
              onCloseFiscalPeriod={handleCloseFiscalPeriod}
              onSetOpeningBalance={handleSetOpeningBalance}
              bills={bills}
              billPayments={billPayments}
              customerPayments={customerPayments}
              bankAccounts={bankAccounts}
              bankTransactions={bankTransactions}
              bankReconciliations={bankReconciliations}
              fixedAssets={fixedAssets}
              depreciationEntries={depreciationEntries}
              budgets={budgets}
              costCenters={costCenters}
              currencyRates={currencyRates}
              onCreateBill={handleCreateBill}
              onApproveBill={handleApproveBill}
              onPayBill={handlePayBill}
              onReceiveCustomerPayment={handleReceiveCustomerPayment}
              onCreateBankAccount={handleCreateBankAccount}
              onUpdateBankAccount={handleUpdateBankAccount}
              onReconcileBank={handleReconcileBank}
              onCreateFixedAsset={handleCreateFixedAsset}
              onDisposeAsset={handleDisposeAsset}
              onRunDepreciation={handleRunDepreciation}
              onCreateBudget={handleCreateBudget}
              onApproveBudget={handleApproveBudget}
              onCreateCostCenter={handleCreateCostCenter}
              onUpdateCurrencyRate={handleUpdateCurrencyRate}
              taxCodes={taxCodes}
              taxReturns={taxReturns}
              intercompanyTxns={intercompanyTxns}
              consolidationRules={consolidationRules}
              complianceChecks={complianceChecks}
              auditSnapshots={auditSnapshots}
              policyDocuments={policyDocuments}
              filingDeadlines={filingDeadlines}
              onCreateTaxReturn={handleCreateTaxReturn}
              onFileTaxReturn={handleFileTaxReturn}
              onUpdateTaxReturn={handleUpdateTaxReturn}
              onDeleteTaxReturn={handleDeleteTaxReturn}
              onCreateIntercompanyTxn={handleCreateIntercompanyTxn}
              onApproveIntercompanyTxn={handleApproveIntercompanyTxn}
              onEliminateIntercompanyTxn={handleEliminateIntercompanyTxn}
              onCreateConsolidationRule={handleCreateConsolidationRule}
              onResolveComplianceCheck={handleResolveComplianceCheck}
              onCreateComplianceCheck={handleCreateComplianceCheck}
              onUpdateComplianceCheck={handleUpdateComplianceCheck}
              onDeleteComplianceCheck={handleDeleteComplianceCheck}
              onDeletePolicyDocument={handleDeletePolicyDocument}
              onClearIncidents={handleClearIncidents}
              onAcknowledgePolicy={handleAcknowledgePolicy}
              onFileDeadline={handleFileDeadline}
              onCreateFilingDeadline={handleCreateFilingDeadline}
              onUpdateFilingDeadline={handleUpdateFilingDeadline}
              onDeleteFilingDeadline={handleDeleteFilingDeadline}
              onCreateTaxCode={handleCreateTaxCode}
              onUpdateTaxCode={handleUpdateTaxCode}
              onDeleteTaxCode={handleDeleteTaxCode}
              tenants={companies}
              onAssignPlan={handleAssignPlan}
              posProducts={posProducts}
              posCustomers={posCustomers}
              posSales={posSales}
              posCategories={posCategories}
              posTerminals={posTerminals}
              posShifts={posShifts}
              posDiscounts={posDiscounts}
              posReturns={posReturns}
              posDailyReports={posDailyReports}
              onAddPOSProduct={handleAddPOSProduct}
              onAddPOSCustomer={handleAddPOSCustomer}
              onCreatePOSSale={handleCreatePOSSale}
              onAddPOSCategory={handleAddPOSCategory}
              onAddPOSTerminal={handleAddPOSTerminal}
              onCreatePOSShift={handleCreatePOSShift}
              onClosePOSShift={handleClosePOSShift}
              onAddPOSDiscount={handleAddPOSDiscount}
              onUpdatePOSDiscount={handleUpdatePOSDiscount}
              onCreatePOSReturn={handleCreatePOSReturn}
              onApprovePOSReturn={handleApprovePOSReturn}
              onGeneratePOSReport={handleGeneratePOSReport}
              salesOrders={salesOrders}
              onCreateSalesOrder={handleCreateSalesOrder}
              onUpdateSalesOrder={handleUpdateSalesOrder}
              salesCustomers={salesCustomers}
              onCreateSalesCustomer={handleCreateSalesCustomer}
              onUpdateSalesCustomer={handleUpdateSalesCustomer}
              onDeleteSalesCustomer={handleDeleteSalesCustomer}
              salesQuotations={salesQuotations}
              onCreateSalesQuotation={handleCreateSalesQuotation}
              onUpdateSalesQuotation={handleUpdateSalesQuotation}
              onDeleteSalesQuotation={handleDeleteSalesQuotation}
              salesTargets={salesTargets}
              onCreateSalesTarget={handleCreateSalesTarget}
              onUpdateSalesTarget={handleUpdateSalesTarget}
              onDeleteSalesTarget={handleDeleteSalesTarget}
              kbArticles={kbArticles}
              onAddKbArticle={handleAddKbArticle}
              lmsCourses={lmsCourses}
              onAddLmsCourse={handleAddLmsCourse}
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              emailTemplates={emailTemplates}
              onAddEmailTemplate={handleAddEmailTemplate}
              chatMessages={chatMessages}
              chatGroups={chatGroups}
              chatReads={chatReads}
              onSendChatMessage={handleSendChatMessage}
              onMarkThreadRead={handleMarkThreadRead}
              onCreateChatGroup={handleCreateChatGroup}
              onUpdateChatGroupMembers={handleUpdateChatGroupMembers}
              polls={polls}
              pollOptions={pollOptions}
              pollVotes={pollVotes}
              onCreatePoll={handleCreatePoll}
              onClosePoll={handleClosePoll}
              onUpdatePoll={handleUpdatePoll}
              onVotePoll={handleVotePoll}
              companyImages={companyImages}
              onUploadCompanyImage={handleUploadCompanyImage}
              onDeleteCompanyImage={handleDeleteCompanyImage}
              projectTasks={projectTasks}
              projectMilestones={projectMilestones}
              onCreateProjectTask={handleCreateProjectTask}
              onUpdateProjectTask={handleUpdateProjectTask}
              onDeleteProjectTask={handleDeleteProjectTask}
              onCreateProjectMilestone={handleCreateProjectMilestone}
              onUpdateProjectMilestone={handleUpdateProjectMilestone}
              onDeleteProjectMilestone={handleDeleteProjectMilestone}
              vendors={vendors}
              purchaseOrders={purchaseOrders}
              rfqs={rfqs}
              onCreateVendor={handleCreateVendor}
              onUpdateVendor={handleUpdateVendor}
              onDeleteVendor={handleDeleteVendor}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onUpdatePurchaseOrder={handleUpdatePurchaseOrder}
              onDeletePurchaseOrder={handleDeletePurchaseOrder}
              onCreateRFQ={handleCreateRFQ}
              onUpdateRFQ={handleUpdateRFQ}
              onDeleteRFQ={handleDeleteRFQ}
              workOrders={workOrders}
              bomItems={bomItems}
              qualityChecks={qualityChecks}
              onCreateWorkOrder={handleCreateWorkOrder}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onDeleteWorkOrder={handleDeleteWorkOrder}
              onCreateBOMItem={handleCreateBOMItem}
              onDeleteBOMItem={handleDeleteBOMItem}
              onCreateQualityCheck={handleCreateQualityCheck}
              onUpdateQualityCheck={handleUpdateQualityCheck}
              onDeleteQualityCheck={handleDeleteQualityCheck}
              maintenanceTasks={maintenanceTasks}
              onCreateMaintenanceTask={handleCreateMaintenanceTask}
              onUpdateMaintenanceTask={handleUpdateMaintenanceTask}
              onDeleteMaintenanceTask={handleDeleteMaintenanceTask}
              managedDocuments={managedDocuments}
              onCreateDocument={handleCreateDocument}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
              exitRequests={exitRequests}
              onSubmitExitRequest={handleSubmitExitRequest}
              onApproveExitRequest={handleApproveExitRequest}
              onRejectExitRequest={handleRejectExitRequest}
              onUpdateCompanySettings={handleUpdateCompanySettings}
                onUpdateUserSignature={handleUpdateUserSignature}
              onCreateRole={handleCreateRole}
              onUpdateRole={handleUpdateRole}
              onDeleteRole={handleDeleteRole}
              approvalPolicies={approvalPolicies}
              pendingApprovals={pendingApprovals}
              onUpdateApprovalPolicies={handleUpdateApprovalPolicies}
              onRefreshPendingApprovals={handleRefreshPendingApprovals}
            />
          )}
          </FadeIn>
          </ErrorBoundary>
        </main>
      </div>

      {/* MODAL 1: Tenant Setup Provisioning */}
      {showTenantSetup && (
        <TenantSetup
          onAddCompany={handleAddCompany}
          onClose={() => setShowTenantSetup(false)}
        />
      )}

      {/* MODAL 2: Licensing Subscriptions Panel */}
      {showLicensingPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <i className="bi bi-cpu text-slate-800 fs-xs"></i>
              SaaS Module Licensing & Feature Packs: {selectedCompany.name}
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[10px] fw-bold uppercase text-slate-400 tracking-wider">Business Modules (SaaS Core)</span>
                <p className="text-[11px] text-slate-400">Companies subscribe to modules individually. Toggling here instantly updates the sidebar context.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: 'Core Suite',
                      modules: ['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales']
                    },
                    {
                      title: 'Operations & Projects',
                      modules: ['Inventory', 'Procurement', 'Project Management', 'Manufacturing', 'Point of Sale (POS)', 'Asset Management', 'Document Management']
                    },
                    {
                      title: 'Engagement & Compliance',
                      modules: ['Help Desk', 'Visitor Management', 'Learning Management (LMS)', 'Compliance', 'Communication']
                    },
                    {
                      title: 'Intelligence & Automation',
                      modules: ['Reports & Analytics', 'Workflow & Automation', 'AI Assistant']
                    }
                  ].map(group => (
                    <div key={group.title} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                      <span className="text-[10px] fw-bold uppercase text-slate-500 tracking-wider block mb-2">{group.title}</span>
                      <div className="space-y-1.5">
                        {group.modules.map(mod => {
                          const isInstalled = selectedCompany.activeModules.includes(mod);
                          return (
                            <label key={mod} className="flex items-center gap-2 fs-xs fw-semibold text-slate-700 hover:text-slate-900 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isInstalled}
                                onChange={(e) => {
                                  let updated = [...selectedCompany.activeModules];
                                  if (e.target.checked) {
                                    updated.push(mod);
                                  } else {
                                    updated = updated.filter(m => m !== mod);
                                  }
                                  handleUpdateSubscription(updated, selectedCompany.premiumFeatures);
                                }}
                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                              />
                              {mod}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] fw-semibold uppercase text-slate-400 tracking-wider">Premium Feature Packs</span>
                <p className="text-[11px] text-slate-400">Unlock high-density add-ons, geofencing coordinates, and machine-learning scoring algorithms.</p>
                <div className="mt-2 space-y-2">
                  {[
                    { id: 'GPS Attendance', label: 'GPS Geofenced Attendance (HR add-on)' },
                    { id: 'AI Lead Scoring', label: 'AI Smart Lead Scoring (CRM add-on)' },
                    { id: 'Financial Forecasting', label: 'Predictive Cash Projections (Accounting add-on)' },
                    { id: 'Auto Reordering', label: 'Inventory Smart Reordering (Inventory add-on)' }
                  ].map(feat => {
                    const isUnlocked = selectedCompany.premiumFeatures.includes(feat.id);
                    return (
                      <label key={feat.id} className="flex items-center justify-between border border-slate-200 p-2.5 rounded hover:bg-slate-50 cursor-pointer fs-xs fw-semibold text-slate-700">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isUnlocked}
                            onChange={(e) => {
                              let updated = [...selectedCompany.premiumFeatures];
                              if (e.target.checked) {
                                updated.push(feat.id);
                              } else {
                                updated = updated.filter(f => f !== feat.id);
                              }
                              handleUpdateSubscription(selectedCompany.activeModules, updated);
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
                          />
                          {feat.label}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded uppercase fw-bold tracking-wide">Premium</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-150 mt-5">
              <button
                onClick={() => setShowLicensingPanel(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white fw-semibold fs-xs px-4 py-2 rounded cursor-pointer transition-all"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Floating Team Chat — always visible */}
    <FloatingChat
      selectedCompany={selectedCompany}
      selectedUser={selectedUser}
      departments={departments}
      employees={employees}
      chatMessages={chatMessages}
      chatGroups={chatGroups}
      chatReads={chatReads}
      onSendChatMessage={handleSendChatMessage}
      onMarkThreadRead={handleMarkThreadRead}
      onCreateChatGroup={handleCreateChatGroup}
      onUpdateChatGroupMembers={handleUpdateChatGroupMembers}
    />
    </>
  );
}






