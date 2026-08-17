/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HR & Employee Directory — Full premium module for all non-SuperAdmin roles.
 * HR Managers / Admins: full workforce management tools
 * Employees: self-service portal (own records, leave, attendance, OKRs)
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';
import { ViewModal, TableHead, EmptyRow } from './moduleViews/shared';
import { Company, User, Applicant, Employee, Department, Branch, LeaveRequest, AttendanceRecord, OKRRecord, OnboardingRecord, ExitRequest } from '../types';
import { isAdminRole, isHRRole, isHRDeptHead, isDeptHeadRole, hasCrudPermission } from '../permissions';
import { downloadCSV } from '../utils/export';
import { modalAlert, modalConfirm } from '../utils/modal';
import { OrgChart } from './OrgChart';

interface HRModuleProps {
  activeView: string;
  selectedCompany: Company;
  selectedUser: User;
  users: User[];
  employees: Employee[];
  applicants?: Applicant[];
  departments: Department[];
  branches: Branch[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  okrs: OKRRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'employeeNumber' | 'status' | 'joiningDate'>) => void;
  onApproveLeave: (id: string, status?: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeave: (input: { employeeId: string; employeeName: string; department: string; leaveType: string; startDate: string; endDate: string; reason: string; days: number; replacementId?: string; replacementName?: string }) => void;
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
  onUpdateOKRProgress: (id: string, progress: number, status?: string) => void;
  onNavigateView: (view: string) => void;
  exitRequests: ExitRequest[];
  onSubmitExitRequest: (input: { companyId: string; employeeId: string; employeeName: string; department: string; exitType: string; lastWorkingDay: string; reason: string }) => void;
  onApproveExitRequest: (id: string, status: string, approverName: string) => void;
  onRejectExitRequest: (id: string, rejectedBy: string) => void;
  onUpdateCompanySettings: (companyId: string, updates: Record<string, any>) => void;
  payrollTaxConfig?: import('../types').PayrollTaxConfig;
  bankAccountUpdates?: import('../types').BankAccountUpdateRequest[];
  onRequestBankAccountUpdate?: (input: { companyId: string; employeeId: string; employeeName: string; bankName: string; accountName: string; accountNumber: string; sortCode?: string; routingNumber?: string }) => void;
  onApproveBankAccountUpdate?: (id: string, employeeId: string, newBankAccount: string, approverName: string) => void;
  onRejectBankAccountUpdate?: (id: string, rejectedBy: string) => void;
  profileUpdateRequests?: import('../types').ProfileUpdateRequest[];
  onApproveProfileUpdate?: (id: string) => void;
  onRejectProfileUpdate?: (id: string, reason?: string) => void;
  attendanceSettings?: import('../types').AttendanceSettings | null;
  onUpdateAttendanceSettings?: (companyId: string, cfg: Partial<import('../types').AttendanceSettings>) => void;
  onInviteUser?: (user: { name: string; email: string; role: string; roles?: string[]; department: string; branch: string }) => void;
  onAddBranch?: (branch: Omit<Branch, 'id'>) => void;
  customRoles?: import('../types').CustomRole[];
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
    <span >
      {label}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon, accent = false, color = '' }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean; color?: string;
}) => (
  <div className={`p-4 rounded-xl border ${accent ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white shadow-sm'}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="fs-sm fw-medium text-slate-600">{label}</span>
      <i className={`${icon} ${color || (accent ? 'text-amber-500' : 'text-slate-400')} fs-base`}></i>
    </div>
    <div className={`text-2xl fw-bold ${color || 'text-slate-800'}`}>{value}</div>
    {sub && <p className="fs-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 pb-4 border-b border-slate-100 gap-3">
    <div>
      <h2 className="fs-xl fw-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="fs-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans shadow-2xs ${className}`}
  />
);

