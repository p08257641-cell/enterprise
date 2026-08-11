/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { Company, User, Employee, CRMLead, GLAccount, Invoice, InventoryItem, SupportTicket, AuditLog, Department, LeaveRequest, AttendanceRecord, OKRRecord, PayslipRecord, Expense, JournalEntry, Bill, ProjectTask, CommunicationAnnouncement } from '../types';
import { OrgChart } from './OrgChart';

export const MODULE_CATALOG: Record<string, { icon: string; desc: string; integrations: string[] }> = {
  'Administration': { icon: 'bi-shield-lock-fill text-indigo-500', desc: 'Core system administration, user management, and security settings.', integrations: ['All Modules'] },
  'HR': { icon: 'bi-people-fill text-pink-500', desc: 'Employee records, attendance, leave management, and organizational charts.', integrations: ['Payroll', 'Project Management', 'Operations'] },
  'Payroll': { icon: 'bi-cash-stack text-emerald-500', desc: 'Automated salary calculations, tax deductions, and payslip generation.', integrations: ['HR', 'Accounting', 'Compliance'] },
  'Accounting': { icon: 'bi-bank2 text-blue-500', desc: 'General ledger, AP/AR, journal entries, and financial reporting.', integrations: ['Payroll', 'Sales', 'Procurement', 'Inventory'] },
  'CRM': { icon: 'bi-funnel-fill text-orange-500', desc: 'Customer relationship management, lead tracking, and pipeline management.', integrations: ['Sales', 'Communication', 'Reports & Analytics'] },
  'Inventory': { icon: 'bi-box-seam-fill text-amber-500', desc: 'Stock control, warehouse management, and stock transfers.', integrations: ['Procurement', 'Sales', 'POS', 'Accounting'] },
  'POS': { icon: 'bi-cart-check-fill text-teal-500', desc: 'Point of sale interface for retail transactions and receipt printing.', integrations: ['Inventory', 'Accounting', 'Sales'] },
  'Sales': { icon: 'bi-graph-up-arrow text-cyan-500', desc: 'Sales orders, quotas, and sales performance tracking.', integrations: ['CRM', 'Inventory', 'Accounting'] },
  'Procurement': { icon: 'bi-truck text-violet-500', desc: 'Purchase orders, vendor management, and receiving.', integrations: ['Inventory', 'Accounting'] },
  'AI Assistant': { icon: 'bi-robot text-purple-500', desc: 'AI-powered copilot for automations, anomaly detection, and insights.', integrations: ['All Modules'] },
  'Reports & Analytics': { icon: 'bi-pie-chart-fill text-rose-500', desc: 'Custom report builder and BI dashboards across all business data.', integrations: ['All Modules'] },
  'Communication': { icon: 'bi-chat-dots-fill text-sky-500', desc: 'Internal messaging, announcements, and team collaboration.', integrations: ['HR', 'Project Management'] },
  'Compliance': { icon: 'bi-check-shield-fill text-emerald-600', desc: 'Regulatory tracking, compliance checklists, and audit logs.', integrations: ['HR', 'Payroll', 'Accounting'] },
  'Learning Management (LMS)': { icon: 'bi-book-fill text-blue-400', desc: 'Employee training courses, certifications, and onboarding.', integrations: ['HR'] },
  'Document Management': { icon: 'bi-folder-fill text-amber-400', desc: 'Centralized file storage, version control, and document sharing.', integrations: ['HR', 'Compliance', 'Project Management'] },
  'Visitor Management': { icon: 'bi-person-badge-fill text-indigo-400', desc: 'Guest registration, badges, and front-desk logbook.', integrations: ['Administration'] },
  'Asset Management': { icon: 'bi-pc-display text-slate-500', desc: 'IT equipment tracking, maintenance schedules, and depreciation.', integrations: ['Accounting', 'Operations'] },
  'Help Desk': { icon: 'bi-headset text-rose-400', desc: 'Internal IT support ticketing and issue resolution tracking.', integrations: ['Asset Management', 'HR'] },
  'Operations': { icon: 'bi-gear-fill text-slate-600', desc: 'Facility management, standard operating procedures, and maintenance.', integrations: ['Asset Management', 'Project Management'] },
  'Voting': { icon: 'bi-ui-radios text-cyan-600', desc: 'Secure internal polling and employee voting for elections.', integrations: ['HR', 'Communication'] },
  'Gallery': { icon: 'bi-images text-pink-400', desc: 'Media gallery for company events, culture, and newsletters.', integrations: ['Communication', 'HR'] },
  'Project Management': { icon: 'bi-kanban-fill text-blue-600', desc: 'Kanban boards, task assignments, and milestone tracking.', integrations: ['HR', 'Operations', 'Document Management'] },
  'Manufacturing': { icon: 'bi-tools text-amber-600', desc: 'Bill of materials, production orders, and work center tracking.', integrations: ['Inventory', 'Procurement', 'Accounting'] },
};

const getModuleIcon = (mod: string) => MODULE_CATALOG[mod]?.icon || 'bi-grid-fill text-slate-400';

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

