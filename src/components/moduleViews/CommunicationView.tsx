import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { modalAlert } from '../../utils/modal';
import { isAdminRole, isHRRole } from '../../permissions';
import { CommunicationAnnouncement, EmailTemplate } from '../../types';

export const CommunicationView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, announcements, onAddAnnouncement, emailTemplates, onAddEmailTemplate } = props;

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
  type ChatRecipient = { type: 'team' | 'person'; id: string; name: string };
  const [chatRecipient, setChatRecipient] = useState<ChatRecipient | null>(null);
  const [chatThreads, setChatThreads] = useState<Record<string, { who: string; msg: string; me: boolean; time?: string }[]>>({
    'dept-1': [
      { who: 'Elena Rostova', msg: 'Morning team — Q3 targets are locked. Let us sync at 11.', me: false, time: '9:02 AM' },
      { who: 'Kaito Matsuda', msg: 'On it. Pulling the manufacturing variance now.', me: false, time: '9:05 AM' },
    ],
    'emp-3': [
      { who: 'You', msg: 'Sent the revised forecast to Finance.', me: true, time: '9:10 AM' },
    ],
  });
  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const canManage = isAdminRole(selectedUser.activeRole) || isHRRole(selectedUser.activeRole);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');

  return (
    <div>
      <PageHeader title="Communication Hub" subtitle="Company-wide announcements, team messaging and email/SMS broadcast campaigns."
        action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => setCommTab('compose')}>New Announcement</PrimaryBtn>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Announcements" value={localAnnouncements.length} sub={`${localAnnouncements.filter(a => a.pinned).length} pinned`} icon="bi bi-megaphone" accent />
        <StatCard label="Active Channels" value={new Set(localAnnouncements.map(a => a.channel)).size} sub="Broadcast groups" icon="bi bi-collection" color="text-slate-900" />
        <StatCard label="Team Chat" value={Object.values(chatThreads).flat().length} sub="Messages this session" icon="bi bi-chat-dots" color="text-sky-600" />
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex" style={{ height: '72vh' }}>
          {/* Left: Recipients */}
          <div className="w-64 border-r border-slate-200 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-100">
              <Input placeholder="Search…" value={chatSearch} onChange={e => setChatSearch(e.target.value)} />
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Teams */}
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Teams</div>
              {departments.filter(d => d.companyId === selectedCompany.id)
                .filter(d => !chatSearch || d.name.toLowerCase().includes(chatSearch.toLowerCase()))
                .map(d => (
                  <button key={`dept-${d.id}`} onClick={() => { setChatRecipient({ type: 'team', id: d.id, name: d.name }); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-xs cursor-pointer transition-all ${chatRecipient?.type === 'team' && chatRecipient.id === d.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${chatRecipient?.type === 'team' && chatRecipient.id === d.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                    <span className="truncate font-semibold">{d.name}</span>
                  </button>
                ))}
              {/* People */}
              <div className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">People</div>
              {employees.filter(e => e.companyId === selectedCompany.id)
                .filter(e => !chatSearch || `${e.firstName} ${e.lastName}`.toLowerCase().includes(chatSearch.toLowerCase()) || e.department?.toLowerCase().includes(chatSearch.toLowerCase()))
                .map(e => {
                  const fullName = `${e.firstName} ${e.lastName}`;
                  const initials = `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
                  return (
                    <button key={`emp-${e.id}`} onClick={() => { setChatRecipient({ type: 'person', id: e.id, name: fullName }); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-xs cursor-pointer transition-all ${chatRecipient?.type === 'person' && chatRecipient.id === e.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${chatRecipient?.type === 'person' && chatRecipient.id === e.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{initials}</span>
                      <div className="min-w-0">
                        <div className={`truncate font-semibold ${chatRecipient?.type === 'person' && chatRecipient.id === e.id ? 'text-white' : 'text-slate-900'}`}>{fullName}</div>
                        <div className={`truncate text-[10px] ${chatRecipient?.type === 'person' && chatRecipient.id === e.id ? 'text-white/60' : 'text-slate-400'}`}>{e.department || '—'}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
          {/* Right: Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {chatRecipient ? (
              <>
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">{chatRecipient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{chatRecipient.name}</div>
                    <div className="text-[10px] text-slate-400">{chatRecipient.type === 'team' ? 'Team channel' : 'Direct message'}</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {(chatThreads[chatRecipient.id] || []).map((m, i) => (
                    <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${m.me ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}">
                        {!m.me && <div className="font-semibold mb-0.5 text-slate-600">{m.who}</div>}
                        <div className="leading-relaxed">{m.msg}</div>
                        {m.time && <div className={`text-[9px] mt-1 ${m.me ? 'text-white/50' : 'text-slate-400'}`}>{m.time}</div>}
                      </div>
                    </div>
                  ))}
                  {(chatThreads[chatRecipient.id] || []).length === 0 && (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">No messages yet. Start the conversation!</div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
                  <Input placeholder={`Message ${chatRecipient.name}…`} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const rid = chatRecipient.id;
                      setChatThreads(prev => ({
                        ...prev,
                        [rid]: [...(prev[rid] || []), { who: selectedUser.name, msg: chatInput.trim(), me: true, time: now }],
                      }));
                      setChatInput('');
                    }
                  }} />
                  <PrimaryBtn icon="bi bi-send" onClick={() => {
                    if (!chatInput.trim() || !chatRecipient) return;
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const rid = chatRecipient.id;
                    setChatThreads(prev => ({
                      ...prev,
                      [rid]: [...(prev[rid] || []), { who: selectedUser.name, msg: chatInput.trim(), me: true, time: now }],
                    }));
                    setChatInput('');
                  }}>Send</PrimaryBtn>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Select a team or person to start chatting</div>
            )}
          </div>
        </div>
      )}
      {commTab === 'email' && (
        <div className="space-y-4">
          {canManage && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{emailTemplates.filter(t => t.companyId === selectedCompany.id).length} templates</span>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddTemplate(!showAddTemplate)}>Create Template</PrimaryBtn>
            </div>
          )}
          {showAddTemplate && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">New Email Template</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Template Name</Label><Input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. Welcome New Employee" /></div>
                <div><Label>Subject Line</Label><Input value={tplSubject} onChange={e => setTplSubject(e.target.value)} placeholder="e.g. Welcome to {Company}!" /></div>
              </div>
              <div><Label>Body</Label><textarea value={tplBody} onChange={e => setTplBody(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" placeholder="Email body content. Use {Name}, {Company}, {ID} etc. as placeholders." /></div>
              <div className="flex gap-2">
                <PrimaryBtn onClick={() => { if (!tplName.trim() || !tplSubject.trim()) return; onAddEmailTemplate({ companyId: selectedCompany.id, name: tplName.trim(), subject: tplSubject.trim(), body: tplBody.trim(), updated: new Date().toISOString().split('T')[0] }); setTplName(''); setTplSubject(''); setTplBody(''); setShowAddTemplate(false); }} disabled={!tplName.trim() || !tplSubject.trim()}>Save Template</PrimaryBtn>
                <SecBtn onClick={() => setShowAddTemplate(false)}>Cancel</SecBtn>
              </div>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {emailTemplates.filter(t => t.companyId === selectedCompany.id).map(t => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
                <div className="text-xs font-bold text-slate-900">{t.name}</div>
                <div className="data-value text-slate-500 mt-1">{t.subject}</div>
                {t.body && <div className="text-[10px] text-slate-400 mt-2 line-clamp-2">{t.body.substring(0, 80)}...</div>}
                <div className="text-[10px] text-slate-400 mt-2">Updated {t.updated}</div>
                <button onClick={() => { setCommTitle(t.subject); setCommBody(t.body); setCommTab('compose'); }} className="mt-3 text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-2 py-1 rounded-lg">Use Template</button>
              </div>
            ))}
            {emailTemplates.filter(t => t.companyId === selectedCompany.id).length === 0 && !showAddTemplate && (
              <div className="sm:col-span-2 text-center text-xs text-slate-400 py-8">No email templates yet. Create one to get started.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
