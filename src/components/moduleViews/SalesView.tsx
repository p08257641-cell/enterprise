import React, { useState } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';

export const SalesView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const salesTab: 'orders' | 'quotes' | 'customers' | 'targets' =
    activeView === 'sales' ? 'orders'
      : activeView === 'sales-quotes' ? 'quotes'
        : activeView === 'sales-customers' ? 'customers'
          : activeView === 'sales-targets' ? 'targets'
            : 'orders';
  const [salesOrders] = useState([
    { id: 'SO-8801', client: 'Alpha Biotech Group', items: 'Lab Pipettes x200', total: 12400, status: 'Completed', date: '2026-07-06' },
    { id: 'SO-8802', client: 'Beta Robotics LLC', items: 'Hydraulic Cylinders x8', total: 28000, status: 'Processing', date: '2026-07-08' },
    { id: 'SO-8803', client: 'Gamma Pharma Inc.', items: 'Centrifuge Tubes x5000', total: 6750, status: 'Pending', date: '2026-07-09' },
  ]);

  const totalRevenue = salesOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <PageHeader title="Sales & Order Management" subtitle="Manage sales orders, quotations, customer accounts and territory performance." />
      {salesTab !== 'targets' && (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total Orders" value={salesOrders.length} icon="bi bi-cart" sub="All sales orders" />
          <StatCard label="Revenue Closed" value={`$${totalRevenue.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Completed order total" accent />
          <StatCard label="Processing" value={salesOrders.filter(o => o.status === 'Processing').length} icon="bi bi-hourglass-split" sub="Orders in progress" />
          <StatCard label="Pending" value={salesOrders.filter(o => o.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting confirmation" />
        </div>
      )}
      {salesTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Order ID' }, { label: 'Client' }, { label: 'Items' }, { label: 'Date' }, { label: 'Total', right: true }, { label: 'Status' }]} />
            <tbody className="divide-y divide-slate-100">
              {salesOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{o.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{o.client}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{o.items}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{o.date}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${o.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={o.status} variant={o.status === 'Completed' ? 'success' : o.status === 'Processing' ? 'info' : 'warning'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {salesTab === 'quotes' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 text-center">
          <i className="bi bi-file-earmark-check text-3xl text-slate-300 block mb-2"></i>
          <p className="text-xs text-slate-400">No open quotations. Create a quotation from a qualified CRM lead.</p>
          <button className="mt-4 text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">New Quotation</button>
        </div>
      )}
      {salesTab === 'customers' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Customer' }, { label: 'Orders' }, { label: 'Total Spend', right: true }, { label: 'Last Order' }, { label: 'Segment' }]} />
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Alpha Biotech Group', orders: 5, spend: 42000, last: '2026-07-06', segment: 'Enterprise' },
                { name: 'Beta Robotics LLC', orders: 3, spend: 68500, last: '2026-07-08', segment: 'Enterprise' },
                { name: 'Gamma Pharma Inc.', orders: 8, spend: 31200, last: '2026-07-09', segment: 'Mid-Market' },
              ].map(c => (
                <tr key={c.name} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700">{c.orders}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${c.spend.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{c.last}</td>
                  <td className="px-4 py-3"><Badge label={c.segment} variant={c.segment === 'Enterprise' ? 'info' : 'default'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {salesTab === 'targets' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Quota Attainment" value="74%" icon="bi bi-bullseye" sub="vs. $180k monthly target" accent />
            <StatCard label="Revenue Closed" value={`$${salesOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0).toLocaleString()}`} icon="bi bi-graph-up" sub="This month" color="text-emerald-600" />
            <StatCard label="Remaining" value="$46,850" icon="bi bi-flag" sub="To hit monthly target" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="section-title text-slate-500 mb-5">Rep Performance vs Quota</h3>
            <div className="space-y-4">
              {[
                { rep: 'Ayasha Chen', quota: 60000, achieved: 48200, region: 'North East' },
                { rep: 'Markus Vance', quota: 55000, achieved: 51000, region: 'Mid-West' },
                { rep: 'Jin Li', quota: 65000, achieved: 34000, region: 'West Coast' },
              ].map(r => {
                const pct = Math.round((r.achieved / r.quota) * 100);
                return (
                  <div key={r.rep}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div><span className="table-cell-semibold text-slate-900">{r.rep}</span><span className="data-value-small text-slate-400 ml-2">{r.region}</span></div>
                      <div className="text-right"><span className="table-cell-mono font-bold text-slate-900">${r.achieved.toLocaleString()}</span><span className="data-value-small text-slate-400 ml-1">/ ${r.quota.toLocaleString()}</span></div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="data-value-small text-slate-400 mt-1">{pct}% of quota</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
