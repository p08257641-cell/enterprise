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
  'HR Manager': ['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance'],
  'HR Officer': ['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance'],
  'Accountant': ['Accounting', 'Intelligence', 'Learning Management (LMS)'],
  'Finance Manager': ['Accounting', 'Administration', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Manager': ['CRM', 'Sales', 'POS', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Rep': ['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Executive': ['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
  'Inventory Manager': ['Operations', 'POS', 'Intelligence', 'Learning Management (LMS)'],
  'Store Keeper': ['Operations', 'Intelligence', 'Learning Management (LMS)'],
  'Support Agent': ['Help Desk', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Learning Management (LMS)'],
  'HR Department Head': ['HR', 'Payroll', 'Compliance', 'Intelligence', 'Learning Management (LMS)'],
  'Sales Department Head': ['Sales', 'CRM', 'POS', 'Intelligence'],
  'Finance Department Head': ['Accounting', 'Payroll', 'Intelligence'],
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
  ],
  'HR Officer': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding',
    'hr-performance', 'hr-orgchart', 'hr-departments', 'hr-bank-updates', 'hr-profile-updates',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
    'comp-checklists', 'comp-policies', 'comp-incidents',
    'wf-builder', 'ai-chat', 'ai-insights',
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
  ],
  'Sales Department Head': [
    'hr-employees', 'hr-orgchart', 'hr-leave',
    'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports',
    'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets',
    'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Finance Department Head': [
    'hr-employees', 'hr-orgchart', 'hr-leave',
    'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports',
    'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime',
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
