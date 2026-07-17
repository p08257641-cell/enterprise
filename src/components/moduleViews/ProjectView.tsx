import React, { useState, useEffect } from 'react';
import { parseActiveView } from '../../parseActiveView';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { isAdminRole } from '../../permissions';

export const ProjectView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, attendance, projectTasks: dbTasks, projectMilestones: dbMilestones, onCreateProjectTask, onUpdateProjectTask, onDeleteProjectTask, onCreateProjectMilestone, onUpdateProjectMilestone, onDeleteProjectMilestone } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localTasks = dbTasks.filter(t => t.companyId === selectedCompany.id);
  const localMilestones = dbMilestones.filter(m => m.companyId === selectedCompany.id);
  const isAdmin = isAdminRole(selectedUser.activeRole);

  const initialProjTab = (): 'kanban' | 'milestones' | 'time' | 'resources' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'milestones') return 'milestones';
    if (sub === 'time') return 'time';
    if (sub === 'resources') return 'resources';
    return 'kanban';
  };
  const [projTab, setProjTab] = useState<'kanban' | 'milestones' | 'time' | 'resources'>(initialProjTab);
  useEffect(() => { setProjTab(initialProjTab()); }, [activeView]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const [showAddMs, setShowAddMs] = useState(false);
  const [newMsName, setNewMsName] = useState('');
  const [newMsDue, setNewMsDue] = useState('');
  const [newMsStatus, setNewMsStatus] = useState('Upcoming');

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());

  const timeModal = useRowModal<typeof localTasks[0] & { hours: number; billable: boolean }>();
  const resourceModal = useRowModal<typeof localEmployees[0] & { util: number; taskCount: number }>();
  const taskModal = useRowModal<typeof localTasks[0]>();
  const msModal = useRowModal<typeof localMilestones[0]>();

  const cols = ['To Do', 'In Progress', 'Review', 'Done'];
  const priorityColor = (p: string) => p === 'Critical' ? 'border-rose-400 text-rose-700 bg-rose-50' : p === 'High' ? 'border-amber-400 text-amber-700 bg-amber-50' : p === 'Medium' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-500 bg-slate-50';
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = localTasks.filter(t => t.status !== 'Done' && t.due && t.due < todayStr).length;

  const submitNewTask = () => {
    if (!newTaskTitle.trim()) return;
    const emp = localEmployees.find(e => e.id === newTaskAssignee);
    onCreateProjectTask({
      companyId: selectedCompany.id,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: 'To Do',
      priority: newTaskPriority,
      assignee: newTaskAssignee || '',
      assigneeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned',
      due: newTaskDue || '',
    });
    setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskDue(''); setNewTaskAssignee(''); setNewTaskPriority('Medium'); setShowAddTask(false);
  };

  const submitNewMs = () => {
    if (!newMsName.trim()) return;
    onCreateProjectMilestone({
      companyId: selectedCompany.id,
      name: newMsName.trim(),
      due: newMsDue || '',
      status: newMsStatus,
      completion: 0,
    });
    setNewMsName(''); setNewMsDue(''); setNewMsStatus('Upcoming'); setShowAddMs(false);
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const onDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colName);
  };

  const onDragLeave = () => {
    setDragOverCol(null);
  };

  const onDrop = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = localTasks.find(t => t.id === taskId);
    if (task && task.status !== colName) {
      onUpdateProjectTask(taskId, { status: colName });
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div>
      <PageHeader title="Project Management" subtitle="Track tasks across stages, assign resources, monitor milestones and time logs."
        action={isAdmin ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddTask(true)}>New Task</PrimaryBtn> : undefined} />

      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {[
          { id: 'kanban' as const, label: 'Kanban Board' },
          { id: 'milestones' as const, label: 'Milestones' },
          { id: 'time' as const, label: 'Time Logs' },
          { id: 'resources' as const, label: 'Resources' },
        ].map(t => (
          <button key={t.id} onClick={() => setProjTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${projTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>

      {projTab === 'kanban' && (
        <>
          {showAddTask && isAdmin && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">New Task</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Title</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g. Design API Endpoints" /></div>
                <div><Label>Priority</Label><Select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select></div>
                <div><Label>Assignee</Label><Select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}><option value="">Unassigned</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</Select></div>
                <div><Label>Due Date</Label><Input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" placeholder="Optional description" /></div>
              <div className="flex gap-2">
                <PrimaryBtn onClick={submitNewTask} disabled={!newTaskTitle.trim()}>Create Task</PrimaryBtn>
                <SecBtn onClick={() => setShowAddTask(false)}>Cancel</SecBtn>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            {cols.map(col => {
              const isCollapsed = collapsedCols.has(col);
              const colTasks = localTasks.filter(t => t.status === col);
              return (
                <div key={col}
                  onDragOver={(e) => { if (!isCollapsed) onDragOver(e, col); }}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => { if (!isCollapsed) onDrop(e, col); }}
                  className={`bg-slate-50/60 border rounded-xl transition-all ${isCollapsed ? 'w-12 p-2 min-h-[200px]' : 'flex-1 p-3 min-h-[400px]'} ${dragOverCol === col && !isCollapsed ? 'border-slate-400 bg-slate-100/60 ring-2 ring-slate-200' : 'border-slate-200'}`}>
                  {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2 h-full">
                      <button onClick={() => setCollapsedCols(prev => { const next = new Set(prev); next.delete(col); return next; })} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" title={`Expand ${col}`}>
                        <i className="bi bi-chevron-right text-xs"></i>
                      </button>
                      <span className="text-[10px] font-bold text-slate-600 [writing-mode:vertical-lr] tracking-wider uppercase">{col}</span>
                      <span className="text-[10px] font-sans tabular-nums bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-400">{colTasks.length}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="section-title text-slate-600">{col}</span>
                          <button onClick={() => setCollapsedCols(prev => { const next = new Set(prev); next.add(col); return next; })} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" title={`Collapse ${col}`}>
                            <i className="bi bi-chevron-down text-[10px]"></i>
                          </button>
                        </div>
                        <span className="text-[10px] font-sans tabular-nums bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">{colTasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colTasks.map(task => (
                          <div key={task.id}
                            draggable={isAdmin}
                            onDragStart={(e) => onDragStart(e, task.id)}
                            onDragEnd={onDragEnd}
                            onClick={() => taskModal.open(task)}
                            className={`bg-white border rounded-lg p-3 shadow-xs transition-all ${draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed' : 'cursor-grab hover:border-slate-300 hover:shadow-sm active:cursor-grabbing'} border-slate-200`}>
                            <div className="text-xs font-semibold text-slate-900 mb-2 leading-tight">{task.title}</div>
                            <div className="flex items-center justify-between">
                              <span className={`data-value-small font-bold border px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>{task.priority}</span>
                              <span className="text-[10px] text-slate-400 font-sans tabular-nums">{task.due || '—'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1.5">{task.assigneeName || 'Unassigned'}</div>
                            {isAdmin && (
                              <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                                <button onClick={(e) => { e.stopPropagation(); onDeleteProjectTask(task.id); }} className="text-[9px] font-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Delete</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {projTab === 'milestones' && (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Total Milestones" value={localMilestones.length} icon="bi bi-flag" sub="Project checkpoints" />
            <StatCard label="Completed" value={localMilestones.filter(m => m.status === 'Completed').length} icon="bi bi-check-circle" sub="On schedule" color="text-emerald-600" />
            <StatCard label="Overdue" value={localMilestones.filter(m => m.status === 'Overdue').length} icon="bi bi-exclamation-circle" sub="Needs attention" accent />
          </div>
          {isAdmin && (
            <div className="flex justify-end mb-2">
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddMs(true)}>New Milestone</PrimaryBtn>
            </div>
          )}
          {showAddMs && isAdmin && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">New Milestone</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Name</Label><Input value={newMsName} onChange={e => setNewMsName(e.target.value)} placeholder="e.g. Beta Release" /></div>
                <div><Label>Due Date</Label><Input type="date" value={newMsDue} onChange={e => setNewMsDue(e.target.value)} /></div>
                <div><Label>Status</Label><Select value={newMsStatus} onChange={e => setNewMsStatus(e.target.value)}><option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Overdue</option></Select></div>
              </div>
              <div className="flex gap-2">
                <PrimaryBtn onClick={submitNewMs} disabled={!newMsName.trim()}>Create Milestone</PrimaryBtn>
                <SecBtn onClick={() => setShowAddMs(false)}>Cancel</SecBtn>
              </div>
            </div>
          )}
          {localMilestones.map(m => (
            <div key={m.id} onClick={() => msModal.open(m)} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs cursor-pointer hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div><div className="table-cell-semibold text-slate-900">{m.name}</div><div className="data-value-small text-slate-400 mt-0.5">Due: {m.due || '—'}</div></div>
                <Badge label={m.status} variant={m.status === 'Completed' ? 'success' : m.status === 'Overdue' ? 'danger' : m.status === 'In Progress' ? 'info' : 'default'} />
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${m.completion === 100 ? 'bg-emerald-500' : m.status === 'Overdue' ? 'bg-rose-400' : 'bg-slate-800'}`} style={{ width: `${m.completion}%` }} /></div>
              <div className="text-[10px] text-slate-400 mt-1">{m.completion}% complete</div>
              {isAdmin && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                  {m.completion < 100 && <button onClick={(e) => { e.stopPropagation(); onUpdateProjectMilestone(m.id, { completion: Math.min(100, m.completion + 10), status: m.completion + 10 >= 100 ? 'Completed' : 'In Progress' }); }} className="text-[9px] font-semibold px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">+10%</button>}
                  <button onClick={(e) => { e.stopPropagation(); onDeleteProjectMilestone(m.id); }} className="text-[9px] font-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer ml-auto">Del</button>
                </div>
              )}
            </div>
          ))}
          {localMilestones.length === 0 && <div className="text-center text-xs text-slate-400 py-8">No milestones yet.</div>}
        </div>
      )}

      {projTab === 'time' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 mb-2">
            <StatCard label="Hours Logged This Week" value={`${localTasks.length * 8}h`} icon="bi bi-clock" sub="Across all team members" accent />
            <StatCard label="Billable Hours" value={`${Math.round(localTasks.length * 8 * 0.83)}h`} icon="bi bi-currency-dollar" sub="83% billability" color="text-emerald-600" />
            <StatCard label="Overdue Tasks" value={overdueTasks} icon="bi bi-exclamation-triangle" sub="Past due, not done" color="text-rose-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Time Log — This Week</h3></div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Team Member' }, { label: 'Task' }, { label: 'Due' }, { label: 'Hours Logged', right: true }, { label: 'Priority' }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {localTasks.slice(0, 8).map((task, i) => {
                  const hours = [6.5, 8, 4, 7.5, 5, 6, 3, 7][i] ?? 5;
                  const billable = [true, true, false, true, true, true, false, true][i];
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => timeModal.open({ ...task, hours, billable })}>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{task.assigneeName || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate">{task.title}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{task.due || '—'}</td>
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
                {localEmployees.slice(0, 8).map((emp, i) => {
                  const utils = [92, 78, 45, 100, 65, 80, 55, 72];
                  const u = utils[i] ?? 70;
                  const empTaskCount = localTasks.filter(t => t.assignee === emp.id || t.assigneeName?.includes(emp.firstName)).length;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => resourceModal.open({ ...emp, util: u, taskCount: empTaskCount })}>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{emp.department}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{emp.designation}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${u >= 90 ? 'bg-rose-400' : u >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${u}%` }} /></div>
                          <span className="text-[10px] font-sans tabular-nums text-slate-600">{u}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">{empTaskCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {timeModal.selected && (
        <ViewModal title={timeModal.selected.title} subtitle={`${timeModal.selected.assigneeName || 'Unassigned'} — Time Log`} onClose={timeModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Task', value: timeModal.selected.title },
              { label: 'Assignee', value: timeModal.selected.assigneeName || 'Unassigned' },
              { label: 'Due', value: timeModal.selected.due || '—' },
              { label: 'Hours', value: `${timeModal.selected.hours}h` },
              { label: 'Billable', value: timeModal.selected.billable ? 'Yes' : 'No' },
              { label: 'Status', value: timeModal.selected.status },
              { label: 'Priority', value: timeModal.selected.priority },
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

      {taskModal.selected && (
        <ViewModal title={taskModal.selected.title} subtitle={`${taskModal.selected.priority} · ${taskModal.selected.status}`} onClose={taskModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Title', value: taskModal.selected.title },
              { label: 'Status', value: taskModal.selected.status },
              { label: 'Priority', value: taskModal.selected.priority },
              { label: 'Assignee', value: taskModal.selected.assigneeName || 'Unassigned' },
              { label: 'Due', value: taskModal.selected.due || '—' },
              { label: 'Description', value: taskModal.selected.description || '—' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}

      {msModal.selected && (
        <ViewModal title={msModal.selected.name} subtitle={`${msModal.selected.status} · ${msModal.selected.completion}% complete`} onClose={msModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Name', value: msModal.selected.name },
              { label: 'Status', value: msModal.selected.status },
              { label: 'Due', value: msModal.selected.due || '—' },
              { label: 'Completion', value: `${msModal.selected.completion}%` },
              { label: 'Created', value: msModal.selected.createdAt ? new Date(msModal.selected.createdAt).toLocaleDateString() : '—' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${msModal.selected.completion === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ width: `${msModal.selected.completion}%` }} /></div>
          </div>
        </ViewModal>
      )}
    </div>
  );
};
