import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { Company } from '../../types';

export const PlatformView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  // Employee name resolution from HR data (single source of truth)
  const resolveUserName = (userId: string): string => {
    const emp = getEmployeeByUserId(employees, userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : getUserNameById([], userId);
  };

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planTenantId, setPlanTenantId] = useState('');
  const [planModuleIds, setPlanModuleIds] = useState<string[]>([]);
  const [planBilling, setPlanBilling] = useState<Company['billingPlan']>('Core');

  // Filter tenants for non-Super Admins so they only see their own company
  const viewableTenants = selectedUser.role === 'Super Admin' ? tenants : tenants.filter(t => t.id === selectedCompany.id);

  const openPlanModal = () => {
    setPlanTenantId(tenants[0]?.id ?? '');
    setPlanModuleIds([]);
    setPlanBilling('Core');
    setPlanModalOpen(true);
  };
  const togglePlanModule = (id: string) => {
    setPlanModuleIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };
  const companyModal = useRowModal<typeof platformCompanies[0]>();
  const billingModal = useRowModal<typeof tenants[0] & { monthlyPrice: number }>();
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

  const planMrr: Record<string, number> = { Enterprise: 2400, Premium: 900, Core: 350, Trial: 0 };
  const platformCompanies = viewableTenants.map(t => ({
    id: t.id,
    name: t.name,
    domain: t.domain || '—',
    plan: t.billingPlan,
    status: t.billingStatus,
    users: employees.filter(e => e.companyId === t.id).length,
    modules: t.activeModules?.length || 0,
    mrr: planMrr[t.billingPlan] || 0,
  }));

  return (
    <div>
      <PageHeader title="Platform Management" subtitle="Manage tenant platformCompanies, billing, subscriptions, and platform-wide settings." />

      {platformTab === 'tenants' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Tenants" value={platformCompanies.length} icon="bi bi-buildings" sub="Active platformCompanies on platform" />
            <StatCard label="Monthly Revenue" value={`$${platformCompanies.reduce((sum, c) => sum + (c.plan === 'Enterprise' ? 2400 : c.plan === 'Premium' ? 900 : c.plan === 'Core' ? 350 : 0), 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Platform MRR" accent />
            <StatCard label="Total Users" value={platformCompanies.reduce((sum, c) => sum + c.users, 0)} icon="bi bi-people" sub="All platform users" />
            <StatCard label="Avg Modules" value={(platformCompanies.reduce((sum, c) => sum + c.modules, 0) / platformCompanies.length).toFixed(1)} icon="bi bi-box-seam" sub="Per tenant" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">Tenant Companies</h3>
              <div className="flex items-center gap-2.5">
                <PrimaryBtn icon="bi bi-plus-lg">Add Company</PrimaryBtn>
              </div>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Company' }, { label: 'Domain' }, { label: 'Plan' }, { label: 'Users' }, { label: 'Modules' }, { label: 'MRR' }, { label: 'Status' }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {platformCompanies.filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.domain.toLowerCase().includes(searchTerm.toLowerCase())).map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 table-cell-semibold text-slate-900">{company.name}</td>
                    <td className="px-4 py-3 table-cell text-slate-500">{company.domain}</td>
                    <td className="px-4 py-3"><Badge label={company.plan} variant={company.plan === 'Enterprise' ? 'info' : company.plan === 'Premium' ? 'success' : company.plan === 'Trial' ? 'warning' : 'default'} /></td>
                    <td className="px-4 py-3 table-cell-mono text-slate-700">{company.users}</td>
                    <td className="px-4 py-3 table-cell-mono text-slate-700">{company.modules}</td>
                    <td className="px-4 py-3 table-cell-mono text-slate-700">${company.mrr.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={company.status} variant={company.status === 'Active' ? 'success' : company.status === 'Past Due' ? 'danger' : 'warning'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); companyModal.open(company); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                      >
                        View
                      </button>
                    </td>
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
            <StatCard label="Annual Revenue" value={`$${(platformCompanies.reduce((sum, c) => sum + (c.plan === 'Enterprise' ? 2400 : c.plan === 'Premium' ? 900 : c.plan === 'Core' ? 350 : 0), 0) * 12).toLocaleString()}`} icon="bi bi-graph-up-arrow" sub="Platform ARR" accent />
            <StatCard label="Payment Success" value={invoices.length ? `${Math.round((customerPayments.length / Math.max(1, invoices.length)) * 100)}%` : '--'} icon="bi bi-check-circle" sub="Last 30 days" />
            <StatCard label="Churn Rate" value={platformCompanies.length ? `${Math.round((platformCompanies.filter(c => c.status !== 'Active').length / platformCompanies.length) * 100)}%` : '0%'} icon="bi bi-graph-down" sub="Non-active tenants" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-4">Billing Overview</h3>
            <div className="space-y-4">
              {platformCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="table-cell-semibold text-slate-900">{company.name}</div>
                    <div className="data-value-small text-slate-500">{company.plan} · {company.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className="table-cell-mono fw-bold text-slate-900">${company.mrr.toLocaleString()}/mo</div>
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

        // Compute tenant counts per module from actual company data
        const moduleTenantCount: Record<string, number> = {};
        tenants.forEach(t => {
          (t.activeModules || []).forEach(modId => {
            moduleTenantCount[modId] = (moduleTenantCount[modId] || 0) + 1;
          });
        });
        suites.forEach(s => {
          s.modules.forEach(m => {
            const catMod = MODULE_CATALOG.find(c => c.name === m.name);
            if (catMod) m.tenants = moduleTenantCount[catMod.id] || 0;
          });
        });

        const allModules = suites.flatMap(s => s.modules);
        const totalActiveSubs = allModules.reduce((sum, m) => sum + m.tenants, 0);
        const popularModule = [...allModules].sort((a, b) => b.tenants - a.tenants)[0].name;
        const totalModules = allModules.length;
        const avgRev = platformCompanies.length ? Math.round(platformCompanies.reduce((s, c) => s + (c.plan === 'Enterprise' ? 2400 : c.plan === 'Premium' ? 900 : c.plan === 'Core' ? 350 : 0), 0) / platformCompanies.length) : 0;

        return (
          <div className="space-y-8">
            {/* Suite KPI Bar */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Suite Modules" value={totalModules} icon="bi bi-grid-3x3-gap-fill" sub="Across 4 product suites" />
              <StatCard label="Active Subscriptions" value={totalActiveSubs} icon="bi bi-box-seam" sub="Total active tenant modules" />
              <StatCard label="Avg Revenue/Tenant" value={`$${avgRev.toLocaleString()}/mo`} icon="bi bi-cash-stack" sub="Blended module revenue" accent />
              <StatCard label="Top Module" value={popularModule} icon="bi bi-trophy-fill" sub="Most deployed" />
            </div>

            {/* Plan Builder */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="fs-lg fw-bold text-slate-900 tracking-tight">Configured Plans</h2>
                <p className="fs-sm text-slate-500">Build a plan by selecting modules — the price is the sum of module list prices. Assign it to a tenant.</p>
              </div>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={openPlanModal}>Add Plan</PrimaryBtn>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="section-title text-slate-900">Tenant Plans & Billing</h3>
                </div>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Tenant' }, { label: 'Plan' }, { label: 'Expires' }, { label: 'Modules' }, { label: 'Monthly' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {viewableTenants.filter(t => !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.billingPlan.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
                    const price = planPriceForModules(t.activeModules);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3 fs-xs fw-semibold text-slate-900">{t.name}</td>
                        <td className="px-5 py-3">
                          <Badge
                            label={t.billingPlan}
                            variant={t.billingPlan === 'Enterprise' ? 'info' : t.billingPlan === 'Premium' ? 'success' : t.billingPlan === 'Trial' ? 'warning' : 'default'}
                          />
                        </td>
                        <td className="px-5 py-3 fs-xs text-slate-500 font-sans">{t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt).toLocaleDateString() : 'Never'}</td>
                        <td className="px-5 py-3 fs-xs font-sans tabular-nums text-slate-700">{t.activeModules.length}</td>
                        <td className="px-5 py-3 fs-xs font-sans tabular-nums fw-semibold text-slate-900">${price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); billingModal.open({ ...t, monthlyPrice: planPriceForModules(t.activeModules) }); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                          >
                            <i className="bi bi-eye text-[11px]"></i> View
                          </button>
                        </td>
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white fs-xs fw-semibold border border-white/20">
                    <i className="bi bi-stars"></i> Enterprise Suite
                  </span>
                </div>
                <h2 className="fs-xl fw-bold text-white tracking-tight mb-1">One Platform. Four Suites. Infinite Possibilities.</h2>
                <p className="fs-sm text-slate-400">Mix and match modules across People, Finance, Commerce and Intelligence to build the exact ERP your business needs.</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                  <div className="fs-lg fw-bold text-white tabular-nums">4</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Suites</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                  <div className="fs-lg fw-bold text-white tabular-nums">{totalModules}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Modules</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                  <div className="fs-lg fw-bold text-white tabular-nums">{platformCompanies.length}</div>
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
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] fw-semibold uppercase tracking-widest border border-white/30 mb-2">
                        {suite.suiteTag}
                      </span>
                      <h3 className="fs-lg fw-bold text-white tracking-tight">{suite.suiteName}</h3>
                      <p className="fs-sm text-white/70 mt-1 max-w-xl">{suite.suiteDesc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="fs-2xl fw-bold text-white tabular-nums">{suite.modules.length}</div>
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
                          <div className={`h-10 w-10 rounded-xl ${suite.iconBg} text-white flex items-center justify-center fs-base flex-shrink-0`}>
                            <i className={mod.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="fw-semibold text-slate-900 fs-sm leading-tight">{mod.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] fw-bold uppercase tracking-wide border ${suite.badgeCls}`}>
                                {mod.tag}
                              </span>
                              <span className="text-[10px] text-slate-400 tabular-nums">{mod.tenants} tenants</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="fs-sm fw-bold text-slate-900 tabular-nums">{mod.price}</div>
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
                                <i className={`bi bi-check-lg mt-0.5 flex-shrink-0 fs-xs fw-bold`}
                                  style={{ color: suite.iconBg.replace('bg-', '').includes('violet') ? '#7c3aed' : suite.iconBg.includes('emerald') ? '#059669' : suite.iconBg.includes('amber') ? '#d97706' : '#2563eb' }}>
                                </i>
                                <span className="fs-xs text-slate-600 leading-snug">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4">
                          {mod.deps && (
                            <div className="flex items-center gap-1.5 mt-2 p-2 bg-slate-100 rounded-lg">
                              <i className="bi bi-link-45deg text-slate-400 fs-xs"></i>
                              <span className="text-[10px] text-slate-500">{mod.deps}</span>
                            </div>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex-1 mr-3">
                              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.round((mod.tenants / platformCompanies.length) * 100)}%`,
                                    background: suite.iconBg.includes('violet') ? '#7c3aed' : suite.iconBg.includes('emerald') ? '#059669' : suite.iconBg.includes('amber') ? '#d97706' : '#2563eb'
                                  }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-[10px] fw-bold text-slate-500 tabular-nums">{Math.round((mod.tenants / platformCompanies.length) * 100)}% deployed</span>
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
                <div className="fs-xs fw-semibold text-slate-700 mb-0.5">Flexible Modular Pricing</div>
                <p className="fs-xs text-slate-500">Each suite module is independently licensable. Tenants can subscribe to individual modules or bundle full suites for a discounted rate. All modules share a unified data layer — no double entry, no silos.</p>
              </div>
            </div>

            {planModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <i className="bi bi-box-seam text-slate-800 fs-xs"></i> Add Subscription Plan
                    </h2>
                    <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
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
                            <div className="section-title text-slate-400 mb-1">{suite}</div>
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
                                    <span className="fs-xs fw-medium">{m.name}</span>
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
                      <div className="fs-xl fw-bold text-slate-900 font-sans tabular-nums">${planTotal.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
            <StatCard label="Active Tenants" value={platformCompanies.filter(c => c.status === 'Active').length} icon="bi bi-activity" sub={`of ${platformCompanies.length} total`} />
            <StatCard label="Audit Events" value={auditLogs.length.toLocaleString()} icon="bi bi-cpu" sub="Total recorded" />
            <StatCard label="Storage Used" value={`${(platformCompanies.length * 0.5).toFixed(1)} GB`} icon="bi bi-hdd" sub="Platform total" />
            <StatCard label="Active Modules" value={platformCompanies.reduce((s, c) => s + c.modules, 0)} icon="bi bi-speedometer" sub="Across all tenants" />
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
            <StatCard label="Platform Users" value={employees.filter(u => u.status === 'Active').length} icon="bi bi-people" sub="Active employees" />
            <StatCard label="Total Tenant Users" value={employees.length} icon="bi bi-users" sub="All tenant users" />
            <StatCard label="Active Sessions" value={employees.filter(u => u.status === 'Active').length} icon="bi bi-activity" sub="Currently active" />
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
        {companyModal.selected && (
          <RowModal row={companyModal.selected}
            icon="bi bi-buildings" accentColor="#0f172a"
            fields={[
              { label: 'Company', key: 'name', icon: 'bi bi-building' },
              { label: 'Domain', key: 'domain', mono: true, icon: 'bi bi-globe', section: 'Details' },
              { label: 'Plan', key: 'plan', icon: 'bi bi-star', section: 'Details' },
              { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
              { label: 'Users', key: 'users', icon: 'bi bi-people', section: 'Usage' },
              { label: 'Modules', key: 'modules', icon: 'bi bi-grid-1x2', section: 'Usage' },
              { label: 'MRR', key: 'mrr', format: (v: number) => `$${v.toLocaleString()}`, icon: 'bi bi-cash', section: 'Usage' },
            ]}
            title={r => r.name} subtitle={r => r.domain}
            onClose={companyModal.close}
            actions={(row) => selectedUser.role === 'Super Admin' && props.onUpdateTenantContract ? (
              <div className="flex gap-2 w-full mt-2">
                <SecBtn icon="bi bi-x-circle" onClick={() => {
                  if (confirm(`Are you sure you want to end the contract for ${row.name}?`)) {
                    props.onUpdateTenantContract!(row.id, { billingStatus: 'Inactive' });
                    companyModal.close();
                  }
                }}>End Contract</SecBtn>
                <PrimaryBtn icon="bi bi-arrow-repeat" onClick={() => {
                  const newExpiry = new Date();
                  newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                  props.onUpdateTenantContract!(row.id, { 
                    billingStatus: 'Active', 
                    subscriptionExpiresAt: newExpiry.toISOString().split('T')[0] 
                  });
                  companyModal.close();
                }}>Renew Contract</PrimaryBtn>
              </div>
            ) : undefined}
          />
        )}
      {billingModal.selected && (
        <RowModal row={billingModal.selected}
          icon="bi bi-credit-card" accentColor="#059669"
          fields={[
            { label: 'Tenant', key: 'name', icon: 'bi bi-building' },
            { label: 'Billing Plan', key: 'billingPlan', icon: 'bi bi-star', section: 'Plan' },
            { label: 'Modules', key: 'activeModules', format: (v: any[]) => v.length, icon: 'bi bi-grid-1x2', section: 'Plan' },
            { label: 'Monthly', key: 'monthlyPrice', format: (v: number) => `$${v.toLocaleString()}`, icon: 'bi bi-cash', section: 'Plan' },
          ]}
          title={r => r.name} subtitle={r => r.billingPlan}
          onClose={billingModal.close} />
      )}
    </div>
  );
};
