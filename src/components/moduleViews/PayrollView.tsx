import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { downloadCSV, downloadPDF, rowsToHtmlTable } from '../../utils/export';
import { modalConfirm } from '../../utils/modal';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isSuperAdminRole, isHRRole, isFinanceDeptHead } from '../../permissions';

function payslipPDFBody(slip: { employeeName: string; employeeId: string; department: string; period: string; baseSalary: number; gross: number; deductions: number; net: number; status: string; customBenefitsTotal?: number; breakdown?: { name: string; amount: number; type: string }[] }) {
  const earnings = slip.breakdown?.filter(b => b.type === 'Benefit') || [];
  const deductions = slip.breakdown?.filter(b => b.type === 'Deduction') || [];
  const baseSalary = slip.baseSalary || slip.gross;

  return `
    <div class="summary-grid">
      <div class="summary-box"><div class="label">Employee</div><div style="font-size:13px;font-weight:700;color:#0f172a;">${slip.employeeName}</div><div style="font-size:10px;color:#64748b;">${slip.employeeId} · ${slip.department}</div></div>
      <div class="summary-box"><div class="label">Pay Period</div><div class="value">${slip.period}</div></div>
      <div class="summary-box"><div class="label">Net Pay</div><div class="value" style="color:#059669;">$${(slip.net || 0).toLocaleString()}</div></div>
      <div class="summary-box"><div class="label">Status</div><div style="font-size:11px;font-weight:700;color:${slip.status === 'Paid' ? '#059669' : '#d97706'};">${slip.status}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
      <div>
        <div class="section-heading">Earnings</div>
        <table>
          <thead><tr><th style="background:#059669;">Component</th><th style="background:#059669;text-align:right;">Amount</th></tr></thead>
          <tbody>
            <tr><td>Base Salary</td><td class="right">$${baseSalary.toLocaleString()}</td></tr>
            ${earnings.map(e => `<tr><td>${e.name}</td><td class="right" style="color:#059669;">+$${e.amount.toLocaleString()}</td></tr>`).join('')}
            <tr class="total-row"><td><strong>Gross Pay</strong></td><td class="right"><strong>$${(slip.gross || 0).toLocaleString()}</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <div class="section-heading">Deductions</div>
        <table>
          <thead><tr><th style="background:#dc2626;">Component</th><th style="background:#dc2626;text-align:right;">Amount</th></tr></thead>
          <tbody>
            ${deductions.length > 0 ? deductions.map(d => `<tr><td>${d.name}</td><td class="right" style="color:#dc2626;">-$${d.amount.toLocaleString()}</td></tr>`).join('') : '<tr><td colspan="2" style="color:#94a3b8;font-style:italic;">No deductions</td></tr>'}
            <tr class="total-row"><td><strong>Total Deductions</strong></td><td class="right" style="color:#dc2626;"><strong>-$${(slip.deductions || 0).toLocaleString()}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top:20px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
      <div><div style="font-size:9px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.06em;">Net Pay</div><div style="font-size:22px;font-weight:800;color:#15803d;font-family:monospace;">$${(slip.net || 0).toLocaleString()}</div></div>
      <div style="text-align:right;"><div style="font-size:9px;color:#166534;">This amount will be credited to your registered bank account.</div><div style="font-size:9px;color:#16a34a;margin-top:2px;">${slip.period}</div></div>
    </div>
  `;
}

