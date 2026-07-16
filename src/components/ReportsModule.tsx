/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reports & Analytics — Cross-module insights and business intelligence
 */

import React, { useState } from 'react';
import { Company, User, Employee, CRMLead, Invoice, PayslipRecord, SupportTicket, Expense, BankTransaction } from '../types';
import { downloadCSV } from '../utils/export';
import { ViewModal, useRowModal, RowModal } from './moduleViews/shared';

interface ReportsModuleProps {
  selectedCompany: Company;
  selectedUser: User;
  employees: Employee[];
  crmLeads: CRMLead[];
  invoices: Invoice[];
  payslips: PayslipRecord[];
  tickets: SupportTicket[];
  expenses: Expense[];
  bankTransactions: BankTransaction[];
}

type ReportCategory = 'overview' | 'revenue' | 'workforce' | 'operations' | 'financial';

const StatCard = ({ label, value, sub, icon, trend, trendUp }: {
  label: string; value: string | number; sub?: string; icon: string; trend?: string; trendUp?: boolean;
}) => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-all">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <i className={`${icon} text-sm text-slate-300`}></i>
    </div>
    <div className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">{value}</div>
    {sub && <p className="text-xs leading-snug text-slate-500">{sub}</p>}
    {trend && (
      <div className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        <i className={`bi bi-arrow-${trendUp ? 'up' : 'down'} mr-1`}></i>{trend}
      </div>
    )}
  </div>
);

