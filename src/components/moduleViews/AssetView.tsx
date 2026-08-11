import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { isAdminRole, hasCrudPermission } from '../../permissions';
import { parseActiveView } from '../../parseActiveView';

export const AssetView: React.FC<ModuleViewsProps> = (props) => {
  const {
    searchTerm = '', activeView, onNavigateView, selectedCompany, selectedUser,
    fixedAssets, depreciationEntries, onCreateFixedAsset, onDisposeAsset, onRunDepreciation,
    maintenanceTasks, onCreateMaintenanceTask, onUpdateMaintenanceTask, onDeleteMaintenanceTask,
  } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const userRole = selectedUser.activeRole || selectedUser.role;
  const canCreate = isAdmin || hasCrudPermission(userRole, props.customRoles || [], selectedCompany.id, ['Operations', activeView], 'Create');
  const canUpdate = isAdmin || hasCrudPermission(userRole, props.customRoles || [], selectedCompany.id, ['Operations', activeView], 'Update');
  const canDelete = isAdmin || hasCrudPermission(userRole, props.customRoles || [], selectedCompany.id, ['Operations', activeView], 'Delete');
  const localAssets = fixedAssets.filter(a => a.companyId === selectedCompany.id);
  const localMaintenance = maintenanceTasks.filter(m => m.companyId === selectedCompany.id);
  const localDepEntries = depreciationEntries.filter(d => d.companyId === selectedCompany.id);

  const initialAssetTab = (): 'register' | 'maintenance' | 'depreciation' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'maintenance') return 'maintenance';
    if (sub === 'depreciation') return 'depreciation';
    return 'register';
  };
  const [assetTab, setAssetTab] = useState<'register' | 'maintenance' | 'depreciation'>(initialAssetTab);
  useEffect(() => { setAssetTab(initialAssetTab()); }, [activeView]);

  const assetTabs = [
    { id: 'register', label: 'Asset Register' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'depreciation', label: 'Depreciation' },
  ] as const;

  // Register new asset form
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCat, setNewAssetCat] = useState('IT Hardware');
  const [newAssetLoc, setNewAssetLoc] = useState('');
  const [newAssetVal, setNewAssetVal] = useState('1000');
  const [newAssetLife, setNewAssetLife] = useState('5');
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newPurchaseDate, setNewPurchaseDate] = useState('');
  const [showAddAsset, setShowAddAsset] = useState(false);

  // Maintenance form
  const [maintAssetId, setMaintAssetId] = useState('');
  const [maintTask, setMaintTask] = useState('');
  const [maintDue, setMaintDue] = useState('');
  const [maintOwner, setMaintOwner] = useState('');
  const [showAddMaint, setShowAddMaint] = useState(false);

  const assetModal = useRowModal<typeof localAssets[0]>();
  const maintModal = useRowModal<typeof localMaintenance[0]>();

  // Depreciation summary: computed per asset from depreciationEntries or straight-line calc
  const depRows = localAssets.map(a => {
    const life = a.usefulLifeYears || 5;
    const salvage = (a.purchasePrice || 0) * 0.1;
    const annual = ((a.purchasePrice || 0) - salvage) / life;
    const accumulated = a.accumulatedDepreciation || 0;
    const netBook = Math.max(salvage, (a.purchasePrice || 0) - accumulated);
    return { ...a, annual, netBook };
  });

  const totalGross = localAssets.reduce((s, a) => s + (a.purchasePrice || 0), 0);
  const totalAccum = depRows.reduce((s, r) => s + ((r.purchasePrice || 0) - r.netBook), 0);
  const totalNetBook = depRows.reduce((s, r) => s + r.netBook, 0);

  return (
    <div>
      <PageHeader title="Asset Management" subtitle="Track company assets, manage maintenance schedules and monitor asset depreciation." />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {assetTabs.map(t => (
          <button key={t.id} onClick={() => { setAssetTab(t.id); onNavigateView(t.id === 'register' ? 'asset' : `asset-${t.id}`); }}
            className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${assetTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Asset Register Tab */}
      {assetTab === 'register' && (
        <>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Assets" value={localAssets.length} icon="bi bi-collection" sub="Registered in system" />
            <StatCard label="Asset Value" value={`$${totalGross.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Total acquisition cost" accent />
            <StatCard label="Active" value={localAssets.filter(a => a.status === 'Active').length} icon="bi bi-check-circle" sub="Running normally" />
            <StatCard label="Disposed" value={localAssets.filter(a => a.status === 'Disposed').length} icon="bi bi-trash" sub="Retired assets" />
          </div>
          <div className="grid gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">Asset Register</h3>
                {canCreate && (
                  <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddAsset(true)}>Register Asset</PrimaryBtn>
                )}
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Asset Code' }, { label: 'Asset Name' }, { label: 'Category' }, { label: 'Location' }, { label: 'Purchase Price', right: true }, { label: 'Status' }, ...(isAdmin ? [{ label: 'Actions', right: true }] : [])]} />
                <tbody className="divide-y divide-slate-100">
                  {localAssets.filter(a => !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.assetCode.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-[10px] font-sans tabular-nums fw-bold text-slate-500">{a.assetCode}</td>
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{a.name}</td>
                      <td className="px-4 py-3 fs-xs text-slate-500">{a.category}</td>
                      <td className="px-4 py-3 fs-xs text-slate-500">{a.location}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-900 text-right">${(a.purchasePrice || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={a.status} variant={a.status === 'Active' ? 'success' : a.status === 'Disposed' ? 'danger' : 'warning'} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); assetModal.open(a); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          <i className="bi bi-eye text-[11px]"></i> View
                        </button>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          {a.status === 'Active' && (
                            <button onClick={() => onDisposeAsset(a.id, (a.purchasePrice || 0) * 0.1)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Dispose</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {localAssets.length === 0 && <EmptyRow cols={isAdmin ? 8 : 7} message="No assets registered yet." />}
                </tbody>
              </table>
            </div>
            {isAdmin && showAddAsset && (
              <ViewModal title="Register New Asset" onClose={() => setShowAddAsset(false)}>
                <div className="p-6 space-y-4">
                  <div><Label>Asset Code *</Label><Input value={newAssetCode} onChange={e => setNewAssetCode(e.target.value)} placeholder="AST-001" /></div>
                  <div><Label>Asset Name *</Label><Input value={newAssetName} onChange={e => setNewAssetName(e.target.value)} placeholder="Dell Workstation" /></div>
                  <div><Label>Category</Label><Select value={newAssetCat} onChange={e => setNewAssetCat(e.target.value)}><option>IT Hardware</option><option>Heavy Machinery</option><option>Logistics</option><option>Furniture</option><option>Vehicles</option></Select></div>
                  <div><Label>Location</Label><Input value={newAssetLoc} onChange={e => setNewAssetLoc(e.target.value)} placeholder="NYC HQ" /></div>
                  <div><Label>Purchase Date</Label><Input type="date" value={newPurchaseDate} onChange={e => setNewPurchaseDate(e.target.value)} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Purchase Value ($)</Label><Input type="number" value={newAssetVal} onChange={e => setNewAssetVal(e.target.value)} /></div>
                    <div><Label>Useful Life (yrs)</Label><Input type="number" value={newAssetLife} onChange={e => setNewAssetLife(e.target.value)} /></div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                      if (!newAssetName.trim() || !newAssetCode.trim()) return;
                      onCreateFixedAsset({
                        companyId: selectedCompany.id, assetCode: newAssetCode, name: newAssetName,
                        description: '', category: newAssetCat, purchaseDate: newPurchaseDate,
                        purchasePrice: Number(newAssetVal), salvageValue: Number(newAssetVal) * 0.1,
                        usefulLifeYears: Number(newAssetLife), depreciationMethod: 'Straight-Line',
                        location: newAssetLoc,
                      });
                      setNewAssetName(''); setNewAssetCode(''); setNewAssetLoc(''); setNewAssetVal('1000'); setNewAssetLife('5'); setNewPurchaseDate('');
                      setShowAddAsset(false);
                    }}>Register Asset</PrimaryBtn>
                  </div>
                </div>
              </ViewModal>
            )}
          </div>
        </>
      )}

      {/* Maintenance Tab */}
      {assetTab === 'maintenance' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <StatCard label="Scheduled" value={localMaintenance.filter(m => m.status === 'Scheduled').length} icon="bi bi-calendar-check" sub="Upcoming tasks" />
            <StatCard label="Overdue" value={localMaintenance.filter(m => new Date(m.due) < new Date() && m.status !== 'Completed').length} icon="bi bi-exclamation-triangle" sub="Past due date" accent />
            <StatCard label="Completed" value={localMaintenance.filter(m => m.status === 'Completed').length} icon="bi bi-check-circle" sub="Tasks done" />
          </div>
          <div className="grid gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">Maintenance Schedule</h3>
                {canCreate && (
                  <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowAddMaint(true)}>Schedule Task</PrimaryBtn>
                )}
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Asset' }, { label: 'Task' }, { label: 'Due' }, { label: 'Owner' }, { label: 'Status' }, ...(isAdmin ? [{ label: 'Actions', right: true }] : [])]} />
                <tbody className="divide-y divide-slate-100">
                  {localMaintenance.filter(m => !searchTerm || m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || m.task.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{m.assetName}</td>
                      <td className="px-4 py-3 fs-xs text-slate-600">{m.task}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{m.due}</td>
                      <td className="px-4 py-3 fs-xs text-slate-500">{m.owner}</td>
                      <td className="px-4 py-3"><Badge label={m.status} variant={(m.status as string) === 'Completed' ? 'success' : new Date(m.due) < new Date() && (m.status as string) !== 'Completed' ? 'danger' : 'info'} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); maintModal.open(m); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          <i className="bi bi-eye text-[11px]"></i> View
                        </button>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            {m.status !== 'Completed' && <button onClick={() => onUpdateMaintenanceTask(m.id, { status: 'Completed' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Done</button>}
                            <button onClick={() => onDeleteMaintenanceTask(m.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Del</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {localMaintenance.length === 0 && <EmptyRow cols={isAdmin ? 7 : 6} message="No maintenance tasks scheduled." />}
                </tbody>
              </table>
            </div>
            {isAdmin && showAddMaint && (
              <ViewModal title="Schedule Maintenance" onClose={() => setShowAddMaint(false)}>
                <div className="p-6 space-y-4">
                  <div>
                    <Label>Asset</Label>
                    <Select value={maintAssetId} onChange={e => {
                      setMaintAssetId(e.target.value);
                    }}>
                      <option value="">Select asset…</option>
                      {localAssets.map(a => <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>)}
                    </Select>
                  </div>
                  <div><Label>Task Description *</Label><Input value={maintTask} onChange={e => setMaintTask(e.target.value)} placeholder="e.g. Annual inspection" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Due Date</Label><Input type="date" value={maintDue} onChange={e => setMaintDue(e.target.value)} /></div>
                    <div><Label>Owner / Team</Label><Input value={maintOwner} onChange={e => setMaintOwner(e.target.value)} placeholder="Engineering" /></div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <PrimaryBtn icon="bi bi-plus-lg" onClick={() => {
                      if (!maintTask.trim()) return;
                      const asset = localAssets.find(a => a.id === maintAssetId);
                      onCreateMaintenanceTask({
                        assetId: maintAssetId,
                        assetName: asset ? asset.name : 'General',
                        task: maintTask,
                        due: maintDue || new Date().toISOString().split('T')[0],
                        owner: maintOwner || 'Unassigned',
                      });
                      setMaintTask(''); setMaintOwner(''); setMaintAssetId(''); setMaintDue('');
                      setShowAddMaint(false);
                    }}>Add Task</PrimaryBtn>
                  </div>
                </div>
              </ViewModal>
            )}
          </div>
        </>
      )}

      {/* Depreciation Tab */}
      {assetTab === 'depreciation' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <StatCard label="Gross Value" value={`$${totalGross.toLocaleString()}`} icon="bi bi-currency-dollar" sub="Acquisition cost" />
            <StatCard label="Accumulated Depreciation" value={`$${totalAccum.toLocaleString()}`} icon="bi bi-graph-down" sub="Total depreciated" accent />
            <StatCard label="Net Book Value" value={`$${totalNetBook.toLocaleString()}`} icon="bi bi-collection" sub="Current carrying value" />
          </div>
          {isAdmin && (
            <div className="flex justify-end mb-4">
              <PrimaryBtn icon="bi bi-arrow-repeat" onClick={() => onRunDepreciation(new Date().toISOString().slice(0, 7))}>Run Depreciation ({new Date().toISOString().slice(0, 7)})</PrimaryBtn>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">Depreciation Schedule (Straight-Line, 10% Salvage)</h3>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Asset Code' }, { label: 'Asset Name' }, { label: 'Purchase Price', right: true }, { label: 'Life (yrs)' }, { label: 'Annual Dep.', right: true }, { label: 'Accumulated', right: true }, { label: 'Net Book Value', right: true }]} />
              <tbody className="divide-y divide-slate-100">
                {depRows.filter(r => !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.assetCode.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-sans tabular-nums fw-bold text-slate-500">{r.assetCode}</td>
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-900 text-right">${(r.purchasePrice || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{r.usefulLifeYears}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-600 text-right">${r.annual.toFixed(0)}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-600 text-right">${((r.purchasePrice || 0) - r.netBook).toFixed(0)}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-900 text-right">${r.netBook.toFixed(0)}</td>
                  </tr>
                ))}
                {depRows.length === 0 && <EmptyRow cols={7} message="No assets registered. Add assets in the Asset Register tab." />}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {assetModal.selected && (
        <RowModal row={assetModal.selected}
          icon="bi bi-building-gear" accentColor="#4f46e5"
          fields={[
            { label: 'Asset Code', key: 'assetCode', mono: true, icon: 'bi bi-hash' },
            { label: 'Name', key: 'name', icon: 'bi bi-tag' },
            { label: 'Category', key: 'category', icon: 'bi bi-collection', section: 'Details' },
            { label: 'Location', key: 'location', icon: 'bi bi-geo-alt', section: 'Details' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
            { label: 'Purchase Price', key: 'purchasePrice', format: (v: number) => `$${(v || 0).toLocaleString()}`, icon: 'bi bi-cash', section: 'Valuation' },
            { label: 'Purchase Date', key: 'purchaseDate', icon: 'bi bi-calendar-event', section: 'Valuation' },
            { label: 'Useful Life (yrs)', key: 'usefulLifeYears', icon: 'bi bi-hourglass-split', section: 'Valuation' },
            { label: 'Depreciation Method', key: 'depreciationMethod', icon: 'bi bi-graph-down-arrow', section: 'Valuation' },
          ]}
          title={r => r.name} subtitle={r => r.assetCode}
          onClose={assetModal.close} />
      )}
      {maintModal.selected && (
        <RowModal row={maintModal.selected}
          icon="bi bi-tools" accentColor="#0891b2"
          fields={[
            { label: 'Asset', key: 'assetName', icon: 'bi bi-building-gear' },
            { label: 'Task', key: 'task', icon: 'bi bi-card-text', section: 'Task' },
            { label: 'Owner', key: 'owner', icon: 'bi bi-person', section: 'Task' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Task' },
            { label: 'Due', key: 'due', mono: true, icon: 'bi bi-calendar-check', section: 'Schedule' },
          ]}
          title={r => `Maintenance Task`} subtitle={r => r.task}
          onClose={maintModal.close} />
      )}
    </div>
  );
};
