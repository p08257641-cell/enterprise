export interface SubModuleItem {
  id: string;
  label: string;
}

export interface MainModuleItem {
  id: string;
  label: string;
  icon: string;
  subModules?: SubModuleItem[];
}

export const MODULE_HIERARCHY: MainModuleItem[] = [
  {
    id: 'Administration',
    label: 'Administration',
    icon: 'bi bi-folder-symlink',
    subModules: [
      { id: 'admin-branches', label: 'Branches' },
      { id: 'admin-departments', label: 'Departments' },
      { id: 'admin-roles', label: 'Roles' },
      { id: 'admin-approvals', label: 'Approval Workflows' },
      { id: 'admin-settings', label: 'Settings' },
      { id: 'admin-evat', label: 'E-VAT Settings' },
      { id: 'admin-integrations', label: 'Integrations' },
      { id: 'pending-approvals', label: 'Pending Approvals' },
    ],
  },
  {
    id: 'HR',
    label: 'HR & Directory',
    icon: 'bi bi-people',
    subModules: [
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
  },
  {
    id: 'Payroll',
    label: 'Payroll & Salary',
    icon: 'bi bi-cash-stack',
    subModules: [
      { id: 'payroll-run', label: 'Run Payroll' },
      { id: 'payroll-slips', label: 'Payslips' },
      { id: 'payroll-groups', label: 'Payroll Groups' },
      { id: 'payroll-tax', label: 'Tax & Deductions' },
      { id: 'payroll-overtime', label: 'Overtime' },
    ],
  },
  {
    id: 'CRM',
    label: 'CRM & Sales Pipeline',
    icon: 'bi bi-graph-up-arrow',
    subModules: [
      { id: 'crm-pipeline', label: 'Lead Pipeline' },
      { id: 'crm-contacts', label: 'Contacts' },
      { id: 'crm-activities', label: 'Activities' },
      { id: 'crm-tasks', label: 'Tasks' },
      { id: 'crm-emails', label: 'Emails' },
      { id: 'crm-reports', label: 'CRM Reports' },
    ],
  },
  {
    id: 'Accounting',
    label: 'Accounting & Ledger',
    icon: 'bi bi-book',
    subModules: [
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
  },
  {
    id: 'Sales',
    label: 'Sales & Orders',
    icon: 'bi bi-tag',
    subModules: [
      { id: 'sales-orders', label: 'Sales Orders' },
      { id: 'sales-quotes', label: 'Quotations' },
      { id: 'sales-customers', label: 'Customers' },
      { id: 'sales-targets', label: 'Sales Targets' },
    ],
  },
  {
    id: 'POS',
    label: 'Point of Sale (POS)',
    icon: 'bi bi-cash-coin',
    subModules: [
      { id: 'pos-terminal', label: 'POS Terminal' },
      { id: 'pos-products', label: 'Products' },
      { id: 'pos-customers', label: 'Customers' },
      { id: 'pos-shifts', label: 'Shifts' },
      { id: 'pos-sales', label: 'Sales History' },
      { id: 'pos-discounts', label: 'Discounts' },
      { id: 'pos-returns', label: 'Returns' },
      { id: 'pos-reports', label: 'Reports' },
    ],
  },
  {
    id: 'Operations',
    label: 'Operations & Projects',
    icon: 'bi bi-gear-wide-connected',
    subModules: [
      { id: 'proj-kanban', label: 'Project Management' },
      { id: 'proc-pos', label: 'Procurement' },
      { id: 'mfg-bom', label: 'Manufacturing' },
      { id: 'asset-register', label: 'Asset Management' },
      { id: 'doc-locker', label: 'Document Management' },
    ],
  },
  {
    id: 'Help Desk',
    label: 'Help Desk & Support',
    icon: 'bi bi-heart-pulse',
  },
  {
    id: 'Visitor Management',
    label: 'Visitor Management',
    icon: 'bi bi-door-open',
  },
  {
    id: 'Compliance',
    label: 'Compliance & Governance',
    icon: 'bi bi-shield-check',
  },
  {
    id: 'Learning Management (LMS)',
    label: 'Learning Management (LMS)',
    icon: 'bi bi-journal-bookmark-fill',
  },
  {
    id: 'Communication',
    label: 'Communication & Broadcasts',
    icon: 'bi bi-megaphone',
  },
  {
    id: 'Voting',
    label: 'Voting & Polls',
    icon: 'bi bi-check2-square',
  },
  {
    id: 'Gallery',
    label: 'Image Gallery',
    icon: 'bi bi-images',
  },
  {
    id: 'Intelligence',
    label: 'Intelligence & Analytics',
    icon: 'bi bi-cpu',
    subModules: [
      { id: 'wf-builder', label: 'Workflow & Automation' },
      { id: 'ai-chat', label: 'Gemini AI Chat' },
      { id: 'ai-insights', label: 'AI Smart Insights' },
    ],
  },
];
