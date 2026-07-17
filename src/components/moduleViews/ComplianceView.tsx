import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, ViewModal, useRowModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { modalAlert } from '../../utils/modal';
import { isAdminRole } from '../../permissions';
import { ComplianceCheck, PolicyDocument } from '../../types';

export const ComplianceView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onCreateComplianceCheck, onDeleteComplianceCheck, onUpdateComplianceCheck } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);
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
        action={isAdmin ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddCheck(true)}>New Check</PrimaryBtn> : undefined} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Overall Score" value={total ? `${Math.round((passed / total) * 100)}%` : '--'} icon="bi bi-shield-check" sub={`${passed}/${total} requirements met`} accent />
        <StatCard label="Compliant" value={passed} icon="bi bi-check-circle" sub="Passed controls" color="text-emerald-600" />
        <StatCard label="Non-Compliant" value={failed} icon="bi bi-x-circle" sub="Requires attention" color="text-rose-600" />
        <StatCard label="Policies" value={localPolicies.length} icon="bi bi-file-text" sub={`${localPolicies.filter(p => p.status === 'Active').length} active`} color="text-sky-600" />
      </div>
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {compTabs.map(t => (
          <button key={t.id} onClick={() => setCompTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${compTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>

      {compTab === 'checklists' && (
        <div className="space-y-2">
          {showAddCheck && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">New Compliance Check</h3>
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
              <div><Label>Description</Label><textarea value={newCheckDesc} onChange={e => setNewCheckDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" placeholder="Optional description" /></div>
              <div className="flex gap-2">
                <PrimaryBtn onClick={submitNewCheck} disabled={!newCheckTitle.trim()}>Create Check</PrimaryBtn>
                <SecBtn onClick={() => setShowAddCheck(false)}>Cancel</SecBtn>
              </div>
            </div>
          )}
          {localChecks.map(check => (
            <div key={check.id} onClick={() => checkModal.open(check)} className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${check.status === 'Compliant' ? 'bg-emerald-50/30 border-emerald-200' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bg-rose-50/20 border-rose-200' : 'bg-slate-50/50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${check.status === 'Compliant' ? 'bg-emerald-100' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                  <i className={`${check.status === 'Compliant' ? 'bi bi-check-circle-fill text-emerald-600' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'bi bi-x-circle-fill text-rose-500' : 'bi bi-clock-fill text-slate-400'} text-sm`}></i>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{check.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge label={check.category} variant="info" />
                    <span className="text-[10px] text-slate-400">Due: {check.dueDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={check.status} variant={check.status === 'Compliant' ? 'success' : check.status === 'Non-Compliant' || check.status === 'Overdue' ? 'danger' : 'warning'} />
                {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); toggleCheckStatus(check); }}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${check.status === 'Compliant' ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {check.status === 'Compliant' ? 'Mark Fail' : 'Mark Pass'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {localChecks.length === 0 && <div className="text-center text-xs text-slate-400 py-8">No compliance checks yet. Create one to get started.</div>}
        </div>
      )}

      {compTab === 'policies' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {localPolicies.map(p => (
            <div key={p.id} onClick={() => policyModal.open(p)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-start justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{p.version} · {p.category} · {p.totalEmployees} employees</div>
                {p.dueDate && <div className="text-[10px] text-slate-400 mt-0.5">Due: {p.dueDate}</div>}
              </div>
              <Badge label={p.status || 'Active'} variant={p.status === 'Active' ? 'success' : 'default'} />
            </div>
          ))}
          {localPolicies.length === 0 && <div className="sm:col-span-2 text-center text-xs text-slate-400 py-8">No policy documents yet.</div>}
        </div>
      )}

      {compTab === 'incidents' && (
        <div className="space-y-3">
          {localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').map(inc => (
            <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-sans tabular-nums text-slate-400">{inc.id.substring(0, 12)}</span>
                  <Badge label={inc.category} variant="danger" />
                </div>
                <div className="text-xs font-bold text-slate-900">{inc.title}</div>
                <div className="data-value text-slate-500 mt-0.5">Due: {inc.dueDate} · Assigned to: {inc.assigneeName || 'Unassigned'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={inc.status} variant={inc.status === 'Overdue' ? 'danger' : 'warning'} />
                {isAdmin && (
                  <button onClick={() => onResolveComplianceCheck(inc.id, 'Compliant')} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-all">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          {localChecks.filter(c => c.status === 'Non-Compliant' || c.status === 'Overdue').length === 0 && (
            <div className="text-center text-xs text-slate-400 py-8">No open incidents. All checks are compliant.</div>
          )}
        </div>
      )}

      {checkModal.selected && (
        <ViewModal title={checkModal.selected.title} subtitle={checkModal.selected.category} onClose={checkModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Category', value: checkModal.selected.category },
              { label: 'Status', value: checkModal.selected.status },
              { label: 'Due Date', value: checkModal.selected.dueDate },
              { label: 'Assignee', value: checkModal.selected.assigneeName || 'Unassigned' },
              { label: 'Description', value: checkModal.selected.description || '—' },
              { label: 'Last Checked', value: checkModal.selected.lastChecked ? new Date(checkModal.selected.lastChecked).toLocaleDateString() : 'Never' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}

      {policyModal.selected && (
        <ViewModal title={policyModal.selected.title} subtitle={`${policyModal.selected.version} · ${policyModal.selected.category}`} onClose={policyModal.close}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Version', value: policyModal.selected.version },
                { label: 'Category', value: policyModal.selected.category },
                { label: 'Total Employees', value: policyModal.selected.totalEmployees },
                { label: 'Due Date', value: policyModal.selected.dueDate || '—' },
              ].map(f => (
                <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
              ))}
            </div>
            {policyModal.selected.content && (
              <div><div className="data-value-small text-slate-500 mb-1">Content</div><div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{policyModal.selected.content}</div></div>
            )}
            {policyModal.selected.acknowledgedBy.length > 0 && (
              <div><div className="data-value-small text-slate-500 mb-1">Acknowledged by ({policyModal.selected.acknowledgedBy.length})</div>
                <div className="flex flex-wrap gap-1">{policyModal.selected.acknowledgedBy.map(name => <Badge key={name} label={name} variant="success" />)}</div>
              </div>
            )}
          </div>
        </ViewModal>
      )}
    </div>
  );
};
