import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { modalAlert } from '../../utils/modal';
import { CommunicationAnnouncement } from '../../types';

export const CommunicationView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, announcements, onAddAnnouncement } = props;

  type CommTab = 'feed' | 'compose' | 'chat' | 'email';
  const commTabFromView = (): CommTab =>
    activeView === 'comm-chat' ? 'chat'
      : activeView === 'comm-email' ? 'email'
        : 'feed';
  const [commTab, setCommTab] = useState<CommTab>(commTabFromView());
  useEffect(() => { setCommTab(commTabFromView()); }, [activeView]);
  const commTabs: { id: CommTab; label: string }[] = [
    { id: 'feed', label: 'Announcements' },
    { id: 'compose', label: 'Compose' },
    { id: 'chat', label: 'Team Chat' },
    { id: 'email', label: 'Email Templates' },
  ];
  const localAnnouncements = announcements.filter(a => a.companyId === selectedCompany.id);
  const [commTitle, setCommTitle] = useState(''); const [commBody, setCommBody] = useState('');
  const [commChannel, setCommChannel] = useState('Company'); const [commSent, setCommSent] = useState(false);
  const [commPinned, setCommPinned] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ who: string; msg: string; me: boolean }[]>([
    { who: 'Elena Rostova', msg: 'Morning team — Q3 targets are locked. Let us sync at 11.', me: false },
    { who: 'Kaito Matsuda', msg: 'On it. Pulling the manufacturing variance now.', me: false },
    { who: 'You', msg: 'Sent the revised forecast to Finance.', me: true },
  ]);
  const [chatInput, setChatInput] = useState('');

  return (
    <div>
      <PageHeader title="Communication Hub" subtitle="Company-wide announcements, team messaging and email/SMS broadcast campaigns."
        action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setCommTab('compose')}>New Announcement</PrimaryBtn>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Announcements" value={localAnnouncements.length} sub={`${localAnnouncements.filter(a => a.pinned).length} pinned`} icon="bi bi-megaphone" accent />
        <StatCard label="Active Channels" value={new Set(localAnnouncements.map(a => a.channel)).size} sub="Broadcast groups" icon="bi bi-collection" color="text-slate-900" />
        <StatCard label="Team Chat" value={chatMessages.length} sub="Messages this session" icon="bi bi-chat-dots" color="text-sky-600" />
        <StatCard label="Email Templates" value={4} sub="Reusable campaigns" icon="bi bi-envelope" color="text-violet-600" />
      </div>
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {commTabs.map(t => (
          <button key={t.id} onClick={() => setCommTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${commTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      {commTab === 'feed' && (
        <div className="space-y-4">
          {localAnnouncements.map(a => (
            <div key={a.id} className={`bg-white border rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all ${a.pinned ? 'border-slate-900' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {a.pinned && <span className="data-value-small font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">📌 Pinned</span>}
                  <Badge label={a.channel} variant="info" />
                </div>
                <span className="text-[10px] font-sans tabular-nums text-slate-400">{a.date}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{a.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
              <div className="mt-3 text-[10px] text-slate-400">Posted by <span className="font-semibold text-slate-600">{a.author}</span></div>
            </div>
          ))}
        </div>
      )}
      {commTab === 'compose' && (
        <div className="max-w-xl">
          {commSent && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">Announcement published successfully!</div>}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-5">Compose Announcement</h3>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={commTitle} onChange={e => setCommTitle(e.target.value)} placeholder="Announcement title…" /></div>
              <div><Label>Channel</Label><Select value={commChannel} onChange={e => setCommChannel(e.target.value)}><option>Company</option><option>Operations</option><option>Finance</option><option>IT</option><option>HR</option></Select></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="comm-pinned" checked={commPinned} onChange={e => setCommPinned(e.target.checked)} className="rounded border-slate-300" /><Label>Pin to top</Label></div>
              <div><Label>Message</Label><textarea value={commBody} onChange={e => setCommBody(e.target.value)} rows={5} placeholder="Write your announcement…" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" /></div>
              <PrimaryBtn icon="bi bi-send" onClick={() => {
                if (!commTitle || !commBody) return;
                onAddAnnouncement({ companyId: selectedCompany.id, title: commTitle, body: commBody, author: selectedUser.name, channel: commChannel, pinned: commPinned });
                setCommSent(true); setCommTitle(''); setCommBody(''); setCommPinned(false);
                setTimeout(() => setCommSent(false), 3000);
              }}>Publish Announcement</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {commTab === 'chat' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Team Chat</h3></div>
            <div className="p-5 space-y-3">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs ${m.me ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {!m.me && <div className="font-semibold mb-0.5">{m.who}</div>}
                    <div>{m.msg}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
              <Input placeholder="Type a message…" value={chatInput} onChange={e => setChatInput(e.target.value)} />
              <PrimaryBtn icon="bi bi-send" onClick={() => {
                if (!chatInput.trim()) return;
                setChatMessages(prev => [...prev, { who: 'You', msg: chatInput.trim(), me: true }]);
                setChatInput('');
              }}>Send</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {commTab === 'email' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: 'Welcome New Employee', subject: 'Welcome to {Company}!', updated: '2026-06-20' },
            { name: 'Invoice Reminder', subject: 'Your invoice #{ID} is due', updated: '2026-06-18' },
            { name: 'Password Reset', subject: 'Reset your account password', updated: '2026-05-30' },
            { name: 'Monthly Payroll Notice', subject: 'Payslip for {Month} available', updated: '2026-07-01' },
          ].map(t => (
            <div key={t.name} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
              <div className="text-xs font-bold text-slate-900">{t.name}</div>
              <div className="data-value text-slate-500 mt-1">{t.subject}</div>
              <div className="text-[10px] text-slate-400 mt-2">Updated {t.updated}</div>
               <button onClick={() => void modalAlert(`Template "${t.name}" loaded into compose form.`, { variant: 'info' })} className="mt-3 text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-2 py-1 rounded-lg">Use Template</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