export const PayrollView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, payrollGroups, salaryBands, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onCreatePayrollGroup, onDeletePayrollGroup, onCreateSalaryBand, onUpdateSalaryBand, onDeleteSalaryBand, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onNavigateView, payrollTaxConfig, onUpdatePayrollTaxConfig } = props;

  const taxCfg = payrollTaxConfig || { customTaxes: [], customBenefits: [] };
  const [draftCfg, setDraftCfg] = useState(taxCfg);
  useEffect(() => { setDraftCfg(taxCfg); }, [JSON.stringify(taxCfg)]);

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const isSuperAdmin = isSuperAdminRole(selectedUser.activeRole);
  const isHR = isHRRole(selectedUser.activeRole);
  const isFinHead = isFinanceDeptHead(selectedUser.activeRole);
  const isHRorAdmin = isAdmin || isHR || isFinHead;

  // payroll tab is derived from activeView (see below inside the payroll block)
  const [payrollStep, setPayrollStep] = useState<'idle' | 'review' | 'done'>('idle');
  const [paySalaryStructure, setPaySalaryStructure] = useState('Standard');
  const [payMonth, setPayMonth] = useState('July 2026');
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);

  // Payslips tab: pick period, defaulting to the latest available for the company
  const companySlipPeriods = Array.from(
    new Set(payslips.filter(p => p.companyId === selectedCompany.id).map(p => p.period))
  ).sort((a, b) => b.localeCompare(a));
  const [slipsPeriod, setSlipsPeriod] = useState<string>('');
  const activeSlipsPeriod = slipsPeriod || companySlipPeriods[0] || payMonth;
  
  // Employee selection state
  const [payrollTarget, setPayrollTarget] = useState<'all' | 'selected' | 'group'>('all');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const payslipModal = useRowModal<typeof payslips[0]>();
  const taxModal = useRowModal<typeof localEmployees[0] & { fedTax: number; stateTax: number; ss: number; medicare: number; net: number }>();
  const otModal = useRowModal<typeof localEmployees[0] & { otHours: number; otRate: number; otPay: number }>();
  
  // Group management state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [groupEmployeeIds, setGroupEmployeeIds] = useState<Set<string>>(new Set());

  // Salary band management state
  const [showBandModal, setShowBandModal] = useState(false);
  const [newBandName, setNewBandName] = useState('');
  const [newBandMin, setNewBandMin] = useState('');
  const [newBandMax, setNewBandMax] = useState('');

  if (activeView.startsWith('payroll')) {
    const hasPayrollModule = selectedCompany.activeModules.includes('Payroll');

    if (!hasPayrollModule) {
      return (
        <div className="space-y-6">
          <PageHeader title="Payroll & Salary Management" subtitle="Process monthly payroll, manage salary structures, deductions and generate payslips." />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 fs-3xl mb-3 block"></i>
            <h3 className="fs-sm fw-semibold text-amber-800 mb-2">Payroll Module Not Available</h3>
            <p className="fs-xs text-amber-600 mb-4">Your company has not subscribed to the Payroll module. Contact your administrator to enable payroll features.</p>
            <p className="fs-xs text-slate-500">Employee salary data is available in the Employee Directory.</p>
          </div>
        </div>
      );
    }

    const isEmployeeRole = selectedUser.activeRole === 'Employee';
    // Safety check: Employees can only view slips
    const derivedPayrollTab: 'run' | 'slips' | 'tax' | 'overtime' | 'groups' =
      activeView === 'payroll-slips' ? 'slips'
        : activeView === 'payroll-tax' ? 'tax'
          : activeView === 'payroll-overtime' ? 'overtime'
            : activeView === 'payroll-groups' ? 'groups'
              : 'run';
    const effectivePayrollTab = isEmployeeRole ? 'slips' : derivedPayrollTab;
    const totalPayroll = localEmployees.reduce((s, e) => s + e.salary, 0);

    return (
      <div>
        <PageHeader title="Payroll & Salary Management" subtitle={isEmployeeRole ? "View your payslips, earnings details, and tax deductions." : "Process monthly payroll, manage salary structures, deductions and generate payslips."} />
        {!isEmployeeRole && derivedPayrollTab !== 'tax' && derivedPayrollTab !== 'overtime' && (
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Payroll" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-cash-stack" sub="Monthly gross obligation" />
            <StatCard label="Employees on Payroll" value={localEmployees.length} icon="bi bi-people" sub="Active salary records" />
            <StatCard label="Avg Salary" value={`$${localEmployees.length ? Math.round(totalPayroll / localEmployees.length).toLocaleString() : 0}`} icon="bi bi-bar-chart" sub="Mean monthly salary" accent />
            <StatCard label="Next Run" value={(() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })()} icon="bi bi-calendar" sub="Scheduled payroll date" />
          </div>
        )}

        {effectivePayrollTab === 'run' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">Run Payroll</h3>
              {payrollStep === 'idle' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Payroll Period</Label>
                      <input 
                        type="month" 
                        value={(() => {
                          try {
                            const [m, y] = payMonth.split(' ');
                            const mIdx = new Date(`${m} 1, 2000`).getMonth() + 1;
                            return `${y}-${mIdx.toString().padStart(2, '0')}`;
                          } catch(e) { return ""; }
                        })()} 
                        onChange={e => {
                          if (!e.target.value) return;
                          const [y, m] = e.target.value.split('-');
                          const d = new Date(parseInt(y), parseInt(m)-1, 1);
                          setPayMonth(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 fs-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div><Label>Salary Structure</Label><Select value={paySalaryStructure} onChange={e => setPaySalaryStructure(e.target.value)}><option>Standard</option><option>Executive</option><option>Contractor</option></Select></div>
                  </div>
                  
                  {/* Employee Selection */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <Label>Employee Selection</Label>
                    <div className="flex gap-4 mt-2 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="payrollTarget" checked={payrollTarget === 'all'} onChange={() => setPayrollTarget('all')} className="accent-blue-600" />
                        <span className="fs-xs text-slate-700">All Staff ({localEmployees.length})</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="payrollTarget" checked={payrollTarget === 'selected'} onChange={() => setPayrollTarget('selected')} className="accent-blue-600" />
                        <span className="fs-xs text-slate-700">Selected Staff</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="payrollTarget" checked={payrollTarget === 'group'} onChange={() => setPayrollTarget('group')} className="accent-blue-600" />
                        <span className="fs-xs text-slate-700">By Group</span>
                      </label>
                    </div>
                    
                    {payrollTarget === 'selected' && (
                      <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1">
                        {localEmployees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedEmployeeIds.has(emp.id)}
                              onChange={(e) => {
                                const next = new Set(selectedEmployeeIds);
                                if (e.target.checked) next.add(emp.id);
                                else next.delete(emp.id);
                                setSelectedEmployeeIds(next);
                              }}
                              className="accent-blue-600"
                            />
                            <span className="fs-xs text-slate-700">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">{emp.department}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {payrollTarget === 'group' && (
                      <div className="space-y-2">
                        <Select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                          <option value="">Select a group...</option>
                          {payrollGroups.filter(g => g.companyId === selectedCompany.id).map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.employeeIds.length} employees)</option>
                          ))}
                        </Select>
                        {payrollGroups.filter(g => g.companyId === selectedCompany.id).length === 0 && (
                          <p className="text-[10px] text-amber-600">No groups created yet. Go to "Groups" tab to create one.</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between fs-xs">
                        <span className="text-slate-600">Employees to process:</span>
                        <span className="fw-semibold text-slate-900">
                          {payrollTarget === 'all' ? localEmployees.length :
                           payrollTarget === 'selected' ? selectedEmployeeIds.size :
                           payrollGroups.find(g => g.id === selectedGroupId)?.employeeIds.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between fs-xs mb-2"><span className="text-slate-600">Gross Payroll</span><span className="font-sans tabular-nums fw-bold text-slate-900">${totalPayroll.toLocaleString()}</span></div>
                    <div className="flex justify-between fs-xs mb-2"><span className="text-slate-600">Tax Withholding (20%)</span><span className="font-sans tabular-nums text-rose-600">-${(totalPayroll * 0.2).toLocaleString()}</span></div>
                    <div className="flex justify-between table-cell mb-2"><span className="text-slate-600">Benefits / Deductions</span><span className="table-cell-mono text-rose-600">-${(totalPayroll * 0.05).toLocaleString()}</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between table-cell fw-bold"><span className="text-slate-900">Net Payroll Disbursement</span><span className="table-cell-mono text-slate-900">${(totalPayroll * 0.75).toLocaleString()}</span></div>
                  </div>
                  <PrimaryBtn icon="bi bi-play-circle" onClick={() => setPayrollStep('review')}>Review & Process Payroll</PrimaryBtn>
                </div>
              )}
              {payrollStep === 'review' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl fs-xs text-amber-800">
                    <strong>Confirm Payroll Run:</strong> {payrollTarget === 'all' ? localEmployees.length : payrollTarget === 'selected' ? selectedEmployeeIds.size : payrollGroups.find(g => g.id === selectedGroupId)?.employeeIds.length || 0} employees · Period: {payMonth} · Net: ${(totalPayroll * 0.75).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <PrimaryBtn icon="bi bi-check-circle" onClick={() => {
                      const employeeIds = payrollTarget === 'all' ? [] :
                        payrollTarget === 'selected' ? Array.from(selectedEmployeeIds) :
                        payrollGroups.find(g => g.id === selectedGroupId)?.employeeIds || [];
                      onRunPayroll(payMonth, paySalaryStructure, employeeIds);
                      setPayrollStep('done');
                    }}>Confirm & Disburse</PrimaryBtn>
                    <SecBtn onClick={() => setPayrollStep('idle')}>Cancel</SecBtn>
                  </div>
                </div>
              )}
              {payrollStep === 'done' && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <i className="bi bi-check-circle-fill text-emerald-600 fs-2xl block mb-2"></i>
                  <div className="fs-sm fw-bold text-emerald-800">Payroll Processed Successfully!</div>
                  <div className="fs-xs text-emerald-600 mt-1">{localEmployees.length} payslips generated · {payMonth} · Net ${(totalPayroll * 0.75).toLocaleString()} disbursed</div>
                  <button onClick={() => setPayrollStep('idle')} className="mt-4 fs-xs fw-semibold text-emerald-700 underline cursor-pointer">Run New Payroll</button>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-slate-500">Salary Bands</h3>
                {isHRorAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowBandModal(true)}>New Band</PrimaryBtn>}
              </div>
              <div className="space-y-3">
                {salaryBands.filter(b => b.companyId === selectedCompany.id).length === 0 ? (
                  <div className="text-center py-6">
                    <i className="bi bi-bar-chart-line fs-3xl text-slate-200 block mb-2"></i>
                    <p className="fs-sm text-slate-400">No salary bands defined yet</p>
                  </div>
                ) : (
                  salaryBands.filter(b => b.companyId === selectedCompany.id).map(band => (
                    <div key={band.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-center">
                        <span className="table-cell-semibold text-slate-800">{band.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="data-value-small font-sans tabular-nums text-slate-400">{band.employeeCount} employees</span>
                          {isHRorAdmin && (
                            <button onClick={async () => { if (await modalConfirm('Delete this salary band?', { variant: 'danger' })) onDeleteSalaryBand(band.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
                              <i className="bi bi-trash fs-xs"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="data-value text-slate-500 mt-0.5">${band.minSalary.toLocaleString()} – ${band.maxSalary.toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* New Salary Band Modal */}
            {showBandModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowBandModal(false)}>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <i className="bi bi-cash-stack text-emerald-600 fs-xs"></i>
                        </div>
                        <h3 className="fs-sm fw-bold text-slate-900">New Salary Band</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Define a new compensation scale with minimum and maximum bounds.</p>
                    </div>
                    <button type="button" onClick={() => setShowBandModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      <i className="bi bi-x fs-xl"></i>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div><Label>Band Name</Label><Input value={newBandName} onChange={e => setNewBandName(e.target.value)} placeholder="e.g. Senior" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Min Salary ($)</Label><Input type="number" value={newBandMin} onChange={e => setNewBandMin(e.target.value)} placeholder="5000" /></div>
                        <div><Label>Max Salary ($)</Label><Input type="number" value={newBandMax} onChange={e => setNewBandMax(e.target.value)} placeholder="8000" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button type="button" onClick={() => setShowBandModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                    <button type="button" onClick={() => {
                      if (!newBandName || !newBandMin || !newBandMax) return;
                      onCreateSalaryBand(newBandName, Number(newBandMin), Number(newBandMax));
                      setNewBandName(''); setNewBandMin(''); setNewBandMax('');
                      setShowBandModal(false);
                    }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Band</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payroll Groups Management Tab */}
        {derivedPayrollTab === 'groups' && isHRorAdmin && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title text-slate-900">Payroll Groups</h3>
                <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setShowGroupModal(true)}>New Group</PrimaryBtn>
              </div>
              
              {payrollGroups.filter(g => g.companyId === selectedCompany.id).length === 0 ? (
                <div className="text-center py-8">
                  <i className="bi bi-folder fs-3xl text-slate-200 block mb-2"></i>
                  <p className="fs-sm text-slate-400 mb-2">No payroll groups yet</p>
                  <p className="text-[10px] text-slate-400">Create groups to batch process payroll for specific teams or departments.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payrollGroups.filter(g => g.companyId === selectedCompany.id).map(group => (
                    <div key={group.id} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="fs-sm fw-semibold text-slate-900">{group.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{group.description || 'No description'}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{group.employeeIds.length} employees</div>
                        </div>
                        <div className="flex gap-2">
                          <SecBtn onClick={() => {
                            setSelectedGroupId(group.id);
                            setPayrollTarget('group');
                            onNavigateView('payroll');
                          }}>Use for Payroll</SecBtn>
                          <button
                            onClick={async () => {
                              if (await modalConfirm('Delete this group?', { variant: 'danger' })) onDeletePayrollGroup(group.id);
                            }}
                            className="fs-xs text-rose-500 hover:text-rose-700 px-2 py-1"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {group.employeeIds.slice(0, 5).map(eid => {
                          const emp = localEmployees.find(e => e.id === eid);
                          return emp ? (
                            <span key={eid} className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-600">
                              {emp.firstName} {emp.lastName}
                            </span>
                          ) : null;
                        })}
                        {group.employeeIds.length > 5 && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-500">
                            +{group.employeeIds.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Create Group Modal */}
            {showGroupModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => {
                setShowGroupModal(false);
                setNewGroupName('');
                setNewGroupDesc('');
                setGroupEmployeeIds(new Set());
              }}>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <i className="bi bi-collection text-blue-600 fs-xs"></i>
                        </div>
                        <h3 className="fs-sm fw-bold text-slate-900">Create Payroll Group</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Batch process payroll by grouping specific employees together.</p>
                    </div>
                    <button type="button" onClick={() => {
                      setShowGroupModal(false);
                      setNewGroupName('');
                      setNewGroupDesc('');
                      setGroupEmployeeIds(new Set());
                    }} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      <i className="bi bi-x fs-xl"></i>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g., Engineering Team" />
                    </div>
                    <div>
                      <Label>Description (optional)</Label>
                      <Input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Brief description..." />
                    </div>
                    <div>
                      <Label>Select Employees</Label>
                      <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 mt-2">
                        {localEmployees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={groupEmployeeIds.has(emp.id)}
                              onChange={(e) => {
                                const next = new Set(groupEmployeeIds);
                                if (e.target.checked) next.add(emp.id);
                                else next.delete(emp.id);
                                setGroupEmployeeIds(next);
                              }}
                              className="accent-blue-600"
                            />
                            <span className="fs-xs text-slate-700">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">{emp.department}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button type="button" onClick={() => {
                      setShowGroupModal(false);
                      setNewGroupName('');
                      setNewGroupDesc('');
                      setGroupEmployeeIds(new Set());
                    }} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                    <button type="button" onClick={() => {
                      if (newGroupName && groupEmployeeIds.size > 0) {
                        onCreatePayrollGroup(newGroupName, newGroupDesc, Array.from(groupEmployeeIds));
                        setShowGroupModal(false);
                        setNewGroupName('');
                        setNewGroupDesc('');
                        setGroupEmployeeIds(new Set());
                      }
                    }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Group</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {effectivePayrollTab === 'slips' && (
          isHRorAdmin ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">Payslips — {activeSlipsPeriod}</h3>
                <div className="flex items-center gap-2">
                  <Select value={activeSlipsPeriod} onChange={e => setSlipsPeriod(e.target.value)}>
                    {companySlipPeriods.length === 0 && <option>{payMonth}</option>}
                    {companySlipPeriods.map(per => <option key={per} value={per}>{per}</option>)}
                  </Select>
                  <PrimaryBtn icon="bi bi-download" onClick={() => downloadCSV(`payslips-${selectedCompany.id}-${activeSlipsPeriod}`, ['Employee', 'Employee ID', 'Department', 'Period', 'Gross', 'Deductions', 'Net', 'Status'], payslips.filter(p => p.companyId === selectedCompany.id && p.period === activeSlipsPeriod).map(s => [getEmployeeNameById(employees, s.employeeId) || s.employeeName, s.employeeId, s.department, s.period, s.gross, s.deductions, s.net, s.status]))}>Export All</PrimaryBtn>
                </div>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === activeSlipsPeriod).map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{getEmployeeNameById(employees, slip.employeeId) || slip.employeeName}</td>
                      <td className="px-4 py-3 fs-xs text-slate-500">{slip.department}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-500">{slip.period}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); payslipModal.open(slip); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === activeSlipsPeriod).length === 0 && (
                    <EmptyRow cols={8} message={`No payroll run found for ${activeSlipsPeriod}. Go to "Run Payroll" to generate.`} />
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ── Employee Self-Service: own payslip only ── */
            (() => {
              const myEmp = localEmployees.find(e => e.email === selectedUser.email);
              const mySlips = myEmp ? payslips.filter(p => p.employeeId === myEmp.id && p.companyId === selectedCompany.id) : [];
              const activeSlip = mySlips.find(s => s.id === selectedSlipId) || mySlips[0] || null;

              if (!activeSlip) {
                return (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-10 text-center">
                    <i className="bi bi-receipt-cutoff fs-3xl text-slate-200 block mb-2"></i>
                    <p className="fs-sm text-slate-400">No payslips generated for you yet.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="section-title text-slate-900">My Payslip — {activeSlip.period}</h3>
                        <p className="data-value-small text-slate-400 mt-0.5">Status: {activeSlip.status}</p>
                      </div>
                      <PrimaryBtn icon="bi bi-download" onClick={() => downloadPDF(`payslip-${activeSlip.id}`, `Payslip — ${activeSlip.period}`, payslipPDFBody({
                        employeeName: activeSlip.employeeName,
                        employeeId: activeSlip.employeeId,
                        department: activeSlip.department,
                        period: activeSlip.period,
                        baseSalary: activeSlip.baseSalary || activeSlip.gross,
                        gross: activeSlip.gross,
                        deductions: activeSlip.deductions || 0,
                        net: activeSlip.net || 0,
                        status: activeSlip.status,
                        customBenefitsTotal: activeSlip.customBenefitsTotal || 0,
                        breakdown: activeSlip.breakdown,
                      }), selectedCompany)}>Download PDF</PrimaryBtn>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Earnings */}
                      <div>
                        <h4 className="data-value-small fw-semibold text-slate-500 uppercase tracking-wider mb-3">Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="data-value text-slate-600">Base Salary</span>
                            <span className="data-value font-sans tabular-nums text-slate-900">${(activeSlip.baseSalary || activeSlip.gross).toLocaleString()}</span>
                          </div>
                          {activeSlip.breakdown?.filter((b: any) => b.type === 'Benefit').map((b: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">{b.name}</span>
                              <span className="data-value font-sans tabular-nums text-emerald-600">+${b.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="table-cell-semibold text-slate-900">Total Gross Earnings</span>
                            <span className="table-cell-semibold font-sans tabular-nums text-slate-900">${activeSlip.gross.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h4 className="data-value-small fw-semibold text-slate-500 uppercase tracking-wider mb-3">Deductions</h4>
                        <div className="space-y-2">
                          {activeSlip.breakdown?.filter((b: any) => b.type === 'Tax').map((b: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">{b.name}</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${b.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="table-cell-semibold text-slate-900">Total Deductions</span>
                            <span className="table-cell-semibold font-sans tabular-nums text-rose-600">-${activeSlip.deductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Pay */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="table-cell-semibold text-emerald-800">Net Pay</div>
                          <div className="data-value-small text-emerald-600">Direct Deposited</div>
                        </div>
                        <div className="fs-2xl fw-bold font-sans tabular-nums text-emerald-700">${activeSlip.net.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Previous payslips list */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="section-title text-slate-900">All Available Payslips</h3>
                    </div>
                    <table className="w-full text-left">
                      <TableHead cols={[{ label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }, { label: 'Actions', right: true }]} />
                      <tbody className="divide-y divide-slate-100">
                        {mySlips.map(slip => (
                          <tr key={slip.id} className={`hover:bg-slate-50/40 transition-colors ${activeSlip.id === slip.id ? 'bg-slate-50' : ''}`}>
                            <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{slip.period}</td>
                            <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                            <td className="px-4 py-3 fs-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                            <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                            <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={e => { e.stopPropagation(); setSelectedSlipId(slip.id); }} className="text-blue-600 hover:text-blue-800 data-value-small fw-semibold cursor-pointer mr-3">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )
        )}

        {derivedPayrollTab === 'tax' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total Base Payroll" value={`$${totalPayroll.toLocaleString()}`} icon="bi bi-cash" color="text-emerald-600" />
            </div>
            {isHRorAdmin && onUpdatePayrollTaxConfig && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <h3 className="section-title text-slate-900 mb-4">Company Tax & Benefit Definitions</h3>

                {/* Custom Taxes */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="fs-sm fw-semibold text-slate-800 mb-3">Custom Taxes & Deductions</h4>
                  <div className="space-y-3">
                    {(draftCfg.customTaxes || []).map((t, idx) => (
                      <div key={t.id} className="flex gap-3 items-center">
                        <Input value={t.name} onChange={e => {
                          const newTaxes = [...(draftCfg.customTaxes || [])];
                          newTaxes[idx] = { ...newTaxes[idx], name: e.target.value };
                          setDraftCfg({ ...draftCfg, customTaxes: newTaxes });
                        }} placeholder="Tax Name" />
                        <Select value={t.type} onChange={e => {
                          const newTaxes = [...(draftCfg.customTaxes || [])];
                          newTaxes[idx] = { ...newTaxes[idx], type: e.target.value as 'Percentage'|'Fixed' };
                          setDraftCfg({ ...draftCfg, customTaxes: newTaxes });
                        }}>
                          <option value="Percentage">Percentage (%)</option>
                          <option value="Fixed">Fixed Amount ($)</option>
                        </Select>
                        <Input type="number" step="0.1" value={t.type === 'Percentage' ? +(t.value * 100).toFixed(2) : t.value} onChange={e => {
                          const newTaxes = [...(draftCfg.customTaxes || [])];
                          newTaxes[idx] = { ...newTaxes[idx], value: t.type === 'Percentage' ? Number(e.target.value) / 100 : Number(e.target.value) };
                          setDraftCfg({ ...draftCfg, customTaxes: newTaxes });
                        }} />
                        <button onClick={() => {
                          const newTaxes = [...(draftCfg.customTaxes || [])];
                          newTaxes.splice(idx, 1);
                          setDraftCfg({ ...draftCfg, customTaxes: newTaxes });
                        }} className="text-rose-500 hover:text-rose-700 p-2"><i className="bi bi-trash" /></button>
                      </div>
                    ))}
                    <button onClick={() => {
                      setDraftCfg({ ...draftCfg, customTaxes: [...(draftCfg.customTaxes || []), { id: Date.now().toString(), name: '', type: 'Fixed', value: 0 }] });
                    }} className="text-blue-600 fs-xs fw-semibold hover:underline">+ Add Custom Tax</button>
                  </div>
                </div>

                {/* Custom Benefits */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="fs-sm fw-semibold text-slate-800 mb-3">Custom Benefits</h4>
                  <div className="space-y-3">
                    {(draftCfg.customBenefits || []).map((b, idx) => (
                      <div key={b.id} className="flex gap-3 items-center">
                        <Input value={b.name} onChange={e => {
                          const newBens = [...(draftCfg.customBenefits || [])];
                          newBens[idx] = { ...newBens[idx], name: e.target.value };
                          setDraftCfg({ ...draftCfg, customBenefits: newBens });
                        }} placeholder="Benefit Name" />
                        <Select value={b.type} onChange={e => {
                          const newBens = [...(draftCfg.customBenefits || [])];
                          newBens[idx] = { ...newBens[idx], type: e.target.value as 'Percentage'|'Fixed' };
                          setDraftCfg({ ...draftCfg, customBenefits: newBens });
                        }}>
                          <option value="Percentage">Percentage (%)</option>
                          <option value="Fixed">Fixed Amount ($)</option>
                        </Select>
                        <Input type="number" step="0.1" value={b.type === 'Percentage' ? +(b.value * 100).toFixed(2) : b.value} onChange={e => {
                          const newBens = [...(draftCfg.customBenefits || [])];
                          newBens[idx] = { ...newBens[idx], value: b.type === 'Percentage' ? Number(e.target.value) / 100 : Number(e.target.value) };
                          setDraftCfg({ ...draftCfg, customBenefits: newBens });
                        }} />
                        <button onClick={() => {
                          const newBens = [...(draftCfg.customBenefits || [])];
                          newBens.splice(idx, 1);
                          setDraftCfg({ ...draftCfg, customBenefits: newBens });
                        }} className="text-rose-500 hover:text-rose-700 p-2"><i className="bi bi-trash" /></button>
                      </div>
                    ))}
                    <button onClick={() => {
                      setDraftCfg({ ...draftCfg, customBenefits: [...(draftCfg.customBenefits || []), { id: Date.now().toString(), name: '', type: 'Fixed', value: 0 }] });
                    }} className="text-blue-600 fs-xs fw-semibold hover:underline">+ Add Custom Benefit</button>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <PrimaryBtn icon="bi bi-check-lg" onClick={async () => { await onUpdatePayrollTaxConfig!(selectedCompany.id, draftCfg); }}>Save Rates</PrimaryBtn>
                </div>
              </div>
            )}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Tax & Deductions Register</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Base', right: true }, { label: 'Taxes', right: true }, { label: 'Benefits', right: true, colSpan: 3 }, { label: 'Net', right: true }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 8).map(emp => {
                    let totalCustomTax = 0;
                    let totalCustomBenefit = 0;
                    const assignedTaxes = emp.assignedTaxes ? (typeof emp.assignedTaxes === 'string' ? JSON.parse(emp.assignedTaxes) : emp.assignedTaxes) : [];
                    const assignedBenefits = emp.assignedBenefits ? (typeof emp.assignedBenefits === 'string' ? JSON.parse(emp.assignedBenefits) : emp.assignedBenefits) : [];
                    
                    if (Array.isArray(assignedTaxes)) {
                      assignedTaxes.forEach((taxId: string) => {
                        const taxConfig = (taxCfg.customTaxes || []).find((t: any) => t.id === taxId);
                        if (taxConfig) {
                          totalCustomTax += taxConfig.type === 'Percentage' ? (emp.salary * (taxConfig.value / 100)) : taxConfig.value;
                        }
                      });
                    }

                    if (Array.isArray(assignedBenefits)) {
                      assignedBenefits.forEach((benefitId: string) => {
                        const benefitConfig = (taxCfg.customBenefits || []).find((b: any) => b.id === benefitId);
                        if (benefitConfig) {
                          totalCustomBenefit += benefitConfig.type === 'Percentage' ? (emp.salary * (benefitConfig.value / 100)) : benefitConfig.value;
                        }
                      });
                    }

                    const net = Math.round(emp.salary + totalCustomBenefit - totalCustomTax);

                    return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-900 text-right">${emp.salary.toLocaleString()}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums text-rose-600 text-right">-${Math.round(totalCustomTax).toLocaleString()}</td>
                      <td colSpan={3} className="px-4 py-3 fs-xs font-sans tabular-nums text-emerald-600 text-right">+${Math.round(totalCustomBenefit).toLocaleString()}</td>
                      <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-emerald-700 text-right">${net.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); taxModal.open({ ...emp, fedTax: 0, stateTax: 0, ss: 0, medicare: 0, net }); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {derivedPayrollTab === 'overtime' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="OT Hours This Month" value={`${attendance.filter(a => a.companyId === selectedCompany.id && a.checkOut).length * 2}h`} icon="bi bi-clock-history" sub="Across all staff" accent />
              <StatCard label="OT Payout" value={`$${Math.round(attendance.filter(a => a.companyId === selectedCompany.id && a.checkOut).length * 2 * (totalPayroll / localEmployees.length / 160) * 1.5).toLocaleString()}`} icon="bi bi-currency-dollar" sub="1.5x premium rate" />
              <StatCard label="Employees with OT" value={attendance.filter(a => a.companyId === selectedCompany.id && a.checkOut).length} icon="bi bi-people" sub="Claimed overtime this month" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Overtime Log</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Regular Hours', right: true }, { label: 'OT Hours', right: true }, { label: 'OT Rate', right: true }, { label: 'OT Pay', right: true }, { label: 'Approved By' }, { label: 'Actions', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 4).map((emp, i) => {
                    const otHours = [12, 8, 18, 6][i] ?? 5;
                    const otRate = Math.round((emp.salary / 160) * 1.5);
                    return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-4 py-3 fs-xs text-slate-500">{emp.department}</td>
                        <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-700 text-right">160h</td>
                        <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-slate-900 text-right">{otHours}h</td>
                        <td className="px-4 py-3 fs-xs font-sans tabular-nums text-slate-600 text-right">${otRate}/hr</td>
                        <td className="px-4 py-3 fs-xs font-sans tabular-nums fw-bold text-emerald-700 text-right">${(otHours * otRate).toLocaleString()}</td>
                        <td className="px-4 py-3 fs-xs text-slate-500">HR Manager</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); otModal.open({ ...emp, otHours, otRate, otPay: otHours * otRate }); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          <i className="bi bi-eye text-[11px]"></i> View
                        </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      {payslipModal.selected && (
        <ViewModal 
          title={`Payslip — ${getEmployeeNameById(employees, payslipModal.selected.employeeId) || payslipModal.selected.employeeName}`} 
          subtitle={payslipModal.selected.period} 
          onClose={payslipModal.close}
          actions={
            <PrimaryBtn icon="bi bi-download" onClick={() => downloadPDF(`payslip-${payslipModal.selected?.id}`, `Payslip — ${payslipModal.selected?.period}`, payslipPDFBody({
              employeeName: getEmployeeNameById(employees, payslipModal.selected!.employeeId) || payslipModal.selected!.employeeName,
              employeeId: payslipModal.selected!.employeeId,
              department: payslipModal.selected!.department,
              period: payslipModal.selected!.period,
              baseSalary: payslipModal.selected!.baseSalary || payslipModal.selected!.gross,
              gross: payslipModal.selected!.gross,
              deductions: payslipModal.selected!.deductions,
              net: payslipModal.selected!.net,
              status: payslipModal.selected!.status,
              breakdown: payslipModal.selected!.breakdown,
            }), selectedCompany)}>
              Download PDF
            </PrimaryBtn>
          }
        >
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#0891b20d', border: '1px solid #0891b21f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#0891b2' }}><i className="bi bi-receipt fs-lg" /></div>
            <div className="min-w-0">
              <div className="fs-sm fw-bold text-slate-900 truncate">{getEmployeeNameById(employees, payslipModal.selected.employeeId) || payslipModal.selected.employeeName}</div>
              <div className="fs-xs text-slate-500 truncate">{payslipModal.selected.period}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Department', value: payslipModal.selected.department, icon: 'bi bi-collection' },
              { label: 'Period', value: payslipModal.selected.period, icon: 'bi bi-calendar-event' },
              { label: 'Status', value: payslipModal.selected.status, icon: 'bi bi-flag', section: 'Details' },
              { label: 'Gross', value: `$${payslipModal.selected.gross.toLocaleString()}`, icon: 'bi bi-cash', section: 'Earnings' },
              { label: 'Deductions', value: `-$${payslipModal.selected.deductions.toLocaleString()}`, icon: 'bi bi-dash-circle', section: 'Earnings' },
              { label: 'Net', value: `$${payslipModal.selected.net.toLocaleString()}`, icon: 'bi bi-wallet2', section: 'Earnings' },
            ].map(f => (
              <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                <div className="data-value fw-semibold text-slate-900">{f.value}</div>
              </div>
            ))}
          </div>
        </ViewModal>
      )}
      {taxModal.selected && (
        <ViewModal title={`${taxModal.selected.firstName} ${taxModal.selected.lastName}`} subtitle="Tax Breakdown" onClose={taxModal.close}>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#7c3aed0d', border: '1px solid #7c3aed1f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#7c3aed' }}><i className="bi bi-percent fs-lg" /></div>
            <div className="min-w-0">
              <div className="fs-sm fw-bold text-slate-900 truncate">{taxModal.selected.firstName} {taxModal.selected.lastName}</div>
              <div className="fs-xs text-slate-500 truncate">Tax Breakdown</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Gross (Salary)', value: `$${taxModal.selected.salary.toLocaleString()}`, icon: 'bi bi-cash' },
              { label: 'Federal Tax', value: `-$${taxModal.selected.fedTax.toLocaleString()}`, icon: 'bi bi-dash-circle', section: 'Deductions' },
              { label: 'State Tax', value: `-$${taxModal.selected.stateTax.toLocaleString()}`, icon: 'bi bi-dash-circle', section: 'Deductions' },
              { label: 'Social Security', value: `-$${taxModal.selected.ss.toLocaleString()}`, icon: 'bi bi-dash-circle', section: 'Deductions' },
              { label: 'Medicare', value: `-$${taxModal.selected.medicare.toLocaleString()}`, icon: 'bi bi-dash-circle', section: 'Deductions' },
              { label: 'Net', value: `$${taxModal.selected.net.toLocaleString()}`, icon: 'bi bi-wallet2', section: 'Net Pay' },
            ].map(f => (
              <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                <div className="data-value fw-semibold text-slate-900">{f.value}</div>
              </div>
            ))}
          </div>
        </ViewModal>
      )}
      {otModal.selected && (
        <ViewModal title={`${otModal.selected.firstName} ${otModal.selected.lastName}`} subtitle="Overtime Report" onClose={otModal.close}>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1" style={{ background: '#d977060d', border: '1px solid #d977061f' }}>
            <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: '#d97706' }}><i className="bi bi-clock-history fs-lg" /></div>
            <div className="min-w-0">
              <div className="fs-sm fw-bold text-slate-900 truncate">{otModal.selected.firstName} {otModal.selected.lastName}</div>
              <div className="fs-xs text-slate-500 truncate">Overtime Report</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Department', value: otModal.selected.department, icon: 'bi bi-collection' },
              { label: 'Regular Hours', value: '160h', icon: 'bi bi-hourglass-split', section: 'Hours' },
              { label: 'OT Hours', value: `${otModal.selected.otHours}h`, icon: 'bi bi-clock', section: 'Hours' },
              { label: 'OT Rate', value: `$${otModal.selected.otRate}/hr`, icon: 'bi bi-cash', section: 'Hours' },
              { label: 'OT Pay', value: `$${otModal.selected.otPay.toLocaleString()}`, icon: 'bi bi-wallet2', section: 'Summary' },
              { label: 'Approved By', value: 'HR Manager', icon: 'bi bi-person-check', section: 'Summary' },
            ].map(f => (
              <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                <div className="data-value fw-semibold text-slate-900">{f.value}</div>
              </div>
            ))}
          </div>
        </ViewModal>
      )}
      </div>
    );
  }
};
