import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';

export const ManufacturingView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  type MfgTab = 'orders' | 'bom' | 'quality';
  const mfgTabFromView = (): MfgTab =>
    activeView === 'mfg-orders' ? 'orders'
      : activeView === 'mfg-quality' ? 'quality'
        : activeView === 'manufacturing' ? 'bom'
          : 'orders';
  const [mfgTab, setMfgTab] = useState<MfgTab>(mfgTabFromView());
  useEffect(() => { setMfgTab(mfgTabFromView()); }, [activeView]);
  const mfgTabs: { id: MfgTab; label: string }[] = [
    { id: 'orders', label: 'Work Orders' },
    { id: 'bom', label: 'Bill of Materials' },
    { id: 'quality', label: 'Quality Control' },
  ];
  const [workOrders] = useState([
    { id: 'WO-501', product: 'Pneumatic Actuator', qty: 250, line: 'Assembly Line B', status: 'In Progress', completion: 65 },
    { id: 'WO-502', product: 'Bio-Vial Stopper', qty: 5000, line: 'Injection Mold 3', status: 'Scheduled', completion: 0 },
    { id: 'WO-503', product: 'Servo Bracket Assy', qty: 120, line: 'Fabrication Bay 1', status: 'Completed', completion: 100 },
  ]);
  const [bomProduct, setBomProduct] = useState('Pneumatic Actuator');
  const bomData = [
    { part: 'Aluminum Housing', qty: 1, unit: 'pcs', cost: 18.50 },
    { part: 'O-Ring Seal Kit', qty: 4, unit: 'pcs', cost: 3.20 },
    { part: 'Stainless Piston Rod', qty: 1, unit: 'pcs', cost: 24.00 },
    { part: 'Spring Coil 12mm', qty: 2, unit: 'pcs', cost: 5.50 },
    { part: 'End Cap Assembly', qty: 2, unit: 'pcs', cost: 8.75 },
  ];

  const bomTotal = bomData.reduce((s, b) => s + b.qty * b.cost, 0);

  return (
    <div>
      <PageHeader title="Manufacturing & Production" subtitle="Work orders, Bill of Materials, production tracking and quality control." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {mfgTabs.map(t => (
          <button key={t.id} onClick={() => setMfgTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${mfgTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Work Orders" value={workOrders.length} icon="bi bi-clipboard2-data" sub="Active production runs" />
        <StatCard label="In Progress" value={workOrders.filter(w => w.status === 'In Progress').length} icon="bi bi-play-circle" sub="Currently manufacturing" accent />
        <StatCard label="Completed" value={workOrders.filter(w => w.status === 'Completed').length} icon="bi bi-check-circle" sub="Finished this period" />
      </div>
      {mfgTab === 'orders' && (
        <div className="space-y-3">
          {workOrders.map(wo => (
            <div key={wo.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2"><span className="text-xs font-sans tabular-nums font-bold text-slate-500">{wo.id}</span><Badge label={wo.status} variant={wo.status === 'Completed' ? 'success' : wo.status === 'In Progress' ? 'info' : 'warning'} /></div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{wo.product}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Qty: <span className="font-sans tabular-nums font-semibold text-slate-700">{wo.qty.toLocaleString()}</span> · Line: <span className="font-semibold text-slate-700">{wo.line}</span></div>
                </div>
                <div className="text-right"><div className="text-2xl font-bold font-sans tabular-nums text-slate-900">{wo.completion}%</div><div className="text-[10px] text-slate-400">completion</div></div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${wo.completion === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ width: `${wo.completion}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      {mfgTab === 'bom' && (
        <div>
          <div className="mb-4 flex items-center gap-3"><Label>Product:</Label>
            <Select className="w-64" value={bomProduct} onChange={e => setBomProduct(e.target.value)}><option>Pneumatic Actuator</option><option>Bio-Vial Stopper</option><option>Servo Bracket Assy</option></Select>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">BOM — {bomProduct}</h3>
              <span className="table-cell-mono font-bold text-slate-900">Total Cost: ${bomTotal.toFixed(2)}</span>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: '#' }, { label: 'Component' }, { label: 'Qty' }, { label: 'Unit' }, { label: 'Unit Cost', right: true }, { label: 'Line Total', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {bomData.map((b, i) => (
                  <tr key={b.part} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{b.part}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{b.qty}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.unit}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">${b.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${(b.qty * b.cost).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={5} className="px-4 py-3 table-cell font-bold text-slate-700 text-right">Total Material Cost</td>
                  <td className="px-4 py-3 table-cell-mono font-bold text-slate-900 text-right">${bomTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {mfgTab === 'quality' && (
        <div className="space-y-3">
          {[
            { check: 'Dimensional Tolerance Verification', result: 'Passed', date: '2026-07-09', inspector: 'QC Team A' },
            { check: 'Surface Finish Inspection (Ra)', result: 'Passed', date: '2026-07-08', inspector: 'QC Team B' },
            { check: 'Pressure Test (12 Bar)', result: 'Failed', date: '2026-07-07', inspector: 'QC Team A' },
            { check: 'Material Certificate Verification', result: 'Passed', date: '2026-07-06', inspector: 'QC Team C' },
          ].map(q => (
            <div key={q.check} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div><div className="table-cell-semibold text-slate-900">{q.check}</div><div className="data-value text-slate-500 mt-0.5">{q.inspector} · {q.date}</div></div>
              <Badge label={q.result} variant={q.result === 'Passed' ? 'success' : 'danger'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
