import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, ViewModal, useRowModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { modalAlert, modalConfirm } from '../../utils/modal';
import { isAdminRole, isHRRole, isHRDeptHead } from '../../permissions';
import { ComplianceCheck, PolicyDocument } from '../../types';

export const ComplianceView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onCreateComplianceCheck, onDeleteComplianceCheck, onUpdateComplianceCheck, onDeletePolicyDocument, onClearIncidents } = props;

  const canEditCompliance = isAdminRole(selectedUser.activeRole) || isHRRole(selectedUser.activeRole) || isHRDeptHead(selectedUser.activeRole);
  const localChecks = complianceChecks.filter(c => c.companyId === selectedCompany.id);
  const localPolicies = policyDocuments.filter(p => p.companyId === selectedCompany.id);
  const localIncidents = auditLogs.filter(l => l.companyId === selectedCompany.id && (l.action?.includes('COMPLIANCE') || l.action?.includes('INCIDENT') || l.module === 'Compliance'));

  type CompTab = 'checklists' | 'policies' | 'incidents';
  const compTabFromView = (): CompTab =>
    activeView === 'comp-policies' ? 'policies'
      : activeView === 'comp-incidents' ? 'incidents'
        : 'checklists';
  const [compTab, setCompTab] = useState<CompTab>(compTabFromView());
  useEffect(() => { setCompTab(compTabFromView()); }, [activeView]);
  const compTabs: { id: CompTab; label: string }[] = [
    { id: 'checklists', label: 'Risk Checklists' },
    { id: 'policies', label: 'Policy Library' },
    { id: 'incidents', label: 'Incidents' },
  ];

  const passed = localChecks.filter(c => c.status === 'Compliant').length;
  const failed = localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').length;
  const total = localChecks.length;
  const openIncidents = localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').length;

  const checkModal = useRowModal<ComplianceCheck>();
  const policyModal = useRowModal<PolicyDocument>();

  const [showAddCheck, setShowAddCheck] = useState(false);
  const [newCheckTitle, setNewCheckTitle] = useState('');
  const [newCheckCategory, setNewCheckCategory] = useState('Data Privacy');
  const [newCheckDesc, setNewCheckDesc] = useState('');
  const [newCheckDue, setNewCheckDue] = useState('');
  const [newCheckAssignee, setNewCheckAssignee] = useState('');

  // Incident report form state (available to all roles)
  const [showReportIncident, setShowReportIncident] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentCategory, setIncidentCategory] = useState('Data Privacy');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('Medium');

  // Policy content expand/collapse (for large policy text)
  const [policyContentExpanded, setPolicyContentExpanded] = useState(false);

  const submitNewCheck = () => {
    if (!newCheckTitle.trim()) return;
    const emp = localEmployees.find(e => e.id === newCheckAssignee);
    onCreateComplianceCheck({
      companyId: selectedCompany.id,
      category: newCheckCategory,
      title: newCheckTitle.trim(),
      description: newCheckDesc.trim(),
      dueDate: newCheckDue || new Date().toISOString().split('T')[0],
      assignee: newCheckAssignee || '',
      assigneeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned',
      createdBy: selectedUser.name,
    });
    setNewCheckTitle(''); setNewCheckDesc(''); setNewCheckDue(''); setNewCheckAssignee(''); setShowAddCheck(false);
  };

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  const toggleCheckStatus = (check: ComplianceCheck) => {
    const next = check.status === 'Compliant' ? 'Non-Compliant' : 'Compliant';
    onResolveComplianceCheck(check.id, next);
  };

  return (
    <div>
      <PageHeader title="Compliance & Risk Management" subtitle="Track regulatory requirements, maintain policy library and log compliance incidents."
        action={canEditCompliance ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddCheck(true)}>New Check</PrimaryBtn> : undefined} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Overall Score" value={total ? `${Math.round((passed / total) * 100)}%` : '--'} icon="bi bi-shield-check" sub={`${passed}/${total} requirements met`} accent />
        <StatCard label="Compliant" value={passed} icon="bi bi-check-circle" sub="Passed controls" color="text-emerald-600" />
        <StatCard label="Non-Compliant" value={failed} icon="bi bi-x-circle" sub="Requires attention" color="text-rose-600" />
        <StatCard label="Policies" value={localPolicies.length} icon="bi bi-file-text" sub={`${localPolicies.filter(p => p.status === 'Active').length} active`} color="text-sky-600" />
      </div>
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {compTabs.map(t => (
          <button key={t.id} onClick={() => setCompTab(t.id)} className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${compTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>

      {compTab === 'checklists' && (
        <div className="space-y-2">
          {showAddCheck && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 mb-4">
              <h3 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide">New Compliance Check</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Title</Label><Input value={newCheckTitle} onChange={e => setNewCheckTitle(e.target.value)} placeholder="e.g. GDPR Data Processing Audit" /></div>
                <div><Label>Category</Label>
                  <Select value={newCheckCategory} onChange={e => setNewCheckCategory(e.target.value)}>
                    {['SOX', 'Tax', 'Labor', 'Data Privacy', 'Financial', 'Environmental'].map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div><Label>Due Date</Label><Input type="date" value={newCheckDue} onChange={e => setNewCheckDue(e.target.value)} /></div>
                <div><Label>Assignee</Label>
                  <Select value={newCheckAssignee} onChange={e => setNewCheckAssignee(e.target.value)}>
                    <option value="">Unassigned</option>
                    {localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><textarea value={newCheckDesc} onChange={e => setNewCheckDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" placeholder="Optional description" /></div>
              <div className="flex flex-wrap gap-2">
                <PrimaryBtn onClick={submitNewCheck} disabled={!newCheckTitle.trim()}>Create Check</PrimaryBtn>
                <SecBtn onClick={() => setShowAddCheck(false)}>Cancel</SecBtn>
              </div>
            </div>
          )}
          {localChecks.map(check => (
            <div key={check.id} onClick={() => checkModal.open(check)} className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${check.status === 'Compliant' ? 'bg-emerald-50/30 border-emerald-200' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bg-rose-50/20 border-rose-200' : 'bg-slate-50/50 border-slate-200'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${check.status === 'Compliant' ? 'bg-emerald-100' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                  <i className={`${check.status === 'Compliant' ? 'bi bi-check-circle-fill text-emerald-600' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bi bi-x-circle-fill text-rose-500' : 'bi bi-clock-fill text-slate-400'} fs-sm`}></i>
                </div>
                <div>
                  <span className="fs-xs fw-semibold text-slate-900">{check.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge label={check.category} variant="info" />
                    <span className="text-[10px] text-slate-400">Due: {check.dueDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge label={check.status} variant={check.status === 'Compliant' ? 'success' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'danger' : 'warning'} />
                {canEditCompliance && (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleCheckStatus(check); }}
                      className={`text-[10px] fw-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${check.status === 'Compliant' ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                      {check.status === 'Compliant' ? 'Mark Fail' : 'Mark Pass'}
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (await modalConfirm('Delete this compliance check?', { variant: 'danger' })) onDeleteComplianceCheck(check.id); }}
                      className="text-[10px] fw-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {localChecks.length === 0 && <div className="text-center fs-xs text-slate-400 py-8">No compliance checks yet. Create one to get started.</div>}
        </div>
      )}

      {compTab === 'policies' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {localPolicies.map(p => (
            <div key={p.id} onClick={() => policyModal.open(p)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-start justify-between cursor-pointer">
              <div>
                <div className="fs-xs fw-semibold text-slate-900">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{p.version} · {p.category} · {p.totalEmployees} employees</div>
                {p.dueDate && <div className="text-[10px] text-slate-400 mt-0.5">Due: {p.dueDate}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge label={p.status || 'Active'} variant={p.status === 'Active' ? 'success' : 'default'} />
                {canEditCompliance && (
                  <button onClick={async (e) => { e.stopPropagation(); if (await modalConfirm('Delete this policy?', { variant: 'danger' })) onDeletePolicyDocument?.(p.id); }}
                    className="text-[10px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {localPolicies.length === 0 && <div className="sm:col-span-2 text-center fs-xs text-slate-400 py-8">No policy documents yet.</div>}
        </div>
      )}

      {compTab === 'incidents' && (
        <div className="space-y-4">
          {/* Report Incident Button — available to all roles */}
          <div className="flex justify-end gap-2">
            {canEditCompliance && (
              <SecBtn onClick={() => { modalConfirm('Clear all incidents?', { variant: 'danger' }).then(res => { if (res) onClearIncidents?.(); }); }}>
                <i className="bi bi-trash fs-xs"></i> Clear Incidents
              </SecBtn>
            )}
            <PrimaryBtn icon="bi bi-flag" onClick={() => setShowReportIncident(true)}>Report Incident</PrimaryBtn>
          </div>

          {/* Report Incident Modal */}
          {showReportIncident && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <i className="bi bi-flag-fill text-white"></i>
                    </div>
                    <div>
                      <h2 className="fs-sm fw-bold text-white">Report a Compliance Incident</h2>
                      <p className="fs-xs text-white/70">Flag a compliance concern or violation for review</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <Label>Incident Title *</Label>
                    <Input value={incidentTitle} onChange={e => setIncidentTitle(e.target.value)} placeholder="e.g. Unauthorized data access detected" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Category</Label>
                      <Select value={incidentCategory} onChange={e => setIncidentCategory(e.target.value)}>
                        {['Data Privacy', 'SOX', 'Tax', 'Labor', 'Financial', 'Environmental', 'Security', 'Health & Safety'].map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Select value={incidentSeverity} onChange={e => setIncidentSeverity(e.target.value)}>
                        {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" placeholder="Describe the incident in detail..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <SecBtn onClick={() => { setShowReportIncident(false); setIncidentTitle(''); setIncidentDesc(''); }}>Cancel</SecBtn>
                  <PrimaryBtn icon="bi bi-send" onClick={() => {
                    if (!incidentTitle.trim()) return void modalAlert('Please enter an incident title', { variant: 'warning' });
                    onCreateComplianceCheck({
                      companyId: selectedCompany.id,
                      category: incidentCategory,
                      title: `[${incidentSeverity.toUpperCase()}] ${incidentTitle.trim()}`,
                      description: `Reported by: ${selectedUser.name}\nSeverity: ${incidentSeverity}\n\n${incidentDesc.trim()}`,
                      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                      assignee: '',
                      assigneeName: 'Unassigned',
                      createdBy: selectedUser.name,
                      status: 'Non-Compliant',
                    });
                    setShowReportIncident(false); setIncidentTitle(''); setIncidentDesc(''); setIncidentSeverity('Medium');
                    modalAlert('Incident reported successfully. It will be reviewed by the compliance team.', { variant: 'success' });
                  }}>Submit Report</PrimaryBtn>
                </div>
              </div>
            </div>
          )}
          {localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').map(inc => (
            <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-sans tabular-nums text-slate-400">{inc.id.substring(0, 12)}</span>
                  <Badge label={inc.category} variant="danger" />
                </div>
                <div className="fs-xs fw-bold text-slate-900">{inc.title}</div>
                <div className="data-value text-slate-500 mt-0.5">Due: {inc.dueDate} · {inc.assigneeName && inc.assigneeName !== 'Unassigned' ? `Assigned to: ${inc.assigneeName}` : 'Pending review by HR, Head of Dept & Admin'}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge label={inc.status} variant={inc.status === 'Overdue' ? 'danger' : 'warning'} />
                {canEditCompliance && (
                  <button onClick={() => onResolveComplianceCheck(inc.id, 'Compliant')} className="text-[10px] fw-semibold px-3 py-1.5 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-all">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          {localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').length === 0 && (
            <div className="bg-white border border-emerald-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-emerald-50/50 px-6 py-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <i className="bi bi-shield-check text-emerald-600 fs-xl"></i>
                </div>
                <div>
                  <div className="fs-sm fw-bold text-emerald-800">All Clear — No Open Incidents</div>
                  <div className="fs-xs text-emerald-600 mt-0.5">All compliance checks are passing. Your organisation is fully compliant.</div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-emerald-100">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <i className="bi bi-check-circle-fill text-emerald-500 fs-sm"></i>
                    </div>
                    <div>
                      <div className="fs-lg fw-bold text-slate-900 tabular-nums">{passed}</div>
                      <div className="text-[10px] text-slate-500">Checks Passing</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                      <i className="bi bi-file-text-fill text-sky-500 fs-sm"></i>
                    </div>
                    <div>
                      <div className="fs-lg fw-bold text-slate-900 tabular-nums">{localPolicies.filter(p => p.status === 'Active').length}</div>
                      <div className="text-[10px] text-slate-500">Active Policies</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <i className="bi bi-calendar-check-fill text-slate-400 fs-sm"></i>
                    </div>
                    <div>
                      <div className="fs-lg fw-bold text-slate-900 tabular-nums">{total}</div>
                      <div className="text-[10px] text-slate-500">Total Checks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Premium Compliance Check Detail Modal ── */}
      {checkModal.selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Colored header based on status */}
            <div className={`px-6 py-4 ${checkModal.selected.status === 'Compliant' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : checkModal.selected.status === 'Non-Compliant' || checkModal.selected.status === 'Overdue' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <i className={`${checkModal.selected.status === 'Compliant' ? 'bi bi-shield-check' : 'bi bi-shield-exclamation'} text-white fs-lg`}></i>
                  </div>
                  <div>
                    <h2 className="fs-sm fw-bold text-white">{checkModal.selected.title}</h2>
                    <p className="fs-xs text-white/70">{checkModal.selected.category}</p>
                  </div>
                </div>
                <button onClick={checkModal.close} className="text-white/60 hover:text-white cursor-pointer"><i className="bi bi-x-lg fs-lg"></i></button>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Status', value: checkModal.selected.status, icon: 'bi bi-flag' },
                  { label: 'Category', value: checkModal.selected.category, icon: 'bi bi-tag' },
                  { label: 'Due Date', value: checkModal.selected.dueDate, icon: 'bi bi-calendar3' },
                  { label: 'Assignee', value: checkModal.selected.assigneeName || 'Unassigned', icon: 'bi bi-person' },
                  { label: 'Last Checked', value: checkModal.selected.lastChecked ? new Date(checkModal.selected.lastChecked).toLocaleDateString() : 'Never', icon: 'bi bi-clock-history' },
                ].map(f => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className={`${f.icon} text-slate-400 text-[10px]`}></i>
                      <span className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">{f.label}</span>
                    </div>
                    <div className="fs-xs fw-semibold text-slate-900">{f.value}</div>
                  </div>
                ))}
              </div>
              {checkModal.selected.description && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <i className="bi bi-text-paragraph text-slate-400 text-[10px]"></i>
                    <span className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">Description</span>
                  </div>
                  <div className="fs-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{checkModal.selected.description}</div>
                </div>
              )}
              {canEditCompliance && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { toggleCheckStatus(checkModal.selected!); checkModal.close(); }}
                    className={`flex-1 fs-xs fw-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${checkModal.selected.status === 'Compliant' ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    <i className={`${checkModal.selected.status === 'Compliant' ? 'bi bi-x-circle' : 'bi bi-check-circle'}`}></i>
                    {checkModal.selected.status === 'Compliant' ? 'Mark as Non-Compliant' : 'Mark as Compliant'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Premium Policy Detail Modal ── */}
      {policyModal.selected && ((() => {
        const pol = policyModal.selected!;
        const contentPreviewLen = 300;
        const isLongContent = pol.content && pol.content.length > contentPreviewLen;
        const fileTypeIcons: Record<string, { icon: string; color: string; bg: string }> = {
          pdf: { icon: 'bi bi-file-earmark-pdf-fill', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          docx: { icon: 'bi bi-file-earmark-word-fill', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          xlsx: { icon: 'bi bi-file-earmark-excel-fill', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          pptx: { icon: 'bi bi-file-earmark-ppt-fill', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
          txt: { icon: 'bi bi-file-earmark-text-fill', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
          other: { icon: 'bi bi-file-earmark-fill', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
        };
        const ft = fileTypeIcons[pol.attachmentType || 'other'] || fileTypeIcons.other;
        const showContent = policyContentExpanded || !isLongContent
          ? pol.content
          : pol.content.slice(0, contentPreviewLen) + '...';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Blue header */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <i className="bi bi-file-earmark-text text-white fs-lg"></i>
                    </div>
                    <div>
                      <h2 className="fs-sm fw-bold text-white">{pol.title}</h2>
                      <p className="fs-xs text-white/70">{pol.version} · {pol.category}</p>
                    </div>
                  </div>
                  <button onClick={() => { policyModal.close(); setPolicyContentExpanded(false); }} className="text-white/60 hover:text-white cursor-pointer"><i className="bi bi-x-lg fs-lg"></i></button>
                </div>
              </div>
              {/* Body */}
              <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Version', value: pol.version, icon: 'bi bi-hash' },
                    { label: 'Category', value: pol.category, icon: 'bi bi-bookmark' },
                    { label: 'Status', value: pol.status || 'Active', icon: 'bi bi-flag' },
                    { label: 'Employees', value: `${pol.totalEmployees} covered`, icon: 'bi bi-people' },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <i className={`${f.icon} text-slate-400 text-[10px]`}></i>
                        <span className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">{f.label}</span>
                      </div>
                      <div className="fs-xs fw-semibold text-slate-900">{f.value}</div>
                    </div>
                  ))}
                </div>
                {pol.dueDate && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center gap-2">
                    <i className="bi bi-calendar-event text-amber-500 fs-sm"></i>
                    <span className="fs-xs text-amber-800 fw-medium">Review Due: {pol.dueDate}</span>
                  </div>
                )}

                {/* Document Attachment */}
                {pol.attachmentUrl && (
                  <div className={`rounded-xl p-4 border ${ft.bg} flex items-center justify-between`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <i className={`${ft.icon} ${ft.color} fs-lg`}></i>
                      </div>
                      <div>
                        <div className="fs-xs fw-bold text-slate-900">{pol.attachmentName || 'Attached Document'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{(pol.attachmentType || 'file').toUpperCase()} Document</div>
                      </div>
                    </div>
                    <a href={pol.attachmentUrl} target="_blank" rel="noopener noreferrer"
                      className="fs-xs fw-semibold px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer">
                      <i className="bi bi-download"></i> Download
                    </a>
                  </div>
                )}

                {/* Policy Content — collapsible for large text */}
                {pol.content && (
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <i className="bi bi-text-paragraph text-slate-400 text-[10px]"></i>
                        <span className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">Policy Content</span>
                      </div>
                      {isLongContent && (
                        <span className="text-[10px] text-slate-400">{pol.content.length.toLocaleString()} characters</span>
                      )}
                    </div>
                    <div className="px-4 pb-4">
                      <div className="fs-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">{showContent}</div>
                    </div>
                    {isLongContent && (
                      <button onClick={() => setPolicyContentExpanded(!policyContentExpanded)}
                        className="w-full py-2.5 text-[10px] fw-semibold text-sky-600 bg-sky-50/50 border-t border-slate-200 hover:bg-sky-50 transition-colors cursor-pointer flex items-center justify-center gap-1">
                        <i className={`bi ${policyContentExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        {policyContentExpanded ? 'Show Less' : `Show Full Content (${pol.content.length.toLocaleString()} chars)`}
                      </button>
                    )}
                  </div>
                )}

                {pol.acknowledgedBy.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <i className="bi bi-check2-all text-slate-400 text-[10px]"></i>
                      <span className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">Acknowledged ({pol.acknowledgedBy.length} / {pol.totalEmployees})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">{pol.acknowledgedBy.map(name => <Badge key={name} label={name} variant="success" />)}</div>
                  </div>
                )}
                {!pol.acknowledgedBy.includes(selectedUser.name) && (
                  <div className="pt-2">
                    <button onClick={() => { onAcknowledgePolicy(pol.id, selectedUser.name); policyModal.close(); setPolicyContentExpanded(false); }}
                      className="w-full fs-xs fw-semibold px-4 py-2.5 rounded-xl cursor-pointer bg-sky-600 text-white hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
                      <i className="bi bi-check2-circle"></i> Acknowledge Policy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })())}
    </div>
  );
};