// ── Doughnut Chart Component ────────────────────────────────────────────────
const DoughnutChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  let cumulativeValue = 0;

  const slices: Array<typeof data[0] & { strokeDasharray: string, strokeDashoffset: number, percentage: string }> = [];
  for (const d of data) {
    const strokeDasharray = `${(d.value / total) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativeValue / total) * circumference);
    cumulativeValue += d.value;
    slices.push({ ...d, strokeDasharray, strokeDashoffset, percentage: ((d.value / total) * 100).toFixed(1) });
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex flex-1 items-center gap-6">
        <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full transform -rotate-90">
            {slices.map((s, i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                className="transition-opacity hover:opacity-80 cursor-default"
              />
            ))}
          </svg>
          <div className="flex flex-col items-center justify-center relative z-10 text-center">
             <span className="text-[10px] text-slate-400 fw-semibold uppercase tracking-wider mb-0.5">Total</span>
             <span className="fs-xl fw-bold text-slate-800 leading-none">{total}</span>
          </div>
        </div>
        <div className="space-y-2.5 min-w-0 flex-1">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="fs-sm text-slate-700 fw-medium truncate">{s.label}</span>
              <span className="fs-sm text-slate-500 font-sans tabular-nums ml-auto shrink-0 fw-semibold">{s.percentage}%</span>
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
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
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

const UpsellOverlay = ({ children, isActive, title, icon = 'bi-lock-fill' }: { children: React.ReactNode, isActive: boolean, title: string, icon?: string }) => {
  if (isActive) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200 group h-full">
      <div className="opacity-25 blur-[3px] pointer-events-none select-none transition-all duration-500 grayscale-[0.5]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-50/60">
        <div className="h-12 w-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-3">
          <i className={`bi ${icon} fs-lg text-slate-700`}></i>
        </div>
        <h4 className="fs-sm fw-bold text-slate-900 mb-1.5">Unlock {title}</h4>
        <p className="text-[11px] text-slate-600 mb-4 max-w-[220px] leading-relaxed">Upgrade your plan to enable this module and unlock powerful real-time insights.</p>
        <button className="px-4 py-2 bg-slate-900 text-white text-[11px] fw-semibold rounded-lg hover:bg-slate-800 transition-all shadow-xs flex items-center gap-2">
          <i className="bi bi-stars text-amber-400"></i> Upgrade Plan
        </button>
      </div>
    </div>
  );
};

// ── Line/Area Chart (Revenue Trend) ─────────────────────────────────────────
const LineAreaChart = ({ data, title, valuePrefix = '$', color = '#6366f1' }: { data: { label: string; value: number }[]; title: string; valuePrefix?: string; color?: string }) => {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 1;
  const w = 400, h = 160, padL = 55, padR = 20, padT = 20, padB = 35;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  const points = data.map((d, i) => ({ x: padL + (i / Math.max(data.length - 1, 1)) * chartW, y: padT + chartH - ((d.value - minVal) / range) * chartH }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (range / 4) * i);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs><linearGradient id={`areaG${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
        {yTicks.map((v, i) => { const yy = padT + chartH - ((v - minVal) / range) * chartH; return (<g key={i}><line x1={padL} y1={yy} x2={w - padR} y2={yy} stroke="#e2e8f0" strokeWidth="0.5" /><text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontFamily="system-ui">{valuePrefix}{Math.round(v).toLocaleString()}</text></g>); })}
        <path d={areaPath} fill={`url(#areaG${color.slice(1)})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" /><text x={p.x} y={padT + chartH + 18} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="system-ui">{data[i].label}</text></g>))}
      </svg>
    </div>
  );
};

// ── Funnel Chart (Sales Pipeline) ───────────────────────────────────────────
const FunnelChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-2">{data.map((d, i) => (<div key={i} className="flex items-center gap-3"><span className="text-[10px] fw-semibold text-slate-500 w-20 text-right truncate">{d.label}</span><div className="flex-1"><div className="h-8 rounded-lg flex items-center px-3 transition-all duration-500" style={{ width: `${Math.max((d.value / maxVal) * 100, 12)}%`, backgroundColor: d.color, minWidth: '50px' }}><span className="text-[10px] fw-bold text-white drop-shadow-sm">{d.value.toLocaleString()}</span></div></div></div>))}</div>
      <div className="flex items-center justify-center gap-1 mt-3 text-[9px] text-slate-400 fw-semibold uppercase tracking-wider"><i className="bi bi-funnel-fill text-slate-300" /> Pipeline Conversion Flow</div>
    </div>
  );
};

// ── Stacked Bar Chart (Payroll by Dept) ─────────────────────────────────────
const StackedBarChart = ({ data, title, currency = '$' }: { data: { dept: string; salary: number; taxes: number; benefits: number }[]; title: string; currency?: string }) => {
  if (data.length === 0) return null;
  const maxV = Math.max(...data.map(d => d.salary + d.taxes + d.benefits), 1);
  const bH = 28, gp = 6, pL = 100, cW = 280, tH = data.length * (bH + gp) + 30;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-center gap-4 mb-3">{[{ l: 'Base Salary', c: '#0f172a' }, { l: 'Taxes', c: '#ef4444' }, { l: 'Benefits', c: '#10b981' }].map(x => (<div key={x.l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: x.c }} /><span className="text-[9px] text-slate-500 fw-medium">{x.l}</span></div>))}</div>
      <svg viewBox={`0 0 ${pL + cW + 80} ${tH}`} className="w-full" preserveAspectRatio="xMinYMin meet">
        {data.map((d, i) => { const y = i * (bH + gp), tot = d.salary + d.taxes + d.benefits, sW = (d.salary / maxV) * cW, tW = (d.taxes / maxV) * cW, bW = (d.benefits / maxV) * cW; return (<g key={i}><text x={pL - 6} y={y + bH / 2 + 4} textAnchor="end" fontSize="9" fill="#475569" fontFamily="system-ui">{d.dept.length > 14 ? d.dept.slice(0, 12) + '…' : d.dept}</text><rect x={pL} y={y} width={sW} height={bH} rx={3} fill="#0f172a" /><rect x={pL + sW} y={y} width={tW} height={bH} fill="#ef4444" /><rect x={pL + sW + tW} y={y} width={bW} height={bH} rx={3} fill="#10b981" /><text x={pL + sW + tW + bW + 6} y={y + bH / 2 + 3} fontSize="8" fill="#94a3b8" fontFamily="system-ui, monospace">{currency}{tot.toLocaleString()}</text></g>); })}
      </svg>
    </div>
  );
};

// ── Attendance Heatmap ──────────────────────────────────────────────────────
const HeatmapGrid = ({ data, title }: { data: { day: string; rate: number }[]; title: string }) => {
  const gc = (r: number) => r >= 95 ? '#059669' : r >= 85 ? '#10b981' : r >= 70 ? '#fbbf24' : r >= 50 ? '#f59e0b' : '#ef4444';
  const wks: { day: string; rate: number }[][] = []; for (let i = 0; i < data.length; i += 5) wks.push(data.slice(i, i + 5));
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex gap-1.5 flex-wrap">{wks.map((wk, wi) => (<div key={wi} className="flex flex-col gap-1">{wk.map((d, di) => (<div key={di} className="h-6 w-6 rounded-sm transition-all hover:scale-110 cursor-default" style={{ backgroundColor: gc(d.rate) }} title={`${d.day}: ${d.rate}%`} />))}</div>))}</div>
      <div className="flex items-center gap-3 mt-3"><span className="text-[9px] text-slate-400 fw-medium">Low</span>{['#ef4444','#f59e0b','#fbbf24','#10b981','#059669'].map(c => (<span key={c} className="h-3 w-6 rounded-sm" style={{ backgroundColor: c }} />))}<span className="text-[9px] text-slate-400 fw-medium">High</span></div>
    </div>
  );
};

// ── Invoice Aging Chart ─────────────────────────────────────────────────────
const InvoiceAgingChart = ({ buckets, title, currency = '$' }: { buckets: { label: string; count: number; amount: number; color: string }[]; title: string; currency?: string }) => {
  const mx = Math.max(...buckets.map(b => b.amount), 1);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">{buckets.map((b, i) => (<div key={i}><div className="flex items-center justify-between mb-1"><span className="text-[11px] fw-semibold text-slate-700">{b.label}</span><div className="flex items-center gap-2"><span className="text-[10px] text-slate-400">{b.count} inv</span><span className="text-[11px] fw-bold text-slate-900 font-mono tabular-nums">{currency}{b.amount.toLocaleString()}</span></div></div><div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max((b.amount / mx) * 100, 2)}%`, backgroundColor: b.color }} /></div></div>))}</div>
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
  projectTasks?: ProjectTask[];
  announcements?: CommunicationAnnouncement[];
  onApproveLeave: (empId: string) => void;
  onRejectLeave: (empId: string) => void;
  onApproveExpense: (id: string) => void;
  onApproveBill: (id: string) => void;
  onApproveJournalEntry: (id: string) => void;
  onPayInvoice: (invId: string) => void;
  onAdjustStock: (itemId: string, qty: number) => void;
  onNavigateView: (view: string) => void;
  bankAccountUpdates?: import('../types').BankAccountUpdateRequest[];
  onRequestBankAccountUpdate?: (input: { companyId: string; employeeId: string; employeeName: string; bankName: string; accountName: string; accountNumber: string; sortCode?: string; routingNumber?: string }) => void;
  profileUpdateRequests?: import('../types').ProfileUpdateRequest[];
  onUpdateUserSignature?: (id: string, signatureUrl: string) => void;
    onSubmitProfileUpdate?: (input: { companyId: string; employeeId: string; employeeName: string; department: string; field: string; label: string; currentValue: string; newValue: string }) => void;
}

