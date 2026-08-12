import { formatCurrency } from '../../utils/currency';
import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { isAdminRole } from '../../permissions';

export const ProcurementView: React.FC<ModuleViewsProps> = (props) => {
  const {
    searchTerm = '', activeView, onNavigateView, selectedCompany, selectedUser,
    vendors, purchaseOrders, rfqs, inventory,
    onCreateVendor, onUpdateVendor, onDeleteVendor,
    onCreatePurchaseOrder, onUpdatePurchaseOrder, onDeletePurchaseOrder,
    onCreateRFQ, onUpdateRFQ, onDeleteRFQ,
  } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const localVendors = vendors.filter(v => v.companyId === selectedCompany.id);
  const localPOs = purchaseOrders.filter(p => p.companyId === selectedCompany.id);
  const localRFQs = rfqs.filter(r => r.companyId === selectedCompany.id);
  const localInventory = inventory.filter(i => i.companyId === selectedCompany.id);

  type ProcTab = 'orders' | 'vendors' | 'rfq' | 'create';
  const procTabFromView = (): ProcTab =>
    activeView === 'proc-vendors' ? 'vendors'
      : activeView === 'proc-rfq' ? 'rfq'
        : activeView === 'proc-create' ? 'create'
          : 'orders';
  const [procTab, setProcTab] = useState<ProcTab>(procTabFromView());
  useEffect(() => { setProcTab(procTabFromView()); }, [activeView]);

  const procTabs: { id: ProcTab; label: string }[] = [
    { id: 'orders', label: 'Purchase Orders' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'rfq', label: 'RFQ / Bids' },
    { id: 'create', label: 'New PO' },
  ];

  // New PO form state
  const [newVendorId, setNewVendorId] = useState('');
  const [selectedInvId, setSelectedInvId] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('10');
  const [newUnitPrice, setNewUnitPrice] = useState('500');

  // New Vendor modal state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorType, setVendorType] = useState('Manufacturer');
  const [vendorContact, setVendorContact] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorRating, setVendorRating] = useState('4.5');

  // RFQ modal state
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [selectedRfqInvId, setSelectedRfqInvId] = useState('');
  const [rfqItem, setRfqItem] = useState('');
  const [rfqVendorCount, setRfqVendorCount] = useState('3');

  const poModal = useRowModal<typeof localPOs[0]>();
  const rfqModal = useRowModal<typeof localRFQs[0]>();
  const vendorModal = useRowModal<typeof localVendors[0]>();

  const totalPoValue = localPOs.reduce((s, o) => s + (o.total || 0), 0);

  const handleSelectInventoryItem = (itemId: string) => {
    setSelectedInvId(itemId);
    const item = localInventory.find(i => i.id === itemId);
    if (item) {
      setNewItem(item.name);
      setNewUnitPrice(String(item.unitPrice || 0));
    } else {
      setNewItem('');
      setNewUnitPrice('500');
    }
  };

  const handleSelectRfqInventoryItem = (itemId: string) => {
    setSelectedRfqInvId(itemId);
    const item = localInventory.find(i => i.id === itemId);
    if (item) {
      setRfqItem(item.name);
    } else {
      setRfqItem('');
    }
  };

  const submitPO = () => {
    if (!newItem.trim()) return;
    const vendor = localVendors.find(v => v.id === newVendorId);
    onCreatePurchaseOrder({
      vendorId: newVendorId,
      vendorName: vendor?.name || newVendorId || 'Unknown Vendor',
      item: newItem.trim(),
      qty: Number(newQty),
      unitPrice: Number(newUnitPrice),
    });
    setNewItem(''); setNewQty('10'); setNewUnitPrice('500'); setNewVendorId(''); setSelectedInvId('');
    setProcTab('orders'); onNavigateView('procurement');
  };

  return (
    <div>
      <PageHeader
        title="Procurement & Vendor Management"
        subtitle="Create purchase orders, manage vendor relationships and track RFQ bids."
        action={isAdmin ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setProcTab('create'); onNavigateView('proc-create'); }}>New Purchase Order</PrimaryBtn> : undefined}
      />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {procTabs.map(t => (
          <button key={t.id} onClick={() => { setProcTab(t.id); onNavigateView(t.id === 'orders' ? 'procurement' : `proc-${t.id}`); }}
            className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${procTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Total POs" value={localPOs.length} icon="bi bi-file-earmark-plus" sub="Purchase orders issued" />
        <StatCard label="PO Value" value={formatCurrency(totalPoValue, selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="Total committed spend" accent />
        <StatCard label="Pending Approval" value={localPOs.filter(o => o.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting authorisation" />
        <StatCard label="Received" value={localPOs.filter(o => o.status === 'Received').length} icon="bi bi-check-circle" sub="Delivered orders" />
      </div>

      {/* Purchase Orders Tab */}
      {procTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="section-title text-slate-900">Purchase Orders</h3>
          </div>
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'PO Number' }, { label: 'Vendor' }, { label: 'Item' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Status' }, ...(isAdmin ? [{ label: 'Actions', right: true }] : [])]} />
            <tbody className="divide-y divide-slate-100">
              {localPOs.filter(o => !searchTerm || o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) || o.item.toLowerCase().includes(searchTerm.toLowerCase())).map(o => (
                <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-700">{o.poNumber}</td>
                  <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{o.vendorName}</td>
                  <td className="px-4 py-3 fs-xs text-slate-500 max-w-[160px] truncate">{o.item}</td>
                  <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{o.date}</td>
                  <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-semibold text-slate-900 text-right">${(o.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={o.status} variant={o.status === 'Approved' || o.status === 'Received' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'warning'} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); poModal.open(o); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                    >
                      <i className="bi bi-eye text-[11px]"></i> View
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        {o.status === 'Pending' && <button onClick={() => onUpdatePurchaseOrder(o.id, { status: 'Approved' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Approve</button>}
                        {o.status === 'Approved' && <button onClick={() => onUpdatePurchaseOrder(o.id, { status: 'Received' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">Mark Received</button>}
                        <button onClick={() => onDeletePurchaseOrder(o.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Del</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {localPOs.length === 0 && <EmptyRow cols={isAdmin ? 8 : 7} message="No purchase orders yet. Create one from the 'New PO' tab." />}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendors Tab */}
      {procTab === 'vendors' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setVendorName(''); setVendorContact(''); setVendorEmail(''); setVendorRating('4.5'); setShowVendorModal(true); }}>Add Vendor</PrimaryBtn>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {localVendors.map(v => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer" onClick={() => vendorModal.open(v)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="fs-sm fw-bold text-slate-900">{v.name}</div>
                    <div className="data-value text-slate-500 mt-0.5">{v.type} · {v.contact}</div>
                    <div className="data-value-small text-slate-400 mt-0.5">{v.email}</div>
                  </div>
                  <div className="data-value-small font-sans tabular-nums text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">★ {v.rating}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="data-value text-slate-500">{v.ordersCount} purchase orders placed</div>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); onDeleteVendor(v.id); }} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Remove</button>
                  )}
                </div>
              </div>
            ))}
            {localVendors.length === 0 && (
              <div className="col-span-2 py-10 text-center fs-xs text-slate-400 bg-white border border-slate-200 rounded-xl">No vendors yet. Add your first vendor to get started.</div>
            )}
          </div>
        </div>
      )}

      {/* RFQ Tab */}
      {procTab === 'rfq' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Open RFQs" value={localRFQs.filter(r => r.status === 'Open').length} icon="bi bi-file-earmark-text" sub="Awaiting vendor quotes" />
            <StatCard label="Total Bids Received" value={localRFQs.reduce((s, r) => s + r.quotesReceived, 0)} icon="bi bi-clock" sub="Across all RFQs" accent />
            <StatCard label="Awarded" value={localRFQs.filter(r => r.status === 'Awarded').length} icon="bi bi-piggy-bank" sub="RFQs closed" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">Request for Quotation</h3>
              <div className="flex items-center gap-2.5">
                {isAdmin && <PrimaryBtn icon="bi bi-send" onClick={() => { setRfqItem(''); setSelectedRfqInvId(''); setRfqVendorCount('3'); setShowRfqModal(true); }}>Send New RFQ</PrimaryBtn>}
              </div>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'RFQ #' }, { label: 'Item' }, { label: 'Vendors Invited' }, { label: 'Sent On' }, { label: 'Quotes Received' }, { label: 'Status' }, ...(isAdmin ? [{ label: 'Actions', right: true }] : [])]} />
              <tbody className="divide-y divide-slate-100">
                {localRFQs.filter(r => !searchTerm || r.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) || r.item.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-600">{r.rfqNumber}</td>
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{r.item}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-600">{r.vendorsInvited}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{r.sentDate}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-700">{r.quotesReceived}/{r.vendorsInvited}</td>
                    <td className="px-4 py-3"><Badge label={r.status} variant={r.status === 'Awarded' ? 'success' : r.status === 'In Review' ? 'warning' : 'info'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); rfqModal.open(r); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                      >
                        <i className="bi bi-eye text-[11px]"></i> View
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          {r.status === 'Open' && <button onClick={() => onUpdateRFQ(r.id, { status: 'In Review', quotesReceived: r.vendorsInvited })} className="text-[9px] fw-bold px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer">In Review</button>}
                          {r.status === 'In Review' && <button onClick={() => onUpdateRFQ(r.id, { status: 'Awarded' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Award</button>}
                          <button onClick={() => onDeleteRFQ(r.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {localRFQs.length === 0 && <EmptyRow cols={isAdmin ? 8 : 7} message="No RFQs sent yet." />}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New PO Tab */}
      {procTab === 'create' && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl shadow-xs p-6">
          <h3 className="section-title text-slate-500 mb-5">Create Purchase Order</h3>
          <div className="space-y-4">
            <div>
              <Label>Vendor</Label>
              <Select value={newVendorId} onChange={e => setNewVendorId(e.target.value)}>
                <option value="">Select vendor…</option>
                {localVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
              {localVendors.length === 0 && <p className="text-[10px] text-slate-400 mt-1">No vendors found — add one in the Vendors tab first.</p>}
            </div>
            <div>
              <Label>Select Product from Inventory</Label>
              <Select value={selectedInvId} onChange={e => handleSelectInventoryItem(e.target.value)}>
                <option value="">-- Custom / Non-Inventory Item --</option>
                {localInventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                ))}
              </Select>
            </div>
            <div><Label>Item Description *</Label><Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="e.g. CNC Drill Bits x50" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} /></div>
              <div><Label>Unit Price (USD)</Label><Input type="number" value={newUnitPrice} onChange={e => setNewUnitPrice(e.target.value)} /></div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="fs-xs text-slate-500">Estimated Total</span>
              <span className="fs-sm fw-bold font-sans tabular-nums text-slate-900">${(Number(newQty) * Number(newUnitPrice)).toLocaleString()}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <PrimaryBtn onClick={submitPO} disabled={!newItem.trim()}>Submit Purchase Order</PrimaryBtn>
              <SecBtn onClick={() => { setProcTab('orders'); onNavigateView('procurement'); }}>Cancel</SecBtn>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowVendorModal(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <i className="bi bi-building text-blue-600 fs-xs"></i>
                  </div>
                  <h3 className="fs-sm fw-bold text-slate-900">Add New Vendor</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Register a new supply chain partner or service provider.</p>
              </div>
              <button type="button" onClick={() => setShowVendorModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                <i className="bi bi-x fs-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div><Label>Vendor Name *</Label><Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Industrial Tooling Co." /></div>
              <div><Label>Type</Label><Select value={vendorType} onChange={e => setVendorType(e.target.value)}><option>Manufacturer</option><option>Distributor</option><option>Wholesale</option><option>Service Provider</option></Select></div>
              <div><Label>Contact Name</Label><Input value={vendorContact} onChange={e => setVendorContact(e.target.value)} placeholder="John Smith" /></div>
              <div><Label>Email</Label><Input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)} placeholder="sales@vendor.com" /></div>
              <div><Label>Rating (1–5)</Label><Input type="number" min="1" max="5" step="0.1" value={vendorRating} onChange={e => setVendorRating(e.target.value)} /></div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setShowVendorModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
              <button type="button" onClick={() => {
                if (!vendorName) return;
                onCreateVendor({ name: vendorName, type: vendorType, contact: vendorContact, email: vendorEmail, rating: Number(vendorRating) || 5 });
                setShowVendorModal(false);
              }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Add Vendor</button>
            </div>
          </div>
        </div>
      )}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowRfqModal(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                    <i className="bi bi-send text-violet-600 fs-xs"></i>
                  </div>
                  <h3 className="fs-sm fw-bold text-slate-900">Send New RFQ</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Request quotes from vendors for specific inventory items.</p>
              </div>
              <button type="button" onClick={() => setShowRfqModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                <i className="bi bi-x fs-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Select Product from Inventory</Label>
                <Select value={selectedRfqInvId} onChange={e => handleSelectRfqInventoryItem(e.target.value)}>
                  <option value="">-- Custom / Non-Inventory Item --</option>
                  {localInventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                  ))}
                </Select>
              </div>
              <div><Label>Item Description *</Label><Input value={rfqItem} onChange={e => setRfqItem(e.target.value)} placeholder="Industrial Bearings x500" /></div>
              <div><Label>Number of Vendors to Invite</Label><Input type="number" value={rfqVendorCount} onChange={e => setRfqVendorCount(e.target.value)} /></div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setShowRfqModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
              <button type="button" onClick={() => {
                if (!rfqItem) return;
                onCreateRFQ({ item: rfqItem, vendorsInvited: Number(rfqVendorCount) || 1 });
                setShowRfqModal(false); setRfqItem(''); setSelectedRfqInvId('');
              }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Send RFQ</button>
            </div>
          </div>
        </div>
      )}
      {poModal.selected && (
        <RowModal row={poModal.selected}
          icon="bi bi-bag-check" accentColor="#ca8a04"
          fields={[
            { label: 'PO Number', key: 'poNumber', mono: true, icon: 'bi bi-hash' },
            { label: 'Vendor', key: 'vendorName', icon: 'bi bi-building' },
            { label: 'Item', key: 'item', icon: 'bi bi-box-seam', section: 'Order' },
            { label: 'Qty', key: 'qty', icon: 'bi bi-123', section: 'Order' },
            { label: 'Date', key: 'date', mono: true, icon: 'bi bi-calendar-event', section: 'Order' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Order' },
            { label: 'Unit Price', key: 'unitPrice', format: (v: number) => formatCurrency(v || 0, selectedCompany?.currency), icon: 'bi bi-tag', section: 'Amount' },
            { label: 'Total', key: 'total', format: (v: number) => formatCurrency(v || 0, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Amount' },
          ]}
          title={r => `Purchase Order ${r.poNumber}`} subtitle={r => r.vendorName}
          onClose={poModal.close} />
      )}
      {rfqModal.selected && (
        <RowModal row={rfqModal.selected}
          icon="bi bi-envelope-open" accentColor="#7c3aed"
          fields={[
            { label: 'RFQ #', key: 'rfqNumber', mono: true, icon: 'bi bi-hash' },
            { label: 'Item', key: 'item', icon: 'bi bi-box-seam' },
            { label: 'Vendors Invited', key: 'vendorsInvited', icon: 'bi bi-people', section: 'Sourcing' },
            { label: 'Sent On', key: 'sentDate', icon: 'bi bi-calendar-event', section: 'Sourcing' },
            { label: 'Quotes Received', key: 'quotesReceived', icon: 'bi bi-inboxes', section: 'Sourcing' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Sourcing' },
          ]}
          title={r => `RFQ ${r.rfqNumber}`} subtitle={r => r.item}
          onClose={rfqModal.close} />
      )}
      {vendorModal.selected && (
        <RowModal row={vendorModal.selected}
          icon="bi bi-building" accentColor="#0891b2"
          fields={[
            { label: 'Vendor Name', key: 'name', icon: 'bi bi-building' },
            { label: 'Type', key: 'type', icon: 'bi bi-collection', section: 'Details' },
            { label: 'Contact', key: 'contact', icon: 'bi bi-person', section: 'Details' },
            { label: 'Email', key: 'email', icon: 'bi bi-envelope', section: 'Details' },
            { label: 'Rating', key: 'rating', format: (v: number) => `★ ${v}`, icon: 'bi bi-star-fill', section: 'Stats' },
            { label: 'Orders Placed', key: 'ordersCount', icon: 'bi bi-bag-check', section: 'Stats' },
          ]}
          title={r => r.name} subtitle={r => r.type}
          onClose={vendorModal.close} />
      )}
    </div>
  );
};
