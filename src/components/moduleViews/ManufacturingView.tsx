import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, ViewModal } from './shared';
import { isAdminRole } from '../../permissions';

export const ManufacturingView: React.FC<ModuleViewsProps> = (props) => {
  const {
    activeView, onNavigateView, selectedCompany, selectedUser,
    workOrders, bomItems, qualityChecks, inventory,
    onCreateWorkOrder, onUpdateWorkOrder, onDeleteWorkOrder,
    onCreateBOMItem, onDeleteBOMItem,
    onCreateQualityCheck, onUpdateQualityCheck, onDeleteQualityCheck,
  } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const localWOs = workOrders.filter(w => w.companyId === selectedCompany.id);
  const localBOM = bomItems.filter(b => b.companyId === selectedCompany.id);
  const localQC = qualityChecks.filter(q => q.companyId === selectedCompany.id);
  const localInventory = inventory.filter(i => i.companyId === selectedCompany.id);

  type MfgTab = 'orders' | 'bom' | 'quality';
  const mfgTabFromView = (): MfgTab =>
    activeView === 'mfg-orders' ? 'orders'
      : activeView === 'mfg-quality' ? 'quality'
        : activeView === 'manufacturing' ? 'bom'
          : 'orders';
  const [mfgTab, setMfgTab] = useState<MfgTab>(mfgTabFromView());
  useEffect(() => { setMfgTab(mfgTabFromView()); }, [activeView]);

  const mfgTabs: { id: MfgTab; label: string }[] = [
    { id: 'orders', label: 'Work Orders' },
    { id: 'bom', label: 'Bill of Materials' },
    { id: 'quality', label: 'Quality Control' },
  ];

  // Work Order form
  const [selectedWoInvId, setSelectedWoInvId] = useState('');
  const [woProduct, setWoProduct] = useState('');
  const [woQty, setWoQty] = useState('100');
  const [woLine, setWoLine] = useState('Assembly Line A');
  const [woDue, setWoDue] = useState('');
  const [showWOModal, setShowWOModal] = useState(false);

  // BOM form
  const [selectedBomProductInvId, setSelectedBomProductInvId] = useState('');
  const [selectedBomPartInvId, setSelectedBomPartInvId] = useState('');
  const [bomProduct, setBomProduct] = useState('');
  const [bomPart, setBomPart] = useState('');
  const [bomQty, setBomQty] = useState('1');
  const [bomUnit, setBomUnit] = useState('pcs');
  const [bomCost, setBomCost] = useState('10');
  const [showBOMModal, setShowBOMModal] = useState(false);

  // QC form
  const [qcCheck, setQcCheck] = useState('');
  const [qcResult, setQcResult] = useState('Passed');
  const [qcInspector, setQcInspector] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [showQCModal, setShowQCModal] = useState(false);

  // Active BOM product filter
  const [activeBomProduct, setActiveBomProduct] = useState('');
  const bomProducts = [...new Set(localBOM.map(b => b.product))];
  const filteredBOM = activeBomProduct ? localBOM.filter(b => b.product === activeBomProduct) : localBOM;
  const bomTotal = filteredBOM.reduce((s, b) => s + b.qty * b.cost, 0);

  const handleSelectWoInv = (itemId: string) => {
    setSelectedWoInvId(itemId);
    const item = localInventory.find(i => i.id === itemId);
    if (item) {
      setWoProduct(item.name);
    } else {
      setWoProduct('');
    }
  };

  const handleSelectBomProductInv = (itemId: string) => {
    setSelectedBomProductInvId(itemId);
    const item = localInventory.find(i => i.id === itemId);
    if (item) {
      setBomProduct(item.name);
    } else {
      setBomProduct('');
    }
  };

  const handleSelectBomPartInv = (itemId: string) => {
    setSelectedBomPartInvId(itemId);
    const item = localInventory.find(i => i.id === itemId);
    if (item) {
      setBomPart(item.name);
      setBomCost(String(item.unitPrice || 0));
    } else {
      setBomPart('');
      setBomCost('10');
    }
  };

  const woModal = useRowModal<typeof localWOs[0]>();
  const bomModal = useRowModal<typeof localBOM[0]>();
  const qcModal = useRowModal<typeof localQC[0]>();

  return (
    <div>
      <PageHeader title="Manufacturing & Production" subtitle="Work orders, Bill of Materials, production tracking and quality control." />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {mfgTabs.map(t => (
          <button key={t.id} onClick={() => { setMfgTab(t.id); onNavigateView(t.id === 'bom' ? 'manufacturing' : `mfg-${t.id}`); }}
            className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${mfgTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Work Orders" value={localWOs.length} icon="bi bi-clipboard2-data" sub="Active production runs" />
        <StatCard label="In Progress" value={localWOs.filter(w => w.status === 'In Progress').length} icon="bi bi-play-circle" sub="Currently manufacturing" accent />
        <StatCard label="Completed" value={localWOs.filter(w => w.status === 'Completed').length} icon="bi bi-check-circle" sub="Finished this period" />
      </div>

      {/* Work Orders Tab */}
      {mfgTab === 'orders' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setWoProduct(''); setWoQty('100'); setWoDue(''); setShowWOModal(true); }}>New Work Order</PrimaryBtn>
            </div>
          )}
          <div className="space-y-3">
            {localWOs.map(wo => (
              <div key={wo.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer" onClick={() => woModal.open(wo)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="fs-xs font-sans tabular-nums fw-bold text-slate-500">{wo.woNumber}</span>
                      <Badge label={wo.status} variant={wo.status === 'Completed' ? 'success' : wo.status === 'In Progress' ? 'info' : wo.status === 'On Hold' ? 'danger' : 'warning'} />
                    </div>
                    <div className="fs-sm fw-bold text-slate-900 mt-1">{wo.product}</div>
                    <div className="fs-xs text-slate-500 mt-0.5">
                      Qty: <span className="font-sans tabular-nums fw-semibold text-slate-700">{(wo.qty || 0).toLocaleString()}</span> · Line: <span className="fw-semibold text-slate-700">{wo.line}</span>
                      {wo.dueDate && <> · Due: <span className="font-sans tabular-nums text-slate-600">{wo.dueDate}</span></>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="fs-2xl fw-bold font-sans tabular-nums text-slate-900">{wo.completion}%</div>
                    <div className="text-[10px] text-slate-400">completion</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${wo.completion === 100 ? 'bg-emerald-500' : wo.status === 'On Hold' ? 'bg-rose-400' : 'bg-slate-800'}`} style={{ width: `${wo.completion}%` }} />
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                    {wo.status === 'Scheduled' && <button onClick={() => onUpdateWorkOrder(wo.id, { status: 'In Progress' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">Start</button>}
                    {wo.status === 'In Progress' && (
                      <>
                        <button onClick={() => onUpdateWorkOrder(wo.id, { completion: Math.min(100, (wo.completion || 0) + 10), status: (wo.completion || 0) + 10 >= 100 ? 'Completed' : 'In Progress' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">+10%</button>
                        <button onClick={() => onUpdateWorkOrder(wo.id, { completion: 100, status: 'Completed' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Complete</button>
                        <button onClick={() => onUpdateWorkOrder(wo.id, { status: 'On Hold' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer">Hold</button>
                      </>
                    )}
                    {wo.status === 'On Hold' && <button onClick={() => onUpdateWorkOrder(wo.id, { status: 'In Progress' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">Resume</button>}
                    <button onClick={() => onDeleteWorkOrder(wo.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer ml-auto">Del</button>
                  </div>
                )}
              </div>
            ))}
            {localWOs.length === 0 && <div className="text-center fs-xs text-slate-400 py-10 bg-white border border-slate-200 rounded-xl">No work orders yet. Click "New Work Order" to get started.</div>}
          </div>
        </div>
      )}

      {/* BOM Tab */}
      {mfgTab === 'bom' && (
        <div>
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <Label>Product Filter:</Label>
            <Select className="w-64" value={activeBomProduct} onChange={e => setActiveBomProduct(e.target.value)}>
              <option value="">All Products</option>
              {bomProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            {isAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setBomPart(''); setBomQty('1'); setBomCost('10'); setShowBOMModal(true); }}>Add BOM Item</PrimaryBtn>}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title text-slate-900">Bill of Materials{activeBomProduct ? ` — ${activeBomProduct}` : ''}</h3>
              <span className="table-cell-mono fw-bold text-slate-900">Total Cost: ${bomTotal.toFixed(2)}</span>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: '#' }, { label: 'Component' }, { label: 'Product' }, { label: 'Qty' }, { label: 'Unit' }, { label: 'Unit Cost', right: true }, { label: 'Line Total', right: true }, ...(isAdmin ? [{ label: '', right: true }] : [])]} />
              <tbody className="divide-y divide-slate-100">
                {filteredBOM.map((b, i) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 cursor-pointer" onClick={() => bomModal.open(b)}>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{b.part}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{b.product}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-700">{b.qty}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{b.unit}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-700 text-right">${(b.cost || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-semibold text-slate-900 text-right">${((b.qty || 0) * (b.cost || 0)).toFixed(2)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={() => onDeleteBOMItem(b.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Del</button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredBOM.length > 0 && (
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={isAdmin ? 7 : 6} className="px-4 py-3 table-cell fw-bold text-slate-700 text-right">Total Material Cost</td>
                    <td className="px-4 py-3 table-cell-mono fw-bold text-slate-900 text-right">${bomTotal.toFixed(2)}</td>
                  </tr>
                )}
                {filteredBOM.length === 0 && <EmptyRow cols={isAdmin ? 8 : 7} message="No BOM items found." />}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality Control Tab */}
      {mfgTab === 'quality' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setQcCheck(''); setQcResult('Passed'); setQcInspector(''); setQcNotes(''); setShowQCModal(true); }}>Log Quality Check</PrimaryBtn>
            </div>
          )}
          <div className="space-y-3">
            {localQC.map(q => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer" onClick={() => qcModal.open(q)}>
                <div>
                  <div className="table-cell-semibold text-slate-900">{q.check}</div>
                  <div className="data-value text-slate-500 mt-0.5">{q.inspector} · {q.date}</div>
                  {q.notes && <div className="text-[10px] text-slate-400 mt-0.5 italic">{q.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={q.result} variant={q.result === 'Passed' ? 'success' : q.result === 'Failed' ? 'danger' : 'warning'} />
                  {isAdmin && (
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {q.result === 'Pending' && <button onClick={() => onUpdateQualityCheck(q.id, { result: 'Passed' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Pass</button>}
                      {q.result === 'Pending' && <button onClick={() => onUpdateQualityCheck(q.id, { result: 'Failed' })} className="text-[9px] fw-bold px-2 py-1 rounded bg-rose-500 text-white hover:bg-rose-600 cursor-pointer">Fail</button>}
                      <button onClick={() => onDeleteQualityCheck(q.id)} className="text-[9px] fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer">Del</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {localQC.length === 0 && <div className="text-center fs-xs text-slate-400 py-10 bg-white border border-slate-200 rounded-xl">No quality checks logged yet.</div>}
          </div>
        </div>
      )}

      {/* Modals */}
      {showWOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => { setShowWOModal(false); setSelectedWoInvId(''); }}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <i className="bi bi-gear text-white fs-xs"></i>
                  </div>
                  <h3 className="fs-sm fw-bold text-slate-900">New Work Order</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Initiate a new production run or assembly job.</p>
              </div>
              <button type="button" onClick={() => { setShowWOModal(false); setSelectedWoInvId(''); }} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                <i className="bi bi-x fs-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Select Product from Inventory</Label>
                <Select value={selectedWoInvId} onChange={e => handleSelectWoInv(e.target.value)}>
                  <option value="">-- Custom / Non-Inventory Product --</option>
                  {localInventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                  ))}
                </Select>
              </div>
              <div><Label>Product *</Label><Input value={woProduct} onChange={e => setWoProduct(e.target.value)} placeholder="Pneumatic Actuator" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Quantity</Label><Input type="number" value={woQty} onChange={e => setWoQty(e.target.value)} /></div>
                <div><Label>Production Line</Label><Input value={woLine} onChange={e => setWoLine(e.target.value)} placeholder="Assembly Line A" /></div>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={woDue} onChange={e => setWoDue(e.target.value)} /></div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => { setShowWOModal(false); setSelectedWoInvId(''); }} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
              <button type="button" onClick={() => {
                if (!woProduct.trim()) return;
                onCreateWorkOrder({ product: woProduct, qty: Number(woQty), line: woLine, dueDate: woDue });
                setShowWOModal(false); setSelectedWoInvId('');
              }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Work Order</button>
            </div>
          </div>
        </div>
      )}
      {showBOMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => { setShowBOMModal(false); setSelectedBomProductInvId(''); setSelectedBomPartInvId(''); }}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <i className="bi bi-boxes text-blue-600 fs-xs"></i>
                  </div>
                  <h3 className="fs-sm fw-bold text-slate-900">Add BOM Item</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Add a component or raw material to this product bill of materials.</p>
              </div>
              <button type="button" onClick={() => { setShowBOMModal(false); setSelectedBomProductInvId(''); setSelectedBomPartInvId(''); }} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                <i className="bi bi-x fs-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Select Product (Assembly)</Label>
                <Select value={selectedBomProductInvId} onChange={e => handleSelectBomProductInv(e.target.value)}>
                  <option value="">-- Custom Product --</option>
                  {localInventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                  ))}
                </Select>
              </div>
              <div><Label>Product *</Label><Input value={bomProduct} onChange={e => setBomProduct(e.target.value)} placeholder="Pneumatic Actuator" /></div>
              <div className="border-t border-slate-100 pt-3 my-2" />
              <div>
                <Label>Select Component (Part)</Label>
                <Select value={selectedBomPartInvId} onChange={e => handleSelectBomPartInv(e.target.value)}>
                  <option value="">-- Custom Part --</option>
                  {localInventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                  ))}
                </Select>
              </div>
              <div><Label>Component / Part *</Label><Input value={bomPart} onChange={e => setBomPart(e.target.value)} placeholder="Aluminum Housing" /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Qty</Label><Input type="number" value={bomQty} onChange={e => setBomQty(e.target.value)} /></div>
                <div><Label>Unit</Label><Select value={bomUnit} onChange={e => setBomUnit(e.target.value)}><option>pcs</option><option>kg</option><option>m</option><option>L</option><option>set</option></Select></div>
                <div><Label>Unit Cost ($)</Label><Input type="number" value={bomCost} onChange={e => setBomCost(e.target.value)} /></div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => { setShowBOMModal(false); setSelectedBomProductInvId(''); setSelectedBomPartInvId(''); }} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
              <button type="button" onClick={() => {
                if (!bomProduct.trim() || !bomPart.trim()) return;
                onCreateBOMItem({ product: bomProduct, part: bomPart, qty: Number(bomQty), unit: bomUnit, cost: Number(bomCost) });
                setShowBOMModal(false); setSelectedBomProductInvId(''); setSelectedBomPartInvId('');
              }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Add Item</button>
            </div>
          </div>
        </div>
      )}
      {showQCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowQCModal(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <i className="bi bi-clipboard-check text-emerald-600 fs-xs"></i>
                  </div>
                  <h3 className="fs-sm fw-bold text-slate-900">Log Quality Check</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Perform a quality inspection on manufactured goods.</p>
              </div>
              <button type="button" onClick={() => setShowQCModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                <i className="bi bi-x fs-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div><Label>Check Description *</Label><Input value={qcCheck} onChange={e => setQcCheck(e.target.value)} placeholder="Dimensional Tolerance Verification" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Result</Label><Select value={qcResult} onChange={e => setQcResult(e.target.value)}><option>Passed</option><option>Failed</option><option>Pending</option></Select></div>
                <div><Label>Inspector</Label><Input value={qcInspector} onChange={e => setQcInspector(e.target.value)} placeholder="QC Team A" /></div>
              </div>
              <div><Label>Notes</Label><Input value={qcNotes} onChange={e => setQcNotes(e.target.value)} placeholder="Optional notes…" /></div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setShowQCModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
              <button type="button" onClick={() => {
                if (!qcCheck.trim()) return;
                onCreateQualityCheck({ check: qcCheck, result: qcResult, inspector: qcInspector, notes: qcNotes });
                setShowQCModal(false);
              }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Log Check</button>
            </div>
          </div>
        </div>
      )}
      {woModal.selected && (
        <ViewModal title={woModal.selected.woNumber} subtitle={woModal.selected.product} onClose={woModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'WO Number', value: woModal.selected.woNumber },
              { label: 'Product', value: woModal.selected.product },
              { label: 'Quantity', value: (woModal.selected.qty || 0).toLocaleString() },
              { label: 'Production Line', value: woModal.selected.line },
              { label: 'Status', value: woModal.selected.status },
              { label: 'Completion', value: `${woModal.selected.completion}%` },
              { label: 'Due Date', value: woModal.selected.dueDate || '—' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value fw-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}
      {bomModal.selected && (
        <ViewModal title={bomModal.selected.part} subtitle={`${bomModal.selected.product} — BOM Component`} onClose={bomModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Component', value: bomModal.selected.part },
              { label: 'Product', value: bomModal.selected.product },
              { label: 'Quantity', value: bomModal.selected.qty },
              { label: 'Unit', value: bomModal.selected.unit },
              { label: 'Unit Cost', value: `$${(bomModal.selected.cost || 0).toFixed(2)}` },
              { label: 'Line Total', value: `$${((bomModal.selected.qty || 0) * (bomModal.selected.cost || 0)).toFixed(2)}` },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value fw-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}
      {qcModal.selected && (
        <ViewModal title={qcModal.selected.check} subtitle={`Result: ${qcModal.selected.result}`} onClose={qcModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Check', value: qcModal.selected.check },
              { label: 'Result', value: qcModal.selected.result },
              { label: 'Inspector', value: qcModal.selected.inspector },
              { label: 'Date', value: qcModal.selected.date },
              { label: 'Notes', value: qcModal.selected.notes || '—' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value fw-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}
    </div>
  );
};