// ── Shared stat card component ──────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = false, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; icon: string;
}) => (
  <div className={`rounded-xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-200 group ${
    accent ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80'
  }`}>
    <div className="flex items-center justify-between">
      <span className={`text-[10px] fw-bold uppercase tracking-widest ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{label}</span>
      <div className={`h-8 w-8 rounded-md flex shrink-0 items-center justify-center border transition-all ${
        accent 
          ? 'bg-white/10 border-white/20' 
          : 'bg-slate-50 border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:bg-white group-hover:border-slate-300 group-hover:shadow-sm group-hover:scale-105'
      }`}>
        <i className={`${icon} fs-sm ${accent ? 'text-slate-200' : 'text-slate-500'}`}></i>
      </div>
    </div>
    <div className={`fs-2xl fw-bold tracking-tight font-sans tabular-nums ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</div>
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] fw-semibold border ${styles[variant]}`}>
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
  projectTasks = [],
  announcements = [],
  onApproveLeave,
  onRejectLeave,
  onApproveExpense,
  onApproveBill,
  onApproveJournalEntry,
  onPayInvoice,
  onAdjustStock,
  onNavigateView,
  bankAccountUpdates,
  onRequestBankAccountUpdate,
  profileUpdateRequests,
  onSubmitProfileUpdate
}) => {
  const role = selectedUser.activeRole || selectedUser.role;

  const [selectedModuleMeta, setSelectedModuleMeta] = useState<string | null>(null);
  const [isUpdateBankModalOpen, setIsUpdateBankModalOpen] = useState(false);
  const [bankUpdateForm, setBankUpdateForm] = useState({ bankName: '', accountName: '', accountNumber: '', sortCode: '' });
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '', dateOfBirth: '', gender: '', maritalStatus: '', nationality: '',
    address: '', city: '', state: '', country: '', postalCode: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    employmentType: '', workLocation: '', bio: '',
  });

  const localEmployees = (employees || []).filter(e => e.companyId === selectedCompany.id);
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
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                System Administrator
              </span>
            </div>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Platform Control Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Global SaaS infrastructure — tenant management, billing, system health &amp; platform telemetry. Access limited to Administration module only.</p>
          </div>
          <button
            onClick={() => onNavigateView('superadmin')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white fw-semibold fs-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <i className="bi bi-shield-shaded fs-xs"></i>
            Open System Console
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Tenants" value={activeCount} sub={`${trialCount} on trial · ${companies.length} total registered`} icon="bi bi-building" />
          <StatCard label="Monthly Recurring" value={formatCurrency(totalMRR, selectedCompany?.currency)} sub="Based on active billing plans" icon="bi bi-currency-dollar" accent />
          <StatCard label="System Events" value={auditLogs.length} sub="Recorded in audit log" icon="bi bi-activity" />
          <StatCard label="Avg Modules / Tenant" value={avgModules} sub={`Across ${companies.length} tenant orgs`} icon="bi bi-grid" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DoughnutChart
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
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Multi-Tenant Registry</h3>
              <span className="text-[10px] text-slate-400 font-sans">{companies.length} tenants</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Organisation</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Industry</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Modules</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Plan</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="fs-xl">{c.logo}</span>
                          <div>
                            <div className="fs-xs fw-semibold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{c.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 fs-xs text-slate-600">{c.industry}</td>
                      <td className="px-5 py-3">
                        <span className="fs-xs fw-bold text-slate-900 font-sans tabular-nums">{c.activeModules.length}</span>
                        <span className="text-[10px] text-slate-400"> / {Object.keys(MODULE_CATALOG).length}</span>
                      </td>
                      <td className="px-5 py-3">{planBadge(c.billingPlan)}</td>
                      <td className="px-5 py-3">{statusBadge(c.billingStatus)}</td>
                      <td className="px-5 py-3 text-right font-sans tabular-nums fs-xs fw-semibold text-slate-900">
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
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">System Health</h3>
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
                    <span className="fs-xs text-slate-600">{s.label}</span>
                    <span className={`flex items-center gap-1.5 text-[10px] fw-semibold ${s.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Audit Stream */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Platform Audit Stream</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] fw-semibold text-slate-800">{log.userName}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{log.details}</p>
                    <span className="mt-1 inline-block text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans fw-semibold uppercase tracking-wider">{log.module}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Breakdown */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Subscription Plan Breakdown</h3>
          </div>
          <div className="grid sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { plan: 'Trial', count: companies.filter(c => c.billingPlan === 'Trial').length, mrr: '$0', color: 'text-slate-500' },
              { plan: 'Core', count: companies.filter(c => c.billingPlan === 'Core').length, mrr: '$350/mo', color: 'text-blue-600' },
              { plan: 'Premium', count: companies.filter(c => c.billingPlan === 'Premium').length, mrr: '$900/mo', color: 'text-purple-600' },
              { plan: 'Enterprise', count: companies.filter(c => c.billingPlan === 'Enterprise').length, mrr: '$2,400/mo', color: 'text-emerald-600' },
            ].map(p => (
              <div key={p.plan} className="p-5 text-center">
                <div className={`fs-2xl fw-bold tracking-tight font-sans tabular-nums ${p.color}`}>{p.count}</div>
                <div className="text-[11px] fw-semibold text-slate-700 mt-1">{p.plan} Plan</div>
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

    // ── Analytics Data Prep ──
    const revData = [
      { label: 'Jan', value: 45000 }, { label: 'Feb', value: 52000 }, { label: 'Mar', value: 48000 },
      { label: 'Apr', value: 61000 }, { label: 'May', value: 59000 }, { label: 'Jun', value: 75000 + (localInvoices.reduce((s, i) => s + (i.status === 'Paid' ? i.total : 0), 0) % 10000) }
    ];
    
    const crmLeads = leads.filter(l => l.companyId === selectedCompany.id);
    const funnelData = [
      { label: 'Prospects', value: Math.max(crmLeads.filter(l => l.status === 'New').length, 45), color: '#3b82f6' },
      { label: 'Qualified', value: Math.max(crmLeads.filter(l => l.status === 'Contacted').length, 28), color: '#8b5cf6' },
      { label: 'Proposal', value: Math.max(crmLeads.filter(l => l.status === 'Qualified').length, 15), color: '#f59e0b' },
      { label: 'Won', value: Math.max(crmLeads.filter(l => l.status === 'Won').length, 8), color: '#10b981' },
    ];
    
    let payrollData = deptNames.map(dept => {
      const emps = localEmployees.filter(e => e.department === dept);
      const salary = emps.reduce((sum, e) => sum + (e.salary || 0), 0) || (Math.random() * 20000 + 10000);
      return { dept, salary, taxes: salary * 0.15, benefits: salary * 0.05 };
    }).slice(0, 5);
    if (payrollData.length === 0) payrollData = [{ dept: 'HQ', salary: 45000, taxes: 6750, benefits: 2250 }];
    
    const heatmapData = Array.from({ length: 15 }, (_, i) => ({ day: `D${i + 1}`, rate: Math.floor(Math.random() * 30) + 70 }));
    
    const agingData = [
      { label: 'Current (0-30 days)', count: openInvoices.length, amount: openInvoices.reduce((s, i) => s + i.total, 0) || 12500, color: '#10b981' },
      { label: '31-60 days', count: 3, amount: 4500, color: '#f59e0b' },
      { label: '61-90 days', count: 1, amount: 1200, color: '#f97316' },
      { label: '90+ days', count: 0, amount: 0, color: '#ef4444' },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="fs-2xl">{selectedCompany.logo}</span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">
                {role === 'CEO' ? 'Chief Executive Officer' : 'Company Administrator'}
              </span>
              {totalPending > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] fw-bold px-2 py-0.5 rounded-full">
                  <i className="bi bi-bell-fill text-[8px]"></i> {totalPending} pending
                </span>
              )}
            </div>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">{selectedCompany.name} — Control Panel</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Company-wide settings, workforce overview, approvals, module licensing &amp; activity monitoring.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onNavigateView('admin-settings')} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer">
              <i className="bi bi-gear fs-xs"></i> Settings
            </button>
            <button onClick={() => onNavigateView('admin-users')} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white fw-semibold fs-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
              <i className="bi bi-person-plus fs-xs"></i> Invite User
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

        {/* Business Intelligence / Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UpsellOverlay isActive={selectedCompany.activeModules.includes('Accounting')} title="Financial Analytics" icon="bi-graph-up">
              <LineAreaChart data={revData} title="Revenue Trend (6 Months)" valuePrefix={selectedCompany.currency === 'GHS' ? '₵' : '$'} />
            </UpsellOverlay>
          </div>
          <div>
            <UpsellOverlay isActive={selectedCompany.activeModules.includes('CRM')} title="Sales Pipeline" icon="bi-funnel-fill">
              <FunnelChart data={funnelData} title="Sales Pipeline Funnel" />
            </UpsellOverlay>
          </div>
          
          <div className="lg:col-span-2">
            <UpsellOverlay isActive={selectedCompany.activeModules.includes('Payroll')} title="Payroll Insights" icon="bi-cash-stack">
              <StackedBarChart data={payrollData} title="Payroll Cost by Department" currency={selectedCompany.currency} />
            </UpsellOverlay>
          </div>
          <div className="flex flex-col gap-6">
            <UpsellOverlay isActive={selectedCompany.activeModules.includes('HR')} title="Attendance Metrics" icon="bi-calendar2-check-fill">
              <HeatmapGrid data={heatmapData} title="Attendance (3 Weeks)" />
            </UpsellOverlay>
            <UpsellOverlay isActive={selectedCompany.activeModules.includes('Accounting')} title="A/R Aging" icon="bi-receipt-cutoff">
              <InvoiceAgingChart buckets={agingData} title="A/R Aging" currency={selectedCompany.currency} />
            </UpsellOverlay>
          </div>
        </div>

        {/* Approvals + Admin Actions Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Approvals Queue */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <i className="bi bi-hourglass-split text-amber-600 fs-xs"></i>
                </div>
                <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Pending Approvals</h3>
                {totalPending > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] fw-bold">{totalPending}</span>
                )}
              </div>
              <button onClick={() => onNavigateView('hr-leave')} className="text-[10px] fw-semibold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {pendingLeaves.map(req => {
                const emp = localEmployees.find(e => e.id === req.employeeId);
                return (
                  <div key={req.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <div className="fs-xs fw-semibold text-slate-900 truncate">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</div>
                      <div className="text-[10px] text-slate-400">{req.leaveType} · {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <span className="text-[9px] fw-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Leave</span>
                      <button onClick={() => onApproveLeave(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                      <button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Reject</button>
                    </div>
                  </div>
                );
              })}
              {pendingExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="fs-xs fw-semibold text-slate-900 truncate">{exp.description || 'Expense Claim'}</div>
                    <div className="text-[10px] text-slate-400">{selectedCompany.currency} {exp.amount?.toLocaleString()} · {exp.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] fw-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded">Expense</span>
                    <button onClick={() => onApproveExpense(exp.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                  </div>
                </div>
              ))}
              {pendingBillsList.map(bill => (
                <div key={bill.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="fs-xs fw-semibold text-slate-900 truncate">{bill.vendorName || 'Vendor Bill'}</div>
                    <div className="text-[10px] text-slate-400">{selectedCompany.currency} {bill.total?.toLocaleString()} · Due {bill.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] fw-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Bill</span>
                    <button onClick={() => onApproveBill(bill.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Approve</button>
                  </div>
                </div>
              ))}
              {pendingJournals.map(je => (
                <div key={je.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="fs-xs fw-semibold text-slate-900 truncate">{je.description || 'Journal Entry'}</div>
                    <div className="text-[10px] text-slate-400">{je.date} · {je.lines?.length || 0} lines</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="text-[9px] fw-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">Journal</span>
                    <button onClick={() => onApproveJournalEntry(je.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">Post</button>
                  </div>
                </div>
              ))}
              {totalPending === 0 && (
                <div className="px-5 py-8 text-center">
                  <i className="bi bi-check2-circle fs-2xl text-emerald-400"></i>
                  <p className="fs-xs text-slate-400 mt-2 fw-medium">All caught up — no pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Financial Health */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5">
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-3">Financial Health</h3>
              <div className="space-y-2">
                {[
                  { label: 'Collected Revenue', value: `${selectedCompany.currency} ${localInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0).toLocaleString()}`, icon: 'bi bi-graph-up-arrow', color: 'text-emerald-600' },
                  { label: 'Outstanding Receivables', value: `${selectedCompany.currency} ${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}`, icon: 'bi bi-hourglass', color: 'text-amber-600' },
                  { label: 'Pending Payables', value: `${selectedCompany.currency} ${pendingBillsList.reduce((s, b) => s + (b.total || 0), 0).toLocaleString()}`, icon: 'bi bi-receipt', color: 'text-red-500' },
                  { label: 'Pending Expense Claims', value: `${selectedCompany.currency} ${pendingExpenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}`, icon: 'bi bi-wallet2', color: 'text-violet-600' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <i className={`${row.icon} ${row.color} fs-sm`}></i>
                      <span className="text-[11px] text-slate-500">{row.label}</span>
                    </div>
                    <span className="fs-xs fw-bold text-slate-900 font-mono tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module Licensing Status */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-3">
            <h3 className="section-title text-slate-900 flex items-center gap-2">
              <i className="bi bi-diagram-3-fill text-indigo-500"></i> Active Module Licenses
            </h3>
            <div className="flex items-center gap-3">
               <div className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedCompany.activeModules.length / Object.keys(MODULE_CATALOG).length) * 100, 100)}%` }}></div>
               </div>
               <span className="text-[11px] text-slate-700 fw-bold">{selectedCompany.activeModules.length} <span className="text-slate-400 fw-normal">of {Object.keys(MODULE_CATALOG).length}</span></span>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Object.keys(MODULE_CATALOG).map(mod => {
              const isActive = selectedCompany.activeModules.includes(mod);
              const iconClass = getModuleIcon(mod);
              return (
                <div key={mod} onClick={() => setSelectedModuleMeta(mod)} className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all group cursor-pointer ${isActive ? 'border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-indigo-200 hover:shadow-md' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'}`}>
                  <div className={`h-8 w-8 rounded-md flex shrink-0 items-center justify-center border transition-all ${isActive ? 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:scale-110' : 'bg-slate-100 border-slate-200/50 grayscale-[0.8] opacity-70'}`}>
                    <i className={`bi ${iconClass} fs-sm ${!isActive && 'text-slate-500'}`}></i>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-[11px] fw-semibold truncate leading-tight transition-colors ${isActive ? 'text-slate-700 group-hover:text-indigo-700' : 'text-slate-500'}`} title={mod}>{mod}</span>
                    {!isActive && <span className="text-[9px] text-slate-400 mt-0.5"><i className="bi bi-lock-fill"></i> Locked</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Meta Modal */}
        {selectedModuleMeta && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedModuleMeta(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-start gap-4 bg-slate-50/50">
                <div className="h-12 w-12 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                  <i className={`bi ${MODULE_CATALOG[selectedModuleMeta]?.icon} fs-xl`}></i>
                </div>
                <div>
                  <h3 className="fs-lg fw-bold text-slate-900">{selectedModuleMeta}</h3>
                  <div className="mt-1.5">
                    {selectedCompany.activeModules.includes(selectedModuleMeta) ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] fw-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <i className="bi bi-check-circle-fill"></i> Active License
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] fw-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        <i className="bi bi-lock-fill"></i> Not Subscribed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] fw-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h4>
                  <p className="fs-sm text-slate-700 leading-relaxed">{MODULE_CATALOG[selectedModuleMeta]?.desc}</p>
                </div>
                <div>
                  <h4 className="text-[10px] fw-bold uppercase tracking-wider text-slate-400 mb-2">Integrates With</h4>
                  <div className="flex flex-wrap gap-2">
                    {MODULE_CATALOG[selectedModuleMeta]?.integrations.map(integ => (
                      <span key={integ} className="text-[11px] fw-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">{integ}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                {!selectedCompany.activeModules.includes(selectedModuleMeta) && (
                  <button onClick={() => setSelectedModuleMeta(null)} className="px-5 py-2 rounded-lg bg-slate-900 text-white fs-sm fw-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2">
                     <i className="bi bi-stars text-amber-400"></i> Upgrade
                  </button>
                )}
                <button onClick={() => setSelectedModuleMeta(null)} className="px-5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 fs-sm fw-semibold hover:bg-slate-100 transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
              <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Employee Directory</h1>
              <p className="fs-sm text-slate-500 mt-0.5">Core employee information and organizational structure.</p>
            </div>
            <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
              <i className="bi bi-eye fs-xs"></i> View Directory
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="fs-xs text-blue-700"><i className="bi bi-info-circle mr-1"></i> Basic employee directory available. Full HR features (attendance, leave, payroll) require HR module subscription.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Employees" value={localEmployees.length} sub="All registered personnel" icon="bi bi-people" />
            <StatCard label="Active" value={localEmployees.filter(e => e.status === 'Active').length} sub="Currently active" icon="bi bi-check-circle" />
            <StatCard label="On Leave" value={localEmployees.filter(e => e.status === 'On Leave').length} sub="Currently on leave" icon="bi bi-calendar-check" accent />
            <StatCard label="Departments" value={depts.length} sub="Organizational units" icon="bi bi-diagram-3" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Employee List</h3>
            <div className="space-y-2">
              {localEmployees.slice(0, 10).map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center fs-xs fw-semibold text-slate-600">
                      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="fs-xs fw-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-slate-500">{emp.department} · {emp.designation}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full fw-semibold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
            {localEmployees.length > 10 && (
              <button onClick={() => onNavigateView('hr')} className="mt-4 fs-xs fw-semibold text-slate-600 hover:text-slate-900">
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
              <h1 className="fs-xl fw-bold tracking-tight text-slate-900">HR &amp; Workforce Command</h1>
              {totalPendingHR > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] fw-bold px-2 py-0.5 rounded-full">
                  <i className="bi bi-bell-fill text-[8px]"></i> {totalPendingHR} pending
                </span>
              )}
            </div>
            <p className="fs-sm text-slate-500 mt-0.5">Manage employees, attendance, leaves, recruitment and performance reviews.</p>
          </div>
          <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-person-plus fs-xs"></i> Hire Employee
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
            <DoughnutChart
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
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <i className="bi bi-calendar-check text-amber-600 fs-xs"></i>
                </div>
                <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Pending Leave Requests</h3>
                {pendingLeaves.length > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] fw-bold">{pendingLeaves.length}</span>
                )}
              </div>
              <button onClick={() => onNavigateView('hr-leave')} className="text-[10px] fw-semibold text-slate-400 hover:text-slate-700 cursor-pointer">View All →</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {pendingLeaves.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <i className="bi bi-check2-circle fs-2xl text-emerald-400"></i>
                  <p className="fs-xs text-slate-400 mt-2">No pending leave requests</p>
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
                        <div className="fs-xs fw-bold text-slate-900">{empName} <span className="fw-normal text-slate-500">· {empDept}</span></div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{req.leaveType} · {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''} · {req.days} day{req.days !== 1 ? 's' : ''}</div>
                        {req.reason && <div className="text-[10px] text-slate-400 mt-0.5 italic truncate">&ldquo;{req.reason}&rdquo;</div>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => onApproveLeave(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                          Approve
                        </button>
                        <button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
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
                  <i className="bi bi-wallet2 text-violet-500 fs-xs"></i>
                  <span className="text-[10px] fw-bold uppercase tracking-wider text-slate-500">Pending Expense Claims ({pendingExpenses.length})</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                  {pendingExpenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="min-w-0">
                        <div className="fs-xs fw-semibold text-slate-900 truncate">{exp.description || 'Expense Claim'}</div>
                        <div className="text-[10px] text-slate-400">{selectedCompany.currency} {exp.amount?.toLocaleString()} · {exp.category}</div>
                      </div>
                      <button onClick={() => onApproveExpense(exp.id)} className="shrink-0 ml-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] fw-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
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
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Department Headcount</h3>
            <div className="space-y-3">
              {depts.map(dept => {
                const count = localEmployees.filter(e => e.department === dept).length;
                const pct = localEmployees.length ? Math.round((count / localEmployees.length) * 100) : 0;
                return (
                  <div key={dept}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="fs-xs fw-medium text-slate-700">{dept}</span>
                      <span className="text-[10px] font-sans tabular-nums text-slate-500">{count} employees ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Recruiter Banner */}
            <div className="mt-4 p-4 bg-slate-900 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="bi bi-robot fs-xs text-slate-300"></i>
                <span className="text-[10px] fw-bold uppercase tracking-wider text-slate-300">AI Resume Screener</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">Gemini Co-pilot extracts skills, matches departments, and writes targeted interview prompts.</p>
              <button onClick={() => onNavigateView('ai-copilot')} className="mt-3 text-[10px] fw-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all border border-white/10">
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
              <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Finance &amp; Accounting Ledger</h1>
              <p className="fs-sm text-slate-500 mt-0.5">Chart of accounts, invoice management, P&amp;L projection and cash flow monitoring.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 fs-3xl mb-3 block"></i>
            <h3 className="fs-sm fw-semibold text-amber-800 mb-2">Accounting Module Not Available</h3>
            <p className="fs-xs text-amber-600">Your company has not subscribed to the Accounting module. Contact your administrator to enable accounting features.</p>
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
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Finance &amp; Accounting Ledger</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Chart of accounts, invoice management, P&amp;L projection and cash flow monitoring.</p>
          </div>
          <button onClick={() => onNavigateView('accounting')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg fs-xs"></i> New Invoice
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Cash & Bank" value={`${selectedCompany.currency} ${(cashAccount?.balance ?? 0).toLocaleString()}`} sub="Operating account GL-1010" icon="bi bi-bank" />
          <StatCard label="Accounts Receivable" value={`${selectedCompany.currency} ${(arAccount?.balance ?? 0).toLocaleString()}`} sub="Outstanding customer balances" icon="bi bi-receipt" />
          <StatCard label="Revenue YTD" value={`${selectedCompany.currency} ${(revenueAccount?.balance ?? 0).toLocaleString()}`} sub="Total sales revenue GL-4010" icon="bi bi-graph-up" accent />
          <StatCard label="Overdue Invoices" value={overdueInvoices.length} sub={`${formatCurrency(overdueInvoices.reduce((s, i) => s + i.total, 0), selectedCompany?.currency)} at risk`} icon="bi bi-exclamation-triangle" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <DoughnutChart
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
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Outstanding Invoices</h3>
              <button onClick={() => onNavigateView('accounting')} className="text-[11px] fw-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                View All <i className="bi bi-arrow-right text-[10px]"></i>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Invoice</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Client</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Due</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400 text-right">Amount</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3 text-[10px] fw-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {openInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-3 font-mono fs-xs fw-semibold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 fs-xs text-slate-600">{inv.customerName}</td>
                      <td className="px-5 py-3 fs-xs font-sans text-slate-500">{inv.dueDate}</td>
                      <td className="px-5 py-3 fs-xs font-sans tabular-nums fw-semibold text-slate-900 text-right">${inv.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <Badge label={inv.status} variant={inv.status === 'Overdue' ? 'danger' : 'info'} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => onPayInvoice(inv.id)} className="text-[10px] fw-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                  {openInvoices.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 fs-xs text-slate-400">All receivables settled — books are clean!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">P&amp;L Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="fs-xs text-slate-600">Total Revenue</span>
                <span className="fs-xs font-sans tabular-nums fw-semibold text-emerald-600">+${(revenueAccount?.balance ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="fs-xs text-slate-600">Operating Expenses</span>
                <span className="fs-xs font-sans tabular-nums fw-semibold text-rose-600">-${expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="fs-xs text-slate-600">Gross Profit</span>
                <span className="fs-xs font-sans tabular-nums fw-semibold text-slate-900">${((revenueAccount?.balance ?? 0) - expenses).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="fs-xs fw-bold text-slate-900">Net Margin</span>
                <span className="fs-xs font-sans tabular-nums fw-bold text-slate-900">
                  {(revenueAccount?.balance ?? 0) > 0 ? (((revenueAccount!.balance - expenses) / revenueAccount!.balance) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
            <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[9px] fw-bold uppercase tracking-wider text-slate-500 mb-1">AI Financial Forecasting</div>
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
              <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Sales &amp; CRM Dashboard</h1>
              <p className="fs-sm text-slate-500 mt-0.5">Pipeline management, lead tracking, revenue forecasting and sales team performance.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 fs-3xl mb-3 block"></i>
            <h3 className="fs-sm fw-semibold text-amber-800 mb-2">CRM Module Not Available</h3>
            <p className="fs-xs text-amber-600">Your company has not subscribed to the CRM module. Contact your administrator to enable CRM features.</p>
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
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Sales &amp; CRM Dashboard</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Lead pipeline, deal tracking, AI lead scoring and territory performance.</p>
          </div>
          <button onClick={() => onNavigateView('crm')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg fs-xs"></i> Add Lead
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leads" value={localLeads.length} sub="All stages in pipeline" icon="bi bi-funnel" />
          <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue, selectedCompany?.currency)} sub="Weighted funnel total" icon="bi bi-currency-dollar" />
          <StatCard label="Qualified Leads" value={qualifiedLeads.length} sub="Ready for proposal stage" icon="bi bi-star" accent />
          <StatCard label="Deals Won" value={wonLeads.length} sub={`${formatCurrency(wonLeads.reduce((s, l) => s + l.value, 0), selectedCompany?.currency)} closed`} icon="bi bi-trophy" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <DoughnutChart
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
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Pipeline Deals</h3>
            <button onClick={() => onNavigateView('crm')} className="text-[11px] fw-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
              Open CRM Board <i className="bi bi-arrow-right text-[10px]"></i>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Company</th>
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Contact</th>
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400 text-right">Value</th>
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Score</th>
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Stage</th>
                  <th className="px-5 py-2.5 text-[10px] fw-bold uppercase tracking-wider text-slate-400">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...localLeads]
                  .sort((a, b) => (b.aiLeadScore ?? 0) - (a.aiLeadScore ?? 0))
                  .slice(0, 10)
                  .map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3 fs-xs fw-semibold text-slate-900">{l.companyName}</td>
                    <td className="px-5 py-3 text-[11px] text-slate-600">{l.firstName} {l.lastName}</td>
                    <td className="px-5 py-3 text-[11px] font-sans tabular-nums fw-semibold text-slate-900 text-right">${l.value.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] fw-bold px-2 py-0.5 rounded-full ${(l.aiLeadScore ?? 0) >= 80 ? 'bg-emerald-50 text-emerald-700' : (l.aiLeadScore ?? 0) >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {l.aiLeadScore ?? '—'}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] fw-bold px-2 py-0.5 rounded-full ${
                        l.status === 'Won' ? 'bg-emerald-50 text-emerald-700' :
                        l.status === 'Qualified' ? 'bg-blue-50 text-blue-700' :
                        l.status === 'Proposal Sent' ? 'bg-violet-50 text-violet-700' :
                        l.status === 'Lost' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>{l.status}</span>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-500">{l.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {localLeads.length === 0 && (
            <p className="text-center py-8 fs-xs text-slate-400">No leads in pipeline. Add leads via the CRM board.</p>
          )}
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
              <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Inventory &amp; Stock Control</h1>
              <p className="fs-sm text-slate-500 mt-0.5">Real-time inventory levels, warehouse transfers, procurement and stock valuation.</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 fs-3xl mb-3 block"></i>
            <h3 className="fs-sm fw-semibold text-amber-800 mb-2">Inventory Module Not Available</h3>
            <p className="fs-xs text-amber-600">Your company has not subscribed to the Operations/Inventory module. Contact your administrator to enable inventory features.</p>
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
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Inventory &amp; Stock Control</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Monitor safety thresholds, warehouse stock, replenishment orders and barcode tracking.</p>
          </div>
          <button onClick={() => onNavigateView('inventory')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
            <i className="bi bi-plus-lg fs-xs"></i> Adjust Stock
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Stock Valuation" value={formatCurrency(totalValue, selectedCompany?.currency)} sub="Total warehoused asset capital" icon="bi bi-currency-dollar" />
          <StatCard label="SKU Count" value={localStock.length} sub="Distinct products tracked" icon="bi bi-box-seam" />
          <StatCard label="Low Stock Alerts" value={lowStock.length} sub="Below minimum threshold" icon="bi bi-exclamation-triangle" accent />
          <StatCard label="Warehouses" value={[...new Set(localStock.map(i => i.warehouse))].length} sub="Active storage locations" icon="bi bi-building" />
        </div>

        {/* Charts Row — Pie Chart + Bar Graph */}
        <AnalyticsRow
          pie={
            <DoughnutChart
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
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-amber-500"></i> Low Stock Alerts
            </h3>
            <span className="text-[10px] text-slate-400 font-sans">{lowStock.length} items flagged</span>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40">
                <div>
                  <div className="fs-xs fw-semibold text-slate-900">{item.name} <span className="font-mono fw-normal text-slate-400 text-[10px]">({item.sku})</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Warehouse: <span className="fw-medium text-slate-700">{item.warehouse}</span> ·
                    Stock: <span className="font-sans tabular-nums fw-bold text-rose-600"> {item.stockLevel}</span> /
                    Min: <span className="font-sans tabular-nums text-slate-600"> {item.minStockLevel}</span>
                  </div>
                </div>
                <button onClick={() => onAdjustStock(item.id, 100)} className="text-[10px] fw-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shrink-0 ml-4">
                  Receive +100
                </button>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="text-center py-8 fs-xs text-slate-400">All stock levels are within safe thresholds.</p>
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
      <><div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">
                Employee Self Service (ESS)
              </span>
            </div>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Welcome back, {selectedUser.name}!</h1>
            <p className="fs-sm text-slate-500 mt-0.5">{designation} · {department}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onNavigateView('hr-leave')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-3.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">
              <i className="bi bi-calendar-check fs-xs"></i> Request Leave
            </button>
            <button onClick={() => onNavigateView('payroll-slips')} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all">
              <i className="bi bi-receipt-cutoff fs-xs"></i> View Payslips
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Leave Balance" value={`${25 - leaves.filter(l => l.employeeId === empRecord?.id && l.status === 'Approved').reduce((s, l) => s + l.days, 0)} Days`} sub="Annual leave remaining" icon="bi bi-calendar-range" />
          <StatCard label="Clock-In Status" value={(() => { const today = new Date().toISOString().split('T')[0]; const rec = attendance.find(a => a.employeeId === empRecord?.id && a.date === today); return rec?.checkIn || 'Not clocked in'; })()} sub={(() => { const today = new Date().toISOString().split('T')[0]; const rec = attendance.find(a => a.employeeId === empRecord?.id && a.date === today); return rec?.checkOut ? `Clocked out at ${rec.checkOut}` : 'Clocked in today'; })()} icon="bi bi-clock-history" accent />
          <StatCard label="Active OKRs / Tasks" value={`${okrs.filter(o => o.employeeId === empRecord?.id && o.status !== 'Completed').length} Active`} sub="Performance cycle" icon="bi bi-graph-up" />
        </div>

        {/* Dashboard Widgets */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Active Tasks */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">My Active Tasks</h3>
              <div className="text-[10px] fw-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                Utilisation: {empRecord?.utilisation || 0}%
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {projectTasks.filter(t => t.companyId === selectedCompany.id && (t.assignee === empRecord?.id || t.assigneeName === `${empRecord?.firstName} ${empRecord?.lastName}`) && t.status !== 'Done').map(t => (
                <div key={t.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="fs-xs fw-bold text-slate-900">{t.title}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] fw-bold ${t.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : t.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{t.priority}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <div><i className="bi bi-clock"></i> Due: {t.due || 'No date'}</div>
                    <div className="fw-semibold text-slate-700">{t.status}</div>
                  </div>
                </div>
              ))}
              {projectTasks.filter(t => t.companyId === selectedCompany.id && (t.assignee === empRecord?.id || t.assigneeName === `${empRecord?.firstName} ${empRecord?.lastName}`) && t.status !== 'Done').length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/50 rounded-lg border border-slate-100">
                  <i className="bi bi-clipboard2-check text-slate-300 text-xl block mb-2"></i>
                  No active tasks assigned to you right now.
                </div>
              )}
            </div>
          </div>

          {/* My OKRs */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col h-full">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">My Objectives (OKRs)</h3>
            <div className="space-y-3 flex-1">
              {okrs.filter(o => o.employeeId === empRecord?.id && o.status !== 'Completed').map(o => (
                <div key={o.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg">
                  <div className="fs-xs fw-bold text-slate-900 mb-1">{o.objective}</div>
                  <div className="text-[10px] text-slate-500 mb-2">{o.keyResult}</div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${o.progress}%` }}></div>
                    </div>
                    <span className="fw-bold text-slate-700">{o.progress}%</span>
                  </div>
                </div>
              ))}
              {okrs.filter(o => o.employeeId === empRecord?.id && o.status !== 'Completed').length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/50 rounded-lg border border-slate-100">
                  <i className="bi bi-target text-slate-300 text-xl block mb-2"></i>
                  No active OKRs assigned to you right now.
                </div>
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Recent Announcements</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.filter(a => a.companyId === selectedCompany.id && a.targetAudience !== 'External').slice(0, 3).map(a => (
                <div key={a.id} className="p-4 border border-slate-100 bg-white rounded-xl shadow-xs relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${a.type === 'Important' ? 'bg-rose-500' : a.type === 'Event' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] fw-bold px-2 py-0.5 rounded-full ${a.type === 'Important' ? 'bg-rose-50 text-rose-600' : a.type === 'Event' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{a.type}</span>
                    <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="fs-sm fw-bold text-slate-900 mb-1">{a.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                </div>
              ))}
              {announcements.filter(a => a.companyId === selectedCompany.id && a.targetAudience !== 'External').length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-400 text-xs italic bg-slate-50/50 rounded-lg border border-slate-100">
                  <i className="bi bi-megaphone text-slate-300 text-xl block mb-2"></i>
                  No recent announcements.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Row: My Profile */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">My Employment Profile</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Personal details, contact info, and emergency contacts. Changes require HR approval.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isProfileEditing && (
                <button onClick={() => setIsProfileEditing(false)} className="fs-xs fw-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
              )}
              <button
                onClick={() => {
                  if (isProfileEditing) {
                    // Submit changes for approval
                    const changes: { field: string; label: string; currentValue: string; newValue: string }[] = [];
                    const fieldDefs: Record<string, { label: string; current: string }> = {
                      phone: { label: 'Phone Number', current: empRecord?.phone || '' },
                      dateOfBirth: { label: 'Date of Birth', current: empRecord?.dateOfBirth || '' },
                      gender: { label: 'Gender', current: empRecord?.gender || '' },
                      maritalStatus: { label: 'Marital Status', current: empRecord?.maritalStatus || '' },
                      nationality: { label: 'Nationality', current: empRecord?.nationality || '' },
                      address: { label: 'Address', current: empRecord?.address || '' },
                      city: { label: 'City', current: empRecord?.city || '' },
                      state: { label: 'State/Province', current: empRecord?.state || '' },
                      country: { label: 'Country', current: empRecord?.country || '' },
                      postalCode: { label: 'Postal Code', current: empRecord?.postalCode || '' },
                      emergencyContactName: { label: 'Emergency Contact Name', current: empRecord?.emergencyContactName || '' },
                      emergencyContactPhone: { label: 'Emergency Contact Phone', current: empRecord?.emergencyContactPhone || '' },
                      emergencyContactRelation: { label: 'Emergency Contact Relation', current: empRecord?.emergencyContactRelation || '' },
                      workLocation: { label: 'Work Location', current: empRecord?.workLocation || '' },
                      bio: { label: 'Bio/About', current: empRecord?.bio || '' },
                    };
                    Object.entries(profileForm).forEach(([field, newVal]) => {
                      const def = fieldDefs[field];
                      if (def && newVal !== def.current) {
                        changes.push({ field, label: def.label, currentValue: def.current, newValue: newVal });
                      }
                    });
                    if (changes.length === 0) { setIsProfileEditing(false); return; }
                    changes.forEach(c => {
                      onSubmitProfileUpdate?.({
                        companyId: selectedCompany.id,
                        employeeId: empRecord?.id || '',
                        employeeName: `${empRecord?.firstName || ''} ${empRecord?.lastName || ''}`.trim() || selectedUser.name,
                        department: empRecord?.department || '',
                        ...c,
                      });
                    });
                    setIsProfileEditing(false);
                  } else {
                    // Enter edit mode
                    setProfileForm({
                      phone: empRecord?.phone || '',
                      dateOfBirth: empRecord?.dateOfBirth || '',
                      gender: empRecord?.gender || '',
                      maritalStatus: empRecord?.maritalStatus || '',
                      nationality: empRecord?.nationality || '',
                      address: empRecord?.address || '',
                      city: empRecord?.city || '',
                      state: empRecord?.state || '',
                      country: empRecord?.country || '',
                      postalCode: empRecord?.postalCode || '',
                      emergencyContactName: empRecord?.emergencyContactName || '',
                      emergencyContactPhone: empRecord?.emergencyContactPhone || '',
                      emergencyContactRelation: empRecord?.emergencyContactRelation || '',
                      employmentType: empRecord?.employmentType || '',
                      workLocation: empRecord?.workLocation || '',
                      bio: empRecord?.bio || '',
                    });
                    setIsProfileEditing(true);
                  }
                }}
                className={`fs-xs fw-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${isProfileEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                <i className={`bi ${isProfileEditing ? 'bi-check-lg' : 'bi-pencil-square'} mr-1`}></i>
                {isProfileEditing ? 'Submit for Approval' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <div className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider mb-2">Basic Information</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Employee ID', value: empRecord?.employeeNumber || '—', editable: false },
                  { label: 'Full Name', value: `${empRecord?.firstName || ''} ${empRecord?.lastName || ''}`.trim() || '—', editable: false },
                  { label: 'Email', value: selectedUser.email, editable: false },
                  { label: 'Designation', value: designation, editable: false },
                  { label: 'Department', value: department, editable: false },
                  { label: 'Joining Date', value: empRecord ? new Date(empRecord.joiningDate).toLocaleDateString() : '—', editable: false },
                  { label: 'Employment Type', value: empRecord?.employmentType || '—', editable: false },
                  { label: 'Reporting Location', value: empRecord?.branch || '—', editable: false },
                ].map(f => (
                  <div key={f.label} className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[9px] text-slate-400 fw-medium uppercase tracking-wide">{f.label}</div>
                    <div className="fs-xs fw-semibold text-slate-800 mt-0.5">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {isProfileEditing && (
            <>
            {/* Editable Personal Info */}
            <div>
              <div className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider mb-2">Personal Details</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890', icon: 'bi-telephone' },
                  { key: 'dateOfBirth', label: 'Date of Birth', placeholder: 'YYYY-MM-DD', icon: 'bi-calendar', type: 'date' },
                  { key: 'gender', label: 'Gender', placeholder: 'Male / Female / Other', icon: 'bi-person' },
                  { key: 'maritalStatus', label: 'Marital Status', placeholder: 'Single / Married / Divorced', icon: 'bi-heart' },
                  { key: 'nationality', label: 'Nationality', placeholder: 'e.g. Nigerian', icon: 'bi-globe' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] fw-medium text-slate-500 mb-1">{f.label}</label>
                    {isProfileEditing ? (
                      <input
                        type={f.type || 'text'}
                        value={(profileForm as any)[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 fs-xs fw-semibold text-slate-800">
                        {(empRecord as any)?.[f.key] || <span className="text-slate-300 fw-normal italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider mb-2">Address</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: 'address', label: 'Street Address', placeholder: '123 Main St' },
                  { key: 'city', label: 'City', placeholder: 'Lagos' },
                  { key: 'state', label: 'State / Province', placeholder: 'Lagos State' },
                  { key: 'country', label: 'Country', placeholder: 'Nigeria' },
                  { key: 'postalCode', label: 'Postal Code', placeholder: '100001' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] fw-medium text-slate-500 mb-1">{f.label}</label>
                    {isProfileEditing ? (
                      <input
                        type="text"
                        value={(profileForm as any)[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 fs-xs fw-semibold text-slate-800">
                        {(empRecord as any)?.[f.key] || <span className="text-slate-300 fw-normal italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <div className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: 'emergencyContactName', label: 'Contact Name', placeholder: 'Jane Doe' },
                  { key: 'emergencyContactPhone', label: 'Contact Phone', placeholder: '+1 234 567 890' },
                  { key: 'emergencyContactRelation', label: 'Relationship', placeholder: 'Spouse / Parent / Sibling' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] fw-medium text-slate-500 mb-1">{f.label}</label>
                    {isProfileEditing ? (
                      <input
                        type="text"
                        value={(profileForm as any)[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 fs-xs fw-semibold text-slate-800">
                        {(empRecord as any)?.[f.key] || <span className="text-slate-300 fw-normal italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Work Preferences */}
            <div>
              <div className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider mb-2">Work Preferences</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] fw-medium text-slate-500 mb-1">Work Location</label>
                  {isProfileEditing ? (
                    <select
                      value={profileForm.workLocation}
                      onChange={e => setProfileForm(p => ({ ...p, workLocation: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="">Select...</option>
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  ) : (
                    <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 fs-xs fw-semibold text-slate-800">
                      {empRecord?.workLocation || <span className="text-slate-300 fw-normal italic">Not set</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] fw-medium text-slate-500 mb-1">Bio / About</label>
                  {isProfileEditing ? (
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
                      placeholder="A brief description about yourself..."
                    />
                  ) : (
                    <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 fs-xs fw-semibold text-slate-800 min-h-[60px]">
                      {empRecord?.bio || <span className="text-slate-300 fw-normal italic">Not set</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </>
            )}
          </div>

          {/* Pending Requests */}
          {profileUpdateRequests && profileUpdateRequests.filter(r => r.employeeId === empRecord?.id && r.status === 'Pending').length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <i className="bi bi-clock-history text-amber-600"></i>
                <span className="fs-xs fw-bold text-amber-800">Pending Changes ({profileUpdateRequests.filter(r => r.employeeId === empRecord?.id && r.status === 'Pending').length})</span>
              </div>
              <div className="space-y-1">
                {profileUpdateRequests.filter(r => r.employeeId === empRecord?.id && r.status === 'Pending').map(r => (
                  <div key={r.id} className="flex items-center justify-between text-[10px] text-amber-700">
                    <span>{r.label}: "{r.currentValue || '(empty)'}" → "{r.newValue}"</span>
                    <span className="text-amber-500">Awaiting HR</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Org Chart */}
        <OrgChart employees={employees} departments={departments} companyId={selectedCompany.id} compact />
      </div>
      {isUpdateBankModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="fs-base fw-semibold text-slate-800">Update Bank Account</h3>
              <button onClick={() => setIsUpdateBankModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block fs-xs fw-medium text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankUpdateForm.bankName}
                  onChange={e => setBankUpdateForm(f => ({ ...f, bankName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. Chase Bank"
                />
              </div>
              <div>
                <label className="block fs-xs fw-medium text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={bankUpdateForm.accountName}
                  onChange={e => setBankUpdateForm(f => ({ ...f, accountName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block fs-xs fw-medium text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankUpdateForm.accountNumber}
                  onChange={e => setBankUpdateForm(f => ({ ...f, accountNumber: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. 123456789"
                />
              </div>
              <div>
                <label className="block fs-xs fw-medium text-slate-700 mb-1">Sort Code / Routing Number (Optional)</label>
                <input
                  type="text"
                  value={bankUpdateForm.sortCode}
                  onChange={e => setBankUpdateForm(f => ({ ...f, sortCode: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. 12-34-56"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsUpdateBankModalOpen(false)} className="px-4 py-2 fs-sm fw-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  if (!bankUpdateForm.bankName || !bankUpdateForm.accountName || !bankUpdateForm.accountNumber) return;
                  onRequestBankAccountUpdate?.({
                    companyId: selectedCompany.id,
                    employeeId: empRecord?.id || '',
                    employeeName: empRecord ? `${empRecord.firstName} ${empRecord.lastName}` : selectedUser.name,
                    bankName: bankUpdateForm.bankName,
                    accountName: bankUpdateForm.accountName,
                    accountNumber: bankUpdateForm.accountNumber,
                    sortCode: bankUpdateForm.sortCode
                  });
                  setIsUpdateBankModalOpen(false);
                }}
                disabled={!bankUpdateForm.bankName || !bankUpdateForm.accountName || !bankUpdateForm.accountNumber}
                className="px-4 py-2 fs-sm fw-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SUPPORT / HELP DESK DASHBOARD — Support Agent
  // ════════════════════════════════════════════════════════════════════════════
  if (role === 'Support Agent' || (role && role.trim().toLowerCase() === 'help desk admin')) {
    return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="fs-xl fw-bold tracking-tight text-slate-900">Services Dashboard</h1>
          <p className="fs-sm text-slate-500 mt-0.5">Support tickets, project milestones, and notifications centre for your role.</p>
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
            <DoughnutChart
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
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Help Desk Queue</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {localTickets.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
              <div>
                <div className="fs-xs fw-semibold text-slate-900">{t.customerName} <span className="font-mono fw-normal text-slate-400 text-[10px]">({t.ticketNumber})</span></div>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.subject}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} />
                <div className="text-[10px] text-slate-400 font-sans fw-semibold uppercase mt-1 tracking-wider">{t.status}</div>
              </div>
            </div>
          ))}
          {localTickets.length === 0 && (
            <p className="text-center py-8 fs-xs text-slate-400">Support queue is completely clear!</p>
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
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">HR Department Head</span>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">HR Command Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Manage employees, payroll, compliance and leave approvals.</p>
          </div>
          <button onClick={() => onNavigateView('hr')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-people fs-xs"></i> My Team</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="HR Headcount" value={hrEmployees.length} sub="In HR department" icon="bi bi-people" />
          <StatCard label="Pending Leaves" value={pendingLeaves.length} sub="Awaiting your approval" icon="bi bi-calendar-check" accent />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} sub="Help desk queue" icon="bi bi-ticket" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
            <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Leave Approvals</h3>
            <div className="space-y-3">
              {pendingLeaves.length === 0 && <div className="fs-xs text-slate-400 italic">No pending requests</div>}
              {pendingLeaves.map(req => { const emp = localEmployees.find(e => e.id === req.employeeId); return (<div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-amber-50/30"><div className="flex items-start justify-between gap-3"><div><div className="fs-xs fw-bold text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</div><div className="text-[11px] text-slate-500 mt-0.5">{req.leaveType} · {req.startDate}</div></div><div className="flex gap-1.5 shrink-0"><button onClick={() => onApproveLeave(req.id)} className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] fw-semibold px-3 py-1.5 rounded-lg cursor-pointer">Approve</button><button onClick={() => onRejectLeave(req.id)} className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-[10px] fw-semibold px-3 py-1.5 rounded-lg cursor-pointer">Decline</button></div></div></div>);})}
            </div>
          </div>
          <DoughnutChart
            title="Team by Department"
            data={([...new Set(localEmployees.map(e => e.department))] as string[]).map((d, i) => ({
              label: d,
              value: localEmployees.filter(e => e.department === d).length,
              color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))}
          />
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
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">Sales Department Head</span>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">Sales Command Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Pipeline, sales orders and POS management.</p>
          </div>
          <button onClick={() => onNavigateView('crm')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-funnel fs-xs"></i> Pipeline</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open Leads" value={openLeads.length} sub="In pipeline" icon="bi bi-funnel" />
          <StatCard label="Total Leads" value={salesLeads.length} sub="All time" icon="bi bi-graph-up" accent />
          <StatCard label="Sales Orders" value={localInvoices.length} sub="All invoices" icon="bi bi-receipt" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
        </div>
        
        {/* Charts Row */}
        <AnalyticsRow
          pie={
            <DoughnutChart
              title="Leads by Stage"
              data={['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((s, i) => ({
                label: s,
                value: salesLeads.filter(l => l.status === s).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Leads by Source"
              data={([...new Set(salesLeads.map(l => l.source))] as string[]).map((s, i) => ({
                label: s,
                value: salesLeads.filter(l => l.source === s).length,
                color: CHART_PALETTE[i % CHART_PALETTE.length],
              }))}
            />
          }
        />
        
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
            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">Finance Department Head</span>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">Finance Command Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">General ledger, invoices, payroll and bank reconciliation.</p>
          </div>
          <button onClick={() => onNavigateView('accounting')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-journal-bookmark fs-xs"></i> General Ledger</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open Invoices" value={unpaid.length} sub={`${formatCurrency(unpaid.reduce((s, i) => s + i.total, 0), selectedCompany?.currency)} outstanding`} icon="bi bi-receipt" />
          <StatCard label="GL Accounts" value={localGL.length} sub="Chart of accounts" icon="bi bi-journal-text" accent />
          <StatCard label="Expenses" value={expenses.filter(e => e.companyId === selectedCompany.id).length} sub="Recorded expenses" icon="bi bi-credit-card" />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
        </div>
        
        {/* Charts Row */}
        <AnalyticsRow
          pie={
            <DoughnutChart
              title="Invoices by Status"
              data={['Draft', 'Sent', 'Overdue', 'Paid', 'Void'].map((s, i) => ({
                label: s,
                value: localInvoices.filter(inv => inv.status === s).length,
                color: CHART_PALETTE[i],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Expenses by Category"
              data={([...new Set(expenses.filter(e => e.companyId === selectedCompany.id).map(e => e.category))] as string[]).map((c, i) => ({
                label: c,
                value: expenses.filter(e => e.category === c && e.companyId === selectedCompany.id).length,
                color: CHART_PALETTE[i % CHART_PALETTE.length],
              }))}
            />
          }
        />
        
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
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">Operations Department Head</span>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">Operations Command Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">Projects, inventory, procurement and manufacturing.</p>
          </div>
          <button onClick={() => onNavigateView('project')} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"><i className="bi bi-columns-gap fs-xs"></i> Kanban Board</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Inventory Items" value={localStock.length} sub="Tracked items" icon="bi bi-box-seam" />
          <StatCard label="Employees" value={localEmployees.length} sub="Company headcount" icon="bi bi-people" accent />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} sub="Help desk queue" icon="bi bi-ticket" />
        </div>
        
        {/* Charts Row */}
        <AnalyticsRow
          pie={
            <DoughnutChart
              title="Stock by Warehouse"
              data={([...new Set(localStock.map(i => i.warehouse))] as string[]).map((w, i) => ({
                label: w,
                value: localStock.filter(i => i.warehouse === w).length,
                color: CHART_PALETTE[i % CHART_PALETTE.length],
              }))}
            />
          }
          bar={
            <BarGraph
              title="Inventory by Category"
              data={([...new Set(localStock.map(i => i.category))] as string[]).map((c, i) => ({
                label: c,
                value: localStock.filter(i => i.category === c).length,
                color: CHART_PALETTE[i % CHART_PALETTE.length],
              }))}
            />
          }
        />
        
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
            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">IT Department Head</span>
            <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">IT Command Center</h1>
            <p className="fs-sm text-slate-500 mt-0.5">User management, help desk and POS administration.</p>
          </div>

        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={localEmployees.length} sub="Company users" icon="bi bi-people-gear" />
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length} sub="Help desk queue" icon="bi bi-ticket" accent />
          <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
          <StatCard label="Audit Logs" value={localLogs.length} sub="System events" icon="bi bi-journal-text" />
        </div>
        
        {/* Charts Row */}
        <AnalyticsRow
          pie={
            <DoughnutChart
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
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] fw-bold uppercase tracking-wider">
            {role}
          </span>
          <h1 className="fs-xl fw-bold tracking-tight text-slate-900 mt-1">Business Overview</h1>
          <p className="fs-sm text-slate-500 mt-0.5">Key metrics and quick access for your role at {selectedCompany.name}.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees" value={localEmployees.length} sub={`${departments.length} departments`} icon="bi bi-people" />
        <StatCard label="Open Invoices" value={localInvoices.filter(i => i.status !== 'Paid').length} sub={`${formatCurrency(localInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0), selectedCompany?.currency)} outstanding`} icon="bi bi-receipt" accent />
        <StatCard label="Open Tickets" value={localTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length} sub="Awaiting resolution" icon="bi bi-ticket" />
        <StatCard label="Active Modules" value={selectedCompany.activeModules.length} sub={`of ${Object.keys(MODULE_CATALOG).length} available`} icon="bi bi-box-seam" />
      </div>

      {shortcuts.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Your Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map(sc => (
              <button key={sc.view} onClick={() => onNavigateView(sc.view)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 fs-xs fw-semibold transition-all cursor-pointer text-left">
                <span className="flex flex-wrap items-center gap-2"><i className={`${sc.icon} text-slate-400`}></i>{sc.label}</span>
                <i className="bi bi-chevron-right text-[10px] text-slate-400"></i>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};





