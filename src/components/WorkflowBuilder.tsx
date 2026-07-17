/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company, ERPWorkflow, WorkflowBlock, WorkflowTrigger, AuditLog } from '../types';
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
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  selectedCompany,
  workflows,
  activeView,
  workflowTriggers,
  onToggleWorkflowTrigger,
  auditLogs,
  onSaveWorkflow,
  onToggleWorkflow
}) => {
  const localWorkflows = workflows.filter(w => w.companyId === selectedCompany.id);
  const localTriggers = workflowTriggers.filter(t => t.companyId === selectedCompany.id);
  const localLogs = auditLogs.filter(l => l.companyId === selectedCompany.id && (l.action?.includes('WORKFLOW') || l.action?.includes('TRIGGER') || l.module === 'Workflow & Automation'));

  type WfTab = 'builder' | 'triggers' | 'logs';
  const wfTabFromView = (): WfTab =>
    activeView === 'wf-triggers' ? 'triggers'
      : activeView === 'wf-logs' ? 'logs'
        : 'builder';
  const [wfTab, setWfTab] = useState<WfTab>(wfTabFromView());
  useEffect(() => { setWfTab(wfTabFromView()); }, [activeView]);
  const wfTabs: { id: WfTab; label: string; icon: string }[] = [
    { id: 'builder', label: 'Flow Builder', icon: 'bi bi-diagram-3' },
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
          <button key={t.id} onClick={() => setWfTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 inline-flex items-center gap-1.5 ${wfTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            <i className={`${t.icon} text-sm`}></i>{t.label}
          </button>
        ))}
      </div>

      {/* TAB: Flow Builder */}
      {wfTab === 'builder' && (
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <i className="bi bi-cpu-fill text-slate-950 text-sm"></i>Automation Canvas
            </h2>
            <form onSubmit={submitWorkflow} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workflow Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lead-to-Invoicing Auto Pipeline" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans" required />
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Drafts billing items and assigns sales ownership" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans" />
                </div>
              </div>
              <div className="mt-4 p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 space-y-4 relative min-h-[300px]">
                <div className="absolute top-3 right-4 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-100/80 border border-slate-200/50 px-2 py-0.5 rounded-sm">Compiler Active</div>
                {blocks.map((block, index) => (
                  <div key={block.id} className="flex flex-col items-center">
                    {index > 0 && (
                      <div className="flex flex-col items-center my-1">
                        <div className="h-5 w-0.5 bg-slate-300" />
                        <i className="bi bi-chevron-down text-slate-400 text-[10px] -mt-1.5"></i>
                      </div>
                    )}
                    <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-400 hover:shadow-xs transition-all duration-150">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          block.type === 'Trigger' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                          block.type === 'Condition' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                          'bg-blue-50 text-blue-700 border-blue-200/50'
                        }`}>{block.type}</span>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 font-sans">{block.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{block.value}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-25 cursor-pointer text-[9px] transition-all" title="Move Up">▲</button>
                        <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-25 cursor-pointer text-[9px] transition-all" title="Move Down">▼</button>
                        {blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer" title="Delete Node"><i className="bi bi-trash text-xs"></i></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {blocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <i className="bi bi-exclamation-circle text-2xl text-slate-300 mb-2"></i>
                    <span className="text-xs">No blocks added. Design a trigger-action sequence to compile.</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2">
                <button type="submit" disabled={blocks.length === 0} className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <i className="bi bi-check-lg text-xs"></i>Compile & Save Workflow
                </button>
                {saveStatus && <span className="text-xs text-emerald-600 font-semibold">{saveStatus}</span>}
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><i className="bi bi-folder text-slate-600"></i>Node Catalog</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">System Triggers</span>
                  <div className="space-y-1.5">
                    {triggersCatalog.map(t => (
                      <button key={t.label} type="button" onClick={() => addBlock('Trigger', t.label, t.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="text-xs font-semibold text-slate-900 block">{t.label}</span>
                        <span className="text-[10px] text-slate-500 font-sans leading-relaxed mt-0.5 block">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Conditional Nodes</span>
                  <div className="space-y-1.5">
                    {conditionsCatalog.map(c => (
                      <button key={c.label} type="button" onClick={() => addBlock('Condition', c.label, c.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="text-xs font-semibold text-slate-900 block">{c.label}</span>
                        <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5 block">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Executive Actions</span>
                  <div className="space-y-1.5">
                    {actionsCatalog.map(a => (
                      <button key={a.label} type="button" onClick={() => addBlock('Action', a.label, a.value)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer hover:shadow-2xs">
                        <span className="text-xs font-semibold text-slate-900 block">{a.label}</span>
                        <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5 block">{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><i className="bi bi-check-all text-slate-600"></i>Active Workflows</h3>
              <div className="mt-4 space-y-2.5">
                {localWorkflows.map(wf => (
                  <div key={wf.id} className="border border-slate-100 p-3 rounded-lg bg-slate-50/50 flex items-center justify-between hover:border-slate-200 transition-all">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">{wf.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{wf.blocks.length} sequential logic blocks</span>
                    </div>
                    <button onClick={() => onToggleWorkflow(wf.id, !wf.isActive)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-md cursor-pointer border transition-all ${wf.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200/50'}`}>
                      {wf.isActive ? 'Active' : 'Muted'}
                    </button>
                  </div>
                ))}
                {localWorkflows.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No workflows yet. Build one in the canvas.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Triggers */}
      {wfTab === 'triggers' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Trigger' }, { label: 'Event' }, { label: 'Description' }, { label: 'Status', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {localTriggers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.name}</td>
                    <td className="px-4 py-3"><Badge label={t.event} variant="info" /></td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onToggleWorkflowTrigger(t.id, !t.enabled)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-md cursor-pointer border transition-all ${t.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200/50'}`}>
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

      {/* TAB: Run Logs */}
      {wfTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Timestamp' }, { label: 'Action' }, { label: 'Module' }, { label: 'Details' }]} />
              <tbody className="divide-y divide-slate-100">
                {localLogs.slice(0, 30).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={log.action} variant={log.action.includes('CREATE') ? 'success' : log.action.includes('DELETE') ? 'danger' : 'info'} /></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.module}</td>
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
