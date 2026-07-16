/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HR & Employee Directory — Full premium module for all non-SuperAdmin roles.
 * HR Managers / Admins: full workforce management tools
 * Employees: self-service portal (own records, leave, attendance, OKRs)
 */

import React, { useState } from 'react';
import { ViewModal } from './moduleViews/shared';
import { Company, User, Employee, Department, Branch, LeaveRequest, AttendanceRecord, OKRRecord, OnboardingRecord } from '../types';
import { isAdminRole, isHRRole } from '../permissions';
import { downloadCSV } from '../utils/export';
import { modalAlert, modalConfirm } from '../utils/modal';

interface HRModuleProps {
  activeView: string;
  selectedCompany: Company;
  selectedUser: User;
  employees: Employee[];
  departments: Department[];
  branches: Branch[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  okrs: OKRRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeave: (input: { employeeId: string; employeeName: string; department: string; leaveType: string; startDate: string; endDate: string; reason: string; days: number }) => void;
  onClockIn: (mode?: string) => void;
  onClockOut: () => void;
  onAddOKR: (input: { employeeId: string; employeeName: string; department: string; title: string; keyResult: string; period: string }) => void;
  onAddDepartment: (dept: Omit<Department, 'id' | 'employeeCount'>) => void;
  onUpdateDepartment: (id: string, updates: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
  onboardings: OnboardingRecord[];
  onAddOnboarding: (record: Omit<OnboardingRecord, 'id'>) => void;
  onUpdateOnboarding: (id: string, updates: Partial<OnboardingRecord>) => void;
  onDeleteOnboarding: (id: string) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onUpdateOKRProgress: (id: string, progress: number) => void;
  onNavigateView: (view: string) => void;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const Badge = ({ label, variant = 'default' }: {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';
}) => {
  const s = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s[variant]}`}>
      {label}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon, accent = false, color = '' }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean; color?: string;
}) => (
  <div className={`rounded-xl border p-5 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-all ${accent ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-semibold uppercase tracking-wider ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <i className={`${icon} text-sm ${accent ? 'text-slate-500' : 'text-slate-300'}`}></i>
    </div>
    <div className={`text-2xl font-bold tracking-tight tabular-nums ${accent ? 'text-white' : color || 'text-slate-900'}`}>{value}</div>
    {sub && <p className={`text-xs leading-snug ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
    <div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 ${props.className ?? ''}`} />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 ${props.className ?? ''}`} />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{children}</label>
);

const PrimaryBtn = ({ onClick, icon, children, type = 'button' }: {
  onClick?: () => void; icon?: string; children: React.ReactNode; type?: 'button' | 'submit';
}) => (
  <button type={type} onClick={onClick} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
    {icon && <i className={`${icon} text-xs`}></i>}{children}
  </button>
);

const SecBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer">
    {children}
  </button>
);

// ── Avatar helper ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'from-violet-500 to-violet-700',
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-slate-600 to-slate-800',
];

const Avatar = ({ first, last, index = 0, size = 'md' }: {
  first: string; last: string; index?: number; size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center font-bold text-white shrink-0`}>
      {first[0]}{last[0]}
    </div>
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = 'bg-slate-800' }: { value: number; color?: string }) => (
  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HR MODULE
// ══════════════════════════════════════════════════════════════════════════════

export const HRModule: React.FC<HRModuleProps> = ({
  activeView, selectedCompany, selectedUser,
  employees, departments, branches,
  leaves, attendance, okrs,
  onAddEmployee, onApproveLeave, onRejectLeave, onAddLeave,
  onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onAddDepartment, onUpdateDepartment, onDeleteDepartment, onboardings, onAddOnboarding, onUpdateOnboarding, onDeleteOnboarding, onUpdateEmployee, onNavigateView,
}) => {
  const userRole = selectedUser.activeRole || selectedUser.role;
  const isAdmin = isAdminRole(userRole);
  const isHR = isHRRole(userRole);
  const isDeptHead = userRole === 'Department Head';
  const isHRorAdmin = isAdmin || isHR;
  const isEmployee = !isHRorAdmin && !isDeptHead;

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  // Check if HR module is subscribed
  const hasHRModule = selectedCompany.activeModules.includes('HR');

  // Advanced HR views require HR module subscription
  const advancedHRViews = ['hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding', 'hr-performance', 'hr-exit'];
  if (!hasHRModule && advancedHRViews.includes(activeView)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="HR Module Required" subtitle="This feature requires an HR module subscription." />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <i className="bi bi-exclamation-triangle text-amber-500 text-3xl mb-3 block"></i>
          <h3 className="text-sm font-semibold text-amber-800 mb-2">HR Module Not Available</h3>
          <p className="text-xs text-amber-600 mb-4">Your company has not subscribed to the HR module. Contact your administrator to enable HR features.</p>
          <p className="text-xs text-slate-500">Basic employee directory is available without HR subscription.</p>
        </div>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [colleaguePopup, setColleaguePopup] = useState<Employee | null>(null);
  const [myProfileEdit, setMyProfileEdit] = useState(false);

  // Hire form
  const [hrFirst, setHrFirst] = useState('');
  const [hrLast, setHrLast] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPhone, setHrPhone] = useState('');
  const [hrDept, setHrDept] = useState('Engineering');
  const [hrRole, setHrRole] = useState('');
  const [hrBranch, setHrBranch] = useState('HQ');
  const [hrSalary, setHrSalary] = useState('6500');
  const [hrType, setHrType] = useState('Full-time');
  const [hrStartDate, setHrStartDate] = useState('');
  const [hireSuccess, setHireSuccess] = useState<string | null>(null);

  // Leave
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Find the currently logged-in user's employee record
  const myEmpRecord = localEmployees.find(e => e.email === selectedUser.email) || localEmployees[0] || null;
  const companyLeaves = leaves.filter(l => l.companyId === selectedCompany.id);
  const [leaveFilter, setLeaveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const filteredLeaves = leaveFilter === 'All' ? companyLeaves : companyLeaves.filter(l => l.status === leaveFilter);
  const myLeaves = myEmpRecord ? companyLeaves.filter(l => l.employeeId === myEmpRecord.id) : [];
  const companyAttendance = attendance.filter(a => a.companyId === selectedCompany.id);
  const companyOkrs = okrs.filter(o => o.companyId === selectedCompany.id);
  const myOkrs = myEmpRecord ? companyOkrs.filter(o => o.employeeId === myEmpRecord.id) : [];

  // Exit
  const [exitEmp, setExitEmp] = useState('');
  const [exitType, setExitType] = useState<'Resignation' | 'Termination' | 'Retirement'>('Resignation');
  const [exitDate, setExitDate] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [exitSuccess, setExitSuccess] = useState(false);

  // OKR / Department / Edit Employee / Vacancy modals
  const [showOkrModal, setShowOkrModal] = useState(false);
  const [okrTitle, setOkrTitle] = useState('');
  const [okrKeyResult, setOkrKeyResult] = useState('');
  const [okrPeriod, setOkrPeriod] = useState('Q3 2026');
  const [okrEmployeeId, setOkrEmployeeId] = useState('');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptManager, setDeptManager] = useState('');
  const [deptParent, setDeptParent] = useState('');
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [editFirst, setEditFirst] = useState(''); const [editLast, setEditLast] = useState('');
  const [editDept, setEditDept] = useState(''); const [editDesignation, setEditDesignation] = useState(''); const [editBranch, setEditBranch] = useState(''); const [editSalary, setEditSalary] = useState('');
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [vacTitle, setVacTitle] = useState(''); const [vacDept, setVacDept] = useState(''); const [vacCount, setVacCount] = useState('1');
  const [vacancies, setVacancies] = useState<{ id: string; title: string; department: string; count: number; posted: string }[]>([]);
  // Edit Department modal
  const [editDeptModal, setEditDeptModal] = useState<Department | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptManager, setEditDeptManager] = useState('');
  const [editDeptBudget, setEditDeptBudget] = useState('');
  const [editDeptParent, setEditDeptParent] = useState('');
  // Onboarding modal
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onbEmpId, setOnbEmpId] = useState('');
  const [onbDept, setOnbDept] = useState('');
  const [onbRole, setOnbRole] = useState('');
  const [onbPhase, setOnbPhase] = useState('Pre-boarding');
  const [onbTasks, setOnbTasks] = useState('');
  const [onbStartDate, setOnbStartDate] = useState('');
  const [editOnbModal, setEditOnbModal] = useState<OnboardingRecord | null>(null);
  const [editOnbPhase, setEditOnbPhase] = useState('');
  const [editOnbTasks, setEditOnbTasks] = useState('');
  const [editOnbStatus, setEditOnbStatus] = useState<'In Progress' | 'Completed' | 'Pending'>('In Progress');
  const STAGES = ['Applications', 'Screening', 'Interview', 'Offer Sent', 'Hired'];
  const [applicants, setApplicants] = useState<{ name: string; role: string; dept: string; stage: string; applied: string; avatar: string }[]>([
    { name: 'Kofi Asante', role: 'Senior Software Engineer', dept: 'Engineering', stage: 'Interview', applied: '3 days ago', avatar: 'KA' },
    { name: 'Ama Boateng', role: 'Financial Analyst', dept: 'Finance', stage: 'Screening', applied: '5 days ago', avatar: 'AB' },
    { name: 'Kwame Mensah', role: 'Sales Representative', dept: 'Sales', stage: 'Applications', applied: '1 day ago', avatar: 'KM' },
    { name: 'Akosua Darko', role: 'HR Officer', dept: 'HR', stage: 'Offer Sent', applied: '8 days ago', avatar: 'AD' },
  ]);

  const uniqueDepts = ['All', ...Array.from(new Set(localEmployees.map(e => e.department)))];

  const filtered = localEmployees.filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.department} ${e.designation} ${e.employeeNumber}`
      .toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const active = localEmployees.filter(e => e.status === 'Active');
  const onLeave = localEmployees.filter(e => e.status === 'On Leave');
  const totalPayroll = localEmployees.reduce((s, e) => s + e.salary, 0);

  // The logged-in employee's own record (first match by name for demo)
  const myRecord = localEmployees[0] ?? null;

  // ── VIEW: DIRECTORY ────────────────────────────────────────────────────────
  if (activeView === 'hr' || activeView === 'hr-employees') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="HR & Employee Directory"
          subtitle={`${selectedCompany.name} · ${localEmployees.length} employees registered`}
          action={isHRorAdmin ? (
            <a href="#hire" onClick={(e) => { e.preventDefault(); onNavigateView('hire'); }}>
              <PrimaryBtn icon="bi bi-person-plus">Register Employee</PrimaryBtn>
            </a>
          ) : undefined}
        />

        {/* Employee Profile Modal */}
        {selectedEmp && (
          <ViewModal title={`${selectedEmp.firstName} ${selectedEmp.lastName}`} subtitle={`${selectedEmp.designation} · ${selectedEmp.department}`} onClose={() => setSelectedEmp(null)} size="3xl">
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} className="rounded-xl px-6 py-6 -mx-1">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  {selectedEmp.firstName[0]}{selectedEmp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white tracking-tight">{selectedEmp.firstName} {selectedEmp.lastName}</h1>
                  <p className="text-slate-400 mt-0.5 text-sm">{selectedEmp.designation} · {selectedEmp.department}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
                      <i className="bi bi-person-badge"></i> {selectedEmp.employeeNumber}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      selectedEmp.status === 'Active' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                      {selectedEmp.status}
                    </span>
                  </div>
                </div>
                {isHRorAdmin && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-white tabular-nums">${(selectedEmp.salary || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Monthly Gross</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: 'bi bi-envelope', label: selectedEmp.email },
                { icon: 'bi bi-geo-alt', label: selectedEmp.branch },
                { icon: 'bi bi-calendar3', label: `Joined ${selectedEmp.joiningDate}` },
                { icon: 'bi bi-diagram-3', label: selectedEmp.department },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <i className={`${item.icon} text-slate-400 text-sm`}></i>
                  <span className="text-xs text-slate-700 truncate">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Profile Body */}
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Left col */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="section-title text-slate-500 mb-3">Employment Details</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Employee ID', value: selectedEmp.employeeNumber, mono: true },
                      { label: 'Department', value: selectedEmp.department },
                      { label: 'Designation', value: selectedEmp.designation },
                      { label: 'Branch', value: selectedEmp.branch },
                      { label: 'Status', value: selectedEmp.status },
                      { label: 'Joined', value: selectedEmp.joiningDate, mono: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{item.label}</span>
                        <span className={`text-xs font-semibold text-slate-900 ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                    {isHRorAdmin && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                        <span className="text-xs text-slate-500">Monthly Salary</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">${(selectedEmp.salary || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="section-title text-slate-500 mb-3">Leave Balances</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'Annual Leave', used: 7, total: 25, color: 'bg-blue-500' },
                      { type: 'Sick Leave', used: 2, total: 10, color: 'bg-amber-500' },
                      { type: 'Casual Leave', used: 1, total: 5, color: 'bg-violet-500' },
                    ].map(lb => (
                      <div key={lb.type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{lb.type}</span>
                          <span className="font-semibold text-slate-800 tabular-nums">{lb.total - lb.used} / {lb.total}</span>
                        </div>
                        <ProgressBar value={(lb.used / lb.total) * 100} color={lb.color} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right cols */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="section-title text-slate-500 mb-3">Attendance — July 2026</h3>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {[
                      { label: 'Present', value: 21, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                      { label: 'Absent', value: 0, color: 'text-rose-600', bg: 'bg-rose-100' },
                      { label: 'Late', value: 1, color: 'text-amber-600', bg: 'bg-amber-100' },
                      { label: 'Rate', value: '95.5%', color: 'text-blue-600', bg: 'bg-blue-100' },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} rounded-lg p-2.5 text-center`}>
                        <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="section-title text-slate-500 mb-3">Active OKRs — Q3 2026</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Complete product beta with 10 enterprise clients', progress: 82, status: 'On Track' },
                      { title: 'Reduce deployment pipeline time by 20%', progress: 45, status: 'At Risk' },
                    ].map((okr, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-800">{okr.title}</span>
                          <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : 'warning'} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1"><ProgressBar value={okr.progress} color={okr.progress >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} /></div>
                          <span className="text-xs font-bold text-slate-700 tabular-nums w-8 text-right">{okr.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isHRorAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <PrimaryBtn icon="bi bi-pencil" onClick={() => { setEditEmp(selectedEmp); setEditFirst(selectedEmp.firstName); setEditLast(selectedEmp.lastName); setEditDept(selectedEmp.department); setEditDesignation(selectedEmp.designation); setEditBranch(selectedEmp.branch); setEditSalary(String(selectedEmp.salary)); }}>Edit Employee</PrimaryBtn>
                    <SecBtn onClick={() => { setSelectedEmp(null); onNavigateView('payroll'); }}>View Payslips</SecBtn>
                    <SecBtn onClick={() => { setSelectedEmp(null); onNavigateView('comm-compose'); }}>Send Message</SecBtn>
                  </div>
                )}
              </div>
            </div>
          </ViewModal>
        )}

        {/* Edit Employee Modal */}
        {editEmp && (
          <ViewModal title={`Edit Employee — ${editEmp.employeeNumber}`} onClose={() => setEditEmp(null)} size="md">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>First Name</Label><Input value={editFirst} onChange={e => setEditFirst(e.target.value)} /></div>
                <div><Label>Last Name</Label><Input value={editLast} onChange={e => setEditLast(e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Department</Label><Input value={editDept} onChange={e => setEditDept(e.target.value)} /></div>
                <div><Label>Designation</Label><Input value={editDesignation} onChange={e => setEditDesignation(e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Branch</Label><Input value={editBranch} onChange={e => setEditBranch(e.target.value)} /></div>
                <div><Label>Monthly Salary</Label><Input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <SecBtn onClick={() => setEditEmp(null)}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                if (!editEmp) return;
                onUpdateEmployee(editEmp.id, { firstName: editFirst, lastName: editLast, department: editDept, designation: editDesignation, branch: editBranch, salary: Number(editSalary) });
                setEditEmp(null); setSelectedEmp(null);
              }}>Save Changes</PrimaryBtn>
            </div>
          </ViewModal>
        )}

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Staff" value={localEmployees.length} icon="bi bi-people-fill" sub="All registered personnel" />
          <StatCard label="Active" value={active.length} icon="bi bi-check-circle-fill" sub="Currently employed" color="text-emerald-600" />
          <StatCard label="On Leave" value={onLeave.length} icon="bi bi-calendar-check" sub="Approved absences" accent />
          {isHRorAdmin
            ? <StatCard label="Monthly Payroll" value={`GHS ${(totalPayroll / 1000).toFixed(0)}k`} icon="bi bi-cash-stack" sub="Gross salary obligation" />
            : <StatCard label="Departments" value={[...new Set(localEmployees.map(e => e.department))].length} icon="bi bi-diagram-3" sub="Active units" />
          }
        </div>

        {/* Filters & Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <Input
                placeholder="Search name, ID, role, department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-40">
                {uniqueDepts.map(d => <option key={d}>{d}</option>)}
              </Select>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
                <option>All</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </Select>
              {isHRorAdmin && (
                <button onClick={() => downloadCSV(`employees-${selectedCompany.id}`, ['Name', 'Employee ID', 'Department', 'Designation', 'Branch', 'Salary', 'Status', 'Email'], filtered.map(e => [`${e.firstName} ${e.lastName}`, e.employeeNumber, e.department, e.designation, e.branch, e.salary, e.status, e.email]))} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-3 py-2 rounded-lg cursor-pointer transition-all">
                  <i className="bi bi-download text-xs"></i> Export
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100">
            <span className="text-xs text-slate-500">{filtered.length} employee{filtered.length !== 1 ? 's' : ''} found</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  {[
                    'Employee', 'ID', 'Department', 'Designation', 'Branch',
                    ...(isHRorAdmin ? ['Salary', 'Status'] : ['Status']),
                    '',
                  ].map(col => (
                    <th key={col} className={`px-4 py-3 section-title text-slate-400 ${col === 'Salary' ? 'text-right' : ''}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp, i) => (
                  <tr key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedEmp(emp)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar first={emp.firstName} last={emp.lastName} index={i} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{emp.employeeNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{emp.department}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{emp.designation}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <i className="bi bi-geo-alt text-xs text-slate-300"></i>
                        {emp.branch}
                      </span>
                    </td>
                    {isHRorAdmin && (
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">GHS {emp.salary.toLocaleString()}</span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge
                        label={emp.status}
                        variant={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'danger'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedEmp(emp)} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                        View <i className="bi bi-arrow-right ml-0.5"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isHRorAdmin ? 8 : 7} className="text-center py-12">
                      <i className="bi bi-people text-4xl text-slate-200 block mb-2"></i>
                      <p className="text-sm text-slate-400">No employees match your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: HIRE / REGISTER ─────────────────────────────────────────────────
  if (activeView === 'hr-recruitment') {
    return (
      <div className="space-y-6">
        <SectionHeader title="Recruitment & ATS" subtitle="Post vacancies, track applicants and register new employees." />

        {/* ATS Pipeline */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { stage: 'Applications', count: 24, icon: 'bi bi-inbox', color: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
            { stage: 'Screening', count: 11, icon: 'bi bi-funnel', color: 'bg-violet-50 border-violet-100', text: 'text-violet-700' },
            { stage: 'Interview', count: 6, icon: 'bi bi-camera-video', color: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
            { stage: 'Offer Sent', count: 2, icon: 'bi bi-envelope-check', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
          ].map(s => (
            <div key={s.stage} className={`${s.color} border rounded-xl p-5`}>
              <i className={`${s.icon} ${s.text} text-lg block mb-2`}></i>
              <div className={`text-2xl font-bold tabular-nums ${s.text}`}>{s.count}</div>
              <div className="text-sm text-slate-600 mt-0.5">{s.stage}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Applicant list */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Active Applicants</h3>
                {isHRorAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setVacTitle(''); setVacDept(''); setVacCount('1'); setShowVacancyModal(true); }}>Post Vacancy</PrimaryBtn>}
                {showVacancyModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
                      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Post Vacancy</h2>
                      <div className="space-y-4">
                        <div><Label>Job Title *</Label><Input value={vacTitle} onChange={e => setVacTitle(e.target.value)} placeholder="Senior Engineer" /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><Label>Department</Label><Input value={vacDept} onChange={e => setVacDept(e.target.value)} placeholder="Engineering" /></div>
                          <div><Label>Openings</Label><Input type="number" value={vacCount} onChange={e => setVacCount(e.target.value)} /></div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                        <SecBtn onClick={() => setShowVacancyModal(false)}>Cancel</SecBtn>
                        <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                          if (!vacTitle) return void modalAlert('Job title required', { variant: 'warning' });
                          setVacancies([...vacancies, { id: `vac-${Date.now()}`, title: vacTitle, department: vacDept, count: Number(vacCount) || 1, posted: new Date().toISOString().split('T')[0] }]);
                          setShowVacancyModal(false); setVacTitle('');
                        }}>Post Vacancy</PrimaryBtn>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="divide-y divide-slate-100">
              {applicants.map((app, i) => (
                <div key={app.name} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar first={app.name.split(' ')[0]} last={app.name.split(' ')[1] || 'X'} index={i} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{app.name}</div>
                      <div className="text-xs text-slate-500">{app.role} · {app.dept}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{app.applied}</span>
                    <Badge
                      label={app.stage}
                      variant={app.stage === 'Offer Sent' ? 'success' : app.stage === 'Interview' ? 'info' : app.stage === 'Screening' ? 'purple' : 'default'}
                    />
                    {isHRorAdmin && (
                      <button onClick={() => {
                        const idx = STAGES.indexOf(app.stage);
                        const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : app.stage;
                        setApplicants(prev => prev.map((a, j) => j === i ? { ...a, stage: next } : a));
                      }} className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                        Move Stage
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Register form */}
          {isHRorAdmin && (
            <div id="hire" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 scroll-mt-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Register New Employee</h3>
              {hireSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                  <i className="bi bi-check-circle-fill"></i> {hireSuccess}
                </div>
              )}
              <form className="space-y-3" onSubmit={e => {
                e.preventDefault();
                if (!hrFirst || !hrLast || !hrEmail) return;
                onAddEmployee({ companyId: selectedCompany.id, firstName: hrFirst, lastName: hrLast, email: hrEmail, department: hrDept, designation: hrRole || 'Staff', branch: hrBranch, salary: Number(hrSalary) });
                setHireSuccess(`${hrFirst} ${hrLast} registered as ${hrRole || 'Staff'}.`);
                setHrFirst(''); setHrLast(''); setHrEmail(''); setHrRole('');
                setTimeout(() => setHireSuccess(null), 4000);
              }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>First Name *</Label><Input value={hrFirst} onChange={e => setHrFirst(e.target.value)} placeholder="Kofi" required /></div>
                  <div><Label>Last Name *</Label><Input value={hrLast} onChange={e => setHrLast(e.target.value)} placeholder="Asante" required /></div>
                </div>
                <div><Label>Email *</Label><Input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} placeholder="kofi@company.com" required /></div>
                <div><Label>Phone</Label><Input value={hrPhone} onChange={e => setHrPhone(e.target.value)} placeholder="+233 24 000 0000" /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Department</Label>
                    <Select value={hrDept} onChange={e => setHrDept(e.target.value)}>
                      {['Engineering', 'Finance', 'HR', 'Sales', 'Operations', 'IT', 'Legal', 'Marketing'].map(d => <option key={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div><Label>Designation</Label><Input value={hrRole} onChange={e => setHrRole(e.target.value)} placeholder="Senior Engineer" /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Employment Type</Label>
                    <Select value={hrType} onChange={e => setHrType(e.target.value)}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Select value={hrBranch} onChange={e => setHrBranch(e.target.value)}>
                      <option>HQ</option><option>Accra Office</option><option>Kumasi Branch</option><option>Takoradi Office</option>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Start Date</Label><Input type="date" value={hrStartDate} onChange={e => setHrStartDate(e.target.value)} /></div>
                  <div><Label>Monthly Salary (GHS)</Label><Input type="number" value={hrSalary} onChange={e => setHrSalary(e.target.value)} placeholder="6500" /></div>
                </div>
                <div className="pt-2">
                  <PrimaryBtn type="submit" icon="bi bi-person-check">Register Employee</PrimaryBtn>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VIEW: LEAVE ────────────────────────────────────────────────────────────
  if (activeView === 'hr-leave') {
    if (isHRorAdmin) {
      const pending = companyLeaves.filter(l => l.status === 'Pending');
      const approved = companyLeaves.filter(l => l.status === 'Approved');
      const todayOnLeave = localEmployees.filter(e => e.status === 'On Leave');
      const totalDays = companyLeaves.filter(l => l.status === 'Approved').reduce((s, l) => s + (l.days || 0), 0);
      return (
        <div className="space-y-6">
          <SectionHeader title="Leave Management" subtitle="Review, approve and track all employee leave requests." />
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Pending" value={pending.length} icon="bi bi-clock-history" sub="Awaiting approval" accent />
            <StatCard label="Approved (Month)" value={approved.length} icon="bi bi-check-circle" sub="Leave granted" color="text-emerald-600" />
            <StatCard label="On Leave Today" value={todayOnLeave.length} icon="bi bi-calendar-check" sub="Currently away" />
            <StatCard label="Total Days Used" value={totalDays} icon="bi bi-calendar-range" sub="Across company" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Leave Requests</h3>
              <div className="flex gap-2">
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                  <button key={f} onClick={() => setLeaveFilter(f as typeof leaveFilter)} className={`text-xs font-semibold border px-3 py-1.5 rounded-lg cursor-pointer transition-all ${leaveFilter === f ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {companyLeaves.length === 0 && (
                <div className="p-10 text-center">
                  <i className="bi bi-inbox text-3xl text-slate-200 block mb-2"></i>
                  <p className="text-sm text-slate-400">No leave requests found.</p>
                </div>
              )}
              {filteredLeaves.map((req, i) => {
                const emp = localEmployees.find(e => e.id === req.employeeId);
                const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
                const empDept = emp?.department || '';
                return (
                <div key={req.id} className="p-5 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar first={empName.split(' ')[0]} last={empName.split(' ')[1] || 'X'} index={i} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">{empName}</span>
                          <span className="text-xs text-slate-400">· {empDept}</span>
                          <Badge label={req.leaveType} variant="info" />
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <i className="bi bi-calendar3 text-slate-400"></i>
                          {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''}
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full tabular-nums">{req.days || 1} day{(req.days || 1) > 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 italic">"{req.reason}"</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'} />
                      
                      {req.status === 'Pending' && (() => {
                        const isCompanyAdmin = selectedUser.activeRole === 'Company Admin';
                        const hasLeavePermission = selectedUser.permissions.includes('leave_approve') || selectedUser.permissions.includes('admin_all');
                        const empDeptRecord = departments.find(d => d.name === empDept && d.companyId === selectedCompany.id);
                        const isHOD = empDeptRecord?.managerId === selectedUser.id;
                        const canApprove = isCompanyAdmin || hasLeavePermission || isHOD;
                        
                        if (canApprove) {
                          return (
                            <div className="flex gap-2">
                              <button onClick={() => onApproveLeave(req.id)} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Approve</button>
                              <button onClick={() => onRejectLeave(req.id)} className="text-xs font-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                            </div>
                          );
                        }
                        return <div className="text-[10px] text-slate-400 italic">Awaiting HOD/Admin approval</div>;
                      })()}
                      
                      {req.status === 'Approved' && req.approvedBy && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <i className="bi bi-check2-circle text-emerald-500"></i>
                          Approved by <span className="font-semibold text-slate-700">{req.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Employee self-service leave
    return (
      <div className="space-y-6">
        <SectionHeader title="My Leave" subtitle="Apply for time off and track your leave balance." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { type: 'Annual Leave', used: 7, total: 25, color: 'from-blue-500 to-blue-700', icon: 'bi bi-sun' },
            { type: 'Sick Leave', used: 2, total: 10, color: 'from-rose-500 to-rose-700', icon: 'bi bi-thermometer' },
            { type: 'Casual Leave', used: 1, total: 5, color: 'from-violet-500 to-violet-700', icon: 'bi bi-person-heart' },
          ].map(lb => (
            <div key={lb.type} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${lb.color} flex items-center justify-center text-white mb-3`}>
                <i className={lb.icon}></i>
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1">{lb.type}</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mb-2">{lb.total - lb.used} <span className="text-sm font-normal text-slate-400">/ {lb.total} days left</span></div>
              <ProgressBar value={(lb.used / lb.total) * 100} color={`bg-gradient-to-r ${lb.color}`} />
            </div>
          ))}
          <StatCard label="Pending" value={myLeaves.filter(l => l.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting approval" accent />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Request form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Request Time Off</h3>
            {leaveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                <i className="bi bi-check-circle-fill"></i> Leave request submitted!
              </div>
            )}
            <form className="space-y-4" onSubmit={e => {
              e.preventDefault();
              if (!myEmpRecord) return;
              const days = leaveEnd && leaveStart
                ? Math.max(1, Math.round((new Date(leaveEnd).getTime() - new Date(leaveStart).getTime()) / 86400000) + 1)
                : 1;
              onAddLeave({
                employeeId: myEmpRecord.id,
                employeeName: `${myEmpRecord.firstName} ${myEmpRecord.lastName}`,
                department: myEmpRecord.department,
                leaveType,
                startDate: leaveStart,
                endDate: leaveEnd || leaveStart,
                reason: leaveReason,
                days
              });
              setLeaveStart(''); setLeaveEnd(''); setLeaveReason('');
              setLeaveSuccess(true);
              setTimeout(() => setLeaveSuccess(false), 3000);
            }}>
              <div>
                <Label>Leave Type</Label>
                <Select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  <option>Annual Leave</option><option>Sick Leave</option><option>Casual Leave</option>
                  <option>Unpaid Leave</option><option>Maternity / Paternity</option>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Start Date *</Label><Input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} required /></div>
                <div><Label>End Date</Label><Input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} /></div>
              </div>
              <div>
                <Label>Reason *</Label>
                <Input value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Brief reason…" required />
              </div>
              <PrimaryBtn type="submit" icon="bi bi-send">Submit Request</PrimaryBtn>
            </form>
          </div>

          {/* Leave history */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">My Leave History</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {myLeaves.length === 0 && (
                <div className="p-10 text-center">
                  <i className="bi bi-calendar-x text-3xl text-slate-200 block mb-2"></i>
                  <p className="text-sm text-slate-400">No leave requests yet.</p>
                </div>
              )}
              {myLeaves.map(req => (
                <div key={req.id} className="p-4 hover:bg-slate-50/40 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{req.leaveType}</span>
                        <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <i className="bi bi-calendar3 mr-1"></i>{req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''} · {req.reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: ATTENDANCE ───────────────────────────────────────────────────────
  if (activeView === 'hr-attendance') {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (isHRorAdmin) {
      return (
        <div className="space-y-6">
          <SectionHeader title="Attendance Management" subtitle={`Today — ${today}`} />
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Present Today" value={companyAttendance.filter(a => a.status === 'Present').length} icon="bi bi-person-check-fill" sub="Clocked in" color="text-emerald-600" />
            <StatCard label="Late Arrivals" value={companyAttendance.filter(a => a.status === 'Late').length} icon="bi bi-clock-history" sub="After 9:00 AM" accent />
            <StatCard label="On Leave" value={onLeave.length} icon="bi bi-calendar-x" sub="Approved absence" />
            <StatCard label="Attendance Rate" value={`${active.length ? Math.round((companyAttendance.filter(a => a.status === 'Present').length / active.length) * 100) : 0}%`} icon="bi bi-graph-up-arrow" sub="This week" color="text-emerald-600" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Today's Attendance Log</h3>
              <div className="flex gap-2">
                <button onClick={() => downloadCSV(`attendance-${selectedCompany.id}-${new Date().toISOString().split('T')[0]}`, ['Employee', 'Employee ID', 'Date', 'Check In', 'Check Out', 'Location', 'Status'], companyAttendance.map(a => {
                  const emp = localEmployees.find(e => e.id === a.employeeId);
                  return [`${emp?.firstName || ''} ${emp?.lastName || ''}`, emp?.employeeNumber || '', a.date, a.checkIn || '', a.checkOut || '', a.locationType || '', a.status];
                }))} className="text-sm font-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-1.5">
                  <i className="bi bi-download text-xs"></i> Export
                </button>
                <PrimaryBtn icon="bi bi-person-check">Mark Attendance</PrimaryBtn>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  {['Employee', 'Check In', 'Check Out', 'Hours', 'Mode', 'Status'].map(col => (
                    <th key={col} className="px-4 py-3 section-title text-slate-400">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localEmployees.slice(0, 8).map((emp, i) => {
                  const statuses = ['Present', 'Present', 'Late', 'Present', 'On Leave', 'Present', 'Present', 'Present'];
                  const checkIns = ['08:55 AM', '09:02 AM', '09:47 AM', '08:59 AM', '—', '09:10 AM', '08:43 AM', '09:05 AM'];
                  const modes = ['Office', 'Remote', 'Office', 'GPS', 'Leave', 'Office', 'Remote', 'Office'];
                  const hours = ['7h 5m', '6h 58m', '6h 13m', '7h 1m', '—', '6h 50m', '7h 17m', '6h 55m'];
                  const st = statuses[i] || 'Present';
                  const mode = modes[i] || 'Office';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar first={emp.firstName} last={emp.lastName} index={i} size="sm" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-slate-400">{emp.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-slate-700">{checkIns[i]}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-slate-400">—</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-slate-600">{hours[i]}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          mode === 'Remote' ? 'text-blue-600' : mode === 'GPS' ? 'text-emerald-600' : mode === 'Leave' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <i className={`bi bi-${mode === 'Remote' ? 'laptop' : mode === 'GPS' ? 'geo-alt' : mode === 'Leave' ? 'calendar-x' : 'building'}`}></i>
                          {mode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge label={st} variant={st === 'Present' ? 'success' : st === 'Late' ? 'warning' : st === 'On Leave' ? 'info' : 'danger'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Employee self-service attendance
    return (
      <div className="space-y-6">
        <SectionHeader title="My Attendance" subtitle={`${selectedUser.name} · ${today}`} />
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Days Present" value={myEmpRecord ? companyAttendance.filter(a => a.employeeId === myEmpRecord.id && a.status === 'Present').length : 0} icon="bi bi-person-check-fill" sub="This month" color="text-emerald-600" />
          <StatCard label="Late Check-ins" value={myEmpRecord ? companyAttendance.filter(a => a.employeeId === myEmpRecord.id && a.status === 'Late').length : 0} icon="bi bi-clock-history" sub="This month" accent />
          <StatCard label="Absent" value={myEmpRecord ? companyAttendance.filter(a => a.employeeId === myEmpRecord.id && a.status === 'Absent').length : 0} icon="bi bi-x-circle" sub="Unexcused" />
          <StatCard label="My Rate" value={myEmpRecord ? (() => { const total = companyAttendance.filter(a => a.employeeId === myEmpRecord.id).length; return total ? `${Math.round((companyAttendance.filter(a => a.employeeId === myEmpRecord.id && a.status === 'Present').length / total) * 100)}%` : '0%'; })() : '0%'} icon="bi bi-graph-up" sub="Attendance rate" color="text-emerald-600" />
        </div>

        {/* Today's clock card */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const myAttToday = myEmpRecord ? companyAttendance.find(a => a.employeeId === myEmpRecord.id && a.date === todayStr) : null;
          const isClockedIn = !!myAttToday?.checkIn;
          const isClockedOut = !!myAttToday?.checkOut;
          return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex items-center justify-between">
          <div>
            <div className="section-title text-slate-500 mb-1">Today's Status</div>
            <div className="text-2xl font-bold text-slate-900">{isClockedOut ? 'Shift Complete' : isClockedIn ? 'Clocked In' : 'Not Clocked In'}</div>
            <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              {isClockedIn ? (
                <><i className="bi bi-clock text-emerald-500"></i> {myAttToday!.checkIn} · {myAttToday!.locationType || 'Office'}</>
              ) : (
                <><i className="bi bi-clock text-slate-400"></i> Awaiting clock-in</>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-lg font-bold text-emerald-700 tabular-nums">{myAttToday?.checkIn || '—'}</div>
              <div className="text-xs text-emerald-600">Check In</div>
            </div>
            <div className="text-center px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-lg font-bold text-slate-400 tabular-nums">{myAttToday?.checkOut || '—'}</div>
              <div className="text-xs text-slate-400">Check Out</div>
            </div>
          </div>
          {!isClockedIn ? (
            <PrimaryBtn onClick={() => onClockIn('Office')} icon="bi bi-box-arrow-in-right">Clock In</PrimaryBtn>
          ) : !isClockedOut ? (
            <PrimaryBtn onClick={() => onClockOut()} icon="bi bi-box-arrow-right">Clock Out</PrimaryBtn>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg"><i className="bi bi-check-circle-fill mr-1"></i>Done for today</span>
          )}
        </div>
          );
        })()}

        {/* Weekly view */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">This Week</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                {['Day', 'Check In', 'Check Out', 'Hours', 'Mode', 'Status'].map(col => (
                  <th key={col} className="px-4 py-3 section-title text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { day: 'Monday, Jul 7', cin: '08:52 AM', cout: '05:30 PM', hrs: '8h 38m', mode: 'Office', status: 'Present' },
                { day: 'Tuesday, Jul 8', cin: '09:01 AM', cout: '05:45 PM', hrs: '8h 44m', mode: 'Remote', status: 'Present' },
                { day: 'Wednesday, Jul 9', cin: '09:35 AM', cout: '06:10 PM', hrs: '8h 35m', mode: 'Office', status: 'Late' },
                { day: 'Thursday, Jul 10', cin: '08:55 AM', cout: '—', hrs: '—', mode: 'Office', status: 'Present' },
                { day: 'Friday, Jul 11', cin: '—', cout: '—', hrs: '—', mode: '—', status: 'Upcoming' },
              ].map(row => (
                <tr key={row.day} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.day}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-700">{row.cin}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-400">{row.cout}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{row.hrs}</td>
                  <td className="px-4 py-3">
                    {row.mode !== '—' ? (
                      <span className={`text-xs font-medium flex items-center gap-1 ${row.mode === 'Remote' ? 'text-blue-600' : 'text-slate-600'}`}>
                        <i className={`bi bi-${row.mode === 'Remote' ? 'laptop' : 'building'}`}></i>{row.mode}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={row.status} variant={row.status === 'Present' ? 'success' : row.status === 'Late' ? 'warning' : 'default'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── VIEW: ONBOARDING ───────────────────────────────────────────────────────
  if (activeView === 'hr-onboarding') {
    const companyOnb = onboardings.filter(o => o.companyId === selectedCompany.id);
    const activeOnb = companyOnb.filter(o => o.status === 'In Progress' || o.status === 'Pending');
    const completedOnb = companyOnb.filter(o => o.status === 'Completed');
    const totalPendingTasks = activeOnb.reduce((acc, o) => acc + (o.tasks.length - o.completedTasks.length), 0);
    const avgCompletion = companyOnb.length > 0 ? Math.round(companyOnb.reduce((acc, o) => acc + (o.completedTasks.length / o.tasks.length) * 100, 0) / companyOnb.length) : 0;

    return (
      <div className="space-y-6">
        <SectionHeader title="Onboarding Management" subtitle="Track new employee onboarding progress and tasks."
          action={isHRorAdmin ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setOnbEmpId(''); setOnbDept(''); setOnbRole(''); setOnbPhase('Pre-boarding'); setOnbTasks(''); setOnbStartDate(''); setShowOnboardingModal(true); }}>New Onboarding</PrimaryBtn> : undefined}
        />
        {showOnboardingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Onboarding Record</h2>
              <div className="space-y-4">
                <div><Label>Employee</Label><Select value={onbEmpId} onChange={e => { const emp = localEmployees.find(e2 => e2.id === e.target.value); setOnbEmpId(e.target.value); if (emp) { setOnbDept(emp.department); setOnbRole(emp.designation); } }}><option value="">— Select employee —</option>{localEmployees.map(e2 => <option key={e2.id} value={e2.id}>{e2.firstName} {e2.lastName}</option>)}</Select></div>
                <div><Label>Department</Label><Input value={onbDept} onChange={e => setOnbDept(e.target.value)} placeholder="Engineering" /></div>
                <div><Label>Role</Label><Input value={onbRole} onChange={e => setOnbRole(e.target.value)} placeholder="Software Engineer" /></div>
                <div><Label>Start Date</Label><Input type="date" value={onbStartDate} onChange={e => setOnbStartDate(e.target.value)} /></div>
                <div><Label>Phase</Label><Select value={onbPhase} onChange={e => setOnbPhase(e.target.value)}><option>Pre-boarding</option><option>Week 1</option><option>Week 2</option><option>Month 1</option></Select></div>
                <div><Label>Tasks (comma-separated)</Label><Input value={onbTasks} onChange={e => setOnbTasks(e.target.value)} placeholder="Offer letter signed, ID verification, IT equipment issued" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowOnboardingModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!onbEmpId || !onbTasks) return void modalAlert('Employee and tasks required', { variant: 'warning' });
                  const emp = localEmployees.find(e2 => e2.id === onbEmpId);
                  onAddOnboarding({ companyId: selectedCompany.id, employeeId: onbEmpId, employeeName: emp ? emp.firstName + ' ' + emp.lastName : '', department: onbDept, role: onbRole, phase: onbPhase, tasks: onbTasks.split(',').map(t => t.trim()).filter(Boolean), completedTasks: [], status: 'In Progress', startDate: onbStartDate });
                  setShowOnboardingModal(false);
                }}>Create Onboarding</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
        {editOnbModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Edit Onboarding — {editOnbModal.employeeName}</h2>
              <div className="space-y-4">
                <div><Label>Phase</Label><Select value={editOnbPhase} onChange={e => setEditOnbPhase(e.target.value)}><option>Pre-boarding</option><option>Week 1</option><option>Week 2</option><option>Month 1</option></Select></div>
                <div><Label>Status</Label><Select value={editOnbStatus} onChange={e => setEditOnbStatus(e.target.value as 'In Progress' | 'Completed' | 'Pending')}><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Pending">Pending</option></Select></div>
                <div><Label>Tasks (comma-separated)</Label><Input value={editOnbTasks} onChange={e => setEditOnbTasks(e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setEditOnbModal(null)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  onUpdateOnboarding(editOnbModal.id, { phase: editOnbPhase, status: editOnbStatus, tasks: editOnbTasks.split(',').map(t => t.trim()).filter(Boolean) });
                  setEditOnbModal(null);
                }}>Save Changes</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="In Onboarding" value={activeOnb.length} icon="bi bi-door-open" sub="Active onboarding records" />
          <StatCard label="Tasks Pending" value={totalPendingTasks} icon="bi bi-list-check" sub="Across all onboardees" accent />
          <StatCard label="Avg Completion" value={`${avgCompletion}%`} icon="bi bi-graph-up" sub="Progress rate" color="text-emerald-600" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {companyOnb.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-400">No onboarding records yet. Click "New Onboarding" to get started.</div>
            )}
            {companyOnb.map((o, idx) => {
              const pct = o.tasks.length > 0 ? Math.round((o.completedTasks.length / o.tasks.length) * 100) : 0;
              const daysSinceStart = o.startDate ? Math.floor((Date.now() - new Date(o.startDate).getTime()) / 86400000) : 0;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar first={o.employeeName.split(' ')[0]} last={o.employeeName.split(' ')[1] || ''} index={idx} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{o.employeeName}</div>
                        <div className="text-xs text-slate-500">{o.role} · {o.department} · Day {daysSinceStart}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 tabular-nums">{pct}%</div>
                      <Badge label={`${o.completedTasks.length}/${o.tasks.length} tasks`} variant={o.completedTasks.length === o.tasks.length ? 'success' : o.status === 'Pending' ? 'warning' : 'info'} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <ProgressBar value={pct} color={pct === 100 ? 'bg-emerald-500' : pct > 60 ? 'bg-blue-500' : 'bg-amber-500'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {o.tasks.map((task, ti) => {
                      const done = o.completedTasks.includes(task);
                      return (
                        <div key={task} className={`flex items-center gap-2 text-xs ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                          <button onClick={() => {
                            const newCompleted = done ? o.completedTasks.filter(t => t !== task) : [...o.completedTasks, task];
                            onUpdateOnboarding(o.id, { completedTasks: newCompleted, status: newCompleted.length === o.tasks.length ? 'Completed' : 'In Progress' });
                          }} className="cursor-pointer">
                            <i className={`bi bi-${done ? 'check-circle-fill text-emerald-500' : 'circle text-slate-200'} text-sm`}></i>
                          </button>
                          {task}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                    <button onClick={() => { setEditOnbModal(o); setEditOnbPhase(o.phase); setEditOnbTasks(o.tasks.join(', ')); setEditOnbStatus(o.status); }} className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">Edit</button>
                    <button onClick={async () => { if (await modalConfirm(`Delete onboarding for ${o.employeeName}?`, { variant: 'danger' })) onDeleteOnboarding(o.id); }} className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer transition-colors">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Onboarding Checklist Template</h3>
            <div className="space-y-2">
              {[
                { phase: 'Pre-Day 1', tasks: ['Offer letter', 'Background check', 'Equipment request'] },
                { phase: 'Week 1', tasks: ['HR induction', 'System access', 'Team intro', 'Policy review'] },
                { phase: 'Week 2', tasks: ['Role training', 'Mentor assigned', '30-day goals set'] },
                { phase: 'Month 1', tasks: ['Performance baseline', 'Benefits enrolled', 'First 1-on-1'] },
              ].map(phase => (
                <div key={phase.phase} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 section-title text-slate-600">{phase.phase}</div>
                  <div className="px-3 py-2 space-y-1">
                    {phase.tasks.map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-slate-600">
                        <i className="bi bi-check2 text-emerald-500"></i>{t}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: PERFORMANCE / OKRs ───────────────────────────────────────────────
  if (activeView === 'hr-performance') {
    if (isHRorAdmin) {
      const onTrack = companyOkrs.filter(o => o.status === 'On Track');
      const atRisk = companyOkrs.filter(o => o.status === 'At Risk');
      const completed = companyOkrs.filter(o => o.status === 'Completed');
      return (
        <div className="space-y-6">
          <SectionHeader title="Performance & OKRs" subtitle="Track objectives, key results and employee performance reviews." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setOkrTitle(''); setOkrKeyResult(''); setOkrPeriod('Q3 2026'); setOkrEmployeeId(''); setShowOkrModal(true); }}>New OKR</PrimaryBtn>} />
          {showOkrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New OKR</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Assign to Employee *</Label>
                    <Select value={okrEmployeeId} onChange={e => setOkrEmployeeId(e.target.value)}>
                      <option value="">Select employee...</option>
                      {localEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.department}</option>
                      ))}
                    </Select>
                  </div>
                  <div><Label>Objective Title *</Label><Input value={okrTitle} onChange={e => setOkrTitle(e.target.value)} placeholder="Improve deployment speed" /></div>
                  <div><Label>Key Result / Target</Label><Input value={okrKeyResult} onChange={e => setOkrKeyResult(e.target.value)} placeholder="Reduce pipeline time by 20%" /></div>
                  <div><Label>Period</Label><Input value={okrPeriod} onChange={e => setOkrPeriod(e.target.value)} placeholder="Q3 2026" /></div>
                </div>
                <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                  <SecBtn onClick={() => setShowOkrModal(false)}>Cancel</SecBtn>
                  <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                    if (!okrTitle) return void modalAlert('Objective title required', { variant: 'warning' });
                    if (!okrEmployeeId) return void modalAlert('Please select an employee', { variant: 'warning' });
                    const selEmp = localEmployees.find(e => e.id === okrEmployeeId);
                    onAddOKR({ employeeId: selEmp?.id || '', employeeName: selEmp ? `${selEmp.firstName} ${selEmp.lastName}` : '', department: selEmp?.department || '', title: okrTitle, keyResult: okrKeyResult, period: okrPeriod });
                    setShowOkrModal(false); setOkrTitle(''); setOkrKeyResult(''); setOkrEmployeeId('');
                  }}>Create OKR</PrimaryBtn>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Active OKRs" value={companyOkrs.length} icon="bi bi-bullseye" sub="Across all departments" />
            <StatCard label="On Track" value={onTrack.length} icon="bi bi-check-circle" sub="Meeting targets" color="text-emerald-600" />
            <StatCard label="At Risk" value={atRisk.length} icon="bi bi-exclamation-triangle" sub="Needs attention" accent />
            <StatCard label="Completed" value={completed.length} icon="bi bi-trophy" sub="This quarter" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Performance Objectives — Q3 2026</h3>
              <div className="flex gap-2">
                <Select className="w-40 text-xs py-1.5">
                  <option>All Departments</option>
                  {['Engineering', 'Finance', 'HR', 'Sales', 'Operations'].map(d => <option key={d}>{d}</option>)}
                </Select>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {companyOkrs.length === 0 && (
                <div className="p-10 text-center">
                  <i className="bi bi-bullseye text-3xl text-slate-200 block mb-2"></i>
                  <p className="text-sm text-slate-400">No OKRs created yet.</p>
                </div>
              )}
              {companyOkrs.map((okr, i) => {
                const p = okr.progress;
                return (
                  <div key={okr.id} className="p-5 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar first={okr.employeeName.split(' ')[0]} last={okr.employeeName.split(' ')[1] || 'X'} index={i} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{okr.employeeName}</div>
                          <div className="text-xs text-slate-500">{okr.department}</div>
                        </div>
                      </div>
                      <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : okr.status === 'Completed' ? 'info' : 'warning'} />
                    </div>
                    <div className="text-sm text-slate-700 mb-1">{okr.title}</div>
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><i className="bi bi-arrow-right-short text-slate-400"></i>KR: {okr.keyResult}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={p} color={p >= 90 ? 'bg-blue-500' : p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-rose-500'} />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-700 w-8 text-right">{p}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Employee: own OKRs
    const myOnTrack = myOkrs.filter(o => o.status === 'On Track');
    return (
      <div className="space-y-6">
        <SectionHeader title="My Performance & OKRs" subtitle="Track your goals and key results for Q3 2026." />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="My Active Goals" value={myOkrs.filter(o => o.status !== 'Completed').length} icon="bi bi-bullseye" sub="Assigned OKRs" />
          <StatCard label="On Track" value={myOnTrack.length} icon="bi bi-check-circle" sub="Meeting targets" color="text-emerald-600" />
          <StatCard label="Quarter Deadline" value={(() => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); const end = new Date(now.getFullYear(), (q + 1) * 3, 0); return end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()} icon="bi bi-calendar3" sub="End of quarter" accent />
        </div>
        <div className="space-y-4">
          {myOkrs.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-10 text-center">
              <i className="bi bi-bullseye text-3xl text-slate-200 block mb-2"></i>
              <p className="text-sm text-slate-400">No OKRs assigned to you yet.</p>
            </div>
          )}
          {myOkrs.map((okr) => (
            <div key={okr.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{okr.title}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <i className="bi bi-arrow-right-short text-slate-400"></i>
                    Key Result: {okr.keyResult}
                  </div>
                </div>
                <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : okr.status === 'Completed' ? 'info' : 'warning'} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar value={okr.progress} color={okr.progress >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} />
                </div>
                <span className="text-sm font-bold tabular-nums text-slate-900 w-10 text-right">{okr.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── VIEW: ORG CHART ────────────────────────────────────────────────────────
  if (activeView === 'hr-orgchart') {
    const companyDepts = departments.filter(d => d.companyId === selectedCompany.id);
    const deptColors = [
      { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      { color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
      { color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
      { color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
      { color: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
      { color: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
    ];
    const deptIcons: Record<string, string> = { Engineering: '🔧', Finance: '💰', Sales: '📈', HR: '👥', Operations: '⚙️', IT: '💻' };
    const deptMap = new Map(companyDepts.map(d => [d.id, d]));
    const cycleMembers = new Set<string>();
    for (const d of companyDepts) {
      const visited: string[] = [];
      let cur: typeof companyDepts[0] | undefined = d;
      while (cur) {
        const idx = visited.indexOf(cur.id);
        if (idx !== -1) {
          for (let i = idx; i < visited.length; i++) cycleMembers.add(visited[i]);
          break;
        }
        visited.push(cur.id);
        cur = cur.parentId ? deptMap.get(cur.parentId) : undefined;
      }
    }
    const roots = companyDepts.filter(d => !d.parentId || cycleMembers.has(d.parentId));
    const getChildren = (parentId: string) => companyDepts.filter(d => d.parentId === parentId && !cycleMembers.has(d.id));
    const colorIdx = (d: typeof companyDepts[0]) => companyDepts.indexOf(d) % deptColors.length;

    const OrgNode: React.FC<{ dept: typeof companyDepts[0]; colorI: number }> = ({ dept, colorI }) => {
      const dc = deptColors[colorI % deptColors.length];
      const icon = deptIcons[dept.name] || '🏢';
      const count = localEmployees.filter(e => e.department === dept.name).length;
      const children = getChildren(dept.id);
      return (
        <div className="flex flex-col items-center">
          <div className={`${dc.color} border rounded-xl p-4 w-44 text-center hover:shadow-md transition-all group`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-xs font-bold ${dc.text}`}>{dept.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{(() => { const mgr = dept.managerId ? employees.find(e => e.id === dept.managerId) : null; return mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Unassigned'; })()}</div>
            <div className="text-xs font-bold text-slate-700 tabular-nums mt-1">{count} staff</div>
            <div className="mt-2 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditDeptModal(dept); setEditDeptName(dept.name); setEditDeptManager(dept.managerId || ''); setEditDeptBudget(String(dept.budget)); setEditDeptParent(dept.parentId || ''); }} className="text-[10px] bg-white border border-slate-300 text-slate-700 rounded px-2 py-0.5 hover:bg-slate-50 transition-colors">Edit</button>
              <button onClick={async () => { if (await modalConfirm(`Delete department "${dept.name}"?`, { variant: 'danger' })) onDeleteDepartment(dept.id); }} className="text-[10px] bg-white border border-rose-300 text-rose-700 rounded px-2 py-0.5 hover:bg-rose-50 transition-colors">Delete</button>
            </div>
          </div>
          {children.length > 0 && <div className="w-px h-5 bg-slate-300"></div>}
          {children.length > 0 && (
            <div className="flex items-start">
              {children.map((child, ci) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-5 bg-slate-300"></div>
                  <OrgNode dept={child} colorI={colorI + ci + 1} />
                  {ci < children.length - 1 && <div className="w-5"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <SectionHeader title="Organisation Chart" subtitle={`${selectedCompany.name} · Reporting structure`} />
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 overflow-x-auto">
          <div className="flex flex-col items-center min-w-[600px]">
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} className="rounded-2xl px-8 py-4 text-center shadow-lg">
              <div className="text-white font-bold text-sm">Company CEO</div>
              <div className="text-slate-400 text-xs mt-0.5">Managing Director</div>
            </div>
            {roots.length > 0 ? (
              <div className="flex items-start gap-0 mt-0">
                {roots.map((dept, i) => (
                  <OrgNode key={dept.id} dept={dept} colorI={i} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-8 mt-4">No departments yet. Add one in the Department Directory tab.</div>
            )}
          </div>
        </div>
        {editDeptModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Edit Department</h3>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Department Name</label>
              <input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Manager (employee)</label>
              <select value={editDeptManager} onChange={e => setEditDeptManager(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3">
                <option value="">Unassigned</option>
                {localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Budget</label>
              <input type="number" value={editDeptBudget} onChange={e => setEditDeptBudget(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Reports To</label>
              <select value={editDeptParent} onChange={e => setEditDeptParent(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4">
                <option value="">Top Level (no parent)</option>
                {departments.filter(d => d.companyId === selectedCompany.id && d.id !== editDeptModal?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => { onUpdateDepartment(editDeptModal.id, { name: editDeptName, managerId: editDeptManager || undefined, budget: Number(editDeptBudget), parentId: editDeptParent || undefined }); setEditDeptModal(null); }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">Save</button>
                <button onClick={() => setEditDeptModal(null)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: EXIT MANAGEMENT ──────────────────────────────────────────────────
  if (activeView === 'hr-exit') {
    return (
      <div className="space-y-6">
        <SectionHeader title="Exit Management" subtitle="Process employee separations, clearance and offboarding." />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Offboarded (YTD)" value={onboardings.filter(o => o.companyId === selectedCompany.id && o.status === 'Completed').length} icon="bi bi-door-closed" sub="Processed exits this year" />
          <StatCard label="Pending Clearance" value={onboardings.filter(o => o.companyId === selectedCompany.id && o.status === 'In Progress').length} icon="bi bi-clipboard-check" sub="Active exit checklists" accent />
          <StatCard label="Annual Turnover" value={`${localEmployees.length ? Math.round((onboardings.filter(o => o.companyId === selectedCompany.id && o.status === 'Completed').length / localEmployees.length) * 100) : 0}%`} icon="bi bi-graph-down" sub="Based on exit records" color="text-emerald-600" />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {isHRorAdmin && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Register Separation</h3>
              {exitSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                  <i className="bi bi-check-circle-fill"></i> Separation logged successfully!
                </div>
              )}
              <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                if (!exitEmp || !exitDate) return;
                setExitSuccess(true);
                setTimeout(() => { setExitSuccess(false); setExitEmp(''); setExitDate(''); setExitReason(''); }, 3000);
              }}>
                <div>
                  <Label>Employee *</Label>
                  <Select value={exitEmp} onChange={e => setExitEmp(e.target.value)} required>
                    <option value="">— Select Employee —</option>
                    {localEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeNumber})</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Exit Type *</Label>
                  <Select value={exitType} onChange={e => setExitType(e.target.value as typeof exitType)}>
                    <option value="Resignation">Voluntary Resignation</option>
                    <option value="Termination">Involuntary Termination</option>
                    <option value="Retirement">Retirement</option>
                  </Select>
                </div>
                <div><Label>Last Working Day *</Label><Input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} required /></div>
                <div><Label>Reason</Label><Input value={exitReason} onChange={e => setExitReason(e.target.value)} placeholder="Career progression, relocation…" /></div>
                <PrimaryBtn type="submit" icon="bi bi-person-x-fill">Initiate Separation</PrimaryBtn>
              </form>
            </div>
          )}

          <div className={`${isHRorAdmin ? 'lg:col-span-3' : 'lg:col-span-5'} bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden`}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Separation Log & Clearance</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Marcus Vance', role: 'Sales Manager', type: 'Resignation', date: '2026-07-31', done: 2, total: 5, status: 'In Progress', i: 0 },
                { name: 'Jin Li', role: 'Finance Analyst', type: 'Retirement', date: '2026-06-30', done: 5, total: 5, status: 'Cleared', i: 1 },
              ].map(entry => {
                const pct = (entry.done / entry.total) * 100;
                const clearanceTasks = ['IT equipment returned', 'Access revoked', 'Exit interview done', 'Final payslip issued', 'NOC issued'];
                return (
                  <div key={entry.name} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar first={entry.name.split(' ')[0]} last={entry.name.split(' ')[1]} index={entry.i} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{entry.name}</div>
                          <div className="text-xs text-slate-500">{entry.role} · {entry.type} · Last day: {entry.date}</div>
                        </div>
                      </div>
                      <Badge label={entry.status} variant={entry.status === 'Cleared' ? 'success' : 'warning'} />
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500">Clearance Progress</span>
                        <span className="font-semibold text-slate-700 tabular-nums">{entry.done}/{entry.total} tasks</span>
                      </div>
                      <ProgressBar value={pct} color={pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {clearanceTasks.map((t, ti) => (
                        <div key={t} className={`flex items-center gap-1.5 text-xs ${ti < entry.done ? 'text-emerald-700' : 'text-slate-400'}`}>
                          <i className={`bi bi-${ti < entry.done ? 'check-circle-fill' : 'circle'} text-sm`}></i>{t}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: DEPARTMENTS ──────────────────────────────────────────────────────
  if (activeView === 'hr-departments') {
    const companyDepts = departments.filter(d => d.companyId === selectedCompany.id);
    const deptIcons: Record<string, string> = { Engineering: '🔧', Finance: '💰', HR: '👥', Sales: '📈', Operations: '⚙️', IT: '💻', Legal: '⚖️', Marketing: '📢' };
    const deptColors = ['border-blue-200 bg-blue-50/50', 'border-emerald-200 bg-emerald-50/50', 'border-violet-200 bg-violet-50/50', 'border-amber-200 bg-amber-50/50', 'border-rose-200 bg-rose-50/50', 'border-sky-200 bg-sky-50/50', 'border-indigo-200 bg-indigo-50/50', 'border-pink-200 bg-pink-50/50'];

    return (
      <div className="space-y-6">
        <SectionHeader title="Department Directory" subtitle="Overview of all organizational departments, heads, and budgets."
          action={isHRorAdmin ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setDeptName(''); setDeptManager(''); setDeptParent(''); setShowDeptModal(true); }}>Add Department</PrimaryBtn> : undefined}
        />
        {showDeptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Add Department</h2>
              <div className="space-y-4">
                <div><Label>Department Name *</Label><Input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="Operations" /></div>
                <div><Label>Manager</Label><Select value={deptManager} onChange={e => setDeptManager(e.target.value)}><option value="">— Select manager —</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</Select></div>
                <div><Label>Reports To</Label><Select value={deptParent} onChange={e => setDeptParent(e.target.value)}><option value="">Top Level (no parent)</option>{departments.filter(d => d.companyId === selectedCompany.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
                <SecBtn onClick={() => setShowDeptModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                  if (!deptName) return void modalAlert('Department name required', { variant: 'warning' });
                  onAddDepartment({ companyId: selectedCompany.id, name: deptName, managerId: deptManager || undefined, budget: 0, parentId: deptParent || undefined });
                  setShowDeptModal(false); setDeptName('');
                }}>Create Department</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
        {editDeptModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Edit Department</h3>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Department Name</label>
              <input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Manager (employee)</label>
              <select value={editDeptManager} onChange={e => setEditDeptManager(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3">
                <option value="">Unassigned</option>
                {localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Budget</label>
              <input type="number" value={editDeptBudget} onChange={e => setEditDeptBudget(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Reports To</label>
              <select value={editDeptParent} onChange={e => setEditDeptParent(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4">
                <option value="">Top Level (no parent)</option>
                {departments.filter(d => d.companyId === selectedCompany.id && d.id !== editDeptModal?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => { onUpdateDepartment(editDeptModal.id, { name: editDeptName, managerId: editDeptManager || undefined, budget: Number(editDeptBudget), parentId: editDeptParent || undefined }); setEditDeptModal(null); }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">Save</button>
                <button onClick={() => setEditDeptModal(null)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Departments" value={companyDepts.length} icon="bi bi-diagram-3" sub="Active organizational units" />
          <StatCard label="Total Headcount" value={localEmployees.length} icon="bi bi-people-fill" sub="Staff across all departments" />
          <StatCard label="Avg Team Size" value={companyDepts.length > 0 ? (localEmployees.length / companyDepts.length).toFixed(1) : '0'} icon="bi bi-calculator" sub="Employees per department" accent />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companyDepts.map((dept, idx) => {
            const count = localEmployees.filter(e => e.department === dept.name).length;
            const icon = deptIcons[dept.name] || '🏢';
            const color = deptColors[idx % deptColors.length];
            const managerName = dept.managerId ? employees.find(e => e.id === dept.managerId) : null;
            return (
              <div key={dept.id} className={`border rounded-2xl p-5 hover:shadow-md transition-all cursor-default ${color}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{icon}</div>
                  <span className="text-lg font-bold tabular-nums text-slate-700">{count}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mb-0.5">{dept.name}</div>
                <div className="text-xs text-slate-500 mb-3">{managerName ? managerName.firstName + ' ' + managerName.lastName : 'Unassigned'}</div>
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><i className="bi bi-cash text-slate-400"></i>GHS {dept.budget.toLocaleString()}</div>
                </div>
                {isHRorAdmin && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                    <button onClick={() => { setEditDeptModal(dept); setEditDeptName(dept.name); setEditDeptManager(dept.managerId || ''); setEditDeptBudget(String(dept.budget)); setEditDeptParent(dept.parentId || ''); }} className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">Edit</button>
                    <button onClick={async () => { if (await modalConfirm(`Delete department "${dept.name}"?`, { variant: 'danger' })) onDeleteDepartment(dept.id); }} className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer transition-colors">Delete</button>
                  </div>
                )}
              </div>
            );
          })}
          {companyDepts.length === 0 && (
            <div className="col-span-full text-center text-sm text-slate-400 py-8">No departments yet. Click "Add Department" to create one.</div>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
