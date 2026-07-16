import React, { useState, useEffect } from 'react';
import { parseActiveView } from '../../parseActiveView';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';

export const ProjectView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const initialProjTab = (): 'kanban' | 'milestones' | 'time' | 'resources' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'milestones') return 'milestones';
    if (sub === 'time') return 'time';
    if (sub === 'resources') return 'resources';
    return 'kanban';
  };
  const [projTab, setProjTab] = useState<'kanban' | 'milestones' | 'time' | 'resources'>(initialProjTab);
  useEffect(() => { setProjTab(initialProjTab()); }, [activeView]);
  const [projTasks, setProjTasks] = useState([
    { id: 'T-01', title: 'Design DB Schema', status: 'Done', priority: 'High', assignee: 'Elena R.', due: '2026-07-05' },
    { id: 'T-02', title: 'Integrate SSO Auth', status: 'In Progress', priority: 'Critical', assignee: 'Kaito M.', due: '2026-07-12' },
    { id: 'T-03', title: 'Build BOM Module UI', status: 'In Progress', priority: 'High', assignee: 'Ayasha C.', due: '2026-07-15' },
    { id: 'T-04', title: 'Write API Docs', status: 'To Do', priority: 'Medium', assignee: 'Markus V.', due: '2026-07-20' },
    { id: 'T-05', title: 'Pen-test Endpoints', status: 'To Do', priority: 'Critical', assignee: 'Lila P.', due: '2026-07-25' },
    { id: 'T-06', title: 'UX Accessibility Audit', status: 'Review', priority: 'Low', assignee: 'James O.', due: '2026-07-18' },
  ]);
  const [newTask, setNewTask] = useState(''); const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const timeModal = useRowModal<typeof projTasks[0] & { hours: number; billable: boolean }>();
  const resourceModal = useRowModal<typeof localEmployees[0] & { util: number; taskCount: number }>();

  const cols = ['To Do', 'In Progress', 'Review', 'Done'];
  const priorityColor = (p: string) => p === 'Critical' ? 'border-rose-400 text-rose-700 bg-rose-50' : p === 'High' ? 'border-amber-400 text-amber-700 bg-amber-50' : p === 'Medium' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-500 bg-slate-50';
  const milestones = [
    { name: 'MVP Architecture Sign-off', due: '2026-06-30', status: 'Completed', completion: 100 },
    { name: 'Backend API Integration', due: '2026-07-15', status: 'In Progress', completion: 65 },
    { name: 'QA & Security Audit', due: '2026-07-05', status: 'Overdue', completion: 30 },
    { name: 'UAT with Client', due: '2026-07-25', status: 'Upcoming', completion: 0 },
    { name: 'Production Launch', due: '2026-08-01', status: 'Upcoming', completion: 0 },
  ];
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = projTasks.filter(t => t.status !== 'Done' && t.due !== '—' && t.due < todayStr).length;

  return (
    <div>
      <PageHeader title="Project Management — Kanban" subtitle="Track tasks across stages, assign resources, monitor milestones and time logs." />

      {projTab === 'kanban' && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <Input className="max-w-xs" placeholder="New task title…" value={newTask} onChange={e => setNewTask(e.target.value)} />
            <Select className="w-32" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select>
            <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
              if (!newTask.trim()) return;
              setProjTasks(prev => [...prev, { id: `T-0${prev.length + 1}`, title: newTask, status: 'To Do', priority: newTaskPriority, assignee: 'Unassigned', due: '—' }]);
              setNewTask('');
            }}>Add Task</PrimaryBtn>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {cols.map(col => (
              <div key={col} className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 min-h-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-title text-slate-600">{col}</span>
                  <span className="text-[10px] font-sans tabular-nums bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">{projTasks.filter(t => t.status === col).length}</span>
                </div>
                <div className="space-y-2">
                  {projTasks.filter(t => t.status === col).map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                      <div className="text-xs font-semibold text-slate-900 mb-2 leading-tight">{task.title}</div>
                      <div className="flex items-center justify-between">
                        <span className={`data-value-small font-bold border px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>{task.priority}</span>
                        <span className="text-[10px] text-slate-400 font-sans tabular-nums">{task.due}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5">{task.assignee}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {projTab === 'milestones' && (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Total Milestones" value={milestones.length} icon="bi bi-flag" sub="Project checkpoints" />
            <StatCard label="Completed" value={milestones.filter(m => m.status === 'Completed').length} icon="bi bi-check-circle" sub="On schedule" color="text-emerald-600" />
            <StatCard label="Overdue" value={milestones.filter(m => m.status === 'Overdue').length} icon="bi bi-exclamation-circle" sub="Needs attention" accent />
          </div>
          {milestones.map(m => (
            <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div><div className="table-cell-semibold text-slate-900">{m.name}</div><div className="data-value-small text-slate-400 mt-0.5">Due: {m.due}</div></div>
                <Badge label={m.status} variant={m.status === 'Completed' ? 'success' : m.status === 'Overdue' ? 'danger' : m.status === 'In Progress' ? 'info' : 'default'} />
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${m.completion === 100 ? 'bg-emerald-500' : m.status === 'Overdue' ? 'bg-rose-400' : 'bg-slate-800'}`} style={{ width: `${m.completion}%` }} /></div>
              <div className="text-[10px] text-slate-400 mt-1">{m.completion}% complete</div>
            </div>
          ))}
        </div>
      )}

      {projTab === 'time' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Hours Logged This Week" value={`${attendance.filter(a => a.companyId === selectedCompany.id).length * 8}h`} icon="bi bi-clock" sub="Across all team members" accent />
            <StatCard label="Billable Hours" value={`${Math.round(attendance.filter(a => a.companyId === selectedCompany.id).length * 8 * 0.83)}h`} icon="bi bi-currency-dollar" sub="83% billability" color="text-emerald-600" />
            <StatCard label="Overdue Tasks" value={overdueTasks} icon="bi bi-exclamation-triangle" sub="Past due, not done" color="text-rose-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Time Log — This Week</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Team Member' }, { label: 'Task' }, { label: 'Date' }, { label: 'Hours Logged', right: true }, { label: 'Billable' }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {projTasks.slice(0, 5).map((task, i) => {
                  const hours = [6.5, 8, 4, 7.5, 5][i] ?? 5;
                  const billable = [true, true, false, true, true][i];
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => timeModal.open({ ...task, hours, billable })}>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{task.assignee}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate">{task.title}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">2026-07-0{i + 1}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">{hours}h</td>
                      <td className="px-4 py-3"><Badge label={billable ? 'Billable' : 'Internal'} variant={billable ? 'success' : 'default'} /></td>
                      <td className="px-4 py-3"><Badge label={task.status} variant={task.status === 'Done' ? 'success' : 'info'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {projTab === 'resources' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Team Size" value={localEmployees.length} icon="bi bi-people" sub="Allocated to project" />
            <StatCard label="Avg Utilisation" value={`${localEmployees.length ? Math.round((attendance.filter(a => a.companyId === selectedCompany.id && a.status === 'Present').length / localEmployees.length) * 100) : 0}%`} icon="bi bi-speedometer" sub="Capacity vs logged hours" accent />
            <StatCard label="Available Capacity" value={`${localEmployees.length ? Math.round(((localEmployees.length - attendance.filter(a => a.companyId === selectedCompany.id && a.status === 'Present').length) / localEmployees.length) * 100) : 100}%`} icon="bi bi-person-check" sub="Unallocated bandwidth" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Team Resource Allocation</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Team Member' }, { label: 'Department' }, { label: 'Role' }, { label: 'Utilisation', right: true }, { label: 'Tasks Assigned', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localEmployees.slice(0, 6).map((emp, i) => {
                  const utils = [92, 78, 45, 100, 65, 80];
                  const u = utils[i] ?? 70;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => resourceModal.open({ ...emp, util: u, taskCount: projTasks.filter(t => t.assignee.includes(emp.firstName)).length })}>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{emp.department}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{emp.designation}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${u >= 90 ? 'bg-rose-400' : u >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${u}%` }} /></div>
                          <span className="text-[10px] font-sans tabular-nums text-slate-600">{u}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">{projTasks.filter(t => t.assignee.includes(emp.firstName)).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {timeModal.selected && (
        <ViewModal title={timeModal.selected.title} subtitle={`${timeModal.selected.assignee} — Time Log`} onClose={timeModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Task', value: timeModal.selected.title },
              { label: 'Assignee', value: timeModal.selected.assignee },
              { label: 'Date', value: `2026-07-01` },
              { label: 'Hours', value: `${timeModal.selected.hours}h` },
              { label: 'Billable', value: timeModal.selected.billable ? 'Yes' : 'No' },
              { label: 'Status', value: timeModal.selected.status },
              { label: 'Priority', value: timeModal.selected.priority },
              { label: 'Due', value: timeModal.selected.due },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}
      {resourceModal.selected && (
        <ViewModal title={`${resourceModal.selected.firstName} ${resourceModal.selected.lastName}`} subtitle={resourceModal.selected.designation} onClose={resourceModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Employee', value: `${resourceModal.selected.firstName} ${resourceModal.selected.lastName}` },
              { label: 'Department', value: resourceModal.selected.department },
              { label: 'Designation', value: resourceModal.selected.designation },
              { label: 'Utilisation', value: `${resourceModal.selected.util}%` },
              { label: 'Tasks Assigned', value: resourceModal.selected.taskCount },
              { label: 'Status', value: resourceModal.selected.status },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-500">Utilisation</span><span className="font-bold text-slate-900">{resourceModal.selected.util}%</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${resourceModal.selected.util >= 90 ? 'bg-rose-400' : resourceModal.selected.util >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${resourceModal.selected.util}%` }} /></div>
          </div>
        </ViewModal>
      )}
    </div>
  );
};
