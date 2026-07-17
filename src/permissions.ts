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
  'Company Admin': ['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication'],
  'CEO': ['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication'],
  'HR Manager': ['HR', 'Payroll', 'Intelligence'],
  'HR Officer': ['HR', 'Payroll', 'Intelligence'],
  'Accountant': ['Accounting', 'Intelligence'],
  'Finance Manager': ['Accounting', 'Administration', 'Intelligence'],
  'Sales Manager': ['CRM', 'Sales', 'POS', 'Intelligence'],
  'Sales Rep': ['CRM', 'Sales', 'Intelligence'],
  'Sales Executive': ['CRM', 'Sales', 'Intelligence'],
  'Inventory Manager': ['Operations', 'POS', 'Intelligence'],
  'Store Keeper': ['Operations', 'Intelligence'],
  'Support Agent': ['Help Desk', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication'],
  'Department Head': ['HR', 'Administration', 'Intelligence'],
  'Employee': ['HR', 'Payroll', 'Help Desk', 'Compliance', 'Communication'],
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
    'hr-performance', 'hr-orgchart', 'hr-exit', 'hr-departments',
    'payroll-run', 'payroll-slips', 'payroll-tax', 'payroll-overtime',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'HR Officer': [
    'hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding',
    'hr-performance', 'hr-orgchart', 'hr-departments',
    'payroll-run', 'payroll-slips', 'payroll-tax', 'payroll-overtime',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Accountant': [
    'hr-employees', 'hr-orgchart', 'hr-departments',
    'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Finance Manager': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Manager': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Rep': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Sales Executive': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Inventory Manager': [
    'proj-kanban',
    'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation',
    'proc-pos', 'proc-vendors', 'proc-rfq',
    'mfg-bom', 'mfg-orders', 'mfg-quality',
    'asset-register', 'asset-maintenance', 'asset-depreciation',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Store Keeper': [
    'proj-kanban',
    'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation',
    'proc-pos', 'proc-vendors', 'proc-rfq',
    'mfg-bom', 'mfg-orders', 'mfg-quality',
    'asset-register', 'asset-maintenance', 'asset-depreciation',
    'doc-locker', 'doc-esign', 'doc-ocr',
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Support Agent': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Department Head': [
    'wf-builder', 'ai-chat', 'ai-insights',
  ],
  'Employee': [
  ],
};

/** Role-capability helpers (standardised across all views). */
export const isSuperAdminRole = (role?: Role): boolean => role === 'Super Admin';
export const isAdminRole = (role?: Role): boolean => role === 'Super Admin' || role === 'Company Admin';
export const isHRRole = (role?: Role): boolean => role === 'HR Manager' || role === 'HR Officer';
export const isHRorAdminRole = (role?: Role): boolean => isAdminRole(role) || isHRRole(role);
export const isEmployeeRole = (role?: Role): boolean => role === 'Employee';

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