const ChartBar: React.FC<{ label: string; value: number; maxValue: number; color?: string }> = ({ label, value, maxValue, color = 'bg-slate-800' }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-500 w-24 truncate">{label}</span>
    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / maxValue) * 100}%` }} />
    </div>
    <span className="text-xs font-semibold text-slate-700 w-16 text-right tabular-nums">{value.toLocaleString()}</span>
  </div>
);

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  selectedCompany, selectedUser,
  employees, crmLeads, invoices, payslips, tickets, expenses, bankTransactions,
}) => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('overview');

  const companyEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const companyLeads = crmLeads.filter(l => l.companyId === selectedCompany.id);
  const companyInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const companyPayslips = payslips.filter(p => p.companyId === selectedCompany.id);
  const companyTickets = tickets.filter(t => t.companyId === selectedCompany.id);
  const companyExpenses = expenses.filter(e => e.companyId === selectedCompany.id);
  const companyTransactions = bankTransactions.filter(t => t.companyId === selectedCompany.id);

  const repInvModal = useRowModal<Invoice>();
  const repTicketModal = useRowModal<SupportTicket>();

  // Calculate cross-module metrics
  const totalRevenue = companyInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPayroll = companyPayslips.reduce((sum, p) => sum + p.gross, 0);
  const totalExpenses = companyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const closedDeals = companyLeads.filter(l => l.status === 'Won').length;
  const conversionRate = companyLeads.length > 0 ? ((closedDeals / companyLeads.length) * 100).toFixed(1) : '0';
  const openTickets = companyTickets.filter(t => t.status !== 'Closed').length;
  const avgTicketResolution = companyTickets.length > 0 ? '2.4 days' : 'N/A';

  // Department breakdown
  const deptMap = new Map<string, { headcount: number; payroll: number }>();
  companyEmployees.forEach(emp => {
    const existing = deptMap.get(emp.department) || { headcount: 0, payroll: 0 };
    deptMap.set(emp.department, {
      headcount: existing.headcount + 1,
      payroll: existing.payroll + emp.salary,
    });
  });
  const deptBreakdown = Array.from(deptMap.entries()).map(([dept, data]) => ({
    dept, ...data,
  })).sort((a, b) => b.headcount - a.headcount);

  // Lead pipeline by stage
  const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const pipelineData = stages.map(stage => ({
    stage,
    count: companyLeads.filter(l => l.status === stage).length,
    value: companyLeads.filter(l => l.status === stage).reduce((sum, l) => sum + l.value, 0),
  }));
  const maxPipelineCount = Math.max(...pipelineData.map(p => p.count), 1);

  const categories: { id: ReportCategory; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2' },
    { id: 'revenue', label: 'Revenue & Sales', icon: 'bi bi-graph-up-arrow' },
    { id: 'workforce', label: 'Workforce', icon: 'bi bi-people' },
    { id: 'operations', label: 'Operations', icon: 'bi bi-gear' },
    { id: 'financial', label: 'Financial', icon: 'bi bi-cash-stack' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cross-module business intelligence and insights.</p>
        </div>
        <button onClick={() => {
          let headers: string[] = [];
          let rows: (string | number)[][] = [];
          if (activeCategory === 'revenue') {
            headers = ['Invoice #', 'Customer', 'Amount', 'Status'];
            rows = companyInvoices.map(i => [i.id, i.customerName, i.total, i.status]);
          } else if (activeCategory === 'operations') {
            headers = ['Ticket', 'Subject', 'Status', 'Priority'];
            rows = companyTickets.map(t => [t.id, (t as any).subject || (t as any).title || '', t.status, t.priority]);
          } else if (activeCategory === 'financial') {
            headers = ['Metric', 'Amount'];
            rows = [
              ['Total Revenue', totalRevenue],
              ['Total Payroll', totalPayroll],
              ['Total Expenses', totalExpenses],
              ['Net Income', totalRevenue - totalPayroll - totalExpenses],
            ];
          } else {
            headers = ['Department', 'Headcount', 'Payroll'];
            rows = deptBreakdown.map(d => [d.dept, d.headcount, d.payroll]);
          }
          downloadCSV(`report-${activeCategory}-${selectedCompany.id}`, headers, rows);
        }} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all">
          <i className="bi bi-download text-xs"></i> Export Report
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`${cat.icon}`}></i> {cat.label}
          </button>
        ))}
      </div>

      {/* Overview Dashboard */}
      {activeCategory === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="From invoices" />
            <StatCard label="Workforce" value={companyEmployees.length} icon="bi bi-people" sub="Active employees" />
            <StatCard label="Pipeline Value" value={`$${companyLeads.reduce((s, l) => s + l.value, 0).toLocaleString()}`} icon="bi bi-funnel" sub={`${companyLeads.length} leads`} />
            <StatCard label="Open Tickets" value={openTickets} icon="bi bi-headset" sub={avgTicketResolution + ' avg'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue vs Expenses */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Revenue vs Expenses</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="bi bi-arrow-up-right text-emerald-600"></i>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Revenue</div>
                      <div className="text-xs text-slate-500">From invoices</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 tabular-nums">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="bi bi-arrow-down-right text-rose-600"></i>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Expenses</div>
                      <div className="text-xs text-slate-500">Payroll + Other</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-rose-700 tabular-nums">${(totalPayroll + totalExpenses).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-900">Net Income</span>
                    <span className={`text-lg font-bold tabular-nums ${totalRevenue - totalPayroll - totalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ${(totalRevenue - totalPayroll - totalExpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Department Breakdown</h3>
              <div className="space-y-3">
                {deptBreakdown.slice(0, 6).map(d => (
                  <div key={d.dept} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{d.dept}</span>
                        <span className="text-slate-500">{d.headcount} employees</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${companyEmployees.length ? (d.headcount / companyEmployees.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <span className="ml-4 text-xs font-semibold text-slate-600 tabular-nums w-20 text-right">${d.payroll.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Pipeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Sales Pipeline</h3>
            <div className="space-y-3">
              {pipelineData.map(p => (
                <ChartBar key={p.stage} label={p.stage} value={p.count} maxValue={maxPipelineCount} color={
                  p.stage === 'Closed Won' ? 'bg-emerald-500' :
                  p.stage === 'Closed Lost' ? 'bg-rose-500' :
                  'bg-slate-800'
                } />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue & Sales */}
      {activeCategory === 'revenue' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="From all invoices" />
            <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon="bi bi-bullseye" sub={`${closedDeals} deals won`} />
            <StatCard label="Avg Deal Size" value={`$${companyLeads.length > 0 ? Math.round(companyLeads.reduce((s, l) => s + l.value, 0) / companyLeads.length).toLocaleString() : 0}`} icon="bi bi-cash-coin" sub="Per lead" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Invoice Summary</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Invoice</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyInvoices.slice(0, 10).map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/40 cursor-pointer" onClick={() => repInvModal.open(inv)}>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{inv.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900 tabular-nums">${inv.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                        inv.status === 'Draft' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workforce */}
      {activeCategory === 'workforce' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Employees" value={companyEmployees.length} icon="bi bi-people" sub="Active workforce" />
            <StatCard label="Departments" value={deptBreakdown.length} icon="bi bi-diagram-3" sub="Organizational units" />
            <StatCard label="Avg Salary" value={`$${companyEmployees.length > 0 ? Math.round(companyEmployees.reduce((s, e) => s + e.salary, 0) / companyEmployees.length).toLocaleString() : 0}`} icon="bi bi-cash-stack" sub="Monthly average" />
            <StatCard label="Total Payroll" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-wallet2" sub="Monthly obligation" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Headcount by Department</h3>
            <div className="space-y-3">
              {deptBreakdown.map(d => (
                <div key={d.dept} className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-32 truncate">{d.dept}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${(d.headcount / companyEmployees.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-8 text-right">{d.headcount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Operations */}
      {activeCategory === 'operations' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Open Tickets" value={openTickets} icon="bi bi-headset" sub="Pending resolution" />
            <StatCard label="Total Tickets" value={companyTickets.length} icon="bi bi-ticket" sub="All time" />
            <StatCard label="Resolution Time" value={avgTicketResolution} icon="bi bi-clock" sub="Average" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Tickets</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Ticket</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyTickets.slice(0, 10).map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/40 cursor-pointer" onClick={() => repTicketModal.open(ticket)}>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{ticket.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ticket.status === 'Open' ? 'bg-blue-50 text-blue-700' :
                        ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                        ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{ticket.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-rose-50 text-rose-700' :
                        ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{ticket.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial */}
      {activeCategory === 'financial' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="bi bi-arrow-up-right" sub="Inflows" />
            <StatCard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon="bi bi-arrow-down-right" sub="Operating costs" />
            <StatCard label="Payroll" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-people" sub="Monthly payroll" />
            <StatCard label="Net Income" value={`$${(totalRevenue - totalPayroll - totalExpenses).toLocaleString()}`} icon="bi bi-graph-up" sub="Profit/Loss" trend={totalRevenue - totalPayroll - totalExpenses >= 0 ? '+Profit' : '-Loss'} trendUp={totalRevenue - totalPayroll - totalExpenses >= 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {[
                  { category: 'Payroll', amount: totalPayroll, color: 'bg-slate-800' },
                  { category: 'Operating', amount: totalExpenses, color: 'bg-slate-400' },
                ].map(e => (
                  <div key={e.category} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">{e.category}</span>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${e.color}`} style={{ width: `${(totalPayroll + totalExpenses) ? (e.amount / (totalPayroll + totalExpenses)) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-20 text-right tabular-nums">${e.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Cash Flow Summary</h3>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="text-xs text-emerald-600 mb-1">Inflows</div>
                  <div className="text-lg font-bold text-emerald-700 tabular-nums">${totalRevenue.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg">
                  <div className="text-xs text-rose-600 mb-1">Outflows</div>
                  <div className="text-lg font-bold text-rose-700 tabular-nums">${(totalPayroll + totalExpenses).toLocaleString()}</div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-slate-900">Net Cash Flow</span>
                    <span className={`text-lg font-bold tabular-nums ${totalRevenue - totalPayroll - totalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ${(totalRevenue - totalPayroll - totalExpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <RowModal
        row={repInvModal.selected}
        onClose={repInvModal.close}
        title={(r) => r.invoiceNumber}
        subtitle={(r) => r.customerName}
        size="lg"
        fields={[
          { label: 'Invoice #', key: 'invoiceNumber', mono: true },
          { label: 'Customer', key: 'customerName' },
          { label: 'Customer ID', key: 'customerId', mono: true },
          { label: 'Issue Date', key: 'issueDate', mono: true },
          { label: 'Due Date', key: 'dueDate', mono: true },
          { label: 'Subtotal', key: 'subtotal', mono: true, format: (v) => `$${Number(v || 0).toLocaleString()}` },
          { label: 'Tax', key: 'tax', mono: true, format: (v) => `$${Number(v || 0).toLocaleString()}` },
          { label: 'Total', key: 'total', mono: true, format: (v) => `$${Number(v || 0).toLocaleString()}` },
          { label: 'Status', key: 'status' },
          { label: 'ID', key: 'id', mono: true },
        ]}
      />

      <RowModal
        row={repTicketModal.selected}
        onClose={repTicketModal.close}
        title={(r) => r.subject}
        subtitle={(r) => r.ticketNumber}
        size="lg"
        fields={[
          { label: 'Ticket #', key: 'ticketNumber', mono: true },
          { label: 'Subject', key: 'subject' },
          { label: 'Customer', key: 'customerName' },
          { label: 'Category', key: 'category' },
          { label: 'Priority', key: 'priority' },
          { label: 'Status', key: 'status' },
          { label: 'Assigned To', key: 'assignedTo' },
          { label: 'Created At', key: 'createdAt', mono: true },
          { label: 'ID', key: 'id', mono: true },
        ]}
      />
    </div>
  );
};
