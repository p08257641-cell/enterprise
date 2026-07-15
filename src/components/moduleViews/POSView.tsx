import React, { useState } from 'react';
import type { ModuleViewsProps } from './shared';

export const POSView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany } = props;

  const tab: 'terminal' | 'products' | 'customers' | 'shifts' | 'sales' | 'discounts' | 'returns' | 'reports' | 'sessions' =
    activeView === 'pos-products' ? 'products'
      : activeView === 'pos-customers' ? 'customers'
        : activeView === 'pos-shifts' ? 'shifts'
          : activeView === 'pos-sales' ? 'sales'
            : activeView === 'pos-discounts' ? 'discounts'
              : activeView === 'pos-returns' ? 'returns'
                : activeView === 'pos-reports' ? 'reports'
                  : activeView === 'pos-sessions' ? 'sessions'
                    : 'terminal';

  const products = [
    { id: 'p1', name: 'Lab Vial Kit', price: 45.0, cat: 'Supplies' },
    { id: 'p2', name: 'Safety Gloves L', price: 12.0, cat: 'PPE' },
    { id: 'p3', name: 'Face Shield', price: 28.5, cat: 'PPE' },
    { id: 'p4', name: 'Microscope Slides', price: 18.0, cat: 'Supplies' },
    { id: 'p5', name: 'Nitrile Gloves Box', price: 22.0, cat: 'PPE' },
    { id: 'p6', name: 'pH Test Strips', price: 9.5, cat: 'Supplies' },
  ];
  const customers = [
    { id: 'cu1', name: 'Walk-in Customer', email: 'walkin@store.local', phone: '—', total: 0 },
    { id: 'cu2', name: 'Helen Pierce', email: 'helen@acme-labs.com', phone: '+1 202 555 0142', total: 1180 },
    { id: 'cu3', name: 'Marco Diaz', email: 'marco@northmed.io', phone: '+1 305 555 0199', total: 432 },
  ];
  const shifts = [
    { id: 'sh1', cashier: 'Inventory Manager', opened: '2026-07-15 08:02', closed: '2026-07-15 16:10', sales: 42, total: 3184.5, status: 'Closed' },
    { id: 'sh2', cashier: 'Sales Rep', opened: '2026-07-14 09:15', closed: '—', sales: 0, total: 0, status: 'Open' },
    { id: 'sh3', cashier: 'Inventory Manager', opened: '2026-07-13 08:30', closed: '2026-07-13 17:45', sales: 55, total: 4021.0, status: 'Closed' },
  ];
  const sales = [
    { id: 'txn-100423', customer: 'Helen Pierce', items: 4, total: 118.0, date: '2026-07-15 11:24', cashier: 'Inventory Manager' },
    { id: 'txn-100387', customer: 'Walk-in Customer', items: 2, total: 57.5, date: '2026-07-14 15:02', cashier: 'Sales Rep' },
    { id: 'txn-100341', customer: 'Marco Diaz', items: 6, total: 142.0, date: '2026-07-13 10:48', cashier: 'Inventory Manager' },
    { id: 'txn-100318', customer: 'Walk-in Customer', items: 1, total: 9.5, date: '2026-07-12 13:11', cashier: 'Sales Rep' },
  ];
  const discounts = [
    { id: 'd1', code: 'WELCOME10', type: 'Percentage', value: 10, scope: 'All products', status: 'Active' },
    { id: 'd2', code: 'PPE20', type: 'Percentage', value: 20, scope: 'PPE category', status: 'Active' },
    { id: 'd3', code: 'BULK5', type: 'Fixed', value: 5, scope: 'Orders over $100', status: 'Inactive' },
  ];
  const returns = [
    { id: 'ret-2201', original: 'txn-100341', customer: 'Marco Diaz', reason: 'Wrong size', amount: 28.5, date: '2026-07-13 12:30', status: 'Refunded' },
    { id: 'ret-2198', original: 'txn-100318', customer: 'Walk-in Customer', reason: 'Damaged', amount: 9.5, date: '2026-07-12 13:40', status: 'Pending' },
  ];
  const sessions = [
    { id: 's1', terminal: 'Register A', state: 'Active', since: '2026-07-15 08:02', operator: 'Inventory Manager' },
    { id: 's2', terminal: 'Register B', state: 'Idle', since: '2026-07-15 09:10', operator: 'Sales Rep' },
    { id: 's3', terminal: 'Register C', state: 'Offline', since: '2026-07-14 18:00', operator: '—' },
  ];

  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState<{ ref: string; total: number; ts: string } | null>(null);

  const addToCart = (p: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal * (1 - discount / 100);

  const pageTitle: Record<string, string> = {
    terminal: 'POS Terminal',
    products: 'Products',
    customers: 'Customers',
    shifts: 'Shifts',
    sales: 'Sales History',
    discounts: 'Discounts',
    returns: 'Returns',
    reports: 'Reports',
    sessions: 'POS Sessions',
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

  const wrap: React.CSSProperties = { padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', color: '#0f172a', maxWidth: 1100, margin: '0 auto' };
  const title: React.CSSProperties = { fontSize: 22, fontWeight: 800, margin: 0 };
  const subtitle: React.CSSProperties = { fontSize: 13, color: '#64748b', marginTop: 4 };
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
  const cardPad: React.CSSProperties = { padding: 16 };
  const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', color: '#64748b', fontWeight: 700, borderBottom: '1px solid #f1f5f9', background: '#f8fafc' };
  const td: React.CSSProperties = { padding: '10px 14px', borderBottom: '1px solid #f1f5f9' };
  const right: React.CSSProperties = { textAlign: 'right', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 700 };
  const btn: React.CSSProperties = { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
  const btnGhost: React.CSSProperties = { background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
  const badge: (c: string) => React.CSSProperties = (c) => ({ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: c, color: '#fff' });
  const statBox: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
  const statLabel: React.CSSProperties = { fontSize: 12, color: '#64748b' };
  const statValue: React.CSSProperties = { fontSize: 22, fontWeight: 800, marginTop: 4 };

  const TableHeadRow = ({ cols }: { cols: { label: string; right?: boolean }[] }) => (
    <tr>{cols.map(c => <th key={c.label} style={c.right ? right : th}>{c.label}</th>)}</tr>
  );
  const Empty = ({ msg }: { msg: string }) => (
    <tr><td colSpan={99} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: 24 }}>{msg}</td></tr>
  );

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={title}>{pageTitle[tab]}</h1>
        <div style={subtitle}>{pageSubtitle[tab]}</div>
      </div>

      {tab === 'terminal' && (
        receipt ? (
          <div style={{ ...card, maxWidth: 360, margin: '0 auto', padding: 24, textAlign: 'center', borderStyle: 'dashed' }}>
            <i className="bi bi-receipt" style={{ fontSize: 28, color: '#94a3b8', display: 'block', marginBottom: 8 }}></i>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedCompany.name}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{receipt.ts}</div>
            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '10px 0', margin: '14px 0', fontSize: 12 }}>
              {cart.map(i => <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{i.name} x{i.qty}</span><span>${(i.price * i.qty).toFixed(2)}</span></div>)}
            </div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#e11d48' }}><span>Discount ({discount}%)</span><span>-${(subtotal * discount / 100).toFixed(2)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginTop: 8 }}><span>TOTAL</span><span>${receipt.total.toFixed(2)}</span></div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 12 }}>Ref: {receipt.ref}</div>
            <button style={{ ...btn, width: '100%', marginTop: 14 }} onClick={() => { setReceipt(null); setCart([]); setDiscount(0); }}>New Transaction</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '2fr 1fr' }}>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {products.map(p => (
                <button key={p.id} onClick={() => addToCart(p)} style={{ ...card, textAlign: 'left', padding: 14, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{p.cat}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 8 }}>${p.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
            <div style={card}>
              <div style={{ ...cardPad, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b' }}>Current Order</div>
              </div>
              <div style={{ ...cardPad, minHeight: 160 }}>
                {cart.length === 0 && <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 28 }}>Tap products to add them.</div>}
                {cart.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{i.name}</span>
                    <span style={{ color: '#64748b' }}>x{i.qty} · ${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...cardPad, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span style={{ color: '#64748b' }}>Subtotal</span><span style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Discount %</span>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} style={{ width: 64, textAlign: 'right', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 6px', fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
                <button style={{ ...btn, width: '100%', marginTop: 12 }} onClick={() => { if (cart.length === 0) return; setReceipt({ ref: `TXN-${Date.now().toString().slice(-6)}`, total, ts: new Date().toLocaleString() }); }}>Charge ${total.toFixed(2)}</button>
              </div>
            </div>
          </div>
        )
      )}

      {tab === 'products' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Name' }, { label: 'Category' }, { label: 'Price', right: true }]} /></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{p.name}</td>
                  <td style={td}>{p.cat}</td>
                  <td style={right}>${p.price.toFixed(2)}</td>
                </tr>
              ))}
              {products.length === 0 && <Empty msg="No products found." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'customers' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Name' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Lifetime Spend', right: true }]} /></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{c.name}</td>
                  <td style={{ ...td, color: '#64748b' }}>{c.email}</td>
                  <td style={{ ...td, color: '#64748b' }}>{c.phone}</td>
                  <td style={right}>${c.total.toLocaleString()}</td>
                </tr>
              ))}
              {customers.length === 0 && <Empty msg="No customers found." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'shifts' && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {shifts.map(s => (
            <div key={s.id} style={statBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800 }}>{s.cashier}</span>
                <span style={badge(s.status === 'Open' ? '#0ea5e9' : '#64748b')}>{s.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Opened: {s.opened}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Closed: {s.closed}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
                <span>Transactions: <b>{s.sales}</b></span>
                <span style={{ fontWeight: 800 }}>${s.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sales' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Reference' }, { label: 'Customer' }, { label: 'Items' }, { label: 'Date' }, { label: 'Total', right: true }]} /></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{s.id}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{s.customer}</td>
                  <td style={td}>{s.items}</td>
                  <td style={{ ...td, color: '#64748b' }}>{s.date}</td>
                  <td style={right}>${s.total.toFixed(2)}</td>
                </tr>
              ))}
              {sales.length === 0 && <Empty msg="No sales recorded yet." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'discounts' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Code' }, { label: 'Type' }, { label: 'Value' }, { label: 'Scope' }, { label: 'Status' }]} /></thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{d.code}</td>
                  <td style={td}>{d.type}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{d.type === 'Percentage' ? `${d.value}%` : `$${d.value}`}</td>
                  <td style={{ ...td, color: '#64748b' }}>{d.scope}</td>
                  <td style={td}><span style={badge(d.status === 'Active' ? '#16a34a' : '#94a3b8')}>{d.status}</span></td>
                </tr>
              ))}
              {discounts.length === 0 && <Empty msg="No discounts configured." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'returns' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Return' }, { label: 'Original Sale' }, { label: 'Customer' }, { label: 'Reason' }, { label: 'Amount', right: true }, { label: 'Status' }]} /></thead>
            <tbody>
              {returns.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</td>
                  <td style={{ ...td, fontFamily: 'monospace', color: '#64748b' }}>{r.original}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.customer}</td>
                  <td style={{ ...td, color: '#64748b' }}>{r.reason}</td>
                  <td style={right}>${r.amount.toFixed(2)}</td>
                  <td style={td}><span style={badge(r.status === 'Refunded' ? '#16a34a' : '#d97706')}>{r.status}</span></td>
                </tr>
              ))}
              {returns.length === 0 && <Empty msg="No returns recorded." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sessions' && (
        <div style={card}>
          <table style={table}>
            <thead><TableHeadRow cols={[{ label: 'Terminal' }, { label: 'State' }, { label: 'Operator' }, { label: 'Since' }]} /></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.terminal}</td>
                  <td style={td}><span style={badge(s.state === 'Active' ? '#16a34a' : s.state === 'Idle' ? '#0ea5e9' : '#94a3b8')}>{s.state}</span></td>
                  <td style={{ ...td, color: '#64748b' }}>{s.operator}</td>
                  <td style={{ ...td, color: '#64748b' }}>{s.since}</td>
                </tr>
              ))}
              {sessions.length === 0 && <Empty msg="No sessions found." />}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={statBox}><div style={statLabel}>Transactions Today</div><div style={statValue}>{sales.length}</div></div>
          <div style={statBox}><div style={statLabel}>Revenue Today</div><div style={statValue}>${sales.reduce((s, x) => s + x.total, 0).toFixed(2)}</div></div>
          <div style={statBox}><div style={statLabel}>Items Sold</div><div style={statValue}>{sales.reduce((s, x) => s + x.items, 0)}</div></div>
          <div style={statBox}><div style={statLabel}>Open Returns</div><div style={statValue}>{returns.filter(r => r.status === 'Pending').length}</div></div>
          <div style={{ gridColumn: '1 / -1', ...card, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', marginBottom: 10 }}>Recent Sales</div>
            <table style={table}>
              <thead><TableHeadRow cols={[{ label: 'Reference' }, { label: 'Customer' }, { label: 'Total', right: true }]} /></thead>
              <tbody>
                {sales.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{s.id}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{s.customer}</td>
                    <td style={right}>${s.total.toFixed(2)}</td>
                  </tr>
                ))}
                {sales.length === 0 && <Empty msg="No sales yet." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
