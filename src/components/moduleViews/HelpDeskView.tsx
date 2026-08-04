import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isHRRole, isHelpDeskAdmin } from '../../permissions';
import { SupportTicket, KBArticle } from '../../types';
import { parseActiveView } from '../../parseActiveView';

export const HelpDeskView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onUpdateTicket, kbArticles, onAddKbArticle } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  
  const isHDAdmin = isHelpDeskAdmin(selectedUser.activeRole) || isAdminRole(selectedUser.activeRole);
  const localTickets = tickets.filter(t => {
    if (t.companyId !== selectedCompany.id) return false;
    if (t.status === 'In Progress' && !isHDAdmin) {
      const isRequester = t.customerEmail === selectedUser.email || t.customerName === selectedUser.name;
      const isAssignee = t.assignedTo === selectedUser.id || t.assignedTo === selectedUser.name;
      if (isRequester && !isAssignee) {
        return false;
      }
    }
    return true;
  });

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
  const [tktDept, setTktDept] = useState('');
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const [tktAssignee, setTktAssignee] = useState('');
  const [tktSuccess, setTktSuccess] = useState(false);
  const ticketModal = useRowModal<SupportTicket>();
  const [replyText, setReplyText] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const isAdmin = isAdminRole(selectedUser.activeRole);
  const isHR = isHRRole(selectedUser.activeRole);
  const canManage = isAdmin || isHR || isHDAdmin;

  const ticketFields: { label: string; key: string; mono?: boolean; format?: (v: any) => React.ReactNode; icon?: string; section?: string; full?: boolean }[] = [
    { label: 'Ticket #', key: 'ticketNumber', mono: true, icon: 'bi bi-hash' },
    { label: 'Customer', key: 'customerName', icon: 'bi bi-person' },
    { label: 'Email', key: 'customerEmail', mono: true, icon: 'bi bi-envelope', section: 'Requester' },
    { label: 'Category', key: 'category', icon: 'bi bi-collection', section: 'Requester' },
    { label: 'Subject', key: 'subject', icon: 'bi bi-card-text', section: 'Details' },
    { label: 'Priority', key: 'priority', icon: 'bi bi-exclamation-triangle', section: 'Details' },
    { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
    { label: 'Description', key: 'description', icon: 'bi bi-card-text', full: true, section: 'Details' },
    { label: 'Created', key: 'createdAt', format: (v: any) => new Date(v).toLocaleString(), icon: 'bi bi-clock', section: 'Audit' },
  ];

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
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="section-title text-slate-900">Ticket Queue</h3>
          </div>
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Ticket #' }, { label: 'Customer' }, { label: 'Subject' }, { label: 'Category' }, { label: 'Priority' }, { label: 'Status' }, { label: 'Created' }, { label: 'Actions', right: true }]} />
            <tbody className="divide-y divide-slate-100">
              {localTickets.filter(t => !searchTerm || t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-[10px] font-sans tabular-nums fw-bold text-slate-600">{t.ticketNumber}</td>
                  <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{t.customerName}</td>
                  <td className="px-4 py-3 fs-xs text-slate-600 max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3"><Badge label={t.category} /></td>
                  <td className="px-4 py-3"><Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} /></td>
                  <td className="px-4 py-3"><Badge label={t.status} variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'info' : 'warning'} /></td>
                  <td className="px-4 py-3 text-[10px] font-sans tabular-nums text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); ticketModal.open(t); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                    >
                      <i className={`bi ${canManage ? 'bi-pencil' : 'bi-eye'} text-[11px]`}></i> {canManage ? 'Edit' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
              {localTickets.length === 0 && <EmptyRow cols={8} message="No tickets in the queue." />}
            </tbody>
          </table>
        </div>
      )}
      {hdTab === 'create' && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {tktSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl fs-xs text-emerald-700 fw-semibold">Ticket submitted successfully!</div>}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <form onSubmit={e => {
                e.preventDefault();
                if (!tktName || !tktSubject) return;
                onAddTicket({ companyId: selectedCompany.id, customerName: tktName, customerEmail: tktEmail, subject: tktSubject, description: tktDesc, category: tktCat, priority: tktPri, department: tktDept });
                setTktSuccess(true); setTktName(''); setTktEmail(''); setTktSubject(''); setTktDesc(''); setTktAssignee(''); setTktDept('');
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Direct To Department</Label><Select value={tktDept} onChange={e => setTktDept(e.target.value)}><option value="">Select department…</option>{localDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</Select></div>
                  <div><Label>Assign To</Label><Select value={tktAssignee} onChange={e => setTktAssignee(e.target.value)}><option value="">Select agent...</option>{localEmployees.filter(e => e.status === 'Active' && (e.department === 'Support' || e.department === 'IT' || e.department === 'Operations')).map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                </div>
                <div><Label>Description</Label><textarea value={tktDesc} onChange={e => setTktDesc(e.target.value)} rows={3} placeholder="Detailed description…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" /></div>
                <PrimaryBtn type="submit" icon="bi bi-send">Submit Ticket</PrimaryBtn>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900">Ticket Queue</h3>
                <p className="text-[10px] text-slate-400">{localTickets.length} total tickets</p>
              </div>
              <button onClick={() => setHdTab('queue')} className="fs-[10px] fw-semibold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {localTickets.slice(0, 15).map(t => (
                <div key={t.id} className="px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => { setHdTab('queue'); }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-sans tabular-nums fw-bold text-slate-500">{t.ticketNumber}</span>
                    <Badge label={t.status} variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'info' : 'warning'} />
                  </div>
                  <div className="fs-xs fw-semibold text-slate-800 truncate">{t.subject}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="fs-[10px] text-slate-400">{t.customerName}</span>
                    <Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} />
                  </div>
                </div>
              ))}
              {localTickets.length === 0 && (
                <div className="p-8 text-center">
                  <i className="bi bi-inbox fs-xl text-slate-200 block mb-1"></i>
                  <p className="fs-[10px] text-slate-400">No tickets yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {hdTab === 'kb' && (
        <div className="space-y-4">
          {canManage && <AddKBArticleForm selectedCompany={selectedCompany} onAddKbArticle={onAddKbArticle} />}
          <div className="grid gap-4 sm:grid-cols-2">
            {kbArticles.map(a => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-start justify-between">
                <div><div className="fs-xs fw-semibold text-slate-900">{a.title}</div><div className="text-[10px] text-slate-400 mt-1">{a.category} · {a.views} views</div></div>
                <i className="bi bi-arrow-right text-slate-300 fs-sm shrink-0 ml-3"></i>
              </div>
            ))}
            {kbArticles.length === 0 && <div className="sm:col-span-2 text-center fs-xs text-slate-400 py-8">No knowledge base articles yet.</div>}
          </div>
        </div>
      )}
      {hdTab === 'sla' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Within SLA" value={localTickets.filter(t => slaStatus(t).ok).length} icon="bi bi-check-circle" sub="Meeting target" />
            <StatCard label="At Risk" value={localTickets.filter(t => !slaStatus(t).ok && t.status !== 'Resolved' && t.status !== 'Closed').length} icon="bi bi-exclamation-triangle" sub="Nearing breach" color="text-amber-600" accent />
            <StatCard label="Breached" value={localTickets.filter(t => slaStatus(t).breached).length} icon="bi bi-x-circle" sub="Past target" color="text-rose-600" />
            <StatCard label="Avg Response" value={localTickets.length ? `${Math.round((localTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length / localTickets.length) * 100)}%` : '--'} icon="bi bi-stopwatch" sub="Resolution rate" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">SLA Monitoring</h3>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Ticket #' }, { label: 'Customer' }, { label: 'Priority' }, { label: 'Elapsed' }, { label: 'Target' }, { label: 'SLA' }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localTickets.filter(t => !searchTerm || t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
                  const s = slaStatus(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 text-[10px] font-sans tabular-nums fw-bold text-slate-600">{t.ticketNumber}</td>
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{t.customerName}</td>
                      <td className="px-4 py-3"><Badge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'default'} /></td>
                      <td className="px-4 py-3 fs-xs text-slate-600 tabular-nums">{s.elapsedH}h</td>
                      <td className="px-4 py-3 fs-xs text-slate-400 tabular-nums">{s.targetH}h</td>
                      <td className="px-4 py-3"><Badge label={s.breached ? 'Breached' : s.ok ? 'On Track' : 'At Risk'} variant={s.breached ? 'danger' : s.ok ? 'success' : 'warning'} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); ticketModal.open(t); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          <i className="bi bi-eye text-[11px]"></i> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {localTickets.length === 0 && <EmptyRow cols={7} message="No tickets to monitor." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {ticketModal.selected && (() => {
        const t = localTickets.find(x => x.id === ticketModal.selected!.id) || ticketModal.selected;
        const replies = Array.isArray(t.replies) ? t.replies : [];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={ticketModal.close}>
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between p-5 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 fs-lg"><i className="bi bi-ticket-detailed"></i></div>
                  <div>
                    <h2 className="fs-sm fw-bold text-slate-900">Ticket {t.ticketNumber}</h2>
                    <div className="fs-xs text-slate-500">{t.subject}</div>
                  </div>
                </div>
                <button onClick={ticketModal.close} className="text-slate-400 hover:text-slate-600 cursor-pointer fs-lg"><i className="bi bi-x-lg"></i></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 fs-xs">
                  <div className="data-value-small">Customer<div className="data-value">{t.customerName}</div></div>
                  <div className="data-value-small">Email<div className="data-value truncate">{t.customerEmail}</div></div>
                  <div className="data-value-small">Category<div className="data-value">{t.category}</div></div>
                  <div className="data-value-small">Directed To<div className="data-value">{t.department || '— Unassigned —'}</div></div>
                  <div className="data-value-small">Priority<div className="data-value">{t.priority}</div></div>
                  <div className="data-value-small">Created<div className="data-value">{new Date(t.createdAt).toLocaleString()}</div></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 fs-xs text-slate-700">{t.description}</div>

                {canManage && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Direct To Department</Label>
                      <Select value={t.department || ''} onChange={async e => { await onUpdateTicket(t.id, { department: e.target.value }); }}>
                        <option value="">Unassigned</option>
                        {localDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Assign To</Label>
                      <Select value={t.assignedTo || ''} onChange={async e => { await onUpdateTicket(t.id, { assignedTo: e.target.value }); }}>
                        <option value="">Unassigned</option>
                        {localEmployees.filter(emp => emp.status === 'Active' && (emp.department === 'Support' || emp.department === 'IT' || emp.department === 'Operations')).map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="fs-xs fw-semibold text-slate-600 uppercase tracking-wide">Conversation</span>
                    <span className="text-[10px] text-slate-400">{replies.length} message{replies.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {replies.length === 0 && <div className="fs-xs text-slate-400 italic">No replies yet.</div>}
                    {replies.map((r, i) => (
                      <div key={i} className={`rounded-xl p-3 fs-xs ${r.fromRole === 'Customer' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="fw-semibold text-slate-800">{r.from} <span className="text-[10px] fw-normal text-slate-400">· {r.fromRole}</span></span>
                          <span className="text-[10px] text-slate-400">{new Date(r.at).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-700 whitespace-pre-wrap">{r.message}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{canManage ? 'Reply as Support' : 'Add a reply'}</Label>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your message…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" />
                  <div className="flex justify-end mt-2">
                    <PrimaryBtn icon="bi bi-send" disabled={!replyText.trim() || replyBusy} onClick={async () => {
                      if (!replyText.trim()) return;
                      setReplyBusy(true);
                      try {
                        await onUpdateTicket(t.id, { reply: { message: replyText.trim() }, repliedBy: selectedUser.name, repliedByRole: canManage ? 'Admin' : 'Customer' });
                        setReplyText('');
                      } finally { setReplyBusy(false); }
                    }}>Send Reply</PrimaryBtn>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <Label>Status</Label>
                  {(canManage || t.assignedTo === selectedUser.id || t.assignedTo === selectedUser.name) ? (
                    <Select value={t.status} onChange={async e => {
                      const newStatus = e.target.value as SupportTicket['status'];
                      setReplyBusy(true);
                      try { await onUpdateTicket(t.id, { status: newStatus, repliedBy: selectedUser.name, repliedByRole: canManage ? 'Admin' : 'Customer' }); } finally { setReplyBusy(false); }
                    }} disabled={replyBusy}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Noted">Noted</option>
                      <option value="Closed">Closed</option>
                    </Select>
                  ) : (
                    <Badge label={t.status} variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'info' : t.status === 'Closed' ? 'default' : t.status === 'Noted' ? 'warning' : 'warning'} />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }      )()}
    </div>
  );
};

const AddKBArticleForm: React.FC<{ selectedCompany: { id: string }, onAddKbArticle: (a: Omit<KBArticle, 'id' | 'views' | 'createdAt'>) => void }> = ({ selectedCompany, onAddKbArticle }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onAddKbArticle({ companyId: selectedCompany.id, title: title.trim(), category, body: body.trim(), createdBy: 'Admin' });
      setTitle(''); setCategory('General'); setBody(''); setOpen(false);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full sm:w-auto text-[11px] fw-semibold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all inline-flex items-center gap-1.5">
        <i className="bi bi-plus-lg fs-xs"></i> Add Article
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide">Add Knowledge Base Article</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="bi bi-x-lg fs-sm"></i></button>
        </div>
        <div className="space-y-3 p-5">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" /></div>
          <div><Label>Category</Label>
            <Select value={category} onChange={e => setCategory(e.target.value)}>
              {['General', 'Account', 'Security', 'Billing', 'Technical', 'Settings', 'HR'].map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div><Label>Body</Label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 fs-xs text-slate-700 focus:border-slate-400 outline-none" placeholder="Article content" /></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <SecBtn onClick={() => setOpen(false)}>Cancel</SecBtn>
          <PrimaryBtn onClick={submit} disabled={busy || !title.trim()}>{busy ? 'Publishing…' : 'Publish Article'}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};
