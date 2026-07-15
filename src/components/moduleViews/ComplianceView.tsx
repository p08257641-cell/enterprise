import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole } from '../../permissions';

export const ComplianceView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);

  type CompTab = 'checklists' | 'policies' | 'incidents';
  const compTabFromView = (): CompTab =>
    activeView === 'comp-policies' ? 'policies'
      : activeView === 'comp-incidents' ? 'incidents'
        : 'checklists';
  const [compTab, setCompTab] = useState<CompTab>(compTabFromView());
  useEffect(() => { setCompTab(compTabFromView()); }, [activeView]);
  const compTabs: { id: CompTab; label: string }[] = [
    { id: 'checklists', label: 'Risk Checklists' },
    { id: 'policies', label: 'Policy Library' },
    { id: 'incidents', label: 'Incidents' },
  ];
  const [checks, setChecks] = useState<Record<string, boolean>>({
    'GDPR Data Processing Compliant': true, 'ISO 9001 Audit Passed': false,
    'SOX Financial Controls Active': true, 'OSHA Safety Inspections Current': false,
    'Cybersecurity Policy Updated': true, 'Employee Data Backup Verified': false,
  });
  const [incidents] = useState([
    { id: 'INC-001', title: 'Unauthorized Data Access Attempt', severity: 'High', date: '2026-07-05', status: 'Under Review' },
    { id: 'INC-002', title: 'Equipment Malfunction – Line B', severity: 'Medium', date: '2026-07-08', status: 'Resolved' },
  ]);

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  return (
    <div>
      <PageHeader title="Compliance & Risk Management" subtitle="Track regulatory requirements, maintain policy library and log compliance incidents." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {compTabs.map(t => (
          <button key={t.id} onClick={() => setCompTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${compTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Overall Score" value={`${Math.round((passed / total) * 100)}%`} icon="bi bi-shield-check" sub={`${passed}/${total} requirements met`} />
        <StatCard label="Passed Checks" value={passed} icon="bi bi-check-circle" sub="Compliant controls" color="text-emerald-600" />
        <StatCard label="Failed Checks" value={total - passed} icon="bi bi-x-circle" sub="Requires attention" accent />
        <StatCard label="Open Incidents" value={incidents.filter(i => i.status !== 'Resolved').length} icon="bi bi-exclamation-triangle" sub="Under investigation" />
      </div>
      {compTab === 'checklists' && (
        <div className="space-y-2">
          {Object.entries(checks).map(([label, done]) => (
            <div key={label} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${done ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/20 border-rose-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <i className={`${done ? 'bi bi-check-circle-fill text-emerald-600' : 'bi bi-x-circle-fill text-rose-500'} text-sm`}></i>
                </div>
                <span className="text-xs font-semibold text-slate-900">{label}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setChecks(prev => ({ ...prev, [label]: !prev[label] }))}
                  className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${done ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {done ? 'Mark Fail' : 'Mark Pass'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {compTab === 'policies' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Data Protection & GDPR Policy', version: 'v3.2', updated: '2026-06-01', owner: 'Legal' },
            { title: 'Information Security Policy', version: 'v2.1', updated: '2026-05-15', owner: 'IT' },
            { title: 'Health & Safety Policy (OSHA)', version: 'v4.0', updated: '2026-04-20', owner: 'Operations' },
            { title: 'Anti-Bribery & Corruption Policy', version: 'v1.3', updated: '2026-03-10', owner: 'Legal' },
            { title: 'Remote Work Policy', version: 'v2.0', updated: '2026-07-01', owner: 'HR' },
            { title: 'Business Continuity Plan', version: 'v1.5', updated: '2026-02-28', owner: 'Executive' },
          ].map(p => (
            <div key={p.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-start justify-between">
              <div><div className="text-xs font-semibold text-slate-900">{p.title}</div><div className="text-[10px] text-slate-400 mt-1">{p.version} · Updated {p.updated} · Owner: {p.owner}</div></div>
              <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-2 py-1 rounded-lg ml-3 shrink-0">View</button>
            </div>
          ))}
        </div>
      )}
      {compTab === 'incidents' && (
        <div className="space-y-3">
          {incidents.map(inc => (
            <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-sans tabular-nums text-slate-400">{inc.id}</span><Badge label={inc.severity} variant={inc.severity === 'High' ? 'danger' : 'warning'} /></div>
                <div className="text-xs font-bold text-slate-900">{inc.title}</div>
                <div className="data-value text-slate-500 mt-0.5">Logged: {inc.date}</div>
              </div>
              <Badge label={inc.status} variant={inc.status === 'Resolved' ? 'success' : 'warning'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
