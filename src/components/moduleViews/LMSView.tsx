import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';

import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';

export const LMSView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  type LmsTab = 'courses' | 'quiz' | 'progress';
  const lmsTabFromView = (): LmsTab =>
    activeView === 'lms-quizzes' ? 'quiz'
      : activeView === 'lms-progress' ? 'progress'
        : 'courses';
  const [lmsTab, setLmsTab] = useState<LmsTab>(lmsTabFromView());
  useEffect(() => { setLmsTab(lmsTabFromView()); }, [activeView]);
  const lmsTabs: { id: LmsTab; label: string }[] = [
    { id: 'courses', label: 'Courses' },
    { id: 'quiz', label: 'Quizzes' },
    { id: 'progress', label: 'Progress' },
  ];
  const courses = [
    { id: 'C01', title: 'ISO 9001 Quality Management', level: 'Intermediate', duration: '4h 30m', enrolled: 12, completion: 78, cat: 'Compliance' },
    { id: 'C02', title: 'Workplace Safety & OSHA', level: 'Beginner', duration: '2h 15m', enrolled: 28, completion: 91, cat: 'Safety' },
    { id: 'C03', title: 'Advanced Excel for Finance', level: 'Advanced', duration: '6h 00m', enrolled: 7, completion: 45, cat: 'Finance' },
    { id: 'C04', title: 'ERP System Administrator', level: 'Advanced', duration: '8h 00m', enrolled: 4, completion: 30, cat: 'IT' },
  ];
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const progressModal = useRowModal<{ emp: typeof localEmployees[0]; course: typeof courses[0]; prog: number }>();
  const quizQuestions = [
    { id: 'q1', q: 'What does ISO stand for?', options: ['International Standards Org', 'Internal Safety Operations', 'International Organization for Standardization', 'Industrial Safety Order'], correct: 'International Organization for Standardization' },
    { id: 'q2', q: 'OSHA stands for:', options: ['Occupational Safety & Health Administration', 'Office Safety Hazard Assessment', 'Operational Standards & Health Act', 'None of the above'], correct: 'Occupational Safety & Health Administration' },
    { id: 'q3', q: 'A corrective action is required when:', options: ['A product is shipped', 'A non-conformance is detected', 'A new employee is hired', 'Payroll is processed'], correct: 'A non-conformance is detected' },
  ];

  return (
    <div>
      <PageHeader title="Learning Management System" subtitle="Course library, employee training progress, quizzes and certification issuance." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {lmsTabs.map(t => (
          <button key={t.id} onClick={() => setLmsTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${lmsTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      {lmsTab === 'courses' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div><div className="text-sm font-bold text-slate-900">{c.title}</div><div className="data-value text-slate-500 mt-0.5">{c.cat} · {c.level} · {c.duration}</div></div>
                <Badge label={c.cat} variant="info" />
              </div>
              <div className="mb-2 flex justify-between data-value text-slate-500"><span>{c.enrolled} enrolled</span><span>{c.completion}% avg completion</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${c.completion}%` }} /></div>
              <button onClick={() => setLmsTab('quiz')} className="mt-4 w-full text-xs font-semibold border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">Start Course</button>
            </div>
          ))}
        </div>
      )}
      {lmsTab === 'quiz' && (
        <div className="max-w-xl">
          {quizScore !== null ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 text-center">
              <div className={`text-4xl font-bold font-sans tabular-nums mb-2 ${quizScore >= 2 ? 'text-emerald-600' : 'text-rose-600'}`}>{quizScore}/{quizQuestions.length}</div>
              <div className="text-sm font-bold text-slate-900 mb-1">{quizScore >= 2 ? '🎉 Passed!' : '❌ Not Passed'}</div>
              <p className="text-xs text-slate-500 mb-5">{quizScore >= 2 ? 'Certificate will be generated and added to your profile.' : 'Review the course material and try again.'}</p>
              <button onClick={() => { setQuizScore(null); setQuizAnswers({}); }} className="text-xs font-semibold bg-slate-900 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Retake Quiz</button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">ISO 9001 Quality Management — Quiz</h3>
              <div className="space-y-6">
                {quizQuestions.map((q, qi) => (
                  <div key={q.id}>
                    <div className="text-xs font-semibold text-slate-900 mb-3">{qi + 1}. {q.q}</div>
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === opt ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name={q.id} value={opt} onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))} className="shrink-0" />
                          <span className="text-xs text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <PrimaryBtn icon="bi bi-send" onClick={() => {
                  const score = quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;
                  setQuizScore(score);
                }}>Submit Quiz</PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      )}
      {lmsTab === 'progress' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Employee' }, { label: 'Course' }, { label: 'Progress', right: true }, { label: 'Status' }]} />
            <tbody className="divide-y divide-slate-100">
              {localEmployees.slice(0, 6).map((emp, i) => {
                const course = courses[i % courses.length];
                const prog = [100, 65, 30, 80, 45, 100][i] || 50;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 cursor-pointer" onClick={() => progressModal.open({ emp, course, prog })}>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{course.title}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${prog}%` }} /></div><span className="text-[10px] font-sans tabular-nums text-slate-500 w-8">{prog}%</span></div></td>
                    <td className="px-4 py-3"><Badge label={prog === 100 ? 'Completed' : 'In Progress'} variant={prog === 100 ? 'success' : 'info'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {progressModal.selected && (
        <ViewModal title={`${progressModal.selected.emp.firstName} ${progressModal.selected.emp.lastName}`} subtitle={progressModal.selected.course.title} onClose={progressModal.close}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Employee', value: `${progressModal.selected.emp.firstName} ${progressModal.selected.emp.lastName}` },
              { label: 'Department', value: progressModal.selected.emp.department },
              { label: 'Course', value: progressModal.selected.course.title },
              { label: 'Category', value: progressModal.selected.course.cat },
              { label: 'Level', value: progressModal.selected.course.level },
              { label: 'Duration', value: progressModal.selected.course.duration },
              { label: 'Progress', value: `${progressModal.selected.prog}%` },
              { label: 'Status', value: progressModal.selected.prog === 100 ? 'Completed' : 'In Progress' },
            ].map(f => (
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value font-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-500">Completion</span><span className="font-bold text-slate-900">{progressModal.selected.prog}%</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${progressModal.selected.prog}%` }} /></div>
          </div>
        </ViewModal>
      )}
    </div>
  );
};
