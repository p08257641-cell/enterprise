import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, ViewModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { modalAlert } from '../../utils/modal';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { parseActiveView } from '../../parseActiveView';

export const DocumentView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const initialDocTab = (): 'locker' | 'esign' | 'ocr' => {
    const { sub } = parseActiveView(activeView);
    if (sub === 'esign') return 'esign';
    if (sub === 'ocr') return 'ocr';
    return 'locker';
  };
  const [docTab, setDocTab] = useState<'locker' | 'esign' | 'ocr'>(initialDocTab);
  useEffect(() => { setDocTab(initialDocTab()); }, [activeView]);
  const [documents, setDocuments] = useState([
    { id: 'DOC-001', name: 'Employee NDA 2026', type: 'NDA', size: '84 KB', status: 'Signed', date: '2026-06-15' },
    { id: 'DOC-002', name: 'Vendor Contract – Tooling Co.', type: 'Contract', size: '212 KB', status: 'Pending Signature', date: '2026-07-01' },
    { id: 'DOC-003', name: 'ISO Audit Report Q2', type: 'Report', size: '1.2 MB', status: 'Approved', date: '2026-07-05' },
    { id: 'DOC-004', name: 'GDPR Data Policy v3', type: 'Policy', size: '340 KB', status: 'Draft', date: '2026-07-08' },
  ]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [signDoc, setSignDoc] = useState<string | null>(null);
  const docModal = useRowModal<typeof documents[0]>();

  return (
    <div>
      <PageHeader title="Document Management" subtitle="Secure document locker, electronic signatures and OCR document scanning." />
      {docTab === 'locker' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="section-title text-slate-900">All Documents</h3>
            <PrimaryBtn icon="bi bi-cloud-upload" onClick={() => { setDocName(''); setDocType('Contract'); setShowDocModal(true); }}>Upload Document</PrimaryBtn>
          </div>
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Document' }, { label: 'Type' }, { label: 'Size' }, { label: 'Date' }, { label: 'Status' }, { label: '', right: true }]} />
            <tbody className="divide-y divide-slate-100">
              {documents.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => docModal.open(d)}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><i className="bi bi-file-earmark-text text-slate-400"></i><span className="text-xs font-semibold text-slate-900">{d.name}</span></div></td>
                  <td className="px-4 py-3"><Badge label={d.type} /></td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{d.size}</td>
                  <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-400">{d.date}</td>
                  <td className="px-4 py-3"><Badge label={d.status} variant={d.status === 'Signed' || d.status === 'Approved' ? 'success' : d.status === 'Pending Signature' ? 'warning' : 'default'} /></td>
                   <td className="px-4 py-3 text-right" onClick={() => docModal.open(d)}><button onClick={e => { e.stopPropagation(); void modalAlert(`Downloading "${d.name}"...`, { variant: 'info' }); }} className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Upload Document</h2>
            <div className="space-y-4">
              <div><Label>Document Name *</Label><Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Q3 Financial Report" /></div>
              <div><Label>Type</Label><Select value={docType} onChange={e => setDocType(e.target.value)}><option>Contract</option><option>NDA</option><option>Report</option><option>Policy</option><option>Invoice</option></Select></div>
            </div>
            <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
              <SecBtn onClick={() => setShowDocModal(false)}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                if (!docName) return void modalAlert('Document name required', { variant: 'warning' });
                setDocuments(prev => [{ id: `DOC-${Date.now()}`, name: docName, type: docType, size: '0 KB', status: 'Draft', date: new Date().toISOString().split('T')[0] }, ...prev]);
                setShowDocModal(false); setDocName('');
              }}>Upload</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {docTab === 'esign' && (
        <div className="max-w-xl">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-5">Electronic Signature Workflow</h3>
            <div className="space-y-3">
              {documents.filter(d => d.status === 'Pending Signature').map(d => (
                <div key={d.id} className="p-4 border border-amber-200 bg-amber-50/30 rounded-xl flex items-center justify-between">
                  <div><div className="table-cell-semibold text-slate-900">{d.name}</div><div className="data-value text-slate-500 mt-0.5">{d.type} · Added {d.date}</div></div>
                  <button onClick={() => setSignDoc(d.id)} className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Sign Document</button>
                </div>
              ))}
              {signDoc && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <i className="bi bi-patch-check-fill text-emerald-600 text-2xl mb-2 block"></i>
                  <div className="text-xs font-bold text-emerald-800">Document Signed Successfully</div>
                  <div className="data-value text-emerald-600 mt-1">Signed by {selectedUser.name} · {new Date().toLocaleString()}</div>
                  <button onClick={() => setSignDoc(null)} className="mt-3 text-[10px] font-semibold text-emerald-700 underline cursor-pointer">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {docTab === 'ocr' && (
        <div className="max-w-xl">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-5">OCR Document Scanner</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-5 hover:border-slate-400 transition-colors cursor-pointer">
              <i className="bi bi-upc-scan text-3xl text-slate-300 block mb-2"></i>
              <p className="text-xs text-slate-500">Drag & drop a document or click to upload</p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, JPG · Max 10MB</p>
            </div>
            <PrimaryBtn icon="bi bi-cpu" onClick={() => {
              setOcrLoading(true); setOcrResult(null);
              setTimeout(() => { setOcrLoading(false); setOcrResult('EXTRACTED TEXT:\n\nCompany: Alpha Biotech Group\nDate: July 9, 2026\nRef: NDA-2026-088\n\nThis Non-Disclosure Agreement ("Agreement") is entered into...\n\n[Full text extraction complete — 847 words detected]'); }, 2000);
            }}>{ocrLoading ? 'Processing…' : 'Run OCR Extraction'}</PrimaryBtn>
            {ocrResult && (
              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="section-title text-slate-400 mb-2">OCR Result</div>
                <pre className="data-value text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{ocrResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}
      {docModal.selected && (
        <ViewModal title={docModal.selected.name} subtitle={`${docModal.selected.type} · ${docModal.selected.size}`} onClose={docModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Document ID', value: docModal.selected.id },
              { label: 'Name', value: docModal.selected.name },
              { label: 'Type', value: docModal.selected.type },
              { label: 'Size', value: docModal.selected.size },
              { label: 'Date', value: docModal.selected.date },
              { label: 'Status', value: docModal.selected.status },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
        </ViewModal>
      )}
    </div>
  );
};
