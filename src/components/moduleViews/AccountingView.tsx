/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { GLAccount } from '../../types';

export const AccountingView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const localLeads = leads.filter(l => l.companyId === selectedCompany.id);
  const localGL = glAccounts.filter(g => g.companyId === selectedCompany.id);
  const localInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const localStock = inventory.filter(s => s.companyId === selectedCompany.id);
  const localTickets = tickets.filter(t => t.companyId === selectedCompany.id);
  const localLogs = auditLogs.filter(l => l.companyId === selectedCompany.id);
  const localAPIKeys = (apiKeys || []).filter(k => k.companyId === selectedCompany.id);
  const localBranches = branches.filter(b => b.companyId === selectedCompany.id);
  const localJournalEntries = journalEntries.filter(j => j.companyId === selectedCompany.id);
  const localExpenses = expenses.filter(e => e.companyId === selectedCompany.id);
  const localFiscalPeriods = fiscalPeriods.filter(f => f.companyId === selectedCompany.id);
  const localOpeningBalances = openingBalances.filter(o => o.companyId === selectedCompany.id);
  const localBills = bills.filter(b => b.companyId === selectedCompany.id);
  const localBillPayments = billPayments.filter(b => b.companyId === selectedCompany.id);
  const localCustomerPayments = customerPayments.filter(p => p.companyId === selectedCompany.id);
  const localBankAccounts = bankAccounts.filter(b => b.companyId === selectedCompany.id);
  const localBankTransactions = bankTransactions.filter(t => t.companyId === selectedCompany.id);
  const localBankReconciliations = bankReconciliations.filter(r => r.companyId === selectedCompany.id);
  const localFixedAssets = fixedAssets.filter(a => a.companyId === selectedCompany.id);
  const localDepreciationEntries = depreciationEntries.filter(d => d.companyId === selectedCompany.id);
  const localBudgets = budgets.filter(b => b.companyId === selectedCompany.id);
  const localCostCenters = costCenters.filter(c => c.companyId === selectedCompany.id);
  const localCurrencyRates = currencyRates.filter(r => r.companyId === selectedCompany.id);
  const localTaxCodes = taxCodes.filter(t => t.companyId === selectedCompany.id);
  const localTaxReturns = taxReturns.filter(t => t.companyId === selectedCompany.id);
  const localIntercompanyTxns = intercompanyTxns.filter(t => t.companyId === selectedCompany.id || t.fromCompanyId === selectedCompany.id || t.toCompanyId === selectedCompany.id);
  const localConsolidationRules = consolidationRules.filter(r => r.companyId === selectedCompany.id);
  const localComplianceChecks = complianceChecks.filter(c => c.companyId === selectedCompany.id);
  const localAuditSnapshots = auditSnapshots.filter(s => s.companyId === selectedCompany.id);
  const localPolicyDocuments = policyDocuments.filter(p => p.companyId === selectedCompany.id);
  const localFilingDeadlines = filingDeadlines.filter(f => f.companyId === selectedCompany.id);

  const resolveUserName = (userId: string): string => {
    const emp = getEmployeeByUserId(employees, userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : getUserNameById([], userId);
  };

  const [accTab, setAccTab] = useState<'ledger' | 'invoices' | 'create' | 'expenses' | 'create-expense' | 'reports' | 'journal' | 'trial' | 'opening-balances' | 'fiscal-periods' | 'ap' | 'ar' | 'bank' | 'fixed-assets' | 'budgets' | 'cost-centers' | 'multi-currency' | 'tax' | 'tax-returns' | 'intercompany' | 'consolidation' | 'compliance' | 'audit-trail' | 'policies' | 'filing-deadlines' | 'reports-pl' | 'reports-bs' | 'reports-cf' | 'reports-aging'>('ledger');
  const [accGroup, setAccGroup] = useState<'gl' | 'invoices' | 'expenses' | 'ap' | 'ar' | 'bank' | 'assets' | 'tax' | 'reports'>('gl');
  const [accSearch, setAccSearch] = useState('');
  const [accFilter, setAccFilter] = useState('All');
  const [invClient, setInvClient] = useState(''); const [invSubtotal, setInvSubtotal] = useState('15000');
  const [invTax, setInvTax] = useState('1200'); const [invSuccess, setInvSuccess] = useState(false);

  // GL Account CRUD modal state
  const [showGLModal, setShowGLModal] = useState(false);
  const [editingGLAccount, setEditingGLAccount] = useState<GLAccount | null>(null);
  const [glFormCode, setGlFormCode] = useState('');
  const [glFormName, setGlFormName] = useState('');
  const [glFormType, setGlFormType] = useState<string>('Asset');

  // Journal Entry form state
  const [jeDate, setJeDate] = useState(new Date().toISOString().split('T')[0]);
  const [jeDescription, setJeDescription] = useState('');
  const [jeReference, setJeReference] = useState('');
  const [jeAssignee, setJeAssignee] = useState('');
  const [jeLines, setJeLines] = useState<Array<{ accountId: string; accountCode: string; accountName: string; debit: number; credit: number; description: string }>>([
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' },
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }
  ]);

  // Expense form state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expFormDesc, setExpFormDesc] = useState('');
  const [expFormCategory, setExpFormCategory] = useState('Office Supplies');
  const [expFormDept, setExpFormDept] = useState('Operations');
  const [expFormAmount, setExpFormAmount] = useState('');
  const [expFormAssignee, setExpFormAssignee] = useState('');

  // Bill form state
  const [showBillModal, setShowBillModal] = useState(false);
  const [billVendor, setBillVendor] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billAssignee, setBillAssignee] = useState('');

  // Compliance Check form state
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [compCheckName, setCompCheckName] = useState('');
  const [compCheckDesc, setCompCheckDesc] = useState('');
  const [compCheckCategory, setCompCheckCategory] = useState('Financial');
  const [compCheckDueDate, setCompCheckDueDate] = useState('');
  const [compCheckAssignee, setCompCheckAssignee] = useState('');

  // Filing Deadline form state
  const [showFilingModal, setShowFilingModal] = useState(false);
  const [filingName, setFilingName] = useState('');
  const [filingDesc, setFilingDesc] = useState('');
  const [filingType, setFilingType] = useState('Tax Return');
  const [filingDueDate, setFilingDueDate] = useState('');
  const [filingAssignee, setFilingAssignee] = useState('');
    useEffect(() => {
      if (activeView === 'acc-bank') { setAccGroup('bank'); setAccTab('bank'); }
      else if (activeView === 'acc-assets') { setAccGroup('assets'); setAccTab('fixed-assets'); }
      else if (activeView === 'acc-tax') { setAccGroup('tax'); setAccTab('tax'); }
      else if (activeView === 'acc-reports') { setAccGroup('reports'); setAccTab('reports'); }
      else if (activeView === 'acc-invoices') { setAccGroup('invoices'); setAccTab('ledger'); }
      else if (activeView === 'acc-expenses') { setAccGroup('expenses'); setAccTab('ledger'); }
      else if (activeView === 'acc-ap') { setAccGroup('ap'); setAccTab('ledger'); }
      else if (activeView === 'acc-ar') { setAccGroup('ar'); setAccTab('ledger'); }
      else { setAccGroup('gl'); setAccTab('ledger'); }
    }, [activeView]);

    const cashAcc = localGL.find(a => a.code === '1010');
    const revAcc = localGL.find(a => a.code === '4010');
    const totalExpenses = localGL.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
    const openInv = localInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Void');
    const totalDebits = localGL.filter(a => a.type === 'Asset' || a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
    const totalCredits = localGL.filter(a => a.type === 'Liability' || a.type === 'Revenue' || a.type === 'Equity').reduce((s, a) => s + a.balance, 0);

    return (
      <div>
        {/* ── Secondary Tab Bar for Accounting Groups ── */}
        {accGroup === 'gl' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'ledger', label: 'Chart of Accounts' }, { id: 'journal', label: 'Journal Entries' }, { id: 'trial', label: 'Trial Balance' }, { id: 'opening-balances', label: 'Opening Balances' }, { id: 'fiscal-periods', label: 'Fiscal Periods' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'bank' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'bank', label: 'Bank Accounts' }, { id: 'multi-currency', label: 'Multi-Currency' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'assets' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'fixed-assets', label: 'Fixed Assets' }, { id: 'budgets', label: 'Budgets' }, { id: 'cost-centers', label: 'Cost Centers' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'tax' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px overflow-x-auto">
            {[{ id: 'tax', label: 'Tax Codes' }, { id: 'tax-returns', label: 'Tax Returns' }, { id: 'intercompany', label: 'Intercompany' }, { id: 'consolidation', label: 'Consolidation' }, { id: 'compliance', label: 'Compliance' }, { id: 'audit-trail', label: 'Audit Trail' }, { id: 'policies', label: 'Policies' }, { id: 'filing-deadlines', label: 'Filing Deadlines' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 whitespace-nowrap ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        {accGroup === 'reports' && (
          <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
            {[{ id: 'reports', label: 'Overview' }, { id: 'reports-pl', label: 'Profit & Loss' }, { id: 'reports-bs', label: 'Balance Sheet' }, { id: 'reports-cf', label: 'Cash Flow' }, { id: 'reports-aging', label: 'AR Aging' }].map(tab => (
              <button key={tab.id} onClick={() => setAccTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${accTab === tab.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        )}

        {accGroup === 'gl' && accTab === 'ledger' && (
          <>
            <PageHeader title="General Ledger" subtitle="Chart of accounts, journal entries and financial reporting."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setEditingGLAccount(null); setGlFormCode(''); setGlFormName(''); setGlFormType('Asset'); setShowGLModal(true); }}>Add Account</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Cash & Bank" value={`$${(cashAcc?.balance ?? 0).toLocaleString()}`} icon="bi bi-bank" sub="GL Account 1010" />
              <StatCard label="Revenue YTD" value={`$${(revAcc?.balance ?? 0).toLocaleString()}`} icon="bi bi-graph-up" sub="GL Account 4010" color="text-emerald-600" />
              <StatCard label="Open Invoices" value={openInv.length} icon="bi bi-file-earmark-text" sub={`$${openInv.reduce((s, i) => s + i.total, 0).toLocaleString()} outstanding`} accent />
              <StatCard label="Net Income" value={`$${((revAcc?.balance ?? 0) - totalExpenses).toLocaleString()}`} icon="bi bi-pie-chart" sub="Revenue minus expenses" />
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-slate-500">Chart of Accounts</h3>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search accounts..." className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs data-value focus:outline-none focus:ring-1 focus:ring-slate-300" value={accSearch} onChange={(e) => setAccSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {['All', 'Asset', 'Liability', 'Revenue', 'Expense', 'Equity'].map(type => (
                    <button key={type} onClick={() => setAccFilter(type)} className={`data-value-small px-3 py-1 rounded-lg border transition-all cursor-pointer ${accFilter === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{type}</button>
                  ))}
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Code' }, { label: 'Account Name' }, { label: 'Type' }, { label: 'Balance', right: true }, { label: 'Actions', right: true }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localGL.filter(acc => accFilter === 'All' || acc.type === accFilter).filter(acc => acc.name.toLowerCase().includes(accSearch.toLowerCase()) || acc.code.toLowerCase().includes(accSearch.toLowerCase())).map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{acc.code}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{acc.name}</td>
                        <td className="px-4 py-3"><Badge label={acc.type} variant={acc.type === 'Revenue' ? 'success' : acc.type === 'Expense' ? 'danger' : acc.type === 'Asset' ? 'info' : 'default'} /></td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditingGLAccount(acc); setGlFormCode(acc.code); setGlFormName(acc.name); setGlFormType(acc.type); setShowGLModal(true); }} className="data-value-small text-slate-500 hover:text-slate-900 cursor-pointer mr-2">Edit</button>
                          <button onClick={() => { if (confirm('Delete this account?')) onDeleteGLAccount(acc.id); }} className="data-value-small text-slate-500 hover:text-rose-600 cursor-pointer">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {localGL.filter(acc => accFilter === 'All' || acc.type === accFilter).filter(acc => acc.name.toLowerCase().includes(accSearch.toLowerCase()) || acc.code.toLowerCase().includes(accSearch.toLowerCase())).length === 0 && <EmptyRow cols={5} message="No accounts found matching criteria." />}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="section-title text-slate-500 mb-4">Account Summary</h3>
                <div className="space-y-3">
                  {['Asset', 'Liability', 'Revenue', 'Expense', 'Equity'].map(type => {
                    const typeAccounts = localGL.filter(a => a.type === type);
                    const typeTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
                    return (
                      <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400"></span><span className="data-value text-slate-800">{type}</span></div>
                        <div className="flex items-center gap-3"><span className="data-value-small text-slate-500">{typeAccounts.length} accounts</span><span className="data-value font-sans tabular-nums font-semibold text-slate-900">${typeTotal.toLocaleString()}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'acc-invoices' && (
          <>
            <PageHeader title="Invoices" subtitle="Manage customer invoices, track payments and send reminders."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setAccTab('create')}>New Invoice</PrimaryBtn>} />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Invoice #' }, { label: 'Client' }, { label: 'Issue Date' }, { label: 'Due Date' }, { label: 'Amount', right: true }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-700">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{inv.customerName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={inv.status} variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : inv.status === 'Sent' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">{inv.status !== 'Paid' && inv.status !== 'Void' && <button onClick={() => onPayInvoice(inv.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Pay</button>}</td>
                    </tr>
                  ))}
                  {localInvoices.length === 0 && <EmptyRow cols={7} message="No invoices found." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeView === 'acc-expenses' && (
          <>
            <PageHeader title="Expenses" subtitle="Track and manage business expenses by category and department."
              action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowExpenseModal(true)}>Add Expense</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <StatCard label="Total Expenses" value={`$${localExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`} icon="bi bi-credit-card" sub="All recorded expenses" accent />
              <StatCard label="Pending Approval" value={localExpenses.filter(e => e.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting review" />
              <StatCard label="Approved" value={localExpenses.filter(e => e.status === 'Approved').length} icon="bi bi-check-circle" sub="Auto-posted to GL" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Date' }, { label: 'Description' }, { label: 'Category' }, { label: 'Department' }, { label: 'Amount', right: true }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{exp.date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{exp.description}</td>
                      <td className="px-4 py-3"><Badge label={exp.category} variant="default" /></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{exp.department}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-semibold text-slate-900 text-right">${exp.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={exp.status} variant={exp.status === 'Approved' ? 'success' : exp.status === 'Rejected' ? 'danger' : 'warning'} /></td>
                      <td className="px-4 py-3 text-right">{exp.status === 'Pending' && <button onClick={() => onApproveExpense(exp.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Approve</button>}</td>
                    </tr>
                  ))}
                  {localExpenses.length === 0 && <EmptyRow cols={7} message="No expenses recorded." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {accGroup === 'gl' && accTab === 'journal' && (
          <>
            <PageHeader title="Journal Entry" subtitle="Create and manage journal entries for double-entry bookkeeping." />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
                <h3 className="section-title text-slate-500 mb-5">New Journal Entry</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Entry Date</Label><Input type="date" value={jeDate} onChange={e => setJeDate(e.target.value)} /></div>
                    <div><Label>Reference</Label><Input value={jeReference} onChange={e => setJeReference(e.target.value)} placeholder="JE-2026-001" /></div>
                  </div>
                  <div><Label>Description</Label><Input value={jeDescription} onChange={e => setJeDescription(e.target.value)} placeholder="Enter description..." /></div>
                  <div><Label>Prepared By</Label><Select value={jeAssignee} onChange={e => setJeAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="data-value text-slate-800 mb-3">Line Items</h4>
                    <div className="space-y-3">
                      {jeLines.map((line, idx) => (
                        <div key={idx} className="grid gap-3 sm:grid-cols-5 items-end">
                          <div className="sm:col-span-2">
                            <Label>{idx === 0 ? 'Debit Account' : 'Credit Account'}</Label>
                            <Select value={line.accountId} onChange={e => {
                              const acc = localGL.find(a => a.id === e.target.value);
                              const newLines = [...jeLines];
                              newLines[idx] = { ...newLines[idx], accountId: e.target.value, accountCode: acc?.code || '', accountName: acc?.name || '' };
                              setJeLines(newLines);
                            }}>
                              <option value="">Select account...</option>
                              {localGL.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                            </Select>
                          </div>
                          <div>
                            <Label>Debit</Label>
                            <Input type="number" placeholder="0.00" value={line.debit || ''} onChange={e => { const newLines = [...jeLines]; newLines[idx] = { ...newLines[idx], debit: Number(e.target.value) }; setJeLines(newLines); }} />
                          </div>
                          <div>
                            <Label>Credit</Label>
                            <Input type="number" placeholder="0.00" value={line.credit || ''} onChange={e => { const newLines = [...jeLines]; newLines[idx] = { ...newLines[idx], credit: Number(e.target.value) }; setJeLines(newLines); }} />
                          </div>
                          <div>
                            <button onClick={() => { if (jeLines.length > 2) setJeLines(jeLines.filter((_, i) => i !== idx)); }} className="data-value-small text-rose-500 hover:text-rose-700 cursor-pointer mb-1"><i className="bi bi-trash"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setJeLines([...jeLines, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }])} className="mt-3 data-value-small text-slate-500 hover:text-slate-900 cursor-pointer">+ Add Line Item</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold">
                    <span className="text-slate-600">Totals</span>
                    <div className="flex gap-4">
                      <span className="font-sans tabular-nums text-emerald-600">DR: ${jeLines.reduce((s, l) => s + (l.debit || 0), 0).toLocaleString()}</span>
                      <span className="font-sans tabular-nums text-rose-600">CR: ${jeLines.reduce((s, l) => s + (l.credit || 0), 0).toLocaleString()}</span>
                      {Math.abs(jeLines.reduce((s, l) => s + (l.debit || 0), 0) - jeLines.reduce((s, l) => s + (l.credit || 0), 0)) < 0.01 ? <span className="text-emerald-600"><i className="bi bi-check-circle"></i> Balanced</span> : <span className="text-rose-600"><i className="bi bi-exclamation-circle"></i> Unbalanced</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <PrimaryBtn icon="bi bi-check-circle" onClick={() => {
                      if (!jeDescription) return alert('Description required');
                      if (Math.abs(jeLines.reduce((s, l) => s + (l.debit || 0), 0) - jeLines.reduce((s, l) => s + (l.credit || 0), 0)) > 0.01) return alert('Debit and credit must be equal');
                      const assigneeEmp = localEmployees.find(e => e.userId === jeAssignee || e.id === jeAssignee);
                      onCreateJournalEntry({ date: jeDate, description: jeDescription, reference: jeReference, lines: jeLines, createdBy: jeAssignee || selectedUser.id, createdByName: assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name });
                      setJeDescription(''); setJeReference(''); setJeAssignee(''); setJeLines([{ accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }]);
                    }}>Create Entry</PrimaryBtn>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
                <h3 className="section-title text-slate-500 mb-4">Journal Entries</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {localJournalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <div key={entry.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="data-value text-slate-800">{entry.entryNumber}</div>
                        <Badge label={entry.status} variant={entry.status === 'Approved' ? 'success' : entry.status === 'Posted' ? 'info' : entry.status === 'Void' ? 'danger' : 'warning'} />
                      </div>
                      <div className="data-value-small text-slate-600 mb-1">{entry.description}</div>
                      <div className="data-value-small text-slate-400 mb-2">{entry.date} {entry.reference && `| Ref: ${entry.reference}`}</div>
                      <div className="flex gap-4 mb-2">
                        <span className="data-value-small font-sans tabular-nums text-emerald-600">DR: ${entry.totalDebit.toLocaleString()}</span>
                        <span className="data-value-small font-sans tabular-nums text-rose-600">CR: ${entry.totalCredit.toLocaleString()}</span>
                      </div>
                      {entry.status === 'Draft' && <div className="flex gap-2"><button onClick={() => onPostJournalEntry(entry.id)} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-800">Post</button></div>}
                      {entry.status === 'Posted' && <div className="flex gap-2"><button onClick={() => onApproveJournalEntry(entry.id)} className="data-value-small font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-emerald-700">Approve</button><button onClick={() => onVoidJournalEntry(entry.id)} className="data-value-small font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-50">Void</button></div>}
                    </div>
                  ))}
                  {localJournalEntries.length === 0 && <EmptyRow cols={1} message="No journal entries yet." />}
                </div>
              </div>
            </div>
          </>
        )}

        {accGroup === 'gl' && accTab === 'trial' && (
          <>
            <PageHeader title="Trial Balance" subtitle="Verify that total debits equal total credits across all accounts." />
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <StatCard label="Total Debits" value={`$${totalDebits.toLocaleString()}`} icon="bi bi-arrow-down-circle" sub="Sum of all debit balances" accent />
              <StatCard label="Total Credits" value={`$${totalCredits.toLocaleString()}`} icon="bi bi-arrow-up-circle" sub="Sum of all credit balances" color="text-emerald-600" />
            </div>
            {Math.abs(totalDebits - totalCredits) > 0.01 && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold"><i className="bi bi-exclamation-triangle mr-1"></i> Trial balance is NOT balanced! Difference: ${Math.abs(totalDebits - totalCredits).toLocaleString()}</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Account Code' }, { label: 'Account Name' }, { label: 'Type' }, { label: 'Debit', right: true }, { label: 'Credit', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localGL.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{acc.code}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{acc.name}</td>
                      <td className="px-4 py-3"><Badge label={acc.type} variant={acc.type === 'Revenue' ? 'success' : acc.type === 'Expense' ? 'danger' : acc.type === 'Asset' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{(acc.type === 'Asset' || acc.type === 'Expense') ? `$${acc.balance.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{(acc.type === 'Liability' || acc.type === 'Revenue' || acc.type === 'Equity') ? `$${acc.balance.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900" colSpan={3}>TOTAL</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${totalDebits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-right text-slate-900">${totalCredits.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'reports' && (
          <>
            <PageHeader title="Financial Reports" subtitle="Generate balance sheets, income statements and cash flow reports." />
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Balance Sheet</h3>
                <div className="space-y-2 text-xs">
                  {['Asset', 'Liability', 'Equity'].map(type => {
                    const typeAccounts = localGL.filter(a => a.type === type);
                    const typeTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
                    return (
                      <div key={type} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">{type}s</span>
                        <span className="font-sans tabular-nums font-semibold text-slate-900">${typeTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Income Statement</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Revenue</span><span className="font-sans tabular-nums font-semibold text-emerald-600">+${(revAcc?.balance ?? 0).toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Expenses</span><span className="font-sans tabular-nums font-semibold text-rose-600">-${totalExpenses.toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 font-bold"><span className="text-slate-900">Net Income</span><span className="font-sans tabular-nums text-slate-900">${((revAcc?.balance ?? 0) - totalExpenses).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Balance Sheet', desc: 'Assets, liabilities and equity snapshot', icon: 'bi bi-bank' },
                { title: 'Income Statement', desc: 'Revenue, expenses and profitability', icon: 'bi bi-graph-up' },
                { title: 'Cash Flow Statement', desc: 'Operating, investing and financing activities', icon: 'bi bi-cash-coin' },
                { title: 'Trial Balance', desc: 'Debit and credit account balances', icon: 'bi bi-file-earmark-spreadsheet' },
                { title: 'Aged Receivables', desc: 'Outstanding invoices by aging period', icon: 'bi bi-clock-history' },
                { title: 'Expense Analysis', desc: 'Expense breakdown by category', icon: 'bi bi-pie-chart' },
              ].map((report, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 hover:border-slate-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><i className={`bi ${report.icon} text-slate-600`}></i></div>
                    <div><div className="data-value font-semibold text-slate-900">{report.title}</div><div className="data-value-small text-slate-500">{report.desc}</div></div>
                  </div>
                  <button className="w-full data-value-small font-semibold bg-slate-900 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Generate Report</button>
                </div>
              ))}
            </div>
          </>
        )}

        {accGroup === 'gl' && accTab === 'opening-balances' && (
          <>
            <PageHeader title="Opening Balances" subtitle="Set opening balances for accounts at the start of a fiscal period." />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 mb-6">
              <h3 className="section-title text-slate-500 mb-4">Set Opening Balance</h3>
              <div className="grid gap-4 sm:grid-cols-4 items-end">
                <div><Label>Account</Label><Select onChange={e => {
                  const acc = localGL.find(a => a.id === e.target.value);
                  if (acc) { setGlFormCode(acc.code); setGlFormName(acc.name); }
                }}><option value="">Select...</option>{localGL.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}</Select></div>
                <div><Label>Period</Label><Select onChange={e => setJeReference(e.target.value)}><option value="">Select...</option>{localFiscalPeriods.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</Select></div>
                <div><Label>Debit</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Credit</Label><Input type="number" placeholder="0.00" /></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Account Code' }, { label: 'Account Name' }, { label: 'Period' }, { label: 'Debit', right: true }, { label: 'Credit', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localOpeningBalances.map(ob => (
                    <tr key={ob.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-600">{ob.accountCode}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{ob.accountName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{localFiscalPeriods.find(f => f.id === ob.periodId)?.name || ob.periodId}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{ob.debit > 0 ? `$${ob.debit.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-right text-slate-900">{ob.credit > 0 ? `$${ob.credit.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                  {localOpeningBalances.length === 0 && <EmptyRow cols={5} message="No opening balances set." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {accGroup === 'gl' && accTab === 'fiscal-periods' && (
          <>
            <PageHeader title="Fiscal Periods" subtitle="Manage fiscal year periods, close periods and lock transactions." />
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Period' }, { label: 'Start Date' }, { label: 'End Date' }, { label: 'Status' }, { label: 'Closed By' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localFiscalPeriods.map(fp => (
                    <tr key={fp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{fp.name}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{fp.startDate}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{fp.endDate}</td>
                      <td className="px-4 py-3"><Badge label={fp.status} variant={fp.status === 'Closed' ? 'default' : fp.status === 'Locked' ? 'danger' : 'success'} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fp.closedBy ? 'David Vance' : '-'}</td>
                      <td className="px-4 py-3 text-right">{fp.status === 'Open' && <button onClick={() => { if (confirm(`Close ${fp.name}?`)) onCloseFiscalPeriod(fp.id); }} className="data-value-small font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Close Period</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Accounts Payable ─────────────────────────────────────── */}
        {activeView === 'acc-ap' && (
          <>
            <PageHeader title="Accounts Payable" subtitle="Manage vendor bills, approve payments and track aging." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowBillModal(true)}>New Bill</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Total Bills" value={localBills.length} icon="bi bi-receipt" />
              <StatCard label="Pending Approval" value={localBills.filter(b => b.status === 'Pending').length} icon="bi bi-hourglass" color="text-amber-600" />
              <StatCard label="Total Outstanding" value={`$${localBills.filter(b => b.status !== 'Paid' && b.status !== 'Void').reduce((s, b) => s + (b.total - b.amountPaid), 0).toLocaleString()}`} icon="bi bi-cash-stack" color="text-rose-600" />
              <StatCard label="Paid This Month" value={`$${localBillPayments.filter(p => p.paymentDate >= '2026-07-01').reduce((s, p) => s + p.amount, 0).toLocaleString()}`} icon="bi bi-check-circle" color="text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Bill #' }, { label: 'Vendor' }, { label: 'Description' }, { label: 'Total' }, { label: 'Paid' }, { label: 'Due Date' }, { label: 'Status' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{bill.billNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{bill.vendorName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{bill.description}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${bill.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">${bill.amountPaid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{bill.dueDate}</td>
                      <td className="px-4 py-3"><Badge label={bill.status} variant={bill.status === 'Paid' ? 'success' : bill.status === 'Overdue' ? 'danger' : bill.status === 'Approved' ? 'info' : bill.status === 'Partially Paid' ? 'warning' : 'default'} /></td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {bill.status === 'Pending' && <button onClick={() => onApproveBill(bill.id)} className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-emerald-700">Approve</button>}
                        {(bill.status === 'Approved' || bill.status === 'Partially Paid') && <button onClick={() => { const amt = prompt(`Pay bill ${bill.billNumber}. Amount:`); if (amt) onPayBill(bill.id, Number(amt), 'Bank Transfer', 'ba-1'); }} className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-800">Pay</button>}
                      </td>
                    </tr>
                  ))}
                  {localBills.length === 0 && <EmptyRow cols={8} message="No bills recorded yet." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Accounts Receivable ───────────────────────────────────── */}
        {activeView === 'acc-ar' && (
          <>
            <PageHeader title="Accounts Receivable" subtitle="Track customer invoice payments and collections." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>Record Payment</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Outstanding AR" value={`$${localInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, i) => s + i.total, 0).toLocaleString()}`} icon="bi bi-hourglass-split" color="text-amber-600" />
              <StatCard label="Overdue" value={`$${localInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0).toLocaleString()}`} icon="bi bi-exclamation-triangle" color="text-rose-600" />
              <StatCard label="Collected This Month" value={`$${localCustomerPayments.filter(p => p.paymentDate >= '2026-07-01').reduce((s, p) => s + p.amount, 0).toLocaleString()}`} icon="bi bi-check-circle" color="text-emerald-600" />
              <StatCard label="Total Invoices" value={localInvoices.length} icon="bi bi-file-earmark-text" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Invoice #' }, { label: 'Customer' }, { label: 'Total' }, { label: 'Issue Date' }, { label: 'Due Date' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{inv.customerName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{inv.dueDate}</td>
                      <td className="px-4 py-3"><Badge label={inv.status} variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : inv.status === 'Sent' ? 'info' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">
                        {inv.status !== 'Paid' && inv.status !== 'Void' && <button onClick={() => { const amt = prompt(`Record payment for ${inv.invoiceNumber}. Amount:`); if (amt) onReceiveCustomerPayment({ invoiceId: inv.id, customerName: inv.customerName, amount: Number(amt), paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', bankAccountId: 'ba-1' }); }} className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-800">Receive Payment</button>}
                      </td>
                    </tr>
                  ))}
                  {localInvoices.length === 0 && <EmptyRow cols={7} message="No invoices found." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Bank Reconciliation ───────────────────────────────────── */}
        {accTab === 'bank' && (
          <>
            <PageHeader title="Bank & Reconciliation" subtitle="Manage bank accounts, view transactions and reconcile statements." />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              {localBankAccounts.map(ba => (
                <div key={ba.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{ba.accountType}</span>
                    <Badge label={ba.isActive ? 'Active' : 'Inactive'} variant={ba.isActive ? 'success' : 'default'} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 font-sans tabular-nums">${(ba.balance ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{ba.bankName} {ba.accountNumber}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ba.name}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recent Transactions</span>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Date' }, { label: 'Description' }, { label: 'Type' }, { label: 'Amount' }, { label: 'Reconciled' }, { label: 'Reference' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBankTransactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">{tx.date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{tx.description}</td>
                      <td className="px-4 py-3"><Badge label={tx.type} variant={tx.type === 'Credit' ? 'success' : 'danger'} /></td>
                      <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.type === 'Credit' ? '+' : '-'}${(tx.amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">{tx.reconciled ? <i className="bi bi-check-circle-fill text-emerald-500 text-sm"></i> : <i className="bi bi-circle text-slate-300 text-sm"></i>}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{tx.reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {localBankReconciliations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Reconciliation History</span>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Period' }, { label: 'Statement Balance' }, { label: 'Book Balance' }, { label: 'Difference' }, { label: 'Status' }, { label: 'Completed By' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localBankReconciliations.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500">{rec.periodStartDate} to {rec.periodEndDate}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(rec.statementBalance ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(rec.bookBalance ?? 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${Math.abs(rec.reconciledDifference ?? 0) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>${Math.abs(rec.reconciledDifference ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3"><Badge label={rec.status} variant={rec.status === 'Completed' ? 'success' : 'danger'} /></td>
                        <td className="px-4 py-3 text-xs text-slate-500">{resolveUserName(rec.completedBy || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Tier 2: Fixed Assets ──────────────────────────────────────────── */}
        {accTab === 'fixed-assets' && (
          <>
            <PageHeader title="Fixed Assets Register" subtitle="Track capital assets, run depreciation schedules and manage disposals." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>Register Asset</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <StatCard label="Total Assets" value={localFixedAssets.length} icon="bi bi-collection" />
              <StatCard label="Total Book Value" value={`$${localFixedAssets.reduce((s, a) => s + (a.currentBookValue ?? 0), 0).toLocaleString()}`} icon="bi bi-cash-stack" />
              <StatCard label="Accumulated Depr." value={`$${localFixedAssets.reduce((s, a) => s + (a.accumulatedDepreciation ?? 0), 0).toLocaleString()}`} icon="bi bi-graph-down" color="text-rose-600" />
              <StatCard label="Pending Depreciation" value={localDepreciationEntries.filter(d => d.status === 'Draft').length} icon="bi bi-hourglass" color="text-amber-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Code' }, { label: 'Name' }, { label: 'Category' }, { label: 'Purchase Price' }, { label: 'Book Value' }, { label: 'Location' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localFixedAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900 font-mono">{asset.assetCode}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{asset.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{asset.category}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(asset.purchasePrice ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(asset.currentBookValue ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{asset.location}</td>
                      <td className="px-4 py-3"><Badge label={asset.status} variant={asset.status === 'Active' ? 'success' : asset.status === 'Disposed' ? 'danger' : 'default'} /></td>
                      <td className="px-4 py-3 text-right">
                        {asset.status === 'Active' && <button onClick={() => { const price = prompt(`Dispose ${asset.name}. Disposal price:`); if (price !== null) onDisposeAsset(asset.id, Number(price)); }} className="text-[10px] font-semibold bg-rose-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-rose-700">Dispose</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {localDepreciationEntries.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Depreciation Schedule</span>
                  <PrimaryBtn icon="bi bi-play-circle" onClick={() => onRunDepreciation('August 2026')}>Run Depreciation</PrimaryBtn>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Asset' }, { label: 'Period' }, { label: 'Depreciation' }, { label: 'Accumulated' }, { label: 'Book Value' }, { label: 'Status' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {localDepreciationEntries.slice(0, 10).map(de => (
                      <tr key={de.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{de.assetCode} - {de.assetName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{de.period}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600">${(de.depreciationAmount ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">${(de.accumulatedDepreciation ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${(de.bookValue ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge label={de.status} variant={de.status === 'Posted' ? 'success' : 'warning'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Tier 2: Budgets ───────────────────────────────────────────────── */}
        {accTab === 'budgets' && (
          <>
            <PageHeader title="Budget Management" subtitle="Create budgets, track variances and approve allocations." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>New Budget</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <StatCard label="Total Budget" value={`$${localBudgets.reduce((s, b) => s + (b.budgetAmount ?? 0), 0).toLocaleString()}`} icon="bi bi-piggy-bank" />
              <StatCard label="Total Actual" value={`$${localBudgets.reduce((s, b) => s + (b.actualAmount ?? 0), 0).toLocaleString()}`} icon="bi bi-cash-stack" />
              <StatCard label="Overall Variance" value={`${localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0) >= 0 ? '+' : ''}$${localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0).toLocaleString()}`} icon="bi bi-graph-up" color={localBudgets.reduce((s, b) => s + (b.variance ?? 0), 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Budget' }, { label: 'Account' }, { label: 'Budget Amt' }, { label: 'Actual' }, { label: 'Variance' }, { label: '% Used' }, { label: 'Status' }, { label: 'Action', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localBudgets.map(bud => {
                    const budgetAmt = bud.budgetAmount ?? 0;
                    const actualAmt = bud.actualAmount ?? 0;
                    const varianceAmt = bud.variance ?? (budgetAmt - actualAmt);
                    const pctUsed = budgetAmt > 0 ? Math.round(actualAmt / budgetAmt * 100) : 0;
                    return (
                      <tr key={bud.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{bud.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{bud.accountCode} - {bud.accountName}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${budgetAmt.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900">${actualAmt.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-xs font-sans tabular-nums font-semibold ${varianceAmt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{varianceAmt >= 0 ? '+' : ''}${varianceAmt.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pctUsed > 90 ? 'bg-rose-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pctUsed, 100)}%` }}></div></div>
                            <span className="text-[10px] font-semibold text-slate-500">{pctUsed}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge label={bud.status} variant={bud.status === 'Active' ? 'success' : bud.status === 'Approved' ? 'info' : 'default'} /></td>
                        <td className="px-4 py-3 text-right">
                          {bud.status === 'Draft' && <button onClick={() => onApproveBudget(bud.id)} className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-emerald-700">Approve</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tier 2: Cost Centers ──────────────────────────────────────────── */}
        {accTab === 'cost-centers' && (
          <>
            <PageHeader title="Cost Centers" subtitle="Departmental cost allocation and spending analysis." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { }}>New Cost Center</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localCostCenters.map(cc => {
                const ccBudget = cc.budget ?? 0;
                const ccActual = cc.actualSpend ?? 0;
                const pctUsed = ccBudget > 0 ? Math.round(ccActual / ccBudget * 100) : 0;
                return (
                  <div key={cc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 tracking-wide">{cc.code}</span>
                      <Badge label={cc.status} variant={cc.status === 'Active' ? 'success' : 'default'} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{cc.name}</h3>
                    <p className="text-[10px] text-slate-400 mb-3">{cc.departmentName} · {cc.managerName}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Budget</span><span className="font-sans tabular-nums font-semibold text-slate-900">${ccBudget.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Actual Spend</span><span className="font-sans tabular-nums font-semibold text-slate-900">${ccActual.toLocaleString()}</span></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pctUsed > 90 ? 'bg-rose-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pctUsed, 100)}%` }}></div></div>
                      <div className="flex justify-between text-[10px]"><span className="text-slate-400">{pctUsed}% utilized</span><span className={`font-semibold ${ccBudget - ccActual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{ccBudget - ccActual >= 0 ? `$${(ccBudget - ccActual).toLocaleString()} remaining` : `$${Math.abs(ccBudget - ccActual).toLocaleString()} over budget`}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Tier 2: Multi-Currency ────────────────────────────────────────── */}
        {accTab === 'multi-currency' && (
          <>
            <PageHeader title="Multi-Currency Management" subtitle="Exchange rates, currency conversion and gain/loss tracking." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localCurrencyRates.map(cr => (
                <div key={cr.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 tracking-wide">{cr.baseCurrency} / {cr.targetCurrency}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold">{cr.source}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-sans tabular-nums">{cr.rate}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Effective: {cr.effectiveDate}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-lg">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Quick Conversion</h3>
              <div className="grid gap-4 sm:grid-cols-3 items-end">
                <div><Label>Amount</Label><Input type="number" defaultValue="10000" id="conv-amount" /></div>
                <div><Label>From</Label><Select id="conv-from"><option>USD</option><option>EUR</option><option>GBP</option></Select></div>
                <div><Label>To</Label><Select id="conv-to"><option>EUR</option><option>USD</option><option>GBP</option></Select></div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between">
                <span className="text-slate-600 font-semibold">Converted Amount</span>
                <span className="font-sans tabular-nums text-slate-900 font-bold">—</span>
              </div>
            </div>
          </>
        )}

        {/* ── Tier 3: Tax Management ────────────────────────────────────────── */}
        {accTab === 'tax' && (
          <>
            <PageHeader title="Tax Management" subtitle="Tax codes, rates, and jurisdiction configuration." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localTaxCodes.map(tc => (
                <div key={tc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 tracking-wide">{tc.code}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tc.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>{tc.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{tc.name}</p>
                  <p className="text-2xl font-bold text-slate-900 font-sans tabular-nums">{tc.rate}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">{tc.jurisdiction} · {tc.type}</p>
                  <p className="text-[10px] text-slate-400">Account: {tc.accountName}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {accTab === 'tax-returns' && (
          <>
            <PageHeader title="Tax Returns" subtitle="File, track, and manage tax returns across jurisdictions." />
            <div className="space-y-3 mb-6">
              {localTaxReturns.map(tr => (
                <div key={tr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tr.type} Return — {tr.period}</h3>
                      <p className="text-[10px] text-slate-400">{tr.jurisdiction} · Due {tr.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tr.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        tr.status === 'Draft' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{tr.status}</span>
                      {tr.status === 'Draft' && <PrimaryBtn onClick={() => onFileTaxReturn(tr.id)} icon="bi bi-send">File</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Taxable Income</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.taxableIncome ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Tax Due</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.taxDue ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Credits</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tr.credits ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Net Payable</span><span className="font-sans tabular-nums font-bold text-slate-900">${(tr.netPayable ?? 0).toLocaleString()}</span></div>
                  </div>
                  {tr.filedDate && <p className="text-[10px] text-slate-400 mt-2">Filed {tr.filedDate} by {tr.filedBy}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Intercompany ────────────────────────────────────────── */}
        {accTab === 'intercompany' && (
          <>
            <PageHeader title="Intercompany Transactions" subtitle="Track and reconcile transactions between group entities." />
            <div className="space-y-3 mb-6">
              {localIntercompanyTxns.map(tx => (
                <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tx.description}</h3>
                      <p className="text-[10px] text-slate-400">{tx.type} · {tx.fromCompanyName} → {tx.toCompanyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        tx.status === 'Eliminated' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{tx.status}</span>
                      {tx.status === 'Pending' && <PrimaryBtn onClick={() => onApproveIntercompanyTxn(tx.id)} icon="bi bi-check-lg">Approve</PrimaryBtn>}
                      {tx.status === 'Approved' && <PrimaryBtn onClick={() => onEliminateIntercompanyTxn(tx.id)} icon="bi bi-arrow-left-right">Eliminate</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Amount</span><span className="font-sans tabular-nums font-semibold text-slate-900">${(tx.amount ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block">Currency</span><span className="font-semibold text-slate-900">{tx.currency}</span></div>
                    <div><span className="text-slate-500 block">Date</span><span className="font-semibold text-slate-900">{tx.date}</span></div>
                  </div>
                  {tx.eliminationEntryId && <p className="text-[10px] text-slate-400 mt-2">Elimination Entry: {tx.eliminationEntryId}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Consolidation ────────────────────────────────────────── */}
        {accTab === 'consolidation' && (
          <>
            <PageHeader title="Consolidation Rules" subtitle="Group-level rules for combining subsidiary financials." />
            <div className="space-y-3 mb-6">
              {localConsolidationRules.map(rule => (
                <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${rule.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>{rule.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{rule.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Parent Account</span><span className="font-semibold text-slate-900">{rule.parentAccountName}</span></div>
                    <div><span className="text-slate-500 block">Method</span><span className="font-semibold text-slate-900">{rule.method}</span></div>
                    <div><span className="text-slate-500 block">Subsidiaries</span><span className="font-semibold text-slate-900">{rule.subsidiaryIds?.length ?? 0} entities</span></div>
                  </div>
                  {rule.intercompanyEliminationAccountId && <p className="text-[10px] text-slate-400 mt-2">Elimination Account: {rule.intercompanyEliminationAccountId}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Compliance ────────────────────────────────────────── */}
        {accTab === 'compliance' && (
          <>
            <PageHeader title="Compliance Dashboard" subtitle="Track regulatory and policy compliance across the organization." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowComplianceModal(true)}>New Check</PrimaryBtn>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {localComplianceChecks.map(cc => (
                <div key={cc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold">{cc.category}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${cc.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      cc.status === 'Non-Compliant' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{cc.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{cc.title}</h3>
                  <p className="text-[10px] text-slate-400 mb-3">{cc.description}</p>
                  <p className="text-[10px] text-slate-400">Assigned: {resolveUserName(cc.assignee)} · Due: {cc.dueDate}</p>
                  {cc.status !== 'Compliant' && <div className="mt-3"><PrimaryBtn onClick={() => onResolveComplianceCheck(cc.id, 'Pass')} icon="bi bi-check-lg">Mark Resolved</PrimaryBtn></div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Audit Trail ────────────────────────────────────────── */}
        {accTab === 'audit-trail' && (
          <>
            <PageHeader title="Audit Trail" subtitle="Immutable snapshot log of all financial data changes." />
            <div className="space-y-2 mb-6">
              {localAuditSnapshots.map(as_ => (
                <div key={as_.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${as_.action === 'Create' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        as_.action === 'Update' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>{as_.action}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{as_.entityName}</h4>
                        <p className="text-[10px] text-slate-400">{as_.entityType} · {as_.performedByName} · {as_.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {as_.oldValue !== undefined && as_.oldValue !== null && <p className="text-[10px] text-rose-500 line-through font-sans tabular-nums">{typeof as_.oldValue === 'number' ? `$${as_.oldValue.toLocaleString()}` : String(as_.oldValue)}</p>}
                      {as_.newValue !== undefined && as_.newValue !== null && <p className="text-[10px] text-emerald-600 font-bold font-sans tabular-nums">{typeof as_.newValue === 'number' ? `$${as_.newValue.toLocaleString()}` : String(as_.newValue)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Policy Documents ────────────────────────────────────── */}
        {accTab === 'policies' && (
          <>
            <PageHeader title="Policy Documents" subtitle="Manage and track acknowledgment of accounting policies." />
            <div className="space-y-3 mb-6">
              {localPolicyDocuments.map(pd => (
                <div key={pd.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{pd.title}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${pd.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      pd.status === 'Archived' ? 'bg-slate-50 text-slate-400 border border-slate-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{pd.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{pd.content}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Category</span><span className="font-semibold text-slate-900">{pd.category}</span></div>
                    <div><span className="text-slate-500 block">Version</span><span className="font-semibold text-slate-900">{pd.version}</span></div>
                    <div><span className="text-slate-500 block">Acknowledged</span><span className="font-semibold text-slate-900">{pd.acknowledgedBy?.length ?? 0}/{pd.requiresAcknowledgmentFrom?.length ?? 0}</span></div>
                  </div>
                  {(pd.requiresAcknowledgmentFrom?.length ?? 0) > 0 && (
                    <div className="mt-3"><PrimaryBtn onClick={() => onAcknowledgePolicy(pd.id, employees[0]?.id || '')} icon="bi bi-check2-square">Acknowledge</PrimaryBtn></div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Filing Deadlines ────────────────────────────────────── */}
        {accTab === 'filing-deadlines' && (
          <>
            <PageHeader title="Filing Deadlines" subtitle="Track upcoming statutory and regulatory filing deadlines." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowFilingModal(true)}>New Deadline</PrimaryBtn>} />
            <div className="space-y-3 mb-6">
              {localFilingDeadlines.map(fd => (
                <div key={fd.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{fd.title}</h3>
                      <p className="text-[10px] text-slate-400">{fd.type} · {fd.jurisdiction} · Due {fd.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${fd.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        fd.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{fd.status}</span>
                      {fd.status === 'Upcoming' && <PrimaryBtn onClick={() => onFileDeadline(fd.id)} icon="bi bi-send">File</PrimaryBtn>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500 block">Assigned To</span><span className="font-semibold text-slate-900">{resolveUserName(fd.assignee)}</span></div>
                    <div><span className="text-slate-500 block">Related Return</span><span className="font-semibold text-slate-900">{fd.relatedTaxReturnId || '—'}</span></div>
                    <div><span className="text-slate-500 block">Description</span><span className="font-semibold text-slate-900">{fd.description}</span></div>
                  </div>
                  {fd.filedDate && <p className="text-[10px] text-slate-400 mt-2">Filed {fd.filedDate} by {resolveUserName(fd.filedBy || '')}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tier 3: Advanced Reports ────────────────────────────────────── */}
        {accTab === 'reports-pl' && (
          <>
            <PageHeader title="Profit & Loss Statement" subtitle="Income statement for the current period." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">Period: Current Fiscal Year · {selectedCompany.name}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Revenue</span><span className="font-sans tabular-nums font-bold text-emerald-600">$1,250,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Cost of Goods Sold</span><span className="font-sans tabular-nums font-bold text-slate-900">($480,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-semibold text-slate-900">Gross Profit</span><span className="font-sans tabular-nums font-bold text-slate-900">$770,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Operating Expenses</span><span className="font-sans tabular-nums font-bold text-slate-900">($420,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-semibold text-slate-900">Operating Income</span><span className="font-sans tabular-nums font-bold text-slate-900">$350,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Other Income/Expense</span><span className="font-sans tabular-nums font-bold text-slate-900">($12,000)</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Income Tax</span><span className="font-sans tabular-nums font-bold text-slate-900">($84,500)</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Net Income</span><span className="font-sans tabular-nums font-bold text-slate-900">$253,500</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-bs' && (
          <>
            <PageHeader title="Balance Sheet" subtitle="Assets, liabilities, and equity as of today." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">As of {new Date().toLocaleDateString()} · {selectedCompany.name}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Assets</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Cash & Equivalents</span><span className="font-sans tabular-nums font-semibold text-slate-900">$425,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Accounts Receivable</span><span className="font-sans tabular-nums font-semibold text-slate-900">$185,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Inventory</span><span className="font-sans tabular-nums font-semibold text-slate-900">$320,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Fixed Assets (net)</span><span className="font-sans tabular-nums font-semibold text-slate-900">$580,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Assets</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,510,000</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Liabilities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Accounts Payable</span><span className="font-sans tabular-nums font-semibold text-slate-900">$95,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Deferred Revenue</span><span className="font-sans tabular-nums font-semibold text-slate-900">$45,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Long-term Debt</span><span className="font-sans tabular-nums font-semibold text-slate-900">$300,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Liabilities</span><span className="font-sans tabular-nums font-bold text-slate-900">$440,000</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Equity</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Share Capital</span><span className="font-sans tabular-nums font-semibold text-slate-900">$500,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Retained Earnings</span><span className="font-sans tabular-nums font-semibold text-slate-900">$570,000</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Total Equity</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,070,000</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Total Liabilities + Equity</span><span className="font-sans tabular-nums font-bold text-slate-900">$1,510,000</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-cf' && (
          <>
            <PageHeader title="Cash Flow Statement" subtitle="Operating, investing, and financing cash flows." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <p className="text-xs text-slate-400 mb-4">Period: Current Fiscal Year · {selectedCompany.name}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Operating Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Net Income</span><span className="font-sans tabular-nums font-semibold text-slate-900">$253,500</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Depreciation</span><span className="font-sans tabular-nums font-semibold text-slate-900">$48,000</span></div>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Change in Working Capital</span><span className="font-sans tabular-nums font-semibold text-slate-900">($32,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Operations</span><span className="font-sans tabular-nums font-bold text-slate-900">$269,500</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Investing Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Capital Expenditures</span><span className="font-sans tabular-nums font-semibold text-slate-900">($120,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Investing</span><span className="font-sans tabular-nums font-bold text-slate-900">($120,000)</span></div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider pt-4">Financing Activities</h4>
                <div className="flex justify-between text-sm ml-4"><span className="text-slate-600">Debt Repayment</span><span className="font-sans tabular-nums font-semibold text-slate-900">($50,000)</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Cash from Financing</span><span className="font-sans tabular-nums font-bold text-slate-900">($50,000)</span></div>
                <div className="flex justify-between text-base border-t-2 border-slate-900 pt-3"><span className="font-bold text-slate-900">Net Change in Cash</span><span className="font-sans tabular-nums font-bold text-slate-900">$99,500</span></div>
              </div>
            </div>
          </>
        )}

        {accTab === 'reports-aging' && (
          <>
            <PageHeader title="Accounts Receivable Aging" subtitle="Outstanding receivables broken down by age." />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-500 font-semibold">Customer</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">Current</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">1-30 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">31-60 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">61-90 Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">90+ Days</th>
                    <th className="text-right py-2 text-slate-500 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Acme Corp</td><td className="text-right font-sans tabular-nums">$24,500</td><td className="text-right font-sans tabular-nums">$12,000</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums font-bold">$36,500</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Globex Inc</td><td className="text-right font-sans tabular-nums">$18,200</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$8,500</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums font-bold">$26,700</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 font-semibold text-slate-900">Wayne Enterprises</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$0</td><td className="text-right font-sans tabular-nums">$42,000</td><td className="text-right font-sans tabular-nums">$15,000</td><td className="text-right font-sans tabular-nums font-bold">$57,000</td></tr>
                  <tr className="border-t-2 border-slate-900 font-bold"><td className="py-2 text-slate-900">Total</td><td className="text-right font-sans tabular-nums">$42,700</td><td className="text-right font-sans tabular-nums">$12,000</td><td className="text-right font-sans tabular-nums">$8,500</td><td className="text-right font-sans tabular-nums">$42,000</td><td className="text-right font-sans tabular-nums">$15,000</td><td className="text-right font-sans tabular-nums">$120,200</td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {accTab === 'create' && (
          <div className="max-w-lg">
            {invSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Invoice created successfully!</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">New Invoice</h3>
              <form onSubmit={e => { e.preventDefault(); if (!invClient) return; onAddInvoice({ companyId: selectedCompany.id, customerName: invClient, customerId: `cust-${Date.now()}`, subtotal: Number(invSubtotal), tax: Number(invTax), total: Number(invSubtotal) + Number(invTax), dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }); setInvSuccess(true); setInvClient(''); setTimeout(() => setInvSuccess(false), 3000); }} className="space-y-4">
                <div><Label>Client Name *</Label><Input value={invClient} onChange={e => setInvClient(e.target.value)} placeholder="Acme Corporation" required /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Subtotal (USD)</Label><Input type="number" value={invSubtotal} onChange={e => setInvSubtotal(e.target.value)} /></div>
                  <div><Label>Tax Amount</Label><Input type="number" value={invTax} onChange={e => setInvTax(e.target.value)} /></div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between font-semibold"><span className="text-slate-600">Total Amount</span><span className="font-sans tabular-nums text-slate-900">${(Number(invSubtotal) + Number(invTax)).toLocaleString()}</span></div>
                <PrimaryBtn icon="bi bi-file-earmark-plus">Create Invoice</PrimaryBtn>
              </form>
            </div>
          </div>
        )}

        {/* GL Account Modal */}
        {showGLModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">{editingGLAccount ? 'Edit Account' : 'New GL Account'}</h2>
              <div className="space-y-4">
                <div><Label>Account Code</Label><Input value={glFormCode} onChange={e => setGlFormCode(e.target.value)} placeholder="1010" disabled={!!editingGLAccount} /></div>
                <div><Label>Account Name</Label><Input value={glFormName} onChange={e => setGlFormName(e.target.value)} placeholder="Operating Cash Account" /></div>
                <div><Label>Account Type</Label><Select value={glFormType} onChange={e => setGlFormType(e.target.value)}><option value="Asset">Asset</option><option value="Liability">Liability</option><option value="Equity">Equity</option><option value="Revenue">Revenue</option><option value="Expense">Expense</option></Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowGLModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={() => {
                  if (!glFormCode || !glFormName) return alert('Code and name required');
                  if (editingGLAccount) { onUpdateGLAccount(editingGLAccount.id, { name: glFormName, type: glFormType }); }
                  else { onAddGLAccount({ code: glFormCode, name: glFormName, type: glFormType }); }
                  setShowGLModal(false);
                }}>{editingGLAccount ? 'Save Changes' : 'Create Account'}</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Expense</h2>
              <div className="space-y-4">
                <div><Label>Description</Label><Input value={expFormDesc} onChange={e => setExpFormDesc(e.target.value)} placeholder="Office supplies purchase" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Category</Label><Select value={expFormCategory} onChange={e => setExpFormCategory(e.target.value)}><option>Office Supplies</option><option>Software & IT</option><option>Payroll</option><option>Utilities</option><option>Marketing</option><option>Travel</option><option>Insurance</option><option>Maintenance</option></Select></div>
                  <div><Label>Department</Label><Select value={expFormDept} onChange={e => setExpFormDept(e.target.value)}><option>Operations</option><option>IT</option><option>HR</option><option>Sales</option><option>Finance</option></Select></div>
                </div>
                <div><Label>Submitted By</Label><Select value={expFormAssignee || ''} onChange={e => setExpFormAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                <div><Label>Amount (USD)</Label><Input type="number" value={expFormAmount} onChange={e => setExpFormAmount(e.target.value)} placeholder="0.00" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowExpenseModal(false)}>Cancel</SecBtn>
                <PrimaryBtn onClick={() => {
                  if (!expFormDesc || !expFormAmount) return alert('Description and amount required');
                  const assigneeEmp = localEmployees.find(e => e.userId === expFormAssignee || e.id === expFormAssignee);
                  onAddExpense!({ description: expFormDesc, category: expFormCategory, department: expFormDept, amount: Number(expFormAmount), createdBy: expFormAssignee || selectedUser.id });
                  setShowExpenseModal(false); setExpFormDesc(''); setExpFormAmount(''); setExpFormAssignee('');
                }}>Create Expense</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Bill Modal */}
        {showBillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Vendor Bill</h2>
              <div className="space-y-4">
                <div><Label>Vendor Name *</Label><Input value={billVendor} onChange={e => setBillVendor(e.target.value)} placeholder="Acme Supplies Inc." required /></div>
                <div><Label>Description</Label><Input value={billDesc} onChange={e => setBillDesc(e.target.value)} placeholder="Monthly office supplies" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Amount (USD) *</Label><Input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" required /></div>
                  <div><Label>Due Date *</Label><Input type="date" value={billDueDate} onChange={e => setBillDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Prepared By</Label><Select value={billAssignee} onChange={e => setBillAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowBillModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!billVendor || !billAmount || !billDueDate) return alert('Vendor, amount, and due date required');
                  const assigneeEmp = localEmployees.find(e => e.userId === billAssignee || e.id === billAssignee);
                  onCreateBill({ companyId: selectedCompany.id, vendorName: billVendor, description: billDesc, total: Number(billAmount), amountPaid: 0, dueDate: billDueDate, status: 'Pending', createdBy: billAssignee || selectedUser.id, createdByName: assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name });
                  setShowBillModal(false); setBillVendor(''); setBillDesc(''); setBillAmount(''); setBillDueDate(''); setBillAssignee('');
                }}>Create Bill</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Check Modal */}
        {showComplianceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Compliance Check</h2>
              <div className="space-y-4">
                <div><Label>Check Name *</Label><Input value={compCheckName} onChange={e => setCompCheckName(e.target.value)} placeholder="SOX 404 Internal Controls" required /></div>
                <div><Label>Description</Label><Input value={compCheckDesc} onChange={e => setCompCheckDesc(e.target.value)} placeholder="Annual compliance verification" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Category</Label><Select value={compCheckCategory} onChange={e => setCompCheckCategory(e.target.value)}><option>Financial</option><option>Tax</option><option>Data Privacy</option><option>Industry</option><option>Environmental</option></Select></div>
                  <div><Label>Due Date *</Label><Input type="date" value={compCheckDueDate} onChange={e => setCompCheckDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Assigned To *</Label><Select value={compCheckAssignee} onChange={e => setCompCheckAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowComplianceModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!compCheckName || !compCheckDueDate || !compCheckAssignee) return alert('Name, due date, and assignee required');
                  const assigneeEmp = localEmployees.find(e => e.userId === compCheckAssignee || e.id === compCheckAssignee);
                  // Add to local state (in real app would POST to API)
                  setShowComplianceModal(false); setCompCheckName(''); setCompCheckDesc(''); setCompCheckDueDate(''); setCompCheckAssignee('');
                }}>Create Check</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Filing Deadline Modal */}
        {showFilingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Filing Deadline</h2>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={filingName} onChange={e => setFilingName(e.target.value)} placeholder="Q2 Corporate Tax Return" required /></div>
                <div><Label>Description</Label><Input value={filingDesc} onChange={e => setFilingDesc(e.target.value)} placeholder="Quarterly tax filing" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Type</Label><Select value={filingType} onChange={e => setFilingType(e.target.value)}><option>Tax Return</option><option>Annual Report</option><option>Regulatory Filing</option><option>Audit Report</option></Select></div>
                  <div><Label>Due Date *</Label><Input type="date" value={filingDueDate} onChange={e => setFilingDueDate(e.target.value)} required /></div>
                </div>
                <div><Label>Assigned To *</Label><Select value={filingAssignee} onChange={e => setFilingAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowFilingModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!filingName || !filingDueDate || !filingAssignee) return alert('Title, due date, and assignee required');
                  const assigneeEmp = localEmployees.find(e => e.userId === filingAssignee || e.id === filingAssignee);
                  // Add to local state (in real app would POST to API)
                  setShowFilingModal(false); setFilingName(''); setFilingDesc(''); setFilingDueDate(''); setFilingAssignee('');
                }}>Create Deadline</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

