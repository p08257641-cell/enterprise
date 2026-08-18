import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

export const ApiKeysView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localAPIKeys = (apiKeys || []).filter(k => k.companyId === selectedCompany.id);
  const [keyName, setKeyName] = useState(''); const [keyPerms, setKeyPerms] = useState<'Read Only' | 'Full Access'>('Read Only');
  const [keySuccess, setKeySuccess] = useState(false);

  if (activeView === 'apikeys') {
    return (
      <div>
        <PageHeader title="API Keys & Integrations" subtitle="Generate and manage API credentials, third-party integrations and webhook endpoints." />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {localAPIKeys.map(k => (
              <div key={k.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="fs-xs fw-bold text-slate-900">{k.name}</div>
                    <div className="fs-2xs text-slate-400 mt-0.5">Created: {new Date(k.createdAt).toLocaleDateString()} · Expires: {new Date(k.expiresAt).toLocaleDateString()}</div>
                  </div>
                  <Badge label={k.permissions} variant={k.permissions === 'Full Access' ? 'danger' : 'info'} />
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="fs-2xs font-mono text-slate-600 flex-1 truncate">{k.key}</span>
                   <button onClick={() => { navigator.clipboard.writeText(k.key); }} className="fs-2xs fw-semibold text-slate-500 hover:text-slate-900 cursor-pointer shrink-0">Copy</button>
                </div>
              </div>
            ))}
            {localAPIKeys.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center"><p className="fs-xs text-slate-400">No API keys generated yet.</p></div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="section-title text-slate-500 mb-5">Generate New API Key</h3>
            {keySuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg fs-xs text-emerald-700 fw-semibold">API key generated!</div>}
            <div className="space-y-4">
              <div><Label>Key Name</Label><Input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="My Integration Key" /></div>
              <div><Label>Permissions</Label><Select value={keyPerms} onChange={e => setKeyPerms(e.target.value as typeof keyPerms)}><option>Read Only</option><option>Full Access</option></Select></div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg data-value text-amber-700"><i className="bi bi-exclamation-triangle mr-1"></i>Full Access keys can modify all company data. Use with caution.</div>
              <PrimaryBtn icon="bi bi-key" onClick={() => {
                if (!keyName) return;
                onGenerateAPIKey(keyName, keyPerms);
                setKeySuccess(true); setKeyName('');
                setTimeout(() => setKeySuccess(false), 3000);
              }}>Generate Key</PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
