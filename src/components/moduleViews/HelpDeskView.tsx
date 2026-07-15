import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { SupportTicket } from '../../types';
import { parseActiveView } from '../../parseActiveView';

export const HelpDeskView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localTickets = tickets.filter(t => t.companyId === selectedCompany.id);

  const slaTargetH: Record<string, number> = { Critical: 4, High: 8, Medium: 24, Low: 48 };
  const slaStatus = (t: SupportTicket) => {
    const targetH = slaTargetH[t.priority] ?? 24;
    const elapsedH = Math.max(0, (Date.now() - new Date(t.createdAt).getTime()) / 36e5);
    const closed = t.status === 'Resolved' || t.status === 'Closed';
    const breached = !closed && elapsedH > targetH;
    const ok = closed || elapsedH <= targetH * 0.8;
    return { targetH, elapsedH: Math.round(elapsedH), breached, ok };
  };

  const initialHdTab = (): 'queue' | 'create' | 'kb' | 'sla' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'sla') return 'sla';
    if (sub === 'kb') return 'kb';
    return 'queue';
  };
  const [hdTab, setHdTab] = useState<'queue' | 'create' | 'kb' | 'sla'>(initialHdTab);
  useEffect(() => { setHdTab(initialHdTab()); }, [activeView]);
  const [tktName, setTktName] = useState(''); const [tktEmail, setTktEmail] = useState('');
  const [tktSubject, setTktSubject] = useState(''); const [tktDesc, setTktDesc] = useState('');
  const [tktCat, setTktCat] = useState<'Technical' | 'Billing' | 'Sales' | 'General'>('Technical');
  const [tktPri, setTktPri] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [tktAssignee, setTktAssignee] = useState('');
  const [tktSuccess, setTktSuccess] = useState(false);

  return (
    <div>
      <PageHeader title="Help Desk & Support" subtitle="Manage support tickets, SLA monitoring, agent assignment and knowledge base."
        action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setHdTab('create')}>New Ticket</PrimaryBtn>} />
      {hdTab !== 'sla' && (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Open Tickets" value={localTickets.filter(t => t.status === 'Open').length} icon="bi bi-ticket" sub="Unassigned queue" />
          <StatCard label="In Progress" value={localTickets.filter(t => t.status === 'In Progress').length} icon="bi bi-hourglass-split" sub="Being handled" accent />
          <StatCard label="Resolved" value={localTickets.filter(t => t.status === 'Resolved').length} icon="bi bi-check2-circle" sub="Closed today" />
          <StatCard label="Critical" value={localTickets.filter(t => t.priority === 'Critical').length} icon="bi bi-exclamation-octagon" sub="SLA breach risk" color="text-rose-600" />
        </div>
      )}
      {hdTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Ticket #' }, { label: 'Customer' }, { label: 'Subject' }, { label: 'Category' }, { label: 'Priority' }, { label: 'Status' }, { label: 'Created' }]} />
            <tbody className="divide-y divide-slate-100">
              {localTickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-600">{t.ticketNumber}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.customerName}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3"><Badge label={t.category} /></td>
                  <td className="px-4 py-3"><Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} /></td>
                  <td className="px-4 py-3"><Badge label={t.status} variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'info' : 'warning'} /></td>
                  <td className="px-4 py-3 text-[10px] font-sans tabular-nums text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {localTickets.length === 0 && <EmptyRow cols={7} message="No tickets in the queue." />}
            </tbody>
          </table>
        </div>
      )}
      {hdTab === 'create' && (
        <div className="max-w-lg">
          {tktSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Ticket submitted successfully!</div>}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Open New Ticket</h3>
            <form onSubmit={e => {
              e.preventDefault();
              if (!tktName || !tktSubject) return;
              onAddTicket({ companyId: selectedCompany.id, customerName: tktName, customerEmail: tktEmail, subject: tktSubject, description: tktDesc, category: tktCat, priority: tktPri });
              setTktSuccess(true); setTktName(''); setTktEmail(''); setTktSubject(''); setTktDesc(''); setTktAssignee('');
              setTimeout(() => setTktSuccess(false), 3000);
            }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Customer Name *</Label><Input value={tktName} onChange={e => setTktName(e.target.value)} placeholder="John Smith" required /></div>
                <div><Label>Email</Label><Input type="email" value={tktEmail} onChange={e => setTktEmail(e.target.value)} placeholder="john@example.com" /></div>
              </div>
              <div><Label>Subject *</Label><Input value={tktSubject} onChange={e => setTktSubject(e.target.value)} placeholder="Brief description of issue" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Category</Label><Select value={tktCat} onChange={e => setTktCat(e.target.value as typeof tktCat)}><option>Technical</option><option>Billing</option><option>Sales</option><option>General</option></Select></div>
                <div><Label>Priority</Label><Select value={tktPri} onChange={e => setTktPri(e.target.value as typeof tktPri)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select></div>
              </div>
              <div><Label>Assign To</Label><Select value={tktAssignee} onChange={e => setTktAssignee(e.target.value)}><option value="">Select agent...</option>{localEmployees.filter(e => e.status === 'Active' && (e.department === 'Support' || e.department === 'IT' || e.department === 'Operations')).map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
              <div><Label>Description</Label><textarea value={tktDesc} onChange={e => setTktDesc(e.target.value)} rows={3} placeholder="Detailed description…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" /></div>
              <PrimaryBtn icon="bi bi-send">Submit Ticket</PrimaryBtn>
            </form>
          </div>
        </div>
      )}
      {hdTab === 'kb' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'How to reset your password', cat: 'Account', views: 234 },
            { title: 'Setting up Two-Factor Authentication', cat: 'Security', views: 187 },
            { title: 'Understanding your invoice', cat: 'Billing', views: 312 },
            { title: 'How to export data from ERP', cat: 'Technical', views: 98 },
            { title: 'Configuring email notifications', cat: 'Settings', views: 145 },
            { title: 'Adding new team members', cat: 'HR', views: 203 },
          ].map(a => (
            <div key={a.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-start justify-between">
              <div><div className="text-xs font-semibold text-slate-900">{a.title}</div><div className="text-[10px] text-slate-400 mt-1">{a.cat} · {a.views} views</div></div>
              <i className="bi bi-arrow-right text-slate-300 text-sm shrink-0 ml-3"></i>
            </div>
          ))}
        </div>
      )}
      {hdTab === 'sla' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Within SLA" value={localTickets.filter(t => slaStatus(t).ok).length} icon="bi bi-check-circle" sub="Meeting target" />
            <StatCard label="At Risk" value={localTickets.filter(t => !slaStatus(t).ok && t.status !== 'Resolved' && t.status !== 'Closed').length} icon="bi bi-exclamation-triangle" sub="Nearing breach" color="text-amber-600" accent />
            <StatCard label="Breached" value={localTickets.filter(t => slaStatus(t).breached).length} icon="bi bi-x-circle" sub="Past target" color="text-rose-600" />
            <StatCard label="Avg Response" value="1.2h" icon="bi bi-stopwatch" sub="First touch" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Ticket #' }, { label: 'Customer' }, { label: 'Priority' }, { label: 'Elapsed' }, { label: 'Target' }, { label: 'SLA' }]} />
              <tbody className="divide-y divide-slate-100">
                {localTickets.map(t => {
                  const s = slaStatus(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 text-[10px] font-sans tabular-nums font-bold text-slate-600">{t.ticketNumber}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.customerName}</td>
                      <td className="px-4 py-3"><Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} /></td>
                      <td className="px-4 py-3 text-xs text-slate-600 tabular-nums">{s.elapsedH}h</td>
                      <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{s.targetH}h</td>
                      <td className="px-4 py-3"><Badge label={s.breached ? 'Breached' : s.ok ? 'On Track' : 'At Risk'} variant={s.breached ? 'danger' : s.ok ? 'success' : 'warning'} /></td>
                    </tr>
                  );
                })}
                {localTickets.length === 0 && <EmptyRow cols={6} message="No tickets to monitor." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
