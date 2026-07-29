-- Custom Roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id text PRIMARY KEY,
  "companyId" text,
  name text,
  description text,
  modules text[],
  submenus text[],
  "isSystem" boolean DEFAULT false,
  "createdAt" text
);

-- Seed built-in roles for all companies
-- Uses a DO block to insert once per company that exists

DO $$
DECLARE
  comp RECORD;
BEGIN
  FOR comp IN SELECT id FROM companies LOOP

    INSERT INTO custom_roles (id, "companyId", name, description, modules, submenus, "isSystem", "createdAt")
    VALUES
    (
      'role-' || comp.id || '-super-admin',
      comp.id,
      'Super Admin',
      'Full platform administration access',
      ARRAY['Platform Management'],
      ARRAY['platform-tenants', 'platform-billing', 'platform-subscriptions', 'platform-analytics', 'platform-users', 'platform-settings'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-company-admin',
      comp.id,
      'Company Admin',
      'Full system access within tenant',
      ARRAY['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
      ARRAY['*'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-ceo',
      comp.id,
      'CEO',
      'Full company access, executive oversight',
      ARRAY['Administration', 'HR', 'Payroll', 'CRM', 'Accounting', 'Sales', 'Operations', 'Help Desk', 'POS', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
      ARRAY['*'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-hr-manager',
      comp.id,
      'HR Manager',
      'HR, Payroll, Attendance, Recruitment, Leave Approvals',
      ARRAY['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance', 'Administration', 'Platform Management'],
      ARRAY['hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding', 'hr-performance', 'hr-orgchart', 'hr-exit', 'hr-departments', 'hr-bank-updates', 'hr-profile-updates', 'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime', 'comp-checklists', 'comp-policies', 'comp-incidents', 'wf-builder', 'ai-chat', 'ai-insights', 'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings', 'platform-subscriptions'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-hr-officer',
      comp.id,
      'HR Officer',
      'HR, Payroll, Attendance, Recruitment',
      ARRAY['HR', 'Payroll', 'Intelligence', 'Voting', 'Gallery', 'Learning Management (LMS)', 'Compliance', 'Administration', 'Platform Management'],
      ARRAY['hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding', 'hr-performance', 'hr-orgchart', 'hr-departments', 'hr-bank-updates', 'hr-profile-updates', 'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime', 'comp-checklists', 'comp-policies', 'comp-incidents', 'wf-builder', 'ai-chat', 'ai-insights', 'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings', 'platform-subscriptions'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-accountant',
      comp.id,
      'Accountant',
      'Accounting, Journal Entries, Reports',
      ARRAY['Accounting', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-departments', 'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-finance-manager',
      comp.id,
      'Finance Manager',
      'Accounting, Invoices, Ledger, Expenses, Payroll Processing',
      ARRAY['Accounting', 'Administration', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-departments', 'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings', 'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-sales-manager',
      comp.id,
      'Sales Manager',
      'CRM pipeline, Customer contacts, Sales logs',
      ARRAY['CRM', 'Sales', 'POS', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-departments', 'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports', 'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets', 'pos-register', 'pos-sessions', 'pos-reports', 'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-sales-rep',
      comp.id,
      'Sales Rep',
      'CRM pipeline, Customer contacts',
      ARRAY['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports', 'sales-orders', 'sales-quotes', 'sales-customers', 'pos-register', 'pos-sessions', 'pos-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-sales-executive',
      comp.id,
      'Sales Executive',
      'CRM pipeline, Sales targets, Customer contacts',
      ARRAY['CRM', 'Sales', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports', 'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets', 'pos-register', 'pos-sessions', 'pos-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-inventory-manager',
      comp.id,
      'Inventory Manager',
      'Stock Levels, Warehouse transfers, Procurement POs',
      ARRAY['Operations', 'POS', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-leave', 'proj-kanban', 'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation', 'proc-pos', 'proc-vendors', 'proc-rfq', 'mfg-bom', 'mfg-orders', 'mfg-quality', 'asset-register', 'asset-maintenance', 'asset-depreciation', 'doc-locker', 'doc-esign', 'doc-ocr', 'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-store-keeper',
      comp.id,
      'Store Keeper',
      'Stock Levels, Warehouse management',
      ARRAY['Operations', 'Intelligence', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'proj-kanban', 'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation', 'proc-pos', 'proc-vendors', 'proc-rfq', 'mfg-bom', 'mfg-orders', 'mfg-quality', 'asset-register', 'asset-maintenance', 'asset-depreciation', 'doc-locker', 'doc-esign', 'doc-ocr', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-support-agent',
      comp.id,
      'Support Agent',
      'Help Desk tickets, Visitor logs, Internal chat',
      ARRAY['Help Desk', 'Intelligence', 'Visitor Management', 'Compliance', 'Communication', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-orgchart', 'hd-tickets', 'hd-sla', 'hd-kb', 'vis-checkin', 'vis-log', 'vis-badges', 'lms-courses', 'lms-quizzes', 'lms-progress', 'comp-checklists', 'comp-policies', 'comp-incidents', 'comm-announcements', 'comm-chat', 'comm-email', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-hr-dept-head',
      comp.id,
      'HR Department Head',
      'HR, Payroll, Compliance, LMS — full authority',
      ARRAY['HR', 'Payroll', 'Compliance', 'Intelligence', 'Learning Management (LMS)', 'Administration', 'Platform Management'],
      ARRAY['hr-employees', 'hr-attendance', 'hr-leave', 'hr-recruitment', 'hr-onboarding', 'hr-performance', 'hr-orgchart', 'hr-departments', 'hr-exit', 'hr-bank-updates', 'hr-profile-updates', 'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime', 'comp-checklists', 'comp-policies', 'comp-incidents', 'lms-courses', 'lms-quizzes', 'lms-progress', 'wf-builder', 'ai-chat', 'ai-insights', 'admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings', 'platform-subscriptions'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-sales-dept-head',
      comp.id,
      'Sales Department Head',
      'Sales, CRM, POS — full authority',
      ARRAY['Sales', 'CRM', 'POS', 'Intelligence'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-leave', 'crm-pipeline', 'crm-contacts', 'crm-activities', 'crm-tasks', 'crm-emails', 'crm-reports', 'sales-orders', 'sales-quotes', 'sales-customers', 'sales-targets', 'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-finance-dept-head',
      comp.id,
      'Finance Department Head',
      'Accounting, Payroll — full authority',
      ARRAY['Accounting', 'Payroll', 'Intelligence'],
      ARRAY['hr-employees', 'hr-orgchart', 'hr-leave', 'accounting', 'acc-invoices', 'acc-expenses', 'acc-ap', 'acc-ar', 'acc-bank', 'acc-assets', 'acc-tax', 'acc-reports', 'payroll-run', 'payroll-slips', 'payroll-groups', 'payroll-tax', 'payroll-overtime', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-ops-dept-head',
      comp.id,
      'Operations Department Head',
      'Operations, Inventory, Manufacturing — full authority',
      ARRAY['Operations', 'Intelligence'],
      ARRAY['proj-kanban', 'inv-stock', 'inv-warehouses', 'inv-transfers', 'inv-valuation', 'proc-pos', 'proc-vendors', 'proc-rfq', 'mfg-bom', 'mfg-orders', 'mfg-quality', 'asset-register', 'asset-maintenance', 'asset-depreciation', 'doc-locker', 'doc-esign', 'doc-ocr', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-it-dept-head',
      comp.id,
      'IT Department Head',
      'Administration, Help Desk, POS — full authority',
      ARRAY['Administration', 'Help Desk', 'POS', 'Intelligence'],
      ARRAY['admin-branches', 'admin-departments', 'admin-users', 'admin-roles', 'admin-approvals', 'admin-settings', 'hd-tickets', 'hd-sla', 'hd-kb', 'pos-terminal', 'pos-products', 'pos-customers', 'pos-shifts', 'pos-sales', 'pos-discounts', 'pos-returns', 'pos-reports', 'wf-builder', 'ai-chat', 'ai-insights'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-helpdesk-admin',
      comp.id,
      'Help Desk Admin',
      'Help Desk management and knowledge base',
      ARRAY['Help Desk', 'Intelligence', 'Communication', 'Learning Management (LMS)'],
      ARRAY['hd-tickets', 'hd-sla', 'hd-kb', 'comm-announcements', 'comm-chat', 'comm-email', 'lms-courses', 'lms-quizzes', 'lms-progress'],
      true,
      now()::text
    ),
    (
      'role-' || comp.id || '-employee',
      comp.id,
      'Employee',
      'Self-service: leave, attendance, payslips, help desk',
      ARRAY['HR', 'Payroll', 'Help Desk', 'Compliance', 'Communication', 'Voting', 'Gallery', 'Learning Management (LMS)'],
      ARRAY['hr-employees', 'hr-attendance', 'hr-leave', 'hr-orgchart', 'hr-performance', 'hr-exit', 'payroll-slips', 'hd-tickets', 'hd-sla', 'hd-kb', 'comm-announcements', 'comm-chat', 'comm-email', 'lms-courses', 'lms-quizzes', 'lms-progress', 'doc-locker', 'doc-esign', 'doc-ocr', 'comp-checklists', 'comp-policies', 'comp-incidents'],
      true,
      now()::text
    )
    ON CONFLICT DO NOTHING;

  END LOOP;
END $$;
