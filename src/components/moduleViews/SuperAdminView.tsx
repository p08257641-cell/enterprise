import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

export const SuperAdminView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  if (activeView === 'superadmin')

    // ══════════════════════════════════════════════════════════════════════════
    // 20. SUPER ADMIN CONSOLE
    // ══════════════════════════════════════════════════════════════════════════
    if (activeView === 'superadmin') {
      if (selectedUser.activeRole !== 'Super Admin') {
        return (
          <div className="flex flex-col items-center justify-center py-24">
            <i className="bi bi-shield-exclamation text-4xl text-rose-400 mb-4"></i>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
            <p className="text-sm text-slate-500">This console is reserved for Super Administrators only.</p>
          </div>
        );
      }
      return (
        <div>
          <div className="flex items-start justify-between pb-5 border-b border-slate-200 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  System Administrator Console
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform System Console</h1>
              <p className="text-sm text-slate-500 mt-0.5">Global infrastructure controls, tenant management, billing operations and platform configuration.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Server Health */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Infrastructure Health</h3>
              <div className="space-y-3">
                {[
                  { service: 'API Server (Express.js)', status: 'Operational', uptime: '99.99%' },
                  { service: 'Primary Database', status: 'Healthy', uptime: '99.97%' },
                  { service: 'Redis Cache Layer', status: 'Operational', uptime: '100%' },
                  { service: 'File Storage (S3)', status: '62% Capacity', uptime: '100%' },
                  { service: 'Email / SMTP Relay', status: 'Operational', uptime: '99.8%' },
                  { service: 'Job Queue (BullMQ)', status: 'Running', uptime: '99.9%' },
                  { service: 'SSL Certificates', status: 'Valid – 180d', uptime: '—' },
                ].map(s => (
                  <div key={s.service} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="data-value text-slate-700">{s.service}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{s.status}
                      </span>
                      <span className="data-value-small font-sans tabular-nums text-slate-400">{s.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Global Audit Stream</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex justify-between items-baseline">
                      <span className="data-value font-semibold text-slate-800">{log.userName}</span>
                      <span className="data-value-small font-sans tabular-nums text-slate-400 shrink-0 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{log.details}</p>
                    <span className="mt-1 inline-block data-value-small bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans tabular-nums uppercase">{log.module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Config */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-5 text-white">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Platform Configuration</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Platform Version', val: 'v4.2.1 (stable)' },
                    { label: 'Environment', val: 'Production' },
                    { label: 'Node.js Runtime', val: 'v24.15.0' },
                    { label: 'Database Engine', val: 'PostgreSQL 16' },
                    { label: 'Region', val: 'US-East-1' },
                    { label: 'Max Tenants', val: 'Unlimited' },
                  ].map(c => (
                    <div key={c.label} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                      <span className="text-slate-400">{c.label}</span>
                      <span className="font-sans tabular-nums text-slate-200">{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Force Cache Clear', icon: 'bi bi-trash', danger: false },
                    { label: 'Download Audit Export', icon: 'bi bi-download', danger: false },
                    { label: 'Send Platform Notice', icon: 'bi bi-megaphone', danger: false },
                    { label: 'Emergency Maintenance Mode', icon: 'bi bi-exclamation-triangle', danger: true },
                  ].map(a => (
                    <button key={a.label} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${a.danger ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                      <i className={`${a.icon} text-sm`}></i>{a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  return null;
};
