import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal } from './shared';
import { modalAlert } from '../../utils/modal';

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
  const [transfers, setTransfers] = useState<{ id: string; item: string; from: string; to: string; qty: number; status: string }[]>([
    { id: 'TRF-1001', item: localStock[0]?.name ?? 'Steel Bracket', from: 'Warehouse A', to: 'Main Store', qty: 50, status: 'Completed' },
    { id: 'TRF-1002', item: localStock[1]?.name ?? 'Copper Wire', from: 'Warehouse B', to: 'Warehouse A', qty: 200, status: 'In Transit' },
    { id: 'TRF-1003', item: localStock[2]?.name ?? 'Aluminum Sheet', from: 'Warehouse A', to: 'Warehouse C', qty: 75, status: 'Completed' },
    { id: 'TRF-1004', item: localStock[3]?.name ?? 'Plastic Casing', from: 'Main Store', to: 'Warehouse B', qty: 120, status: 'In Transit' },
  ]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [trfItem, setTrfItem] = useState('');
  const [trfFrom, setTrfFrom] = useState('Warehouse A');
  const [trfTo, setTrfTo] = useState('Main Store');
  const [trfQty, setTrfQty] = useState('10');
  const stockModal = useRowModal<typeof localStock[0]>();
  const transferModal = useRowModal<typeof transfers[0]>();

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
                  <tr key={item.id} className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${isLow ? 'bg-rose-50/20' : ''}`} onClick={() => stockModal.open(item)}>
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
            <StatCard label="Total Transfers" value={transfers.length} icon="bi bi-arrow-left-right" sub="Inter-warehouse moves" />
            <StatCard label="In Transit" value={transfers.filter(t => t.status === 'In Transit').length} icon="bi bi-truck" sub="Currently moving" accent />
            <StatCard label="Completed" value={transfers.filter(t => t.status === 'Completed').length} icon="bi bi-check-circle" sub="Delivered" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">Stock Transfer Log</h3>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setTrfItem(localStock[0]?.id ?? ''); setTrfFrom('Warehouse A'); setTrfTo('Main Store'); setTrfQty('10'); setShowTransferModal(true); }}>New Transfer</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Transfer ID' }, { label: 'Item' }, { label: 'From' }, { label: 'To' }, { label: 'Qty', right: true }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => transferModal.open(t)}>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{t.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.item}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.from}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.to}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">{t.qty}</td>
                    <td className="px-4 py-3"><Badge label={t.status} variant={t.status === 'Completed' ? 'success' : 'info'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Stock Transfer</h2>
            <div className="space-y-4">
              <div><Label>Item *</Label><Select value={trfItem} onChange={e => setTrfItem(e.target.value)}>{localStock.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}</Select></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>From</Label><Select value={trfFrom} onChange={e => setTrfFrom(e.target.value)}><option>Warehouse A</option><option>Warehouse B</option><option>Warehouse C</option><option>Main Store</option></Select></div>
                <div><Label>To</Label><Select value={trfTo} onChange={e => setTrfTo(e.target.value)}><option>Warehouse A</option><option>Warehouse B</option><option>Warehouse C</option><option>Main Store</option></Select></div>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={trfQty} onChange={e => setTrfQty(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
              <SecBtn onClick={() => setShowTransferModal(false)}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                if (!trfItem) return void modalAlert('Select an item', { variant: 'warning' });
                const item = localStock.find(i => i.id === trfItem);
                setTransfers(prev => [{ id: `TRF-${1005 + prev.length}`, item: item?.name ?? trfItem, from: trfFrom, to: trfTo, qty: Number(trfQty) || 0, status: 'In Transit' }, ...prev]);
                setShowTransferModal(false);
              }}>Create Transfer</PrimaryBtn>
            </div>
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
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => stockModal.open(item)}>
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
      {stockModal.selected && (
        <RowModal row={stockModal.selected}
          icon="bi bi-box-seam" accentColor="#16a34a"
          fields={[
            { label: 'SKU', key: 'sku', mono: true, icon: 'bi bi-hash' },
            { label: 'Product', key: 'name', icon: 'bi bi-tag' },
            { label: 'Category', key: 'category', icon: 'bi bi-collection', section: 'Details' },
            { label: 'Warehouse', key: 'warehouse', icon: 'bi bi-building', section: 'Details' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
            { label: 'Stock Level', key: 'stockLevel', icon: 'bi bi-stack', section: 'Levels' },
            { label: 'Min Level', key: 'minStockLevel', icon: 'bi bi-exclamation-triangle', section: 'Levels' },
            { label: 'Unit Price', key: 'unitPrice', format: (v: number) => `$${v.toFixed(2)}`, icon: 'bi bi-cash', section: 'Levels' },
          ]}
          title={r => r.name} subtitle={r => r.sku}
          onClose={stockModal.close} />
      )}
      {transferModal.selected && (
        <RowModal row={transferModal.selected}
          icon="bi bi-arrow-left-right" accentColor="#0284c7"
          fields={[
            { label: 'Transfer ID', key: 'id', mono: true, icon: 'bi bi-hash' },
            { label: 'Item', key: 'item', icon: 'bi bi-box-seam' },
            { label: 'From', key: 'from', icon: 'bi bi-building', section: 'Route' },
            { label: 'To', key: 'to', icon: 'bi bi-building', section: 'Route' },
            { label: 'Qty', key: 'qty', icon: 'bi bi-stack', section: 'Route' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Route' },
          ]}
          title={r => `Transfer ${r.id}`} subtitle={r => `${r.from} → ${r.to}`}
          onClose={transferModal.close} />
      )}
    </div>
  );
};
