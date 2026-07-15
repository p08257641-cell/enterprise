import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

export const DashboardView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const localTickets = tickets.filter(t => t.companyId === selectedCompany.id);

  const activeEmployees = localEmployees.filter(e => e.status === 'Active');
  const onLeave = localEmployees.filter(e => e.status === 'On Leave');
  const openInvoices = localInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
  const openTickets = localTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');

  const departments = [...new Set(localEmployees.map(e => e.department))];
  const branches = [...new Set(localEmployees.map(e => e.branch))];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Company overview and key metrics." />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Employees" value={localEmployees.length} sub={`${activeEmployees.length} active · ${onLeave.length} on leave`} icon="bi bi-people" />
        <StatCard label="Departments" value={departments.length} sub={`${branches.length} branch locations`} icon="bi bi-diagram-3" />
        <StatCard label="Open Invoices" value={openInvoices.length} sub={`$${openInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} icon="bi bi-file-earmark-text" accent />
        <StatCard label="Support Tickets" value={openTickets.length} sub={`${localTickets.filter(t => t.priority === 'Critical').length} critical priority`} icon="bi bi-ticket" />
      </div>

      {/* Company Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Company Overview</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl">{selectedCompany.logo}</div>
            <div>
              <div className="text-xl font-bold text-slate-900">{selectedCompany.name}</div>
              <div className="text-sm text-slate-500 font-sans tabular-nums">{selectedCompany.domain}</div>
              <div className="text-sm text-slate-400 mt-0.5">{selectedCompany.industry}</div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400">Billing Plan</div>
              <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.billingPlan}</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400">Active Modules</div>
              <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.activeModules.length} / 21</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-sm text-slate-800 mt-1 font-semibold">{selectedCompany.billingStatus}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Workforce Distribution</h3>
          <div className="flex items-center justify-center gap-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {departments.slice(0, 5).map((dept, index) => {
                  const deptEmployees = localEmployees.filter(e => e.department === dept);
                  const totalEmployees = localEmployees.length;
                  const percentage = (deptEmployees.length / totalEmployees) * 100;
                  const colors = ['#0f172a', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
                  const offset = index === 0 ? 0 : departments.slice(0, index).reduce<number>((sum, d) => {
                    const employees = localEmployees.filter(e => e.department === d);
                    return sum + (employees.length / totalEmployees) * 100;
                  }, 0);
                  return (
                    <circle
                      key={dept}
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="transparent"
                      stroke={colors[index]}
                      strokeWidth="3"
                      strokeDasharray={`${percentage} ${100 - percentage}`}
                      strokeDashoffset={25 - offset}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="space-y-2">
              {departments.slice(0, 5).map((dept, index) => {
                const deptEmployees = localEmployees.filter(e => e.department === dept);
                const colors = ['#0f172a', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
                return (
                  <div key={dept} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index] }}></span>
                    <span className="text-sm text-slate-800 font-medium">{dept}</span>
                    <span className="text-sm text-slate-500">({deptEmployees.length})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
