/**
 * Single source of truth for role-based access control.
 *
 * Module visibility is decided by TWO gates that must BOTH pass:
 *   1. Role permission  — does this role have the module/submenu in its map?
 *   2. Subscription     — is the module subscribed by the company (activeModules)?
 * The subscription gate is enforced in the Sidebar (which knows the module
 * metadata); this file owns the pure role→module / role→submenu maps and the
 * role-capability helpers so they are not duplicated across components.
 */

export type Role = string;

/** Top-level module ids each role may see. */
export const ROLE_MODULES: Record<string, string[]> = {
  'Super Admin': ['Platform Management'],
  'Company Admin': ['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
  'CEO': ['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
  'HR Manager': ['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance', 'Administration', 'Platform Management'],
  'HR Officer': ['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance', 'Administration', 'Platform Management'],
  'Accountant': ['Accounting', 'Intelligence', 'Learning Management (LMS)'],
  'Finance Manager': ['Accounting', 'Administration', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Manager': ['CRM', 'Sales', 'POS', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Rep': ['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Executive': ['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
  'Inventory Manager': ['Operations', 'POS', 'Intelligence', 'Learning Management (LMS)'],
  'Store Keeper': ['Operations', 'Intelligence', 'Learning Management (LMS)'],
  'Support Agent': ['Help Desk', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Learning Management (LMS)'],
  'HR Department Head': ['HR', 'Payroll', 'Compliance', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Administration', 'Platform Management'],
  'Sales Department Head': ['Sales', 'CRM', 'POS', 'Intelligence', 'Learning Management (LMS)'],
  'Finance Department Head': ['Accounting', 'Payroll', 'Intelligence', 'Administration', 'Learning Management (LMS)'],
  'Operations Department Head': ['Operations', 'Intelligence'],
  'IT Department Head': ['Administration', 'Help Desk', 'POS', 'Intelligence'],
  'Help Desk Admin': ['Help Desk', 'Intelligence', 'Communication', 'Learning Management (LMS)'],
  'Employee': ['HR', 'Payroll', 'Help Desk', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
};

/**
 * Submenu ids each role may see. '*' means all submenus in permitted modules.
 * IMPORTANT: these ids MUST match the `id` field of each SubMenuItem in
 * Sidebar.tsx, otherwise hasSubmenuAccess() filters the item out and the
 * submenu silently disappears for that role. Keep this list in lockstep with
 * the Sidebar's submenu ids.
 */
export const ROLE_SUBMENUS: Record<string, string[]> = {
  'Super Admin': ['platform-tenants', 'platform-billing', 'platform-subscriptions', 'platform-analytics', 'platform-users', 'platform-settings'],
  'Company Admin': ['*'],
  'CEO': ['*'],
  'HR Manager': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding',
    'hr-performance', 'hr-orgchart', 'hr-exit', 'hr-departments', 'hr-bank-updates', 'hr-profile-updates',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
    'comp-checklists', 'comp-policies', 'comp-incidents',
    'wf-builder', 'ai-chat', 'ai-insights',
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'pending-approvals',
    'platform-subscriptions',
  ],
  'HR Officer': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding',
    'hr-performance', 'hr-orgchart', 'hr-departments', 'hr-bank-updates', 'hr-profile-updates',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
    'comp-checklists', 'comp-policies', 'comp-incidents',
    'wf-builder', 'ai-chat', 'ai-insights',
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'pending-approvals',
    'platform-subscriptions',
  ],
  'Accountant': [
    'hr-employees', 'hr-orgchart', 'hr-departments',
    'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Finance Manager': [
    'hr-employees', 'hr-orgchart', 'hr-departments',
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Manager': [
    'hr-employees', 'hr-orgchart', 'hr-departments',
    'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports',
    'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets',
    'pos-register', 'pos-sessions', 'pos-reports',
    'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Rep': [
    'hr-employees', 'hr-orgchart',
    'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports',
    'sales-orders', 'sales-quotes', 'sales-customers',
    'pos-register', 'pos-sessions', 'pos-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Executive': [
    'hr-employees', 'hr-orgchart',
    'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports',
    'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets',
    'pos-register', 'pos-sessions', 'pos-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Inventory Manager': [
    'hr-employees', 'hr-orgchart', 'hr-leave',
    'proj-kanban',
    'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation',
    'proc-pos', 'proc-vendors', 'proc-rfq',
    'mfg-bom', 'mfg-orders', 'mfg-quality',
    'asset-register', 'asset-maintenance', 'asset-depreciation',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Store Keeper': [
    'hr-employees', 'hr-orgchart',
    'proj-kanban',
    'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation',
    'proc-pos', 'proc-vendors', 'proc-rfq',
    'mfg-bom', 'mfg-orders', 'mfg-quality',
    'asset-register', 'asset-maintenance', 'asset-depreciation',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Support Agent': [
    'hr-employees', 'hr-orgchart',
    'hd-tickets', 'hd-sla', 'hd-kb',
    'vis-checkin', 'vis-log', 'vis-badges',
    'lms-courses', 'lms-quizzes', 'lms-progress',
    'comp-checklists', 'comp-policies', 'comp-incidents',
    'comm-announcements', 'comm-chat', 'comm-email',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'HR Department Head': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding',
    'hr-performance', 'hr-orgchart', 'hr-departments', 'hr-exit', 'hr-bank-updates', 'hr-profile-updates',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
    'comp-checklists', 'comp-policies', 'comp-incidents',
    'lms-courses', 'lms-quizzes', 'lms-progress',
    'wf-builder', 'ai-chat', 'ai-insights',
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'pending-approvals',
    'platform-subscriptions',
  ],
  'Sales Department Head': [
    'hr-employees', 'hr-orgchart', 'hr-departments', 'hr-leave',
    'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports',
    'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets',
    'pos-register', 'pos-sessions', 'pos-reports',
    'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports',
    'lms-courses', 'lms-quizzes', 'lms-progress',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Finance Department Head': [
    'hr-employees', 'hr-orgchart', 'hr-departments', 'hr-leave',
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
    'lms-courses', 'lms-quizzes', 'lms-progress',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Operations Department Head': [
    'proj-kanban',
    'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation',
    'proc-pos', 'proc-vendors', 'proc-rfq',
    'mfg-bom', 'mfg-orders', 'mfg-quality',
    'asset-register', 'asset-maintenance', 'asset-depreciation',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'IT Department Head': [
    'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings',
    'hd-tickets', 'hd-sla', 'hd-kb',
    'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Employee': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-orgchart', 'hr-performance', 'hr-exit',
    'payroll-slips',
    'hd-tickets', 'hd-sla', 'hd-kb',
    'comm-announcements', 'comm-chat', 'comm-email',
    'lms-courses', 'lms-quizzes', 'lms-progress',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'comp-checklists', 'comp-policies', 'comp-incidents',
  ],
  'Help Desk Admin': [
    'hd-tickets', 'hd-sla', 'hd-kb',
    'comm-announcements', 'comm-chat', 'comm-email',
    'lms-courses', 'lms-quizzes', 'lms-progress',
  ],
};

/** Role-capability helpers (standardised across all views). */
export const isSuperAdminRole = (role?: Role): boolean => role === 'Super Admin';
export const isAdminRole = (role?: Role): boolean => role === 'Super Admin' || role === 'Company Admin';
export const isHRRole = (role?: Role): boolean => role === 'HR Manager' || role === 'HR Officer';
export const isHRorAdminRole = (role?: Role): boolean => isAdminRole(role) || isHRRole(role);
export const isEmployeeRole = (role?: Role): boolean => role === 'Employee';
export const DEPT_HEAD_ROLES = ['HR Department Head', 'Sales Department Head', 'Finance Department Head', 'Operations Department Head', 'IT Department Head'] as const;
export const isDeptHeadRole = (role?: Role): boolean => (DEPT_HEAD_ROLES as readonly string[]).includes(role || '');
export const isHRDeptHead = (role?: Role): boolean => role === 'HR Department Head';
export const isSalesDeptHead = (role?: Role): boolean => role === 'Sales Department Head';
export const isFinanceDeptHead = (role?: Role): boolean => role === 'Finance Department Head';
export const isOpsDeptHead = (role?: Role): boolean => role === 'Operations Department Head';
export const isAccountantRole = (role?: Role): boolean => role === 'Accountant';
export const isITDeptHead = (role?: Role): boolean => role === 'IT Department Head';
export const isHelpDeskAdmin = (role?: Role): boolean => role === 'Help Desk Admin';

/** Does the role have permission for a top-level module? (Subscription is checked separately by the Sidebar.) */
export const canAccessModule = (role: Role, moduleId: string): boolean => {
  if (moduleId === 'Dashboard') return true;
  const perms = ROLE_MODULES[role] || [];
  return perms.includes(moduleId) || perms.includes('*');
};

/** Does the role have permission for a submenu id? (Subscription is checked separately by the Sidebar.) */
export const canAccessSubmenu = (role: Role, submenuId: string): boolean => {
  const perms = ROLE_SUBMENUS[role] || [];
  return perms.includes('*') || perms.includes(submenuId);
};

/** All available top-level module IDs for the role editor UI. */
export const ALL_MODULES = [
  'Platform Management', 'Administration', 'HR', 'Payroll', 'CRM', 'Accounting',
  'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management',
  'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)',
];

/** All available submenu IDs grouped by module, for the role editor UI. */
export const ALL_SUBMENUS: Record<string, { id: string; label: string }[]> = {
  'Platform Management': [
    { id: 'platform-tenants', label: 'Tenant Companies' },
    { id: 'platform-billing', label: 'Billing & Revenue' },
    { id: 'platform-subscriptions', label: 'Module Subscriptions' },
    { id: 'platform-analytics', label: 'Platform Analytics' },
    { id: 'platform-users', label: 'Platform Users' },
    { id: 'platform-settings', label: 'Platform Settings' },
  ],
  'Administration': [
    { id: 'admin-branches', label: 'Branches' },
    { id: 'admin-departments', label: 'Departments' },
    { id: 'admin-users', label: 'Users' },
    { id: 'admin-roles', label: 'Roles' },
    { id: 'admin-approvals', label: 'Approval Workflows' },
    { id: 'admin-settings', label: 'Settings' },
  ],
  'HR': [
    { id: 'hr-employees', label: 'Employees' },
    { id: 'hr-attendance', label: 'Attendance' },
    { id: 'hr-leave', label: 'Leave Management' },
    { id: 'hr-recruitment', label: 'Recruitment (ATS)' },
    { id: 'hr-onboarding', label: 'Onboarding' },
    { id: 'hr-performance', label: 'Performance / OKRs' },
    { id: 'hr-orgchart', label: 'Org Chart' },
    { id: 'hr-exit', label: 'Exit Management' },
    { id: 'hr-departments', label: 'Departments' },
    { id: 'hr-bank-updates', label: 'Bank Account Updates' },
    { id: 'hr-profile-updates', label: 'Profile Update Requests' },
  ],
  'Payroll': [
    { id: 'payroll-run', label: 'Run Payroll' },
    { id: 'payroll-slips', label: 'Payslips' },
    { id: 'payroll-groups', label: 'Payroll Groups' },
    { id: 'payroll-tax', label: 'Tax & Deductions' },
    { id: 'payroll-overtime', label: 'Overtime' },
  ],
  'CRM': [
    { id: 'crm-pipeline', label: 'Lead Pipeline' },
    { id: 'crm-contacts', label: 'Contacts' },
    { id: 'crm-activities', label: 'Activities' },
    { id: 'crm-tasks', label: 'Tasks' },
    { id: 'crm-emails', label: 'Emails' },
    { id: 'crm-reports', label: 'CRM Reports' },
  ],
  'Accounting': [
    { id: 'accounting', label: 'General Ledger' },
    { id: 'acc-invoices', label: 'Invoices' },
    { id: 'acc-expenses', label: 'Expenses' },
    { id: 'acc-ap', label: 'Accounts Payable' },
    { id: 'acc-ar', label: 'Accounts Receivable' },
    { id: 'acc-bank', label: 'Bank & Reconciliation' },
    { id: 'acc-assets', label: 'Fixed Assets & Budgets' },
    { id: 'acc-tax', label: 'Tax & Compliance' },
    { id: 'acc-reports', label: 'Reports' },
  ],
  'Sales': [
    { id: 'sales-orders', label: 'Sales Orders' },
    { id: 'sales-quotes', label: 'Quotations' },
    { id: 'sales-customers', label: 'Customers' },
    { id: 'sales-targets', label: 'Sales Targets' },
  ],
  'Operations': [
    { id: 'proj-kanban', label: 'Project Management' },
    { id: 'proc-pos', label: 'Procurement' },
    { id: 'mfg-bom', label: 'Manufacturing' },
    { id: 'asset-register', label: 'Asset Management' },
    { id: 'doc-locker', label: 'Document Management' },
  ],
  'POS': [
    { id: 'pos-terminal', label: 'POS Terminal' },
    { id: 'pos-products', label: 'Products' },
    { id: 'pos-customers', label: 'Customers' },
    { id: 'pos-shifts', label: 'Shifts' },
    { id: 'pos-sales', label: 'Sales History' },
    { id: 'pos-discounts', label: 'Discounts' },
    { id: 'pos-returns', label: 'Returns' },
    { id: 'pos-reports', label: 'Reports' },
  ],
  'Help Desk': [
    { id: 'hd-tickets', label: 'Tickets' },
    { id: 'hd-sla', label: 'SLA Policies' },
    { id: 'hd-kb', label: 'Knowledge Base' },
  ],
  'Visitor Management': [
    { id: 'vis-checkin', label: 'Check-In' },
    { id: 'vis-log', label: 'Visitor Log' },
    { id: 'vis-badges', label: 'Badges' },
  ],
  'Compliance': [
    { id: 'comp-checklists', label: 'Checklists' },
    { id: 'comp-policies', label: 'Policies' },
    { id: 'comp-incidents', label: 'Incidents' },
  ],
  'Communication': [
    { id: 'comm-announcements', label: 'Announcements' },
    { id: 'comm-chat', label: 'Chat' },
    { id: 'comm-email', label: 'Email' },
  ],
  'Voting': [],
  'Gallery': [],
  'Learning Management (LMS)': [
    { id: 'lms-courses', label: 'Courses' },
    { id: 'lms-quizzes', label: 'Quizzes' },
    { id: 'lms-progress', label: 'Progress Tracking' },
  ],
  'Intelligence': [
    { id: 'wf-builder', label: 'Workflow & Automation' },
    { id: 'ai-chat', label: 'Gemini AI Chat' },
    { id: 'ai-insights', label: 'AI Smart Insights' },
  ],
};
