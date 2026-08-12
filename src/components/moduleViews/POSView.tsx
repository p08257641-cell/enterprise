import { formatCurrency } from '../../utils/currency';
import React, { useState } from 'react';
import { ModuleViewsProps, PageHeader, Badge, TableHead, PrimaryBtn, SecBtn, StatCard, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';

export const POSView: React.FC<ModuleViewsProps> = (props) => {
  const {
    activeView, selectedCompany, selectedUser, employees,
    posProducts, posCustomers, posSales, posCategories, posTerminals, posShifts, posDiscounts, posReturns, posDailyReports,
    onCreatePOSSale, onAddPOSProduct, onAddPOSCustomer, onCreatePOSShift, onClosePOSShift
  } = props;

  const tab: 'terminal' | 'products' | 'customers' | 'shifts' | 'sales' | 'discounts' | 'returns' | 'reports' | 'sessions' =
    activeView === 'pos-products' ? 'products'
      : activeView === 'pos-customers' ? 'customers'
        : activeView === 'pos-shifts' ? 'shifts'
          : activeView === 'pos-sales' ? 'sales'
            : activeView === 'pos-discounts' ? 'discounts'
              : activeView === 'pos-returns' ? 'returns'
                : activeView === 'pos-reports' ? 'reports'
                  : activeView === 'pos-sessions' ? 'sessions'
                    : activeView === 'pos-register' ? 'terminal'
                      : 'terminal';

  const localProducts = posProducts.filter(p => p.companyId === selectedCompany.id);
  const localCustomers = posCustomers.filter(c => c.companyId === selectedCompany.id);
  const localSales = posSales.filter(s => s.companyId === selectedCompany.id);
  const localShifts = posShifts.filter(s => s.companyId === selectedCompany.id);
  const localDiscounts = posDiscounts.filter(d => d.companyId === selectedCompany.id);
  const localReturns = posReturns.filter(r => r.companyId === selectedCompany.id);
  const localTerminals = posTerminals.filter(t => t.companyId === selectedCompany.id);
  const localReports = posDailyReports.filter(r => r.companyId === selectedCompany.id);

  const productModal = useRowModal<typeof localProducts[0]>();
  const customerModal = useRowModal<typeof localCustomers[0]>();
  const saleModal = useRowModal<typeof localSales[0]>();
  const discountModal = useRowModal<typeof localDiscounts[0]>();
  const returnModal = useRowModal<typeof localReturns[0]>();
  const shiftModal = useRowModal<typeof localShifts[0]>();
  const terminalModal = useRowModal<typeof localTerminals[0]>();

  // Cart & Terminal Checkout states
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState<{ ref: string; total: number; ts: string } | null>(null);

  // Add Product Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Beverages');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('100');
  const [prodReorder, setProdReorder] = useState('10');

  // Add Customer Modal states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [custFirst, setCustFirst] = useState('');
  const [custLast, setCustLast] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custTier, setCustTier] = useState('Standard');

  // Open Shift Modal states
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [shiftTerminalId, setShiftTerminalId] = useState('');
  const [shiftOpeningBalance, setShiftOpeningBalance] = useState('0');
  const [shiftNotes, setShiftNotes] = useState('');

  const addToCart = (p: { id: string; name: string; unitPrice: number }) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.unitPrice, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal * (1 - discount / 100);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodSku || !prodName || !prodPrice) return;
    onAddPOSProduct({
      companyId: selectedCompany.id,
      sku: prodSku,
      name: prodName,
      category: prodCat,
      unitPrice: Number(prodPrice) || 0,
      costPrice: 0,
      taxRate: 0,
      isActive: true,
      stockLevel: Number(prodStock) || 0,
      reorderLevel: Number(prodReorder) || 0,
      updatedAt: new Date().toISOString()
    });
    setProdSku('');
    setProdName('');
    setProdPrice('');
    setProdStock('100');
    setProdReorder('10');
    setShowAddProductModal(false);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custFirst || !custLast || !custEmail) return;
    onAddPOSCustomer({
      companyId: selectedCompany.id,
      firstName: custFirst,
      lastName: custLast,
      email: custEmail,
      phone: custPhone,
      tier: custTier as 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
      loyaltyPoints: 0,
      totalPurchases: 0,
      totalSpent: 0,
      storeCredit: 0,
      isActive: true,
      updatedAt: new Date().toISOString()
    });
    setCustFirst('');
    setCustLast('');
    setCustEmail('');
    setCustPhone('');
    setCustTier('Standard');
    setShowAddCustomerModal(false);
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTerminalId) return;
    onCreatePOSShift({
      companyId: selectedCompany.id,
      terminalId: shiftTerminalId,
      employeeId: selectedUser?.id || '',
      employeeName: selectedUser?.name || '',
      startTime: new Date().toISOString(),
      openingBalance: Number(shiftOpeningBalance) || 0,
      cashSales: 0,
      cardSales: 0,
      digitalWalletSales: 0,
      storeCreditSales: 0,
      totalSales: 0,
      refunds: 0,
      status: 'Open',
      notes: shiftNotes,
    });
    setShiftTerminalId('');
    setShiftOpeningBalance('0');
    setShiftNotes('');
    setShowOpenShiftModal(false);
  };

  const pageTitle: Record<string, string> = {
    terminal: 'POS Terminal', products: 'Products', customers: 'Customers', shifts: 'Shifts',
    sales: 'Sales History', discounts: 'Discounts', returns: 'Returns', reports: 'Reports', sessions: 'POS Sessions',
  };
  const pageSubtitle: Record<string, string> = {
    terminal: 'Process sales transactions, manage the cash register and issue digital receipts.',
    products: 'Catalog of items available for sale at the point of sale.',
    customers: 'People and organizations who purchase at the register.',
    shifts: 'Cashier shifts and till openings/closings.',
    sales: 'A record of completed point-of-sale transactions.',
    discounts: 'Promotional codes and pricing rules applied at checkout.',
    returns: 'Returned items and refund processing.',
    reports: 'Sales performance and till summaries for the POS.',
    sessions: 'Active and historical POS register sessions.',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <PageHeader title={pageTitle[tab]} subtitle={pageSubtitle[tab]} />
        </div>
        {tab === 'products' && (
          <PrimaryBtn onClick={() => setShowAddProductModal(true)} icon="bi bi-plus-lg">Add Product</PrimaryBtn>
        )}
        {tab === 'customers' && (
          <PrimaryBtn onClick={() => setShowAddCustomerModal(true)} icon="bi bi-person-plus">Register Customer</PrimaryBtn>
        )}
        {tab === 'shifts' && (
          <PrimaryBtn onClick={() => setShowOpenShiftModal(true)} icon="bi bi-plus-lg">Open Shift</PrimaryBtn>
        )}
      </div>

      {tab === 'terminal' && (
        receipt ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl shadow-xs max-w-sm mx-auto p-6 text-center">
            <i className="bi bi-receipt fs-3xl text-slate-300 block mb-2"></i>
            <div className="fs-sm fw-bold text-slate-900">{selectedCompany.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">{receipt.ts}</div>
            <div className="border-y border-dashed border-slate-200 py-3 my-3 space-y-1">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between fs-xs"><span>{i.name} x{i.qty}</span><span className="font-mono fw-semibold">{formatCurrency((i.price * i.qty), selectedCompany?.currency)}</span></div>
              ))}
            </div>
            {discount > 0 && (
              <div className="flex justify-between fs-xs text-rose-600"><span>Discount ({discount}%)</span><span>-${(subtotal * discount / 100).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between fs-sm fw-bold text-slate-900 mt-2"><span>TOTAL</span><span>{formatCurrency(receipt.total, selectedCompany?.currency)}</span></div>
            <div className="text-[10px] text-slate-400 mt-3">Ref: {receipt.ref}</div>
            <PrimaryBtn onClick={() => { setReceipt(null); setCart([]); setDiscount(0); }}>New Transaction</PrimaryBtn>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-3 grid-cols-3">
              {localProducts.filter(p => p.isActive !== false).map(p => (
                <button key={p.id} onClick={() => addToCart(p)} className="bg-white border border-slate-200 rounded-xl p-3.5 text-left hover:shadow-md transition-all cursor-pointer">
                  <div className="fs-xs fw-bold text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.category}</div>
                  <div className="fs-sm fw-bold text-slate-900 mt-2">{formatCurrency(p.unitPrice, selectedCompany?.currency)}</div>
                </button>
              ))}
              {localProducts.length === 0 && <div className="col-span-3 fs-xs text-slate-400 text-center py-8">No products configured.</div>}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="section-title text-slate-500">Current Order</div>
              </div>
              <div className="p-4 min-h-[160px]">
                {cart.length === 0 && <div className="fs-xs text-slate-400 text-center py-7">Tap products to add them.</div>}
                {cart.map(i => (
                  <div key={i.id} className="flex items-center justify-between fs-xs mb-2">
                    <span className="fw-semibold text-slate-900 truncate flex-1 mr-2">{i.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(i.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"><i className="bi bi-dash text-[10px]"></i></button>
                      <span className="w-6 text-center fw-semibold text-slate-900 tabular-nums">{i.qty}</span>
                      <button onClick={() => updateQty(i.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"><i className="bi bi-plus text-[10px]"></i></button>
                      <button onClick={() => removeFromCart(i.id)} className="w-6 h-6 flex items-center justify-center rounded bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 cursor-pointer ml-1"><i className="bi bi-x text-[10px]"></i></button>
                    </div>
                    <span className="text-slate-500 w-16 text-right tabular-nums shrink-0">{formatCurrency((i.price * i.qty), selectedCompany?.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between fs-xs"><span className="text-slate-500">Subtotal</span><span className="fw-bold text-slate-900">{formatCurrency(subtotal, selectedCompany?.currency)}</span></div>
                <div className="flex justify-between items-center fs-xs">
                  <span className="text-slate-500">Discount %</span>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-16 text-right border border-slate-200 rounded-lg px-2 py-1 fs-xs" />
                </div>
                <div className="flex justify-between fs-sm fw-bold border-t border-slate-100 pt-2"><span>Total</span><span>{formatCurrency(total, selectedCompany?.currency)}</span></div>
                <PrimaryBtn onClick={() => {
                  if (cart.length === 0) return;
                  onCreatePOSSale({
                    companyId: selectedCompany.id,
                    terminalId: localTerminals[0]?.id || '',
                    shiftId: localShifts.find(s => s.status === 'Open')?.id || '',
                    saleNumber: `TXN-${Date.now().toString().slice(-6)}`,
                    subtotal,
                    tax: 0,
                    discount: subtotal * discount / 100,
                    total,
                    paymentMethod: 'Cash',
                    paymentStatus: 'Paid',
                    items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.qty, unitPrice: i.price, total: i.price * i.qty })),
                    payments: [{ method: 'Cash', amount: total }],
                    createdBy: '',
                  });
                  setReceipt({ ref: `TXN-${Date.now().toString().slice(-6)}`, total, ts: new Date().toLocaleString() });
                }}>Charge ${total.toFixed(2)}</PrimaryBtn>
              </div>
            </div>
          </div>
        )
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Products" value={localProducts.length} icon="bi bi-box-seam" sub="In catalog" />
            <StatCard label="Active Products" value={localProducts.filter(p => p.isActive !== false).length} icon="bi bi-check-circle" sub="Available for sale" />
            <StatCard label="Low Stock" value={localProducts.filter(p => p.stockLevel <= p.reorderLevel).length} icon="bi bi-exclamation-triangle" sub="Need reorder" color="text-amber-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'SKU' }, { label: 'Name' }, { label: 'Category' }, { label: 'Price', right: true }, { label: 'Stock', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900 text-right">{formatCurrency(p.unitPrice, selectedCompany?.currency)}</td>
                    <td className={`px-4 py-3 fs-xs font-mono fw-semibold text-right ${p.stockLevel <= p.reorderLevel ? 'text-rose-600' : 'text-slate-900'}`}>{p.stockLevel}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); productModal.open(p); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Customers" value={localCustomers.length} icon="bi bi-people" sub="Registered" />
            <StatCard label="Total Revenue" value={formatCurrency(localCustomers.reduce((s, c) => s + (c.totalSpent || 0), 0), selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="All customers" accent />
            <StatCard label="Loyalty Members" value={localCustomers.filter(c => (c.loyaltyPoints || 0) > 0).length} icon="bi bi-star" sub="With points" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Name' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Tier' }, { label: 'Lifetime Spend', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{c.email}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{c.phone || '—'}</td>
                    <td className="px-4 py-3"><Badge label={c.tier || 'Standard'} variant={c.tier === 'Gold' ? 'warning' : c.tier === 'Platinum' ? 'info' : 'default'} /></td>
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900 text-right">{formatCurrency((c.totalSpent || 0), selectedCompany?.currency)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); customerModal.open(c); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Terminal' }, { label: 'Location' }, { label: 'Status' }, { label: 'Last Sync' }, { label: 'Actions', right: true }]} />
            <tbody className="divide-y divide-slate-100">
              {localTerminals.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{t.name}</td>
                  <td className="px-4 py-3 fs-xs text-slate-500">{t.location || '—'}</td>
                  <td className="px-4 py-3"><Badge label={t.isActive !== false ? 'Active' : 'Inactive'} variant={t.isActive !== false ? 'success' : 'default'} /></td>
                  <td className="px-4 py-3 fs-xs font-mono text-slate-500">{t.lastSync || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); terminalModal.open(t); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Sales" value={localSales.length} icon="bi bi-receipt" sub="All transactions" />
            <StatCard label="Revenue" value={formatCurrency(localSales.reduce((s, x) => s + (x.total || 0), 0), selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="Gross revenue" accent />
            <StatCard label="Returns" value={localReturns.length} icon="bi bi-arrow-return-left" sub="All returns" />
            <StatCard label="Open Shifts" value={localShifts.filter(s => s.status === 'Open').length} icon="bi bi-lock" sub="Currently active" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Recent Sales</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Reference' }, { label: 'Payment' }, { label: 'Status' }, { label: 'Total', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localSales.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900">{s.saleNumber || s.id}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{s.paymentMethod}</td>
                    <td className="px-4 py-3"><Badge label={s.paymentStatus} variant={s.paymentStatus === 'Paid' ? 'success' : 'default'} /></td>
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900 text-right">{formatCurrency((s.total || 0), selectedCompany?.currency)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); saleModal.open(s); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'shifts' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Shifts" value={localShifts.length} icon="bi bi-clock-history" sub="All recorded" />
            <StatCard label="Open Shifts" value={localShifts.filter(s => s.status === 'Open').length} icon="bi bi-lock" sub="Currently active" />
            <StatCard label="Closed Shifts" value={localShifts.filter(s => s.status === 'Closed').length} icon="bi bi-unlock" sub="Completed" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Shift ID' }, { label: 'Terminal' }, { label: 'Cashier' }, { label: 'Status' }, { label: 'Opened', right: true }, { label: 'Closed', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localShifts.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{s.id}</td>
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{s.terminalId || '—'}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{s.employeeName || '—'}</td>
                    <td className="px-4 py-3"><Badge label={s.status} variant={s.status === 'Open' ? 'success' : 'default'} /></td>
                    <td className="px-4 py-3 fs-xs font-mono text-slate-500 text-right">{s.startTime ? new Date(s.startTime).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 fs-xs font-mono text-slate-500 text-right">{s.endTime ? new Date(s.endTime).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); shiftModal.open(s); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
                {localShifts.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center fs-xs text-slate-400">No shifts recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Sales" value={localSales.length} icon="bi bi-receipt" sub="Transactions" />
            <StatCard label="Revenue" value={formatCurrency(localSales.reduce((s, x) => s + (x.total || 0), 0), selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="Gross total" accent />
            <StatCard label="Average Sale" value={formatCurrency(localSales.length > 0 ? (localSales.reduce((s, x) => s + (x.total || 0), 0) / localSales.length) : 0, selectedCompany?.currency)} icon="bi bi-bar-chart" sub="Per transaction" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Reference' }, { label: 'Payment' }, { label: 'Status' }, { label: 'Items' }, { label: 'Total', right: true }, { label: 'Date', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono fw-semibold text-slate-900">{s.saleNumber || s.id}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{s.paymentMethod}</td>
                    <td className="px-4 py-3"><Badge label={s.paymentStatus} variant={s.paymentStatus === 'Paid' ? 'success' : 'default'} /></td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{s.items?.length || 0}</td>
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900 text-right">{formatCurrency((s.total || 0), selectedCompany?.currency)}</td>
                    <td className="px-4 py-3 fs-xs font-mono text-slate-500 text-right">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); saleModal.open(s); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
                {localSales.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center fs-xs text-slate-400">No sales recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'discounts' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Discounts" value={localDiscounts.length} icon="bi bi-percent" sub="All codes" />
            <StatCard label="Active" value={localDiscounts.filter(d => d.isActive !== false).length} icon="bi bi-check-circle" sub="Available" />
            <StatCard label="Inactive" value={localDiscounts.filter(d => d.isActive === false).length} icon="bi bi-pause-circle" sub="Disabled" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Name' }, { label: 'Type' }, { label: 'Value' }, { label: 'Usage' }, { label: 'Max Usage' }, { label: 'Status' }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localDiscounts.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{d.name}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{d.type}</td>
                    <td className="px-4 py-3 fs-xs font-mono fw-semibold text-slate-900">{d.type === 'Percentage' ? `${d.value}%` : formatCurrency(d.value, selectedCompany?.currency)}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{d.usageCount || 0}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{d.maxUsage ?? 'Unlimited'}</td>
                    <td className="px-4 py-3"><Badge label={d.isActive !== false ? 'Active' : 'Inactive'} variant={d.isActive !== false ? 'success' : 'default'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); discountModal.open(d); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
                {localDiscounts.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center fs-xs text-slate-400">No discounts configured</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'returns' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Returns" value={localReturns.length} icon="bi bi-arrow-return-left" sub="All returns" />
            <StatCard label="Processed" value={localReturns.filter(r => r.refundStatus === 'Processed').length} icon="bi bi-check-circle" sub="Completed" />
            <StatCard label="Pending" value={localReturns.filter(r => r.refundStatus === 'Pending').length} icon="bi bi-hourglass" sub="Awaiting" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Return #' }, { label: 'Original Sale' }, { label: 'Reason' }, { label: 'Refund Method' }, { label: 'Status' }, { label: 'Date', right: true }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localReturns.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono fw-semibold text-slate-900">{r.returnNumber || r.id}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.originalSaleId || '—'}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{r.reason || '—'}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{r.refundMethod || '—'}</td>
                    <td className="px-4 py-3"><Badge label={r.refundStatus || 'Pending'} variant={r.refundStatus === 'Processed' ? 'success' : 'warning'} /></td>
                    <td className="px-4 py-3 fs-xs font-mono text-slate-500 text-right">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); returnModal.open(r); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"><i className="bi bi-eye text-[11px]"></i> View</button>
                    </td>
                  </tr>
                ))}
                {localReturns.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center fs-xs text-slate-400">No returns recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <ViewModal title="Add POS Product" subtitle="Create a new catalog item for point of sale" onClose={() => setShowAddProductModal(false)} size="md">
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">SKU *</label>
                <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="SKU-8080" required />
              </div>
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Category *</label>
                <select value={prodCat} onChange={e => setProdCat(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950">
                  <option value="Beverages">Beverages</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Industrial">Industrial</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1">Product Name *</label>
              <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="Product Name" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Unit Price ($) *</label>
                <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="9.99" required />
              </div>
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Stock Level</label>
                <input type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" />
              </div>
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Reorder Level</label>
                <input type="number" value={prodReorder} onChange={e => setProdReorder(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <SecBtn onClick={() => setShowAddProductModal(false)}>Cancel</SecBtn>
              <PrimaryBtn type="submit" icon="bi bi-check-lg">Save Product</PrimaryBtn>
            </div>
          </form>
        </ViewModal>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <ViewModal title="Register Customer" subtitle="Register a new customer for loyalty benefits" onClose={() => setShowAddCustomerModal(false)} size="md">
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">First Name *</label>
                <input type="text" value={custFirst} onChange={e => setCustFirst(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="Jane" required />
              </div>
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Last Name *</label>
                <input type="text" value={custLast} onChange={e => setCustLast(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1">Email *</label>
              <input type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="jane.doe@email.com" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Phone</label>
                <input type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="+1 555-0199" />
              </div>
              <div>
                <label className="block fs-xs fw-semibold text-slate-700 mb-1">Tier *</label>
                <select value={custTier} onChange={e => setCustTier(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950">
                  <option value="Standard">Standard</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <SecBtn onClick={() => setShowAddCustomerModal(false)}>Cancel</SecBtn>
              <PrimaryBtn type="submit" icon="bi bi-check-lg">Register Customer</PrimaryBtn>
            </div>
          </form>
        </ViewModal>
      )}

      {showOpenShiftModal && (
        <ViewModal title="Open Shift" subtitle="Start a new cashier shift" onClose={() => setShowOpenShiftModal(false)} size="md">
          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1">Terminal *</label>
              <select value={shiftTerminalId} onChange={e => setShiftTerminalId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" required>
                <option value="">Select a terminal</option>
                {localTerminals.map(t => (
                  <option key={t.id} value={t.id}>{t.name || t.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1">Opening Balance</label>
              <input type="number" value={shiftOpeningBalance} onChange={e => setShiftOpeningBalance(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950" placeholder="0.00" min="0" step="0.01" />
              <div className="fs-xs text-slate-400 mt-1">Cash amount in the till at shift start</div>
            </div>
            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1">Notes</label>
              <textarea value={shiftNotes} onChange={e => setShiftNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-none focus:border-slate-950 resize-none" placeholder="Optional notes" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <SecBtn onClick={() => setShowOpenShiftModal(false)}>Cancel</SecBtn>
              <PrimaryBtn type="submit" icon="bi bi-play-fill">Open Shift</PrimaryBtn>
            </div>
          </form>
        </ViewModal>
      )}

      {productModal.selected && (
        <RowModal row={productModal.selected}
          icon="bi bi-tag" accentColor="#db2777"
          fields={[
            { label: 'SKU', key: 'sku', mono: true, icon: 'bi bi-hash' },
            { label: 'Name', key: 'name', icon: 'bi bi-box-seam' },
            { label: 'Category', key: 'category', icon: 'bi bi-collection', section: 'Details' },
            { label: 'Price', key: 'unitPrice', format: (v: number) => formatCurrency(v, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Details' },
            { label: 'Stock', key: 'stockLevel', icon: 'bi bi-stack', section: 'Inventory' },
            { label: 'Reorder Level', key: 'reorderLevel', icon: 'bi bi-exclamation-triangle', section: 'Inventory' },
          ]}
          title={r => r.name} subtitle={r => r.sku}
          onClose={productModal.close} />
      )}
      {customerModal.selected && (
        <RowModal row={customerModal.selected}
          icon="bi bi-person-vcard" accentColor="#2563eb"
          fields={[
            { label: 'First Name', key: 'firstName', icon: 'bi bi-person' },
            { label: 'Last Name', key: 'lastName', icon: 'bi bi-person' },
            { label: 'Tier', key: 'tier', icon: 'bi bi-star', section: 'Contact' },
            { label: 'Email', key: 'email', mono: true, icon: 'bi bi-envelope', section: 'Contact' },
            { label: 'Phone', key: 'phone', mono: true, icon: 'bi bi-telephone', section: 'Contact' },
            { label: 'Loyalty Points', key: 'loyaltyPoints', icon: 'bi bi-trophy', section: 'Loyalty' },
            { label: 'Lifetime Spend', key: 'totalSpent', format: (v: number) => formatCurrency(v || 0, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Loyalty' },
          ]}
          title={r => `${r.firstName} ${r.lastName}`} subtitle={r => r.tier || 'Standard'}
          onClose={customerModal.close} />
      )}
      {shiftModal.selected && (
        <RowModal row={shiftModal.selected}
          icon="bi bi-clock-history" accentColor="#ea580c"
          fields={[
            { label: 'Shift ID', key: 'id', mono: true, icon: 'bi bi-hash' },
            { label: 'Terminal', key: 'terminalId', icon: 'bi bi-hdd-network', section: 'Details' },
            { label: 'Cashier', key: 'employeeName', icon: 'bi bi-person', section: 'Details' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
            { label: 'Opened At', key: 'startTime', icon: 'bi bi-clock', section: 'Timing' },
            { label: 'Closed At', key: 'endTime', icon: 'bi bi-clock-history', section: 'Timing' },
          ]}
          title={r => `Shift ${r.id?.slice(-6) || ''}`} subtitle={r => r.status}
          onClose={shiftModal.close} />
      )}
      {saleModal.selected && (
        <RowModal row={saleModal.selected}
          icon="bi bi-receipt-cutoff" accentColor="#0891b2"
          fields={[
            { label: 'Reference', key: 'saleNumber', icon: 'bi bi-hash' },
            { label: 'Items', key: 'items', format: (v: any[]) => `${v?.length || 0}`, icon: 'bi bi-box-seam', section: 'Sale' },
            { label: 'Payment Method', key: 'paymentMethod', icon: 'bi bi-credit-card', section: 'Sale' },
            { label: 'Status', key: 'paymentStatus', icon: 'bi bi-flag', section: 'Sale' },
            { label: 'Total', key: 'total', format: (v: number) => formatCurrency(v || 0, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Sale' },
          ]}
          title={r => r.saleNumber || r.id} subtitle={r => `POS Sale`}
          onClose={saleModal.close} />
      )}
      {discountModal.selected && (
        <RowModal row={discountModal.selected}
          icon="bi bi-percent" accentColor="#7c3aed"
          fields={[
            { label: 'Name', key: 'name', icon: 'bi bi-tag' },
            { label: 'Type', key: 'type', icon: 'bi bi-diagram-3', section: 'Details' },
            { label: 'Value', key: 'value', format: (v: number, r: any) => r.type === 'Percentage' ? `${v}%` : formatCurrency(v, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Details' },
            { label: 'Max Usage', key: 'maxUsage', format: (v: any) => v ?? 'Unlimited', icon: 'bi bi-infinity', section: 'Details' },
            { label: 'Status', key: 'isActive', format: (v: boolean) => v !== false ? 'Active' : 'Inactive', icon: 'bi bi-flag', section: 'Details' },
          ]}
          title={r => r.name} subtitle={r => `Discount`}
          onClose={discountModal.close} />
      )}
      {returnModal.selected && (
        <RowModal row={returnModal.selected}
          icon="bi bi-arrow-return-left" accentColor="#dc2626"
          fields={[
            { label: 'Return #', key: 'returnNumber', icon: 'bi bi-hash' },
            { label: 'Original Sale', key: 'originalSaleId', mono: true, icon: 'bi bi-receipt', section: 'Return' },
            { label: 'Reason', key: 'reason', icon: 'bi bi-card-text', section: 'Return' },
            { label: 'Refund Method', key: 'refundMethod', icon: 'bi bi-credit-card', section: 'Refund' },
            { label: 'Refund Status', key: 'refundStatus', icon: 'bi bi-flag', section: 'Refund' },
          ]}
          title={r => r.returnNumber} subtitle={r => r.reason}
          onClose={returnModal.close} />
      )}
      {terminalModal.selected && (
        <RowModal row={terminalModal.selected}
          icon="bi bi-hdd-network" accentColor="#0284c7"
          fields={[
            { label: 'Terminal', key: 'name', icon: 'bi bi-hdd-network' },
            { label: 'Location', key: 'location', icon: 'bi bi-geo-alt', section: 'Details' },
            { label: 'Status', key: 'isActive', format: (v: boolean) => v !== false ? 'Active' : 'Inactive', icon: 'bi bi-flag', section: 'Details' },
            { label: 'Last Sync', key: 'lastSync', mono: true, icon: 'bi bi-clock', section: 'Details' },
          ]}
          title={r => r.name} subtitle={r => r.location || '—'}
          onClose={terminalModal.close} />
      )}
    </div>
  );
};
export default POSView;
