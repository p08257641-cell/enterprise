import React, { useState } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, ViewModal } from './shared';

export const SalesView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, salesOrders, salesCustomers, salesQuotations, salesTargets, budgets,
    onCreateSalesOrder, onUpdateSalesOrder, onCreateSalesCustomer, onUpdateSalesCustomer, onDeleteSalesCustomer,
    onCreateSalesQuotation, onUpdateSalesQuotation, onDeleteSalesQuotation,
    onCreateSalesTarget, onUpdateSalesTarget, onDeleteSalesTarget } = props;

  const salesTab: 'orders' | 'quotes' | 'customers' | 'targets' =
    activeView === 'sales' ? 'orders'
      : activeView === 'sales-quotes' ? 'quotes'
        : activeView === 'sales-customers' ? 'customers'
          : activeView === 'sales-targets' ? 'targets'
            : 'orders';

  const companyOrders = salesOrders.filter(o => o.companyId === selectedCompany.id);
  const companyCustomers = salesCustomers.filter(c => c.companyId === selectedCompany.id);
  const companyQuotes = salesQuotations.filter(q => q.companyId === selectedCompany.id);
  const companyTargets = salesTargets.filter(t => t.companyId === selectedCompany.id);
  const completedRevenue = companyOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0);
  const monthlyTarget = companyTargets.reduce((s, t) => s + t.targetAmount, 0) || budgets.filter(b => b.companyId === selectedCompany.id).reduce((s, b) => s + (b.budgetAmount ?? 0), 0);
  const quotaPct = monthlyTarget > 0 ? Math.round((completedRevenue / monthlyTarget) * 100) : 0;

  // Orders state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    customerName: '', itemName: '', itemSku: '', itemQty: '1', itemPrice: '',
    tax: '0', discount: '0', priority: 'Medium' as const, expectedDelivery: '', notes: '',
  });

  // Customer state
  const [showCustModal, setShowCustModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const [viewCust, setViewCust] = useState<any>(null);

  // Quotation state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const emptyQuoteItem = { itemName: '', itemSku: '', itemQty: '1', itemPrice: '' };
  const [quoteForm, setQuoteForm] = useState({
    customerName: '', tax: '0', validUntil: '', notes: '',
    items: [{ ...emptyQuoteItem }],
  });
  const setQuoteItems = (items: typeof quoteForm.items) => setQuoteForm(f => ({ ...f, items }));
  const [viewQuote, setViewQuote] = useState<any>(null);

  // Target state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetForm, setTargetForm] = useState({ repName: '', month: 'July', year: '2026', targetAmount: '' });

  // View order modal
  const [viewOrder, setViewOrder] = useState<any>(null);

  const handleCreate = () => {
    if (!form.customerName || !form.itemName || !form.itemPrice) return;
    const qty = Number(form.itemQty) || 1;
    const unitPrice = Number(form.itemPrice);
    const itemTotal = qty * unitPrice;
    const subtotal = itemTotal;
    const tax = Number(form.tax);
    const discount = Number(form.discount);

    onCreateSalesOrder({
      companyId: selectedCompany.id,
      customerName: form.customerName,
      customerId: '',
      items: [{ name: form.itemName, sku: form.itemSku, quantity: qty, unitPrice, total: itemTotal }],
      subtotal, tax, discount, total: subtotal + tax - discount,
      priority: form.priority, assignedTo: selectedUser?.id, assignedToName: selectedUser?.name,
      expectedDelivery: form.expectedDelivery, notes: form.notes, orderDate: new Date().toISOString().split('T')[0],
    });
    setForm({ customerName: '', itemName: '', itemSku: '', itemQty: '1', itemPrice: '', tax: '0', discount: '0', priority: 'Medium', expectedDelivery: '', notes: '' });
    setShowCreate(false);
  };

  const handleCreateCustomer = () => {
    if (!custForm.name) return;
    onCreateSalesCustomer({ companyId: selectedCompany.id, ...custForm });
    setCustForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
    setShowCustModal(false);
  };

  const handleCreateQuote = () => {
    const validItems = quoteForm.items.filter(it => it.itemName && it.itemPrice);
    if (!quoteForm.customerName || validItems.length === 0) return;
    const items = validItems.map(it => {
      const qty = Number(it.itemQty) || 1;
      const unitPrice = Number(it.itemPrice);
      return { name: it.itemName, sku: it.itemSku, quantity: qty, unitPrice, total: qty * unitPrice };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const tax = Number(quoteForm.tax);
    onCreateSalesQuotation({
      companyId: selectedCompany.id,
      customerName: quoteForm.customerName, customerId: '',
      items,
      subtotal, tax, total: subtotal + tax,
      validUntil: quoteForm.validUntil, assignedTo: selectedUser?.id, assignedToName: selectedUser?.name,
      notes: quoteForm.notes,
    });
    setQuoteForm({ customerName: '', tax: '0', validUntil: '', notes: '', items: [{ ...emptyQuoteItem }] });
    setShowQuoteModal(false);
  };

  const handleCreateTarget = () => {
    if (!targetForm.repName || !targetForm.targetAmount) return;
    const rep = employees.find(e => e.firstName + ' ' + e.lastName === targetForm.repName);
    onCreateSalesTarget({
      companyId: selectedCompany.id,
      repId: rep?.id || '', repName: targetForm.repName,
      month: targetForm.month, year: targetForm.year,
      targetAmount: Number(targetForm.targetAmount),
    });
    setTargetForm({ repName: '', month: 'July', year: '2026', targetAmount: '' });
    setShowTargetModal(false);
  };

  const statusVariant = (s: string) => {
    if (s === 'Completed' || s === 'Shipped' || s === 'Accepted') return 'success';
    if (s === 'Processing' || s === 'Confirmed' || s === 'Sent') return 'info';
    if (s === 'Cancelled' || s === 'Rejected' || s === 'Expired') return 'danger';
    return 'warning';
  };

  const priorityVariant = (p: string) => {
    if (p === 'Urgent') return 'danger';
    if (p === 'High') return 'warning';
    return 'default';
  };

  return (
    <div>
      <PageHeader
        title="Sales & Order Management"
        subtitle="Manage sales orders, quotations, customer accounts and territory performance."
        action={
          <div className="flex gap-2">
            {salesTab === 'orders' && <PrimaryBtn onClick={() => setShowCreate(true)}><i className="bi bi-plus-lg mr-1"></i> New Order</PrimaryBtn>}
            {salesTab === 'quotes' && <PrimaryBtn onClick={() => setShowQuoteModal(true)}><i className="bi bi-plus-lg mr-1"></i> New Quote</PrimaryBtn>}
            {salesTab === 'customers' && <PrimaryBtn onClick={() => setShowCustModal(true)}><i className="bi bi-plus-lg mr-1"></i> New Customer</PrimaryBtn>}
            {salesTab === 'targets' && <PrimaryBtn onClick={() => setShowTargetModal(true)}><i className="bi bi-plus-lg mr-1"></i> Set Target</PrimaryBtn>}
          </div>
        }
      />

      {salesTab !== 'targets' && (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total Orders" value={companyOrders.length} icon="bi bi-cart" sub="All sales orders" />
          <StatCard label="Revenue Closed" value={`$${completedRevenue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Completed order total" accent />
          <StatCard label="Processing" value={companyOrders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length} icon="bi bi-hourglass-split" sub="Orders in progress" />
          <StatCard label="Customers" value={companyCustomers.length} icon="bi bi-people" sub="Registered customers" />
        </div>
      )}

      {/* ─── Orders Tab ─── */}
      {salesTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Order ID' }, { label: 'Customer' }, { label: 'Items' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Priority' }, { label: 'Status' }, { label: 'Actions' }]} />
            <tbody className="divide-y divide-slate-100">
              {companyOrders.length === 0 && <EmptyRow cols={8} message="No sales orders yet. Create your first order to get started." />}
              {companyOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{o.customerName}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{o.orderDate}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${o.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={o.priority} variant={priorityVariant(o.priority)} /></td>
                  <td className="px-4 py-3"><Badge label={o.status} variant={statusVariant(o.status)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewOrder(o)} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><i className="bi bi-eye mr-0.5"></i> View</button>
                      <select value={o.status} onChange={e => onUpdateSalesOrder(o.id, { status: e.target.value as any })} className="text-[10px] font-semibold border border-slate-200 rounded px-2 py-1 bg-white cursor-pointer">
                        {['Draft', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Quotations Tab ─── */}
      {salesTab === 'quotes' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Quote ID' }, { label: 'Customer' }, { label: 'Items' }, { label: 'Valid Until' }, { label: 'Total', right: true }, { label: 'Status' }, { label: 'Actions' }]} />
            <tbody className="divide-y divide-slate-100">
              {companyQuotes.length === 0 && <EmptyRow cols={7} message="No quotations yet. Create your first quote to get started." />}
              {companyQuotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{q.quoteNumber}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{q.customerName}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{q.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{q.validUntil || '—'}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${q.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={q.status} variant={statusVariant(q.status)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewQuote(q)} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><i className="bi bi-eye mr-0.5"></i> View</button>
                      {q.status === 'Draft' && <button onClick={() => onUpdateSalesQuotation(q.id, { status: 'Sent' })} className="text-xs font-semibold text-blue-500 hover:text-blue-700 cursor-pointer">Send</button>}
                      {q.status === 'Sent' && <>
                        <button onClick={() => onUpdateSalesQuotation(q.id, { status: 'Accepted' })} className="text-xs font-semibold text-emerald-500 hover:text-emerald-700 cursor-pointer">Accept</button>
                        <button onClick={() => onUpdateSalesQuotation(q.id, { status: 'Rejected' })} className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer">Reject</button>
                      </>}
                      <button onClick={() => onDeleteSalesQuotation(q.id)} className="text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Customers Tab ─── */}
      {salesTab === 'customers' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Customer' }, { label: 'Company' }, { label: 'Email' }, { label: 'Orders' }, { label: 'Total Spend', right: true }, { label: 'Last Order' }, { label: 'Actions' }]} />
            <tbody className="divide-y divide-slate-100">
              {companyCustomers.length === 0 && <EmptyRow cols={7} message="No customers yet. Add your first customer to get started." />}
              {companyCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c.company || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{c.totalOrders}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${c.totalSpend.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{c.lastOrderDate || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewCust(c)} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><i className="bi bi-eye mr-0.5"></i> View</button>
                      <button onClick={() => onDeleteSalesCustomer(c.id)} className="text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Targets Tab ─── */}
      {salesTab === 'targets' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Quota Attainment" value={`${quotaPct}%`} icon="bi bi-bullseye" sub={`vs. $${monthlyTarget.toLocaleString()} monthly target`} accent />
            <StatCard label="Revenue Closed" value={`$${completedRevenue.toLocaleString()}`} icon="bi bi-graph-up" sub="This month" color="text-emerald-600" />
            <StatCard label="Remaining" value={`$${Math.max(0, monthlyTarget - completedRevenue).toLocaleString()}`} icon="bi bi-flag" sub="To hit monthly target" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Sales Rep' }, { label: 'Month' }, { label: 'Target', right: true }, { label: 'Achieved', right: true }, { label: 'Attainment' }, { label: 'Actions' }]} />
              <tbody className="divide-y divide-slate-100">
                {companyTargets.length === 0 && <EmptyRow cols={6} message="No targets set. Create targets for your sales reps." />}
                {companyTargets.map(t => {
                  const pct = t.targetAmount > 0 ? Math.round((t.actualAmount / t.targetAmount) * 100) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.repName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{t.month} {t.year}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${t.targetAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${t.actualAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => onDeleteSalesTarget(t.id)} className="text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Create Order Modal ─── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-5"><i className="bi bi-cart-plus text-slate-800 mr-1.5"></i> New Sales Order</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Customer Name</Label><Input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="e.g. Acme Corp" /></div>
                <div><Label>Priority</Label><Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
                  <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
                </Select></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Line Item</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><Label>Item Name</Label><Input value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} placeholder="Product or service" /></div>
                  <div><Label>SKU</Label><Input value={form.itemSku} onChange={e => setForm({ ...form, itemSku: e.target.value })} placeholder="Optional" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div><Label>Quantity</Label><Input type="number" value={form.itemQty} onChange={e => setForm({ ...form, itemQty: e.target.value })} /></div>
                  <div><Label>Unit Price ($)</Label><Input type="number" value={form.itemPrice} onChange={e => setForm({ ...form, itemPrice: e.target.value })} placeholder="0.00" /></div>
                  <div><Label>Item Total</Label><div className="text-sm font-bold text-slate-900 mt-1">${((Number(form.itemQty) || 0) * (Number(form.itemPrice) || 0)).toLocaleString()}</div></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tax ($)</Label><Input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} /></div>
                <div><Label>Discount ($)</Label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDelivery} onChange={e => setForm({ ...form, expectedDelivery: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes" /></div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2">
                <SecBtn onClick={() => setShowCreate(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={handleCreate}>Create Order</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Customer Modal ─── */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-5"><i className="bi bi-person-plus text-slate-800 mr-1.5"></i> New Customer</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Full Name</Label><Input value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} placeholder="e.g. Richard Hendricks" /></div>
                <div><Label>Company</Label><Input value={custForm.company} onChange={e => setCustForm({ ...custForm, company: e.target.value })} placeholder="e.g. Pied Piper" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={custForm.email} onChange={e => setCustForm({ ...custForm, email: e.target.value })} placeholder="email@example.com" /></div>
                <div><Label>Phone</Label><Input value={custForm.phone} onChange={e => setCustForm({ ...custForm, phone: e.target.value })} placeholder="+1-555-0100" /></div>
              </div>
              <div><Label>Address</Label><Input value={custForm.address} onChange={e => setCustForm({ ...custForm, address: e.target.value })} placeholder="Full address" /></div>
              <div><Label>Notes</Label><Input value={custForm.notes} onChange={e => setCustForm({ ...custForm, notes: e.target.value })} placeholder="Internal notes" /></div>
              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2">
                <SecBtn onClick={() => setShowCustModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={handleCreateCustomer}>Add Customer</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Quotation Modal ─── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-5"><i className="bi bi-file-earmark-check text-slate-800 mr-1.5"></i> New Quotation</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Customer Name</Label><Input value={quoteForm.customerName} onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })} placeholder="e.g. Acme Corp" /></div>
                <div><Label>Valid Until</Label><Input type="date" value={quoteForm.validUntil} onChange={e => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} /></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Line Items</span>
                  <button type="button" onClick={() => setQuoteItems([...quoteForm.items, { ...emptyQuoteItem }])} className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                    <i className="bi bi-plus-lg text-[10px]"></i> Add Line Item
                  </button>
                </div>
                {quoteForm.items.map((it, idx) => {
                  const lineTotal = (Number(it.itemQty) || 0) * (Number(it.itemPrice) || 0);
                  return (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                        {quoteForm.items.length > 1 && (
                          <button type="button" onClick={() => setQuoteItems(quoteForm.items.filter((_, i) => i !== idx))} className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-1">
                            <i className="bi bi-trash text-[10px]"></i> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2"><Label>Item Name</Label><Input value={it.itemName} onChange={e => setQuoteItems(quoteForm.items.map((x, i) => i === idx ? { ...x, itemName: e.target.value } : x))} placeholder="Product or service" /></div>
                        <div><Label>SKU</Label><Input value={it.itemSku} onChange={e => setQuoteItems(quoteForm.items.map((x, i) => i === idx ? { ...x, itemSku: e.target.value } : x))} placeholder="Optional" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div><Label>Quantity</Label><Input type="number" value={it.itemQty} onChange={e => setQuoteItems(quoteForm.items.map((x, i) => i === idx ? { ...x, itemQty: e.target.value } : x))} /></div>
                        <div><Label>Unit Price ($)</Label><Input type="number" value={it.itemPrice} onChange={e => setQuoteItems(quoteForm.items.map((x, i) => i === idx ? { ...x, itemPrice: e.target.value } : x))} placeholder="0.00" /></div>
                        <div><Label>Item Total</Label><div className="text-sm font-bold text-slate-900 mt-1">${lineTotal.toLocaleString()}</div></div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end pt-1">
                  <div className="text-xs font-semibold text-slate-500">Subtotal: <span className="text-slate-900">${(quoteForm.items.reduce((s, it) => s + (Number(it.itemQty) || 0) * (Number(it.itemPrice) || 0), 0)).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tax ($)</Label><Input type="number" value={quoteForm.tax} onChange={e => setQuoteForm({ ...quoteForm, tax: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={quoteForm.notes} onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })} placeholder="Internal notes" /></div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2">
                <SecBtn onClick={() => setShowQuoteModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={handleCreateQuote}>Create Quote</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Set Target Modal ─── */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-5"><i className="bi bi-bullseye text-slate-800 mr-1.5"></i> Set Sales Target</h2>
            <div className="space-y-4">
              <div><Label>Sales Rep</Label><Select value={targetForm.repName} onChange={e => setTargetForm({ ...targetForm, repName: e.target.value })}>
                <option value="">Select rep...</option>
                {employees.filter(e => e.companyId === selectedCompany.id && e.status === 'Active').map(e => {
                  const name = `${e.firstName} ${e.lastName}`;
                  return <option key={e.id} value={name}>{name} — {e.department}</option>;
                })}
              </Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Month</Label><Select value={targetForm.month} onChange={e => setTargetForm({ ...targetForm, month: e.target.value })}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
                </Select></div>
                <div><Label>Year</Label><Input type="number" value={targetForm.year} onChange={e => setTargetForm({ ...targetForm, year: e.target.value })} /></div>
              </div>
              <div><Label>Target Amount ($)</Label><Input type="number" value={targetForm.targetAmount} onChange={e => setTargetForm({ ...targetForm, targetAmount: e.target.value })} placeholder="e.g. 75000" /></div>
              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2">
                <SecBtn onClick={() => setShowTargetModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={handleCreateTarget}>Set Target</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Order Modal ─── */}
      {viewOrder && (
        <ViewModal title={viewOrder.orderNumber} subtitle={`Order details for ${viewOrder.customerName}`} onClose={() => setViewOrder(null)}>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#0ea5e90d', border: '1px solid #0ea5e91f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#0ea5e9' }}>
              <i className="bi bi-bag-check text-lg" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{viewOrder.orderNumber}</div>
              <div className="text-xs text-slate-500 truncate">{viewOrder.customerName}</div>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#0ea5e9' }} />Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Customer', value: viewOrder.customerName, icon: 'bi bi-person' },
                { label: 'Order Date', value: viewOrder.orderDate, icon: 'bi bi-calendar-event' },
                { label: 'Delivery', value: viewOrder.expectedDelivery || '—', icon: 'bi bi-truck' },
                { label: 'Assigned To', value: viewOrder.assignedToName || '—', icon: 'bi bi-person-badge' },
                { label: 'Priority', value: <Badge label={viewOrder.priority} variant={viewOrder.priority === 'Urgent' ? 'danger' : viewOrder.priority === 'High' ? 'warning' : 'default'} />, icon: 'bi bi-flag' },
                { label: 'Status', value: <Badge label={viewOrder.status} variant={viewOrder.status === 'Completed' ? 'success' : viewOrder.status === 'Cancelled' ? 'danger' : viewOrder.status === 'Shipped' || viewOrder.status === 'Confirmed' ? 'info' : 'default'} />, icon: 'bi bi-activity' },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                  <div className="data-value font-semibold text-slate-900">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#0ea5e9' }} />Pricing</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Subtotal', value: `$${viewOrder.subtotal?.toLocaleString()}`, icon: 'bi bi-receipt' },
                { label: 'Tax', value: `$${viewOrder.tax?.toLocaleString()}`, icon: 'bi bi-percent' },
                { label: 'Discount', value: `-$${viewOrder.discount?.toLocaleString()}`, icon: 'bi bi-tag' },
                { label: 'Total', value: `$${viewOrder.total?.toLocaleString()}`, icon: 'bi bi-wallet2' },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                  <div className="data-value font-semibold text-slate-900">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          {viewOrder.items?.length > 0 && (
            <div className="mb-5">
              <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#0ea5e9' }} />Line Items</h3>
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/60 border-b border-slate-100"><tr>
                    <th className="px-3 py-2 section-title text-slate-400">Item</th>
                    <th className="px-3 py-2 section-title text-slate-400">SKU</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Qty</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Unit Price</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewOrder.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="px-3 py-2 text-xs text-slate-700">{item.name}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{item.sku || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-700 text-right font-sans tabular-nums">{item.quantity}</td>
                        <td className="px-3 py-2 text-xs text-slate-700 text-right font-sans tabular-nums">${item.unitPrice?.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-slate-900 text-right font-sans tabular-nums font-semibold">${item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {viewOrder.notes && <div><h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#0ea5e9' }} />Notes</h3><p className="text-xs text-slate-700 whitespace-pre-wrap">{viewOrder.notes}</p></div>}
        </ViewModal>
      )}

      {/* ─── View Customer Modal ─── */}
      {viewCust && (
        <ViewModal title={viewCust.name} subtitle={viewCust.company || 'No company'} onClose={() => setViewCust(null)} size="lg">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#6366f10d', border: '1px solid #6366f11f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#6366f1' }}>
              <i className="bi bi-people text-lg" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{viewCust.name}</div>
              <div className="text-xs text-slate-500 truncate">{viewCust.company || 'No company'}</div>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#6366f1' }} />Contact</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Email', value: viewCust.email, icon: 'bi bi-envelope' },
                { label: 'Phone', value: viewCust.phone, icon: 'bi bi-telephone' },
                { label: 'Address', value: viewCust.address, icon: 'bi bi-geo-alt' },
                { label: 'Total Orders', value: viewCust.totalOrders, icon: 'bi bi-bag-check' },
                { label: 'Total Spend', value: `$${viewCust.totalSpend?.toLocaleString()}`, icon: 'bi bi-wallet2' },
                { label: 'Last Order', value: viewCust.lastOrderDate || '—', icon: 'bi bi-calendar-event' },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                  <div className="data-value font-semibold text-slate-900">{f.value || '—'}</div>
                </div>
              ))}
            </div>
          </div>
          {viewCust.notes && <div><h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#6366f1' }} />Notes</h3><p className="text-xs text-slate-700 whitespace-pre-wrap">{viewCust.notes}</p></div>}
        </ViewModal>
      )}

      {/* ─── View Quotation Modal ─── */}
      {viewQuote && (
        <ViewModal title={viewQuote.quoteNumber} subtitle={`Quotation for ${viewQuote.customerName}`} onClose={() => setViewQuote(null)}>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#8b5cf60d', border: '1px solid #8b5cf61f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#8b5cf6' }}>
              <i className="bi bi-file-earmark-check text-lg" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{viewQuote.quoteNumber}</div>
              <div className="text-xs text-slate-500 truncate">{viewQuote.customerName}</div>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#8b5cf6' }} />Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Customer', value: viewQuote.customerName, icon: 'bi bi-person' },
                { label: 'Valid Until', value: viewQuote.validUntil || '—', icon: 'bi bi-calendar-event' },
                { label: 'Assigned To', value: viewQuote.assignedToName || '—', icon: 'bi bi-person-badge' },
                { label: 'Status', value: <Badge label={viewQuote.status} variant={viewQuote.status === 'Accepted' ? 'success' : viewQuote.status === 'Rejected' || viewQuote.status === 'Expired' ? 'danger' : viewQuote.status === 'Sent' ? 'info' : 'default'} />, icon: 'bi bi-activity', full: true },
              ].map((f) => (
                <div key={f.label} className={`rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 ${f.full ? 'col-span-2 sm:col-span-3' : ''}`}>
                  <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                  <div className="data-value font-semibold text-slate-900">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#8b5cf6' }} />Pricing</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Subtotal', value: `$${viewQuote.subtotal?.toLocaleString()}`, icon: 'bi bi-receipt' },
                { label: 'Tax', value: `$${viewQuote.tax?.toLocaleString()}`, icon: 'bi bi-percent' },
                { label: 'Total', value: `$${viewQuote.total?.toLocaleString()}`, icon: 'bi bi-wallet2' },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                  <div className="data-value font-semibold text-slate-900">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          {viewQuote.items?.length > 0 && (
            <div className="mb-5">
              <h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#8b5cf6' }} />Line Items</h3>
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/60 border-b border-slate-100"><tr>
                    <th className="px-3 py-2 section-title text-slate-400">Item</th>
                    <th className="px-3 py-2 section-title text-slate-400">SKU</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Qty</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Unit Price</th>
                    <th className="px-3 py-2 section-title text-slate-400 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewQuote.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="px-3 py-2 text-xs text-slate-700">{item.name}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{item.sku || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-700 text-right font-sans tabular-nums">{item.quantity}</td>
                        <td className="px-3 py-2 text-xs text-slate-700 text-right font-sans tabular-nums">${item.unitPrice?.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-slate-900 text-right font-sans tabular-nums font-semibold">${item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {viewQuote.notes && <div><h3 className="section-title text-slate-400 mb-2.5 flex items-center gap-1.5"><span className="h-3 w-0.5 rounded-full" style={{ background: '#8b5cf6' }} />Notes</h3><p className="text-xs text-slate-700 whitespace-pre-wrap">{viewQuote.notes}</p></div>}
        </ViewModal>
      )}
    </div>
  );
};
