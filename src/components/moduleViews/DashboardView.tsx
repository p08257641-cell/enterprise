import { formatCurrency } from '../../utils/currency';
import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { OrgChart } from '../OrgChart';

export const DashboardView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments: companyDepartments, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onNavigateView } = props;

  const localEmployees = (employees || []).filter(e => e.companyId === selectedCompany.id);
  const localInvoices = (invoices || []).filter(i => i.companyId === selectedCompany.id);
  const localTickets = (tickets || []).filter(t => t.companyId === selectedCompany.id);
  const localExpenses = (expenses || []).filter(e => e.companyId === selectedCompany.id);

  const activeEmployees = localEmployees.filter(e => e.status === 'Active');
  const onLeave = localEmployees.filter(e => e.status === 'On Leave');
  const openInvoices = localInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
  const openTickets = localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');

  const departments = [...new Set(localEmployees.map(e => e.department))];
  const localDepartments = companyDepartments.filter(d => d.companyId === selectedCompany.id);
  const branches = [...new Set(localEmployees.map(e => e.branch))];

  // Financial Stats
  const totalRevenue = localInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalExpenses = localExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly Revenue & Expense Data Aggregation
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const rev = localInvoices
      .filter(inv => {
        if (!inv.issueDate) return false;
        const parts = inv.issueDate.split('-');
        return Number(parts[1]) === monthNum;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const exp = localExpenses
      .filter(e => {
        if (!e.date) return false;
        const parts = e.date.split('-');
        return Number(parts[1]) === monthNum;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return { name, revenue: rev, expense: exp };
  });

  const hasRealFinancials = totalRevenue > 0 || totalExpenses > 0;
  const mockMonthlyData = [
    { name: "Jan", revenue: 45000, expense: 32000 },
    { name: "Feb", revenue: 52000, expense: 34000 },
    { name: "Mar", revenue: 49000, expense: 36000 },
    { name: "Apr", revenue: 63000, expense: 41000 },
    { name: "May", revenue: 58000, expense: 39000 },
    { name: "Jun", revenue: 71000, expense: 45000 },
    { name: "Jul", revenue: 75000, expense: 48000 },
    { name: "Aug", revenue: 82000, expense: 51000 },
    { name: "Sep", revenue: 78000, expense: 49000 },
    { name: "Oct", revenue: 85000, expense: 53000 },
    { name: "Nov", revenue: 92000, expense: 57000 },
    { name: "Dec", revenue: 105000, expense: 62000 }
  ];

  const chartData = hasRealFinancials ? monthlyData : mockMonthlyData;

  // Departmental Expense comparison logic
  const deptExpenseMap: Record<string, number> = {};
  localExpenses.forEach(exp => {
    const dept = exp.department || "Other";
    deptExpenseMap[dept] = (deptExpenseMap[dept] || 0) + (exp.amount || 0);
  });

  const hasRealExpenses = Object.keys(deptExpenseMap).length > 0;
  const mockDeptExpenses = [
    { name: "Engineering", amount: 28500 },
    { name: "Sales & Marketing", amount: 19400 },
    { name: "Administration", amount: 12000 },
    { name: "Finance", amount: 8500 },
    { name: "Support", amount: 5000 }
  ];

  const deptExpenseData = hasRealExpenses
    ? Object.keys(deptExpenseMap).map(name => ({ name, amount: deptExpenseMap[name] })).sort((a, b) => b.amount - a.amount)
    : mockDeptExpenses;

  // Interactive Chart States
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG Area Chart Helper calculations
  const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.expense))) || 1000;
  const svgW = 600;
  const svgH = 200;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const getX = (index: number) => padL + (index / (chartData.length - 1)) * chartW;
  const getY = (val: number) => padT + chartH - (val / maxVal) * chartH;

  const revenuePoints = chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`);
  const revenueAreaPath = `M ${getX(0)},${padT + chartH} L ${revenuePoints.join(' L ')} L ${getX(chartData.length - 1)},${padT + chartH} Z`;
  const revenueLinePath = `M ${revenuePoints.join(' L ')}`;

  const expensePoints = chartData.map((d, i) => `${getX(i)},${getY(d.expense)}`);
  const expenseAreaPath = `M ${getX(0)},${padT + chartH} L ${expensePoints.join(' L ')} L ${getX(chartData.length - 1)},${padT + chartH} Z`;
  const expenseLinePath = `M ${expensePoints.join(' L ')}`;

  const maxDeptAmount = Math.max(...deptExpenseData.map(d => d.amount)) || 1;

  // Gemini AI advisor state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Initial dashboard AI recommendation audit report on mount
  useEffect(() => {
    let active = true;
    const fetchDashboardAudit = async () => {
      setAiLoading(true);
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "Scan our company active parameters and write a 3-sentence operational health summary. Mention total revenue, expenses, employee count and give 1 key growth advise.",
            context: 'chat',
            selectedCompanyId: selectedCompany.id
          })
        });
        const data = await response.json();
        if (active) {
          setAiReply(data.reply || "No audit notes compiled.");
        }
      } catch (err) {
        if (active) {
          setAiReply("⚠️ **Gemini API is not fully configured on your host server yet.** Connect your GEMINI_API_KEY to retrieve live AI ledger audits.\n\n*General Advisor Tip: Keep your operating margins healthy by monitoring invoice collection periods and minimizing general support overhead.*");
        }
      } finally {
        if (active) setAiLoading(false);
      }
    };
    fetchDashboardAudit();
    return () => { active = false; };
  }, [selectedCompany.id]);

  const handleAskGemini = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const queryText = aiPrompt;
    setAiPrompt('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          context: 'chat',
          selectedCompanyId: selectedCompany.id
        })
      });
      const data = await response.json();
      setAiReply(data.reply || "No response received.");
    } catch (err: any) {
      setAiReply(`⚠️ Error connecting to Gemini API: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Company overview, live analytics, and AI recommendations." />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Employees" value={localEmployees.length} sub={`${activeEmployees.length} active · ${onLeave.length} on leave`} icon="bi bi-people" />
        <StatCard label="Departments" value={departments.length} sub={`${branches.length} branch locations`} icon="bi bi-diagram-3" />
        <StatCard label="Open Invoices" value={openInvoices.length} sub={`$${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-file-earmark-text" accent />
        <StatCard label="Support Tickets" value={openTickets.length} sub={`${localTickets.filter(t => t.priority === 'Critical').length} critical priority`} icon="bi bi-ticket" />
      </div>

      {/* Visual Analytics & AI Copilot Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Area Chart (Col span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900">Financial Performance Trend</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  {hasRealFinancials ? "Live general ledger tracking" : "Simulated trend baseline · Create invoices/expenses to update"}
                </p>
              </div>
              <div className="flex items-center gap-3 fs-xs fw-semibold">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10b981]"></span>Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]"></span>Expenses</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative mt-4">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-Axis lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const yVal = padT + ratio * chartH;
                  const textVal = Math.round(maxVal - ratio * maxVal);
                  return (
                    <g key={i} className="opacity-40">
                      <line x1={padL} y1={yVal} x2={svgW - padR} y2={yVal} stroke="#e2e8f0" strokeDasharray="3,3" />
                      <text x={padL - 8} y={yVal + 3} textAnchor="end" className="fill-slate-400 font-mono text-[9px]">{formatCurrency(textVal, selectedCompany?.currency)}</text>
                    </g>
                  );
                })}

                {/* Area Charts */}
                <path d={revenueAreaPath} fill="url(#revenueGrad)" />
                <path d={expenseAreaPath} fill="url(#expenseGrad)" />

                {/* Line Charts */}
                <path d={revenueLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={expenseLinePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* X-Axis labels */}
                {chartData.map((d, i) => (
                  <text key={i} x={getX(i)} y={padT + chartH + 16} textAnchor="middle" className="fill-slate-400 font-medium text-[10px]">
                    {d.name}
                  </text>
                ))}

                {/* Interactive hover elements */}
                {hoverIndex !== null && (
                  <g>
                    <line x1={getX(hoverIndex)} y1={padT} x2={getX(hoverIndex)} y2={padT + chartH} stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1.5" />
                    <circle cx={getX(hoverIndex)} cy={getY(chartData[hoverIndex].revenue)} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={getX(hoverIndex)} cy={getY(chartData[hoverIndex].expense)} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}

                {/* Interactive hover capture boxes */}
                {chartData.map((d, i) => (
                  <rect
                    key={i}
                    x={getX(i) - (chartW / (chartData.length - 1)) / 2}
                    y={padT}
                    width={chartW / (chartData.length - 1)}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Interactive Info Display */}
          <div className="h-10 mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            {hoverIndex !== null ? (
              <>
                <span className="fs-xs fw-bold text-slate-800 uppercase tracking-wider">{chartData[hoverIndex].name} Metrics</span>
                <div className="flex gap-4">
                  <span className="fs-xs text-emerald-600 fw-bold">Rev: ${chartData[hoverIndex].revenue.toLocaleString()}</span>
                  <span className="fs-xs text-rose-600 fw-bold">Exp: ${chartData[hoverIndex].expense.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <span className="fs-2xs text-slate-400 italic">Hover over the trend chart to view monthly details</span>
            )}
          </div>
        </div>

        {/* Gemini AI Advisor card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <i className="bi bi-stars text-slate-900 fs-sm animate-pulse"></i>
                <h3 className="fs-sm fw-bold text-slate-950">Gemini AI Advisor</h3>
              </div>
              <button onClick={() => onNavigateView('ai-copilot')} className="text-[10px] fw-bold text-slate-500 hover:text-slate-900 cursor-pointer">
                Open Co-Pilot <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            {/* Live Insights */}
            <div className="mt-4 space-y-3">
              {aiLoading ? (
                <div className="space-y-2 py-4">
                  <div className="flex items-center gap-2 text-slate-500 fs-2xs font-semibold animate-pulse">
                    <i className="bi bi-arrow-repeat animate-spin text-slate-900"></i>
                    Analyzing corporate database...
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse"></div>
                  <div className="h-3.5 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 border border-slate-100/60 p-3 text-[11px] text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {aiReply || "Advisor idle. Ask anything or view insights."}
                </div>
              )}
            </div>
          </div>

          {/* Mini Chat Input */}
          <div className="border-t border-slate-100 pt-3 mt-4 flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskGemini()}
              placeholder="Ask anything about the company data..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-300 font-sans"
            />
            <button
              onClick={handleAskGemini}
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg px-3 py-1.5 text-[11px] fw-bold cursor-pointer"
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* Company Overview & Workforce distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="section-title text-slate-900 mb-4">Company Overview</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center fs-4xl">{selectedCompany.logo}</div>
              <div>
                <div className="fs-xl fw-bold text-slate-900">{selectedCompany.name}</div>
                <div className="fs-sm text-slate-500 font-sans tabular-nums">{selectedCompany.domain}</div>
                <div className="fs-sm text-slate-400 mt-0.5">{selectedCompany.industry}</div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="fs-xs text-slate-400">Billing Plan</div>
              <div className="fs-sm text-slate-800 mt-1 fw-semibold">{selectedCompany.billingPlan}</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="fs-xs text-slate-400">Active Modules</div>
              <div className="fs-sm text-slate-800 mt-1 fw-semibold">{selectedCompany.activeModules.length} / 21</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="fs-xs text-slate-400">Status</div>
              <div className="fs-sm text-slate-800 mt-1 fw-semibold">{selectedCompany.billingStatus}</div>
            </div>
          </div>
        </div>

        {/* Expenses by Department Horizontal Bar Comparison */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="section-title text-slate-900 mb-4">Workforce Expenses by Dept</h3>
          <div className="space-y-4">
            {deptExpenseData.slice(0, 5).map((item, index) => {
              const pct = (item.amount / maxDeptAmount) * 100;
              const barColors = [
                'from-emerald-600 to-emerald-500',
                'from-teal-600 to-teal-500',
                'from-slate-800 to-slate-700',
                'from-sky-700 to-sky-600',
                'from-slate-500 to-slate-400'
              ];
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.name}</span>
                    <span className="font-mono">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${barColors[index % barColors.length]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Org Chart */}
      <OrgChart employees={employees} departments={companyDepartments} companyId={selectedCompany.id} />
    </div>
  );
};
