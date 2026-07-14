/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { POSProduct, POSCategory, POSTerminal, POSShift, POSCustomer, POSSale, POSDiscount, POSReturn, POSDailyReport } from '../types';

interface POSViewProps {
  companyId: string;
  activeTab: string;
  onAddProduct: (product: Omit<POSProduct, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>) => void;
  onAddCustomer: (customer: Omit<POSCustomer, 'id' | 'loyaltyPoints' | 'tier' | 'totalPurchases' | 'totalSpent' | 'storeCredit' | 'isActive' | 'createdAt' | 'updatedAt'>) => void;
  onCreateSale: (sale: any) => void;
}

export const POSView: React.FC<POSViewProps> = ({ companyId, activeTab, onAddProduct, onAddCustomer, onCreateSale }) => {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [terminals, setTerminals] = useState<POSTerminal[]>([]);
  const [shifts, setShifts] = useState<POSShift[]>([]);
  const [sales, setSales] = useState<POSSale[]>([]);
  const [discounts, setDiscounts] = useState<POSDiscount[]>([]);
  const [returns, setReturns] = useState<POSReturn[]>([]);
  const [reports, setReports] = useState<POSDailyReport[]>([]);

  // Cart state for terminal
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null);
  const [currentShift, setCurrentShift] = useState<POSShift | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<POSTerminal | null>(null);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);

  // Load data
  useEffect(() => {
    loadPOSData();
  }, [companyId]);

  const loadPOSData = async () => {
    try {
      const [prodRes, catRes, custRes, termRes, shiftRes, salesRes, discRes, retRes, reportRes] = await Promise.all([
        fetch('/api/pos/products?companyId=' + companyId),
        fetch('/api/pos/categories?companyId=' + companyId),
        fetch('/api/pos/customers?companyId=' + companyId),
        fetch('/api/pos/terminals?companyId=' + companyId),
        fetch('/api/pos/shifts?companyId=' + companyId),
        fetch('/api/pos/sales?companyId=' + companyId),
        fetch('/api/pos/discounts?companyId=' + companyId),
        fetch('/api/pos/returns?companyId=' + companyId),
        fetch('/api/pos/reports/daily?companyId=' + companyId)
      ]);

      setProducts(await prodRes.json());
      setCategories(await catRes.json());
      setCustomers(await custRes.json());
      setTerminals(await termRes.json());
      setShifts(await shiftRes.json());
      setSales(await salesRes.json());
      setDiscounts(await discRes.json());
      setReturns(await retRes.json());
      setReports(await reportRes.json());

      // Set default terminal
      const activeTerminals = (await termRes.json()).filter((t: POSTerminal) => t.isActive);
      if (activeTerminals.length > 0) {
        setSelectedTerminal(activeTerminals[0]);
      }

      // Check for open shift
      const openShifts = (await shiftRes.json()).filter((s: POSShift) => s.status === 'Open');
      if (openShifts.length > 0) {
        setCurrentShift(openShifts[0]);
      }
    } catch (err) {
      console.error('Error loading POS data:', err);
    }
  };

  const addToCart = (product: POSProduct) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.discountPrice || product.unitPrice,
        discount: product.discountPrice ? product.unitPrice - product.discountPrice : 0,
        tax: (product.discountPrice || product.unitPrice) * (product.taxRate / 100),
        total: (product.discountPrice || product.unitPrice) * (1 + product.taxRate / 100)
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const cartTotals = cart.reduce((acc, item) => ({
    subtotal: acc.subtotal + (item.unitPrice * item.quantity),
    discount: acc.discount + (item.discount * item.quantity),
    tax: acc.tax + (item.tax * item.quantity),
    total: acc.total + item.total
  }), { subtotal: 0, discount: 0, tax: 0, total: 0 });

  const handleCheckout = async (paymentMethod: string) => {
    if (!currentShift || !selectedTerminal || cart.length === 0) return;

    const sale = {
      companyId,
      terminalId: selectedTerminal.id,
      shiftId: currentShift.id,
      employeeId: 'emp-1', // Would be current user
      employeeName: 'Current User',
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : undefined,
      items: cart,
      payments: [{
        id: `pay-${Date.now()}`,
        method: paymentMethod,
        amount: cartTotals.total
      }]
    };

    await onCreateSale(sale);
    setCart([]);
    setSelectedCustomer(null);
    loadPOSData(); // Reload to get updated sales
  };

  const startShift = async (openingBalance: number) => {
    if (!selectedTerminal) return;

    try {
      const res = await fetch('/api/pos/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          terminalId: selectedTerminal.id,
          employeeId: 'emp-1',
          employeeName: 'Current User',
          openingBalance
        })
      });
      const newShift = await res.json();
      setCurrentShift(newShift);
      loadPOSData();
    } catch (err) {
      console.error('Error starting shift:', err);
    }
  };

  const endShift = async () => {
    if (!currentShift) return;

    try {
      await fetch(`/api/pos/shifts/${currentShift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingBalance: currentShift.openingBalance + currentShift.totalSales,
          notes: 'Shift ended normally'
        })
      });
      setCurrentShift(null);
      loadPOSData();
    } catch (err) {
      console.error('Error ending shift:', err);
    }
  };

  // Tab Navigation - map activeView to internal tab
  const tabMapping: Record<string, 'terminal' | 'products' | 'customers' | 'shifts' | 'sales' | 'discounts' | 'returns' | 'reports'> = {
    'pos': 'terminal',
    'pos-products': 'products',
    'pos-customers': 'customers',
    'pos-shifts': 'shifts',
    'pos-sales': 'sales',
    'pos-discounts': 'discounts',
    'pos-returns': 'returns',
    'pos-reports': 'reports'
  };

  const currentTab = tabMapping[activeTab] || 'terminal';

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: '🖥️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'shifts', label: 'Shifts', icon: '⏰' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'discounts', label: 'Discounts', icon: '🏷️' },
    { id: 'returns', label: 'Returns', icon: '↩️' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentTab === tab.id 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Tab */}
      {currentTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Products</h2>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  value=""
                  onChange={(e) => {
                    // Filter by category
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.filter(p => p.isActive).map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-400 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">{product.image || '📦'}</div>
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      ${product.discountPrice || product.unitPrice.toFixed(2)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${product.unitPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Stock: {product.stockLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 h-fit sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Current Sale</h2>
            
            {/* Shift Status */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              {currentShift ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Shift Open</span>
                  <button 
                    onClick={endShift}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    End Shift
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-sm text-slate-600">No Shift Open</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Opening Balance"
                      className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                      id="openingBalance"
                    />
                    <button
                      onClick={() => {
                        const balance = parseFloat((document.getElementById('openingBalance') as HTMLInputElement).value);
                        if (!isNaN(balance)) startShift(balance);
                      }}
                      className="px-3 py-1 bg-slate-900 text-white text-sm rounded"
                    >
                      Start
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Customer</label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.tier})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-slate-500">${item.unitPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-600 text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-600 text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-green-600">-${cartTotals.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium">${cartTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => handleCheckout('Cash')}
                disabled={!currentShift || cart.length === 0}
                className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
              >
                💵 Cash
              </button>
              <button
                onClick={() => handleCheckout('Card')}
                disabled={!currentShift || cart.length === 0}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                💳 Card
              </button>
              <button
                onClick={() => handleCheckout('Digital Wallet')}
                disabled={!currentShift || cart.length === 0}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                📱 Digital
              </button>
              <button
                onClick={() => handleCheckout('Store Credit')}
                disabled={!currentShift || cart.length === 0 || !selectedCustomer}
                className="px-4 py-3 bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700"
              >
                🎁 Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {currentTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Product Management</h2>
            <button
              onClick={() => setShowProductForm(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const product = {
                    companyId,
                    sku: formData.get('sku') as string,
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as string,
                    barcode: formData.get('barcode') as string,
                    unitPrice: parseFloat(formData.get('unitPrice') as string),
                    costPrice: parseFloat(formData.get('costPrice') as string),
                    taxRate: parseFloat(formData.get('taxRate') as string),
                    discountPrice: formData.get('discountPrice') ? parseFloat(formData.get('discountPrice') as string) : undefined,
                    stockLevel: parseInt(formData.get('stockLevel') as string),
                    reorderLevel: parseInt(formData.get('reorderLevel') as string)
                  };
                  await onAddProduct(product);
                  setShowProductForm(false);
                  loadPOSData();
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input name="sku" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="PROD-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input name="name" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Product Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select name="category" required className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
                  <input name="barcode" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="1234567890123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
                  <input name="unitPrice" type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price *</label>
                  <input name="costPrice" type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%) *</label>
                  <input name="taxRate" type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="8.25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount Price</label>
                  <input name="discountPrice" type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level *</label>
                  <input name="stockLevel" type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level *</label>
                  <input name="reorderLevel" type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea name="description" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Product description" />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">
                    Add Product
                  </button>
                  <button type="button" onClick={() => setShowProductForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product.image || '📦'}</span>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          {product.discountPrice && (
                            <p className="text-xs text-green-600">On Sale: ${product.discountPrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.category}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${product.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className={product.stockLevel <= product.reorderLevel ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {product.stockLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {currentTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Customer Management</h2>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              + Add Customer
            </button>
          </div>

          {showCustomerForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const customer = {
                    companyId,
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    dateOfBirth: formData.get('dateOfBirth') as string,
                    address: formData.get('address') as string,
                    notes: formData.get('notes') as string
                  };
                  await onAddCustomer(customer);
                  setShowCustomerForm(false);
                  loadPOSData();
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input name="firstName" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input name="lastName" required className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input name="email" type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input name="phone" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input name="dateOfBirth" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input name="address" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea name="notes" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">
                    Add Customer
                  </button>
                  <button type="button" onClick={() => setShowCustomerForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tier</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Points</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Total Spent</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Store Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{customer.firstName} {customer.lastName}</p>
                      {customer.address && <p className="text-xs text-slate-500">{customer.address}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {customer.email && <p>{customer.email}</p>}
                      {customer.phone && <p>{customer.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                        customer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                        customer.tier === 'Silver' ? 'bg-slate-200 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{customer.loyaltyPoints}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${customer.totalSpent.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${customer.storeCredit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shifts Tab */}
      {currentTab === 'shifts' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Shift Management</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Terminal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Start Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">End Time</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Opening</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Closing</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Total Sales</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{shift.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{shift.terminalId}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(shift.startTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{shift.endTime ? new Date(shift.endTime).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${shift.openingBalance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${shift.closingBalance?.toFixed(2) || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">${shift.totalSales.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shift.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {currentTab === 'sales' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Sales History</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Sale #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Payment</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{sale.saleNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(sale.date).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sale.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sale.customerName || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold">${sale.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sale.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        sale.status === 'Void' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discounts Tab */}
      {currentTab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Discounts & Promotions</h2>
            <button
              onClick={() => setShowDiscountForm(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              + Add Discount
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Period</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Usage</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map(discount => (
                  <tr key={discount.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{discount.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{discount.type}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      {discount.type === 'Percentage' ? `${discount.value}%` : `$${discount.value}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {discount.usageCount}{discount.maxUsage ? ` / ${discount.maxUsage}` : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        discount.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {currentTab === 'returns' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Returns & Refunds</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Return #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Original Sale</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Refund Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Reason</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{ret.returnNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ret.originalSaleNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ret.customerName || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">${ret.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ret.refundMethod}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ret.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ret.refundStatus === 'Processed' ? 'bg-green-100 text-green-700' :
                        ret.refundStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ret.refundStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {currentTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Sales Reports</h2>
          
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900">${reports[0].totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{reports[0].totalTransactions}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Average Transaction</p>
                <p className="text-2xl font-bold text-slate-900">${reports[0].averageTransactionValue.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Tax Collected</p>
                <p className="text-2xl font-bold text-slate-900">${reports[0].taxCollected.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No reports available</p>
          )}

          {reports.length > 0 && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold mb-4">Payment Methods</h3>
                <div className="space-y-2">
                  {reports[0].paymentMethods.map(pm => (
                    <div key={pm.method} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{pm.method}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-slate-900 h-2 rounded-full" 
                            style={{ width: `${pm.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">${pm.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold mb-4">Top Selling Products</h3>
                <div className="space-y-2">
                  {reports[0].topSellingProducts.map((product, i) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{i + 1}. {product.productName}</span>
                      <span className="text-sm font-medium">${product.revenue.toFixed(2)} ({product.quantity} sold)</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};