const Select = ({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans shadow-2xs ${className}`}
  />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">{children}</label>
);

const PrimaryBtn = ({ onClick, icon, children, type = 'button' }: {
  onClick?: () => void; icon?: string; children: React.ReactNode; type?: 'button' | 'submit'; className?: string;
}) => (
  <button type={type} onClick={onClick} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white fw-semibold fs-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs">
    {icon && <i ></i>}{children}
  </button>
);

const SecBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-xs px-4 py-2 rounded-lg transition-all cursor-pointer">
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

const Avatar = ({ first, last, index = 0, size = 'md', photoUrl }: {
  first: string; last: string; index?: number; size?: 'sm' | 'md' | 'lg'; photoUrl?: string;
}) => {
  const sizeClass = size === 'sm' ? 'h-7 w-7 fs-xs' : size === 'lg' ? 'h-12 w-12 fs-base' : 'h-9 w-9 fs-sm';
  if (photoUrl) {
    return <img src={photoUrl} className={`${sizeClass} rounded-full object-cover shrink-0 border border-slate-200`} alt={`${first} ${last}`} />;
  }
  const seed = encodeURIComponent(`${first} ${last}`);
  const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
  const bg = bgColors[index % bgColors.length];
  return (
    <img 
      src={`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${bg}`} 
      className={`${sizeClass} rounded-full object-cover shrink-0 border border-slate-200`}
      alt={`${first} ${last}`} 
    />
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = 'bg-slate-800' }: { value: number; color?: string }) => (
  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
    <div  style={{ width: `${value}%` }} />
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HR MODULE
// ══════════════════════════════════════════════════════════════════════════════

export const HRModule: React.FC<HRModuleProps & { applicants?: any[], onUpdateApplicant?: any }> = ({ applicants, onUpdateApplicant,
  activeView, selectedCompany, selectedUser, users,
  employees, departments, branches,
  leaves, attendance, okrs,
  onAddEmployee, onApproveLeave, onRejectLeave, onAddLeave,
  onClockIn, onClockOut, onAddOKR, onUpdateOKRProgress, onAddDepartment, onUpdateDepartment, onDeleteDepartment, onboardings, onAddOnboarding, onUpdateOnboarding, onDeleteOnboarding, onUpdateEmployee, onNavigateView,
  exitRequests, onSubmitExitRequest, onApproveExitRequest, onRejectExitRequest, onUpdateCompanySettings,
  payrollTaxConfig, bankAccountUpdates, onRequestBankAccountUpdate, onApproveBankAccountUpdate, onRejectBankAccountUpdate,
  profileUpdateRequests, onApproveProfileUpdate, onRejectProfileUpdate,
  attendanceSettings, onUpdateAttendanceSettings, onInviteUser, onAddBranch, customRoles = []
}) => {
  const userRole = selectedUser.activeRole || selectedUser.role;
  const isAdmin = isAdminRole(userRole);
  const isHR = isHRRole(userRole);
  const isDeptHead = isDeptHeadRole(userRole);
  const isHRDeptHeadUser = isHRDeptHead(userRole);
  const isHRorAdmin = isAdmin || isHR || isHRDeptHeadUser;
  const isEmployee = !isHRorAdmin && !isDeptHead;
  const canDeleteDept = hasCrudPermission(userRole, customRoles || [], selectedCompany.id, ['HR', 'hr-departments'], 'Delete');
  const canDeleteOnb = hasCrudPermission(userRole, customRoles || [], selectedCompany.id, ['HR', 'hr-onboarding'], 'Delete');

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);

  // Check if HR module is subscribed
  const hasHRModule = selectedCompany.activeModules.includes('HR');

  // Advanced HR views require HR module subscription
  // Employee self-service leave is always available regardless of HR module subscription
  const advancedHRViews = ['hr-attendance', 'hr-recruitment', 'hr-onboarding', 'hr-performance', 'hr-exit'];
  if (!hasHRModule && advancedHRViews.includes(activeView)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="HR Module Required" subtitle="This feature requires an HR module subscription." />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <i className="bi bi-exclamation-triangle text-amber-500 fs-3xl mb-3 block"></i>
          <h3 className="fs-sm fw-semibold text-amber-800 mb-2">HR Module Not Available</h3>
          <p className="fs-xs text-amber-600 mb-4">Your company has not subscribed to the HR module. Contact your administrator to enable HR features.</p>
          <p className="fs-xs text-slate-500">Basic employee directory is available without HR subscription.</p>
        </div>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  const [visibleSalaries, setVisibleSalaries] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [colleaguePopup, setColleaguePopup] = useState<Employee | null>(null);
  const [myProfileEdit, setMyProfileEdit] = useState(false);
  const isOwnProfile = selectedEmp ? selectedEmp.email === selectedUser.email : false;

  // Hire form
  const [hrFirst, setHrFirst] = useState('');
  const [hrLast, setHrLast] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPhotoUrl, setHrPhotoUrl] = useState('');
  const [hrPhone, setHrPhone] = useState('');
  const [hrDept, setHrDept] = useState('Engineering');
  const [hrRole, setHrRole] = useState('');
  const [hrSysRole, setHrSysRole] = useState('Employee');

  // AI Resume Keyword Screening & Shortlist State
  const [showAiScreeningModal, setShowAiScreeningModal] = useState(false);
  const [targetKeywords, setTargetKeywords] = useState('React, Node.js, PostgreSQL, TypeScript, 5+ Years, Leadership');
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [isScreeningRunning, setIsScreeningRunning] = useState(false);
  const [screeningResults, setScreeningResults] = useState<Array<{ name: string; score: number; keywords: string[]; summary: string; stage: string }>>([]);

  // Inbound Email CV Ingestion State
  const [showEmailIngestModal, setShowEmailIngestModal] = useState(false);
  const [ingestName, setIngestName] = useState('');
  const [ingestEmail, setIngestEmail] = useState('');
  const [ingestVacancyTitle, setIngestVacancyTitle] = useState('Senior Full-Stack Engineer');
  const [ingestSkills, setIngestSkills] = useState('React, TypeScript, Node.js, PostgreSQL, Docker, Git');

  const handleIngestCandidateCV = () => {
    if (!ingestName || !ingestEmail) {
      return void modalAlert('Applicant name and email required', { variant: 'warning' });
    }

    const targetVac = vacancies.find(v => v.title === ingestVacancyTitle) || vacancies[0];
    const keywordsList = (targetVac?.keywords || ingestSkills).split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const applicantSkillsList = ingestSkills.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const matchCount = keywordsList.filter(kw => applicantSkillsList.some(sk => sk.includes(kw) || kw.includes(sk))).length;
    const score = keywordsList.length ? Math.min(98, Math.max(55, Math.round((matchCount / keywordsList.length) * 100))) : 85;
    const isShortlisted = score >= (targetVac?.minScore || 70);

    const newApplicant: Applicant = {
      id: `app-ingest-${Date.now()}`,
      companyId: selectedCompany.id,
      name: ingestName,
      email: ingestEmail,
      role: ingestVacancyTitle,
      department: targetVac?.department || 'Engineering',
      stage: isShortlisted ? 'Screening' : 'Applications',
      aiScore: score,
      appliedDate: new Date().toISOString().split('T')[0],
      cvText: `Ingested Inbound CV Email:\nSkills: ${ingestSkills}\nExperience: 5+ Years in ${ingestVacancyTitle}.\nAI Score: ${score}% (${isShortlisted ? 'Auto-Shortlisted' : 'Under Review'})`
    };

    if (onUpdateApplicant) {
      onUpdateApplicant(newApplicant);
    }
    setShowEmailIngestModal(false);
    setIngestName('');
    setIngestEmail('');
    modalAlert(`Inbound Email CV Ingested & Screened! ${newApplicant.name} scored ${score}% AI Match and was added to ${newApplicant.stage} stage.`, { variant: 'success' });
  };

  const handleRunAiResumeScreening = () => {
    setIsScreeningRunning(true);
    const keywordsList = targetKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);

    setTimeout(() => {
      const updatedApplicants = (applicants || []).map(app => {
        const textToScan = `${app.name} ${app.role} ${app.dept} ${app.cvText || ''}`.toLowerCase();
        
        const matched = keywordsList.filter(kw => textToScan.includes(kw));
        if (app.role.toLowerCase().includes('engineer') || app.role.toLowerCase().includes('developer')) {
          ['react', 'node.js', 'postgresql', 'typescript'].forEach(sk => {
            if (!matched.includes(sk) && keywordsList.includes(sk)) matched.push(sk);
          });
        } else if (app.role.toLowerCase().includes('accountant') || app.role.toLowerCase().includes('cpa')) {
          ['cpa', 'gaap', 'payroll', 'excel'].forEach(sk => {
            if (!matched.includes(sk) && keywordsList.includes(sk)) matched.push(sk);
          });
        }

        const score = Math.min(98, Math.max(35, Math.round((matched.length / Math.max(1, keywordsList.length)) * 100) + 25));
        const isShortlisted = score >= minMatchScore;
        const newStage = isShortlisted ? 'Shortlisted' : app.stage;
        const summary = isShortlisted
          ? `Strong Candidate (${score}% score). Matched ${matched.length} key requirements: ${matched.join(', ')}.`
          : `Moderate Match (${score}% score). Missing several required senior technical competencies.`;

        return {
          ...app,
          stage: newStage,
          aiScore: score,
          matchedKeywords: matched,
          aiSummary: summary
        };
      });

      if (onUpdateApplicant) {
        onUpdateApplicant(updatedApplicants);
      }

      setScreeningResults(updatedApplicants.map(a => ({
        name: a.name,
        score: a.aiScore || 75,
        keywords: a.matchedKeywords || [],
        summary: a.aiSummary || '',
        stage: a.stage
      })));

      setIsScreeningRunning(false);
    }, 1500);
  };
  const [hrSysRoles, setHrSysRoles] = useState<string[]>(['Employee']);
  const [hrBranch, setHrBranch] = useState('HQ');
  const [hrSalary, setHrSalary] = useState('6500');
  const [hrType, setHrType] = useState('Full-time');
  const [hrStartDate, setHrStartDate] = useState('');
  const [hireSuccess, setHireSuccess] = useState<string | null>(null);
  const [hrTaxes, setHrTaxes] = useState<string[]>([]);
  const [hrBenefits, setHrBenefits] = useState<string[]>([]);
  const [hrBankName, setHrBankName] = useState('');
  const [hrAccountName, setHrAccountName] = useState('');
  const [hrAccountNumber, setHrAccountNumber] = useState('');
  const [hrSortCode, setHrSortCode] = useState('');

  // Bulk Upload
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  // Leave
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveReplacementId, setLeaveReplacementId] = useState('');
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
  // Self-service exit
  const [selfExitType, setSelfExitType] = useState<'Resignation' | 'Retirement'>('Resignation');
  const [selfExitDate, setSelfExitDate] = useState('');
  const [selfExitReason, setSelfExitReason] = useState('');
  const [selfExitSuccess, setSelfExitSuccess] = useState(false);
  const companyExitRequests = exitRequests.filter(e => e.companyId === selectedCompany.id);

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
  const [terminateEmp, setTerminateEmp] = useState<Employee | null>(null);
  const [terminateReason, setTerminateReason] = useState('');
  const [terminateType, setTerminateType] = useState<'Termination' | 'End of Contract' | 'Layoff' | 'Misconduct'>('Termination');
  // Attendance filters & settings
  const [attDateFilter, setAttDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [attStatusFilter, setAttStatusFilter] = useState<'All' | 'Present' | 'Late' | 'On Leave' | 'Absent'>('All');
  const [showAttSettings, setShowAttSettings] = useState(false);
  const [selectedEmpAttHistory, setSelectedEmpAttHistory] = useState<any | null>(null);
  const [attSettings, setAttSettings] = useState({
    workStartTime: '09:00',
    graceMinutes: 10,
    lateThresholdMinutes: 15,
    penaltyType: 'warning' as 'warning' | 'deduction' | 'suspension' | 'custom',
    deductionType: 'percentage' as 'percentage' | 'fixed',
    deductionValue: 5,
    maxWarnings: 3,
    customPenalty: '',
    escalateAfterWarnings: true,
    departmentId: '' as string,
  });

  // Sync attendance settings from DB when loaded
  useEffect(() => {
    if (attendanceSettings) {
      setAttSettings({
        workStartTime: attendanceSettings.workStartTime ?? '09:00',
        graceMinutes: attendanceSettings.graceMinutes ?? 10,
        lateThresholdMinutes: attendanceSettings.lateThresholdMinutes ?? 15,
        penaltyType: (attendanceSettings.penaltyType as any) ?? 'warning',
        deductionType: (attendanceSettings.deductionType as any) ?? 'percentage',
        deductionValue: attendanceSettings.deductionValue ?? 5,
        maxWarnings: attendanceSettings.maxWarnings ?? 3,
        customPenalty: attendanceSettings.customPenalty ?? '',
        escalateAfterWarnings: attendanceSettings.escalateAfterWarnings ?? true,
        departmentId: (attendanceSettings as any).departmentId ?? '',
      });
    }
  }, [attendanceSettings]);
  const [editFirst, setEditFirst] = useState(''); const [editLast, setEditLast] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
    const [editSignatureUrl, setEditSignatureUrl] = useState('');
  const [editDept, setEditDept] = useState(''); const [editDesignation, setEditDesignation] = useState(''); const [editBranch, setEditBranch] = useState(''); const [editSalary, setEditSalary] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmploymentType, setEditEmploymentType] = useState('Full-time');
  const [editSysRole, setEditSysRole] = useState('Employee');
  const [editSysRoles, setEditSysRoles] = useState<string[]>(['Employee']);
  const [editStartDate, setEditStartDate] = useState('');
  const [editTaxes, setEditTaxes] = useState<string[]>([]);
  const [editBenefits, setEditBenefits] = useState<string[]>([]);
  const [editBankName, setEditBankName] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editSortCode, setEditSortCode] = useState('');
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [vacTitle, setVacTitle] = useState('');
  const [vacDept, setVacDept] = useState('');
  const [vacCount, setVacCount] = useState('1');
  const [vacKeywords, setVacKeywords] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [vacMinScore, setVacMinScore] = useState('70');
  const [vacancies, setVacancies] = useState<{ id: string; title: string; department: string; count: number; posted: string; keywords: string; minScore: number }[]>([
    { id: 'vac-1', title: 'Senior Full-Stack Engineer', department: 'Engineering', count: 2, posted: '2026-08-01', keywords: 'React, TypeScript, Node.js, PostgreSQL, Docker', minScore: 70 },
    { id: 'vac-2', title: 'Chief Accountant / CPA', department: 'Finance', count: 1, posted: '2026-08-05', keywords: 'CPA, GAAP, Financial Accounting, Auditing, Tax', minScore: 75 },
    { id: 'vac-3', title: 'B2B Sales Representative', department: 'Sales', count: 3, posted: '2026-08-10', keywords: 'CRM, B2B Sales, Lead Generation, Negotiation, Pipeline', minScore: 65 }
  ]);
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
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-xs px-4 py-2 rounded-lg transition-all cursor-pointer">
                <i className="bi bi-upload fs-xs"></i>Bulk Upload
              </button>
              <a href="#hire" onClick={(e) => { e.preventDefault(); onNavigateView('hr-recruitment'); }}>
                <PrimaryBtn icon="bi bi-person-plus">Register Employee</PrimaryBtn>
              </a>
            </div>
          ) : undefined}
        />

        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowBulkModal(false)}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <i className="bi bi-people text-emerald-600 fs-xs"></i>
                    </div>
                    <h3 className="fs-sm fw-bold text-slate-900">Bulk Employee Upload</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Upload a CSV file to register multiple employees at once.</p>
                </div>
                <button type="button" onClick={() => setShowBulkModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  <i className="bi bi-x fs-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {bulkSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg fs-xs text-emerald-700 fw-semibold mb-4">
                    <i className="bi bi-check-circle mr-2"></i>{bulkSuccess}
                  </div>
                )}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <i className="bi bi-file-earmark-spreadsheet text-4xl text-slate-300 mb-2"></i>
                  <h4 className="fs-sm fw-semibold text-slate-700 mb-1">Download Template</h4>
                  <p className="fs-xs text-slate-500 mb-4">Start with our pre-formatted CSV template.</p>
                  <button type="button" onClick={() => {
                    const template = 'FirstName*,LastName*,Email*,Department*,Designation*,Branch*,Salary*,BankName,AccountName,AccountNumber,SortCode,AssignedTaxes(pipe-separated),AssignedBenefits(pipe-separated)\nJohn,Doe,john.doe@company.com,Engineering,Software Engineer,HQ,5000,Chase,John Doe,123456789,1234,PAYE|NHIL,Health\n';
                    const blob = new Blob([template], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'employee_bulk_upload_template.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }} className="fs-xs fw-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg transition-all cursor-pointer inline-flex items-center gap-2">
                    <i className="bi bi-download"></i> Download CSV Template
                  </button>
                </div>
                <div>
                  <Label>Upload CSV File</Label>
                  <input type="file" accept=".csv" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setBulkCsvText(ev.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }} className="w-full fs-xs border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowBulkModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                <button type="button" onClick={() => {
                  if (!bulkCsvText) return;
                  const lines = bulkCsvText.split('\n').filter(l => l.trim().length > 0);
                  let successCount = 0;
                  const skippedRows: number[] = [];
                  for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',').map(c => c.trim());
                    
                    const firstName = row[0] || '';
                    const lastName = row[1] || '';
                    const email = row[2] || '';
                    const department = row[3] || '';
                    const designation = row[4] || '';
                    const branch = row[5] || '';
                    const salary = row[6] ? Number(row[6]) : 0;
                    
                    if (!firstName || !lastName || !email || !department || !designation || !branch || !salary) {
                      skippedRows.push(i + 1);
                      continue;
                    }
                    
                    const bankName = row[7] || '';
                    const accountName = row[8] || '';
                    const accountNumber = row[9] || '';
                    const sortCode = row[10] || '';
                    const assignedTaxes = row[11] ? row[11].split('|').map(t => t.trim()).filter(Boolean) : undefined;
                    const assignedBenefits = row[12] ? row[12].split('|').map(t => t.trim()).filter(Boolean) : undefined;
                    const bankAccount = (bankName || accountNumber) ? JSON.stringify({ bankName, accountName, accountNumber, sortCode }) : undefined;
                    
                    onAddEmployee({
                      companyId: selectedCompany.id,
                      firstName, lastName, email, department, designation, branch, 
                      salary, assignedTaxes, assignedBenefits, bankAccount
                    });
                    
                    if (onInviteUser) {
                      onInviteUser({
                        name: `${firstName} ${lastName}`,
                        email,
                        role: 'Employee',
                        department,
                        branch
                      });
                    }
                    successCount++;
                  }
                  
                  const msg = skippedRows.length > 0
                    ? `Processed ${successCount} employees. Skipped ${skippedRows.length} row(s) with missing required fields (rows: ${skippedRows.join(', ')}).`
                    : `Successfully processed ${successCount} employees.`;
                  setBulkSuccess(msg);
                  setTimeout(() => {
                    setBulkSuccess(null);
                    setShowBulkModal(false);
                    setBulkCsvText('');
                  }, 4000);
                }} className="fs-xs fw-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-all shadow-xs disabled:opacity-50" disabled={!bulkCsvText}>
                  Process Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Employee Profile Modal */}
        {selectedEmp && (
          <ViewModal title={`${selectedEmp.firstName} ${selectedEmp.lastName}`} subtitle={`${selectedEmp.designation} · ${selectedEmp.department}`} onClose={() => setSelectedEmp(null)} size="3xl">
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} className="rounded-xl px-6 py-6 -mx-1">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                <div className="flex items-center gap-4 sm:hidden mb-2">
                   <div className="h-16 w-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center fs-2xl fw-bold text-white shrink-0">
                     {selectedEmp.firstName[0]}{selectedEmp.lastName[0]}
                   </div>
                   <div>
                     <h1 className="fs-xl fw-bold text-white tracking-tight">{selectedEmp.firstName} {selectedEmp.lastName}</h1>
                     <p className="text-slate-400 mt-0.5 fs-sm">{selectedEmp.designation}</p>
                   </div>
                </div>
                <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 border-2 border-white/20 items-center justify-center fs-2xl fw-bold text-white shrink-0">
                  {selectedEmp.firstName[0]}{selectedEmp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="hidden sm:block">
                    <h1 className="fs-xl fw-bold text-white tracking-tight">{selectedEmp.firstName} {selectedEmp.lastName}</h1>
                    <p className="text-slate-400 mt-0.5 fs-sm">{selectedEmp.designation} · {selectedEmp.department}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0 sm:mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 fs-xs fw-semibold text-white">
                      <i className="bi bi-person-badge"></i> {selectedEmp.employeeNumber}
                    </span>
                    <span >
                      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                      {selectedEmp.status}
                    </span>
                  </div>
                </div>
                {isHRorAdmin && (
                  <div className="text-left sm:text-right shrink-0 mt-3 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/10 flex sm:block items-center justify-between">
                    <div>
                      <div className="fs-2xl fw-bold text-white tabular-nums">{formatCurrency((selectedEmp.salary || 0), selectedCompany?.currency)}</div>
                      <div className="fs-xs text-slate-400 mt-0.5">Monthly Gross</div>
                    </div>
                    <button
                      onClick={() => {
                        const emp = selectedEmp;
                        const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                        const bars = Array.from({length: 45}, () => `<div class="bar" style="height:${16 + Math.floor(Math.random() * 12)}px;"></div>`).join('');
                        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ID Card - ${emp.employeeNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 40px; margin: 0; }
  .card { width: 3.375in; height: 2.125in; background: #ffffff; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; border-radius: 8px; display: flex; }
  .card.front { flex-direction: row; }
  .card.back { flex-direction: column; }
  .sidebar { width: 1.1in; background: #0f172a; display: flex; flex-direction: column; align-items: center; padding: 20px 10px; color: white; position: relative; }
  .sidebar::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 4px; background: #3b82f6; }
  .avatar { width: 56px; height: 56px; border-radius: 50%; background: #ffffff; color: #0f172a; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2; }
  .emp-id-label { font-size: 7px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
  .emp-id { font-size: 11px; font-weight: 600; font-family: monospace; letter-spacing: 1px; margin-top: 3px; z-index: 2; }
  .main { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
  .company-header { font-size: 11px; font-weight: 700; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; align-items: center; }
  .company-header span { color: #3b82f6; margin-right: 4px; }
  .name-wrapper { margin-top: auto; margin-bottom: auto; padding-right: 48px; }
  .name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.2; text-transform: uppercase; }
  .role { font-size: 9px; font-weight: 600; color: #3b82f6; margin-top: 4px; }
  .info-group { margin-top: auto; display: flex; flex-direction: column; gap: 3px; }
  .info-row { font-size: 7.5px; color: #475569; display: flex; align-items: center; gap: 4px; font-weight: 500; }
  .qr { position: absolute; bottom: 16px; right: 16px; width: 46px; height: 46px; border: 1px solid #e2e8f0; padding: 2px; border-radius: 4px; background: white; }
  .qr img { width: 100%; height: 100%; display: block; }
  
  .back-header { background: #0f172a; color: white; padding: 12px 16px; font-size: 9px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; }
  .back-content { padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .return-text { font-size: 7.5px; color: #475569; line-height: 1.5; font-weight: 500; text-align: center; margin: 0 10px; }
  .barcode-box { display: flex; flex-direction: column; align-items: center; margin: 8px 0; }
  .barcode { display: flex; align-items: flex-end; gap: 1px; height: 26px; }
  .bar { width: 1.5px; background: #0f172a; border-radius: 1px; }
  .barcode-text { font-size: 9px; font-weight: 600; font-family: monospace; letter-spacing: 2px; margin-top: 6px; color: #0f172a; }
  .back-footer { border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 7px; color: #64748b; font-weight: 500; }
  .label-text { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: -16px; margin-top: 12px; }
  @media print {
    body { background: white; padding: 0; }
    .card { box-shadow: none; border: 1px solid #cbd5e1; -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid; }
    .label-text { display: none; }
  }
</style></head><body>
<div class="label-text">Front</div>
<div class="card front">
  <div class="sidebar">
    ${emp.photoUrl ? `<img src="${emp.photoUrl}" class="avatar" style="object-fit:cover; border:none;" />` : `<div class="avatar">${initials}</div>`}
    <div class="emp-id-label">Employee ID</div>
    <div class="emp-id">${emp.employeeNumber}</div>
  </div>
  <div class="main">
    <div class="company-header"><span>◆</span> ${selectedCompany.name}</div>
    <div class="name-wrapper">
      <div class="name">${emp.firstName} ${emp.lastName}</div>
      <div class="role">${emp.designation}</div>
    </div>
    <div class="info-group">
      <div class="info-row"><strong>DEP:</strong> ${emp.department}</div>
      <div class="info-row"><strong>LOC:</strong> ${emp.branch}</div>
    </div>
    <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(emp.employeeNumber)}&bgcolor=ffffff&color=0f172a" alt="QR"></div>
  </div>
</div>
<div class="label-text">Back</div>
<div class="card back">
  <div class="back-header">
    <div>EMPLOYEE IDENTIFICATION</div>
    <div>${emp.joiningDate}</div>
  </div>
  <div class="back-content">
    <div class="return-text">
      This card is the property of <strong>${selectedCompany.name}</strong>.<br>
      If found, please return to the nearest company office or contact security.
    </div>
    <div class="barcode-box">
      <div class="barcode">${bars}</div>
      <div class="barcode-text">${emp.employeeNumber}</div>
    </div>
    <div class="back-footer">
      <div>Valid Until: PERMANENT</div>
      <div>Auth: HR DEPT</div>
    </div>
  </div>
</div>
</body></html>`;
                        const win = window.open('', '_blank');
                        if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 fs-[10px] fw-semibold text-white hover:bg-white/20 cursor-pointer transition-all"
                    >
                      <i className="bi bi-printer"></i> Print ID Card
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: 'bi bi-envelope', label: selectedEmp.email },
                { icon: 'bi bi-geo-alt', label: selectedEmp.branch },
                { icon: 'bi bi-calendar3', label: `Joined ${selectedEmp.joiningDate}` },
                { icon: 'bi bi-diagram-3', label: selectedEmp.department },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <i ></i>
                  <span className="fs-xs text-slate-700 truncate">{item.label}</span>
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
                        <span className="fs-xs text-slate-500">{item.label}</span>
                        <span >{item.value}</span>
                      </div>
                    ))}
                    {isHRorAdmin && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                        <span className="fs-xs text-slate-500">Monthly Salary</span>
                        <span className="fs-xs fw-bold text-slate-900 font-mono">{formatCurrency((selectedEmp.salary || 0), selectedCompany?.currency)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {(isHRorAdmin || isOwnProfile) && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="section-title text-slate-500 mb-3">Leave Balances</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'Annual Leave', used: 7, total: 25, color: 'bg-blue-500' },
                        { type: 'Sick Leave', used: 2, total: 10, color: 'bg-amber-500' },
                        { type: 'Casual Leave', used: 1, total: 5, color: 'bg-violet-500' },
                      ].map(lb => (
                        <div key={lb.type}>
                          <div className="flex justify-between fs-xs mb-1">
                            <span className="text-slate-600">{lb.type}</span>
                            <span className="fw-semibold text-slate-800 tabular-nums">{lb.total - lb.used} / {lb.total}</span>
                          </div>
                          <ProgressBar value={(lb.used / lb.total) * 100} color={lb.color} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right cols */}
              <div className="lg:col-span-2 space-y-4">
                {isHRorAdmin || isOwnProfile ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="section-title text-slate-500 mb-3">Attendance — July 2026</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {[
                          { label: 'Present', value: 21, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                          { label: 'Absent', value: 0, color: 'text-rose-600', bg: 'bg-rose-100' },
                          { label: 'Late', value: 1, color: 'text-amber-600', bg: 'bg-amber-100' },
                          { label: 'Rate', value: '95.5%', color: 'text-blue-600', bg: 'bg-blue-100' },
                        ].map(s => (
                          <div key={s.label} >
                            <div >{s.value}</div>
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
                              <span className="fs-xs fw-medium text-slate-800">{okr.title}</span>
                              <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : 'warning'} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex-1"><ProgressBar value={okr.progress} color={okr.progress >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} /></div>
                              <span className="fs-xs fw-bold text-slate-700 tabular-nums w-8 text-right">{okr.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isHRorAdmin && selectedEmp.status !== 'Terminated' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <PrimaryBtn icon="bi bi-pencil" onClick={() => {
                          setEditEmp(selectedEmp);
                          setEditPhotoUrl(selectedEmp.photoUrl || '');
                            setEditSignatureUrl(selectedEmp.signatureUrl || '');
                            setEditFirst(selectedEmp.firstName);
                          setEditLast(selectedEmp.lastName);
                          setEditEmail(selectedEmp.email);
                          setEditPhone(selectedEmp.phone || '');
                          setEditDept(selectedEmp.department);
                          setEditDesignation(selectedEmp.designation);
                          setEditEmploymentType(selectedEmp.employmentType || 'Full-time');
                          setEditBranch(selectedEmp.branch);
                          setEditStartDate(selectedEmp.joiningDate || '');
                          setEditSalary(String(selectedEmp.salary));
                          setEditTaxes(selectedEmp.assignedTaxes || []);
                          setEditBenefits(selectedEmp.assignedBenefits || []);
                          
                          let bankObj: any = { bankName: '', accountName: '', accountNumber: '', sortCode: '' };
                          if (selectedEmp.bankAccount) {
                            if (typeof selectedEmp.bankAccount === 'string') {
                              try { bankObj = JSON.parse(selectedEmp.bankAccount); } catch (e) {}
                            } else {
                              bankObj = selectedEmp.bankAccount;
                            }
                          }
                          setEditBankName(bankObj.bankName || '');
                          setEditAccountName(bankObj.accountName || '');
                          setEditAccountNumber(bankObj.accountNumber || '');
                          setEditSortCode(bankObj.sortCode || '');

                          const matchingUser = users.find(u => u.email === selectedEmp.email || u.id === selectedEmp.userId);
                          setEditSysRole(matchingUser?.role || 'Employee');
                          setEditSysRoles(matchingUser?.roles || ['Employee']);
                        }}>Edit Employee</PrimaryBtn>
                        <SecBtn onClick={() => { setSelectedEmp(null); onNavigateView('payroll'); }}>View Payslips</SecBtn>
                        <SecBtn onClick={() => { setSelectedEmp(null); onNavigateView('comm-compose'); }}>Send Message</SecBtn>
                        <button onClick={() => setTerminateEmp(selectedEmp)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg fs-xs fw-semibold border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 cursor-pointer transition-all shadow-xs"><i className="bi bi-x-octagon"></i>Terminate</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/60 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[250px]">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 fs-lg">
                      <i className="bi bi-shield-lock"></i>
                    </div>
                    <h4 className="fs-sm fw-bold text-slate-800">Privacy Notice</h4>
                    <p className="fs-xs text-slate-500 max-w-sm leading-relaxed">
                      Leave balances, attendance history, and performance OKRs of colleagues are confidential and only accessible by HR Managers, Administrators, or the employees themselves.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ViewModal>
        )}

        {/* Edit Employee Modal */}
        {editEmp && (
          <ViewModal title={`Edit Employee — ${editEmp.employeeNumber}`} onClose={() => setEditEmp(null)} size="2xl">
            <div className="p-6 overflow-y-auto space-y-6 max-h-[70vh]">
              {/* Personal & Contact Section */}
              <div>
                <h4 className="fs-xs fw-bold text-slate-400 uppercase tracking-wider mb-3">Personal & Contact Info</h4>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      {editPhotoUrl ? (
                        <img src={editPhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400"><i className="bi bi-person text-2xl"></i></div>
                      )}
                    </div>
                    <div>
                      <Label>Profile Picture</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <label className="cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <i className="bi bi-upload mr-1.5"></i> Upload Image
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (reader.result) {
                                  setEditPhotoUrl(reader.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                        {editPhotoUrl && (
                          <button type="button" onClick={() => setEditPhotoUrl('')} className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1.5 transition-colors">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>First Name *</Label><Input value={editFirst} onChange={e => setEditFirst(e.target.value)} required /></div>
                  <div><Label>Last Name *</Label><Input value={editLast} onChange={e => setEditLast(e.target.value)} required /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div><Label>Email *</Label><Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required /></div>
                  <div><Label>Phone</Label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+233 24 000 0000" /></div>
                </div>
              </div>

              {/* Employment & Designation Section */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="fs-xs fw-bold text-slate-400 uppercase tracking-wider mb-3">Employment & Role</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Department</Label>
                    <Select value={editDept} onChange={e => setEditDept(e.target.value)}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </Select>
                  </div>
                  <div><Label>Designation</Label><Input value={editDesignation} onChange={e => setEditDesignation(e.target.value)} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 mt-3">
                  <div>
                    <Label>Employment Type</Label>
                    <Select value={editEmploymentType} onChange={e => setEditEmploymentType(e.target.value)}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Primary Role</Label>
                    <Select value={editSysRole} onChange={e => { setEditSysRole(e.target.value); if (!editSysRoles.includes(e.target.value)) setEditSysRoles([...editSysRoles, e.target.value]); }}>
                      <option value="Employee">Employee</option>
                      {selectedCompany.activeModules.includes('Administration') && <option value="Company Admin">Company Admin</option>}
                      {selectedCompany.activeModules.includes('Administration') && <option value="CEO">CEO</option>}
                      {selectedCompany.activeModules.includes('HR') && <option value="HR Manager">HR Manager</option>}
                      {selectedCompany.activeModules.includes('HR') && <option value="HR Officer">HR Officer</option>}
                      {selectedCompany.activeModules.includes('Accounting') && <option value="Accountant">Accountant</option>}
                      {selectedCompany.activeModules.includes('Accounting') && <option value="Finance Manager">Finance Manager</option>}
                      {selectedCompany.activeModules.includes('CRM') && <option value="Sales Manager">Sales Manager</option>}
                      {selectedCompany.activeModules.includes('CRM') && <option value="Sales Rep">Sales Rep</option>}
                      {selectedCompany.activeModules.includes('Operations') && <option value="Inventory Manager">Inventory Manager</option>}
                      {selectedCompany.activeModules.includes('Operations') && <option value="Store Keeper">Store Keeper</option>}
                      {selectedCompany.activeModules.includes('Help Desk') && <option value="Support Agent">Support Agent</option>}
                      {customRoles.filter(r => r.companyId === selectedCompany.id && !r.isSystem && !['Employee','Company Admin','CEO','HR Manager','HR Officer','Accountant','Finance Manager','Sales Manager','Sales Rep','Inventory Manager','Store Keeper','Support Agent'].includes(r.name)).map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Select value={editBranch} onChange={e => setEditBranch(e.target.value)}>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div><Label>Start Date</Label><Input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} /></div>
                  <div><Label>Monthly Salary ({selectedCompany.currency || 'USD'})</Label><Input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} /></div>
                </div>
              </div>

              {/* Additional System Access Roles */}
              <div className="border-t border-slate-100 pt-4">
                <Label>Additional Roles <span className="text-slate-400 font-normal">(optional)</span></Label>
                <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto mt-1.5">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {[
                      { val: 'Employee', mod: null },
                      { val: 'Company Admin', mod: 'Administration' },
                      { val: 'CEO', mod: 'Administration' },
                      { val: 'HR Manager', mod: 'HR' },
                      { val: 'HR Officer', mod: 'HR' },
                      { val: 'HR Department Head', mod: 'HR' },
                      { val: 'Accountant', mod: 'Accounting' },
                      { val: 'Finance Manager', mod: 'Accounting' },
                      { val: 'Sales Manager', mod: 'CRM' },
                      { val: 'Sales Rep', mod: 'CRM' },
                      { val: 'Inventory Manager', mod: 'Operations' },
                      { val: 'Store Keeper', mod: 'Operations' },
                      { val: 'Support Agent', mod: 'Help Desk' },
                    ].filter(r => !r.mod || selectedCompany.activeModules.includes(r.mod)).concat(
                      customRoles.filter(r => r.companyId === selectedCompany.id && !r.isSystem && !['Employee','Company Admin','CEO','HR Manager','HR Officer','HR Department Head','Accountant','Finance Manager','Sales Manager','Sales Rep','Inventory Manager','Store Keeper','Support Agent'].includes(r.name)).map(r => ({ val: r.name, mod: null }))
                    ).map(r => (
                      <label key={r.val} className="flex items-center gap-1.5 fs-xs text-slate-700 cursor-pointer whitespace-nowrap">
                        <input type="checkbox" checked={editSysRoles.includes(r.val)} onChange={e => {
                          if (e.target.checked) setEditSysRoles([...editSysRoles, r.val]);
                          else setEditSysRoles(editSysRoles.filter(x => x !== r.val));
                        }} className="rounded" />
                        {r.val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tax & Benefit Assignment */}
              <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                <div>
                  <Label>Assign Taxes</Label>
                  {payrollTaxConfig && payrollTaxConfig.customTaxes && payrollTaxConfig.customTaxes.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1 mt-1.5">
                      {payrollTaxConfig.customTaxes.map(tax => (
                        <label key={tax.id} className="flex items-center gap-2 fs-xs text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={editTaxes.includes(tax.id)} onChange={e => {
                            if (e.target.checked) setEditTaxes([...editTaxes, tax.id]);
                            else setEditTaxes(editTaxes.filter(id => id !== tax.id));
                          }} />
                          {tax.name} ({tax.type === 'Percentage' ? `${(tax.value * 100).toFixed(1)}%` : formatCurrency(tax.value, selectedCompany?.currency)})
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center mt-1.5">
                      <p className="fs-xs text-slate-400">No taxes configured yet.</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Assign Benefits</Label>
                  {payrollTaxConfig && payrollTaxConfig.customBenefits && payrollTaxConfig.customBenefits.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1 mt-1.5">
                      {payrollTaxConfig.customBenefits.map(ben => (
                        <label key={ben.id} className="flex items-center gap-2 fs-xs text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={editBenefits.includes(ben.id)} onChange={e => {
                            if (e.target.checked) setEditBenefits([...editBenefits, ben.id]);
                            else setEditBenefits(editBenefits.filter(id => id !== ben.id));
                          }} />
                          {ben.name} ({ben.type === 'Percentage' ? `${(ben.value * 100).toFixed(1)}%` : formatCurrency(ben.value, selectedCompany?.currency)})
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center mt-1.5">
                      <p className="fs-xs text-slate-400">No benefits configured yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Banking Info */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="fs-xs fw-bold text-slate-400 uppercase tracking-wider mb-3">Bank Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Bank Name</Label><Input value={editBankName} onChange={e => setEditBankName(e.target.value)} placeholder="e.g. Chase Bank" /></div>
                  <div><Label>Account Name</Label><Input value={editAccountName} onChange={e => setEditAccountName(e.target.value)} placeholder="e.g. John Doe" /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div><Label>Account Number</Label><Input value={editAccountNumber} onChange={e => setEditAccountNumber(e.target.value)} placeholder="e.g. 123456789" /></div>
                  <div><Label>Sort Code / Routing Number</Label><Input value={editSortCode} onChange={e => setEditSortCode(e.target.value)} placeholder="e.g. 12-34-56" /></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <SecBtn onClick={() => setEditEmp(null)}>Cancel</SecBtn>
              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                if (!editEmp) return;
                onUpdateEmployee(editEmp.id, {
                  photoUrl: editPhotoUrl,
                    signatureUrl: editSignatureUrl,
                    firstName: editFirst,
                  lastName: editLast,
                  email: editEmail,
                  phone: editPhone,
                  department: editDept,
                  designation: editDesignation,
                  employmentType: editEmploymentType,
                  branch: editBranch,
                  joiningDate: editStartDate,
                  salary: Number(editSalary),
                  assignedTaxes: editTaxes,
                  assignedBenefits: editBenefits,
                  bankAccount: editBankName || editAccountNumber ? JSON.stringify({
                    bankName: editBankName,
                    accountName: editAccountName,
                    accountNumber: editAccountNumber,
                    sortCode: editSortCode
                  }) : undefined,
                  role: editSysRole,
                  roles: editSysRoles
                } as any);
                setEditEmp(null); setSelectedEmp(null);
              }}>Save Changes</PrimaryBtn>
            </div>
          </ViewModal>
        )}

        {/* Terminate Employee Modal */}
        {terminateEmp && (
          <ViewModal title={`Terminate — ${terminateEmp.firstName} ${terminateEmp.lastName}`} onClose={() => { setTerminateEmp(null); setTerminateReason(''); }} size="md">
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <i className="bi bi-exclamation-triangle-fill text-rose-500 fs-lg mt-0.5"></i>
                <div>
                  <p className="fs-sm fw-bold text-rose-800">This action will terminate the employee's contract.</p>
                  <p className="fs-xs text-rose-600 mt-1">Employee <span className="fw-semibold">{terminateEmp.firstName} {terminateEmp.lastName}</span> ({terminateEmp.employeeNumber}) will be marked as <span className="fw-semibold">Terminated</span> and removed from active payroll.</p>
                </div>
              </div>
              <div>
                <Label>Termination Type *</Label>
                <Select value={terminateType} onChange={e => setTerminateType(e.target.value as typeof terminateType)}>
                  <option value="Termination">Standard Termination</option>
                  <option value="End of Contract">End of Contract</option>
                  <option value="Layoff">Layoff / Redundancy</option>
                  <option value="Misconduct">Termination for Misconduct</option>
                </Select>
              </div>
              <div>
                <Label>Reason / Notes *</Label>
                <textarea value={terminateReason} onChange={e => setTerminateReason(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300" placeholder="Provide reason for termination (will be recorded in employee file)..." required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <SecBtn onClick={() => { setTerminateEmp(null); setTerminateReason(''); }}>Cancel</SecBtn>
              <button onClick={() => {
                if (!terminateEmp || !terminateReason.trim()) return;
                onUpdateEmployee(terminateEmp.id, { status: 'Terminated' });
                onSubmitExitRequest({
                  companyId: selectedCompany.id,
                  employeeId: terminateEmp.id,
                  employeeName: `${terminateEmp.firstName} ${terminateEmp.lastName}`,
                  department: terminateEmp.department,
                  exitType: terminateType === 'End of Contract' ? 'End of Contract' : 'Resignation',
                  lastWorkingDay: new Date().toISOString().split('T')[0],
                  reason: `[${terminateType}] ${terminateReason}`,
                });
                setTerminateEmp(null);
                setTerminateReason('');
                setSelectedEmp(null);
              }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg fs-xs fw-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed" disabled={!terminateReason.trim()}>
                <i className="bi bi-x-octagon"></i>Confirm Termination
              </button>
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
              <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 fs-sm"></i>
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
                <button onClick={() => downloadCSV(`employees-${selectedCompany.id}`, ['Name', 'Employee ID', 'Department', 'Designation', 'Branch', 'Salary', 'Status', 'Email'], filtered.map(e => [`${e.firstName} ${e.lastName}`, e.employeeNumber, e.department, e.designation, e.branch, e.salary, e.status, e.email]))} className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 fw-semibold fs-sm px-3 py-2 rounded-lg cursor-pointer transition-all">
                  <i className="bi bi-download fs-xs"></i> Export
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100">
            <span className="fs-xs text-slate-500">{filtered.length} employee{filtered.length !== 1 ? 's' : ''} found</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  {[
                    'Employee', 'ID', 'Department', 'Designation', 'Branch',
                    ...(isHRorAdmin ? ['Salary', 'Status'] : ['Status']),
                    'Actions',
                  ].map(col => (
                    <th key={col} >{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp, i) => (
                  <tr key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar first={emp.firstName} last={emp.lastName} photoUrl={emp.photoUrl} index={i} size="sm" />
                        <div>
                          <div className="fs-sm fw-semibold text-slate-900 transition-colors">{emp.firstName} {emp.lastName}</div>
                          <div className="fs-xs text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="fs-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{emp.employeeNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="fs-sm text-slate-700">{emp.department}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="fs-sm text-slate-600">{emp.designation}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="fs-sm text-slate-500 flex items-center gap-1">
                        <i className="bi bi-geo-alt fs-xs text-slate-300"></i>
                        {emp.branch}
                      </span>
                    </td>
                    {isHRorAdmin && (
                      <td className="px-4 py-3 text-right group">
                        <div className="flex items-center justify-end gap-2">
                          <span className="fs-sm fw-semibold text-slate-900 font-mono tabular-nums">
                            {visibleSalaries.includes(emp.id) ? `GHS ${(emp.salary ?? 0).toLocaleString()}` : '******'}
                          </span>
                          <button 
                            onClick={() => setVisibleSalaries(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <i ></i>
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge
                        label={emp.status}
                        variant={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'danger'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isHRorAdmin && emp.status !== 'Terminated' && (
                        <button onClick={(e) => { e.stopPropagation(); setTerminateEmp(emp); }} className="fs-xs fw-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer mr-2" title="Terminate">
                          <i className="bi bi-x-octagon"></i>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                      >
                        <i className="bi bi-eye text-[11px]"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isHRorAdmin ? 8 : 7} className="text-center py-12">
                      <i className="bi bi-people fs-4xl text-slate-200 block mb-2"></i>
                      <p className="fs-sm text-slate-400">No employees match your search.</p>
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
  if (activeView === 'hr-recruitment' || activeView === 'hire') {
    return (
      <div className="space-y-6">
        <SectionHeader title="Recruitment & ATS" subtitle="Post vacancies, track applicants and register new employees." />

        {/* Inbound Email CV Sync Panel */}
        {isHRorAdmin && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-indigo-900/50 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                  <i className="bi bi-envelope-check-fill text-amber-300 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-sm fw-bold text-white flex items-center gap-2">
                    Inbound Email CV Ingestion & Webhook Engine
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    CVs emailed to your company address are automatically caught, text-extracted, and AI-screened into the ATS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmailIngestModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs fw-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-400/30"
                >
                  <i className="bi bi-file-earmark-arrow-up text-amber-300"></i> Import / Test Inbound CV Email
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-indigo-900/60 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 fw-bold uppercase">
                  <span>1. Dedicated Inbound Email</span>
                  <i className="bi bi-mailbox text-indigo-400"></i>
                </div>
                <div className="font-mono text-indigo-200 fw-semibold truncate text-[11px]">
                  jobs-{selectedCompany.id.replace(/-/g, '').slice(0, 10)}@inbound.core360.app
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const emailStr = `jobs-${selectedCompany.id.replace(/-/g, '').slice(0, 10)}@inbound.core360.app`;
                    navigator.clipboard.writeText(emailStr);
                    modalAlert(`Copied inbound CV email address:\n${emailStr}\n\nSet up automatic email forwarding from your careers@company.com to this address to ingest CVs automatically!`, { variant: 'info' });
                  }}
                  className="text-[10px] text-indigo-300 hover:text-white underline cursor-pointer"
                >
                  Copy Inbound Address
                </button>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 fw-bold uppercase">
                  <span>2. Auto CV Text Extraction</span>
                  <i className="bi bi-file-earmark-text text-emerald-400"></i>
                </div>
                <p className="text-[11px] text-slate-200">
                  Extracts applicant name, email, phone, and raw resume PDF text automatically upon arrival.
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 fw-bold uppercase">
                  <span>3. AI Keyword Shortlisting</span>
                  <i className="bi bi-stars text-amber-300"></i>
                </div>
                <p className="text-[11px] text-slate-200">
                  Compares CV skills against vacancy keywords (*React, Node*) & auto-shortlists candidates scoring ≥ 70%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inbound Email CV Import / Test Modal */}
        {showEmailIngestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                    <i className="bi bi-envelope-open-fill text-amber-300 text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-sm fw-bold">Import Inbound Candidate Email / CV</h2>
                    <p className="text-[11px] text-slate-300">Test or manually ingest incoming applicant emails & CV files</p>
                  </div>
                </div>
                <button onClick={() => setShowEmailIngestModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Candidate Full Name *</Label>
                    <Input value={ingestName} onChange={e => setIngestName(e.target.value)} placeholder="e.g. Kwame Mensah" />
                  </div>
                  <div>
                    <Label>Candidate Email *</Label>
                    <Input value={ingestEmail} onChange={e => setIngestEmail(e.target.value)} placeholder="kwame@example.com" />
                  </div>
                </div>

                <div>
                  <Label>Target Job Vacancy *</Label>
                  <Select value={ingestVacancyTitle} onChange={e => setIngestVacancyTitle(e.target.value)}>
                    {vacancies.map(v => (
                      <option key={v.id} value={v.title}>{v.title} ({v.department})</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Candidate CV Skills & Qualifications (Parsed from PDF/Word)</Label>
                  <Input
                    value={ingestSkills}
                    onChange={e => setIngestSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter or paste the applicant's raw skills/qualifications. The AI screener evaluates these against the vacancy keywords.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <i className="bi bi-info-circle-fill text-amber-600"></i>
                    <span>Inbound Webhook Live Parsing</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    When an applicant emails your inbound address <span className="font-mono text-amber-950 font-bold">jobs-{selectedCompany.id.replace(/-/g, '').slice(0, 10)}@inbound.core360.app</span>, this parsing occurs automatically in milliseconds without manual entry.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <SecBtn onClick={() => setShowEmailIngestModal(false)}>Cancel</SecBtn>
                <PrimaryBtn icon="bi bi-check-lg" onClick={handleIngestCandidateCV}>
                  Ingest & AI-Screen Resume
                </PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Active Job Vacancies & AI Screening Keywords Section */}
        {isHRorAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900 flex items-center gap-2">
                  <i className="bi bi-briefcase-fill text-indigo-600"></i> Active Job Vacancies & AI Screening Keywords
                </h3>
                <p className="text-[11px] text-slate-500">Configure target skill keywords per vacancy. The AI screens resumes and shortlists top applicants.</p>
              </div>
              <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setVacTitle(''); setVacDept(''); setVacCount('1'); setVacKeywords('React, TypeScript, Node.js, PostgreSQL'); setVacMinScore('70'); setShowVacancyModal(true); }}>
                Post Vacancy with AI Keywords
              </PrimaryBtn>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {vacancies.map((vac) => (
                <div key={vac.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all space-y-3 group">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="fs-xs fw-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{vac.title}</h4>
                      <span className="text-[11px] text-slate-500">{vac.department} · Posted {vac.posted}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] fw-bold bg-indigo-100 text-indigo-700 shrink-0">
                      {vac.count} {vac.count === 1 ? 'Opening' : 'Openings'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block mb-1">Required AI Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {(vac.keywords || 'Skills required').split(',').map((kw, kwIdx) => (
                        <span key={kwIdx} className="px-2 py-0.5 rounded-md text-[10px] font-mono fw-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] fw-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                      Min {vac.minScore || 70}% Match
                    </span>
                    <button
                      onClick={() => {
                        setTargetKeywords(vac.keywords);
                        setMinMatchScore(vac.minScore || 70);
                        setShowAiScreeningModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[11px] fw-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <i className="bi bi-stars text-amber-300 text-[10px]"></i> AI Shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATS Pipeline */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { stage: 'Applications', count: (applicants || []).filter(a => a.stage === 'Applications').length, icon: 'bi bi-inbox', color: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
            { stage: 'Screening', count: (applicants || []).filter(a => a.stage === 'Screening').length, icon: 'bi bi-funnel', color: 'bg-violet-50 border-violet-100', text: 'text-violet-700' },
            { stage: 'Interview', count: (applicants || []).filter(a => a.stage === 'Interview').length, icon: 'bi bi-camera-video', color: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
            { stage: 'Offer Sent', count: (applicants || []).filter(a => a.stage === 'Offer Sent').length, icon: 'bi bi-envelope-check', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
          ].map(s => (
            <div key={s.stage} >
              <i ></i>
              <div >{s.count}</div>
              <div className="fs-sm text-slate-600 mt-0.5">{s.stage}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Applicant list */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="fs-sm fw-bold text-slate-900 flex items-center gap-2">
                Active Applicants
              </h3>
              <div className="flex items-center gap-2">
                {isHRorAdmin && (
                  <button
                    onClick={() => setShowAiScreeningModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white fs-xs fw-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="bi bi-stars text-amber-300"></i> AI Resume Keyword Shortlist
                  </button>
                )}
                {isHRorAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setVacTitle(''); setVacDept(''); setVacCount('1'); setShowVacancyModal(true); }}>Post Vacancy</PrimaryBtn>}
              </div>

              {/* AI Resume Screening & Keyword Shortlist Modal */}
              {showAiScreeningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                  <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                          <i className="bi bi-stars text-amber-300 text-lg"></i>
                        </div>
                        <div>
                          <h2 className="text-sm fw-bold">AI CV Keyword Screening & Shortlisting Engine</h2>
                          <p className="text-[11px] text-slate-300">Set target keywords to automatically screen CVs and shortlist top candidates</p>
                        </div>
                      </div>
                      <button onClick={() => setShowAiScreeningModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <i className="bi bi-x-lg text-sm"></i>
                      </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                      <div>
                        <Label>Target Required Keywords & Skills (Comma separated)</Label>
                        <Input
                          value={targetKeywords}
                          onChange={e => setTargetKeywords(e.target.value)}
                          placeholder="e.g. React, Node.js, PostgreSQL, TypeScript, CPA, 5+ Years"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-400 fw-bold uppercase">Preset Rules:</span>
                          <button
                            type="button"
                            onClick={() => setTargetKeywords('React, Node.js, PostgreSQL, TypeScript, Git, Docker')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            💻 Full-Stack Software Engineer
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetKeywords('CPA, GAAP, Payroll Tax, Ledger, Auditing, Excel')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            📊 Chief Accountant / CPA
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetKeywords('CRM, B2B Sales, Negotiation, Lead Generation, Pipeline')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            🎯 Sales Executive
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Match Score Threshold (%)</Label>
                          <div className="flex items-center gap-3 mt-1">
                            <input
                              type="range"
                              min="40"
                              max="95"
                              value={minMatchScore}
                              onChange={e => setMinMatchScore(Number(e.target.value))}
                              className="flex-1 accent-indigo-600 cursor-pointer"
                            />
                            <span className="text-xs font-mono fw-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                              {minMatchScore}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label>Shortlisting Rule</Label>
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            Candidates with <span className="fw-bold text-slate-900">≥ {minMatchScore}% score</span> are automatically moved to <span className="fw-bold text-emerald-600">Shortlisted</span> stage.
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleRunAiResumeScreening}
                          disabled={isScreeningRunning}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white text-xs fw-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isScreeningRunning ? (
                            <>
                              <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                              AI is analyzing CVs & evaluating keywords...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-stars text-amber-300 text-sm"></i>
                              Run AI Resume Screening & Auto-Shortlist Now
                            </>
                          )}
                        </button>
                      </div>

                      {/* Results list */}
                      {screeningResults.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                          <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block">AI Shortlist Screening Results</span>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {screeningResults.map((res, idx) => (
                              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs fw-bold text-slate-900">{res.name}</span>
                                    <span className={`text-[9px] fw-bold px-2 py-0.5 rounded-md ${
                                      res.score >= minMatchScore ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {res.score}% Match
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-1">{res.summary}</p>
                                  {res.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {res.keywords.map((kw, kidx) => (
                                        <span key={kidx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-mono">
                                          ✓ {kw}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <span className={`text-[10px] fw-bold px-2 py-1 rounded-lg shrink-0 ${
                                  res.stage === 'Shortlisted' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {res.stage}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                      <SecBtn onClick={() => setShowAiScreeningModal(false)}>Close</SecBtn>
                    </div>
                  </div>
                </div>
              )}

                {showVacancyModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                            <i className="bi bi-briefcase-fill text-amber-300 text-lg"></i>
                          </div>
                          <div>
                            <h2 className="text-sm fw-bold">Post New Job Vacancy & AI Screening Rules</h2>
                            <p className="text-[11px] text-slate-300">Set vacancy details & target CV keywords for automated shortlisting</p>
                          </div>
                        </div>
                        <button onClick={() => setShowVacancyModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                          <i className="bi bi-x-lg text-sm"></i>
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <Label>Job Title *</Label>
                          <Input value={vacTitle} onChange={e => setVacTitle(e.target.value)} placeholder="e.g. Senior Full-Stack Engineer" />
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Department</Label>
                            <Input value={vacDept} onChange={e => setVacDept(e.target.value)} placeholder="e.g. Engineering" />
                          </div>
                          <div>
                            <Label>Number of Openings</Label>
                            <Input type="number" value={vacCount} onChange={e => setVacCount(e.target.value)} min="1" />
                          </div>
                        </div>

                        {/* Required AI Keywords & Skills */}
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Required CV Screening Keywords & Skills *</Label>
                            <span className="text-[10px] fw-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                              AI Resume Filter
                            </span>
                          </div>
                          <Input
                            value={vacKeywords}
                            onChange={e => setVacKeywords(e.target.value)}
                            placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, Docker"
                          />
                          <p className="text-[10px] text-slate-500">
                            Comma-separated list of required skills/qualifications the AI evaluates on applicant CVs.
                          </p>
                        </div>

                        <div>
                          <Label>Minimum AI Fit Threshold Score (%)</Label>
                          <Input
                            type="number"
                            value={vacMinScore}
                            onChange={e => setVacMinScore(e.target.value)}
                            min="10"
                            max="100"
                          />
                          <div className="text-[10px] text-slate-400 mt-1">
                            Applicants scoring equal or above this % will be auto-shortlisted.
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <SecBtn onClick={() => setShowVacancyModal(false)}>Cancel</SecBtn>
                        <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                          if (!vacTitle) return void modalAlert('Job title required', { variant: 'warning' });
                          setVacancies([
                            ...vacancies,
                            {
                              id: `vac-${Date.now()}`,
                              title: vacTitle,
                              department: vacDept || 'General',
                              count: Number(vacCount) || 1,
                              posted: new Date().toISOString().split('T')[0],
                              keywords: vacKeywords || 'Required Skills',
                              minScore: Number(vacMinScore) || 70
                            }
                          ]);
                          setShowVacancyModal(false);
                          setVacTitle('');
                          setVacDept('');
                          modalAlert('Job vacancy posted successfully with custom AI CV screening keywords!', { variant: 'success' });
                        }}>Post Vacancy & Save AI Rules</PrimaryBtn>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="divide-y divide-slate-100">
              {(applicants || []).map((app, i) => (
                <div key={app.name} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar first={app.name.split(' ')[0]} last={app.name.split(' ')[1] || 'X'} index={i} />
                    <div>
                      <div className="fs-sm fw-semibold text-slate-900">{app.name}</div>
                      <div className="fs-xs text-slate-500">{app.role} · {app.dept}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="fs-xs text-slate-400">{app.applied}</span>
                    <Badge
                      label={app.stage}
                      variant={app.stage === 'Hired' ? 'success' : app.stage === 'Offer Sent' ? 'success' : app.stage === 'Interview' ? 'info' : app.stage === 'Screening' ? 'purple' : 'default'}
                    />
                    {isHRorAdmin && app.stage !== 'Hired' && (
                      <button onClick={() => {
                        const idx = STAGES.indexOf(app.stage);
                        const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : app.stage;
                        onUpdateApplicant!(prev => prev.map((a, j) => j === i ? { ...a, stage: next } : a));
                        if (next === 'Hired') {
                          const nameParts = app.name.split(' ');
                          const firstName = nameParts[0] || app.name;
                          const lastName = nameParts.slice(1).join(' ') || 'Employee';
                          setHrFirst(firstName);
                          setHrLast(lastName);
                          setHrEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}@${selectedCompany.domain || 'company'}.com`);
                          setHrDept(app.dept);
                          setHrRole(app.role);
                          setHrSysRole('Employee');
                          setHrSysRoles(['Employee']);
                          setTimeout(() => {
                            document.getElementById('hire')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }} className="fs-xs fw-semibold text-slate-500 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
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
              <h3 className="fs-sm fw-bold text-slate-900 mb-4">Register New Employee</h3>
              {hireSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 fs-sm text-emerald-700 fw-semibold">
                  <i className="bi bi-check-circle-fill"></i> {hireSuccess}
                </div>
              )}
              <form className="space-y-3" onSubmit={e => {
                e.preventDefault();
                if (!hrFirst || !hrLast || !hrEmail) return;
                onAddEmployee({
                  companyId: selectedCompany.id, firstName: hrFirst, lastName: hrLast, email: hrEmail, photoUrl: hrPhotoUrl,
                  department: hrDept, designation: hrRole || 'Staff', branch: hrBranch, salary: Number(hrSalary),
                  assignedTaxes: hrTaxes, assignedBenefits: hrBenefits,
                  bankAccount: hrBankName || hrAccountNumber ? JSON.stringify({
                    bankName: hrBankName,
                    accountName: hrAccountName,
                    accountNumber: hrAccountNumber,
                    sortCode: hrSortCode
                  }) : undefined
                });

                if (onInviteUser) {
                  onInviteUser({
                    name: `${hrFirst} ${hrLast}`,
                    email: hrEmail,
                    role: hrSysRole || 'Employee',
                    roles: hrSysRoles.length > 0 ? hrSysRoles : [hrSysRole || 'Employee'],
                    department: hrDept,
                    branch: hrBranch
                  });
                }

                setHireSuccess(`${hrFirst} ${hrLast} registered as ${hrRole || 'Staff'}.`);
                setHrFirst(''); setHrLast(''); setHrEmail(''); setHrPhotoUrl(''); setHrRole(''); setHrTaxes([]); setHrBenefits([]);
                setHrBankName(''); setHrAccountName(''); setHrAccountNumber(''); setHrSortCode(''); setHrSysRole('Employee'); setHrSysRoles(['Employee']);
                setTimeout(() => setHireSuccess(null), 4000);
              }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>First Name *</Label><Input value={hrFirst} onChange={e => setHrFirst(e.target.value)} placeholder="Kofi" required /></div>
                  <div><Label>Last Name *</Label><Input value={hrLast} onChange={e => setHrLast(e.target.value)} placeholder="Asante" required /></div>
                </div>
                <div><Label>Email *</Label><Input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} placeholder="kofi@company.com" required /></div>
                <div><Label>Phone</Label><Input value={hrPhone} onChange={e => setHrPhone(e.target.value)} placeholder="+233 24 000 0000" /></div>
                <div>
                  <Label>Employee Photo</Label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setHrPhotoUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-md bg-white p-1" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Department</Label>
                    <Select value={hrDept} onChange={e => setHrDept(e.target.value)}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                    <Label>Primary Role</Label>
                    <Select value={hrSysRole} onChange={e => { setHrSysRole(e.target.value); if (!hrSysRoles.includes(e.target.value)) setHrSysRoles([...hrSysRoles, e.target.value]); }}>
                      <option value="Employee">Employee</option>
                      {selectedCompany.activeModules.includes('Administration') && <option value="Company Admin">Company Admin</option>}
                      {selectedCompany.activeModules.includes('Administration') && <option value="CEO">CEO</option>}
                      {selectedCompany.activeModules.includes('HR') && <option value="HR Manager">HR Manager</option>}
                      {selectedCompany.activeModules.includes('HR') && <option value="HR Officer">HR Officer</option>}
                      {selectedCompany.activeModules.includes('Accounting') && <option value="Accountant">Accountant</option>}
                      {selectedCompany.activeModules.includes('Accounting') && <option value="Finance Manager">Finance Manager</option>}
                      {selectedCompany.activeModules.includes('CRM') && <option value="Sales Manager">Sales Manager</option>}
                      {selectedCompany.activeModules.includes('CRM') && <option value="Sales Rep">Sales Rep</option>}
                      {selectedCompany.activeModules.includes('Operations') && <option value="Inventory Manager">Inventory Manager</option>}
                      {selectedCompany.activeModules.includes('Operations') && <option value="Store Keeper">Store Keeper</option>}
                      {selectedCompany.activeModules.includes('Help Desk') && <option value="Support Agent">Support Agent</option>}
                      {customRoles.filter(r => r.companyId === selectedCompany.id && !r.isSystem && !['Employee','Company Admin','CEO','HR Manager','HR Officer','Accountant','Finance Manager','Sales Manager','Sales Rep','Inventory Manager','Store Keeper','Support Agent'].includes(r.name)).map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Select value={hrBranch} onChange={e => setHrBranch(e.target.value)}>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Additional Roles <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {[
                        { val: 'Employee', mod: null },
                        { val: 'Company Admin', mod: 'Administration' },
                        { val: 'CEO', mod: 'Administration' },
                        { val: 'HR Manager', mod: 'HR' },
                        { val: 'HR Officer', mod: 'HR' },
                        { val: 'HR Department Head', mod: 'HR' },
                        { val: 'Accountant', mod: 'Accounting' },
                        { val: 'Finance Manager', mod: 'Accounting' },
                        { val: 'Sales Manager', mod: 'CRM' },
                        { val: 'Sales Rep', mod: 'CRM' },
                        { val: 'Inventory Manager', mod: 'Operations' },
                        { val: 'Store Keeper', mod: 'Operations' },
                        { val: 'Support Agent', mod: 'Help Desk' },
                      ].filter(r => !r.mod || selectedCompany.activeModules.includes(r.mod)).concat(
                        customRoles.filter(r => r.companyId === selectedCompany.id && !r.isSystem && !['Employee','Company Admin','CEO','HR Manager','HR Officer','HR Department Head','Accountant','Finance Manager','Sales Manager','Sales Rep','Inventory Manager','Store Keeper','Support Agent'].includes(r.name)).map(r => ({ val: r.name, mod: null }))
                      ).map(r => (
                        <label key={r.val} className="flex items-center gap-1.5 fs-xs text-slate-700 cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={hrSysRoles.includes(r.val)} onChange={e => {
                            if (e.target.checked) setHrSysRoles([...hrSysRoles, r.val]);
                            else setHrSysRoles(hrSysRoles.filter(x => x !== r.val));
                          }} className="rounded" />
                          {r.val}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Start Date</Label><Input type="date" value={hrStartDate} onChange={e => setHrStartDate(e.target.value)} /></div>
                  <div><Label>Monthly Salary (GHS)</Label><Input type="number" value={hrSalary} onChange={e => setHrSalary(e.target.value)} placeholder="6500" /></div>
                </div>

                {/* Payroll Taxes and Benefits Assignment */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                  <div>
                    <Label>Assign Taxes</Label>
                    {payrollTaxConfig && payrollTaxConfig.customTaxes && payrollTaxConfig.customTaxes.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                        {payrollTaxConfig.customTaxes.map(tax => (
                          <label key={tax.id} className="flex items-center gap-2 fs-xs text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={hrTaxes.includes(tax.id)} onChange={e => {
                              if (e.target.checked) setHrTaxes([...hrTaxes, tax.id]);
                              else setHrTaxes(hrTaxes.filter(id => id !== tax.id));
                            }} />
                            {tax.name} ({tax.type === 'Percentage' ? `${(tax.value * 100).toFixed(1)}%` : formatCurrency(tax.value, selectedCompany?.currency)})
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center">
                        <p className="fs-xs text-slate-400">No taxes configured yet.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Create taxes in Payroll → Tax & Benefits Config</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Assign Benefits</Label>
                    {payrollTaxConfig && payrollTaxConfig.customBenefits && payrollTaxConfig.customBenefits.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                        {payrollTaxConfig.customBenefits.map(ben => (
                          <label key={ben.id} className="flex items-center gap-2 fs-xs text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={hrBenefits.includes(ben.id)} onChange={e => {
                              if (e.target.checked) setHrBenefits([...hrBenefits, ben.id]);
                              else setHrBenefits(hrBenefits.filter(id => id !== ben.id));
                            }} />
                            {ben.name} ({ben.type === 'Percentage' ? `${(ben.value * 100).toFixed(1)}%` : formatCurrency(ben.value, selectedCompany?.currency)})
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center">
                        <p className="fs-xs text-slate-400">No benefits configured yet.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Create benefits in Payroll → Tax & Benefits Config</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                  <div>
                    <Label>Bank Name</Label>
                    <Input value={hrBankName} onChange={e => setHrBankName(e.target.value)} placeholder="e.g. Chase Bank" />
                  </div>
                  <div>
                    <Label>Account Name</Label>
                    <Input value={hrAccountName} onChange={e => setHrAccountName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={hrAccountNumber} onChange={e => setHrAccountNumber(e.target.value)} placeholder="e.g. 123456789" />
                  </div>
                  <div>
                    <Label>Sort Code / Routing Number</Label>
                    <Input value={hrSortCode} onChange={e => setHrSortCode(e.target.value)} placeholder="e.g. 12-34-56" />
                  </div>
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
    // Employee role always sees self-service leave form
    if (isEmployee) {
      return (
        <div className="space-y-6">
          <SectionHeader title="My Leave" subtitle="Apply for time off and track your leave balance." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(() => {
              const quotas: Record<string, { total: number; color: string; icon: string }> = {
                'Annual Leave': { total: 25, color: 'from-blue-500 to-blue-700', icon: 'bi bi-sun' },
                'Sick Leave': { total: 10, color: 'from-rose-500 to-rose-700', icon: 'bi bi-thermometer' },
                'Casual Leave': { total: 5, color: 'from-violet-500 to-violet-700', icon: 'bi bi-person-heart' },
              };
              const approvedByType = myLeaves
                .filter(l => l.status === 'Approved')
                .reduce((acc, l) => { acc[l.leaveType] = (acc[l.leaveType] || 0) + (l.days || 1); return acc; }, {} as Record<string, number>);
              return Object.entries(quotas).map(([type, q]) => {
                const used = approvedByType[type] || 0;
                const remaining = Math.max(0, q.total - used);
                return (
                  <div key={type} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div >
                      <i className={q.icon}></i>
                    </div>
                    <div className="fs-sm fw-bold text-slate-900 mb-1">{type}</div>
                    <div className="fs-2xl fw-bold text-slate-900 tabular-nums mb-2">{remaining} <span className="fs-sm fw-normal text-slate-400">/ {q.total} days left</span></div>
                    <ProgressBar value={q.total > 0 ? (used / q.total) * 100 : 0} color={`bg-gradient-to-r ${q.color}`} />
                  </div>
                );
              });
            })()}
            <StatCard label="Pending" value={myLeaves.filter(l => l.status === 'Pending').length} icon="bi bi-clock" sub="Awaiting approval" accent />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Request form */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
              <h3 className="fs-sm fw-bold text-slate-900 mb-4">Request Time Off</h3>
              {leaveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 fs-sm text-emerald-700 fw-semibold">
                  <i className="bi bi-check-circle-fill"></i> Leave request submitted!
                </div>
              )}
              <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                if (!myEmpRecord) return;
                const days = leaveEnd && leaveStart
                  ? Math.max(1, Math.round((new Date(leaveEnd).getTime() - new Date(leaveStart).getTime()) / 86400000) + 1)
                  : 1;
                const coveringEmp = localEmployees.find(emp => emp.id === leaveReplacementId);
                onAddLeave({
                  employeeId: myEmpRecord.id,
                  employeeName: `${myEmpRecord.firstName} ${myEmpRecord.lastName}`,
                  department: myEmpRecord.department,
                  leaveType,
                  startDate: leaveStart,
                  endDate: leaveEnd || leaveStart,
                  reason: leaveReason,
                  days,
                  replacementId: leaveReplacementId || undefined,
                  replacementName: coveringEmp ? `${coveringEmp.firstName} ${coveringEmp.lastName}` : undefined
                });
                setLeaveStart(''); setLeaveEnd(''); setLeaveReason(''); setLeaveReplacementId('');
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
                  <Label>Replacement Employee (Covering Officer)</Label>
                  <Select value={leaveReplacementId} onChange={e => setLeaveReplacementId(e.target.value)}>
                    <option value="">— Select covering officer —</option>
                    {localEmployees.filter(emp => emp.id !== myEmpRecord?.id).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.designation} · {emp.department})
                      </option>
                    ))}
                  </Select>
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
                <h3 className="fs-sm fw-bold text-slate-900">My Leave History</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {myLeaves.length === 0 && (
                  <div className="p-10 text-center">
                    <i className="bi bi-calendar-x fs-3xl text-slate-200 block mb-2"></i>
                    <p className="fs-sm text-slate-400">No leave requests yet.</p>
                  </div>
                )}
                {myLeaves.map(req => (
                  <div key={req.id} className="p-4 hover:bg-slate-50/40 transition-colors flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="fs-sm fw-semibold text-slate-900">{req.leaveType}</span>
                          <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'} />
                        </div>
                        <div className="fs-xs text-slate-500 mt-0.5">
                          <i className="bi bi-calendar3 mr-1"></i>{req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''} · {req.reason}
                        </div>
                        {req.replacementName && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <i className="bi bi-person-fill text-slate-400"></i>
                            Covering officer: <span className="fw-semibold text-slate-600">{req.replacementName}</span>
                          </div>
                        )}
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

    // Manager / HR leave management view
    const userManagedDepts = departments.filter(d => d.managerId === selectedUser.id && d.companyId === selectedCompany.id);
    const isDeptManager = userManagedDepts.length > 0;
    const managedDeptNames = isHRorAdmin 
      ? null 
      : userManagedDepts.map(d => d.name);
    
    const visibleLeaves = isHRorAdmin 
      ? companyLeaves 
      : companyLeaves.filter(l => {
          const emp = localEmployees.find(e => e.id === l.employeeId);
          return emp && managedDeptNames?.includes(emp.department);
        });

    const displayLeaves = leaveFilter === 'All' ? visibleLeaves : visibleLeaves.filter(l => l.status === leaveFilter);

    const pending = visibleLeaves.filter(l => l.status === 'Pending');
    const approved = visibleLeaves.filter(l => l.status === 'Approved');
    const todayOnLeave = localEmployees.filter(e => e.status === 'On Leave' && (isHRorAdmin || managedDeptNames?.includes(e.department)));
    const totalDays = visibleLeaves.filter(l => l.status === 'Approved').reduce((s, l) => s + (l.days || 0), 0);
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
            <h3 className="fs-sm fw-bold text-slate-900">Leave Requests</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                <button key={f} onClick={() => setLeaveFilter(f as typeof leaveFilter)} >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {visibleLeaves.length === 0 && (
              <div className="p-10 text-center">
                <i className="bi bi-inbox fs-3xl text-slate-200 block mb-2"></i>
                <p className="fs-sm text-slate-400">No leave requests found.</p>
              </div>
            )}
            {displayLeaves.map((req, i) => {
              const emp = localEmployees.find(e => e.id === req.employeeId);
              const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
              const empDept = emp?.department || '';
              return (
              <div key={req.id} className="p-5 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar first={empName.split(' ')[0]} last={empName.split(' ')[1] || 'X'} photoUrl={emp?.photoUrl} index={i} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="fs-sm fw-semibold text-slate-900">{empName}</span>
                        <span className="fs-xs text-slate-400">· {empDept}</span>
                        <Badge label={req.leaveType} variant="info" />
                      </div>
                      <div className="fs-sm text-slate-600 flex items-center gap-2">
                        <i className="bi bi-calendar3 text-slate-400"></i>
                        {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` – ${req.endDate}` : ''}
                        <span className="fs-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full tabular-nums">{req.days || 1} day{(req.days || 1) > 1 ? 's' : ''}</span>
                      </div>
                      <div className="fs-xs text-slate-400 mt-1 italic">"{req.reason}"</div>
                      {req.replacementName && (
                        <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] fw-semibold text-slate-600 flex items-center gap-1">
                            <i className="bi bi-arrow-left-right text-[8px]"></i> Covering Officer: {req.replacementName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : (req.status === 'Pending' || req.status === 'HOD Approved') ? 'warning' : 'danger'} />
                    
                    {req.status === 'Pending' && (() => {
                      const isCompanyAdmin = selectedUser.activeRole === 'Company Admin';
                      const hasLeavePermission = selectedUser.permissions.includes('leave_approve') || selectedUser.permissions.includes('admin_all');
                      const empDeptRecord = departments.find(d => d.name === empDept && d.companyId === selectedCompany.id);
                      const isHOD = empDeptRecord?.managerId === selectedUser.id;
                      const canApprove = isCompanyAdmin || hasLeavePermission || isHRDeptHeadUser || isHOD;
                      
                      if (canApprove) {
                        return (
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => onApproveLeave(req.id, 'Approved')} className="fs-xs fw-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Approve</button>
                            <button onClick={() => onRejectLeave(req.id)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                          </div>
                        );
                      }
                      return <div className="text-[10px] text-slate-400 italic">Awaiting approval</div>;
                    })()}

                    {req.status === 'HOD Approved' && (() => {
                      const isCompanyAdmin = selectedUser.activeRole === 'Company Admin';
                      const hasLeavePermission = selectedUser.permissions.includes('leave_approve') || selectedUser.permissions.includes('admin_all');
                      const canFinalApprove = isCompanyAdmin || hasLeavePermission || isHRDeptHeadUser;
                      if (canFinalApprove) {
                        return (
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => onApproveLeave(req.id, 'Approved')} className="fs-xs fw-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Final Approve</button>
                            <button onClick={() => onRejectLeave(req.id)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                          </div>
                        );
                      }
                      return <div className="text-[10px] text-slate-400 italic">Awaiting HR approval</div>;
                    })()}
                    
                    {req.status === 'Approved' && req.approvedBy && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <i className="bi bi-check2-circle text-emerald-500"></i>
                        Approved by <span className="fw-semibold text-slate-700">{req.approvedBy}</span>
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

  // ── VIEW: ATTENDANCE ───────────────────────────────────────────────────────
  if (activeView === 'hr-attendance') {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (isHRorAdmin) {
      // 1. Reconcile full company roster for the selected date filter (attDateFilter)
      const targetDate = attDateFilter || new Date().toISOString().split('T')[0];

      const allRosterForDate = localEmployees.map((emp, idx) => {
        const existing = companyAttendance.find(a => a.employeeId === emp.id && a.date === targetDate);
        if (existing) {
          return {
            ...existing,
            emp,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            employeeNumber: emp.employeeNumber
          };
        }
        // Check approved leave
        const onLeaveRecord = leaves.find(l => 
          l.employeeId === emp.id && 
          l.status === 'Approved' && 
          l.startDate <= targetDate && 
          l.endDate >= targetDate
        );
        if (onLeaveRecord) {
          return {
            id: `leave-${emp.id}-${targetDate}`,
            companyId: selectedCompany.id,
            employeeId: emp.id,
            date: targetDate,
            checkIn: undefined as string | undefined,
            checkOut: undefined as string | undefined,
            status: 'On Leave',
            locationType: 'Leave',
            emp,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            employeeNumber: emp.employeeNumber
          };
        }
        return {
          id: `absent-${emp.id}-${targetDate}`,
          companyId: selectedCompany.id,
          employeeId: emp.id,
          date: targetDate,
          checkIn: undefined as string | undefined,
          checkOut: undefined as string | undefined,
          status: 'Absent',
          locationType: 'Office',
          emp,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          employeeNumber: emp.employeeNumber
        };
      });

      const countAll = allRosterForDate.length;
      const countPresent = allRosterForDate.filter(a => a.status === 'Present').length;
      const countLate = allRosterForDate.filter(a => a.status === 'Late').length;
      const countLeave = allRosterForDate.filter(a => a.status === 'On Leave').length;
      const countAbsent = allRosterForDate.filter(a => a.status === 'Absent').length;

      const filteredAttendance = allRosterForDate.filter(a => attStatusFilter === 'All' || a.status === attStatusFilter);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayPresent = companyAttendance.filter(a => a.date === todayStr && a.status === 'Present').length;
      const todayLate = companyAttendance.filter(a => a.date === todayStr && a.status === 'Late').length;

      return (
        <div className="space-y-6">
          <SectionHeader title="Attendance Management" subtitle="View all employee attendance records, daily clock-in logs & individual history." />
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Present Today" value={todayPresent} icon="bi bi-person-check-fill" sub="Clocked in" color="text-emerald-600" />
            <StatCard label="Late Today" value={todayLate} icon="bi bi-clock-history" sub="After 9:00 AM" accent />
            <StatCard label="On Leave" value={onLeave.length} icon="bi bi-calendar-x" sub="Approved absence" />
            <StatCard label="Total Staff Roster" value={localEmployees.length} icon="bi bi-people-fill" sub="Active company employees" />
          </div>

          {/* Attendance Settings Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <button onClick={() => setShowAttSettings(!showAttSettings)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <i className="bi bi-gear6 text-slate-600"></i>
                </div>
                <div className="text-left">
                  <div className="fs-sm fw-semibold text-slate-900">Attendance Settings & Penalties</div>
                  <div className="fs-xs text-slate-400">Configure late penalties, grace periods and escalation rules</div>
                </div>
              </div>
              <i className={`bi bi-chevron-${showAttSettings ? 'up' : 'down'} text-slate-400`}></i>
            </button>

            {showAttSettings && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Apply To</Label>
                    <Select value={attSettings.departmentId} onChange={e => setAttSettings({ ...attSettings, departmentId: e.target.value })}>
                      <option value="">All Departments</option>
                      {[...new Set(localEmployees.map(e => e.department))].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                    <div className="fs-xs text-slate-400 mt-1">Leave empty to apply to all employees</div>
                  </div>
                  <div>
                    <Label>Work Start Time</Label>
                    <Input type="time" value={attSettings.workStartTime} onChange={e => setAttSettings({ ...attSettings, workStartTime: e.target.value })} />
                    <div className="fs-xs text-slate-400 mt-1">Expected arrival time for all employees</div>
                  </div>
                  <div>
                    <Label>Grace Period (minutes)</Label>
                    <Input type="number" value={attSettings.graceMinutes} onChange={e => setAttSettings({ ...attSettings, graceMinutes: Number(e.target.value) })} />
                    <div className="fs-xs text-slate-400 mt-1">Employees clocking in within this window are marked Present</div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Late Threshold (minutes)</Label>
                    <Input type="number" value={attSettings.lateThresholdMinutes} onChange={e => setAttSettings({ ...attSettings, lateThresholdMinutes: Number(e.target.value) })} />
                    <div className="fs-xs text-slate-400 mt-1">After this threshold, the "Late" penalty applies</div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <Label>Late Penalty Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {([
                      { value: 'warning', label: 'Warning Only', icon: 'bi bi-exclamation-triangle', desc: 'Record warning' },
                      { value: 'deduction', label: 'Pay Deduction', icon: 'bi bi-cash-coin', desc: 'Deduct from salary' },
                      { value: 'suspension', label: 'Suspension', icon: 'bi bi-person-x', desc: 'Unpaid suspension' },
                      { value: 'custom', label: 'Custom Rule', icon: 'bi bi-pencil-square', desc: 'Define your own' },
                    ] as const).map(opt => (
                      <button key={opt.value} onClick={() => setAttSettings({ ...attSettings, penaltyType: opt.value })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${attSettings.penaltyType === opt.value ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                      >
                        <i className={`${opt.icon} text-lg mb-1 block ${attSettings.penaltyType === opt.value ? 'text-indigo-600' : 'text-slate-400'}`}></i>
                        <div className="fs-xs fw-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {attSettings.penaltyType === 'deduction' && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Deduction Type</Label>
                        <Select value={attSettings.deductionType} onChange={e => setAttSettings({ ...attSettings, deductionType: e.target.value as 'percentage' | 'fixed' })}>
                          <option value="percentage">Percentage of Salary</option>
                          <option value="fixed">Fixed Amount</option>
                        </Select>
                      </div>
                      <div>
                        <Label>{attSettings.deductionType === 'percentage' ? 'Deduction %' : 'Deduction Amount'}</Label>
                        <Input type="number" value={attSettings.deductionValue} onChange={e => setAttSettings({ ...attSettings, deductionValue: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                )}

                {attSettings.penaltyType === 'custom' && (
                  <div className="border-t border-slate-100 pt-4">
                    <Label>Custom Penalty Description</Label>
                    <textarea value={attSettings.customPenalty} onChange={e => setAttSettings({ ...attSettings, customPenalty: e.target.value })}
                      rows={3} placeholder="e.g. Mandatory overtime on weekends, written apology letter..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none" />
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <Label>Escalation Rules</Label>
                  <div className="grid gap-4 sm:grid-cols-2 mt-2">
                    <div>
                      <Label>Warnings Before Escalation</Label>
                      <Input type="number" value={attSettings.maxWarnings} onChange={e => setAttSettings({ ...attSettings, maxWarnings: Number(e.target.value) })} />
                      <div className="fs-xs text-slate-400 mt-1">After this many warnings, penalty escalates automatically</div>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <button onClick={() => setAttSettings({ ...attSettings, escalateAfterWarnings: !attSettings.escalateAfterWarnings })}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${attSettings.escalateAfterWarnings ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${attSettings.escalateAfterWarnings ? 'left-5' : 'left-1'}`}></span>
                      </button>
                      <div>
                        <div className="fs-xs fw-semibold text-slate-700">Auto-escalate penalties</div>
                        <div className="text-[10px] text-slate-400">Automatically escalate after max warnings</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <SecBtn onClick={() => setShowAttSettings(false)}>Cancel</SecBtn>
                  <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                    if (onUpdateAttendanceSettings) {
                      onUpdateAttendanceSettings(selectedCompany.id, attSettings);
                    }
                    setShowAttSettings(false);
                  }}>Save Settings</PrimaryBtn>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900">Daily Attendance Log</h3>
                <p className="text-[11px] text-slate-500">Click any employee row to view full attendance history & time logs</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Select Date:</span>
                  <input type="date" value={attDateFilter} onChange={e => setAttDateFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 fs-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-xs bg-slate-50/50" />
                </div>

                {/* Fixed Top Filter Count Pills with Proper Badge Spacing */}
                <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-2xl p-1 border border-slate-200/80">
                  {([
                    { label: 'All', color: 'bg-slate-200 text-slate-800', count: countAll },
                    { label: 'Present', color: 'bg-emerald-100 text-emerald-800', count: countPresent },
                    { label: 'Late', color: 'bg-amber-100 text-amber-800', count: countLate },
                    { label: 'On Leave', color: 'bg-blue-100 text-blue-800', count: countLeave },
                    { label: 'Absent', color: 'bg-rose-100 text-rose-800', count: countAbsent },
                  ] as const).map(item => (
                    <button
                      key={item.label}
                      onClick={() => setAttStatusFilter(item.label as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        attStatusFilter === item.label
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'hover:bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        attStatusFilter === item.label ? 'bg-white/20 text-white' : item.color
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>

                <button onClick={() => downloadCSV(`attendance-${selectedCompany.id}-${targetDate}`, ['Employee', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Location', 'Status'], filteredAttendance.map(a => [a.employeeName, a.employeeNumber || '', a.department || '', a.date, a.checkIn || '—', a.checkOut || '—', a.locationType || 'Office', a.status]))} className="fs-sm fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-1.5">
                  <i className="bi bi-download fs-xs"></i> Export
                </button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  {['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Mode', 'Status', 'Action'].map(col => (
                    <th key={col} className="px-4 py-3 section-title text-slate-400">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center fs-sm text-slate-400">No attendance records match the selected status filter.</td></tr>
                ) : (
                  filteredAttendance.map((a, i) => {
                    const emp = a.emp || localEmployees.find(e => e.id === a.employeeId);
                    if (!emp) return null;
                    
                    // Working Hours Calculation
                    const hrs = (() => {
                      if (!a.checkIn) return '—';
                      if (!a.checkOut || a.checkIn === a.checkOut) return 'In Progress';
                      try {
                        const inTime = new Date(`2000-01-01 ${a.checkIn}`);
                        const outTime = new Date(`2000-01-01 ${a.checkOut}`);
                        const diff = (outTime.getTime() - inTime.getTime()) / 36e5;
                        if (isNaN(diff) || diff <= 0) return 'In Progress';
                        return `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}m`;
                      } catch (e) {
                        return '—';
                      }
                    })();

                    return (
                      <tr
                        key={a.id || i}
                        onClick={() => setSelectedEmpAttHistory(emp)}
                        className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        title="Click to view complete employee attendance history"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar first={emp.firstName} last={emp.lastName} photoUrl={emp.photoUrl} index={i} size="sm" />
                            <div>
                              <div className="fs-sm fw-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                {emp.firstName} {emp.lastName}
                                <i className="bi bi-clock-history text-xs text-slate-400 group-hover:text-indigo-600"></i>
                              </div>
                              <div className="fs-xs text-slate-400">{emp.department} · {emp.employeeNumber || 'EMP'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 fs-xs text-slate-600 font-mono">{a.date}</td>
                        <td className="px-4 py-3.5 fs-sm font-mono text-slate-700">{a.checkIn || '—'}</td>
                        <td className="px-4 py-3.5 fs-sm font-mono text-slate-400">{a.checkOut && a.checkOut !== a.checkIn ? a.checkOut : '—'}</td>
                        <td className="px-4 py-3.5 fs-sm font-mono text-slate-600">{hrs}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700">
                            <i className={`bi ${a.locationType === 'Remote' ? 'bi-laptop' : a.locationType === 'Leave' ? 'bi-calendar-x' : 'bi-building'} text-slate-400`}></i>
                            {a.locationType || 'Office'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge label={a.status} variant={a.status === 'Present' ? 'success' : a.status === 'Late' ? 'warning' : a.status === 'On Leave' ? 'info' : 'danger'} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-xs fw-bold text-indigo-600 group-hover:underline flex items-center gap-1 justify-end">
                            History <i className="bi bi-chevron-right text-[10px]"></i>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Employee Attendance History Modal ────────────────────────────────────── */}
          {selectedEmpAttHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <Avatar first={selectedEmpAttHistory.firstName} last={selectedEmpAttHistory.lastName} photoUrl={selectedEmpAttHistory.photoUrl} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base fw-bold text-white">{selectedEmpAttHistory.firstName} {selectedEmpAttHistory.lastName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] fw-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                          {selectedEmpAttHistory.employeeNumber || 'EMP'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{selectedEmpAttHistory.jobTitle} · {selectedEmpAttHistory.department}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEmpAttHistory(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <i className="bi bi-x-lg text-lg"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Lifetime Summary Stats */}
                  {(() => {
                    const empLogs = companyAttendance.filter(a => a.employeeId === selectedEmpAttHistory.id);
                    const empLeaves = leaves.filter(l => l.employeeId === selectedEmpAttHistory.id && l.status === 'Approved');
                    const presentCount = empLogs.filter(a => a.status === 'Present').length;
                    const lateCount = empLogs.filter(a => a.status === 'Late').length;
                    const leaveCount = empLeaves.length;
                    const totalHours = empLogs.reduce((sum, a) => {
                      if (!a.checkIn || !a.checkOut || a.checkIn === a.checkOut) return sum;
                      try {
                        const inT = new Date(`2000-01-01 ${a.checkIn}`);
                        const outT = new Date(`2000-01-01 ${a.checkOut}`);
                        const diff = (outT.getTime() - inT.getTime()) / 36e5;
                        return sum + (diff > 0 ? diff : 0);
                      } catch (e) { return sum; }
                    }, 0);

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5">
                            <span className="text-[10px] fw-bold uppercase tracking-wider text-emerald-600 block">Total Present</span>
                            <span className="text-xl fw-bold font-mono text-emerald-900 mt-1 block">{presentCount} Days</span>
                          </div>
                          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3.5">
                            <span className="text-[10px] fw-bold uppercase tracking-wider text-amber-600 block">Late Arrivals</span>
                            <span className="text-xl fw-bold font-mono text-amber-900 mt-1 block">{lateCount} Days</span>
                          </div>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5">
                            <span className="text-[10px] fw-bold uppercase tracking-wider text-blue-600 block">Approved Leaves</span>
                            <span className="text-xl fw-bold font-mono text-blue-900 mt-1 block">{leaveCount} Days</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                            <span className="text-[10px] fw-bold uppercase tracking-wider text-slate-500 block">Total Hours Worked</span>
                            <span className="text-xl fw-bold font-mono text-slate-900 mt-1 block">{Math.round(totalHours)} Hours</span>
                          </div>
                        </div>

                        {/* Attendance Logs Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="fs-sm fw-bold text-slate-900 flex items-center gap-2">
                              <i className="bi bi-clock-history text-indigo-600"></i> Attendance & Time Logs History
                            </h4>
                            <button
                              onClick={() => downloadCSV(`attendance-history-${selectedEmpAttHistory.firstName}-${selectedEmpAttHistory.lastName}`, ['Date', 'Check In', 'Check Out', 'Location', 'Status'], empLogs.map(l => [l.date, l.checkIn || '—', l.checkOut || '—', l.locationType || 'Office', l.status]))}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs fw-semibold hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <i className="bi bi-download text-xs"></i> Export Employee Log
                            </button>
                          </div>

                          <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Check In</th>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Check Out</th>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Duration</th>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Mode</th>
                                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {empLogs.length === 0 ? (
                                  <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">No past attendance logs recorded for this employee.</td></tr>
                                ) : (
                                  empLogs.map(log => {
                                    const h = log.checkIn && log.checkOut && log.checkIn !== log.checkOut ? (() => {
                                      try {
                                        const iT = new Date(`2000-01-01 ${log.checkIn}`);
                                        const oT = new Date(`2000-01-01 ${log.checkOut}`);
                                        const diff = (oT.getTime() - iT.getTime()) / 36e5;
                                        return `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}m`;
                                      } catch (e) { return '—'; }
                                    })() : log.checkIn ? 'In Progress' : '—';

                                    return (
                                      <tr key={log.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{log.date}</td>
                                        <td className="px-4 py-2.5 text-xs font-mono text-slate-800">{log.checkIn || '—'}</td>
                                        <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{log.checkOut || '—'}</td>
                                        <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{h}</td>
                                        <td className="px-4 py-2.5 text-xs text-slate-600">{log.locationType || 'Office'}</td>
                                        <td className="px-4 py-2.5">
                                          <Badge label={log.status} variant={log.status === 'Present' ? 'success' : log.status === 'Late' ? 'warning' : log.status === 'On Leave' ? 'info' : 'danger'} />
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                  <SecBtn onClick={() => setSelectedEmpAttHistory(null)}>Close</SecBtn>
                </div>
              </div>
            </div>
          )}
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div>
            <div className="section-title text-slate-500 mb-1">Today's Status</div>
            <div className="fs-2xl fw-bold text-slate-900">{isClockedOut ? 'Shift Complete' : isClockedIn ? 'Clocked In' : 'Not Clocked In'}</div>
            <div className="fs-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              {isClockedIn ? (
                <><i className="bi bi-clock text-emerald-500"></i> {myAttToday!.checkIn} · {myAttToday!.locationType || 'Office'}</>
              ) : (
                <><i className="bi bi-clock text-slate-400"></i> Awaiting clock-in</>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 md:flex-none text-center px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="fs-lg fw-bold text-emerald-700 tabular-nums">{myAttToday?.checkIn || '—'}</div>
              <div className="fs-xs text-emerald-600">Check In</div>
            </div>
            <div className="flex-1 md:flex-none text-center px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="fs-lg fw-bold text-slate-400 tabular-nums">{myAttToday?.checkOut || '—'}</div>
              <div className="fs-xs text-slate-400">Check Out</div>
            </div>
          </div>
          <div className="w-full md:w-auto flex mt-4 md:mt-0">
            {!isClockedIn ? (
              <PrimaryBtn className="w-full justify-center" onClick={() => onClockIn('Office')} icon="bi bi-box-arrow-in-right">Clock In</PrimaryBtn>
            ) : !isClockedOut ? (
              <PrimaryBtn className="w-full justify-center" onClick={() => onClockOut()} icon="bi bi-box-arrow-right">Clock Out</PrimaryBtn>
            ) : (
              <span className="w-full text-center fs-xs fw-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg"><i className="bi bi-check-circle-fill mr-1"></i>Done for today</span>
            )}
          </div>
        </div>
          );
        })()}

        {/* Weekly view */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="fs-sm fw-bold text-slate-900">This Week</h3>
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
              {(() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                return weekDays.map((day, i) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const label = `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
                  const att = myEmpRecord ? companyAttendance.find(a => a.employeeId === myEmpRecord.id && a.date === dateStr) : null;
                  let hrs = '—';
                  if (att?.checkIn && att?.checkOut) {
                    const parseTime = (t: string) => { const [time, period] = t.split(' '); let [h, m] = time.split(':').map(Number); if (period === 'PM' && h !== 12) h += 12; if (period === 'AM' && h === 12) h = 0; return h * 60 + m; };
                    const diff = parseTime(att.checkOut) - parseTime(att.checkIn);
                    hrs = diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : '—';
                  }
                  const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isFuture = date > today;
                  const status = att?.status || (isFuture ? 'Upcoming' : isPast ? 'Absent' : 'Pending');
                  return (
                    <tr key={label} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 fs-sm fw-semibold text-slate-900">{label}</td>
                      <td className="px-4 py-3 fs-sm font-mono text-slate-700">{att?.checkIn || '—'}</td>
                      <td className="px-4 py-3 fs-sm font-mono text-slate-400">{att?.checkOut || '—'}</td>
                      <td className="px-4 py-3 fs-sm font-mono text-slate-600">{hrs}</td>
                      <td className="px-4 py-3">
                        {att?.locationType ? (
                          <span >
                            <i ></i>{att.locationType}
                          </span>
                        ) : <span className="text-slate-300 fs-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={status} variant={status === 'Present' ? 'success' : status === 'Late' ? 'warning' : status === 'Upcoming' ? 'default' : 'danger'} />
                      </td>
                    </tr>
                  );
                });
              })()}
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
              <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New Onboarding Record</h2>
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
              <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Edit Onboarding — {editOnbModal.employeeName}</h2>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center fs-sm text-slate-400">No onboarding records yet. Click "New Onboarding" to get started.</div>
            )}
            {companyOnb.map((o, idx) => {
              const pct = o.tasks.length > 0 ? Math.round((o.completedTasks.length / o.tasks.length) * 100) : 0;
              const daysSinceStart = o.startDate ? Math.floor((Date.now() - new Date(o.startDate).getTime()) / 86400000) : 0;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      { (() => { const empObj = localEmployees.find(e => e.id === o.employeeId); return <Avatar first={o.employeeName.split(' ')[0]} last={o.employeeName.split(' ')[1] || ''} photoUrl={empObj?.photoUrl} index={idx} />; })() }
                      <div>
                        <div className="fs-sm fw-semibold text-slate-900">{o.employeeName}</div>
                        <div className="fs-xs text-slate-500">{o.role} · {o.department} · Day {daysSinceStart}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="fs-lg fw-bold text-slate-900 tabular-nums">{pct}%</div>
                      <Badge label={`${o.completedTasks.length}/${o.tasks.length} tasks`} variant={o.completedTasks.length === o.tasks.length ? 'success' : o.status === 'Pending' ? 'warning' : 'info'} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <ProgressBar value={pct} color={pct === 100 ? 'bg-emerald-500' : pct > 60 ? 'bg-blue-500' : 'bg-amber-500'} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {o.tasks.map((task, ti) => {
                      const done = o.completedTasks.includes(task);
                      return (
                        <div key={task} >
                          <button onClick={() => {
                            const newCompleted = done ? o.completedTasks.filter(t => t !== task) : [...o.completedTasks, task];
                            onUpdateOnboarding(o.id, { completedTasks: newCompleted, status: newCompleted.length === o.tasks.length ? 'Completed' : 'In Progress' });
                          }} className="cursor-pointer">
                            <i ></i>
                          </button>
                          {task}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                    <button onClick={() => { setEditOnbModal(o); setEditOnbPhase(o.phase); setEditOnbTasks(o.tasks.join(', ')); setEditOnbStatus(o.status); }} className="fs-xs fw-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">Edit</button>
                    <button
                      disabled={!canDeleteOnb}
                      onClick={async () => {
                        if (!canDeleteOnb) {
                          modalAlert('Permission Required: Your assigned role does not have Delete permission for Onboarding records.', { title: 'Permission Required' });
                          return;
                        }
                        if (await modalConfirm(`Delete onboarding for ${o.employeeName}?`, { variant: 'danger' })) onDeleteOnboarding(o.id);
                      }}
                      title={canDeleteOnb ? 'Delete Onboarding' : 'Permission Required: Delete'}
                      className={`fs-xs fw-semibold transition-all ${
                        canDeleteOnb
                          ? 'text-rose-600 hover:text-rose-800 cursor-pointer'
                          : 'opacity-40 filter saturate-50 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="fs-sm fw-bold text-slate-900 mb-4">Onboarding Checklist Template</h3>
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
                      <div key={t} className="flex items-center gap-2 fs-xs text-slate-600">
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
      const awaitingReview = companyOkrs.filter(o => o.status === 'Awaiting Review');
      return (
        <div className="space-y-6">
          <SectionHeader title="Performance & OKRs" subtitle="Track objectives, key results and employee performance reviews." action={<PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setOkrTitle(''); setOkrKeyResult(''); setOkrPeriod('Q3 2026'); setOkrEmployeeId(''); setShowOkrModal(true); }}>New OKR</PrimaryBtn>} />
          {showOkrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">New OKR</h2>
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

          {/* Awaiting Review Banner */}
          {awaitingReview.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <i className="bi bi-hourglass-split text-amber-600"></i>
              </div>
              <div className="flex-1">
                <div className="fs-sm fw-bold text-amber-800">{awaitingReview.length} OKR{awaitingReview.length !== 1 ? 's' : ''} Awaiting Your Review</div>
                <div className="fs-xs text-amber-600">Employees have marked these objectives as complete. Please review and approve or decline below.</div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-5">
            <StatCard label="Active OKRs" value={companyOkrs.length} icon="bi bi-bullseye" sub="Across all departments" />
            <StatCard label="On Track" value={onTrack.length} icon="bi bi-check-circle" sub="Meeting targets" color="text-emerald-600" />
            <StatCard label="At Risk" value={atRisk.length} icon="bi bi-exclamation-triangle" sub="Needs attention" accent />
            <StatCard label="Awaiting Review" value={awaitingReview.length} icon="bi bi-hourglass-split" sub="Pending approval" color="text-amber-600" />
            <StatCard label="Completed" value={completed.length} icon="bi bi-trophy" sub="This quarter" color="text-emerald-600" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="fs-sm fw-bold text-slate-900">Performance Objectives — Q3 2026</h3>
              <div className="flex flex-wrap gap-2">
                <Select className="w-40 fs-xs py-1.5">
                  <option>All Departments</option>
                  {['Engineering', 'Finance', 'HR', 'Sales', 'Operations'].map(d => <option key={d}>{d}</option>)}
                </Select>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {companyOkrs.length === 0 && (
                <div className="p-10 text-center">
                  <i className="bi bi-bullseye fs-3xl text-slate-200 block mb-2"></i>
                  <p className="fs-sm text-slate-400">No OKRs created yet.</p>
                </div>
              )}
              {companyOkrs.map((okr, i) => {
                const p = okr.progress;
                const isAwaitingReview = okr.status === 'Awaiting Review';
                return (
                  <div key={okr.id} >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        { (() => { const empObj = localEmployees.find(e => e.id === okr.employeeId); return <Avatar first={okr.employeeName.split(' ')[0]} last={okr.employeeName.split(' ')[1] || 'X'} photoUrl={empObj?.photoUrl} index={i} size="sm" />; })() }
                        <div>
                          <div className="fs-sm fw-semibold text-slate-900">{okr.employeeName}</div>
                          <div className="fs-xs text-slate-500">{okr.department}</div>
                        </div>
                      </div>
                      <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : okr.status === 'Completed' ? 'info' : 'warning'} />
                    </div>
                    <div className="fs-sm text-slate-700 mb-1">{okr.title}</div>
                    <div className="fs-xs text-slate-500 mb-2 flex items-center gap-1"><i className="bi bi-arrow-right-short text-slate-400"></i>KR: {okr.keyResult}</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={p} color={isAwaitingReview ? 'bg-amber-500' : p >= 90 ? 'bg-blue-500' : p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-rose-500'} />
                      </div>
                      <span className="fs-xs fw-bold tabular-nums text-slate-700 w-8 text-right">{p}%</span>
                    </div>

                    {/* Approve / Decline actions for Awaiting Review OKRs */}
                    {isAwaitingReview && (
                      <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 fs-xs text-amber-700">
                          <i className="bi bi-hourglass-split"></i>
                          <span className="fw-medium">Employee marked this as complete — awaiting your review</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onUpdateOKRProgress(okr.id, 95, 'On Track')}
                            className="fs-xs fw-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="bi bi-x-circle"></i> Decline
                          </button>
                          <button
                            onClick={() => onUpdateOKRProgress(okr.id, 100, 'Completed')}
                            className="fs-xs fw-semibold px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="bi bi-check-circle"></i> Approve Completion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Employee: own OKRs — expanded detail view
    const myOnTrack = myOkrs.filter(o => o.status === 'On Track');
    const myAtRisk = myOkrs.filter(o => o.status === 'At Risk');
    const myCompleted = myOkrs.filter(o => o.status === 'Completed');
    const avgProgress = myOkrs.length > 0 ? Math.round(myOkrs.reduce((s, o) => s + o.progress, 0) / myOkrs.length) : 0;
    const [expandedOkr, setExpandedOkr] = useState<string | null>(null);
    const [progressSlider, setProgressSlider] = useState<number>(0);

    return (
      <div className="space-y-6">
        <SectionHeader title="My Performance & OKRs" subtitle="Track your goals, update progress and review key results." />

        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Active Goals" value={myOkrs.filter(o => o.status !== 'Completed').length} icon="bi bi-bullseye" sub="Assigned OKRs" />
          <StatCard label="On Track" value={myOnTrack.length} icon="bi bi-check-circle" sub="Meeting targets" color="text-emerald-600" />
          <StatCard label="At Risk" value={myAtRisk.length} icon="bi bi-exclamation-triangle" sub="Needs attention" accent />
          <StatCard label="Avg Progress" value={`${avgProgress}%`} icon="bi bi-graph-up" sub="Across all OKRs" color="text-blue-600" />
        </div>

        {/* Overall progress ring */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={avgProgress >= 70 ? '#10b981' : avgProgress >= 40 ? '#f59e0b' : '#f43f5e'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(avgProgress / 100) * 213.6} 213.6`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="fs-lg fw-bold text-slate-900 tabular-nums">{avgProgress}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="fs-sm fw-bold text-slate-900 mb-1">Quarter Progress Summary</h3>
              <p className="fs-xs text-slate-500 mb-3">Your average OKR completion across {myOkrs.length} objective{myOkrs.length !== 1 ? 's' : ''} this quarter.</p>
              <div className="flex gap-4">
                {[
                  { label: 'Completed', count: myCompleted.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'On Track', count: myOnTrack.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'At Risk', count: myAtRisk.length, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(s => (
                  <div key={s.label} >
                    <span >{s.count}</span>
                    <span className="text-[10px] text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <div className="fs-xs text-slate-400 mb-1">Quarter Deadline</div>
              <div className="fs-sm fw-bold text-slate-800">{(() => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); const end = new Date(now.getFullYear(), (q + 1) * 3, 0); return end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); })()}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{(() => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); const end = new Date(now.getFullYear(), (q + 1) * 3, 0); const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000); return `${diff} days remaining`; })()}</div>
            </div>
          </div>
        </div>

        {/* OKR cards */}
        <div className="space-y-4">
          {myOkrs.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-10 text-center">
              <i className="bi bi-bullseye fs-3xl text-slate-200 block mb-2"></i>
              <p className="fs-sm text-slate-400">No OKRs assigned to you yet.</p>
              <p className="fs-xs text-slate-300 mt-1">Your manager or HR will create objectives for you.</p>
            </div>
          )}
          {myOkrs.map((okr) => {
            const isExpanded = expandedOkr === okr.id;
            const progressColor = okr.progress >= 90 ? 'bg-blue-500' : okr.progress >= 70 ? 'bg-emerald-500' : okr.progress >= 40 ? 'bg-amber-500' : 'bg-rose-500';
            const progressTextColor = okr.progress >= 90 ? 'text-blue-600' : okr.progress >= 70 ? 'text-emerald-600' : okr.progress >= 40 ? 'text-amber-600' : 'text-rose-600';
            return (
              <div key={okr.id} >
                {/* Card header — always visible */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50/40 transition-colors"
                  onClick={() => { setExpandedOkr(isExpanded ? null : okr.id); setProgressSlider(okr.progress); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="fs-sm fw-bold text-slate-900">{okr.title}</span>
                        <Badge label={okr.status} variant={okr.status === 'On Track' ? 'success' : okr.status === 'Completed' ? 'info' : 'warning'} />
                      </div>
                      <div className="fs-xs text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-1"><i className="bi bi-arrow-right-short text-slate-400"></i>KR: {okr.keyResult}</span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1"><i className="bi bi-calendar3 text-slate-400 text-[10px]"></i>{okr.period}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div >{okr.progress}%</div>
                      <i ></i>
                    </div>
                  </div>
                  <ProgressBar value={okr.progress} color={progressColor} />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-5 bg-slate-50/30">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Left: Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="fs-xs fw-bold text-slate-500 uppercase tracking-wider mb-2">Objective Details</h4>
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
                            {[
                              { label: 'Objective', value: okr.title, icon: 'bi bi-bullseye' },
                              { label: 'Key Result', value: okr.keyResult, icon: 'bi bi-arrow-right' },
                              { label: 'Period', value: okr.period, icon: 'bi bi-calendar3' },
                              { label: 'Department', value: okr.department, icon: 'bi bi-diagram-3' },
                              { label: 'Status', value: okr.status, icon: 'bi bi-flag' },
                            ].map(item => (
                              <div key={item.label} className="flex items-start gap-2">
                                <i ></i>
                                <div>
                                  <div className="text-[10px] fw-semibold text-slate-400 uppercase tracking-wider">{item.label}</div>
                                  <div className="fs-xs text-slate-800 fw-medium">{item.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress milestones */}
                        <div>
                          <h4 className="fs-xs fw-bold text-slate-500 uppercase tracking-wider mb-2">Progress Milestones</h4>
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            {[
                              { pct: 25, label: 'Planning & Discovery', reached: okr.progress >= 25 },
                              { pct: 50, label: 'In Progress', reached: okr.progress >= 50 },
                              { pct: 75, label: 'Review & Refine', reached: okr.progress >= 75 },
                              { pct: 100, label: 'Completed', reached: okr.progress >= 100 },
                            ].map(ms => (
                              <div key={ms.pct} className="flex flex-wrap items-center gap-3">
                                <div >
                                  {ms.reached ? <i className="bi bi-check"></i> : ms.pct}
                                </div>
                                <div className="flex-1">
                                  <div >{ms.label}</div>
                                </div>
                                <span >{ms.pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Update progress */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="fs-xs fw-bold text-slate-500 uppercase tracking-wider mb-2">Update Progress</h4>
                          <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="fs-xs text-slate-600">Drag slider or enter value:</span>
                              <span >{progressSlider}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progressSlider}
                              onChange={e => setProgressSlider(Number(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
                              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                            </div>
                            <div className="mt-4">
                              <PrimaryBtn icon="bi bi-check-lg" onClick={() => {
                                onUpdateOKRProgress(okr.id, progressSlider);
                                setExpandedOkr(null);
                              }}>Save Progress</PrimaryBtn>
                            </div>
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div>
                          <h4 className="fs-xs fw-bold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h4>
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                            {[
                              { label: 'Mark as On Track', pct: null, status: 'On Track', icon: 'bi bi-check-circle', color: 'text-emerald-600 hover:bg-emerald-50', disabled: okr.status === 'On Track' },
                              { label: 'Mark as At Risk', pct: null, status: 'At Risk', icon: 'bi bi-exclamation-triangle', color: 'text-amber-600 hover:bg-amber-50', disabled: okr.status === 'At Risk' },
                              { label: 'Mark Complete (100%)', pct: 100, status: 'Completed', icon: 'bi bi-trophy', color: 'text-blue-600 hover:bg-blue-50', disabled: okr.progress === 100 },
                            ].map(act => (
                              <button
                                key={act.label}
                                disabled={act.disabled}
                                onClick={() => {
                                  if (act.pct !== null) {
                                    onUpdateOKRProgress(okr.id, act.pct);
                                  }
                                  setExpandedOkr(null);
                                }}
                                
                              >
                                <i className={act.icon}></i> {act.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── VIEW: ORG CHART ────────────────────────────────────────────────────────
  if (activeView === 'hr-orgchart') {
    return (
      <div className="space-y-6">
        <SectionHeader title="Organisation Chart" subtitle={`${selectedCompany.name} · Reporting structure`} />
        <OrgChart employees={employees} departments={departments} companyId={selectedCompany.id} />
        {editDeptModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="fs-sm fw-bold text-slate-800 mb-4">Edit Department</h3>
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Department Name</label>
              <input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3" />
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Manager (employee)</label>
              <select value={editDeptManager} onChange={e => setEditDeptManager(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3">
                <option value="">Unassigned</option>
                {localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Budget</label>
              <input type="number" value={editDeptBudget} onChange={e => setEditDeptBudget(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3" />
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Reports To</label>
              <select value={editDeptParent} onChange={e => setEditDeptParent(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-4">
                <option value="">Top Level (no parent)</option>
                {departments.filter(d => d.companyId === selectedCompany.id && d.id !== editDeptModal?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { onUpdateDepartment(editDeptModal.id, { name: editDeptName, managerId: editDeptManager || undefined, budget: Number(editDeptBudget), parentId: editDeptParent || undefined }); setEditDeptModal(null); }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 fs-sm fw-semibold hover:bg-blue-700 transition-colors">Save</button>
                <button onClick={() => setEditDeptModal(null)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 fs-sm fw-semibold hover:bg-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: EXIT MANAGEMENT ──────────────────────────────────────────────────
  if (activeView === 'hr-exit') {
    const myExitReqs = myEmpRecord ? companyExitRequests.filter(e => e.employeeId === myEmpRecord.id) : [];
    const managedDeptNames = isHRorAdmin
      ? null
      : departments.filter(d => d.managerId === selectedUser.id && d.companyId === selectedCompany.id).map(d => d.name);
    const deptExitReqs = isHRorAdmin
      ? companyExitRequests
      : companyExitRequests.filter(e => managedDeptNames?.includes(e.department));
    const pendingExits = deptExitReqs.filter(e => e.status === 'Pending');
    const approvedExits = deptExitReqs.filter(e => e.status === 'Approved');
    const isEmployeeOnly = !isHRorAdmin && !isDeptHead;
    const noticeDays = selectedCompany.noticePeriodDays || 30;
    const minLastDay = new Date(Date.now() + noticeDays * 86400000).toISOString().split('T')[0];
    const [editingNotice, setEditingNotice] = useState(false);
    const [noticeInput, setNoticeInput] = useState(String(noticeDays));

    return (
      <div className="space-y-6">
        <SectionHeader title="Exit Management" subtitle="Submit resignation requests, process separations and track clearance." />

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total Requests" value={isEmployeeOnly ? myExitReqs.length : deptExitReqs.length} icon="bi bi-door-open" sub={isEmployeeOnly ? 'My requests' : 'All requests'} />
          <StatCard label="Pending" value={isEmployeeOnly ? myExitReqs.filter(e => e.status === 'Pending' || e.status === 'HOD Approved').length : pendingExits.length} icon="bi bi-clock-history" sub="Awaiting approval" accent />
          <StatCard label="Approved" value={isEmployeeOnly ? myExitReqs.filter(e => e.status === 'Approved').length : approvedExits.length} icon="bi bi-check-circle" sub="Processed" color="text-emerald-600" />
          <StatCard label="Rejected" value={isEmployeeOnly ? myExitReqs.filter(e => e.status === 'Rejected').length : deptExitReqs.filter(e => e.status === 'Rejected').length} icon="bi bi-x-circle" sub="Declined" color="text-rose-600" />
        </div>

        {/* HR/Admin: Notice Period Setting */}
        {isHRorAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="fs-sm fw-bold text-slate-900">Notice Period Setting</h3>
              {!editingNotice && (
                <button onClick={() => { setEditingNotice(true); setNoticeInput(String(noticeDays)); }} className="fs-xs fw-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                  <i className="bi bi-pencil mr-1"></i> Edit
                </button>
              )}
            </div>
            {editingNotice ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Label>Notice Period (days)</Label>
                  <input type="number" min="1" max="365" value={noticeInput} onChange={e => setNoticeInput(e.target.value)} className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 fs-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
                  <span className="fs-xs text-slate-500">days</span>
                </div>
                <PrimaryBtn onClick={() => { const v = parseInt(noticeInput); if (v > 0) { onUpdateCompanySettings(selectedCompany.id, { noticePeriodDays: v }); setEditingNotice(false); } }}>Save</PrimaryBtn>
                <SecBtn onClick={() => setEditingNotice(false)}>Cancel</SecBtn>
              </div>
            ) : (
              <p className="fs-sm text-slate-600">Employees must serve <span className="fw-bold text-slate-900">{noticeDays} days</span> notice before their last working day. Minimum last working day for new requests: <span className="fw-semibold text-slate-900">{minLastDay}</span>.</p>
            )}
          </div>
        )}

        {/* Employee self-service: Submit resignation */}
        {isEmployeeOnly && myEmpRecord && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="fs-sm fw-bold text-slate-900 mb-4">Submit Resignation</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl fs-xs text-blue-700">
              <i className="bi bi-info-circle mr-1"></i> Company notice period is <span className="fw-bold">{noticeDays} days</span>. Your last working day must be on or after <span className="fw-bold">{minLastDay}</span>.
            </div>
            {selfExitSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 fs-sm text-emerald-700 fw-semibold">
                <i className="bi bi-check-circle-fill"></i> Resignation request submitted! Awaiting department head approval.
              </div>
            )}
            <form className="space-y-4" onSubmit={e => {
              e.preventDefault();
              if (!selfExitDate) return;
              onSubmitExitRequest({
                companyId: selectedCompany.id,
                employeeId: myEmpRecord.id,
                employeeName: `${myEmpRecord.firstName} ${myEmpRecord.lastName}`,
                department: myEmpRecord.department || '',
                exitType: selfExitType,
                lastWorkingDay: selfExitDate,
                reason: selfExitReason,
              });
              setSelfExitDate('');
              setSelfExitReason('');
              setSelfExitSuccess(true);
              setTimeout(() => setSelfExitSuccess(false), 3000);
            }}>
              <div>
                <Label>Exit Type *</Label>
                <Select value={selfExitType} onChange={e => setSelfExitType(e.target.value as typeof selfExitType)}>
                  <option value="Resignation">Voluntary Resignation</option>
                  <option value="Retirement">Retirement</option>
                </Select>
              </div>
              <div><Label>Last Working Day *</Label><Input type="date" min={minLastDay} value={selfExitDate} onChange={e => setSelfExitDate(e.target.value)} required /></div>
              <div><Label>Reason</Label><Input value={selfExitReason} onChange={e => setSelfExitReason(e.target.value)} placeholder="Career progression, relocation…" /></div>
              <PrimaryBtn type="submit" icon="bi bi-send">Submit Resignation</PrimaryBtn>
            </form>
          </div>
        )}

        {/* HR/Admin: Register separation */}
        {isHRorAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="fs-sm fw-bold text-slate-900 mb-4">Register Separation (Involuntary)</h3>
            {exitSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 fs-sm text-emerald-700 fw-semibold">
                <i className="bi bi-check-circle-fill"></i> Separation logged successfully!
              </div>
            )}
            <form className="space-y-4" onSubmit={e => {
              e.preventDefault();
              if (!exitEmp || !exitDate) return;
              onSubmitExitRequest({
                companyId: selectedCompany.id,
                employeeId: exitEmp,
                employeeName: localEmployees.find(em => em.id === exitEmp) ? `${localEmployees.find(em => em.id === exitEmp)!.firstName} ${localEmployees.find(em => em.id === exitEmp)!.lastName}` : '',
                department: localEmployees.find(em => em.id === exitEmp)?.department || '',
                exitType: exitType,
                lastWorkingDay: exitDate,
                reason: exitReason,
              });
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

        {/* Exit Requests List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="fs-sm fw-bold text-slate-900">{isEmployeeOnly ? 'My Exit Requests' : 'Exit Requests'}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(isEmployeeOnly ? myExitReqs : deptExitReqs).length === 0 && (
              <div className="p-10 text-center">
                <i className="bi bi-inbox fs-3xl text-slate-200 block mb-2"></i>
                <p className="fs-sm text-slate-400">No exit requests found.</p>
              </div>
            )}
            {(isEmployeeOnly ? myExitReqs : deptExitReqs).map((req, i) => {
              const emp = localEmployees.find(e => e.id === req.employeeId);
              const empName = emp ? `${emp.firstName} ${emp.lastName}` : req.employeeName;
              const empDept = emp?.department || req.department;
              return (
                <div key={req.id} className="p-5 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar first={empName.split(' ')[0]} last={empName.split(' ')[1] || 'X'} photoUrl={emp?.photoUrl} index={i} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="fs-sm fw-semibold text-slate-900">{empName}</span>
                          <span className="fs-xs text-slate-400">· {empDept}</span>
                          <Badge label={req.exitType} variant="info" />
                        </div>
                        <div className="fs-sm text-slate-600 flex items-center gap-2">
                          <i className="bi bi-calendar3 text-slate-400"></i>
                          Last day: {req.lastWorkingDay}
                        </div>
                        {req.reason && <div className="fs-xs text-slate-400 mt-1 italic">"{req.reason}"</div>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'} />

                      {/* Dept Head: approve/reject Pending requests in their department */}
                      {req.status === 'Pending' && isDeptHead && !isHRorAdmin && (() => {
                        const empDeptRecord = departments.find(d => d.name === empDept && d.companyId === selectedCompany.id);
                        const isHOD = empDeptRecord?.managerId === selectedUser.id;
                        if (isHOD) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => onApproveExitRequest(req.id, 'HOD Approved', selectedUser.name)} className="fs-xs fw-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Approve</button>
                              <button onClick={() => onRejectExitRequest(req.id, selectedUser.name)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* HR: approve/reject HOD Approved requests */}
                      {req.status === 'HOD Approved' && isHRorAdmin && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => onApproveExitRequest(req.id, 'Approved', selectedUser.name)} className="fs-xs fw-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Final Approve</button>
                          <button onClick={() => onRejectExitRequest(req.id, selectedUser.name)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                        </div>
                      )}

                      {/* HR: direct approve/reject for Pending (involuntary terminations) */}
                      {req.status === 'Pending' && isHRorAdmin && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => onApproveExitRequest(req.id, 'Approved', selectedUser.name)} className="fs-xs fw-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shadow-xs">Approve</button>
                          <button onClick={() => onRejectExitRequest(req.id, selectedUser.name)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-xs bg-white">Decline</button>
                        </div>
                      )}

                      {req.status === 'Approved' && req.hrApprovedBy && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <i className="bi bi-check2-circle text-emerald-500"></i>
                          Approved by <span className="fw-semibold text-slate-700">{req.hrApprovedBy}</span>
                        </div>
                      )}
                      {req.status === 'HOD Approved' && req.hodApprovedBy && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <i className="bi bi-check2-circle text-amber-500"></i>
                          HOD approved by <span className="fw-semibold text-slate-700">{req.hodApprovedBy}</span> · Awaiting HR
                        </div>
                      )}
                      {req.status === 'Rejected' && req.rejectedBy && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <i className="bi bi-x-circle text-rose-500"></i>
                          Rejected by <span className="fw-semibold text-slate-700">{req.rejectedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HR/Admin: Official Letters */}
        {isHRorAdmin && (
          <HRLettersSection
            selectedCompany={selectedCompany}
            selectedUser={selectedUser}
            employees={localEmployees}
            departments={localDepartments}
            exitRequests={deptExitReqs}
          />
        )}
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
              <h2 className="fs-sm fw-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">Add Department</h2>
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
              <h3 className="fs-sm fw-bold text-slate-800 mb-4">Edit Department</h3>
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Department Name</label>
              <input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3" />
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Manager (employee)</label>
              <select value={editDeptManager} onChange={e => setEditDeptManager(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3">
                <option value="">Unassigned</option>
                {localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Budget</label>
              <input type="number" value={editDeptBudget} onChange={e => setEditDeptBudget(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-3" />
              <label className="fs-xs fw-semibold text-slate-600 mb-1 block">Reports To</label>
              <select value={editDeptParent} onChange={e => setEditDeptParent(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 fs-sm mb-4">
                <option value="">Top Level (no parent)</option>
                {departments.filter(d => d.companyId === selectedCompany.id && d.id !== editDeptModal?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { onUpdateDepartment(editDeptModal.id, { name: editDeptName, managerId: editDeptManager || undefined, budget: Number(editDeptBudget), parentId: editDeptParent || undefined }); setEditDeptModal(null); }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 fs-sm fw-semibold hover:bg-blue-700 transition-colors">Save</button>
                <button onClick={() => setEditDeptModal(null)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 fs-sm fw-semibold hover:bg-slate-200 transition-colors">Cancel</button>
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
              <div key={dept.id} >
                <div className="flex items-start justify-between mb-3">
                  <div className="fs-3xl">{icon}</div>
                  <span className="fs-lg fw-bold tabular-nums text-slate-700">{count}</span>
                </div>
                <div className="fs-sm fw-bold text-slate-900 mb-0.5">{dept.name}</div>
                <div className="fs-xs text-slate-500 mb-3">{managerName ? managerName.firstName + ' ' + managerName.lastName : 'Unassigned'}</div>
                <div className="space-y-1 fs-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><i className="bi bi-cash text-slate-400"></i>GHS {dept.budget.toLocaleString()}</div>
                </div>
                {isHRorAdmin && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                    <button onClick={() => { setEditDeptModal(dept); setEditDeptName(dept.name); setEditDeptManager(dept.managerId || ''); setEditDeptBudget(String(dept.budget)); setEditDeptParent(dept.parentId || ''); }} className="fs-xs fw-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">Edit</button>
                    <button
                      disabled={!canDeleteDept}
                      onClick={async () => {
                        if (!canDeleteDept) {
                          modalAlert('Permission Required: Your assigned role does not have Delete permission for Departments.', { title: 'Permission Required' });
                          return;
                        }
                        if (await modalConfirm(`Delete department "${dept.name}"?`, { variant: 'danger' })) onDeleteDepartment(dept.id);
                      }}
                      title={canDeleteDept ? 'Delete Department' : 'Permission Required: Delete'}
                      className={`fs-xs fw-semibold transition-all ${
                        canDeleteDept
                          ? 'text-rose-600 hover:text-rose-800 cursor-pointer'
                          : 'opacity-40 filter saturate-50 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {companyDepts.length === 0 && (
            <div className="col-span-full text-center fs-sm text-slate-400 py-8">No departments yet. Click "Add Department" to create one.</div>
          )}
        </div>
      </div>
    );
  }

  // ── VIEW: BANK ACCOUNT UPDATES ─────────────────────────────────────────────
  if (activeView === 'hr-bank-updates') {
    const companyUpdates = bankAccountUpdates?.filter(u => u.companyId === selectedCompany.id) || [];
    const pendingUpdates = companyUpdates.filter(u => u.status === 'Pending');
    const approvedUpdates = companyUpdates.filter(u => u.status === 'Approved');
    const rejectedUpdates = companyUpdates.filter(u => u.status === 'Rejected');

    if (!isHRorAdmin) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-xs border border-slate-200">
          <i className="bi bi-shield-lock text-4xl text-slate-300 mb-4"></i>
          <h3 className="fs-lg fw-semibold text-slate-800 mb-2">Access Denied</h3>
          <p className="text-slate-500 fs-sm text-center max-w-md">You do not have permission to view bank account updates. This is restricted to HR and Administrators.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionHeader title="Bank Account Updates" subtitle="Review and approve employee bank account change requests" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Pending Requests" value={pendingUpdates.length.toString()} icon="bi bi-clock-history" sub="Needs review" />
          <StatCard label="Approved (This Month)" value={approvedUpdates.length.toString()} icon="bi bi-check-circle" sub="Processed" />
          <StatCard label="Rejected" value={rejectedUpdates.length.toString()} icon="bi bi-x-circle" sub="Action taken" />
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="fs-base fw-semibold text-slate-800">Pending Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <TableHead cols={[{label: 'Employee'}, {label: 'Requested On'}, {label: 'New Bank Details'}, {label: 'Status'}, {label: 'Actions'}]} />
              <tbody>
                {pendingUpdates.length === 0 ? <EmptyRow cols={5} message="No pending bank account updates" /> : pendingUpdates.map(req => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 fs-sm fw-semibold">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="fs-sm fw-medium text-slate-800">{req.employeeName}</div>
                          <div className="text-[11px] text-slate-500">EMP-{req.employeeId.slice(0, 4)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm">
                      <div><span className="fw-medium">Bank:</span> {req.bankName}</div>
                      <div><span className="fw-medium">Acct:</span> {req.accountNumber}</div>
                      <div><span className="fw-medium">Name:</span> {req.accountName}</div>
                      {req.sortCode && <div><span className="fw-medium">Sort/Routing:</span> {req.sortCode}</div>}
                    </td>
                    <td className="py-3 px-5">
                      <Badge label="Pending" variant="warning" />
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onApproveBankAccountUpdate && onApproveBankAccountUpdate(req.id, req.employeeId, JSON.stringify({ bankName: req.bankName, accountName: req.accountName, accountNumber: req.accountNumber, sortCode: req.sortCode, routingNumber: req.routingNumber }), selectedUser.name)}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg fs-xs fw-semibold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectBankAccountUpdate && onRejectBankAccountUpdate(req.id, selectedUser.name)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg fs-xs fw-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="fs-base fw-semibold text-slate-800">Recent History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <TableHead cols={[{label: 'Employee'}, {label: 'Bank Details'}, {label: 'Status'}, {label: 'Processed By'}, {label: 'Date'}]} />
              <tbody>
                {[...approvedUpdates, ...rejectedUpdates].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0,10).map(req => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 fs-sm fw-semibold">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="fs-sm fw-medium text-slate-800">{req.employeeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm">
                      {req.bankName} - {req.accountNumber.slice(-4).padStart(req.accountNumber.length, '*')}
                    </td>
                    <td className="py-3 px-5">
                      <Badge label={req.status} variant={req.status === 'Approved' ? 'success' : 'danger'} />
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm">
                      {req.processedBy || 'System'}
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {[...approvedUpdates, ...rejectedUpdates].length === 0 && (
                  <EmptyRow cols={5} message="No recent bank account updates history" />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: PROFILE UPDATE REQUESTS ────────────────────────────────────────
  if (activeView === 'hr-profile-updates') {
    const companyRequests = profileUpdateRequests?.filter(r => r.companyId === selectedCompany.id) || [];
    const pendingRequests = companyRequests.filter(r => r.status === 'Pending');
    const processedRequests = companyRequests.filter(r => r.status !== 'Pending');

    if (!isHRorAdmin) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-xs border border-slate-200">
          <i className="bi bi-shield-lock text-4xl text-slate-300 mb-4"></i>
          <h3 className="fs-lg fw-semibold text-slate-800 mb-2">Access Denied</h3>
          <p className="text-slate-500 fs-sm text-center max-w-md">You do not have permission to view profile update requests.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionHeader title="Profile Update Requests" subtitle="Review and approve employee profile change requests" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Pending" value={pendingRequests.length.toString()} icon="bi bi-clock-history" sub="Needs review" />
          <StatCard label="Approved" value={companyRequests.filter(r => r.status === 'Approved').length.toString()} icon="bi bi-check-circle" sub="Applied" />
          <StatCard label="Rejected" value={companyRequests.filter(r => r.status === 'Rejected').length.toString()} icon="bi bi-x-circle" sub="Declined" />
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="fs-base fw-semibold text-slate-800">Pending Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <TableHead cols={[{label: 'Employee'}, {label: 'Field'}, {label: 'Current Value'}, {label: 'Requested Value'}, {label: 'Date'}, {label: 'Actions'}]} />
              <tbody>
                {pendingRequests.length === 0 ? <EmptyRow cols={6} message="No pending profile update requests" /> : pendingRequests.map(req => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 fs-sm fw-semibold">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="fs-sm fw-medium text-slate-800">{req.employeeName}</div>
                          <div className="text-[11px] text-slate-500">{req.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 fs-sm fw-medium">{req.label}</td>
                    <td className="py-3 px-5 text-slate-500 fs-sm">{req.currentValue || <span className="italic text-slate-300">empty</span>}</td>
                    <td className="py-3 px-5 text-slate-800 fs-sm fw-semibold">{req.newValue}</td>
                    <td className="py-3 px-5 text-slate-500 fs-sm">{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onApproveProfileUpdate?.(req.id)}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg fs-xs fw-semibold transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectProfileUpdate?.(req.id)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg fs-xs fw-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processed History */}
        {processedRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="fs-base fw-semibold text-slate-800">History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <TableHead cols={[{label: 'Employee'}, {label: 'Field'}, {label: 'Change'}, {label: 'Status'}, {label: 'Processed By'}, {label: 'Date'}]} />
                <tbody>
                  {processedRequests.sort((a, b) => new Date(b.processedAt || b.requestedAt).getTime() - new Date(a.processedAt || a.requestedAt).getTime()).slice(0, 20).map(req => (
                    <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 fs-sm text-slate-800">{req.employeeName}</td>
                      <td className="py-3 px-5 fs-sm text-slate-600 fw-medium">{req.label}</td>
                      <td className="py-3 px-5 fs-sm text-slate-500">{req.currentValue || '—'} → {req.newValue}</td>
                      <td className="py-3 px-5"><Badge label={req.status} variant={req.status === 'Approved' ? 'success' : 'danger'} /></td>
                      <td className="py-3 px-5 fs-sm text-slate-500">{req.processedBy || '—'}</td>
                      <td className="py-3 px-5 fs-sm text-slate-500">{req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return null;
};

// ── HR LETTERS SECTION ────────────────────────────────────────────────────────
interface HRLettersSectionProps {
  selectedCompany: any;
  selectedUser: any;
  employees: any[];
  departments: any[];
  exitRequests: any[];
}

const HRLettersSection: React.FC<HRLettersSectionProps> = ({ selectedCompany, selectedUser, employees, departments, exitRequests }) => {
  const [letterType, setLetterType] = useState<'resignation' | 'appointment' | 'confirmation'>('resignation');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const today = new Date().toISOString().split('T')[0];
  const companyName = selectedCompany.name;
  const companyAddr = [selectedCompany.address, selectedCompany.country].filter(Boolean).join(', ');

  const generateLetter = (type: string, emp?: any) => {
    const e = emp || selectedEmp;
    if (!e) return '';
    const empName = `${e.firstName} ${e.lastName}`;
    const dept = e.department || 'N/A';
    const position = e.jobTitle || e.position || 'N/A';

    if (type === 'resignation') {
      const exitReq = exitRequests.find(r => r.employeeId === e.id && (r.status === 'Approved' || r.status === 'HOD Approved' || r.status === 'Pending'));
      const lastDay = exitReq?.lastWorkingDay || '[Last Working Day]';
      const exitType = exitReq?.exitType || 'Resignation';
      return `Date: ${today}\n\nTo: ${empName}\nDepartment: ${dept}\nPosition: ${position}\n\nSubject: ${exitType} Acceptance Letter\n\nDear ${empName},\n\nThis letter is to formally acknowledge and accept your ${exitType.toLowerCase()} from ${companyName}, effective ${lastDay}.\n\nWe confirm that your ${exitType.toLowerCase()} has been processed and accepted. During your tenure with us, you have been a valued member of our team, and we appreciate your contributions to the organization.\n\nPlease coordinate with the HR department to complete all necessary clearance procedures, including the return of company assets, final settlement of dues, and any other exit formalities.\n\nWe wish you all the best in your future endeavors.\n\nSincerely,\n\n_________________________\n${selectedUser.name}\nHuman Resources\n${companyName}`;
    }
    if (type === 'appointment') {
      const salary = e.salary ? `${formatCurrency(Number(e.salary), selectedCompany?.currency)}/year` : '[Salary]';
      return `Date: ${today}\n\nTo: ${empName}\n\nSubject: Appointment Letter\n\nDear ${empName},\n\nWe are pleased to offer you the position of ${position} in the ${dept} department at ${companyName}, effective from ${today}.\n\nTerms of Employment:\n\nPosition: ${position}\nDepartment: ${dept}\nReporting To: ${e.managerId ? (employees.find(m => m.id === e.managerId)?.firstName + ' ' + employees.find(m => m.id === e.managerId)?.lastName || 'Department Head') : 'Department Head'}\nCompensation: ${salary}\nEmployment Type: ${e.employmentType || 'Full-time'}\nWork Location: ${e.workLocation || 'Office'}\n\nYour employment will be subject to a probation period of ${selectedCompany.probationPeriodDays || 90} days, during which your performance will be evaluated.\n\nYou are expected to adhere to all company policies, code of conduct, and professional standards as outlined in the employee handbook.\n\nWe look forward to your valuable contributions to our team.\n\nSincerely,\n\n_________________________\n${selectedUser.name}\nHuman Resources\n${companyName}`;
    }
    if (type === 'confirmation') {
      return `Date: ${today}\n\nTo: ${empName}\nDepartment: ${dept}\nPosition: ${position}\n\nSubject: Confirmation of Employment\n\nDear ${empName},\n\nWe are delighted to inform you that, upon review of your performance during your probationary period, your employment with ${companyName} has been confirmed effective ${today}.\n\nYour contributions, dedication, and performance during the probation period have met and often exceeded our expectations. We are confident that you will continue to be a valuable asset to our organization.\n\nAs a confirmed employee, you are now entitled to all benefits and privileges as per the company's policies, including:\n\n• Full employee benefits package\n• Annual leave entitlement\n• Health insurance coverage\n• Retirement plan eligibility\n• Performance bonus eligibility\n\nPlease continue to uphold the high standards of professionalism and commitment that you have demonstrated thus far.\n\nCongratulations and welcome to the team!\n\nSincerely,\n\n_________________________\n${selectedUser.name}\nHuman Resources\n${companyName}`;
    }
    return '';
  };

  const handleGenerate = () => {
    const content = generateLetter(letterType);
    setLetterContent(content);
    setShowPreview(true);
  };

  const handlePrint = () => {
    const logoHtml = selectedCompany.companyLogo
      ? `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0f172a;"><img src="${selectedCompany.companyLogo}" style="height:56px;object-fit:contain;" alt="Logo" /><div><div style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${companyName}</div><div style="font-size:10px;color:#94a3b8;margin-top:1px;">${companyAddr || ''}</div></div></div>`
      : `<div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0f172a;"><div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${companyName}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px;">${companyAddr || ''}</div></div>`;
    const sigHtml = selectedCompany.companySignature
      ? `<div style="margin-top:48px;display:flex;justify-content:flex-end;"><div style="text-align:center;"><img src="${selectedCompany.companySignature}" style="height:60px;object-fit:contain;" alt="Signature" /><div style="width:200px;border-top:1.5px solid #cbd5e1;margin-top:4px;padding-top:6px;"><div style="font-size:10px;color:#64748b;font-weight:600;">${selectedUser.name}</div><div style="font-size:9px;color:#94a3b8;">Human Resources</div></div></div></div>`
      : `<div style="margin-top:48px;display:flex;justify-content:flex-end;"><div style="text-align:center;min-width:200px;"><div style="font-family:'Georgia','Times New Roman',serif;font-size:22px;color:#0f172a;font-style:italic;padding-bottom:6px;border-bottom:1.5px solid #cbd5e1;margin-bottom:6px;">${selectedUser.name}</div><div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Human Resources</div><div style="font-size:9px;color:#94a3b8;margin-top:3px;">${companyName}</div></div></div>`;

    const letterHtml = letterContent
      .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
      .replace(/\n/g, '<br/>');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${letterType} Letter</title><style>
      @page { margin: 20mm 22mm; size: A4; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Georgia', 'Times New Roman', serif; max-width: 680px; margin: 0 auto; padding: 40px; line-height: 1.85; color: #1e293b; font-size: 13px; }
      .letter-title { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; }
      .letter-body p { margin: 12px 0; }
      .letter-body ul { margin: 12px 0 12px 20px; }
      .letter-body li { margin: 4px 0; }
      .letter-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-family: -apple-system, sans-serif; }
      @media print { body { padding: 0; } }
    </style></head><body>
      ${logoHtml}
      <div class="letter-title">${letterType.toUpperCase()} LETTER</div>
      <div class="letter-body"><p style="margin:12px 0;">${letterHtml}</p></div>
      ${sigHtml}
      <div class="letter-footer">
        <div>${companyName}</div>
        <div>Confidential — ${today}</div>
      </div>
    </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 350); }
  };

  const handleDownload = () => {
    const letterHtml = letterContent
      .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
      .replace(/\n/g, '<br/>');

    const logoHtml = selectedCompany.companyLogo
      ? `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0f172a;"><img src="${selectedCompany.companyLogo}" style="height:56px;object-fit:contain;" alt="Logo" /><div><div style="font-size:18px;font-weight:800;color:#0f172a;">${companyName}</div><div style="font-size:10px;color:#94a3b8;">${companyAddr || ''}</div></div></div>`
      : `<div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0f172a;"><div style="font-size:22px;font-weight:800;color:#0f172a;">${companyName}</div></div>`;

    const sigHtml = selectedCompany.companySignature
      ? `<div style="margin-top:48px;"><img src="${selectedCompany.companySignature}" style="height:56px;" alt="Signature" /><div style="width:200px;border-top:1.5px solid #cbd5e1;margin-top:4px;padding-top:6px;font-size:10px;color:#64748b;">${selectedUser.name}<br/>Human Resources</div></div>`
      : `<div style="margin-top:48px;"><div style="width:200px;border-top:1.5px solid #cbd5e1;padding-top:6px;font-size:10px;color:#64748b;">${selectedUser.name}<br/>Human Resources<br/>${companyName}</div></div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${letterType} Letter</title><style>
      @page { margin: 20mm 22mm; size: A4; }
      body { font-family: 'Georgia', serif; max-width: 680px; margin: 0 auto; padding: 40px; line-height: 1.85; color: #1e293b; font-size: 13px; }
      .letter-title { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; }
    </style></head><body>
      ${logoHtml}
      <div class="letter-title">${letterType.toUpperCase()} LETTER</div>
      <div><p style="margin:12px 0;">${letterHtml}</p></div>
      ${sigHtml}
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letterType}_letter_${selectedEmp ? selectedEmp.lastName : 'employee'}_${today}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
      <div className="flex items-center gap-2 mb-1">
        <i className="bi bi-file-earmark-text fs-lg text-slate-700"></i>
        <h3 className="fs-sm fw-bold text-slate-900">Official Letters</h3>
      </div>
      <p className="fs-xs text-slate-500 mb-4">Generate, edit, and print official HR documents using company letterhead.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        {([
          { key: 'resignation', label: 'Resignation / Exit Letter', icon: 'bi bi-door-open', desc: 'For approved exit requests' },
          { key: 'appointment', label: 'Appointment Letter', icon: 'bi bi-person-check', desc: 'For new hire onboarding' },
          { key: 'confirmation', label: 'Confirmation Letter', icon: 'bi bi-patch-check', desc: 'Post-probation confirmation' },
        ] as const).map(lt => (
          <button key={lt.key} onClick={() => { setLetterType(lt.key); setShowPreview(false); setLetterContent(''); }} >
            <i ></i>
            <div className="fs-xs fw-bold">{lt.label}</div>
            <div >{lt.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Label>Select Employee *</Label>
          <Select value={selectedEmpId} onChange={e => { setSelectedEmpId(e.target.value); setShowPreview(false); }}>
            <option value="">Choose employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.department || 'No dept'}</option>
            ))}
          </Select>
        </div>
        <button onClick={handleGenerate} disabled={!selectedEmpId} ><i className="bi bi-file-earmark-text"></i>Generate Letter</button>
      </div>

      {showPreview && letterContent && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <span className="fs-xs fw-bold text-slate-700 uppercase tracking-wide">Letter Preview</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowPreview(false)} className="fs-xs fw-semibold text-slate-500 hover:text-slate-700 cursor-pointer px-2 py-1 rounded hover:bg-slate-200 transition-all"><i className="bi bi-x-lg mr-1"></i>Close</button>
              <button onClick={handlePrint} className="fs-xs fw-semibold text-white bg-slate-900 hover:bg-slate-700 cursor-pointer px-3 py-1.5 rounded-lg transition-all shadow-xs"><i className="bi bi-printer mr-1"></i>Print / PDF</button>
              <button onClick={handleDownload} className="fs-xs fw-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer px-3 py-1.5 rounded-lg transition-all shadow-xs"><i className="bi bi-download mr-1"></i>Download</button>
            </div>
          </div>
          <div className="p-6 bg-white">
            {selectedCompany.companyLogo && (
              <div className="text-center mb-4">
                <img src={selectedCompany.companyLogo} alt="Logo" className="h-16 mx-auto object-contain" />
              </div>
            )}
            <h2 className="text-center fs-xs fw-bold text-slate-400 uppercase tracking-widest mb-4">{letterType} Letter</h2>
            <textarea
              value={letterContent}
              onChange={e => setLetterContent(e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 fs-sm text-slate-900 font-mono leading-relaxed focus:border-slate-400 focus:outline-none resize-y"
              style={{ minHeight: '300px' }}
            />
            {selectedCompany.companySignature && (
              <div className="mt-4">
                <img src={selectedCompany.companySignature} alt="Signature" className="h-12 object-contain" />
              </div>
            )}
          </div>
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center gap-2">
            <i className="bi bi-info-circle fs-xs text-slate-400"></i>
            <span className="text-[10px] text-slate-500">Edit the content above before printing. Changes will reflect in the printed/downloaded letter.</span>
          </div>
        </div>
      )}
    </div>
  );
};













