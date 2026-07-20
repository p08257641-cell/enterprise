/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Company, User, Employee, CRMLead, GLAccount, Invoice, InventoryItem, SupportTicket, AuditLog, Department, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, Expense, JournalEntry, Bill } from '../types';

// Role → quick-access module shortcuts for the generic Business Overview dashboard
const BUSINESS_SHORTCUTS: Record<string, { label: string; view: string; icon: string }[]> = {
  'Accountant': [
    { label: 'General Ledger', view: 'accounting', icon: 'bi bi-journal-text' },
    { label: 'Invoices', view: 'acc-invoices', icon: 'bi bi-receipt' },
    { label: 'Expenses', view: 'acc-expenses', icon: 'bi bi-credit-card' },
    { label: 'Financial Reports', view: 'acc-reports', icon: 'bi bi-graph-up' },
  ],
  'Finance Manager': [
    { label: 'General Ledger', view: 'accounting', icon: 'bi bi-journal-text' },
    { label: 'Invoices', view: 'acc-invoices', icon: 'bi bi-receipt' },
    { label: 'User Management', view: 'admin-users', icon: 'bi bi-people' },
    { label: 'Financial Reports', view: 'acc-reports', icon: 'bi bi-graph-up' },
  ],
  'Sales Manager': [
    { label: 'CRM Pipeline', view: 'crm-pipeline', icon: 'bi bi-funnel' },
    { label: 'Sales Orders', view: 'sales-orders', icon: 'bi bi-cart' },
    { label: 'Sales Targets', view: 'sales-targets', icon: 'bi bi-bullseye' },
    { label: 'POS Register', view: 'pos-register', icon: 'bi bi-cash-register' },
  ],
  'Sales Executive': [
    { label: 'CRM Pipeline', view: 'crm-pipeline', icon: 'bi bi-funnel' },
    { label: 'Sales Orders', view: 'sales-orders', icon: 'bi bi-cart' },
    { label: 'Sales Targets', view: 'sales-targets', icon: 'bi bi-bullseye' },
  ],
  'Inventory Manager': [
    { label: 'Stock Control', view: 'inv-stock', icon: 'bi bi-box-seam' },
    { label: 'Warehouses', view: 'inv-warehouses', icon: 'bi bi-building' },
    { label: 'Procurement', view: 'proc-pos', icon: 'bi bi-truck' },
    { label: 'POS Register', view: 'pos-register', icon: 'bi bi-cash-register' },
  ],
  'Store Keeper': [
    { label: 'Stock Control', view: 'inv-stock', icon: 'bi bi-box-seam' },
    { label: 'Warehouses', view: 'inv-warehouses', icon: 'bi bi-building' },
    { label: 'Stock Transfers', view: 'inv-transfers', icon: 'bi bi-arrow-left-right' },
  ],
  'HR Department Head': [
    { label: 'My Team', view: 'hr-employees', icon: 'bi bi-people' },
    { label: 'Attendance', view: 'hr-attendance', icon: 'bi bi-calendar-check' },
    { label: 'Leave Requests', view: 'hr-leave', icon: 'bi bi-calendar-x' },
    { label: 'Compliance', view: 'comp-checklists', icon: 'bi bi-shield-check' },
  ],
  'Sales Department Head': [
    { label: 'CRM Pipeline', view: 'crm-pipeline', icon: 'bi bi-funnel' },
    { label: 'Sales Orders', view: 'sales-orders', icon: 'bi bi-cart' },
    { label: 'Customers', view: 'crm-contacts', icon: 'bi bi-person-lines-fill' },
    { label: 'POS Terminal', view: 'pos-terminal', icon: 'bi bi-cash-stack' },
  ],
  'Finance Department Head': [
    { label: 'General Ledger', view: 'accounting', icon: 'bi bi-journal-bookmark' },
    { label: 'Invoices', view: 'acc-invoices', icon: 'bi bi-file-earmark-text' },
    { label: 'Payroll Run', view: 'payroll-run', icon: 'bi bi-play-circle' },
    { label: 'Bank Reconciliation', view: 'acc-bank', icon: 'bi bi-bank' },
  ],
  'Operations Department Head': [
    { label: 'Kanban Board', view: 'project', icon: 'bi bi-columns-gap' },
    { label: 'Stock Levels', view: 'inv-stock', icon: 'bi bi-boxes' },
    { label: 'Work Orders', view: 'mfg-orders', icon: 'bi bi-clipboard2-data' },
    { label: 'Fixed Assets', view: 'asset-register', icon: 'bi bi-collection' },
  ],
  'IT Department Head': [
    { label: 'Users', view: 'admin-users', icon: 'bi bi-people-gear' },
    { label: 'Roles', view: 'admin-roles', icon: 'bi bi-shield-lock' },
    { label: 'Help Desk', view: 'hd-tickets', icon: 'bi bi-headset' },
    { label: 'Settings', view: 'admin-settings', icon: 'bi bi-toggles' },
  ],
  'CEO': [
    { label: 'Financial Reports', view: 'acc-reports', icon: 'bi bi-graph-up' },
    { label: 'CRM Pipeline', view: 'crm-pipeline', icon: 'bi bi-funnel' },
    { label: 'Sales Targets', view: 'sales-targets', icon: 'bi bi-bullseye' },
    { label: 'Operations', view: 'inv-stock', icon: 'bi bi-box-seam' },
  ],
};

// ── SVG Pie Chart Component ────────────────────────────────────────────────
const PieChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let cumulativeAngle = -90;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...d, path, percentage: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex flex-1 items-center gap-6">
        <svg viewBox="0 0 100 100" className="h-44 w-44 shrink-0">
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="0.8" className="transition-opacity hover:opacity-80 cursor-default" />
          ))}
        </svg>
        <div className="space-y-2.5 min-w-0">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-slate-700 font-medium truncate">{s.label}</span>
              <span className="text-sm text-slate-500 font-sans tabular-nums ml-auto shrink-0 font-semibold">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SVG Bar Graph Component ────────────────────────────────────────────────
