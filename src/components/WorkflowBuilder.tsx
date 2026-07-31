/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company, ERPWorkflow, WorkflowBlock, WorkflowTrigger, AuditLog, Invoice, Employee, Expense, InventoryItem, CRMLead, AttendanceRecord } from '../types';
import { PageHeader, StatCard, Badge, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './moduleViews/shared';
import { parseActiveView } from '../parseActiveView';

interface WorkflowBuilderProps {
  selectedCompany: Company;
  workflows: ERPWorkflow[];
  activeView: string;
  workflowTriggers: WorkflowTrigger[];
  onToggleWorkflowTrigger: (id: string, enabled: boolean) => void;
  auditLogs: AuditLog[];
  onSaveWorkflow: (workflow: Omit<ERPWorkflow, 'id' | 'createdAt' | 'isActive'>) => void;
  onToggleWorkflow: (id: string, active: boolean) => void;
  invoices?: Invoice[];
  employees?: Employee[];
  expenses?: Expense[];
  inventory?: InventoryItem[];
  leads?: CRMLead[];
  attendance?: AttendanceRecord[];
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  selectedCompany,
  workflows,
  activeView,
  workflowTriggers,
  onToggleWorkflowTrigger,
  auditLogs,
  onSaveWorkflow,
  onToggleWorkflow,
  invoices = [],
  employees = [],
  expenses = [],
  inventory = [],
  leads = [],
  attendance = []
}) => {
  const localWorkflows = workflows.filter(w => w.companyId === selectedCompany.id);
  const localTriggers = workflowTriggers.filter(t => t.companyId === selectedCompany.id);
  const localLogs = auditLogs.filter(l => l.companyId === selectedCompany.id && (l.action?.includes('WORKFLOW') || l.action?.includes('TRIGGER') || l.module === 'Workflow & Automation'));

  type WfTab = 'builder' | 'triggers' | 'logs' | 'ai-automations';
  const wfTabFromView = (): WfTab =>
    activeView === 'wf-triggers' ? 'triggers'
      : activeView === 'wf-logs' ? 'logs'
      : activeView === 'ai-automations' ? 'ai-automations'
        : 'builder';
  const [wfTab, setWfTab] = useState<WfTab>(wfTabFromView());
  useEffect(() => { setWfTab(wfTabFromView()); }, [activeView]);
  const wfTabs: { id: WfTab; label: string; icon: string }[] = [
    { id: 'builder', label: 'Flow Builder', icon: 'bi bi-diagram-3' },
    { id: 'ai-automations', label: 'AI Automations', icon: 'bi bi-robot text-violet-500' },
    { id: 'triggers', label: 'Triggers', icon: 'bi bi-lightning' },
    { id: 'logs', label: 'Run Logs', icon: 'bi bi-list-check' },
  ];

  // --- Flow Builder state ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<WorkflowBlock[]>([
    { id: 'b-init-1', type: 'Trigger', label: 'CRM Lead Created', value: 'CRM Lead Created', config: {} }
  ]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const triggersCatalog = [
    { label: 'CRM Lead Created', value: 'CRM Lead Created', desc: 'Fires immediately when a new lead is added to CRM.' },
    { label: 'Invoice Issued', value: 'Invoice Issued', desc: 'Fires when an invoice is created/journaled.' },
    { label: 'Invoice Settled/Paid', value: 'Invoice Settled/Paid', desc: 'Fires when an outstanding invoice balance changes to Paid.' },
    { label: 'Employee Registered', value: 'Employee Registered', desc: 'Fires when HR submits a workforce record.' },
    { label: 'Inventory Low Stock Event', value: 'Inventory Low Stock Event', desc: 'Fires when stock level drops below min safety thresholds.' }
  ];

  const conditionsCatalog = [
    { label: 'Check Estimated Value > $50k', value: 'If Value > $50,000', desc: 'Branches if lead/invoice total exceeds $50k.' },
    { label: 'Check Region is US HQ', value: 'If Branch location matches NY HQ', desc: 'Checks if branch corresponds to US HQ.' },
    { label: 'Check Department is Operations', value: 'If Dept matches Operations', desc: 'Verifies employee/role parameters.' }
  ];

  const actionsCatalog = [
    { label: 'Assign Sales Executive', value: 'Assign Sales Rep (Samantha Brady)', desc: 'Sets lead owner in CRM.' },
    { label: 'Dispatch Welcome Email', value: 'Send Onboarding Email', desc: 'Fires welcome template automatically.' },
    { label: 'Draft Procurement request', value: 'Create Purchase Request Draft', desc: 'Places automated purchase order draft.' },
    { label: 'Generate Accounts invoice', value: 'Generate Draft Invoice', desc: 'Creates ledger billing item.' },
    { label: 'Send WhatsApp Alert', value: 'Dispatch SMS/WhatsApp Alert', desc: 'Sends quick mobile push alert.' }
  ];

  const addBlock = (type: 'Trigger' | 'Condition' | 'Action' | 'Delay', label: string, value: string) => {
    setBlocks([...blocks, { id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, type, label, value, config: {} }]);
  };

  const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  const moveBlock = (index: number, dir: -1 | 1) => {
    const newBlocks = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const submitWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveWorkflow({ companyId: selectedCompany.id, name, description, blocks });
    setName(''); setDescription('');
    setBlocks([{ id: 'b-init-1', type: 'Trigger', label: 'CRM Lead Created', value: 'CRM Lead Created', config: {} }]);
    setSaveStatus('Workflow saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div>
      <PageHeader title="Workflow & Automation" subtitle="Build automated workflows, manage triggers, and audit execution logs." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Active Workflows" value={localWorkflows.filter(w => w.isActive).length} sub={`${localWorkflows.length} total`} icon="bi bi-diagram-3" accent />
        <StatCard label="Triggers Enabled" value={localTriggers.filter(t => t.enabled).length} sub={`${localTriggers.length} configured`} icon="bi bi-lightning" color="text-amber-600" />
        <StatCard label="Run Logs" value={localLogs.length} sub="Recent executions" icon="bi bi-list-check" color="text-sky-600" />
        <StatCard label="Avg Blocks" value={localWorkflows.length ? Math.round(localWorkflows.reduce((s, w) => s + w.blocks.length, 0) / localWorkflows.length) : 0} sub="Per workflow" icon="bi bi-grid" color="text-violet-600" />
      </div>
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {wfTabs.map(t => (
          <button key={t.id} onClick={() => setWfTab(t.id)} className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 inline-flex items-center gap-1.5 ${wfTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            <i className={`${t.icon} fs-sm`}></i>{t.label}
          </button>
        ))}
      </div>

      {/* TAB: Flow Builder */}
      {wfTab === 'builder' && (
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
            <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <i className="bi bi-cpu-fill text-slate-950 fs-sm"></i>Automation Canvas
            </h2>
            <form onSubmit={submitWorkflow} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-[10px] fw-bold text-slate-400 uppercase tracking-wider">Workflow Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lead-to-Invoicing Auto Pipeline" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 fs-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans" required />
                </div>
                <div><label className="block text-[10px] fw-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Drafts billing items and assigns sales ownership" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 fs-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans" />
                </div>
              </div>
              <div className="mt-4 p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 space-y-4 relative min-h-[300px]">
                <div className="absolute top-3 right-4 text-[9px] font-mono text-slate-400 fw-bold uppercase tracking-widest bg-slate-100/80 border border-slate-200/50 px-2 py-0.5 rounded-sm">Compiler Active</div>
                {blocks.map((block, index) => (
                  <div key={block.id} className="flex flex-col items-center">
                    {index > 0 && (
                      <div className="flex flex-col items-center my-1">
                        <div className="h-5 w-0.5 bg-slate-300" />
                        <i className="bi bi-chevron-down text-slate-400 text-[10px] -mt-1.5"></i>
                      </div>
                    )}
                    <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-400 hover:shadow-xs transition-all duration-150">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-[9px] fw-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          block.type === 'Trigger' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                          block.type === 'Condition' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                          'bg-blue-50 text-blue-700 border-blue-200/50'
                        }`}>{block.type}</span>
                        <div>
                          <div className="fs-xs fw-semibold text-slate-900 font-sans">{block.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{block.value}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-25 cursor-pointer text-[9px] transition-all" title="Move Up">▲</button>
                        <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-25 cursor-pointer text-[9px] transition-all" title="Move Down">▼</button>
                        {blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer" title="Delete Node"><i className="bi bi-trash fs-xs"></i></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {blocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <i className="bi bi-exclamation-circle fs-2xl text-slate-300 mb-2"></i>
                    <span className="fs-xs">No blocks added. Design a trigger-action sequence to compile.</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2">
                <button type="submit" disabled={blocks.length === 0} className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white fw-semibold fs-xs px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <i className="bi bi-check-lg fs-xs"></i>Compile & Save Workflow
                </button>
                {saveStatus && <span className="fs-xs text-emerald-600 fw-semibold">{saveStatus}</span>}
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><i className="bi bi-folder text-slate-600"></i>Node Catalog</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block mb-1.5">System Triggers</span>
                  <div className="space-y-1.5">
                    {triggersCatalog.map(t => (
                      <button key={t.label} type="button" onClick={() => addBlock('Trigger', t.label, t.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="fs-xs fw-semibold text-slate-900 block">{t.label}</span>
                        <span className="text-[10px] text-slate-500 font-sans leading-relaxed mt-0.5 block">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block mb-1.5">Conditional Nodes</span>
                  <div className="space-y-1.5">
                    {conditionsCatalog.map(c => (
                      <button key={c.label} type="button" onClick={() => addBlock('Condition', c.label, c.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="fs-xs fw-semibold text-slate-900 block">{c.label}</span>
                        <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5 block">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block mb-1.5">Executive Actions</span>
                  <div className="space-y-1.5">
                    {actionsCatalog.map(a => (
                      <button key={a.label} type="button" onClick={() => addBlock('Action', a.label, a.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="fs-xs fw-semibold text-slate-900 block">{a.label}</span>
                        <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5 block">{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><i className="bi bi-check-all text-slate-600"></i>Active Workflows</h3>
              <div className="mt-4 space-y-2.5">
                {localWorkflows.map(wf => (
                  <div key={wf.id} className="border border-slate-100 p-3 rounded-lg bg-slate-50/50 flex items-center justify-between hover:border-slate-200 transition-all">
                    <div>
                      <span className="fs-xs fw-semibold text-slate-900 block">{wf.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{wf.blocks.length} sequential logic blocks</span>
                    </div>
                    <button onClick={() => onToggleWorkflow(wf.id, !wf.isActive)} className={`text-[10px] fw-semibold px-2.5 py-1 rounded-md cursor-pointer border transition-all ${wf.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200/50'}`}>
                      {wf.isActive ? 'Active' : 'Muted'}
                    </button>
                  </div>
                ))}
                {localWorkflows.length === 0 && <p className="fs-xs text-slate-400 text-center py-4">No workflows yet. Build one in the canvas.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Triggers */}
      {wfTab === 'triggers' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Trigger' }, { label: 'Event' }, { label: 'Description' }, { label: 'Status', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localTriggers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{t.name}</td>
                    <td className="px-4 py-3"><Badge label={t.event} variant="info" /></td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onToggleWorkflowTrigger(t.id, !t.enabled)} className={`text-[10px] fw-semibold px-2.5 py-1 rounded-md cursor-pointer border transition-all ${t.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200/50'}`}>
                        {t.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
                {localTriggers.length === 0 && <EmptyRow cols={4} message="No triggers configured." />}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AI Automations */}
      {wfTab === 'ai-automations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Health Score */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-center items-center text-center">
               <div className="h-20 w-20 rounded-full border-4 border-violet-500 flex items-center justify-center mb-4">
                 <span className="fs-3xl fw-bold text-slate-900">72</span>
               </div>
               <h3 className="fs-sm fw-bold text-slate-900">Automation Health</h3>
               <p className="text-[11px] text-slate-500 mt-1">Moderate automation. Opportunity to save ~12 hours/week.</p>
            </div>
            {/* Anomaly Alerts */}
            <div className="md:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="fs-sm fw-bold text-slate-900 flex items-center gap-2 mb-4">
                <i className="bi bi-exclamation-triangle-fill text-amber-500"></i> AI Anomaly Alerts
              </h3>
              <div className="space-y-3">
                {invoices.filter(i => i.status === 'Overdue').length > 5 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <i className="bi bi-receipt text-amber-600 fs-sm"></i>
                    <div className="flex-1">
                      <div className="text-[11px] fw-bold text-slate-900">High volume of overdue invoices</div>
                      <div className="text-[10px] text-slate-600">Currently {invoices.filter(i => i.status === 'Overdue').length} invoices are overdue. Consider automating payment reminders.</div>
                    </div>
                  </div>
                )}
                {inventory.filter(i => i.stockLevel < i.reorderLevel).length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                    <i className="bi bi-box-seam text-red-600 fs-sm"></i>
                    <div className="flex-1">
                      <div className="text-[11px] fw-bold text-slate-900">Critical Stock Depletion</div>
                      <div className="text-[10px] text-slate-600">{inventory.filter(i => i.stockLevel < i.reorderLevel).length} items are below reorder level.</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <i className="bi bi-graph-up-arrow text-slate-500 fs-sm"></i>
                  <div className="flex-1">
                    <div className="text-[11px] fw-bold text-slate-900">Unusual Expense Spike</div>
                    <div className="text-[10px] text-slate-600">Travel expenses have increased by 45% this month compared to last month.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Smart Suggestions */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6">
            <h3 className="fs-sm fw-bold text-slate-900 flex items-center gap-2 mb-4">
              <i className="bi bi-stars text-violet-500"></i> Smart Workflow Suggestions
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { 
                  title: 'Auto-Remind Overdue Invoices', 
                  desc: 'Automatically send email reminders to clients when an invoice is 3 days overdue.', 
                  trigger: 'Invoice Overdue', 
                  action: 'Send Email',
                  blocks: [
                    { id: 'b1', type: 'Trigger', label: 'Invoice Overdue', value: 'Invoice Overdue', config: { delayDays: 3 } },
                    { id: 'b2', type: 'Action', label: 'Send Email', value: 'Send Email', config: { template: 'Overdue Reminder' } }
                  ]
                },
                { 
                  title: 'Low Stock Auto-Reorder', 
                  desc: 'Draft a purchase order when an inventory item drops below its reorder level.', 
                  trigger: 'Inventory Low', 
                  action: 'Create Draft Bill',
                  blocks: [
                    { id: 'b1', type: 'Trigger', label: 'Inventory Low', value: 'Inventory Low', config: {} },
                    { id: 'b2', type: 'Action', label: 'Create Draft Bill', value: 'Create Draft Bill', config: {} }
                  ]
                },
                { 
                  title: 'New Hire Onboarding', 
                  desc: 'Assign IT setup tasks and send welcome email when a new employee is registered.', 
                  trigger: 'Employee Created', 
                  action: 'Create Support Ticket',
                  blocks: [
                    { id: 'b1', type: 'Trigger', label: 'Employee Created', value: 'Employee Created', config: {} },
                    { id: 'b2', type: 'Action', label: 'Create Support Ticket', value: 'Create Support Ticket', config: { title: 'IT Setup for New Hire' } },
                    { id: 'b3', type: 'Action', label: 'Send Email', value: 'Send Email', config: { template: 'Welcome to the team!' } }
                  ]
                }
              ].map((sug, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-violet-300 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="fs-xs fw-bold text-slate-900">{sug.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">{sug.desc}</p>
                    <div className="flex items-center gap-1.5 text-[9px] fw-medium text-slate-400">
                       <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{sug.trigger}</span>
                       <i className="bi bi-arrow-right"></i>
                       <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{sug.action}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onSaveWorkflow({ companyId: selectedCompany.id, name: sug.title, description: sug.desc, blocks: sug.blocks as any });
                      setWfTab('builder');
                    }}
                    className="mt-4 w-full bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 fs-xs fw-semibold px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="bi bi-magic"></i> Deploy Workflow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Run Logs */}
      {wfTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Timestamp' }, { label: 'Action' }, { label: 'Module' }, { label: 'Details' }]} />
              <tbody className="divide-y divide-slate-100">
                {localLogs.slice(0, 30).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={log.action} variant={log.action.includes('CREATE') ? 'success' : log.action.includes('DELETE') ? 'danger' : 'info'} /></td>
                    <td className="px-4 py-3 fs-xs text-slate-600">{log.module}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-sm truncate">{log.details}</td>
                  </tr>
                ))}
                {localLogs.length === 0 && <EmptyRow cols={4} message="No workflow execution logs yet." />}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkflowBuilder;
