import React, { useState } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { isAdminRole } from '../../permissions';

export const DocumentView: React.FC<ModuleViewsProps> = (props) => {
  const {
    activeView, onNavigateView, selectedCompany, selectedUser,
    managedDocuments, onCreateDocument, onUpdateDocument, onDeleteDocument,
    policyDocuments, onAcknowledgePolicy, searchTerm = '',
  } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const localDocs = managedDocuments.filter(d => d.companyId === selectedCompany.id);
  const localPolicies = policyDocuments.filter(p => p.companyId === selectedCompany.id);

  type DocTab = 'locker' | 'esign' | 'ocr';
  const docTabFromView = (): DocTab =>
    activeView === 'doc-esign' ? 'esign'
      : activeView === 'doc-ocr' ? 'ocr'
        : 'locker';
  const [docTab, setDocTab] = useState<DocTab>(docTabFromView());

  const docTabs: { id: DocTab; label: string }[] = [
    { id: 'locker', label: 'Document Locker' },
    { id: 'esign', label: 'eSign Requests' },
    { id: 'ocr', label: 'OCR / Extraction' },
  ];

  // New document form
  const [newDocName, setNewDocName] = useState('');
  const [newDocFileUrl, setNewDocFileUrl] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');
  const [newDocStatus, setNewDocStatus] = useState('Draft');
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocVisibility, setNewDocVisibility] = useState<'everyone' | 'only_me' | 'specific' | 'department'>('everyone');
  const [newDocSharedWith, setNewDocSharedWith] = useState<string[]>([]);
  const [newDocSigners, setNewDocSigners] = useState<string[]>([]);
  const [newDocCC, setNewDocCC] = useState<string[]>([]);

  // OCR modal state
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrDoc, setOcrDoc] = useState<typeof localDocs[0] | null>(null);

  const docModal = useRowModal<typeof localDocs[0]>();
  const policyModal = useRowModal<typeof localPolicies[0]>();

  const signPending = localDocs.filter(d => d.status === 'Pending Signature').length;
  const totalDocs = localDocs.length;
  const signed = localDocs.filter(d => d.status === 'Signed' || d.status === 'Approved').length;
  const archived = localDocs.filter(d => d.status === 'Archived').length;

  const getStatusVariant = (status: string) => {
    if (status === 'Signed' || status === 'Approved') return 'success';
    if (status === 'Pending Signature') return 'warning';
    if (status === 'Archived') return 'info';
    return 'default';
  };

  const fileIcons: Record<string, string> = {
    PDF: 'bi bi-file-earmark-pdf',
    DOCX: 'bi bi-file-earmark-word',
    XLSX: 'bi bi-file-earmark-excel',
    PPTX: 'bi bi-file-earmark-slides',
    PNG: 'bi bi-file-earmark-image',
    JPG: 'bi bi-file-earmark-image',
    ZIP: 'bi bi-file-earmark-zip',
  };

  const handleExtractOcr = (doc: typeof localDocs[0]) => {
    setOcrDoc(doc);
    setShowOcrModal(true);
  };

  const getOcrSimulatedText = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('agreement') || n.includes('contract')) {
      return {
        text: "This Material Supply Agreement is entered into on July 5, 2026, between Acme Global Manufacturing and Industrial Tooling Co. Under this agreement, Industrial Tooling Co. commits to supply tooling parts, CNC components, and drilling accessories under standard commercial credit terms...",
        metadata: [
          { key: "Contract Value", val: "$150,000" },
          { key: "Supplier", val: "Industrial Tooling Co." },
          { key: "Effective Date", val: "2026-07-05" },
          { key: "Term", val: "12 Months" },
        ]
      };
    }
    if (n.includes('safety') || n.includes('guidelines') || n.includes('policy')) {
      return {
        text: "These guidelines outline the mandatory occupational safety protocols for all factory floor staff operating CNC mills, assembly machinery, and forklifts. Protective gear including steel-toed boots and safety glasses are strictly enforced at all times within production zones...",
        metadata: [
          { key: "Category", val: "Health & Safety Compliance" },
          { key: "Last Revised", val: "2026-07-08" },
          { key: "Review Frequency", val: "Annual" },
          { key: "Enforced By", val: "Operations Management" },
        ]
      };
    }
    return {
      text: `Simulated OCR scan completed successfully for ${name}. Full text content was extracted, mapped to index tags, and cached in the server document indexing registry.`,
      metadata: [
        { key: "Document Name", val: name },
        { key: "Processed At", val: new Date().toISOString().split('T')[0] },
        { key: "Extraction Quality", val: "99.8% Confidence" },
      ]
    };
  };

  return (
    <div>
      <PageHeader
        title="Document Management"
        subtitle="Centralise company documents, send eSign requests and run OCR extraction."
        action={isAdmin ? <PrimaryBtn icon="bi bi-cloud-upload" onClick={() => { setNewDocName(''); setNewDocStatus('Draft'); setShowDocModal(true); }}>Upload Document</PrimaryBtn> : undefined}
      />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {docTabs.map(t => (
          <button key={t.id} onClick={() => { setDocTab(t.id); onNavigateView(t.id === 'locker' ? 'document' : `doc-${t.id}`); }}
            className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${docTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Total Documents" value={totalDocs} icon="bi bi-folder2-open" sub="Files in document locker" />
        <StatCard label="Pending Signature" value={signPending} icon="bi bi-pen" sub="Awaiting eSign" accent />
        <StatCard label="Signed / Approved" value={signed} icon="bi bi-check-circle" sub="Completed documents" />
        <StatCard label="Archived" value={archived} icon="bi bi-archive" sub="Archived files" />
      </div>

      {/* Document Locker Tab */}
      {docTab === 'locker' && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {localDocs.filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group" onClick={() => docModal.open(d)}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <i className={`${fileIcons[d.type] || 'bi bi-file-earmark'} fs-base text-slate-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="fs-xs fw-semibold text-slate-900 truncate">{d.name}</span>
                      <span className={`shrink-0 fs-3xs fw-bold px-1.5 py-0.5 rounded-full ${
                        d.visibility === 'only_me' ? 'bg-amber-50 text-amber-600' :
                        d.visibility === 'specific' ? 'bg-blue-50 text-blue-600' :
                        d.visibility === 'department' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-100 text-slate-400'
                      }`} title={d.visibility === 'only_me' ? 'Only you can see this' : d.visibility === 'specific' ? `Shared with ${(d.sharedWith || []).length} people` : d.visibility === 'department' ? 'Visible to department' : 'Visible to everyone'}>
                        <i className={`bi ${
                          d.visibility === 'only_me' ? 'bi-lock-fill' :
                          d.visibility === 'specific' ? 'bi-people-fill' :
                          d.visibility === 'department' ? 'bi-building' :
                          'bi-globe'
                        }`}></i>
                      </span>
                    </div>
                    <div className="fs-2xs text-slate-400 mt-0.5">{d.type} · {d.size} · {d.date}</div>
                    <div className="mt-2"><Badge label={d.status} variant={getStatusVariant(d.status)} /></div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                    {d.status === 'Draft' && (
                      <button onClick={() => onUpdateDocument(d.id, { status: 'Pending Signature' })} className="fs-3xs fw-bold px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer">Send for Signature</button>
                    )}
                    {d.status === 'Pending Signature' && (
                      <button onClick={() => onUpdateDocument(d.id, { status: 'Signed' })} className="fs-3xs fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Mark Signed</button>
                    )}
                    {(d.status === 'Signed' || d.status === 'Approved') && (
                      <button onClick={() => onUpdateDocument(d.id, { status: 'Archived' })} className="fs-3xs fw-bold px-2 py-1 rounded bg-slate-600 text-white hover:bg-slate-700 cursor-pointer">Archive</button>
                    )}
                    <button onClick={() => onDeleteDocument(d.id)} className="fs-3xs fw-semibold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer ml-auto">Del</button>
                  </div>
                )}
              </div>
            ))}
            {localDocs.length === 0 && (
              <div className="col-span-3 py-12 text-center fs-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
                <i className="bi bi-cloud-upload fs-3xl text-slate-200 block mb-2" />
                No documents uploaded yet. Click "Upload Document" to add your first file.
              </div>
            )}
          </div>

          {/* Policy Documents section from HR */}
          {localPolicies.length > 0 && (
            <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="section-title text-slate-900">HR Policy Documents</h3>
                  <p className="fs-2xs text-slate-400 mt-0.5">Policies sourced from HR compliance module.</p>
                </div>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Policy Title' }, { label: 'Category' }, { label: 'Version' }, { label: 'Due Date' }, { label: 'Acknowledgements' }, { label: 'Status' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localPolicies.filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{p.title}</td>
                      <td className="px-4 py-3 fs-xs text-slate-500">{p.category}</td>
                      <td className="px-4 py-3 fs-2xs font-sans text-slate-400">{p.version}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{p.dueDate || '—'}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-600">{(p.acknowledgedBy || []).length} / {p.totalEmployees || '—'}</td>
                      <td className="px-4 py-3"><Badge label={p.status || 'Active'} variant="success" /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => policyModal.open(p)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md fs-2xs fw-semibold transition-all duration-150 cursor-pointer mr-2">
                          View
                        </button>
                        {isAdmin && (
                          <button onClick={() => alert('Editing Policy: ' + p.title)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 text-blue-600 rounded-md fs-2xs fw-semibold transition-all duration-150 cursor-pointer">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* eSign Tab */}
      {docTab === 'esign' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="section-title text-slate-900">eSign Requests</h3>
                <p className="fs-2xs text-slate-400 mt-0.5">Documents sent for digital signature.</p>
              </div>
              <PrimaryBtn icon="bi bi-cloud-upload" onClick={() => { setNewDocName(''); setNewDocStatus('Pending Signature'); setShowDocModal(true); }}>Upload for eSign</PrimaryBtn>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Document Name' }, { label: 'Type' }, { label: 'Date' }, { label: 'Status' }, { label: 'Signers' }, { label: 'CC' }, ...(isAdmin ? [{ label: '', right: true }] : [])]} />
              <tbody className="divide-y divide-slate-100">
                {localDocs.filter(d => (d.status === 'Pending Signature' || d.status === 'Signed') && (!searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()))).map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{d.name}</td>
                    <td className="px-4 py-3 fs-xs text-slate-500">{d.type}</td>
                    <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-400">{d.date}</td>
                    <td className="px-4 py-3"><Badge label={d.status} variant={getStatusVariant(d.status)} /></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {d.status === 'Pending Signature' && (
                          <button onClick={() => onUpdateDocument(d.id, { status: 'Signed' })} className="fs-3xs fw-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Mark Signed</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {localDocs.filter(d => d.status === 'Pending Signature' || d.status === 'Signed').length === 0 && (
                  <EmptyRow cols={isAdmin ? 7 : 6} message="No eSign requests. Upload a document and send it for signature." />
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OCR Tab */}
      {docTab === 'ocr' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 text-center">
            <i className="bi bi-file-earmark-text fs-4xl text-slate-200 block mb-4" />
            <h3 className="section-title text-slate-900 mb-2">OCR & Data Extraction</h3>
            <p className="fs-xs text-slate-400 max-w-sm mx-auto mb-4">
              Automatically extract text, tables, and structured data from scanned documents, invoices and receipts. Select a document from the locker to begin.
            </p>
            {isAdmin && (
              <div className="mb-6">
                <SecBtn  onClick={() => { setNewDocName(''); setNewDocStatus('Draft'); setShowDocModal(true); }}>Upload Document for OCR</SecBtn>
              </div>
            )}
            <div className="space-y-2 max-w-xl mx-auto">
              {localDocs.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer text-left" onClick={() => handleExtractOcr(d)}>
                  <i className={`${fileIcons[d.type] || 'bi bi-file-earmark'} text-slate-400`} />
                  <div className="flex-1">
                    <div className="fs-xs fw-semibold text-slate-900">{d.name}</div>
                    <div className="fs-2xs text-slate-400">{d.type} · {d.size}</div>
                  </div>
                  <button className="fs-3xs fw-bold px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">Extract</button>
                </div>
              ))}
              {localDocs.length === 0 && <p className="fs-xs text-slate-400">Upload documents first to run OCR extraction.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Upload Document</h2>
            <div className="space-y-4">
              <div><Label>Document Name *</Label><Input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Q4 Sales Contract.pdf" /></div>
              <div>
                <Label>Upload File</Label>
                <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { uploadFile } = await import('../../lib/supabase');
                      const url = await uploadFile(file, 'documents', selectedCompany.id);
                      if (url) {
                        setNewDocFileUrl(url);
                      } else {
                        alert('Failed to upload document to Supabase storage.');
                      }
                    } catch (err) {
                      console.error('Upload error:', err);
                      alert('Error uploading document.');
                    }
                  }} />
              </div>
              <div><Label>File Type</Label><Select value={newDocType} onChange={e => setNewDocType(e.target.value)}><option>PDF</option><option>DOCX</option><option>XLSX</option><option>PPTX</option><option>PNG</option><option>JPG</option><option>ZIP</option></Select></div>
              <div>
                <Label>Who can see this?</Label>
                <div className="flex gap-2 mt-1">
                  {[
                    { value: 'everyone' as const, label: 'Everyone', icon: 'bi-globe', desc: 'All company members' },
                    { value: 'department' as const, label: 'My Department', icon: 'bi-building', desc: 'Your department only' },
                    { value: 'specific' as const, label: 'Specific People', icon: 'bi-people', desc: 'Choose who sees it' },
                    { value: 'only_me' as const, label: 'Only Me', icon: 'bi-lock', desc: 'Private to you' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => { setNewDocVisibility(opt.value); if (opt.value !== 'specific') setNewDocSharedWith([]); }}
                      className={`flex-1 p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        newDocVisibility === opt.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}>
                      <i className={`bi ${opt.icon} block text-base mb-1`}></i>
                      <span className="fs-2xs fw-bold block">{opt.label}</span>
                      <span className="fs-3xs opacity-60 block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {newDocVisibility === 'specific' && (
                <div>
                  <Label>Share with</Label>
                  <div className="mt-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {props.users.filter(u => u.id !== selectedUser.id && u.companyId === selectedCompany.id).map(u => (
                      <label key={u.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={newDocSharedWith.includes(u.id)}
                          onChange={e => setNewDocSharedWith(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5" />
                        <div>
                          <span className="fs-xs fw-semibold text-slate-900 block">{u.name}</span>
                          <span className="fs-2xs text-slate-400">{u.activeRole}</span>
                        </div>
                      </label>
                    ))}
                    {props.users.filter(u => u.id !== selectedUser.id && u.companyId === selectedCompany.id).length === 0 && (
                      <p className="px-3 py-3 fs-xs text-slate-400">No other users in this company.</p>
                    )}
                  </div>
                  {newDocSharedWith.length > 0 && (
                    <p className="fs-2xs text-slate-500 mt-1">{newDocSharedWith.length} people selected</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
              <SecBtn onClick={() => { setShowDocModal(false); setNewDocVisibility('everyone'); setNewDocSharedWith([]); }}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-cloud-upload" onClick={() => {
                if (!newDocName.trim()) return;
                onCreateDocument({ name: newDocName, type: newDocType, visibility: newDocVisibility, sharedWith: newDocSharedWith });
                setShowDocModal(false); setNewDocName(''); setNewDocVisibility('everyone'); setNewDocSharedWith([]); setNewDocSigners([]); setNewDocCC([]);
              }}>Upload</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* OCR Result View Modal */}
      {showOcrModal && ocrDoc && (() => {
        const ocrData = getOcrSimulatedText(ocrDoc.name);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i className="bi bi-file-earmark-text fs-sm" />
                </div>
                <div>
                  <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide">OCR Extraction Results</h2>
                  <p className="fs-2xs text-slate-400 mt-0.5">{ocrDoc.name}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div>
                  <h4 className="fs-2xs fw-bold text-slate-400 uppercase tracking-wider mb-1.5">Extracted Key-Value Fields</h4>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    {ocrData.metadata.map(meta => (
                      <div key={meta.key}>
                        <div className="fs-3xs text-slate-400 fw-semibold">{meta.key}</div>
                        <div className="fs-xs text-slate-900 fw-bold mt-0.5">{meta.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="fs-2xs fw-bold text-slate-400 uppercase tracking-wider mb-1.5">Extracted Raw Text</h4>
                  <div className="p-3 bg-slate-900 text-slate-100 font-mono fs-2xs rounded-lg leading-relaxed border border-slate-800 break-words whitespace-pre-wrap">
                    {ocrData.text}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                <PrimaryBtn onClick={() => { setShowOcrModal(false); setOcrDoc(null); }}>Done</PrimaryBtn>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Row Modal */}
      {docModal.selected && (
        <RowModal row={docModal.selected}
          icon="bi bi-folder2-open" accentColor="#4f46e5"
          fields={[
            { label: 'Document Name', key: 'name', icon: 'bi bi-file-earmark' },
            { label: 'Type', key: 'type', icon: 'bi bi-tag', section: 'Details' },
            { label: 'Size', key: 'size', icon: 'bi bi-cloud', section: 'Details' },
            { label: 'Date', key: 'date', mono: true, icon: 'bi bi-calendar-event', section: 'Details' },
            { label: 'Status', key: 'status', icon: 'bi bi-flag', section: 'Details' },
          ]}
          title={r => r.name} subtitle={r => `${r.type} Document`}
          actions={r => <PrimaryBtn icon="bi bi-box-arrow-up-right" onClick={() => window.open((r as any).fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}>View Document</PrimaryBtn>}
          onClose={docModal.close} />
      )}

      {/* Policy Row Modal */}
      {policyModal.selected && (
        <RowModal row={policyModal.selected}
          icon="bi bi-file-earmark-text" accentColor="#0ea5e9"
          fields={[
            { label: 'Policy Title', key: 'title', icon: 'bi bi-file-earmark' },
            { label: 'Category', key: 'category', icon: 'bi bi-tag', section: 'Details' },
            { label: 'Version', key: 'version', mono: true, icon: 'bi bi-hash', section: 'Details' },
            { label: 'Due Date', key: 'dueDate', mono: true, icon: 'bi bi-calendar-event', section: 'Details' },
            { label: 'Content', key: 'content', icon: 'bi bi-text-paragraph', full: true },
          ]}
          title={r => r.title} subtitle={r => `${r.category} Policy`}
          actions={r => (
             <div className="flex gap-2">
               {isAdmin && <SecBtn onClick={() => { alert('Editing Policy: ' + r.title); }}>Edit Policy</SecBtn>}
               <PrimaryBtn icon="bi bi-check2-circle" onClick={() => { onAcknowledgePolicy?.(r.id, ''); policyModal.close(); }}>Acknowledge</PrimaryBtn>
             </div>
          )}
          onClose={policyModal.close} />
      )}
    </div>
  );
};

