import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { parseActiveView } from '../../parseActiveView';

export const AssetView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const [assets, setAssets] = useState([
    { id: 'AST-082', name: 'Laser CNC Cutter v4', category: 'Heavy Machinery', location: 'Plant A', status: 'Operational', value: 85000, qr: 'AST-082-CNC', nextService: '2026-09-01', lifeYears: 10 },
    { id: 'AST-091', name: 'MacBook Pro M3 16"', category: 'IT Hardware', location: 'NYC HQ', status: 'Assigned', value: 3200, qr: 'AST-091-MBP', nextService: '2026-12-15', lifeYears: 4 },
    { id: 'AST-103', name: 'Forklift Hyster 50', category: 'Logistics', location: 'Warehouse B', status: 'Maintenance', value: 42000, qr: 'AST-103-FKL', nextService: '2026-07-20', lifeYears: 8 },
  ]);
  const initialAssetTab = (): 'register' | 'maintenance' | 'depreciation' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'maintenance') return 'maintenance';
    if (sub === 'depreciation') return 'depreciation';
    return 'register';
  };
  const [assetTab, setAssetTab] = useState<'register' | 'maintenance' | 'depreciation'>(initialAssetTab);
  useEffect(() => { setAssetTab(initialAssetTab()); }, [activeView]);
  const [newAssetName, setNewAssetName] = useState(''); const [newAssetCat, setNewAssetCat] = useState('IT Hardware');
  const [newAssetLoc, setNewAssetLoc] = useState('NYC HQ'); const [newAssetVal, setNewAssetVal] = useState('1000');
  const [newAssetLife, setNewAssetLife] = useState('5');

  const [maintenance, setMaintenance] = useState([
    { id: 'MT-01', asset: 'AST-103', task: 'Hydraulic fluid flush', due: '2026-07-20', owner: 'Logistics Team', status: 'Scheduled' },
    { id: 'MT-02', asset: 'AST-082', task: 'Quarterly calibration', due: '2026-09-01', owner: 'Plant A Eng.', status: 'Scheduled' },
    { id: 'MT-03', asset: 'AST-091', task: 'Battery health check', due: '2026-12-15', owner: 'IT Support', status: 'Scheduled' },
  ]);
  const [maintTask, setMaintTask] = useState(''); const [maintDue, setMaintDue] = useState('2026-08-01');
  const [maintOwner, setMaintOwner] = useState('');

  const assetTabs = [
    { id: 'register', label: 'Asset Register' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'depreciation', label: 'Depreciation' },
  ] as const;

  const depreciationRows = assets.map(a => {
    const life = a.lifeYears || 5;
    const salvage = a.value * 0.1;
    const annual = (a.value - salvage) / life;
    const ageYears = 2;
    const accumulated = annual * ageYears;
    const netBook = Math.max(salvage, a.value - accumulated);
    return { ...a, annual, netBook };
  });

  return (
    <div>
      <PageHeader title="Asset Management" subtitle="Track company assets, manage maintenance schedules and monitor asset depreciation." />

      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {assetTabs.map(t => (
          <button key={t.id} onClick={() => setAssetTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${assetTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>

      {assetTab === 'register' && (
        <>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Assets" value={assets.length} icon="bi bi-collection" sub="Registered in system" />
            <StatCard label="Asset Value" value={`$${assets.reduce((s, a) => s + a.value, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total acquisition cost" accent />
            <StatCard label="Operational" value={assets.filter(a => a.status === 'Operational').length} icon="bi bi-check-circle" sub="Running normally" />
            <StatCard label="In Maintenance" value={assets.filter(a => a.status === 'Maintenance').length} icon="bi bi-wrench" sub="Under servicing" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Asset Register</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Asset ID' }, { label: 'Asset Name' }, { label: 'Category' }, { label: 'Location' }, { label: 'Value', right: true }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {assets.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-500">{a.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{a.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.location}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${a.value.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={a.status} variant={a.status === 'Operational' ? 'success' : a.status === 'Assigned' ? 'info' : 'warning'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Register New Asset</h3>
              <div className="space-y-3">
                <div><Label>Asset Name</Label><Input value={newAssetName} onChange={e => setNewAssetName(e.target.value)} placeholder="Dell Workstation" /></div>
                <div><Label>Category</Label><Select value={newAssetCat} onChange={e => setNewAssetCat(e.target.value)}><option>IT Hardware</option><option>Heavy Machinery</option><option>Logistics</option><option>Furniture</option><option>Vehicles</option></Select></div>
                <div><Label>Location</Label><Input value={newAssetLoc} onChange={e => setNewAssetLoc(e.target.value)} placeholder="NYC HQ" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Purchase Value (USD)</Label><Input type="number" value={newAssetVal} onChange={e => setNewAssetVal(e.target.value)} /></div>
                  <div><Label>Useful Life (yrs)</Label><Input type="number" value={newAssetLife} onChange={e => setNewAssetLife(e.target.value)} /></div>
                </div>
                <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                  if (!newAssetName) return;
                  const id = `AST-${100 + assets.length + 1}`;
                  setAssets(prev => [...prev, { id, name: newAssetName, category: newAssetCat, location: newAssetLoc, status: 'Operational', value: Number(newAssetVal), qr: `${id}-${newAssetCat.slice(0, 3).toUpperCase()}`, nextService: '2026-12-31', lifeYears: Number(newAssetLife) || 5 }]);
                  setNewAssetName(''); setNewAssetVal('1000'); setNewAssetLife('5');
                }}>Register Asset</PrimaryBtn>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">QR Codes</h4>
                {assets.slice(0, 2).map(a => (
                  <div key={a.id} className="p-2.5 mb-2 border border-slate-100 rounded-lg flex items-center gap-3 bg-slate-50">
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                      <i className="bi bi-qr-code text-slate-700 text-lg"></i>
                    </div>
                    <div><div className="data-value font-semibold text-slate-800">{a.name}</div><div className="data-value-small font-sans tabular-nums text-slate-400">{a.qr}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {assetTab === 'maintenance' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <StatCard label="Scheduled" value={maintenance.length} icon="bi bi-calendar-check" sub="Upcoming tasks" />
            <StatCard label="Overdue" value={maintenance.filter(m => new Date(m.due) < new Date()).length} icon="bi bi-exclamation-triangle" sub="Past due date" accent />
            <StatCard label="In Maintenance" value={assets.filter(a => a.status === 'Maintenance').length} icon="bi bi-wrench" sub="Assets being serviced" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Maintenance Schedule</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Task ID' }, { label: 'Asset' }, { label: 'Task' }, { label: 'Due' }, { label: 'Owner' }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {maintenance.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-500">{m.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{m.asset}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{m.task}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{m.due}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{m.owner}</td>
                      <td className="px-4 py-3"><Badge label={m.status} variant={new Date(m.due) < new Date() ? 'danger' : 'info'} /></td>
                    </tr>
                  ))}
                  {maintenance.length === 0 && <EmptyRow cols={6} message="No maintenance tasks scheduled." />}
                </tbody>
              </table>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Schedule Maintenance</h3>
              <div className="space-y-3">
                <div><Label>Asset</Label><Select value={maintTask} onChange={e => setMaintTask(e.target.value)}><option value="">Select asset…</option>{assets.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}</Select></div>
                <div><Label>Task</Label><Input value={maintTask && !assets.find(a => a.id === maintTask) ? maintTask : ''} onChange={e => setMaintTask(e.target.value)} placeholder="e.g. Annual inspection" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Due Date</Label><Input type="date" value={maintDue} onChange={e => setMaintDue(e.target.value)} /></div>
                  <div><Label>Owner</Label><Input value={maintOwner} onChange={e => setMaintOwner(e.target.value)} placeholder="Team / person" /></div>
                </div>
                <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                  if (!maintTask) return;
                  const id = `MT-${maintenance.length + 1}`;
                  const assetLabel = assets.find(a => a.id === maintTask) ? maintTask : 'General';
                  setMaintenance(prev => [...prev, { id, asset: assetLabel, task: assets.find(a => a.id === maintTask) ? 'Service request' : maintTask, due: maintDue, owner: maintOwner || 'Unassigned', status: 'Scheduled' }]);
                  setMaintTask(''); setMaintOwner(''); setMaintDue('2026-08-01');
                }}>Add Task</PrimaryBtn>
              </div>
            </div>
          </div>
        </>
      )}

      {assetTab === 'depreciation' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <StatCard label="Gross Value" value={`$${assets.reduce((s, a) => s + a.value, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Acquisition cost" />
            <StatCard label="Accumulated Depreciation" value={`$${depreciationRows.reduce((s, r) => s + (r.value - r.netBook), 0).toLocaleString()}`} icon="bi bi-graph-down" sub="2 yrs elapsed" accent />
            <StatCard label="Net Book Value" value={`$${depreciationRows.reduce((s, r) => s + r.netBook, 0).toLocaleString()}`} icon="bi bi-collection" sub="Current carrying value" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Depreciation Schedule (Straight-Line, 10% Salvage)</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Asset' }, { label: 'Cost', right: true }, { label: 'Life (yrs)' }, { label: 'Annual', right: true }, { label: 'Accumulated', right: true }, { label: 'Net Book', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {depreciationRows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${r.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{r.lifeYears}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${r.annual.toFixed(0)}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${(r.value - r.netBook).toFixed(0)}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${r.netBook.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
