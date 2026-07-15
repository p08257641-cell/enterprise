import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';

export const InventoryView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localStock = inventory.filter(s => s.companyId === selectedCompany.id);

  type InvTab = 'stock' | 'adjust' | 'warehouses' | 'transfers' | 'valuation';
  const invTabFromView = (): InvTab =>
    activeView === 'inv-warehouses' ? 'warehouses'
      : activeView === 'inv-transfers' ? 'transfers'
        : activeView === 'inv-valuation' ? 'valuation'
          : 'stock';
  const [invTab, setInvTab] = useState<InvTab>(invTabFromView());
  useEffect(() => { setInvTab(invTabFromView()); }, [activeView]);

  const invTabs: { id: InvTab; label: string }[] = [
    { id: 'stock', label: 'Stock Levels' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'valuation', label: 'Valuation' },
    { id: 'adjust', label: 'Adjustments' },
  ];
  const [invSearch, setInvSearch] = useState('');
  const [adjItem, setAdjItem] = useState(''); const [adjQty, setAdjQty] = useState('100');

  const lowStock = localStock.filter(i => i.stockLevel <= i.minStockLevel);
  const totalVal = localStock.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0);
  const filteredStock = localStock.filter(i => i.name.toLowerCase().includes(invSearch.toLowerCase()) || i.sku.toLowerCase().includes(invSearch.toLowerCase()));

  return (
    <div>
      <PageHeader title="Inventory & Stock Control" subtitle="Monitor stock levels, manage warehouses, process adjustments and set reorder alerts." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {invTabs.map(t => (
          <button key={t.id} onClick={() => setInvTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${invTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      {invTab !== 'transfers' && invTab !== 'valuation' && (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Stock Valuation" value={`$${totalVal.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total warehoused value" />
          <StatCard label="SKU Count" value={localStock.length} icon="bi bi-box-seam" sub="Distinct products" />
          <StatCard label="Low Stock" value={lowStock.length} icon="bi bi-exclamation-triangle" sub="Below safety threshold" accent />
          <StatCard label="Warehouses" value={[...new Set(localStock.map(i => i.warehouse))].length} icon="bi bi-building" sub="Active locations" />
        </div>
      )}
      {invTab === 'stock' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <Input placeholder="Search by SKU or product name…" value={invSearch} onChange={e => setInvSearch(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'SKU' }, { label: 'Product' }, { label: 'Category' }, { label: 'Warehouse' }, { label: 'Stock', right: true }, { label: 'Min', right: true }, { label: 'Unit Price', right: true }, { label: 'Status' }]} />
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map(item => {
                const isLow = item.stockLevel <= item.minStockLevel;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50/40 transition-colors ${isLow ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-4 py-3 data-value-small font-sans tabular-nums font-bold text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.warehouse}</td>
                    <td className={`px-4 py-3 text-xs font-sans tabular-nums font-bold text-right ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.stockLevel}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400 text-right">{item.minStockLevel}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge label={isLow ? 'Low Stock' : 'OK'} variant={isLow ? 'danger' : 'success'} /></td>
                  </tr>
                );
              })}
              {filteredStock.length === 0 && <EmptyRow cols={8} message="No items match your search." />}
            </tbody>
          </table>
        </div>
      )}
      {invTab === 'adjust' && (
        <div className="max-w-md">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-5">Stock Adjustment</h3>
            <div className="space-y-4">
              <div><Label>Select Item</Label>
                <Select value={adjItem} onChange={e => setAdjItem(e.target.value)}>
                  <option value="">— Select SKU —</option>
                  {localStock.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                </Select>
              </div>
              <div><Label>Quantity to Add (+) or Remove (-)</Label><Input type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} /></div>
              <PrimaryBtn icon="bi bi-arrow-repeat" onClick={() => { if (adjItem) { onAdjustStock(adjItem, Number(adjQty)); setAdjItem(''); setAdjQty('100'); } }}>Apply Adjustment</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {invTab === 'warehouses' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...new Set(localStock.map(i => i.warehouse))].map(wh => {
            const items = localStock.filter(i => i.warehouse === wh);
            const val = items.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0);
            return (
              <div key={wh} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3"><i className="bi bi-building text-slate-400"></i><span className="text-sm font-bold text-slate-900">{wh}</span></div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg"><div className="data-value-small text-slate-400 uppercase tracking-wider">SKUs</div><div className="font-sans tabular-nums font-bold text-slate-900 mt-0.5">{items.length}</div></div>
                  <div className="p-2.5 bg-slate-50 rounded-lg"><div className="data-value-small text-slate-400 uppercase tracking-wider">Valuation</div><div className="font-sans tabular-nums font-bold text-slate-900 mt-0.5">${val.toLocaleString()}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {invTab === 'transfers' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Transfers This Month" value={6} icon="bi bi-arrow-left-right" sub="Inter-warehouse moves" />
            <StatCard label="In Transit" value={2} icon="bi bi-truck" sub="Currently moving" accent />
            <StatCard label="Completed" value={4} icon="bi bi-check-circle" sub="Delivered" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">Stock Transfer Log</h3>
              <PrimaryBtn icon="bi bi-plus-lg">New Transfer</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Transfer ID' }, { label: 'Item' }, { label: 'From' }, { label: 'To' }, { label: 'Qty', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {localStock.slice(0, 4).map((item, i) => {
                  const froms = ['Warehouse A', 'Warehouse B', 'Warehouse A', 'Main Store'];
                  const tos = ['Main Store', 'Warehouse A', 'Warehouse C', 'Warehouse B'];
                  const statuses = ['Completed', 'In Transit', 'Completed', 'In Transit'];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">TRF-{1001 + i}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{froms[i]}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{tos[i]}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">{[50, 200, 75, 120][i]}</td>
                      <td className="px-4 py-3"><Badge label={statuses[i]} variant={statuses[i] === 'Completed' ? 'success' : 'info'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {invTab === 'valuation' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Total Stock Value" value={`$${localStock.reduce((s, i) => s + i.stockLevel * i.unitPrice, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="At cost price" accent />
            <StatCard label="Highest Value SKU" value={[...localStock].sort((a, b) => b.stockLevel * b.unitPrice - a.stockLevel * a.unitPrice)[0]?.name ?? '—'} icon="bi bi-award" sub="By total stock value" />
            <StatCard label="Low Stock Risk Value" value={`$${localStock.filter(i => i.stockLevel <= i.minStockLevel).reduce((s, i) => s + i.stockLevel * i.unitPrice, 0).toLocaleString()}`} icon="bi bi-exclamation-triangle" sub="Value at risk" color="text-rose-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Stock Valuation Report</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'SKU' }, { label: 'Product' }, { label: 'Qty on Hand', right: true }, { label: 'Unit Cost', right: true }, { label: 'Total Value', right: true }, { label: 'Warehouse' }]} />
              <tbody className="divide-y divide-slate-100">
                {localStock.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 data-value-small font-sans tabular-nums text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">{item.stockLevel.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${(item.stockLevel * item.unitPrice).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
