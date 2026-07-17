/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company, User, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice, InventoryItem, SupportTicket, AuditLog, APIKey, ERPWorkflow, Department, Branch, POSProduct, POSCustomer, POSSale, POSCategory, POSTerminal, POSShift, POSDiscount, POSReturn, POSDailyReport, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, PayrollGroup, SalaryBand, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline, OnboardingRecord, SalesOrder, SalesCustomer, SalesQuotation, SalesTarget, PayrollTaxConfig, KBArticle, LMSCourse, CommunicationAnnouncement, WorkflowTrigger, EmailTemplate } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RoleDashboards } from './components/RoleDashboards';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { AIAssistant } from './components/AIAssistant';
import { ModuleViews } from './components/ModuleViews';
import { TenantSetup } from './components/TenantSetup';
import { FadeIn, Skeleton } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
// No lucide-react imports needed
import { modalAlert } from './utils/modal';

export default function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Core database tables
  const [employees, setEmployees] = useState<Employee[]>([]);
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [workflows, setWorkflows] = useState<ERPWorkflow[]>([]);

  // Synchronised HR & Payroll State
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [okrs, setOkrs] = useState<OKRRecord[]>([]);
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [payrollTaxConfig, setPayrollTaxConfig] = useState<PayrollTaxConfig | null>(null);
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

  // Navigation states
  const [activeView, setActiveView] = useState('dashboard');
  const [showTenantSetup, setShowTenantSetup] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Licensing Matrice config panel modal state inside tenant settings
  const [showLicensingPanel, setShowLicensingPanel] = useState(false);

  // Initial Fetch on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, uRes, eRes, dRes, bRes, lRes, aRes, iRes, tRes, wRes, kRes, logRes, posProdRes, posCustRes, posSalesRes, posCatRes, posTermRes, posShiftRes, posDiscRes, posRetRes, posReportRes, leavesRes, attRes, okrsRes, slipsRes, jeRes, expRes, fpRes, obRes, billRes, bpPayRes, cpRes, baRes, btxRes, brRes, faRes, deRes, budRes, ccRes, onbRes, pgRes, sbRes, soRes, scRes, sqRes, stRes, kbRes, lmsRes, annRes, wtRes, etRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/users'),
          fetch('/api/employees'),
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
          fetch('/api/email-templates')
        ]);

        const cData = await cRes.json();
        const uData = await uRes.json();
        const eData = await eRes.json();
        const dData = await dRes.json();
        const bData = await bRes.json();
        const lData = await lRes.json();
        const accData = await aRes.json();
        const invData = await iRes.json();
        const tData = await tRes.json();
        const wData = await wRes.json();
        const kData = await kRes.json();
        const logData = await logRes.json();
        const posProdData = await posProdRes.json();
        const posCustData = await posCustRes.json();
        const posSalesData = await posSalesRes.json();
        const posCatData = await posCatRes.json();
        const posTermData = await posTermRes.json();
        const posShiftData = await posShiftRes.json();
        const posDiscData = await posDiscRes.json();
        const posRetData = await posRetRes.json();
        const posReportData = await posReportRes.json();
        const leavesData = await leavesRes.json();
        const attData = await attRes.json();
        const okrsData = await okrsRes.json();
        const slipsData = await slipsRes.json();
        const jeData = await jeRes.json();
        const expData = await expRes.json();
        const fpData = await fpRes.json();
        const obData = await obRes.json();
        const billData = await billRes.json();
        const bpPayData = await bpPayRes.json();
        const cpData = await cpRes.json();
        const baData = await baRes.json();
        const btxData = await btxRes.json();
        const brData = await brRes.json();
        const faData = await faRes.json();
        const deData = await deRes.json();
        const budData = await budRes.json();
        const ccData = await ccRes.json();
        const onbData = await onbRes.json();
        const pgData = await pgRes.json();
        const sbData = await sbRes.json();
        const soData = await soRes.json();
        const kbData = await kbRes.json();
        const lmsData = await lmsRes.json();
        const annData = await annRes.json();
        const wtData = await wtRes.json();
        const etData = await etRes.json();

        setCompanies(cData);
        setUsers(uData);
        setEmployees(eData);
        setDepartments(dData);
        setBranches(bData);
        setLeads(lData);
        setGlAccounts(accData.accounts);
        setInvoices(accData.invoices);
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

        const scData = await scRes.json();
        const sqData = await sqRes.json();
        const stData = await stRes.json();
        setSalesCustomers(scData);
        setSalesQuotations(sqData);
        setSalesTargets(stData);
        setKbArticles(kbData);
        setLmsCourses(lmsData);
        setAnnouncements(annData);
        setWorkflowTriggers(wtData);
        setEmailTemplates(etData);

        // Fetch CRM activities
        const actRes = await fetch('/api/crm-activities');
        setCrmActivities(await actRes.json());

        // Fetch CRM tasks
        const taskRes = await fetch('/api/crm-tasks');
        setCrmTasks(await taskRes.json());

        // Fetch CRM emails
        const emailRes = await fetch('/api/crm-emails');
        setCrmEmails(await emailRes.json());
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
          const crData = await crRes.json();
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
          setTaxCodes(await tcRes.json());
          setTaxReturns(await trRes.json());
          setIntercompanyTxns(await icRes.json());
          setConsolidationRules(await conRes.json());
          setComplianceChecks(await compRes.json());
          setAuditSnapshots(await asRes.json());
          setPolicyDocuments(await pdRes.json());
          setFilingDeadlines(await fdRes.json());
        } catch (e) { console.error('Failed to load Tier 3 data:', e); }

        // Select default tenant and user role
        if (cData.length > 0) setSelectedCompany(cData[0]);
        if (uData.length > 0) setSelectedUser(uData[1]); // default to Alex Mercer (Company Admin)
        } catch (err) {
          console.error("Error loading full-stack database tables:", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, []);

  // Load payroll tax/deduction config for the active company
  useEffect(() => {
    if (!selectedCompany) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/payroll-tax-config?companyId=${selectedCompany.id}`);
        const cfg = await res.json();
        if (!cancelled) setPayrollTaxConfig(cfg || null);
      } catch (e) { console.error('Failed to load payroll tax config:', e); }
    })();
    return () => { cancelled = true; };
  }, [selectedCompany]);

  // Update states whenever selected company is switched to maintain full tenant isolation
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);

    // Auto align user perspective to matching tenant's admin, or keep Super Admin
    if (selectedUser?.role !== 'Super Admin') {
      const match = users.find(u => u.companyId === company.id);
      if (match) setSelectedUser(match);
    }

    // Reset to dashboard so we never land on a view that doesn't belong to the new tenant/role
    setActiveView('dashboard');
  };

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
      const newComp = await res.json();
      setCompanies([...companies, newComp]);
      setSelectedCompany(newComp);
      
      // Reload logs and GL accounts
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
      const accRes = await fetch('/api/accounting');
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
    } catch (err) {
      console.error(err);
    }
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
      const updated = await res.json();
      
      // Update local states
      setCompanies(companies.map(c => c.id === selectedCompany.id ? updated : c));
      setSelectedCompany(updated);

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setCompanies(companies.map(c => (c.id === companyId ? updated : c)));
      if (selectedCompany && selectedCompany.id === companyId) setSelectedCompany(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (empInput: Omit<Employee, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empInput)
      });
      const data = await res.json();
      
      setEmployees([...employees, data.employee]);
      setNotificationCount(prev => prev + 1);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setEmployees(employees.map(e => e.id === id ? { ...e, ...data } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDepartment = async (deptInput: Omit<Department, 'id' | 'employeeCount'>) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptInput)
      });
      const data = await res.json();
      setDepartments([...departments, data]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBranch = async (branchInput: Omit<Branch, 'id'>) => {
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchInput)
      });
      const data = await res.json();
      setBranches([...branches, data.branch]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setDepartments(departments.map(d => d.id === id ? { ...d, ...data } : d));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      setDepartments(departments.filter(d => d.id !== id));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleAddOnboarding = async (record: Omit<OnboardingRecord, 'id'>) => {
    try {
      const res = await fetch('/api/onboardings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const data = await res.json();
      setOnboardings([...onboardings, data]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleUpdateOnboarding = async (id: string, updates: Partial<OnboardingRecord>) => {
    try {
      const res = await fetch(`/api/onboardings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setOnboardings(onboardings.map(o => o.id === id ? { ...o, ...data } : o));
    } catch (err) { console.error(err); }
  };

  const handleDeleteOnboarding = async (id: string) => {
    try {
      await fetch(`/api/onboardings/${id}`, { method: 'DELETE' });
      setOnboardings(onboardings.filter(o => o.id !== id));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleAddLead = async (leadInput: Omit<CRMLead, 'id' | 'status' | 'aiLeadScore' | 'aiFollowUpSuggested' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadInput)
      });
      const data = await res.json();
      setLeads([...leads, data.lead]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const data = await res.json();

      setLeads(leads.map(l => l.id === leadId ? data.lead : l));
      if (data.invoiceCreated) {
        setInvoices([data.invoiceCreated, ...invoices]);
        setNotificationCount(prev => prev + 1);
      }

      // Reload audits & GL
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await logRes.json());
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInvoice = async (invInput: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'status'>) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invInput)
      });
      const newInv = await res.json();
      setInvoices([newInv, ...invoices]);

      // Reload audits & ledger
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await logRes.json());
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
    } catch (err) {
      console.error(err);
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
      const paid = await res.json();
      setInvoices(invoices.map(i => i.id === invId ? paid : i));

      // Reload audits & ledger balances
      const [logRes, accRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/accounting')
      ]);
      setAuditLogs(await logRes.json());
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
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
      const updatedUser = await res.json();
      
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

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setActiveView('dashboard');
  };

  const handleApproveLeave = async (leaveId: string) => {
    if (!selectedUser || !selectedCompany) return;
    try {
      await fetch(`/api/leaves/${leaveId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      
      // Reload leaves, employees, audits
      const [lRes, eRes, logRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees'),
        fetch('/api/audit-logs')
      ]);
      setLeaves(await lRes.json());
      setEmployees(await eRes.json());
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineLeave = async (leaveId: string) => {
    if (!selectedUser || !selectedCompany) return;
    try {
      await fetch(`/api/leaves/${leaveId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, userName: selectedUser.name })
      });
      
      // Reload leaves, employees, audits
      const [lRes, eRes, logRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees'),
        fetch('/api/audit-logs')
      ]);
      setLeaves(await lRes.json());
      setEmployees(await eRes.json());
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
  }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leaveInput, companyId: selectedCompany.id })
      });
      const data = await res.json();
      setLeaves([...leaves, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockAttendance = async (action: 'in' | 'out', locationType?: string) => {
    if (!selectedUser || !selectedCompany) return;
    const emp = employees.find(e => e.email === selectedUser.email);
    if (!emp) return;
    
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
      
      const attRes = await fetch('/api/attendance');
      setAttendance(await attRes.json());
    } catch (err) {
      console.error(err);
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
      const data = await res.json();
      setOkrs([...okrs, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOKRProgress = async (okrId: string, progress: number) => {
    try {
      await fetch(`/api/okrs/${okrId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      
      const oRes = await fetch('/api/okrs');
      setOkrs(await oRes.json());
    } catch (err) {
      console.error(err);
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
      
      // Reload payslips, ledger, audits
      const [pRes, aRes, logRes] = await Promise.all([
        fetch('/api/payslips'),
        fetch('/api/accounting'),
        fetch('/api/audit-logs')
      ]);
      setPayslips(await pRes.json());
      const accData = await aRes.json();
      setGlAccounts(accData.accounts);
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const group = await res.json();
      setPayrollGroups([...payrollGroups, group]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayrollGroup = async (groupId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/payroll-groups/${groupId}`, { method: 'DELETE' });
      setPayrollGroups(payrollGroups.filter(g => g.id !== groupId));
    } catch (err) {
      console.error(err);
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
      const band = await res.json();
      setSalaryBands([...salaryBands, band]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSalaryBand = async (bandId: string, updates: { name?: string; minSalary?: number; maxSalary?: number; employeeCount?: number }) => {
    try {
      const res = await fetch(`/api/salary-bands/${bandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setSalaryBands(salaryBands.map(b => b.id === bandId ? updated : b));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSalaryBand = async (bandId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch(`/api/salary-bands/${bandId}`, { method: 'DELETE' });
      setSalaryBands(salaryBands.filter(b => b.id !== bandId));
    } catch (err) {
      console.error(err);
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
      const data = await res.json();
      setInventory(inventory.map(i => i.id === itemId ? data.item : i));

      if (data.lowStockAlert) {
        setNotificationCount(prev => prev + 1);
      }

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTicket = async (tktInput: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'assignedTo' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tktInput)
      });
      const newTkt = await res.json();
      setTickets([newTkt, ...tickets]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTicket = async (id: string, updates: { status?: string; department?: string; reply?: { message: string }; repliedBy?: string; repliedByRole?: 'Customer' | 'Agent' | 'Admin' }) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setTickets(tickets.map(t => t.id === id ? { ...t, ...updated } : t));

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayrollTaxConfig = async (companyId: string, cfg: Partial<PayrollTaxConfig>) => {
    try {
      const res = await fetch('/api/payroll-tax-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...cfg })
      });
      const updated = await res.json();
      setPayrollTaxConfig(updated);

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const created = await res.json();
      setKbArticles([created, ...kbArticles]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const created = await res.json();
      setLmsCourses([created, ...lmsCourses]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const created = await res.json();
      setAnnouncements([created, ...announcements]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
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
      const created = await res.json();
      setEmailTemplates([created, ...emailTemplates]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newWf = await res.json();
      setWorkflows([...workflows, newWf]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWorkflow = (id: string, active: boolean) => {
    setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: active } : w));
  };

  const handleInviteUser = async (usrInput: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...usrInput, companyId: selectedCompany.id })
      });
      const newUser = await res.json();
      setUsers([...users, newUser]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const newKey = await res.json();
      setApiKeys([...apiKeys, newKey]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const data = await res.json();
      setPosProducts([...posProducts, data]);
      
      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPOSCustomer = async (customerInput: Omit<POSCustomer, 'id' | 'loyaltyPoints' | 'tier' | 'totalPurchases' | 'totalSpent' | 'storeCredit' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInput)
      });
      const data = await res.json();
      setPosCustomers([...posCustomers, data]);
      
      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePOSSale = async (saleInput: any) => {
    try {
      const res = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleInput)
      });
      const data = await res.json();
      setPosSales([...posSales, data]);
      setNotificationCount(prev => prev + 1);
      
      // Reload POS data to update stock
      const [posProdRes, posCustRes] = await Promise.all([
        fetch('/api/pos/products'),
        fetch('/api/pos/customers')
      ]);
      setPosProducts(await posProdRes.json());
      setPosCustomers(await posCustRes.json());
      
      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newCat = await res.json();
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
      const newTerm = await res.json();
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
      const newShift = await res.json();
      setPosShifts([...posShifts, newShift]);
    } catch (e) { console.error('Failed to create POS shift:', e); }
  };

  const handleClosePOSShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/pos/shifts/${shiftId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const updated = await res.json();
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
      const newDisc = await res.json();
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
      const updated = await res.json();
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
      const newRet = await res.json();
      setPosReturns([...posReturns, newRet]);
    } catch (e) { console.error('Failed to create POS return:', e); }
  };

  const handleApprovePOSReturn = async (returnId: string) => {
    try {
      const res = await fetch(`/api/pos/returns/${returnId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const updated = await res.json();
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
      const newReport = await res.json();
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
      const lead = await res.json();
      setLeads(leads.map(l => l.id === leadId ? lead : l));

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const lead = await res.json();
      setLeads(leads.map(l => l.id === leadId ? lead : l));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const lead = await res.json();
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
      const data = await res.json();
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
      const data = await res.json();
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
      const data = await res.json();
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
      const data = await res.json();
      setCrmEmails([data, ...crmEmails]);
      // Also update activities since the API logs it
      const actRes = await fetch('/api/crm-activities');
      setCrmActivities(await actRes.json());
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
      const data = await res.json();
      setInventory([...inventory, data.item]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const data = await res.json();
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
      const data = await res.json();
      setApiKeys([...apiKeys, data.key]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const data = await res.json();
      setWorkflows([...workflows, data.workflow]);

      // Reload audits
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
        const err = await res.json();
        await modalAlert(err.error, { variant: 'danger' });
        return;
      }
      const newAccount = await res.json();
      setGlAccounts([...glAccounts, newAccount]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGLAccount = async (accountId: string, updates: { name?: string; type?: string }) => {
    try {
      const res = await fetch(`/api/gl-accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setGlAccounts(glAccounts.map(a => a.id === accountId ? updated : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGLAccount = async (accountId: string) => {
    try {
      const res = await fetch(`/api/gl-accounts/${accountId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        await modalAlert(err.error, { variant: 'danger' });
        return;
      }
      setGlAccounts(glAccounts.filter(a => a.id !== accountId));
    } catch (err) {
      console.error(err);
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
        const err = await res.json();
        await modalAlert(err.error, { variant: 'danger' });
        return;
      }
      const newEntry = await res.json();
      setJournalEntries([...journalEntries, newEntry]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const updated = await res.json();
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      // Reload GL accounts to reflect balance changes
      const accRes = await fetch('/api/accounting');
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const updated = await res.json();
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const updated = await res.json();
      setJournalEntries(journalEntries.map(j => j.id === entryId ? updated : j));
      // Reload GL accounts to reflect reversed balances
      const accRes = await fetch('/api/accounting');
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const newExp = await res.json();
      setExpenses([...expenses, newExp]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const updated = await res.json();
      setExpenses(expenses.map(e => e.id === expenseId ? updated : e));
      // Reload GL accounts and journal entries
      const [accRes, jeRes] = await Promise.all([
        fetch('/api/accounting'),
        fetch('/api/journal-entries')
      ]);
      const accData = await accRes.json();
      setGlAccounts(accData.accounts);
      setJournalEntries(await jeRes.json());
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
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
      const updated = await res.json();
      setFiscalPeriods(fiscalPeriods.map(f => f.id === periodId ? updated : f));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newOb = await res.json();
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newBill = await res.json();
      setBills([...bills, newBill]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setBills(bills.map(b => b.id === billId ? updated : b));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setBills(bills.map(b => b.id === billId ? updated : b));
      // Reload bank data
      const [baRes, bpRes] = await Promise.all([fetch('/api/bank-accounts'), fetch('/api/bills')]);
      setBankAccounts(await baRes.json());
      setBills(await bpRes.json());
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newPayment = await res.json();
      setCustomerPayments([...customerPayments, newPayment]);
      // Reload invoices and bank
      const [invRes, baRes] = await Promise.all([fetch('/api/accounting'), fetch('/api/bank-accounts')]);
      const accData = await invRes.json();
      setInvoices(accData.invoices);
      setBankAccounts(await baRes.json());
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newOrder = await res.json();
      setSalesOrders([newOrder, ...salesOrders]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setSalesOrders(salesOrders.map(o => o.id === orderId ? updated : o));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newCust = await res.json();
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
      const updated = await res.json();
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newQuote = await res.json();
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
      const updated = await res.json();
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
      if (!res.ok) { const err = await res.json(); await modalAlert(err.error, { variant: 'danger' }); return; }
      const newTarget = await res.json();
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
      const updated = await res.json();
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
      const newBA = await res.json();
      setBankAccounts([...bankAccounts, newBA]);
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
      const newRec = await res.json();
      setBankReconciliations([...bankReconciliations, newRec]);
      const txRes = await fetch('/api/bank-transactions');
      setBankTransactions(await txRes.json());
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newAsset = await res.json();
      setFixedAssets([...fixedAssets, newAsset]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setFixedAssets(fixedAssets.map(a => a.id === assetId ? updated : a));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newEntries = await res.json();
      setDepreciationEntries([...depreciationEntries, ...newEntries]);
      // Reload fixed assets
      const faRes = await fetch('/api/fixed-assets');
      setFixedAssets(await faRes.json());
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newBudget = await res.json();
      setBudgets([...budgets, newBudget]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setBudgets(budgets.map(b => b.id === budgetId ? updated : b));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newCC = await res.json();
      setCostCenters([...costCenters, newCC]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newRate = await res.json();
      setCurrencyRates([...currencyRates.filter(r => !(r.baseCurrency === rateInput.baseCurrency && r.targetCurrency === rateInput.targetCurrency)), newRate]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newTR = await res.json();
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
      const updated = await res.json();
      setTaxReturns(taxReturns.map(t => t.id === returnId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newTx = await res.json();
      setIntercompanyTxns([...intercompanyTxns, newTx]);
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setIntercompanyTxns(intercompanyTxns.map(t => t.id === txId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const updated = await res.json();
      setIntercompanyTxns(intercompanyTxns.map(t => t.id === txId ? updated : t));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
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
      const newRule = await res.json();
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
      const updated = await res.json();
      setComplianceChecks(complianceChecks.map(c => c.id === checkId ? updated : c));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleAcknowledgePolicy = async (policyId: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/policy-documents/${policyId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const updated = await res.json();
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
      const updated = await res.json();
      setFilingDeadlines(filingDeadlines.map(f => f.id === filingId ? updated : f));
      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateComplianceCheck = async (checkInput: { companyId: string; category: string; title: string; description: string; dueDate: string; assignee: string; assigneeName: string; createdBy: string }) => {
    try {
      const res = await fetch('/api/compliance-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInput)
      });
      const newCheck = await res.json();
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
      const newFiling = await res.json();
      setFilingDeadlines([...filingDeadlines, newFiling]);
    } catch (err) { console.error(err); }
  };

  const refreshAuditLogs = async () => {
    try { const res = await fetch('/api/audit-logs'); setAuditLogs(await res.json()); } catch (err) { console.error(err); }
  };
  const actorBody = () => ({ userId: selectedUser?.id, userName: selectedUser?.name });

  const handleCreateTaxCode = async (tcInput: any) => {
    if (!selectedCompany || !selectedUser) return;
    try {
      const res = await fetch('/api/tax-codes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tcInput, companyId: selectedCompany.id, createdBy: selectedUser.id, createdByName: selectedUser.name })
      });
      setTaxCodes([...taxCodes, await res.json()]);
      await refreshAuditLogs();
    } catch (err) { console.error(err); }
  };
  const handleUpdateTaxCode = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/tax-codes/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await res.json();
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
      const updated = await res.json();
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
      const updated = await res.json();
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

  const handleUpdateFilingDeadline = async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/filing-deadlines/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...actorBody() })
      });
      const updated = await res.json();
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

  const handleClearNotifications = () => {
    setNotificationCount(0);
  };


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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Left Sidebar Rail */}
      <Sidebar
        selectedCompany={selectedCompany}
        selectedUser={selectedUser}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Content Layout Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Dynamic Context Header */}
        <Header
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={handleSelectCompany}
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          notificationCount={notificationCount}
          onClearNotifications={handleClearNotifications}
          onSearch={setSearchTerm}
          onSwitchRole={handleSwitchRole}
        />

        {/* Dynamic Dashboard/Controls View stage */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Quick Platform Actions Banner for Super Admin */}
          {selectedUser.activeRole === 'Super Admin' && activeView === 'dashboard' && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">Global Platform Controls Active</span>
                <p className="text-xs text-slate-500 mt-0.5">As platform Super Admin, you can provision completely new corporate tenants, manage billing structures, or login as company admins.</p>
              </div>
              <button
                onClick={() => setShowTenantSetup(true)}
                className="bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs px-4 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <i className="bi bi-plus-lg text-xs"></i>
                Spawn Tenant Organization
              </button>
            </div>
          )}

          {/* Quick Subscription Settings Widget for Company Admins inside settings */}
          {selectedUser.activeRole === 'Company Admin' && activeView === 'dashboard' && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">Modular SaaS Subscription Center</span>
                <p className="text-xs text-slate-500 mt-0.5">Configure active business modules, install feature packs, or upgrade licensing tiers.</p>
              </div>
              <button
                onClick={() => setShowLicensingPanel(true)}
                className="bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs px-4 py-2 rounded transition-all cursor-pointer whitespace-nowrap"
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
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleDeclineLeave}
              onPayInvoice={handlePayInvoice}
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
            />
          ) : activeView === 'ai-copilot' || activeView.startsWith('ai-') ? (
            <AIAssistant selectedCompany={selectedCompany} />
          ) : (
            <ModuleViews
              activeView={activeView}
              onNavigateView={setActiveView}
              selectedCompany={selectedCompany}
              selectedUser={selectedUser}
              employees={employees}
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
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <i className="bi bi-cpu text-slate-800 text-xs"></i>
              SaaS Module Licensing & Feature Packs: {selectedCompany.name}
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Business Modules (SaaS Core)</span>
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
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2">{group.title}</span>
                      <div className="space-y-1.5">
                        {group.modules.map(mod => {
                          const isInstalled = selectedCompany.activeModules.includes(mod);
                          return (
                            <label key={mod} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer">
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
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Premium Feature Packs</span>
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
                      <label key={feat.id} className="flex items-center justify-between border border-slate-200 p-2.5 rounded hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
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
                        <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Premium</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-150 mt-5">
              <button
                onClick={() => setShowLicensingPanel(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded cursor-pointer transition-all"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
