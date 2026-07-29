import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

const printVisitorBadge = (visitor: { id: string; name: string; host: string; company: string; checkIn: string }, companyName: string) => {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Visitor Badge - ${visitor.id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px; min-height: 100vh; background: #f1f5f9; padding: 40px 20px; }
  .card { width: 3.4in; height: 2.16in; border-radius: 16px; color: white; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
  .front { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%); padding: 20px 24px; display: flex; flex-direction: column; justify-content: space-between; }
  .front::before { content: ''; position: absolute; top: -50px; right: -50px; width: 140px; height: 140px; background: rgba(255,255,255,0.1); border-radius: 50%; }
  .front::after { content: ''; position: absolute; bottom: -40px; left: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.07); border-radius: 50%; }
  .front .top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1; }
  .front .company { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; }
  .front .tag { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(4px); }
  .front .middle { position: relative; z-index: 1; }
  .front .name { font-size: 22px; font-weight: 800; line-height: 1.1; letter-spacing: -0.5px; }
  .front .co { font-size: 11px; font-weight: 500; opacity: 0.85; margin-top: 3px; }
  .front .bottom { display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1; }
  .front .info { font-size: 9px; font-weight: 500; opacity: 0.8; line-height: 1.5; }
  .front .qr { position: relative; z-index: 1; width: 48px; height: 48px; background: white; border-radius: 8px; padding: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .front .qr img { width: 100%; height: 100%; display: block; border-radius: 5px; }
  .front .id-badge { font-size: 13px; font-weight: 700; font-family: monospace; letter-spacing: 1px; background: rgba(255,255,255,0.2); padding: 5px 14px; border-radius: 10px; }
  .back { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 18px 24px; display: flex; flex-direction: column; justify-content: space-between; }
  .back::before { content: ''; position: absolute; top: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.08); border-radius: 50%; }
  .back .stripe { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #facc15, #f97316, #ef4444, #ec4899, #8b5cf6, #3b82f6); }
  .back .rules { position: relative; z-index: 1; }
  .back .rules-title { font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 8px; }
  .back .rule { font-size: 8px; font-weight: 500; opacity: 0.85; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; }
  .back .rule i { font-size: 8px; opacity: 0.7; width: 12px; text-align: center; }
  .back .wifi { position: relative; z-index: 1; background: rgba(255,255,255,0.12); border-radius: 10px; padding: 8px 12px; backdrop-filter: blur(4px); }
  .back .wifi-title { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.7; margin-bottom: 3px; }
  .back .wifi-info { font-size: 9px; font-weight: 600; }
  .back .wifi-info span { display: block; font-size: 8px; font-weight: 400; opacity: 0.7; }
  .back .footer { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-end; }
  .back .emergency { font-size: 8px; font-weight: 600; opacity: 0.8; }
  .back .emergency span { display: block; font-size: 7px; font-weight: 400; opacity: 0.7; }
  .back .company-back { font-size: 7px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.5; }
  .label { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: -16px; }
  @media print { body { background: white; padding: 20px; gap: 16px; } .card { box-shadow: none; border: 2px solid #e2e8f0; page-break-inside: avoid; } }
</style></head><body>
<div class="label">Front</div>
<div class="card front">
  <div class="top">
    <div class="company">${companyName}</div>
    <div class="tag">VISITOR</div>
  </div>
  <div class="middle">
    <div class="name">${visitor.name}</div>
    <div class="co">${visitor.company}</div>
  </div>
  <div class="bottom">
    <div class="info">Host: ${visitor.host}<br>Time: ${visitor.checkIn}<br>Date: ${new Date().toLocaleDateString()}</div>
    <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(visitor.id)}&bgcolor=transparent&color=ffffff" alt="QR"></div>
  </div>
</div>
<div class="label">Back</div>
<div class="card back">
  <div class="stripe"></div>
  <div class="rules">
    <div class="rules-title">Building Rules</div>
    <div class="rule"><i class="bi bi-shield-check"></i> Always wear your visitor badge</div>
    <div class="rule"><i class="bi bi-person-check"></i> Sign in at reception on each visit</div>
    <div class="rule"><i class="bi bi-camera"></i> No photography without permission</div>
    <div class="rule"><i class="bi bi-box-arrow-right"></i> Please check out before leaving</div>
  </div>
  <div class="wifi">
    <div class="wifi-title">Guest Wi-Fi</div>
    <div class="wifi-info">Network: ${companyName.replace(/[^a-zA-Z0-9]/g, '')}-Guest<span>Password: Welcome2026</span></div>
  </div>
  <div class="footer">
    <div class="emergency">Emergency: Dial 911<span>Security: Ext. 100</span></div>
    <div class="company-back">${companyName}</div>
  </div>
</div>
</body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
};

const printEmployeeIdCard = (emp: { firstName: string; lastName: string; employeeNumber: string; department: string; designation: string; email: string; branch: string; joiningDate: string; photoUrl?: string }, companyName: string) => {
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ID Card - ${emp.employeeNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px; min-height: 100vh; background: #f1f5f9; padding: 40px 20px; }
  .card { width: 3.4in; height: 2.16in; border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
  .front { background: white; display: flex; overflow: hidden; }
  .front-left { width: 40%; background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px; color: white; position: relative; overflow: hidden; }
  .front-left::before { content: ''; position: absolute; top: -25px; right: -25px; width: 70px; height: 70px; background: rgba(255,255,255,0.12); border-radius: 50%; }
  .front-left::after { content: ''; position: absolute; bottom: -15px; left: -15px; width: 50px; height: 50px; background: rgba(255,255,255,0.08); border-radius: 50%; }
  .avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 3px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; letter-spacing: -1px; position: relative; z-index: 1; }
  .emp-id { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; margin-top: 8px; opacity: 0.9; font-family: monospace; position: relative; z-index: 1; }
  .emp-tag { font-size: 7px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.25); padding: 3px 10px; border-radius: 12px; margin-top: 5px; position: relative; z-index: 1; }
  .front-right { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; }
  .front-right .name { font-size: 16px; font-weight: 800; color: #065f46; line-height: 1.15; letter-spacing: -0.3px; }
  .front-right .role { font-size: 9px; font-weight: 600; color: #059669; margin-top: 2px; }
  .front-right .details { margin-top: auto; }
  .front-right .detail-row { font-size: 8px; font-weight: 500; color: #6b7280; margin-bottom: 2px; display: flex; align-items: center; gap: 4px; }
  .front-right .detail-row i { font-size: 7px; color: #10b981; }
  .front-right .company-label { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #a7f3d0; margin-top: 6px; }
  .front-right .qr { position: absolute; bottom: 14px; right: 14px; width: 44px; height: 44px; background: white; border-radius: 8px; padding: 3px; box-shadow: 0 2px 8px rgba(5,150,105,0.2); border: 1.5px solid #d1fae5; }
  .front-right .qr img { width: 100%; height: 100%; display: block; border-radius: 5px; }
  .back { background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%); color: white; padding: 18px 22px; display: flex; flex-direction: column; justify-content: space-between; }
  .back::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #fbbf24, #f97316, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981); }
  .back .stripe-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444, #f97316, #fbbf24); }
  .back .barcode { position: relative; z-index: 1; background: rgba(255,255,255,0.12); border-radius: 10px; padding: 8px 12px; text-align: center; backdrop-filter: blur(4px); }
  .back .barcode-label { font-size: 7px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px; }
  .back .barcode-lines { display: flex; justify-content: center; gap: 2px; height: 24px; align-items: flex-end; }
  .back .bar { width: 2px; background: rgba(255,255,255,0.6); border-radius: 1px; }
  .back .barcode-text { font-size: 8px; font-weight: 600; font-family: monospace; letter-spacing: 2px; margin-top: 4px; opacity: 0.8; }
  .back .info-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .back .info-item { font-size: 8px; opacity: 0.85; }
  .back .info-item .label { font-size: 6px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.6; margin-bottom: 1px; color: white; }
  .back .footer { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-end; }
  .back .emergency { font-size: 8px; font-weight: 600; opacity: 0.85; }
  .back .emergency span { display: block; font-size: 7px; font-weight: 400; opacity: 0.7; }
  .back .company-back { font-size: 7px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.5; }
  .side-label { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: -16px; }
  @media print { body { background: white; padding: 20px; gap: 16px; } .card { box-shadow: none; border: 2px solid #e2e8f0; page-break-inside: avoid; } }
</style></head><body>
<div class="side-label">Front</div>
<div class="card front">
  <div class="front-left">
    <div class="avatar">${initials}</div>
    <div class="emp-id">${emp.employeeNumber}</div>
    <div class="emp-tag">EMPLOYEE</div>
  </div>
  <div class="front-right" style="position:relative;">
    <div>
      <div class="name">${emp.firstName} ${emp.lastName}</div>
      <div class="role">${emp.designation}</div>
    </div>
    <div class="details">
      <div class="detail-row"><i class="bi bi-building"></i> ${emp.department} · ${emp.branch}</div>
      <div class="detail-row"><i class="bi bi-envelope"></i> ${emp.email}</div>
      <div class="detail-row"><i class="bi bi-calendar3"></i> Joined ${emp.joiningDate}</div>
      <div class="company-label">${companyName}</div>
    </div>
    <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(emp.employeeNumber)}&bgcolor=ffffff&color=059669" alt="QR"></div>
  </div>
</div>
<div class="side-label">Back</div>
<div class="card back">
  <div class="stripe-bottom" style="top:0;bottom:auto;"></div>
  <div class="barcode">
    <div class="barcode-label">Employee Barcode</div>
    <div class="barcode-lines">
      ${Array.from({length: 30}, () => `<div class="bar" style="height:${8 + Math.floor(Math.random() * 16)}px;"></div>`).join('')}
    </div>
    <div class="barcode-text">${emp.employeeNumber}</div>
  </div>
  <div class="info-grid">
    <div class="info-item"><div class="label">Department</div>${emp.department}</div>
    <div class="info-item"><div class="label">Branch</div>${emp.branch}</div>
    <div class="info-item"><div class="label">Date of Issue</div>${new Date().toLocaleDateString()}</div>
    <div class="info-item"><div class="label">Valid Until</div>Permanent</div>
  </div>
  <div class="footer">
    <div class="emergency">Emergency: Dial 911<span>Security: Ext. 100</span></div>
    <div class="company-back">${companyName}</div>
  </div>
  <div class="stripe-bottom"></div>
</div>
</body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
};

export const VisitorView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  type VisTab = 'checkin' | 'log' | 'badges';
  const visTabFromView = (): VisTab =>
    activeView === 'vis-log' ? 'log'
      : activeView === 'vis-badges' ? 'badges'
        : 'checkin';
  const [visTab, setVisTab] = useState<VisTab>(visTabFromView());
  useEffect(() => { setVisTab(visTabFromView()); }, [activeView]);
  const visTabs: { id: VisTab; label: string }[] = [
    { id: 'checkin', label: 'Check-In' },
    { id: 'log', label: 'Visitor Log' },
    { id: 'badges', label: 'Badges' },
  ];
  const [visitors, setVisitors] = useState([
    { id: 'V-201', name: 'Markus Vance', host: 'Elena Rostova', company: 'Apex Inc.', checkIn: '09:15 AM', checkOut: null as string | null, status: 'Inside' },
    { id: 'V-202', name: 'Jin Li', host: 'Kaito Matsuda', company: 'TechParts Global', checkIn: '10:30 AM', checkOut: '11:45 AM', status: 'Checked Out' },
  ]);
  const [visName, setVisName] = useState(''); const [visHost, setVisHost] = useState('');
  const [visCompany, setVisCompany] = useState(''); const [visBadge, setVisBadge] = useState<string | null>(null);

  const isHR = selectedUser.activeRole === 'HR Manager' || selectedUser.activeRole === 'HR Officer' || selectedUser.activeRole === 'HR Department Head';

  return (
    <div>
      <PageHeader title="Visitor Management" subtitle="Check in guests, log visits, print badges and manage building access." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {visTabs.map(t => (
          <button key={t.id} onClick={() => setVisTab(t.id)} className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${visTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Inside Now" value={visitors.filter(v => v.status === 'Inside').length} icon="bi bi-door-open" sub="Currently in building" accent />
        <StatCard label="Today's Visits" value={visitors.length} icon="bi bi-person-badge" sub="Total check-ins today" />
        <StatCard label="Checked Out" value={visitors.filter(v => v.status === 'Checked Out').length} icon="bi bi-box-arrow-right" sub="Departed visitors" />
      </div>
      {visTab === 'checkin' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-md">
          <h3 className="section-title text-slate-500 mb-5">Check-In Visitor</h3>
          {visBadge && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <i className="bi bi-person-badge text-emerald-600 fs-2xl block mb-1"></i>
              <div className="fs-xs fw-bold text-emerald-800">Badge Printed: {visBadge}</div>
            </div>
          )}
          <div className="space-y-4">
            <div><Label>Visitor Name</Label><Input value={visName} onChange={e => setVisName(e.target.value)} placeholder="John Doe" /></div>
            <div><Label>Visitor Company</Label><Input value={visCompany} onChange={e => setVisCompany(e.target.value)} placeholder="Acme Corp" /></div>
            <div><Label>Host Employee</Label>
              <Select value={visHost} onChange={e => setVisHost(e.target.value)}>
                <option value="">— Select host —</option>
                {localEmployees.slice(0, 8).map(e => <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</option>)}
              </Select>
            </div>
            <PrimaryBtn icon="bi bi-person-check" onClick={() => {
              if (!visName || !visHost) return;
              const id = `V-${200 + visitors.length + 1}`;
              const newVisitor = { id, name: visName, host: visHost, company: visCompany || 'Walk-In', checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'Inside' };
              setVisitors(prev => [...prev, newVisitor]);
              setVisBadge(`BADGE-${id}`);
              printVisitorBadge(newVisitor, selectedCompany.name);
              setVisName(''); setVisHost(''); setVisCompany('');
              setTimeout(() => setVisBadge(null), 4000);
            }}>Check In &amp; Print Badge</PrimaryBtn>
          </div>
        </div>
      )}
      {visTab === 'log' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Visitor Log</h3></div>
          <div className="divide-y divide-slate-100">
            {visitors.map(v => (
              <div key={v.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/40">
                <div>
                  <div className="fs-xs fw-bold text-slate-900">{v.name} <span className="text-slate-400 fw-normal">· {v.company}</span></div>
                  <div className="data-value text-slate-500 mt-0.5">Host: {v.host} · In: {v.checkIn}{v.checkOut ? ` · Out: ${v.checkOut}` : ''}</div>
                </div>
                <Badge label={v.status} variant={v.status === 'Inside' ? 'success' : 'default'} />
              </div>
            ))}
          </div>
        </div>
      )}
      {visTab === 'badges' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="section-title text-slate-900">Printed Badges</h3>
            <span className="fs-xs text-slate-400">{visitors.length} badge(s)</span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {visitors.map(v => (
              <div key={v.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shrink-0">
                  <i className="bi bi-person-badge fs-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="fs-xs fw-bold text-slate-900 truncate">{v.name}</div>
                  <div className="data-value text-slate-500 truncate">{v.company} · Host: {v.host}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{v.id}</div>
                </div>
                <button
                  onClick={() => printVisitorBadge(v, selectedCompany.name)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg fs-[10px] fw-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all cursor-pointer bg-white shrink-0"
                >
                  <i className="bi bi-printer"></i> Print
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee ID Cards Section (HR only) */}
      {isHR && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="section-title text-slate-900">Employee ID Cards</h3>
              <p className="fs-xs text-slate-400 mt-0.5">Print colored ID cards for employees</p>
            </div>
            <span className="fs-xs text-slate-400">{localEmployees.length} employee(s)</span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {localEmployees.map(emp => (
              <div key={emp.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white fs-xs fw-bold shrink-0">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="fs-xs fw-bold text-slate-900 truncate">{emp.firstName} {emp.lastName}</div>
                  <div className="data-value text-slate-500 truncate">{emp.designation} · {emp.department}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{emp.employeeNumber}</div>
                </div>
                <button
                  onClick={() => printEmployeeIdCard(emp, selectedCompany.name)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg fs-[10px] fw-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all cursor-pointer bg-white shrink-0"
                >
                  <i className="bi bi-printer"></i> Print ID
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
