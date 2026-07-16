import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal } from './shared';
import { modalAlert } from '../../utils/modal';

export const ProcurementView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  type ProcTab = 'orders' | 'vendors' | 'rfq' | 'create';
  const procTabFromView = (): ProcTab =>
    activeView === 'proc-vendors' ? 'vendors'
      : activeView === 'proc-rfq' ? 'rfq'
        : 'orders';
  const [procTab, setProcTab] = useState<ProcTab>(procTabFromView());
  useEffect(() => { setProcTab(procTabFromView()); }, [activeView]);
  const procTabs: { id: ProcTab; label: string }[] = [
    { id: 'orders', label: 'Purchase Orders' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'rfq', label: 'RFQ / Bids' },
    { id: 'create', label: 'New PO' },
  ];
  const [procOrders, setProcOrders] = useState([
    { id: 'PO-2201', vendor: 'Industrial Tooling Co.', item: 'CNC Drill Bits x50', total: 4500, status: 'Approved', date: '2026-07-05' },
    { id: 'PO-2202', vendor: 'Apex Chemical Lab', item: 'Synthetic Lubricant 200L', total: 8200, status: 'Pending', date: '2026-07-08' },
    { id: 'PO-2203', vendor: 'TechParts Global', item: 'Servo Motors x12', total: 21600, status: 'Received', date: '2026-07-02' },
  ]);
  const [procItem, setProcItem] = useState(''); const [procVendor, setProcVendor] = useState('');
  const [procQty, setProcQty] = useState('10'); const [procPrice, setProcPrice] = useState('500');
  const [rfqs, setRfqs] = useState<{ id: string; item: string; vendors: number; sent: string; received: number; status: string }[]>([
    { id: 'RFQ-001', item: 'Industrial Bearings x500', vendors: 3, sent: '2026-07-01', received: 2, status: 'In Review' },
    { id: 'RFQ-002', item: 'Hydraulic Seals Kit', vendors: 2, sent: '2026-07-05', received: 2, status: 'Awarded' },
    { id: 'RFQ-003', item: 'Safety Helmets x100', vendors: 4, sent: '2026-07-08', received: 1, status: 'Open' },
  ]);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [rfqItem, setRfqItem] = useState('');
  const [rfqVendorCount, setRfqVendorCount] = useState('3');
  const poModal = useRowModal<typeof procOrders[0]>();
  const rfqModal = useRowModal<typeof rfqs[0]>();

  return (
    <div>
      <PageHeader title="Procurement & Vendor Management" subtitle="Create purchase orders, manage vendor relationships and track RFQ bids."
        action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setProcTab('create')}>New Purchase Order</PrimaryBtn>} />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {procTabs.map(t => (
          <button key={t.id} onClick={() => setProcTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${procTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Total POs" value={procOrders.length} icon="bi bi-file-earmark-plus" sub="Purchase orders issued" />
        <StatCard label="PO Value" value={`$${procOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total committed spend" accent />
        <StatCard label="Pending Approval" value={procOrders.filter(o => o.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting authorisation" />
        <StatCard label="Received" value={procOrders.filter(o => o.status === 'Received').length} icon="bi bi-check-circle" sub="Delivered orders" />
      </div>
      {procTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'PO Number' }, { label: 'Vendor' }, { label: 'Item Description' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Status' }]} />
            <tbody className="divide-y divide-slate-100">
              {procOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => poModal.open(o)}>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{o.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{o.vendor}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{o.item}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{o.date}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${o.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={o.status} variant={o.status === 'Approved' || o.status === 'Received' ? 'success' : 'warning'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {procTab === 'vendors' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'Industrial Tooling Co.', type: 'Manufacturer', rating: 4.8, contact: 'sales@indtools.com', orders: 12 },
            { name: 'Apex Chemical Lab', type: 'Distributor', rating: 4.2, contact: 'orders@apexchem.com', orders: 7 },
            { name: 'TechParts Global', type: 'Wholesale', rating: 4.6, contact: 'b2b@techparts.io', orders: 15 },
          ].map(v => (
            <div key={v.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div><div className="text-sm font-bold text-slate-900">{v.name}</div><div className="data-value text-slate-500 mt-0.5">{v.type} · {v.contact}</div></div>
                <div className="data-value-small font-sans tabular-nums text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">★ {v.rating}</div>
              </div>
              <div className="data-value text-slate-500">{v.orders} purchase orders placed</div>
            </div>
          ))}
        </div>
      )}
      {procTab === 'rfq' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Open RFQs" value={rfqs.filter(r => r.status === 'Open').length} icon="bi bi-file-earmark-text" sub="Awaiting vendor quotes" />
            <StatCard label="Total Bids Received" value={rfqs.reduce((s, r) => s + r.received, 0)} icon="bi bi-clock" sub="Across all RFQs" accent />
            <StatCard label="Awarded" value={rfqs.filter(r => r.status === 'Awarded').length} icon="bi bi-piggy-bank" sub="RFQs closed" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">Request for Quotation</h3>
              <PrimaryBtn icon="bi bi-send" onClick={() => { setRfqItem(''); setRfqVendorCount('3'); setShowRfqModal(true); }}>Send New RFQ</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'RFQ #' }, { label: 'Item' }, { label: 'Vendors Invited' }, { label: 'Sent On' }, { label: 'Quotes Received' }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {rfqs.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => rfqModal.open(r)}>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{r.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{r.item}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600">{r.vendors}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{r.sent}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{r.received}/{r.vendors}</td>
                    <td className="px-4 py-3"><Badge label={r.status} variant={r.status === 'Awarded' ? 'success' : r.status === 'In Review' ? 'warning' : 'info'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Send New RFQ</h2>
            <div className="space-y-4">
              <div><Label>Item Description *</Label><Input value={rfqItem} onChange={e => setRfqItem(e.target.value)} placeholder="Industrial Bearings x500" /></div>
              <div><Label>Number of Vendors</Label><Input type="number" value={rfqVendorCount} onChange={e => setRfqVendorCount(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
              <SecBtn onClick={() => setShowRfqModal(false)}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                if (!rfqItem) return void modalAlert('Item description required', { variant: 'warning' });
                const newId = `RFQ-${String(rfqs.length + 1).padStart(3, '0')}`;
                setRfqs(prev => [{ id: newId, item: rfqItem, vendors: Number(rfqVendorCount) || 1, sent: new Date().toISOString().split('T')[0], received: 0, status: 'Open' }, ...prev]);
                setShowRfqModal(false); setRfqItem('');
              }}>Send RFQ</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {poModal.selected && (
        <RowModal row={poModal.selected}
          icon="bi bi-bag-check" accentColor="#ca8a04"
          fields={[
            { label: 'PO Number', key: 'id', mono: true, icon: 'bi bi-hash' },
            { label: 'Vendor', key: 'vendor', icon: 'bi bi-building' },
            { label: 'Item', key: 'item', icon: 'bi bi-box-seam', section: 'Order' },
            { label: 'Date', key: 'date', mono: true, icon: 'bi bi-calendar-event', section: 'Order' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Order' },
            { label: 'Total', key: 'total', format: (v: number) => `$${v.toLocaleString()}`, icon: 'bi bi-cash', section: 'Amount' },
          ]}
          title={r => `Purchase Order ${r.id}`} subtitle={r => r.vendor}
          onClose={poModal.close} />
      )}
      {rfqModal.selected && (
        <RowModal row={rfqModal.selected}
          icon="bi bi-envelope-open" accentColor="#7c3aed"
          fields={[
            { label: 'RFQ #', key: 'id', mono: true, icon: 'bi bi-hash' },
            { label: 'Item', key: 'item', icon: 'bi bi-box-seam' },
            { label: 'Vendors Invited', key: 'vendors', icon: 'bi bi-people', section: 'Sourcing' },
            { label: 'Sent On', key: 'sent', icon: 'bi bi-calendar-event', section: 'Sourcing' },
            { label: 'Quotes Received', key: 'received', icon: 'bi bi-inboxes', section: 'Sourcing' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Sourcing' },
          ]}
          title={r => `RFQ ${r.id}`} subtitle={r => r.item}
          onClose={rfqModal.close} />
      )}
    </div>
  );
};
