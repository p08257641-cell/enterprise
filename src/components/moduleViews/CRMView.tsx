import { formatCurrency } from '../../utils/currency';
import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, toast } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { hasCrudPermission } from '../../permissions';
import { CRMLead } from '../../types';

export const CRMView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onGenerateLeads, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const userRole = selectedUser.activeRole || selectedUser.role || 'Employee';
  const canCreateLead = hasCrudPermission(userRole, props.customRoles || [], selectedCompany.id, ['CRM', 'crm-pipeline'], 'Create');

  const localLeads = leads.filter(l => l.companyId === selectedCompany.id);
  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const autoGenerateRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resolveUserName = (userId: string): string => {
    const emp = getEmployeeByUserId(employees, userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : getUserNameById([], userId);
  };

  const crmTab: 'pipeline' | 'contacts' | 'activities' | 'tasks' | 'emails' | 'reports' =
    activeView === 'crm' ? 'pipeline'
      : activeView.startsWith('crm-') ? (activeView.slice(4) as 'contacts' | 'activities' | 'tasks' | 'emails' | 'reports')
        : 'pipeline';
  const [crmFilter, setCrmFilter] = useState('All');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [crmFirst, setCrmFirst] = useState(''); const [crmLast, setCrmLast] = useState('');
  const [crmEmail, setCrmEmail] = useState(''); const [crmPhone, setCrmPhone] = useState('');
  const [crmCompany, setCrmCompany] = useState(''); const [crmValue, setCrmValue] = useState('25000');
  const [crmSource, setCrmSource] = useState<'Website' | 'Referral' | 'LinkedIn' | 'Ad Campaign' | 'Partner'>('Website');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // CRM Collaboration Features
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  // CRM Activity Logging
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [logActivityLeadId, setLogActivityLeadId] = useState('');
  const [logActivityType, setLogActivityType] = useState<'Call' | 'Email' | 'Meeting' | 'Note' | 'Task'>('Call');
  const [logActivitySubject, setLogActivitySubject] = useState('');
  const [logActivityDesc, setLogActivityDesc] = useState('');

  // CRM Contact Detail
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);

  // CRM Stale Lead Cron State
  const [showCrmCronModal, setShowCrmCronModal] = useState(false);
  const [crmCronDay, setCrmCronDay] = useState('Tuesday');
  const [crmCronTime, setCrmCronTime] = useState('09:00');
  const [crmCronRunning, setCrmCronRunning] = useState(false);
  const [crmCronLastRun, setCrmCronLastRun] = useState<string | null>('2026-08-11 09:00 AM');

  const handleRunCrmCronNow = () => {
    setCrmCronRunning(true);
    setTimeout(() => {
      setCrmCronRunning(false);
      setCrmCronLastRun(new Date().toLocaleString());
      setShowCrmCronModal(false);
      toast('Automated CRM Lead Follow-up Cron executed! Alerted assigned sales reps and reassigned inactive leads.');
    }, 1200);
  };

  // CRM Task Management
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState<'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Proposal' | 'Other'>('Follow-up');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskLeadId, setTaskLeadId] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  // CRM Email
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailLeadId, setEmailLeadId] = useState('');

  // Pipeline stage custom colors
  const defaultStageColors: Record<string, string> = {
    New: '#64748b',
    Contacted: '#3b82f6',
    Qualified: '#f59e0b',
    'Proposal Sent': '#a855f7',
    Won: '#10b981',
    Lost: '#f43f5e',
  };
  const [stageHeaderColors, setStageHeaderColors] = useState<Record<string, string>>(defaultStageColors);
  const [editingStageColor, setEditingStageColor] = useState<string | null>(null);

  // Auto-generate leads on interval
  useEffect(() => {
    if (autoGenerate && onGenerateLeads) {
      autoGenerateRef.current = setInterval(async () => {
        setGeneratingLeads(true);
        try { await onGenerateLeads(); } catch (e) { console.error(e); }
        setGeneratingLeads(false);
      }, 8000);
    }
    return () => { if (autoGenerateRef.current) { clearInterval(autoGenerateRef.current); autoGenerateRef.current = null; } };
  }, [autoGenerate, onGenerateLeads]);

  useEffect(() => {
    if (!editingStageColor) return;
    const handler = () => setEditingStageColor(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [editingStageColor]);

  if (activeView.startsWith('crm')) {
    const stages: CRMLead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
    const stageColors: Record<string, string> = {
      New: 'border-slate-300 bg-slate-50',
      Contacted: 'border-blue-200 bg-blue-50/30',
      Qualified: 'border-amber-200 bg-amber-50/30',
      'Proposal Sent': 'border-purple-200 bg-purple-50/30',
      Won: 'border-emerald-200 bg-emerald-50/30',
      Lost: 'border-rose-200 bg-rose-50/30',
    };
    const presetColors = ['#64748b','#3b82f6','#f59e0b','#a855f7','#10b981','#f43f5e','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9','#e11d48','#7c3aed'];
    const searchStr = searchTerm.toLowerCase();
    const filtered = localLeads.filter(l => crmFilter === 'All' || l.status === crmFilter)
      .filter(l => `${l.firstName} ${l.lastName} ${l.companyName}`.toLowerCase().includes(searchStr));
    const pipelineValue = localLeads.filter(l => l.status !== 'Lost').reduce((s, l) => s + l.value, 0);
    const crmTabTitles: Record<string, string> = {
      pipeline: 'Lead Pipeline',
      contacts: 'Contacts',
      activities: 'Activities',
      tasks: 'Tasks',
      emails: 'Emails',
      reports: 'CRM Reports',
    };

    return (
      <div>
        <PageHeader 
          title={`CRM — ${crmTabTitles[crmTab] ?? 'Lead Pipeline'}`} 
          subtitle="Track prospects, manage the sales funnel, score leads with AI and dispatch follow-ups."
          action={
            <div className="flex gap-2.5">
              <select value={crmFilter} onChange={e => setCrmFilter(e.target.value)} className="fs-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 outline-none transition-all shadow-xs cursor-pointer">
                <option value="All">All Stages</option>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {onGenerateLeads && (
                <>
                  <button
                    onClick={async () => {
                      setGeneratingLeads(true);
                      try { await onGenerateLeads(); } catch (e) { console.error(e); }
                      setGeneratingLeads(false);
                    }}
                    disabled={generatingLeads}
                    className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <i className={`bi ${generatingLeads ? 'bi-arrow-repeat animate-spin' : 'bi-cpu'} fs-xs`}></i>
                    {generatingLeads ? 'Generating...' : 'AI Generate Leads'}
                  </button>
                  <button
                    onClick={() => setAutoGenerate(prev => !prev)}
                    className={`flex items-center gap-1.5 border fw-semibold fs-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs ${
                      autoGenerate
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <i className={`bi ${autoGenerate ? 'bi-pause-circle' : 'bi-arrow-repeat'} fs-xs`}></i>
                    {autoGenerate ? 'Stop Auto-Generate' : 'Auto-Repeat'}
                  </button>
                </>
              )}
                  <button
                    onClick={() => setShowCrmCronModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white fs-xs fw-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="bi bi-clock-history text-amber-300"></i> Automate Stale Follow-ups (Cron)
                  </button>
                  <button
                    type="button"
                    disabled={!canCreateLead}
                    onClick={() => {
                      if (!canCreateLead) {
                        toast('Permission Required: Your assigned role does not have Create permission to add leads.', 'warning');
                        return;
                      }
                      setShowLeadForm(true);
                    }}
                    title={canCreateLead ? 'Add Lead' : 'Permission Required: Create'}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all ${
                      canCreateLead
                        ? 'hover:bg-slate-800 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed bg-slate-400'
                    }`}
                  >
                    <i className="bi bi-plus-lg fs-xs"></i> Add Lead
                  </button>
            </div>
          } 
        />

        {/* CRM Stale Lead Follow-up Cron Banner Card */}
        <div className="mb-5 bg-gradient-to-r from-slate-900 via-violet-950 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-violet-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] fw-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">
                <i className="bi bi-clock-fill text-amber-300 text-[9px]"></i> Active Lead Cron
              </span>
              <span className="text-xs fw-bold text-white">Every {crmCronDay} at {crmCronTime}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Background cron timer scans open CRM leads without activity for &gt; 7 days, alerts assigned sales reps, and reassigns dormant leads.
            </p>
          </div>
          <button
            onClick={() => setShowCrmCronModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs fw-semibold transition-all border border-white/20 cursor-pointer shrink-0"
          >
            Configure Lead Cron →
          </button>
        </div>

        {/* CRM Stale Lead Follow-up Cron Modal */}
        {showCrmCronModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-indigo-950 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                    <i className="bi bi-clock-history text-amber-300 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm fw-bold">Automated Stale Lead & Follow-Up Cron</h3>
                    <p className="text-[11px] text-slate-300">Auto-scan inactive leads & alert assigned sales representatives</p>
                  </div>
                </div>
                <button onClick={() => setShowCrmCronModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Weekly Audit Day</Label>
                    <Select value={crmCronDay} onChange={e => setCrmCronDay(e.target.value)}>
                      <option value="Tuesday">Every Tuesday</option>
                      <option value="Thursday">Every Thursday</option>
                      <option value="Monday">Every Monday</option>
                    </Select>
                  </div>

                  <div>
                    <Label>Audit Time</Label>
                    <Select value={crmCronTime} onChange={e => setCrmCronTime(e.target.value)}>
                      <option value="09:00">09:00 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="17:00">05:00 PM</option>
                    </Select>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs fw-bold text-slate-900">Background Cron Timer Status</span>
                    <span className="text-[10px] fw-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Active & Monitoring Pipeline
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Cron expression: <code className="bg-white px-1.5 py-0.5 rounded font-mono border border-slate-200 text-violet-700">0 9 * * 2</code>
                  </p>
                  {crmCronLastRun && (
                    <p className="text-[10px] text-slate-500">Last automated audit: {crmCronLastRun}</p>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleRunCrmCronNow}
                    disabled={crmCronRunning}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs fw-bold shadow-lg shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {crmCronRunning ? (
                      <>
                        <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                        Scanning inactive pipeline leads & dispatching sales notifications...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-fill text-sm"></i>
                        Run Stale Lead Follow-up Job Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <SecBtn onClick={() => setShowCrmCronModal(false)}>Close</SecBtn>
              </div>
            </div>
          </div>
        )}

        {crmTab !== 'reports' && (
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Leads" value={localLeads.length} icon="bi bi-people" sub="All pipeline contacts" />
            <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue, selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="Active deal potential" accent />
            <StatCard label="Qualified" value={localLeads.filter(l => l.status === 'Qualified').length} icon="bi bi-star" sub="Ready to propose" />
            <StatCard label="Closed Won" value={localLeads.filter(l => l.status === 'Won').length} icon="bi bi-trophy" sub="Converted deals" />
          </div>
        )}

        {showLeadForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowLeadForm(false)}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="fs-sm fw-bold text-slate-900 uppercase tracking-wide">New Lead Registration</h3>
                <button onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><i className="bi bi-x-lg fs-sm"></i></button>
              </div>
              <div className="p-6">
                {leadSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg table-cell text-emerald-700 fw-semibold">Lead added successfully!</div>}
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!crmFirst || !crmLast || !crmCompany) return;
                  onAddLead({ companyId: selectedCompany.id, firstName: crmFirst, lastName: crmLast, email: crmEmail, phone: crmPhone, companyName: crmCompany, source: crmSource, value: Number(crmValue), assignedTo: selectedUser.id });
                  setLeadSuccess(true); setCrmFirst(''); setCrmLast(''); setCrmCompany(''); setCrmEmail(''); setCrmPhone('');
                  setTimeout(() => setLeadSuccess(false), 3000);
                }} className="grid gap-4 sm:grid-cols-3">
                  <div><Label>First Name *</Label><Input value={crmFirst} onChange={e => setCrmFirst(e.target.value)} placeholder="Jane" required /></div>
                  <div><Label>Last Name *</Label><Input value={crmLast} onChange={e => setCrmLast(e.target.value)} placeholder="Smith" required /></div>
                  <div><Label>Company *</Label><Input value={crmCompany} onChange={e => setCrmCompany(e.target.value)} placeholder="Acme Corp" required /></div>
                  <div><Label>Email</Label><Input type="email" value={crmEmail} onChange={e => setCrmEmail(e.target.value)} placeholder="jane@acme.com" /></div>
                  <div><Label>Deal Value (USD)</Label><Input type="number" value={crmValue} onChange={e => setCrmValue(e.target.value)} /></div>
                  <div><Label>Source</Label><Select value={crmSource} onChange={e => setCrmSource(e.target.value as typeof crmSource)}>{['Website', 'Referral', 'LinkedIn', 'Ad Campaign', 'Partner'].map(s => <option key={s}>{s}</option>)}</Select></div>
                  <div className="sm:col-span-3 pt-1 flex justify-end"><PrimaryBtn type="submit" icon="bi bi-person-plus">Register Lead</PrimaryBtn></div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {crmTab === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stages.map(stage => {
              const stageLeads = filtered.filter(l => l.status === stage);
              const isExpanded = expandedStages[stage] || false;
              const visibleLeads = isExpanded ? stageLeads : stageLeads.slice(0, 3);
              const hasMore = stageLeads.length > 3;

              return (
                <div
                  key={stage}
                  className={`rounded-xl border p-3 min-h-[200px] max-h-[65vh] flex flex-col ${stageColors[stage]}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData('leadId');
                    if (leadId && onMoveLead) {
                      onMoveLead(leadId, stage as CRMLead['status']);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <button onClick={() => setEditingStageColor(editingStageColor === stage ? null : stage)} className="h-3 w-3 rounded-full cursor-pointer ring-2 ring-white shadow-sm hover:scale-125 transition-transform" style={{ backgroundColor: stageHeaderColors[stage] }} title={`Change ${stage} color`}></button>
                        {editingStageColor === stage && (
                          <div className="absolute top-5 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-44" onClick={e => e.stopPropagation()}>
                            <div className="text-[10px] fw-bold text-slate-500 uppercase tracking-wide mb-2">Pick Color</div>
                            <div className="grid grid-cols-8 gap-1.5 mb-2">
                              {presetColors.map(c => (
                                <button key={c} onClick={() => setStageHeaderColors(prev => ({ ...prev, [stage]: c }))} className={`h-5 w-5 rounded-full cursor-pointer border-2 transition-all hover:scale-110 ${stageHeaderColors[stage] === c ? 'border-slate-900 ring-1 ring-slate-400' : 'border-white hover:border-slate-300'}`} style={{ backgroundColor: c }}></button>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <input type="color" value={stageHeaderColors[stage]} onChange={e => setStageHeaderColors(prev => ({ ...prev, [stage]: e.target.value }))} className="h-6 w-6 rounded cursor-pointer border-0 p-0" />
                              <input type="text" value={stageHeaderColors[stage]} onChange={e => setStageHeaderColors(prev => ({ ...prev, [stage]: e.target.value }))} className="flex-1 text-[10px] font-mono rounded border border-slate-200 px-1.5 py-1" />
                            </div>
                            <button onClick={() => setEditingStageColor(null)} className="mt-2 w-full text-[10px] fw-semibold text-slate-500 hover:text-slate-700 cursor-pointer py-1 rounded hover:bg-slate-50">Done</button>
                          </div>
                        )}
                      </div>
                      <span className="section-title text-slate-600">{stage}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="data-value-small font-sans tabular-nums text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                      {hasMore && (
                        <button
                          onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }))}
                          className="p-1 rounded hover:bg-white/50 text-slate-500 transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} fs-xs`}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                    {visibleLeads.map(l => (
                      <div
                        key={l.id}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('leadId', l.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="data-value fw-bold text-slate-900 leading-tight">{l.companyName}</div>
                            <div className="data-value-small text-slate-500 mt-0.5">{l.firstName} {l.lastName}</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadForAssign(l.id); setShowAssignModal(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Assign to user"
                            >
                              <i className="bi bi-person-plus fs-xs"></i>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadForComments(l.id); setShowCommentPanel(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Add comment"
                            >
                              <i className="bi bi-chat-text fs-xs"></i>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setLogActivityLeadId(l.id); setShowLogActivity(true); }}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title="Log activity"
                            >
                              <i className="bi bi-clock-history fs-xs"></i>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {l.assignedTo && (
                            <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-2 py-1">
                              <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center avatar-text fw-semibold text-slate-600">{resolveUserName(l.assignedTo).charAt(0)}</div>
                              <span className="data-value-small text-slate-600 truncate max-w-[80px] sm:max-w-[100px]">{resolveUserName(l.assignedTo)}</span>
                            </div>
                          )}
                          {l.department && (() => {
                            const dept = localDepartments.find(d => d.id === l.department);
                            return dept ? (
                              <span className="data-value-small bg-slate-100 text-slate-600 px-2 py-0.5 rounded truncate max-w-[70px] sm:max-w-[90px] md:max-w-[120px]">{dept.name}</span>
                            ) : null;
                          })()}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="data-value-small font-sans tabular-nums fw-semibold text-slate-900">{formatCurrency(l.value, selectedCompany?.currency)}</span>
                          {l.aiLeadScore && <span className="data-value-small bg-slate-900 text-white px-1.5 py-0.5 rounded font-sans tabular-nums">{l.aiLeadScore}%</span>}
                        </div>
                        {l.comments && l.comments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
                            <i className="bi bi-chat-left text-slate-400 fs-xs"></i>
                            <span className="data-value-small text-slate-500">{l.comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {hasMore && !isExpanded && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: true }))}
                          className="data-value-small text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          + {stageLeads.length - 3} more leads
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => {
            setShowAssignModal(false);
            setSelectedLeadForAssign(null);
            setAssignedUser('');
            setAssignedDepartment('');
          }}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <i className="bi bi-person-check text-blue-600 fs-xs"></i>
                    </div>
                    <h3 className="fs-sm fw-bold text-slate-900">Assign Lead</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Delegate this lead to an employee or department.</p>
                </div>
                <button type="button" onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLeadForAssign(null);
                  setAssignedUser('');
                  setAssignedDepartment('');
                }} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  <i className="bi bi-x fs-xl"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label>Assign to Employee</Label>
                  <Select value={assignedUser} onChange={e => setAssignedUser(e.target.value)}>
                    <option value="">— Select Employee —</option>
                    {localEmployees.filter(e => e.status === 'Active').map(emp => (
                      <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Assign to Department</Label>
                  <Select value={assignedDepartment} onChange={e => setAssignedDepartment(e.target.value)}>
                    <option value="">— Select Department —</option>
                    {localDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLeadForAssign(null);
                  setAssignedUser('');
                  setAssignedDepartment('');
                }} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                <button type="button" onClick={() => {
                  if (selectedLeadForAssign && (assignedUser || assignedDepartment)) {
                    const emp = localEmployees.find(e => e.userId === assignedUser || e.id === assignedUser);
                    const userName = emp ? `${emp.firstName} ${emp.lastName}` : '';
                    onAssignLead(selectedLeadForAssign, assignedUser, userName, assignedDepartment || '');
                  }
                  setShowAssignModal(false);
                  setSelectedLeadForAssign(null);
                  setAssignedUser('');
                  setAssignedDepartment('');
                }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Assign Lead</button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Panel */}
        {showCommentPanel && selectedLeadForComments && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowCommentPanel(false)}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <i className="bi bi-chat-left-text text-amber-600 fs-xs"></i>
                    </div>
                    <h3 className="fs-sm fw-bold text-slate-900">Lead Comments</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Internal collaboration notes and logs for this lead.</p>
                </div>
                <button type="button" onClick={() => setShowCommentPanel(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  <i className="bi bi-x fs-xl"></i>
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                {localLeads.find(l => l.id === selectedLeadForComments)?.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center avatar-text fw-semibold text-slate-600">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="data-value fw-semibold text-slate-900">{comment.userName}</span>
                        <span className="data-value-small text-slate-400">{new Date(comment.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="data-value text-slate-700">{comment.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  <button
                    onClick={() => {
                      if (newComment.trim() && selectedLeadForComments) {
                        onAddComment(selectedLeadForComments, newComment);
                        setNewComment('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg btn fw-semibold cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Activity Modal */}
        {showLogActivity && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowLogActivity(false)}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <i className="bi bi-telephone text-emerald-600 fs-xs"></i>
                    </div>
                    <h3 className="fs-sm fw-bold text-slate-900">Log Activity</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Record customer touchpoints, calls, emails, or meetings.</p>
                </div>
                <button type="button" onClick={() => setShowLogActivity(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  <i className="bi bi-x fs-xl"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label>Activity Type</Label>
                  <Select value={logActivityType} onChange={e => setLogActivityType(e.target.value as any)}>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Note</option>
                    <option value="Task">Task</option>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={logActivitySubject} onChange={e => setLogActivitySubject(e.target.value)} placeholder="e.g. Discovery Call" required />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea value={logActivityDesc} onChange={e => setLogActivityDesc(e.target.value)} placeholder="What happened during this activity..." rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 data-value text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowLogActivity(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                <button type="button" onClick={() => {
                  if (logActivitySubject.trim() && logActivityLeadId) {
                    onLogCrmActivity({
                      companyId: selectedCompany.id,
                      leadId: logActivityLeadId,
                      type: logActivityType,
                      subject: logActivitySubject,
                      description: logActivityDesc
                    });
                    setShowLogActivity(false);
                    setLogActivitySubject('');
                    setLogActivityDesc('');
                    setLogActivityLeadId('');
                  }
                }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Log Activity</button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Detail Modal */}
        {selectedLeadForDetail && (() => {
          const lead = localLeads.find(l => l.id === selectedLeadForDetail);
          if (!lead) return null;
          const activities = crmActivities.filter(a => a.leadId === lead.id);
          const typeIcons: Record<string, string> = { Call: 'telephone', Email: 'envelope', Meeting: 'camera-video', Note: 'journal-text', Task: 'check2-square' };
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center avatar-text fw-bold text-white">{lead.firstName[0]}{lead.lastName[0]}</div>
                    <div>
                      <h3 className="fs-lg fw-bold text-slate-900">{lead.firstName} {lead.lastName}</h3>
                      <p className="fs-xs text-slate-500">{lead.companyName}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLeadForDetail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i className="bi bi-x-lg fs-lg"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Email</div>
                    <div className="data-value fw-semibold text-slate-900 truncate">{lead.email || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Phone</div>
                    <div className="data-value fw-semibold text-slate-900">{lead.phone || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Deal Value</div>
                    <div className="data-value fw-semibold text-slate-900">{formatCurrency(lead.value, selectedCompany?.currency)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Stage</div>
                    <Badge label={lead.status} variant={lead.status === 'Won' ? 'success' : lead.status === 'Lost' ? 'danger' : lead.status === 'Qualified' ? 'info' : 'default'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Source</div>
                    <Badge label={lead.source} />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Assigned To</div>
                    <div className="data-value fw-semibold text-slate-900">{resolveUserName(lead.assignedTo) || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">AI Score</div>
                    <div className="data-value fw-semibold text-slate-900">{lead.aiLeadScore ?? '—'}%</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="data-value-small text-slate-500">Created</div>
                    <div className="data-value fw-semibold text-slate-900">{new Date(lead.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {lead.aiFollowUpSuggested && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="bi bi-lightbulb text-blue-600"></i>
                      <span className="data-value fw-semibold text-blue-900">AI Follow-up Suggestion</span>
                    </div>
                    <p className="fs-xs text-blue-700">{lead.aiFollowUpSuggested}</p>
                  </div>
                )}
                <div className="mb-5">
                  <h4 className="section-title text-slate-500 mb-3">Activity Timeline ({activities.length})</h4>
                  {activities.length > 0 ? (
                    <div className="space-y-2">
                      {activities.map(act => (
                        <div key={act.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                            <i className={`bi bi-${typeIcons[act.type] || 'circle'} text-slate-600 fs-xs`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="data-value fw-semibold text-slate-900">{act.subject}</span>
                              <span className="data-value-small text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="fs-xs text-slate-600 mt-0.5">{act.description}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">by {resolveUserName(act.performedBy)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="fs-xs text-slate-400 py-4 text-center">No activities logged yet.</p>
                  )}
                </div>
                <div className="mb-5">
                  <h4 className="section-title text-slate-500 mb-3">Comments ({lead.comments?.length || 0})</h4>
                  {lead.comments && lead.comments.length > 0 ? (
                    <div className="space-y-2">
                      {lead.comments.map(c => (
                        <div key={c.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center avatar-text fw-semibold text-slate-600 shrink-0">{c.userName.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="data-value fw-semibold text-slate-900">{c.userName}</span>
                              <span className="data-value-small text-slate-400">{new Date(c.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="fs-xs text-slate-700 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="fs-xs text-slate-400 py-4 text-center">No comments yet.</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <PrimaryBtn icon="bi bi-clock-history" onClick={() => { setSelectedLeadForDetail(null); setLogActivityLeadId(lead.id); setShowLogActivity(true); }}>Log Activity</PrimaryBtn>
                  <SecBtn onClick={() => { setSelectedLeadForDetail(null); setSelectedLeadForComments(lead.id); setShowCommentPanel(true); }}>Add Comment</SecBtn>
                </div>
              </div>
            </div>
          );
        })()}

        {crmTab === 'contacts' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">All Contacts</h3>
              <PrimaryBtn icon="bi bi-person-plus" onClick={() => setShowLeadForm(true)}>Add Contact</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Name' }, { label: 'Company' }, { label: 'Email' }, { label: 'Source' }, { label: 'Deal Value', right: true }, { label: 'Stage' }, { label: 'Actions', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center avatar-text fw-bold text-white shrink-0">{l.firstName[0]}{l.lastName[0]}</div>
                        <div className="fs-xs fw-semibold text-slate-900">{l.firstName} {l.lastName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 fs-xs text-slate-600">{l.companyName}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{l.email}</td>
                    <td className="px-4 py-3"><Badge label={l.source} /></td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-semibold text-slate-900 text-right">{formatCurrency(l.value, selectedCompany?.currency)}</td>
                    <td className="px-4 py-3"><Badge label={l.status} variant={l.status === 'Won' ? 'success' : l.status === 'Lost' ? 'danger' : l.status === 'Qualified' ? 'info' : 'default'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLeadForDetail(l.id); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                      >
                        <i className="bi bi-eye text-[11px]"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
                {localLeads.length === 0 && <EmptyRow cols={7} message="No contacts found." />}
              </tbody>
            </table>
          </div>
        )}

        {crmTab === 'activities' && (
          <div className="space-y-3">
            {crmActivities.filter(a => a.companyId === selectedCompany.id).map(act => {
              const lead = localLeads.find(l => l.id === act.leadId);
              const typeIcons: Record<string, string> = { Call: 'telephone', Email: 'envelope', Meeting: 'camera-video', Note: 'journal-text', Task: 'check2-square' };
              const typeColors: Record<string, string> = { Call: 'bg-blue-100 text-blue-600', Email: 'bg-purple-100 text-purple-600', Meeting: 'bg-amber-100 text-amber-600', Note: 'bg-slate-100 text-slate-600', Task: 'bg-emerald-100 text-emerald-600' };
              return (
                <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-4 hover:border-slate-300 transition-all">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[act.type] || 'bg-slate-100 text-slate-600'}`}>
                    <i className={`bi bi-${typeIcons[act.type] || 'circle'} fs-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="table-cell-semibold text-slate-900">{act.subject}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={act.type} variant="info" />
                        {lead && <span className="text-[10px] text-slate-400">{lead.firstName} {lead.lastName}</span>}
                      </div>
                    </div>
                    <p className="fs-xs text-slate-600">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">by {resolveUserName(act.performedBy)}</p>
                  </div>
                  <span className="data-value-small font-sans tabular-nums text-slate-400 shrink-0">{new Date(act.createdAt).toLocaleDateString()}</span>
                </div>
              );
            })}
            {crmActivities.filter(a => a.companyId === selectedCompany.id).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-calendar2-event fs-3xl mb-3 block"></i>
                <p className="fs-sm">No activities logged yet. Use the pipeline cards to log calls, emails, and meetings.</p>
              </div>
            )}
          </div>
        )}

        {crmTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title text-slate-900">Tasks & Follow-ups</h3>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowCreateTask(true)}>New Task</PrimaryBtn>
            </div>
            <div className="flex gap-2 mb-4">
              {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                <button key={f} onClick={() => setTaskFilter(f as any)} className={`data-value-small px-3 py-1 rounded-lg border transition-all cursor-pointer ${taskFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{f}</button>
              ))}
            </div>
            {crmTasks.filter(t => t.companyId === selectedCompany.id && (taskFilter === 'All' || t.status === taskFilter)).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-check2-square fs-3xl mb-3 block"></i>
                <p className="fs-sm">No tasks found. Create a task from a pipeline card or contact detail.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {crmTasks.filter(t => t.companyId === selectedCompany.id && (taskFilter === 'All' || t.status === taskFilter)).map(task => {
                  const priorityColors: Record<string, string> = { Low: 'bg-slate-100 text-slate-600', Medium: 'bg-blue-100 text-blue-700', High: 'bg-amber-100 text-amber-700', Urgent: 'bg-rose-100 text-rose-700' };
                  const statusIcons: Record<string, string> = { Pending: 'bi-circle', 'In Progress': 'bi-play-circle', Completed: 'bi-check-circle-fill', Cancelled: 'bi-x-circle' };
                  const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className={`bg-white border rounded-xl p-4 shadow-xs flex items-start gap-4 transition-all ${task.status === 'Completed' ? 'opacity-60' : isOverdue ? 'border-rose-200' : 'border-slate-200 hover:border-slate-300'}`}>
                      <button onClick={() => onUpdateCrmTask(task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })} className="mt-0.5 cursor-pointer">
                        <i className={`bi ${statusIcons[task.status]} fs-lg ${task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}></i>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`data-value fw-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded fw-semibold ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                        <p className="fs-xs text-slate-500 mb-1">{task.leadName} — {task.companyName}</p>
                        {task.description && <p className="fs-xs text-slate-400 truncate">{task.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-[10px] fw-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                          {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{task.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showCreateTask && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowCreateTask(false)}>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <i className="bi bi-check2-square text-white fs-xs"></i>
                        </div>
                        <h3 className="fs-sm fw-bold text-slate-900">Create Task</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Add a new action item or follow-up task to a lead.</p>
                    </div>
                    <button type="button" onClick={() => setShowCreateTask(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      <i className="bi bi-x fs-xl"></i>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div><Label>Lead</Label><Select value={taskLeadId} onChange={e => setTaskLeadId(e.target.value)}><option value="">Select lead...</option>{localLeads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} — {l.companyName}</option>)}</Select></div>
                    <div><Label>Title</Label><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Follow-up call" required /></div>
                    <div><Label>Description</Label><textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" /></div>
                    <div><Label>Assign To</Label><Select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}><option value="">Select employee...</option>{localEmployees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.userId || emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}</Select></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label>Type</Label><Select value={taskType} onChange={e => setTaskType(e.target.value as any)}>{['Follow-up', 'Call', 'Email', 'Meeting', 'Proposal', 'Other'].map(t => <option key={t}>{t}</option>)}</Select></div>
                      <div><Label>Priority</Label><Select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>{['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}</Select></div>
                    </div>
                    <div><Label>Due Date</Label><Input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required /></div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button type="button" onClick={() => setShowCreateTask(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                    <button type="button" onClick={() => {
                      if (taskTitle.trim() && taskLeadId && taskDueDate) {
                        const lead = localLeads.find(l => l.id === taskLeadId);
                        const assigneeId = taskAssignee || selectedUser.id;
                        const assigneeEmp = localEmployees.find(e => e.userId === assigneeId || e.id === assigneeId);
                        const assigneeName = assigneeEmp ? `${assigneeEmp.firstName} ${assigneeEmp.lastName}` : selectedUser.name;
                        if (lead) {
                          onCreateCrmTask({
                            companyId: selectedCompany.id,
                            leadId: taskLeadId,
                            leadName: `${lead.firstName} ${lead.lastName}`,
                            companyName: lead.companyName,
                            title: taskTitle,
                            description: taskDesc,
                            type: taskType,
                            priority: taskPriority,
                            assignedTo: assigneeId,
                            assignedToName: assigneeName,
                            dueDate: new Date(taskDueDate).toISOString()
                          });
                          setShowCreateTask(false);
                          setTaskTitle(''); setTaskDesc(''); setTaskLeadId(''); setTaskDueDate(''); setTaskAssignee('');
                        }
                      }
                    }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Task</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {crmTab === 'emails' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title text-slate-900">Email History</h3>
              <PrimaryBtn icon="bi bi-envelope-plus" onClick={() => setShowSendEmail(true)}>Send Email</PrimaryBtn>
            </div>
            {crmEmails.filter(e => e.companyId === selectedCompany.id).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <i className="bi bi-envelope fs-3xl mb-3 block"></i>
                <p className="fs-sm">No emails sent yet. Send an email to a contact to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {crmEmails.filter(e => e.companyId === selectedCompany.id).map(email => {
                  const lead = localLeads.find(l => l.id === email.leadId);
                  return (
                    <div key={email.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="bi bi-envelope-fill text-slate-400 fs-xs"></i>
                            <span className="data-value fw-semibold text-slate-900">{email.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>To: {email.to}</span>
                            {lead && <span>• {lead.firstName} {lead.lastName}</span>}
                            <span>• by {resolveUserName(email.sentBy)}</span>
                          </div>
                        </div>
                        <span className="data-value-small text-slate-400 shrink-0">{new Date(email.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="fs-xs text-slate-600 mt-2 line-clamp-2">{email.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {showSendEmail && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowSendEmail(false)}>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <i className="bi bi-envelope text-indigo-600 fs-xs"></i>
                        </div>
                        <h3 className="fs-sm fw-bold text-slate-900">Send Email</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Compose and send an email directly to a lead.</p>
                    </div>
                    <button type="button" onClick={() => setShowSendEmail(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      <i className="bi bi-x fs-xl"></i>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div><Label>To</Label><Select value={emailLeadId} onChange={e => {
                      setEmailLeadId(e.target.value);
                      const lead = localLeads.find(l => l.id === e.target.value);
                      if (lead) setEmailTo(lead.email);
                    }}><option value="">Select contact...</option>{localLeads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} — {l.email}</option>)}</Select></div>
                    {emailTo && <div className="text-[10px] text-slate-400">Sending to: {emailTo}</div>}
                    <div><Label>Subject</Label><Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email subject" required /></div>
                    <div><Label>Body</Label><textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none" placeholder="Write your email..." /></div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button type="button" onClick={() => setShowSendEmail(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                    <button type="button" onClick={() => {
                      if (emailTo && emailSubject.trim() && emailBody.trim() && emailLeadId) {
                        onSendCrmEmail({
                          companyId: selectedCompany.id,
                          leadId: emailLeadId,
                          to: emailTo,
                          subject: emailSubject,
                          body: emailBody
                        });
                        setShowSendEmail(false);
                        setEmailTo(''); setEmailSubject(''); setEmailBody(''); setEmailLeadId('');
                      }
                    }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Send Email</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {crmTab === 'reports' && (
          <div className="space-y-6">
            {(() => {
              const wonLeads = localLeads.filter(l => l.status === 'Won');
              const avgDaysToClose = wonLeads.length > 0
                ? Math.round(wonLeads.reduce((sum, l) => {
                  const created = new Date(l.createdAt).getTime();
                  const now = Date.now();
                  return sum + (now - created) / (1000 * 60 * 60 * 24);
                }, 0) / wonLeads.length)
                : 0;
              const sources = ['Website', 'Referral', 'LinkedIn', 'Ad Campaign', 'Partner', 'In-Store'];
              const sourceCounts = sources.map(s => ({ source: s, count: localLeads.filter(l => l.source === s).length })).filter(s => s.count > 0);
              const maxSourceCount = Math.max(...sourceCounts.map(s => s.count), 1);
              return (
                <>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <StatCard label="Win Rate" value={`${localLeads.length > 0 ? Math.round((wonLeads.length / localLeads.length) * 100) : 0}%`} icon="bi bi-trophy" sub="Deals closed vs total" color="text-emerald-600" />
                    <StatCard label="Avg Deal Size" value={formatCurrency(localLeads.length > 0 ? Math.round(localLeads.reduce((s, l) => s + l.value, 0) / localLeads.length) : 0, selectedCompany?.currency)} icon="bi bi-currency-dollar" sub="Mean pipeline value" accent />
                    <StatCard label="Pipeline Velocity" value={wonLeads.length > 0 ? `${avgDaysToClose} days` : 'N/A'} icon="bi bi-speedometer" sub={wonLeads.length > 0 ? 'Avg days to close' : 'No won deals yet'} />
                    <StatCard label="Lost Deals" value={localLeads.filter(l => l.status === 'Lost').length} icon="bi bi-x-circle" sub="This quarter" color="text-rose-600" />
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                      <h3 className="section-title text-slate-500 mb-5">Pipeline by Stage</h3>
                      <div className="space-y-3">
                        {stages.map(stage => {
                          const count = localLeads.filter(l => l.status === stage).length;
                          const pct = localLeads.length > 0 ? (count / localLeads.length) * 100 : 0;
                          return (
                            <div key={stage} className="flex flex-wrap items-center gap-3">
                              <span className="fs-xs fw-semibold text-slate-700 w-32 shrink-0">{stage}</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stageHeaderColors[stage] }} /></div>
                              <span className="data-value-small font-sans tabular-nums text-slate-500 w-12 text-right">{count} leads</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                      <h3 className="section-title text-slate-500 mb-5">Leads by Source</h3>
                      <div className="space-y-3">
                        {sourceCounts.map(({ source, count }) => (
                          <div key={source} className="flex flex-wrap items-center gap-3">
                            <span className="fs-xs fw-semibold text-slate-700 w-24 shrink-0">{source}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full transition-all" style={{ width: `${(count / maxSourceCount) * 100}%` }} /></div>
                            <span className="data-value-small font-sans tabular-nums text-slate-500 w-12 text-right">{count}</span>
                          </div>
                        ))}
                        {sourceCounts.length === 0 && <p className="fs-xs text-slate-400 text-center py-4">No data</p>}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  }
};
