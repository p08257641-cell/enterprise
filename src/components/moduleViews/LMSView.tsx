import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';

import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isHRRole } from '../../permissions';
import { LMSCourse } from '../../types';

export const LMSView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, lmsCourses, onAddLmsCourse } = props;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const canManage = isAdminRole(selectedUser.activeRole) || isHRRole(selectedUser.activeRole);

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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const progressModal = useRowModal<{ emp: typeof localEmployees[0]; course: { title: string; category: string; level: string; duration: string }; prog: number }>();
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
        <div className="space-y-4">
          {canManage && <AddCourseForm selectedCompany={selectedCompany} onAddLmsCourse={onAddLmsCourse} />}
          <div className="grid gap-4 sm:grid-cols-2">
            {lmsCourses.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div><div className="text-sm font-bold text-slate-900">{c.title}</div><div className="data-value text-slate-500 mt-0.5">{c.category} · {c.level} · {c.duration}</div></div>
                  <Badge label={c.category} variant="info" />
                </div>
                <div className="mb-2 flex justify-between data-value text-slate-500"><span>{c.enrolled} enrolled</span><span>{c.completion}% avg completion</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{ width: `${c.completion}%` }} /></div>
                <button onClick={() => setLmsTab('quiz')} className="mt-4 w-full text-xs font-semibold border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">Start Course</button>
              </div>
            ))}
            {lmsCourses.length === 0 && <div className="sm:col-span-2 text-center text-xs text-slate-400 py-8">No courses available yet.</div>}
          </div>
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
                const course = lmsCourses[i % (lmsCourses.length || 1)] || { title: 'No course', category: 'General', level: 'Beginner', duration: '--' };
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
              { label: 'Category', value: progressModal.selected.course.category },
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

const AddCourseForm: React.FC<{ selectedCompany: { id: string }, onAddLmsCourse: (c: Omit<LMSCourse, 'id' | 'enrolled' | 'completion' | 'createdAt'>) => void }> = ({ selectedCompany, onAddLmsCourse }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [level, setLevel] = useState('Beginner');
  const [duration, setDuration] = useState('1h 00m');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onAddLmsCourse({ companyId: selectedCompany.id, title: title.trim(), category, level, duration, createdBy: 'Admin' });
      setTitle(''); setCategory('General'); setLevel('Beginner'); setDuration('1h 00m'); setOpen(false);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full sm:w-auto text-[11px] font-semibold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all inline-flex items-center gap-1.5">
        <i className="bi bi-plus-lg text-xs"></i> Add Course
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Add LMS Course</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="bi bi-x-lg text-sm"></i></button>
        </div>
        <div className="space-y-3 p-5">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label>
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {['General', 'Compliance', 'Safety', 'Finance', 'IT', 'HR'].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div><Label>Level</Label>
              <Select value={level} onChange={e => setLevel(e.target.value)}>
                {['Beginner', 'Intermediate', 'Advanced'].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Duration</Label><Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 2h 30m" /></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <SecBtn onClick={() => setOpen(false)}>Cancel</SecBtn>
          <PrimaryBtn onClick={submit} disabled={busy || !title.trim()}>{busy ? 'Creating…' : 'Create Course'}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};
