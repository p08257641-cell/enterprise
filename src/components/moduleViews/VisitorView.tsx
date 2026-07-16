import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

export const VisitorView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  type VisTab = 'checkin' | 'log' | 'badges';
  const visTabFromView = (): VisTab =>
    activeView === 'vis-log' ? 'log'
      : activeView === 'vis-badges' ? 'badges'
        : 'checkin';
  const [visTab, setVisTab] = useState<VisTab>(visTabFromView());
  useEffect(() => { setVisTab(visTabFromView()); }, [activeView]);
  const visTabs: { id: VisTab; label: string }[] = [
    { id: 'checkin', label: 'Check-In' },
    { id: 'log', label: 'Visitor Log' },
    { id: 'badges', label: 'Badges' },
  ];
  const [visitors, setVisitors] = useState([
    { id: 'V-201', name: 'Markus Vance', host: 'Elena Rostova', company: 'Apex Inc.', checkIn: '09:15 AM', checkOut: null as string | null, status: 'Inside' },
    { id: 'V-202', name: 'Jin Li', host: 'Kaito Matsuda', company: 'TechParts Global', checkIn: '10:30 AM', checkOut: '11:45 AM', status: 'Checked Out' },
  ]);
  const [visName, setVisName] = useState(''); const [visHost, setVisHost] = useState('');
  const [visCompany, setVisCompany] = useState(''); const [visBadge, setVisBadge] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Visitor Management" subtitle="Check in guests, log visits, print badges and manage building access." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {visTabs.map(t => (
          <button key={t.id} onClick={() => setVisTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${visTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Inside Now" value={visitors.filter(v => v.status === 'Inside').length} icon="bi bi-door-open" sub="Currently in building" accent />
        <StatCard label="Today's Visits" value={visitors.length} icon="bi bi-person-badge" sub="Total check-ins today" />
        <StatCard label="Checked Out" value={visitors.filter(v => v.status === 'Checked Out').length} icon="bi bi-box-arrow-right" sub="Departed visitors" />
      </div>
      {visTab === 'checkin' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-md">
          <h3 className="section-title text-slate-500 mb-5">Check-In Visitor</h3>
          {visBadge && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <i className="bi bi-person-badge text-emerald-600 text-2xl block mb-1"></i>
              <div className="text-xs font-bold text-emerald-800">Badge Printed: {visBadge}</div>
            </div>
          )}
          <div className="space-y-4">
            <div><Label>Visitor Name</Label><Input value={visName} onChange={e => setVisName(e.target.value)} placeholder="John Doe" /></div>
            <div><Label>Visitor Company</Label><Input value={visCompany} onChange={e => setVisCompany(e.target.value)} placeholder="Acme Corp" /></div>
            <div><Label>Host Employee</Label>
              <Select value={visHost} onChange={e => setVisHost(e.target.value)}>
                <option value="">— Select host —</option>
                {localEmployees.slice(0, 8).map(e => <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</option>)}
              </Select>
            </div>
            <PrimaryBtn icon="bi bi-person-check" onClick={() => {
              if (!visName || !visHost) return;
              const id = `V-${200 + visitors.length + 1}`;
              setVisitors(prev => [...prev, { id, name: visName, host: visHost, company: visCompany || 'Walk-In', checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'Inside' }]);
              setVisBadge(`BADGE-${id}`); setVisName(''); setVisHost(''); setVisCompany('');
              setTimeout(() => setVisBadge(null), 4000);
            }}>Check In &amp; Print Badge</PrimaryBtn>
          </div>
        </div>
      )}
      {visTab === 'log' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Visitor Log</h3></div>
          <div className="divide-y divide-slate-100">
            {visitors.map(v => (
              <div key={v.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/40">
                <div>
                  <div className="text-xs font-bold text-slate-900">{v.name} <span className="text-slate-400 font-normal">· {v.company}</span></div>
                  <div className="data-value text-slate-500 mt-0.5">Host: {v.host} · In: {v.checkIn}{v.checkOut ? ` · Out: ${v.checkOut}` : ''}</div>
                </div>
                <Badge label={v.status} variant={v.status === 'Inside' ? 'success' : 'default'} />
              </div>
            ))}
          </div>
        </div>
      )}
      {visTab === 'badges' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Printed Badges</h3></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {visitors.map(v => (
              <div key={v.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <i className="bi bi-person-badge text-slate-400 text-xl"></i>
                <div>
                  <div className="text-xs font-bold text-slate-900">{v.name}</div>
                  <div className="data-value text-slate-500">{v.company} · Host: {v.host}</div>
                  <div className="text-[10px] font-sans tabular-nums text-slate-400 mt-0.5">{v.id} · {v.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
