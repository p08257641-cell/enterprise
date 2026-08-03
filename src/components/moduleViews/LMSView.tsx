import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';

import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isHRRole } from '../../permissions';
import { LMSCourse } from '../../types';

export const LMSView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, employees, lmsCourses = [], onAddLmsCourse } = props;

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
  const quizQuestions: { id: string; q: string; options: string[]; correct: string; courseName?: string }[] = [];

  return (
    <div>
      <PageHeader title="Learning Management System" subtitle="Course library, employee training progress, quizzes and certification issuance." />
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {lmsTabs.map(t => (
          <button key={t.id} onClick={() => setLmsTab(t.id)} className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${lmsTab === t.id ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
        ))}
      </div>
      {lmsTab === 'courses' && (
        <div className="space-y-4">
          {canManage && <AddCourseForm selectedCompany={selectedCompany} onAddLmsCourse={onAddLmsCourse} />}
          <div className="grid gap-4 sm:grid-cols-2">
            {lmsCourses.filter(c => !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase())).map(c => {
              const levelColor = c.level === 'Advanced' ? 'from-rose-500 to-orange-500' : c.level === 'Intermediate' ? 'from-amber-500 to-yellow-400' : 'from-emerald-500 to-teal-400';
              const levelBg = c.level === 'Advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' : c.level === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
              const levelIcon = c.level === 'Advanced' ? 'bi-mortarboard' : c.level === 'Intermediate' ? 'bi-book-half' : 'bi-book';
              return (
                <div key={c.id} className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="fs-sm fw-bold text-slate-900 group-hover:text-indigo-900 transition-colors truncate">{c.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] fw-bold px-2 py-0.5 rounded-full border ${levelBg}`}><i className={`bi ${levelIcon} text-[9px]`}></i> {c.level}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{c.duration}</span>
                      </div>
                    </div>
                    <Badge label={c.category} variant="info" />
                  </div>
                  <div className="mb-2.5 flex justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><i className="bi bi-people text-[10px] opacity-60"></i> {c.enrolled} enrolled</span>
                    <span className="fw-bold text-slate-700 font-sans tabular-nums">{c.completion}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${levelColor} transition-all duration-700`} style={{ width: `${c.completion}%` }} />
                  </div>
                  <button onClick={() => setLmsTab('quiz')} className="mt-4 w-full fs-xs fw-semibold border border-slate-200 text-slate-700 py-2.5 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2">
                    <i className="bi bi-play-circle text-[13px]"></i> Start Course
                  </button>
                </div>
              );
            })}
            {lmsCourses.length === 0 && (
              <div className="sm:col-span-2 text-center py-16">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-400 mb-4"><i className="bi bi-journal-bookmark text-2xl"></i></div>
                <div className="fs-sm fw-bold text-slate-900 mb-1">No courses available yet</div>
                <p className="fs-xs text-slate-400">Create your first course to start tracking employee learning progress.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {lmsTab === 'quiz' && (
        <div className="max-w-xl">
          {quizScore !== null ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 text-center">
              <div className={`fs-4xl fw-bold font-sans tabular-nums mb-2 ${quizScore >= 2 ? 'text-emerald-600' : 'text-rose-600'}`}>{quizScore}/{quizQuestions.length}</div>
              <div className="fs-sm fw-bold text-slate-900 mb-1">{quizScore >= 2 ? '🎉 Passed!' : '❌ Not Passed'}</div>
              <p className="fs-xs text-slate-500 mb-5">{quizScore >= 2 ? 'Certificate will be generated and added to your profile.' : 'Review the course material and try again.'}</p>
              <button onClick={() => { setQuizScore(null); setQuizAnswers({}); }} className="fs-xs fw-semibold bg-slate-900 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">Retake Quiz</button>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
              <h3 className="section-title text-slate-500 mb-5">{quizQuestions[0]?.courseName || 'Course'} — Quiz</h3>
              <div className="space-y-6">
                {quizQuestions.map((q, qi) => (
                  <div key={q.id}>
                    <div className="fs-xs fw-semibold text-slate-900 mb-3">{qi + 1}. {q.q}</div>
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === opt ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name={q.id} value={opt} onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))} className="shrink-0" />
                          <span className="fs-xs text-slate-700">{opt}</span>
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
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 text-center">
              <i className="bi bi-question-circle text-slate-300 fs-3xl mb-3 block"></i>
              <div className="fs-sm fw-bold text-slate-900 mb-1">No Quiz Available</div>
              <p className="fs-xs text-slate-500">Quizzes will appear here once a course with a quiz is added.</p>
            </div>
          )}
        </div>
      )}
      {lmsTab === 'progress' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <TableHead cols={[{ label: 'Employee' }, { label: 'Course' }, { label: 'Progress', right: true }, { label: 'Status' }, { label: 'Actions', right: true }]} />
            <tbody className="divide-y divide-slate-100">
              {lmsCourses.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center fs-xs text-slate-400">No courses available. Add courses to track employee progress.</td></tr>
              ) : (
                localEmployees.filter(emp => !searchTerm || `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6).map((emp, i) => {
                  const course = lmsCourses[i % lmsCourses.length] || { title: 'No course', category: 'General', level: 'Beginner', duration: '--' };
                  const progressValues = [85, 62, 100, 40, 15, 0];
                  const prog = progressValues[i] ?? 0;
                  const progColor = prog === 100 ? 'from-emerald-500 to-teal-400' : prog >= 60 ? 'from-indigo-500 to-purple-500' : prog > 0 ? 'from-amber-500 to-yellow-400' : 'bg-slate-200';
                  const statusLabel = prog === 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Not Started';
                  const statusVariant = prog === 100 ? 'success' : prog > 0 ? 'info' : 'default';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 fs-xs fw-semibold text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 fs-xs text-slate-600">{course.title}</td>
                      <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${prog > 0 ? `bg-gradient-to-r ${progColor}` : 'bg-slate-200'}`} style={{ width: `${prog}%` }} /></div><span className="text-[10px] font-sans tabular-nums fw-bold text-slate-700 w-8">{prog}%</span></div></td>
                      <td className="px-4 py-3"><Badge label={statusLabel} variant={statusVariant as any} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); progressModal.open({ emp, course, prog }); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                        >
                          <i className="bi bi-eye text-[11px]"></i> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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
              <div key={f.label}><div className="data-value-small text-slate-500">{f.label}</div><div className="data-value fw-semibold text-slate-900">{f.value}</div></div>
            ))}
          </div>
          <div>
            <div className="flex justify-between fs-xs mb-1.5"><span className="text-slate-500">Completion</span><span className="fw-bold text-slate-900">{progressModal.selected.prog}%</span></div>
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
      <button onClick={() => setOpen(true)} className="w-full sm:w-auto text-[11px] fw-semibold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all inline-flex items-center gap-1.5">
        <i className="bi bi-plus-lg fs-xs"></i> Add Course
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide">Add LMS Course</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="bi bi-x-lg fs-sm"></i></button>
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