const BarGraph = ({ data, title, valuePrefix = '' }: { data: { label: string; value: number; color?: string }[]; title: string; valuePrefix?: string }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barHeight = 24;
  const gap = 8;
  const labelWidth = 90;
  const chartWidth = 260;
  const totalHeight = data.length * (barHeight + gap) - gap + 20;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <svg viewBox={`0 0 ${labelWidth + chartWidth + 50} ${totalHeight}`} className="w-full" preserveAspectRatio="xMinYMin meet">
        {data.map((d, i) => {
          const y = i * (barHeight + gap);
          const barW = (d.value / maxVal) * chartWidth;
          const fill = d.color || '#0f172a';
          return (
            <g key={i}>
              <text x={labelWidth - 6} y={y + barHeight / 2 + 4} textAnchor="end" className="fill-slate-600" fontSize="10" fontFamily="system-ui">{d.label}</text>
              <rect x={labelWidth} y={y} width={barW} height={barHeight} rx={4} fill={fill} className="transition-all" />
              <text x={labelWidth + barW + 6} y={y + barHeight / 2 + 4} className="fill-slate-500" fontSize="9" fontFamily="system-ui, monospace">{valuePrefix}{d.value.toLocaleString()}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface RoleDashboardsProps {
  selectedCompany: Company;
  selectedUser: User;
  employees: Employee[];
  leads: CRMLead[];
  glAccounts: GLAccount[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  companies: Company[];
  departments: Department[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  okrs: OKRRecord[];
  payslips: PayslipRecord[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  bills: Bill[];
  onApproveLeave: (empId: string) => void;
  onRejectLeave: (empId: string) => void;
  onApproveExpense: (id: string) => void;
  onApproveBill: (id: string) => void;
  onApproveJournalEntry: (id: string) => void;
  onPayInvoice: (invId: string) => void;
  onAdjustStock: (itemId: string, qty: number) => void;
  onNavigateView: (view: string) => void;
}

// ── Shared stat card component ──────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = false, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; icon: string;
}) => (
  <div className={`rounded-xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-200 ${
    accent ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80'
  }`}>
    <div className="flex items-center justify-between">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{label}</span>
      <i className={`${icon} text-sm ${accent ? 'text-slate-400' : 'text-slate-300'}`}></i>
    </div>
    <div className={`text-2xl font-bold tracking-tight font-sans tabular-nums ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</div>
    {sub && <p className={`text-[11px] leading-snug ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

// ── Badge ──────────────────────────────────────────────────────────────────
const Badge = ({ label, variant = 'default' }: { label: string; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[variant]}`}>
      {label}
    </span>
  );
};

// ── Chart palette ───────────────────────────────────────────────────────────
const CHART_PALETTE = ['#0f172a', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

// ── Analytics row (pie + bar) ───────────────────────────────────────────────
const AnalyticsRow = ({ pie, bar }: { pie: React.ReactNode; bar: React.ReactNode }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    {pie}
    {bar}
  </div>
);

export const RoleDashboards: React.FC<RoleDashboardsProps> = ({
  selectedCompany,
  selectedUser,
  employees,
  leads,
  glAccounts,
  invoices,
  inventory,
  tickets,
  auditLogs,
  companies,
  departments,
  leaves,
  attendance,
  okrs,
  expenses,
  journalEntries,
  bills,
  onApproveLeave,
  onRejectLeave,
  onApproveExpense,
  onApproveBill,
  onApproveJournalEntry,
  onPayInvoice,
  onAdjustStock,
  onNavigateView
}) => {
  const role = selectedUser.activeRole || selectedUser.role;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localLeads = leads.filter(l => l.companyId === selectedCompany.id);
  const localGL = glAccounts.filter(g => g.companyId === selectedCompany.id);
  const localInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const localStock = inventory.filter(s => s.companyId === selectedCompany.id);
  const localTickets = tickets.filter(t => t.companyId === selectedCompany.id);
  const localLogs = auditLogs.filter(l => l.companyId === selectedCompany.id);

  // ════════════════════════════════════════════════════════════════════════════
  // SUPER ADMIN — Platform System Administrator
  // Manages the entire SaaS platform: all tenants, global billing, system health
  // Limited to Administration module only - no access to business operations
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Super Admin') {
    const totalMRR = companies.reduce((acc, c) => {
      if (c.billingPlan === 'Enterprise') return acc + 2400;
      if (c.billingPlan === 'Premium') return acc + 900;
      if (c.billingPlan === 'Core') return acc + 350;
      if (c.billingPlan === 'Trial') return acc + 0;
      return acc;
    }, 0);
    const activeCount = companies.filter(c => c.billingStatus === 'Active').length;
    const trialCount = companies.filter(c => c.billingPlan === 'Trial').length;
    const totalUsers = employees.length;
    const avgModules = companies.length > 0
      ? (companies.reduce((s, c) => s + c.activeModules.length, 0) / companies.length).toFixed(1)
      : '0';

    const planBadge = (plan: string) => {
      if (plan === 'Enterprise') return <Badge label="Enterprise" variant="info" />;
      if (plan === 'Premium') return <Badge label="Premium" variant="success" />;
      if (plan === 'Trial') return <Badge label="Trial" variant="warning" />;
      return <Badge label={plan} />;
    };
    const statusBadge = (status: string) => {
      if (status === 'Active') return <Badge label="Active" variant="success" />;
      if (status === 'Past Due') return <Badge label="Past Due" variant="danger" />;
      return <Badge label={status} variant="warning" />;
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                System Administrator
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Control Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">Global SaaS infrastructure — tenant management, billing, system health &amp; platform telemetry. Access limited to Administration module only.</p>
          </div>
          <button
            onClick={() => onNavigateView('superadmin')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <i className="bi bi-shield-shaded text-xs"></i>
            Open System Console
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Tenants" value={activeCount} sub={`${trialCount} on trial · ${companies.length} total registered`} icon="bi bi-building" />
          <StatCard label="Monthly Recurring" value={`$${totalMRR.toLocaleString()}`} sub="Based on active billing plans" icon="bi bi-currency-dollar" accent />
          <StatCard label="System Events" value={auditLogs.length} sub="Recorded in audit log" icon="bi bi-activity" />
          <StatCard label="Avg Modules / Tenant" value={avgModules} sub={`Across ${companies.length} tenant orgs`} icon="bi bi-grid" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PieChart
            title="Revenue by Plan"
            data={[
              { label: 'Enterprise', value: companies.filter(c => c.billingPlan === 'Enterprise').length, color: '#059669' },
              { label: 'Premium', value: companies.filter(c => c.billingPlan === 'Premium').length, color: '#7c3aed' },
              { label: 'Core', value: companies.filter(c => c.billingPlan === 'Core').length, color: '#2563eb' },
              { label: 'Trial', value: companies.filter(c => c.billingPlan === 'Trial').length, color: '#94a3b8' },
            ]}
          />
          <BarGraph
            title="Users per Tenant"
            data={companies.map(c => ({
              label: c.name.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
              value: employees.filter(e => e.companyId === c.id).length || 1,
              color: c.billingPlan === 'Enterprise' ? '#059669' : c.billingPlan === 'Premium' ? '#7c3aed' : '#334155',
            }))}
          />
        </div>

        {/* Tenant Registry + Audit Stream */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Tenant Table */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multi-Tenant Registry</h3>
              <span className="text-[10px] text-slate-400 font-sans">{companies.length} tenants</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Organisation</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Industry</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Modules</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{c.logo}</span>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{c.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">{c.industry}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold text-slate-900 font-sans tabular-nums">{c.activeModules.length}</span>
                        <span className="text-[10px] text-slate-400"> / 21</span>
                      </td>
                      <td className="px-5 py-3">{planBadge(c.billingPlan)}</td>
                      <td className="px-5 py-3">{statusBadge(c.billingStatus)}</td>
                      <td className="px-5 py-3 text-right font-sans tabular-nums text-xs font-semibold text-slate-900">
                        {c.billingPlan === 'Enterprise' ? '$2,400' : c.billingPlan === 'Premium' ? '$900' : c.billingPlan === 'Core' ? '$350' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform System Health + Audit */}
          <div className="lg:col-span-2 space-y-4">
            {/* System Health Panel */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">System Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'API Server', value: 'Operational', ok: true },
                  { label: 'Database Cluster', value: 'Healthy', ok: true },
                  { label: 'Job Queue', value: 'Running', ok: true },
                  { label: 'Email Relay', value: 'Operational', ok: true },
                  { label: 'Storage (S3)', value: '62% used', ok: true },
                  { label: 'SSL Certificates', value: 'Valid', ok: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${s.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Audit Stream */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Platform Audit Stream</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-800">{log.userName}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{log.details}</p>
                    <span className="mt-1 inline-block text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans font-semibold uppercase tracking-wider">{log.module}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Breakdown */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subscription Plan Breakdown</h3>
          </div>
          <div className="grid sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { plan: 'Trial', count: companies.filter(c => c.billingPlan === 'Trial').length, mrr: '$0', color: 'text-slate-500' },
              { plan: 'Core', count: companies.filter(c => c.billingPlan === 'Core').length, mrr: '$350/mo', color: 'text-blue-600' },
              { plan: 'Premium', count: companies.filter(c => c.billingPlan === 'Premium').length, mrr: '$900/mo', color: 'text-purple-600' },
              { plan: 'Enterprise', count: companies.filter(c => c.billingPlan === 'Enterprise').length, mrr: '$2,400/mo', color: 'text-emerald-600' },
            ].map(p => (
              <div key={p.plan} className="p-5 text-center">
                <div className={`text-2xl font-bold tracking-tight font-sans tabular-nums ${p.color}`}>{p.count}</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-1">{p.plan} Plan</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.mrr} per tenant</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPANY ADMIN — Company Administrator
  // Manages their own company: users, modules, branches, departments, settings
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Company Admin' || role === 'CEO') {
    const activeEmployees = localEmployees.filter(e => e.status === 'Active');
    const onLeave = localEmployees.filter(e => e.status === 'On Leave');
    const openInvoices = localInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
    const openTickets = localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');

    const deptNames = [...new Set(localEmployees.map(e => e.department))] as string[];
    const branchNames = [...new Set(localEmployees.map(e => e.branch))];

    const pendingLeaves = leaves.filter(l => l.status === 'Pending' && l.companyId === selectedCompany.id);
    const pendingExpenses = expenses.filter(e => e.status === 'Pending' && e.companyId === selectedCompany.id);
    const pendingJournals = journalEntries.filter(j => j.status === 'Draft' && j.companyId === selectedCompany.id);
    const pendingBillsList = bills.filter(b => b.status === 'Pending' && b.companyId === selectedCompany.id);
    const totalPending = pendingLeaves.length + pendingExpenses.length + pendingJournals.length + pendingBillsList.length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-2xl">{selectedCompany.logo}</span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {role === 'CEO' ? 'Chief Executive Officer' : 'Company Administrator'}
              </span>
              {totalPending > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  <i className="bi bi-bell-fill text-[8px]"></i> {totalPending} pending
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{selectedCompany.name} — Control Panel</h1>
            <p className="text-sm text-slate-500 mt-0.5">Company-wide settings, workforce overview, approvals, module licensing &amp; activity monitoring.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigateView('admin-settings')} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer">
              <i className="bi bi-gear text-xs"></i> Settings
            </button>
            <button onClick={() => onNavigateView('admin-users')} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
              <i className="bi bi-person-plus text-xs"></i> Invite User
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Employees" value={localEmployees.length} sub={`${activeEmployees.length} active · ${onLeave.length} on leave`} icon="bi bi-people" />
          <StatCard label="Departments" value={deptNames.length} sub={`${branchNames.length} branch locations`} icon="bi bi-diagram-3" />
          <StatCard label="Open Invoices" value={openInvoices.length} sub={`${selectedCompany.currency} ${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-file-earmark-text" accent />
          <StatCard label="Support Tickets" value={openTickets.length} sub={`${localTickets.filter(t => t.priority === 'Critical').length} critical priority`} icon="bi bi-ticket" />
        </div>

        {/* Charts Row */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Workforce Distribution"
              data={deptNames.slice(0, 6).map((dept, i) => ({
                label: dept,
                value: localEmployees.filter(e => e.department === dept).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Department Headcount"
              data={deptNames.slice(0, 6).map((dept, i) => ({
                label: dept.length > 14 ? dept.slice(0, 12) + '…' : dept,
                value: localEmployees.filter(e => e.department === dept).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        {/* Approvals + Admin Actions Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Approvals Queue */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <i className="bi bi-hourglass-split text-amber-600 text-xs"></i>
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pending Approvals</h3>
                {totalPending > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">{totalPending}</span>
                )}
              </div>
              <button onClick={() => onNavigateView('hr-leave')} className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {pendingLeaves.map(req => {
                const emp = localEmployees.find(e => e.id === req.employeeId);
                return (
                  <div key={req.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</div>
                      <div className="text-[10px] text-slate-400">{req.leaveType} · {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Leave</span>
                      <button onClick={() => onApproveLeave(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                      <button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Reject</button>
                    </div>
                  </div>
                );
              })}
              {pendingExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{exp.description || 'Expense Claim'}</div>
                    <div className="text-[10px] text-slate-400">{selectedCompany.currency} {exp.amount?.toLocaleString()} · {exp.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded">Expense</span>
                    <button onClick={() => onApproveExpense(exp.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                  </div>
                </div>
              ))}
              {pendingBillsList.map(bill => (
                <div key={bill.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{bill.vendorName || 'Vendor Bill'}</div>
                    <div className="text-[10px] text-slate-400">{selectedCompany.currency} {bill.total?.toLocaleString()} · Due {bill.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Bill</span>
                    <button onClick={() => onApproveBill(bill.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                  </div>
                </div>
              ))}
              {pendingJournals.map(je => (
                <div key={je.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{je.description || 'Journal Entry'}</div>
                    <div className="text-[10px] text-slate-400">{je.date} · {je.lines?.length || 0} lines</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">Journal</span>
                    <button onClick={() => onApproveJournalEntry(je.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Post</button>
                  </div>
                </div>
              ))}
              {totalPending === 0 && (
                <div className="px-5 py-8 text-center">
                  <i className="bi bi-check2-circle text-2xl text-emerald-400"></i>
                  <p className="text-xs text-slate-400 mt-2 font-medium">All caught up — no pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Quick Actions + Financial Health */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Admin Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Manage Users', icon: 'bi bi-people-gear', view: 'admin-users' },
                  { label: 'Role Permissions', icon: 'bi bi-shield-lock', view: 'admin-roles' },
                  { label: 'Approval Flows', icon: 'bi bi-diagram-3', view: 'admin-approvals' },
                  { label: 'Branches', icon: 'bi bi-geo-alt', view: 'admin-branches' },
                  { label: 'Departments', icon: 'bi bi-collection', view: 'admin-departments' },
                  { label: 'System Settings', icon: 'bi bi-gear', view: 'admin-settings' },
                  { label: 'Audit Logs', icon: 'bi bi-journal-text', view: 'compliance' },
                  { label: 'Run Payroll', icon: 'bi bi-cash-stack', view: 'payroll-run' },
                ].map(sc => (
                  <button
                    key={sc.view}
                    onClick={() => onNavigateView(sc.view)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"
                  >
                    <i className={`${sc.icon} text-slate-400 text-sm w-4 text-center shrink-0`}></i>
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Financial Health</h3>
              <div className="space-y-2">
                {[
                  { label: 'Collected Revenue', value: `${selectedCompany.currency} ${localInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0).toLocaleString()}`, icon: 'bi bi-graph-up-arrow', color: 'text-emerald-600' },
                  { label: 'Outstanding Receivables', value: `${selectedCompany.currency} ${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}`, icon: 'bi bi-hourglass', color: 'text-amber-600' },
                  { label: 'Pending Payables', value: `${selectedCompany.currency} ${pendingBillsList.reduce((s, b) => s + (b.total || 0), 0).toLocaleString()}`, icon: 'bi bi-receipt', color: 'text-red-500' },
                  { label: 'Pending Expense Claims', value: `${selectedCompany.currency} ${pendingExpenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}`, icon: 'bi bi-wallet2', color: 'text-violet-600' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <i className={`${row.icon} ${row.color} text-sm`}></i>
                      <span className="text-[11px] text-slate-500">{row.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module Licensing Status */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Module Licenses</h3>
            <span className="text-[11px] text-slate-500 font-semibold">{selectedCompany.activeModules.length} of 21 modules active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCompany.activeModules.map(mod => (
              <span key={mod} className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                <i className="bi bi-check-circle-fill text-emerald-400 text-[9px]"></i>
                {mod}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HR MANAGER / HR OFFICER
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'HR Manager' || role === 'HR Officer') {
    const hasHRModule = selectedCompany.activeModules.includes('HR');
    const hasPayrollModule = selectedCompany.activeModules.includes('Payroll');
    const pendingLeaves = leaves.filter(l => l.status === 'Pending' && l.companyId === selectedCompany.id);
    const pendingExpenses = expenses.filter(e => e.status === 'Pending' && e.companyId === selectedCompany.id);
    const depts = [...new Set(localEmployees.map(e => e.department))] as string[];
    const totalPendingHR = pendingLeaves.length;

    if (!hasHRModule && !hasPayrollModule) {
      // Show core employee directory when HR module is not available
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Employee Directory</h1>
              <p className="text-sm text-slate-500 mt-0.5">Core employee information and organizational structure.</p>
            </div>
            <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
              <i className="bi bi-eye text-xs"></i> View Directory
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-blue-700"><i className="bi bi-info-circle mr-1"></i> Basic employee directory available. Full HR features (attendance, leave, payroll) require HR module subscription.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Employees" value={localEmployees.length} sub="All registered personnel" icon="bi bi-people" />
            <StatCard label="Active" value={localEmployees.filter(e => e.status === 'Active').length} sub="Currently active" icon="bi bi-check-circle" />
            <StatCard label="On Leave" value={localEmployees.filter(e => e.status === 'On Leave').length} sub="Currently on leave" icon="bi bi-calendar-check" accent />
            <StatCard label="Departments" value={depts.length} sub="Organizational units" icon="bi bi-diagram-3" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Employee List</h3>
            <div className="space-y-2">
              {localEmployees.slice(0, 10).map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-slate-500">{emp.department} · {emp.designation}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
            {localEmployees.length > 10 && (
              <button onClick={() => onNavigateView('hr')} className="mt-4 text-xs font-semibold text-slate-600 hover:text-slate-900">
                View all {localEmployees.length} employees →
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">HR &amp; Workforce Command</h1>
              {totalPendingHR > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  <i className="bi bi-bell-fill text-[8px]"></i> {totalPendingHR} pending
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Manage employees, attendance, leaves, recruitment and performance reviews.</p>
          </div>
          <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-person-plus text-xs"></i> Hire Employee
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Headcount" value={localEmployees.length} sub="All registered personnel" icon="bi bi-people" />
          <StatCard label="Active Today" value={localEmployees.filter(e => e.status === 'Active').length} sub="Clocked in / present" icon="bi bi-check-circle" />
          <StatCard label="On Leave" value={localEmployees.filter(e => e.status === 'On Leave').length} sub="Approved leave requests" icon="bi bi-calendar-check" accent />
          <StatCard label="Departments" value={departments.filter(d => d.companyId === selectedCompany.id).length} sub="Organizational units" icon="bi bi-briefcase" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Workforce Distribution"
              data={depts.slice(0, 6).map((dept, i) => ({
                label: dept,
                value: localEmployees.filter(e => e.department === dept).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Department Headcount"
              data={depts.slice(0, 6).map((dept, i) => ({
                label: dept.length > 14 ? dept.slice(0, 12) + '…' : dept,
                value: localEmployees.filter(e => e.department === dept).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Leave Requests */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <i className="bi bi-calendar-check text-amber-600 text-xs"></i>
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pending Leave Requests</h3>
                {pendingLeaves.length > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">{pendingLeaves.length}</span>
                )}
              </div>
              <button onClick={() => onNavigateView('hr-leave')} className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer">View All →</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {pendingLeaves.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <i className="bi bi-check2-circle text-2xl text-emerald-400"></i>
                  <p className="text-xs text-slate-400 mt-2">No pending leave requests</p>
                </div>
              )}
              {pendingLeaves.map(req => {
                const emp = localEmployees.find(e => e.id === req.employeeId);
                const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
                const empDept = emp?.department || '';
                return (
                  <div key={req.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900">{empName} <span className="font-normal text-slate-500">· {empDept}</span></div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{req.leaveType} · {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''} · {req.days} day{req.days !== 1 ? 's' : ''}</div>
                        {req.reason && <div className="text-[10px] text-slate-400 mt-0.5 italic truncate">&ldquo;{req.reason}&rdquo;</div>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => onApproveLeave(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                          Approve
                        </button>
                        <button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {pendingExpenses.length > 0 && (
              <>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <i className="bi bi-wallet2 text-violet-500 text-xs"></i>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Expense Claims ({pendingExpenses.length})</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                  {pendingExpenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{exp.description || 'Expense Claim'}</div>
                        <div className="text-[10px] text-slate-400">{selectedCompany.currency} {exp.amount?.toLocaleString()} · {exp.category}</div>
                      </div>
                      <button onClick={() => onApproveExpense(exp.id)} className="shrink-0 ml-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dept Summary */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Department Headcount</h3>
            <div className="space-y-3">
              {depts.map(dept => {
                const count = localEmployees.filter(e => e.department === dept).length;
                const pct = localEmployees.length ? Math.round((count / localEmployees.length) * 100) : 0;
                return (
                  <div key={dept}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-700">{dept}</span>
                      <span className="text-[10px] font-sans tabular-nums text-slate-500">{count} employees ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HR Quick Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">HR Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Employees', icon: 'bi bi-people', view: 'hr-employees' },
                  { label: 'Attendance', icon: 'bi bi-calendar-check', view: 'hr-attendance' },
                  { label: 'Leave Requests', icon: 'bi bi-calendar-x', view: 'hr-leave' },
                  { label: 'Recruitment', icon: 'bi bi-person-plus', view: 'hr-recruitment' },
                  { label: 'Payroll Run', icon: 'bi bi-cash-stack', view: 'payroll-run' },
                  { label: 'Payslips', icon: 'bi bi-receipt-cutoff', view: 'payroll-slips' },
                  { label: 'Performance', icon: 'bi bi-bullseye', view: 'hr-performance' },
                  { label: 'Org Chart', icon: 'bi bi-diagram-2', view: 'hr-orgchart' },
                ].map(sc => (
                  <button
                    key={sc.view}
                    onClick={() => onNavigateView(sc.view)}
                    className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer text-left"
                  >
                    <i className={`${sc.icon} text-slate-400 text-xs w-3.5 text-center shrink-0`}></i>
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recruiter Banner */}
            <div className="mt-4 p-4 bg-slate-900 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="bi bi-robot text-xs text-slate-300"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">AI Resume Screener</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">Gemini Co-pilot extracts skills, matches departments, and writes targeted interview prompts.</p>
              <button onClick={() => onNavigateView('ai-copilot')} className="mt-3 text-[10px] font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all border border-white/10">
                Screen Applicant Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ACCOUNTANT / FINANCE MANAGER
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Accountant' || role === 'Finance Manager') {
    const hasAccountingModule = selectedCompany.activeModules.includes('Accounting');
    
    if (!hasAccountingModule) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Finance &amp; Accounting Ledger</h1>
              <p className="text-sm text-slate-500 mt-0.5">Chart of accounts, invoice management, P&amp;L projection and cash flow monitoring.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Accounting Module Not Available</h3>
            <p className="text-xs text-amber-600">Your company has not subscribed to the Accounting module. Contact your administrator to enable accounting features.</p>
          </div>
        </div>
      );
    }

    const cashAccount = localGL.find(a => a.code === '1010');
    const arAccount = localGL.find(a => a.code === '1200');
    const revenueAccount = localGL.find(a => a.code === '4010');
    const expenses = localGL.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
    const openInvoices = localInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
    const overdueInvoices = localInvoices.filter(i => i.status === 'Overdue');

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Finance &amp; Accounting Ledger</h1>
            <p className="text-sm text-slate-500 mt-0.5">Chart of accounts, invoice management, P&amp;L projection and cash flow monitoring.</p>
          </div>
          <button onClick={() => onNavigateView('accounting')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg text-xs"></i> New Invoice
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Cash & Bank" value={`${selectedCompany.currency} ${(cashAccount?.balance ?? 0).toLocaleString()}`} sub="Operating account GL-1010" icon="bi bi-bank" />
          <StatCard label="Accounts Receivable" value={`${selectedCompany.currency} ${(arAccount?.balance ?? 0).toLocaleString()}`} sub="Outstanding customer balances" icon="bi bi-receipt" />
          <StatCard label="Revenue YTD" value={`${selectedCompany.currency} ${(revenueAccount?.balance ?? 0).toLocaleString()}`} sub="Total sales revenue GL-4010" icon="bi bi-graph-up" accent />
          <StatCard label="Overdue Invoices" value={overdueInvoices.length} sub={`$${overdueInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()} at risk`} icon="bi bi-exclamation-triangle" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Invoice Status"
              data={['Sent', 'Overdue', 'Paid', 'Draft', 'Void'].map((s, i) => ({
                label: s,
                value: localInvoices.filter(inv => inv.status === s).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Account Balances"
              data={localGL.slice(0, 6).map((a, i) => ({
                label: a.code,
                value: Math.abs(a.balance),
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Outstanding Invoices */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Outstanding Invoices</h3>
              <button onClick={() => onNavigateView('accounting')} className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                View All <i className="bi bi-arrow-right text-[10px]"></i>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Client</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Due</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {openInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-xs text-slate-600">{inv.customerName}</td>
                      <td className="px-5 py-3 text-xs font-sans text-slate-500">{inv.dueDate}</td>
                      <td className="px-5 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${inv.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <Badge label={inv.status} variant={inv.status === 'Overdue' ? 'danger' : 'info'} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => onPayInvoice(inv.id)} className="text-[10px] font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                  {openInvoices.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-xs text-slate-400">All receivables settled — books are clean!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">P&amp;L Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-600">Total Revenue</span>
                <span className="text-xs font-sans tabular-nums font-semibold text-emerald-600">+${(revenueAccount?.balance ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-600">Operating Expenses</span>
                <span className="text-xs font-sans tabular-nums font-semibold text-rose-600">-${expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-600">Gross Profit</span>
                <span className="text-xs font-sans tabular-nums font-semibold text-slate-900">${((revenueAccount?.balance ?? 0) - expenses).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-slate-900">Net Margin</span>
                <span className="text-xs font-sans tabular-nums font-bold text-slate-900">
                  {(revenueAccount?.balance ?? 0) > 0 ? (((revenueAccount!.balance - expenses) / revenueAccount!.balance) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
            <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">AI Financial Forecasting</div>
              <p className="text-[11px] text-slate-500 leading-snug">Activate Predictive Cash Projections in your Licensing Panel to enable Gemini trend analysis.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SALES MANAGER / SALES EXECUTIVE
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Sales Manager' || role === 'Sales Executive' || role === 'Sales Rep') {
    const hasCRMModule = selectedCompany.activeModules.includes('CRM');
    
    if (!hasCRMModule) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales &amp; CRM Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Pipeline management, lead tracking, revenue forecasting and sales team performance.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
            <h3 className="text-sm font-semibold text-amber-800 mb-2">CRM Module Not Available</h3>
            <p className="text-xs text-amber-600">Your company has not subscribed to the CRM module. Contact your administrator to enable CRM features.</p>
          </div>
        </div>
      );
    }

    const qualifiedLeads = localLeads.filter(l => l.status === 'Qualified' || l.status === 'Proposal Sent');
    const wonLeads = localLeads.filter(l => l.status === 'Won');
    const pipelineValue = localLeads.reduce((s, l) => s + l.value, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales &amp; CRM Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Lead pipeline, deal tracking, AI lead scoring and territory performance.</p>
          </div>
          <button onClick={() => onNavigateView('crm')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg text-xs"></i> Add Lead
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leads" value={localLeads.length} sub="All stages in pipeline" icon="bi bi-funnel" />
          <StatCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} sub="Weighted funnel total" icon="bi bi-currency-dollar" />
          <StatCard label="Qualified Leads" value={qualifiedLeads.length} sub="Ready for proposal stage" icon="bi bi-star" accent />
          <StatCard label="Deals Won" value={wonLeads.length} sub={`$${wonLeads.reduce((s, l) => s + l.value, 0).toLocaleString()} closed`} icon="bi bi-trophy" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Pipeline by Stage"
              data={['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((s, i) => ({
                label: s,
                value: localLeads.filter(l => l.status === s).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Leads by Source"
              data={([...new Set(localLeads.map(l => l.source))] as string[]).slice(0, 6).map((src, i) => ({
                label: src,
                value: localLeads.filter(l => l.source === src).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Qualified Pipeline</h3>
            <button onClick={() => onNavigateView('crm')} className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
              Open CRM Board <i className="bi bi-arrow-right text-[10px]"></i>
            </button>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {qualifiedLeads.map(l => (
              <div key={l.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900">{l.companyName}</span>
                  <span className="text-[10px] font-bold font-sans tabular-nums bg-slate-900 text-white px-2 py-0.5 rounded shrink-0">{l.aiLeadScore ?? '—'}%</span>
                </div>
                <p className="text-[11px] text-slate-500">Contact: <span className="font-semibold text-slate-700">{l.firstName} {l.lastName}</span></p>
                <p className="text-[11px] text-slate-500">Value: <span className="font-sans tabular-nums font-semibold text-slate-900">${l.value.toLocaleString()}</span> · Source: {l.source}</p>
                {l.aiFollowUpSuggested && (
                  <div className="mt-3 text-[10px] bg-white border border-slate-200 border-l-2 border-l-slate-900 rounded-lg p-2.5 text-slate-600 leading-snug">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">AI Strategy:</span>
                    {l.aiFollowUpSuggested}
                  </div>
                )}
              </div>
            ))}
            {qualifiedLeads.length === 0 && (
              <p className="col-span-2 text-center py-8 text-xs text-slate-400">No qualified leads in pipeline. Add leads via the CRM board.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INVENTORY MANAGER / STORE KEEPER
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Inventory Manager' || role === 'Store Keeper') {
    const hasInventoryModule = selectedCompany.activeModules.includes('Operations');
    
    if (!hasInventoryModule) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory &amp; Stock Control</h1>
              <p className="text-sm text-slate-500 mt-0.5">Real-time inventory levels, warehouse transfers, procurement and stock valuation.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Inventory Module Not Available</h3>
            <p className="text-xs text-amber-600">Your company has not subscribed to the Operations/Inventory module. Contact your administrator to enable inventory features.</p>
          </div>
        </div>
      );
    }

    const lowStock = localStock.filter(i => i.stockLevel <= i.minStockLevel);
    const totalValue = localStock.reduce((s, i) => s + (i.stockLevel * i.unitPrice), 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory &amp; Stock Control</h1>
            <p className="text-sm text-slate-500 mt-0.5">Monitor safety thresholds, warehouse stock, replenishment orders and barcode tracking.</p>
          </div>
          <button onClick={() => onNavigateView('inventory')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg text-xs"></i> Adjust Stock
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Stock Valuation" value={`$${totalValue.toLocaleString()}`} sub="Total warehoused asset capital" icon="bi bi-currency-dollar" />
          <StatCard label="SKU Count" value={localStock.length} sub="Distinct products tracked" icon="bi bi-box-seam" />
          <StatCard label="Low Stock Alerts" value={lowStock.length} sub="Below minimum threshold" icon="bi bi-exclamation-triangle" accent />
          <StatCard label="Warehouses" value={[...new Set(localStock.map(i => i.warehouse))].length} sub="Active storage locations" icon="bi bi-building" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Stock by Warehouse"
              data={([...new Set(localStock.map(i => i.warehouse))] as string[]).map((w, i) => ({
                label: w,
                value: localStock.filter(i => i.warehouse === w).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Stock Value by Category"
              data={([...new Set(localStock.map(i => i.category))] as string[])
                .map((c, i) => ({
                  label: c,
                  value: localStock.filter(i => i.category === c).reduce((s, it) => s + it.stockLevel * it.unitPrice, 0),
                  color: CHART_PALETTE[i],
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6)}
            />
          }
        />

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-amber-500"></i> Low Stock Alerts
            </h3>
            <span className="text-[10px] text-slate-400 font-sans">{lowStock.length} items flagged</span>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{item.name} <span className="font-mono font-normal text-slate-400 text-[10px]">({item.sku})</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Warehouse: <span className="font-medium text-slate-700">{item.warehouse}</span> ·
                    Stock: <span className="font-sans tabular-nums font-bold text-rose-600"> {item.stockLevel}</span> /
                    Min: <span className="font-sans tabular-nums text-slate-600"> {item.minStockLevel}</span>
                  </div>
                </div>
                <button onClick={() => onAdjustStock(item.id, 100)} className="text-[10px] font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shrink-0 ml-4">
                  Receive +100
                </button>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="text-center py-8 text-xs text-slate-400">All stock levels are within safe thresholds.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EMPLOYEE — Self Service Portal
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Employee') {
    const empRecord = localEmployees.find(e => e.email === selectedUser.email) || localEmployees[0];
    const baseSalary = empRecord ? empRecord.salary : 5000;
    const designation = empRecord ? empRecord.designation : 'Staff Associate';
    const department = empRecord ? empRecord.department : 'General Operations';

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Employee Self Service (ESS)
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome back, {selectedUser.name}!</h1>
            <p className="text-sm text-slate-500 mt-0.5">{designation} · {department}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigateView('hr-leave')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
              <i className="bi bi-calendar-check text-xs"></i> Request Leave
            </button>
            <button onClick={() => onNavigateView('payroll-slips')} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all">
              <i className="bi bi-receipt-cutoff text-xs"></i> View Payslips
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Leave Balance" value={`${21 - leaves.filter(l => l.employeeId === empRecord?.id && l.status === 'Approved').reduce((s, l) => s + l.days, 0)} Days`} sub="Annual leave remaining" icon="bi bi-calendar-range" />
          <StatCard label="Clock-In Status" value={(() => { const today = new Date().toISOString().split('T')[0]; const rec = attendance.find(a => a.employeeId === empRecord?.id && a.date === today); return rec?.checkIn || 'Not clocked in'; })()} sub={(() => { const today = new Date().toISOString().split('T')[0]; const rec = attendance.find(a => a.employeeId === empRecord?.id && a.date === today); return rec?.checkOut ? `Clocked out at ${rec.checkOut}` : 'Clocked in today'; })()} icon="bi bi-clock-history" accent />
          <StatCard label="Last Payslip" value={`${selectedCompany.currency} ${baseSalary.toLocaleString()}`} sub={`Paid for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} icon="bi bi-cash-stack" />
          <StatCard label="Active OKRs / Tasks" value={`${okrs.filter(o => o.employeeId === empRecord?.id && o.status !== 'Completed').length} Active`} sub="Performance cycle" icon="bi bi-graph-up" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Team by Department"
              data={([...new Set(localEmployees.map(e => e.department))] as string[]).map((d, i) => ({
                label: d,
                value: localEmployees.filter(e => e.department === d).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Payroll Cost by Department"
              data={([...new Set(localEmployees.map(e => e.department))] as string[]).map((d, i) => ({
                label: d.length > 14 ? d.slice(0, 12) + '…' : d,
                value: localEmployees.filter(e => e.department === d).reduce((s, e) => s + (e.salary || 0), 0),
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        {/* Secondary Row: My Profile & Calendar */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Quick Profile Summary */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">My Employment Profile</h3>
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Employee ID</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{empRecord?.employeeNumber || 'EMP-2026-001'}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Role Designation</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{designation}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Department</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{department}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Reporting Location</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{empRecord?.branch || 'HQ Office'}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Joining Date</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{empRecord ? new Date(empRecord.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5">
                <span className="text-xs text-slate-500 font-medium">Email Address</span>
                <span className="text-xs font-semibold text-slate-900 col-span-2">{selectedUser.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts / Resources */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">ESS Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Submit Attendance Correction', icon: 'bi bi-check-circle', view: 'hr-attendance' },
                { label: 'Update Personal Info', icon: 'bi bi-person-gear', view: 'hr' },
                { label: 'Review My OKRs & Reviews', icon: 'bi bi-bullseye', view: 'hr-performance' },
                { label: 'View Organisation Chart', icon: 'bi bi-diagram-2', view: 'hr-orgchart' },
              ].map(shortcut => (
                <button
                  key={shortcut.label}
                  onClick={() => onNavigateView(shortcut.view)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <i className={`${shortcut.icon} text-slate-400`}></i>
                    {shortcut.label}
                  </span>
                  <i className="bi bi-chevron-right text-[10px] text-slate-400"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SUPPORT / HELP DESK DASHBOARD — Support Agent
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Support Agent') {
    return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Services Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Support tickets, project milestones, and notifications centre for your role.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Open Tickets" value={localTickets.length} sub="Awaiting assignment or resolution" icon="bi bi-ticket" />
        <StatCard label="Critical Priority" value={localTickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length} sub="SLA breach risk" icon="bi bi-exclamation-circle" accent />
        <StatCard label="Resolved Today" value={localTickets.filter(t => t.status === 'Resolved').length} sub="Closed tickets this session" icon="bi bi-check2-circle" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <PieChart
              title="Tickets by Status"
              data={['Open', 'In Progress', 'Resolved', 'Closed'].map((s, i) => ({
                label: s,
                value: localTickets.filter(t => t.status === s).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Tickets by Priority"
              data={['Low', 'Medium', 'High', 'Critical'].map((p, i) => ({
                label: p,
                value: localTickets.filter(t => t.priority === p).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
        />

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Help Desk Queue</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {localTickets.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
              <div>
                <div className="text-xs font-semibold text-slate-900">{t.customerName} <span className="font-mono font-normal text-slate-400 text-[10px]">({t.ticketNumber})</span></div>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.subject}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} />
                <div className="text-[10px] text-slate-400 font-sans font-semibold uppercase mt-1 tracking-wider">{t.status}</div>
              </div>
            </div>
          ))}
          {localTickets.length === 0 && (
            <p className="text-center py-8 text-xs text-slate-400">Support queue is completely clear!</p>
          )}
        </div>
      </div>
    </div>
  );
  }

  // ════════════════════════════════════════════════════════════════
  // HR DEPARTMENT HEAD — HR, Payroll, Compliance oversight
  // ════════════════════════════════════════════════════════════════
  if (role === 'HR Department Head') {
    const pendingLeaves = leaves.filter(l => l.status === 'Pending' && l.companyId === selectedCompany.id);
    const hrEmployees = localEmployees.filter(e => e.department === 'HR');
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">HR Department Head</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">HR Command Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage employees, payroll, compliance and leave approvals.</p>
          </div>
          <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-people text-xs"></i> My Team</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="HR Headcount" value={hrEmployees.length} sub="In HR department" icon="bi bi-people" />
          <StatCard label="Pending Leaves" value={pendingLeaves.length} sub="Awaiting your approval" icon="bi bi-calendar-check" accent />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} sub="Help desk queue" icon="bi bi-ticket" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Leave Approvals</h3>
            <div className="space-y-3">
              {pendingLeaves.length === 0 && <div className="text-xs text-slate-400 italic">No pending requests</div>}
              {pendingLeaves.map(req => { const emp = localEmployees.find(e => e.id === req.employeeId); return (<div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-amber-50/30"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</div><div className="text-[11px] text-slate-500 mt-0.5">{req.leaveType} · {req.startDate}</div></div><div className="flex gap-1.5 shrink-0"><button onClick={() => onApproveLeave(req.id)} className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer">Approve</button><button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer">Decline</button></div></div></div>);})}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[{ label: 'My Team', icon: 'bi bi-people', view: 'hr-employees' }, { label: 'Attendance', icon: 'bi bi-calendar-check', view: 'hr-attendance' }, { label: 'Leave Requests', icon: 'bi bi-calendar-x', view: 'hr-leave' }, { label: 'Compliance', icon: 'bi bi-shield-check', view: 'comp-checklists' }].map(sc => (<button key={sc.view} onClick={() => onNavigateView(sc.view)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"><span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span><i className="bi bi-chevron-right text-[10px] text-slate-400"></i></button>))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SALES DEPARTMENT HEAD — CRM, Sales, POS oversight
  // ════════════════════════════════════════════════════════════════
  if (role === 'Sales Department Head') {
    const salesLeads = leads.filter(l => l.companyId === selectedCompany.id);
    const openLeads = salesLeads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Sales Department Head</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Sales Command Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">Pipeline, sales orders and POS management.</p>
          </div>
          <button onClick={() => onNavigateView('crm')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-funnel text-xs"></i> Pipeline</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open Leads" value={openLeads.length} sub="In pipeline" icon="bi bi-funnel" />
          <StatCard label="Total Leads" value={salesLeads.length} sub="All time" icon="bi bi-graph-up" accent />
          <StatCard label="Sales Orders" value={localInvoices.length} sub="All invoices" icon="bi bi-receipt" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'CRM Pipeline', icon: 'bi bi-funnel', view: 'crm-pipeline' }, { label: 'Sales Orders', icon: 'bi bi-cart', view: 'sales-orders' }, { label: 'Customers', icon: 'bi bi-person-lines-fill', view: 'crm-contacts' }, { label: 'POS Terminal', icon: 'bi bi-cash-stack', view: 'pos-terminal' }].map(sc => (<button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"><span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span><i className="bi bi-chevron-right text-[10px] text-slate-400"></i></button>))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // FINANCE DEPARTMENT HEAD — Accounting, Payroll oversight
  // ════════════════════════════════════════════════════════════════
  if (role === 'Finance Department Head') {
    const unpaid = localInvoices.filter(i => i.status !== 'Paid');
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Finance Department Head</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Finance Command Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">General ledger, invoices, payroll and bank reconciliation.</p>
          </div>
          <button onClick={() => onNavigateView('accounting')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-journal-bookmark text-xs"></i> General Ledger</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open Invoices" value={unpaid.length} sub={`$${unpaid.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-receipt" />
          <StatCard label="GL Accounts" value={localGL.length} sub="Chart of accounts" icon="bi bi-journal-text" accent />
          <StatCard label="Expenses" value={expenses.filter(e => e.companyId === selectedCompany.id).length} sub="Recorded expenses" icon="bi bi-credit-card" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'General Ledger', icon: 'bi bi-journal-bookmark', view: 'accounting' }, { label: 'Invoices', icon: 'bi bi-file-earmark-text', view: 'acc-invoices' }, { label: 'Payroll Run', icon: 'bi bi-play-circle', view: 'payroll-run' }, { label: 'Bank Reconciliation', icon: 'bi bi-bank', view: 'acc-bank' }].map(sc => (<button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"><span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span><i className="bi bi-chevron-right text-[10px] text-slate-400"></i></button>))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // OPERATIONS DEPARTMENT HEAD — Operations, Inventory, Manufacturing
  // ════════════════════════════════════════════════════════════════
  if (role === 'Operations Department Head') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Operations Department Head</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Operations Command Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">Projects, inventory, procurement and manufacturing.</p>
          </div>
          <button onClick={() => onNavigateView('project')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-columns-gap text-xs"></i> Kanban Board</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Inventory Items" value={localStock.length} sub="Tracked items" icon="bi bi-box-seam" />
          <StatCard label="Employees" value={localEmployees.length} sub="Company headcount" icon="bi bi-people" accent />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} sub="Help desk queue" icon="bi bi-ticket" />
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'Kanban Board', icon: 'bi bi-columns-gap', view: 'project' }, { label: 'Stock Levels', icon: 'bi bi-boxes', view: 'inv-stock' }, { label: 'Work Orders', icon: 'bi bi-clipboard2-data', view: 'mfg-orders' }, { label: 'Fixed Assets', icon: 'bi bi-collection', view: 'asset-register' }].map(sc => (<button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"><span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span><i className="bi bi-chevron-right text-[10px] text-slate-400"></i></button>))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // IT DEPARTMENT HEAD — Administration, Help Desk, POS
  // ════════════════════════════════════════════════════════════════
  if (role === 'IT Department Head') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">IT Department Head</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">IT Command Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">User management, help desk and POS administration.</p>
          </div>
          <button onClick={() => onNavigateView('admin-users')} className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-people-gear text-xs"></i> User Management</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={localEmployees.length} sub="Company users" icon="bi bi-people-gear" />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length} sub="Help desk queue" icon="bi bi-ticket" accent />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
          <StatCard label="Audit Logs" value={localLogs.length} sub="System events" icon="bi bi-journal-text" />
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'Users', icon: 'bi bi-people-gear', view: 'admin-users' }, { label: 'Roles', icon: 'bi bi-shield-lock', view: 'admin-roles' }, { label: 'Help Desk', icon: 'bi bi-headset', view: 'hd-tickets' }, { label: 'Settings', icon: 'bi bi-toggles', view: 'admin-settings' }].map(sc => (<button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-left"><span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span><i className="bi bi-chevron-right text-[10px] text-slate-400"></i></button>))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // BUSINESS OVERVIEW — default dashboard for roles without a bespoke one
  // (none of the 15 defined roles reach here; kept as a safe fallback)
  // ════════════════════════════════════════════════════════════════
  const shortcuts = BUSINESS_SHORTCUTS[role] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {role}
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Business Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Key metrics and quick access for your role at {selectedCompany.name}.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees" value={localEmployees.length} sub={`${departments.length} departments`} icon="bi bi-people" />
        <StatCard label="Open Invoices" value={localInvoices.filter(i => i.status !== 'Paid').length} sub={`$${localInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-receipt" accent />
        <StatCard label="Open Tickets" value={localTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length} sub="Awaiting resolution" icon="bi bi-ticket" />
        <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub="of 21 available" icon="bi bi-box-seam" />
      </div>

      {shortcuts.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Your Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map(sc => (
              <button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer text-left">
                <span className="flex items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span>
                <i className="bi bi-chevron-right text-[10px] text-slate-400"></i>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
