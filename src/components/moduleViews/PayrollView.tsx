import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isSuperAdminRole, isHRRole } from '../../permissions';

export const PayrollView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  const isAdmin = isAdminRole(selectedUser.activeRole);
  const isSuperAdmin = isSuperAdminRole(selectedUser.activeRole);
  const isHR = isHRRole(selectedUser.activeRole);
  const isHRorAdmin = isAdmin || isHR;

  // payroll tab is derived from activeView (see below inside the payroll block)
  const [payrollStep, setPayrollStep] = useState<'idle' | 'review' | 'done'>('idle');
  const [paySalaryStructure, setPaySalaryStructure] = useState('Standard');
  const [payMonth, setPayMonth] = useState('July 2026');
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);

  if (activeView.startsWith('payroll')) {
    const hasPayrollModule = selectedCompany.activeModules.includes('Payroll');

    if (!hasPayrollModule) {
      return (
        <div className="space-y-6">
          <PageHeader title="Payroll & Salary Management" subtitle="Process monthly payroll, manage salary structures, deductions and generate payslips." />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Payroll Module Not Available</h3>
            <p className="text-xs text-amber-600 mb-4">Your company has not subscribed to the Payroll module. Contact your administrator to enable payroll features.</p>
            <p className="text-xs text-slate-500">Employee salary data is available in the Employee Directory.</p>
          </div>
        </div>
      );
    }

    const isEmployeeRole = selectedUser.activeRole === 'Employee';
    // Safety check: Employees can only view slips
    const derivedPayrollTab: 'run' | 'slips' | 'tax' | 'overtime' =
      activeView === 'payroll-slips' ? 'slips'
        : activeView === 'payroll-tax' ? 'tax'
          : activeView === 'payroll-overtime' ? 'overtime'
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
            <StatCard label="Next Run" value="Aug 1, 2026" icon="bi bi-calendar" sub="Scheduled payroll date" />
          </div>
        )}

        {effectivePayrollTab === 'run' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">Run Payroll</h3>
              {payrollStep === 'idle' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Payroll Period</Label><Select value={payMonth} onChange={e => setPayMonth(e.target.value)}><option>July 2026</option><option>August 2026</option></Select></div>
                    <div><Label>Salary Structure</Label><Select value={paySalaryStructure} onChange={e => setPaySalaryStructure(e.target.value)}><option>Standard</option><option>Executive</option><option>Contractor</option></Select></div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Gross Payroll</span><span className="font-sans tabular-nums font-bold text-slate-900">${totalPayroll.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Tax Withholding (20%)</span><span className="font-sans tabular-nums text-rose-600">-${(totalPayroll * 0.2).toLocaleString()}</span></div>
                    <div className="flex justify-between table-cell mb-2"><span className="text-slate-600">Benefits / Deductions</span><span className="table-cell-mono text-rose-600">-${(totalPayroll * 0.05).toLocaleString()}</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between table-cell font-bold"><span className="text-slate-900">Net Payroll Disbursement</span><span className="table-cell-mono text-slate-900">${(totalPayroll * 0.75).toLocaleString()}</span></div>
                  </div>
                  <PrimaryBtn icon="bi bi-play-circle" onClick={() => setPayrollStep('review')}>Review & Process Payroll</PrimaryBtn>
                </div>
              )}
              {payrollStep === 'review' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>Confirm Payroll Run:</strong> {localEmployees.length} employees · Period: {payMonth} · Net: ${(totalPayroll * 0.75).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <PrimaryBtn icon="bi bi-check-circle" onClick={() => {
                      onRunPayroll(payMonth, paySalaryStructure);
                      setPayrollStep('done');
                    }}>Confirm & Disburse</PrimaryBtn>
                    <SecBtn onClick={() => setPayrollStep('idle')}>Cancel</SecBtn>
                  </div>
                </div>
              )}
              {payrollStep === 'done' && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <i className="bi bi-check-circle-fill text-emerald-600 text-2xl block mb-2"></i>
                  <div className="text-sm font-bold text-emerald-800">Payroll Processed Successfully!</div>
                  <div className="text-xs text-emerald-600 mt-1">{localEmployees.length} payslips generated · {payMonth} · Net ${(totalPayroll * 0.75).toLocaleString()} disbursed</div>
                  <button onClick={() => setPayrollStep('idle')} className="mt-4 text-xs font-semibold text-emerald-700 underline cursor-pointer">Run New Payroll</button>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="section-title text-slate-500 mb-4">Salary Bands</h3>
              <div className="space-y-3">
                {[{ band: 'Executive', range: '$12,000 – $25,000', count: 2 }, { band: 'Senior', range: '$8,000 – $12,000', count: 3 }, { band: 'Mid-level', range: '$5,000 – $8,000', count: 8 }, { band: 'Junior', range: '$3,000 – $5,000', count: 6 }].map(b => (
                  <div key={b.band} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center"><span className="table-cell-semibold text-slate-800">{b.band}</span><span className="data-value-small font-sans tabular-nums text-slate-400">{b.count} employees</span></div>
                    <div className="data-value text-slate-500 mt-0.5">{b.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {effectivePayrollTab === 'slips' && (
          isHRorAdmin ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title text-slate-900">Payslips — {payMonth}</h3>
                <PrimaryBtn icon="bi bi-download">Export All</PrimaryBtn>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }]} />
                <tbody className="divide-y divide-slate-100">
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === payMonth).map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{getEmployeeNameById(employees, slip.employeeId) || slip.employeeName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{slip.department}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-500">{slip.period}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                    </tr>
                  ))}
                  {payslips.filter(p => p.companyId === selectedCompany.id && p.period === payMonth).length === 0 && (
                    <EmptyRow cols={7} message={`No payroll run found for ${payMonth}. Go to "Run Payroll" to generate.`} />
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
                    <i className="bi bi-receipt-cutoff text-3xl text-slate-200 block mb-2"></i>
                    <p className="text-sm text-slate-400">No payslips generated for you yet.</p>
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
                      <PrimaryBtn icon="bi bi-download">Download PDF</PrimaryBtn>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Earnings */}
                      <div>
                        <h4 className="data-value-small font-semibold text-slate-500 uppercase tracking-wider mb-3">Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="data-value text-slate-600">Base Salary</span>
                            <span className="data-value font-sans tabular-nums text-slate-900">${(activeSlip.baseSalary || activeSlip.gross).toLocaleString()}</span>
                          </div>
                          {activeSlip.overtimePay !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Overtime</span>
                              <span className="data-value font-sans tabular-nums text-slate-900">${activeSlip.overtimePay.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.allowances !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Allowances</span>
                              <span className="data-value font-sans tabular-nums text-slate-900">${activeSlip.allowances.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="table-cell-semibold text-slate-900">Total Gross Earnings</span>
                            <span className="table-cell-semibold font-sans tabular-nums text-slate-900">${activeSlip.gross.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h4 className="data-value-small font-semibold text-slate-500 uppercase tracking-wider mb-3">Deductions</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="data-value text-slate-600">Tax Withholding</span>
                            <span className="data-value font-sans tabular-nums text-rose-600">-${(activeSlip.tax || Math.round(activeSlip.gross * 0.12)).toLocaleString()}</span>
                          </div>
                          {activeSlip.socialSec !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Social Security</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.socialSec.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.medicare !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Medicare</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.medicare.toLocaleString()}</span>
                            </div>
                          )}
                          {activeSlip.healthIns !== undefined && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="data-value text-slate-600">Health Insurance</span>
                              <span className="data-value font-sans tabular-nums text-rose-600">-${activeSlip.healthIns.toLocaleString()}</span>
                            </div>
                          )}
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
                        <div className="text-2xl font-bold font-sans tabular-nums text-emerald-700">${activeSlip.net.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Previous payslips list */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="section-title text-slate-900">All Available Payslips</h3>
                    </div>
                    <table className="w-full text-left">
                      <TableHead cols={[{ label: 'Period' }, { label: 'Gross', right: true }, { label: 'Deductions', right: true }, { label: 'Net', right: true }, { label: 'Status' }, { label: '' }]} />
                      <tbody className="divide-y divide-slate-100">
                        {mySlips.map(slip => (
                          <tr key={slip.id} className={`hover:bg-slate-50/40 transition-colors ${activeSlip.id === slip.id ? 'bg-slate-50' : ''}`}>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-900">{slip.period}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${slip.gross.toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${slip.deductions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">${slip.net.toLocaleString()}</td>
                            <td className="px-4 py-3"><Badge label={slip.status} variant="success" /></td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => setSelectedSlipId(slip.id)} className="text-blue-600 hover:text-blue-800 data-value-small font-semibold cursor-pointer mr-3">View Details</button>
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
              <StatCard label="Total Tax Withheld" value={`$${(totalPayroll * 0.2).toLocaleString()}`} icon="bi bi-building-check" sub="This month's PAYE/FICA" color="text-rose-600" />
              <StatCard label="Employer NI/SS" value={`$${(totalPayroll * 0.065).toLocaleString()}`} icon="bi bi-shield-check" sub="Employer contributions" />
              <StatCard label="Pension / 401k" value={`$${(totalPayroll * 0.04).toLocaleString()}`} icon="bi bi-piggy-bank" sub="Retirement deductions" accent />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Tax & Deductions Register</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Gross', right: true }, { label: 'Federal Tax', right: true }, { label: 'State Tax', right: true }, { label: 'Social Sec.', right: true }, { label: 'Medicare', right: true }, { label: 'Net', right: true }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 8).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-900 text-right">${emp.salary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-600 text-right">-${Math.round(emp.salary * 0.12).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-500 text-right">-${Math.round(emp.salary * 0.05).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-500 text-right">-${Math.round(emp.salary * 0.062).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums text-rose-400 text-right">-${Math.round(emp.salary * 0.0145).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-emerald-700 text-right">${Math.round(emp.salary * 0.75).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {derivedPayrollTab === 'overtime' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
              <StatCard label="OT Hours This Month" value="142h" icon="bi bi-clock-history" sub="Across all staff" accent />
              <StatCard label="OT Payout" value={`$${(totalPayroll * 0.08).toLocaleString()}`} icon="bi bi-currency-dollar" sub="1.5x premium rate" />
              <StatCard label="Employees with OT" value={Math.min(4, localEmployees.length)} icon="bi bi-people" sub="Claimed overtime this month" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="section-title text-slate-900">Overtime Log</h3></div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'Employee' }, { label: 'Dept' }, { label: 'Regular Hours', right: true }, { label: 'OT Hours', right: true }, { label: 'OT Rate', right: true }, { label: 'OT Pay', right: true }, { label: 'Approved By' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 4).map((emp, i) => {
                    const otHours = [12, 8, 18, 6][i] ?? 5;
                    const otRate = Math.round((emp.salary / 160) * 1.5);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{emp.department}</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-700 text-right">160h</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-slate-900 text-right">{otHours}h</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums text-slate-600 text-right">${otRate}/hr</td>
                        <td className="px-4 py-3 text-xs font-sans tabular-nums font-bold text-emerald-700 text-right">${(otHours * otRate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">HR Manager</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
};
