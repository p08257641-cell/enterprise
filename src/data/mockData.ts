/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, User, Department, Branch, Employee, CRMLead, CRMActivityLog, CRMTask, CRMEmailLog, GLAccount, Invoice, InventoryItem, SupportTicket, ERPWorkflow, AuditLog, APIKey, POSProduct, POSCategory, POSTerminal, POSShift, POSCustomer, POSSale, POSDiscount, POSReturn, POSDailyReport, JournalEntry, Expense, FiscalPeriod, OpeningBalance, Bill, BillPayment, CustomerPayment, BankAccount, BankTransaction, BankReconciliation, FixedAsset, DepreciationEntry, Budget, CostCenter, CurrencyRate, TaxCode, TaxReturn, IntercompanyTransaction, ConsolidationRule, ComplianceCheck, AuditSnapshot, PolicyDocument, FilingDeadline, SalesOrder } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'c-acme',
    name: 'Acme Global Manufacturing',
    domain: 'acme-mfg.com',
    logo: '🏭',
    industry: 'Industrial Equipment',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'English',
    activeModules: ['Administration', 'HR', 'Payroll', 'Accounting', 'CRM', 'Inventory', 'POS', 'Sales', 'Procurement', 'Manufacturing', 'Project Management', 'AI Assistant', 'Reports & Analytics', 'Workflow & Automation', 'Communication', 'Voting', 'Compliance', 'Learning Management (LMS)', 'Document Management', 'Visitor Management', 'Asset Management', 'Help Desk'],
    premiumFeatures: ['GPS Attendance', 'AI Lead Scoring', 'Financial Forecasting', 'Auto Reordering'],
    billingPlan: 'Enterprise',
    billingStatus: 'Active',
    subscriptionExpiresAt: '2027-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'c-starlight',
    name: 'Starlight Biotech Europe',
    domain: 'starlight-bio.eu',
    logo: '🧬',
    industry: 'Biopharmaceuticals',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    language: 'German/English',
    activeModules: ['Administration', 'HR', 'Accounting', 'Project Management'],
    premiumFeatures: ['GPS Attendance'],
    billingPlan: 'Core',
    billingStatus: 'Active',
    subscriptionExpiresAt: '2026-10-15T23:59:59Z',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'c-zenretail',
    name: 'ZenRetail Group',
    domain: 'zenretail.co.uk',
    logo: '🛍️',
    industry: 'E-commerce & Retail',
    currency: 'GBP',
    timezone: 'Europe/London',
    language: 'English',
    activeModules: ['Administration', 'CRM', 'Inventory', 'Help Desk', 'POS'],
    premiumFeatures: ['AI Lead Scoring'],
    billingPlan: 'Premium',
    billingStatus: 'Trialing',
    createdAt: '2026-06-01T10:00:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  // Super Admins
  {
    id: 'u-super',
    companyId: '', // Platform Level
    name: 'Sarah Connor',
    email: 'sarah.connor@erp-saas.com',
    role: 'Super Admin',
    roles: ['Super Admin'],
    activeRole: 'Super Admin',
    status: 'Active',
    loginEnabled: true,
    permissions: ['ALL'],
    createdAt: '2025-01-01T00:00:00Z'
  },
  // Acme Corp Users
  {
    id: 'u-acme-admin',
    companyId: 'c-acme',
    name: 'Alex Mercer',
    email: 'alex.mercer@acme-mfg.com',
    role: 'Company Admin',
    roles: ['Company Admin', 'Employee', 'Help Desk Admin'],
    activeRole: 'Help Desk Admin',
    department: 'Operations',
    branch: 'New York HQ',
    avatar: '👨‍💼',
    permissions: ['admin_all', 'module_manage', 'user_invite'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-01-16T09:00:00Z'
  },
  {
    id: 'u-acme-hr',
    companyId: 'c-acme',
    name: 'Elena Rostova',
    email: 'elena.r@acme-mfg.com',
    role: 'HR Manager',
    roles: ['HR Manager', 'Employee', 'Department Head'],
    activeRole: 'HR Manager',
    department: 'Human Resources',
    branch: 'New York HQ',
    avatar: '👩‍💼',
    permissions: ['hr_view', 'hr_edit', 'leave_approve', 'attendance_manage'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'u-acme-finance',
    companyId: 'c-acme',
    name: 'David Vance',
    email: 'david.v@acme-mfg.com',
    role: 'Accountant',
    roles: ['Accountant', 'Employee', 'Department Head'],
    activeRole: 'Accountant',
    department: 'Finance',
    branch: 'New York HQ',
    avatar: '👨‍💻',
    permissions: ['accounting_view', 'accounting_edit', 'invoice_manage'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-01-18T11:00:00Z'
  },
  {
    id: 'u-acme-finmgr',
    companyId: 'c-acme',
    name: 'Rachel Green',
    email: 'rachel.g@acme-mfg.com',
    role: 'Finance Manager',
    roles: ['Finance Manager', 'Accountant', 'Employee'],
    activeRole: 'Finance Manager',
    department: 'Finance',
    branch: 'New York HQ',
    avatar: '👩‍💼',
    permissions: ['accounting_view', 'accounting_edit', 'invoice_manage', 'payroll_manage', 'admin_manage'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-03-10T14:00:00Z'
  },
  {
    id: 'u-acme-sales',
    companyId: 'c-acme',
    name: 'Samantha Brady',
    email: 'samantha.b@acme-mfg.com',
    role: 'Sales Manager',
    roles: ['Sales Manager', 'Employee', 'Department Head'],
    activeRole: 'Sales Manager',
    department: 'Sales',
    branch: 'Chicago Factory',
    avatar: '👩‍💼',
    permissions: ['crm_view', 'crm_edit', 'leads_manage'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-02-01T09:00:00Z'
  },
  {
    id: 'u-acme-inventory',
    companyId: 'c-acme',
    name: 'Marcus Brody',
    email: 'marcus.b@acme-mfg.com',
    role: 'Inventory Manager',
    roles: ['Inventory Manager', 'Employee'],
    activeRole: 'Inventory Manager',
    department: 'Logistics',
    branch: 'Chicago Factory',
    avatar: '👨‍🔧',
    permissions: ['inventory_view', 'inventory_edit', 'stock_adjust'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-02-15T09:00:00Z'
  },
  {
    id: 'u-acme-sales2',
    companyId: 'c-acme',
    name: 'Sarah Johnson',
    email: 'sarah.j@acme-mfg.com',
    role: 'Sales Rep',
    roles: ['Sales Rep', 'Employee'],
    activeRole: 'Sales Rep',
    department: 'Sales',
    branch: 'Chicago Factory',
    avatar: '👩‍💼',
    permissions: ['crm_view', 'crm_edit'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-04-10T09:00:00Z'
  },
  {
    id: 'u-acme-sales3',
    companyId: 'c-acme',
    name: 'John Smith',
    email: 'john.s@acme-mfg.com',
    role: 'Sales Rep',
    roles: ['Sales Rep', 'Employee'],
    activeRole: 'Sales Rep',
    department: 'Sales',
    branch: 'Chicago Factory',
    avatar: '👨‍💼',
    permissions: ['crm_view', 'crm_edit'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-05-01T09:00:00Z'
  },

  // Starlight Biotech Users
  {
    id: 'u-starlight-admin',
    companyId: 'c-starlight',
    name: 'Dr. Lukas Fischer',
    email: 'lukas.f@starlight-bio.eu',
    role: 'Company Admin',
    roles: ['Company Admin', 'Employee'],
    activeRole: 'Company Admin',
    department: 'Management',
    branch: 'Munich Lab',
    avatar: '🔬',
    permissions: ['admin_all'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-03-21T09:00:00Z'
  },
  {
    id: 'u-starlight-hr',
    companyId: 'c-starlight',
    name: 'Sophie Dubois',
    email: 'sophie.d@starlight-bio.eu',
    role: 'HR Officer',
    roles: ['HR Officer', 'Employee'],
    activeRole: 'HR Officer',
    department: 'Human Resources',
    branch: 'Paris Office',
    avatar: '👩‍💼',
    permissions: ['hr_view', 'hr_edit'],
    status: 'Active',
    loginEnabled: true,
    createdAt: '2025-04-01T08:30:00Z'
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd-exec', companyId: 'c-acme', name: 'Executive Office', managerId: 'u-acme-admin', budget: 500000, employeeCount: 3 },
  { id: 'd-ops', companyId: 'c-acme', name: 'Operations', managerId: 'u-acme-admin', parentId: 'd-exec', budget: 1500000, employeeCount: 120 },
  { id: 'd-hr', companyId: 'c-acme', name: 'Human Resources', managerId: 'u-acme-hr', parentId: 'd-exec', budget: 300000, employeeCount: 8 },
  { id: 'd-finance', companyId: 'c-acme', name: 'Finance', managerId: 'u-acme-finance', parentId: 'd-exec', budget: 450000, employeeCount: 12 },
  { id: 'd-sales', companyId: 'c-acme', name: 'Sales', managerId: 'u-acme-sales', parentId: 'd-exec', budget: 800000, employeeCount: 25 },
  { id: 'd-logistics', companyId: 'c-acme', name: 'Logistics & Stock', managerId: 'u-acme-inventory', parentId: 'd-ops', budget: 600000, employeeCount: 15 },
  { id: 'd-eng', companyId: 'c-acme', name: 'Engineering', parentId: 'd-ops', budget: 900000, employeeCount: 30 },
  { id: 'd-it', companyId: 'c-acme', name: 'IT', parentId: 'd-exec', budget: 400000, employeeCount: 10 },
  { id: 'd-legal', companyId: 'c-acme', name: 'Legal', parentId: 'd-finance', budget: 200000, employeeCount: 4 },
  
  { id: 'd-rnd', companyId: 'c-starlight', name: 'Research & Development', managerId: 'u-starlight-admin', budget: 2500000, employeeCount: 45 },
  { id: 'd-star-hr', companyId: 'c-starlight', name: 'Human Resources', managerId: 'u-starlight-hr', parentId: 'd-rnd', budget: 200000, employeeCount: 4 }
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b-acme-hq', companyId: 'c-acme', name: 'New York HQ', location: 'Manhattan, NY', isMain: true },
  { id: 'b-acme-chicago', companyId: 'c-acme', name: 'Chicago Factory', location: 'Chicago, IL', isMain: false },
  
  { id: 'b-star-munich', companyId: 'c-starlight', name: 'Munich Lab', location: 'Munich, Germany', isMain: true },
  { id: 'b-star-paris', companyId: 'c-starlight', name: 'Paris Office', location: 'Paris, France', isMain: false }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    companyId: 'c-acme',
    userId: 'u-acme-admin',
    employeeNumber: 'EMP-2025-0001',
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'alex.mercer@acme-mfg.com',
    department: 'Operations',
    designation: 'Operations Director',
    branch: 'New York HQ',
    status: 'Active',
    joiningDate: '2025-01-16',
    salary: 12500
  },
  {
    id: 'emp-2',
    companyId: 'c-acme',
    userId: 'u-acme-hr',
    employeeNumber: 'EMP-2025-0002',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@acme-mfg.com',
    department: 'Human Resources',
    designation: 'HR Lead',
    branch: 'New York HQ',
    status: 'Active',
    joiningDate: '2025-01-20',
    salary: 8200
  },
  {
    id: 'emp-3',
    companyId: 'c-acme',
    userId: 'u-acme-finance',
    employeeNumber: 'EMP-2025-0003',
    firstName: 'David',
    lastName: 'Vance',
    email: 'david.v@acme-mfg.com',
    department: 'Finance',
    designation: 'Chief Accountant',
    branch: 'New York HQ',
    status: 'Active',
    joiningDate: '2025-01-18',
    salary: 9500
  },
  {
    id: 'emp-4',
    companyId: 'c-acme',
    userId: 'u-acme-sales',
    employeeNumber: 'EMP-2025-0004',
    firstName: 'Samantha',
    lastName: 'Brady',
    email: 'samantha.b@acme-mfg.com',
    department: 'Sales',
    designation: 'VP of Sales',
    branch: 'Chicago Factory',
    status: 'Active',
    joiningDate: '2025-02-01',
    salary: 11000
  },
  {
    id: 'emp-5',
    companyId: 'c-acme',
    userId: 'u-acme-inventory',
    employeeNumber: 'EMP-2025-0012',
    firstName: 'Michael',
    lastName: 'Chang',
    email: 'michael.c@acme-mfg.com',
    department: 'Logistics & Stock',
    designation: 'Store Keeper',
    branch: 'Chicago Factory',
    status: 'On Leave',
    joiningDate: '2025-03-10',
    salary: 4500
  },
  {
    id: 'emp-6',
    companyId: 'c-acme',
    userId: 'u-acme-finmgr',
    employeeNumber: 'EMP-2025-0005',
    firstName: 'Rachel',
    lastName: 'Green',
    email: 'rachel.g@acme-mfg.com',
    department: 'Finance',
    designation: 'Finance Manager',
    branch: 'New York HQ',
    status: 'Active',
    joiningDate: '2025-03-10',
    salary: 10500
  },
  {
    id: 'emp-7',
    companyId: 'c-acme',
    userId: 'u-acme-sales2',
    employeeNumber: 'EMP-2025-0006',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@acme-mfg.com',
    department: 'Sales',
    designation: 'Sales Representative',
    branch: 'Chicago Factory',
    status: 'Active',
    joiningDate: '2025-04-10',
    salary: 6500
  },
  {
    id: 'emp-8',
    companyId: 'c-acme',
    userId: 'u-acme-sales3',
    employeeNumber: 'EMP-2025-0007',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.s@acme-mfg.com',
    department: 'Sales',
    designation: 'Sales Representative',
    branch: 'Chicago Factory',
    status: 'Active',
    joiningDate: '2025-05-01',
    salary: 6200
  }
];

export const INITIAL_LEADS: CRMLead[] = [
  {
    id: 'lead-1',
    companyId: 'c-acme',
    firstName: 'Richard',
    lastName: 'Hendricks',
    email: 'richard@piedpiper.com',
    phone: '+1 650 555 0199',
    companyName: 'Pied Piper Corp',
    status: 'Qualified',
    source: 'Website',
    value: 45000,
    assignedTo: 'u-acme-sales',
    assignedToName: 'Samantha Brady',
    department: 'd-sales',
    aiLeadScore: 92,
    aiFollowUpSuggested: 'Lead has viewed pricing 4 times. Offer custom enterprise manufacturing quote with 10% volume discount.',
    createdAt: '2026-07-01T14:30:00Z',
    comments: [
      {
        id: 'comment-1',
        leadId: 'lead-1',
        userId: 'u-acme-sales',
        userName: 'Samantha Brady',
        content: 'Initial discovery call went well. They have budget approval for Q4.',
        timestamp: '2026-07-02T10:00:00Z'
      },
      {
        id: 'comment-2',
        leadId: 'lead-1',
        userId: 'u-acme-admin',
        userName: 'Admin User',
        content: 'Added to priority list for executive review.',
        timestamp: '2026-07-03T14:30:00Z'
      }
    ]
  },
  {
    id: 'lead-2',
    companyId: 'c-acme',
    firstName: 'Monica',
    lastName: 'Hall',
    email: 'monica@raviga.com',
    phone: '+1 415 555 0142',
    companyName: 'Raviga Capital',
    status: 'New',
    source: 'Referral',
    value: 120000,
    assignedTo: 'u-acme-sales2',
    assignedToName: 'Sarah Johnson',
    department: 'd-sales',
    aiLeadScore: 78,
    aiFollowUpSuggested: 'Suggested email: Introduce Acme custom CNC robotics packages aligned with biotech manufacturing investments.',
    createdAt: '2026-07-06T10:15:00Z',
    comments: []
  },
  {
    id: 'lead-3',
    companyId: 'c-acme',
    firstName: 'Gavin',
    lastName: 'Belson',
    email: 'gavin@hooli.xyz',
    phone: '+1 408 555 0100',
    companyName: 'Hooli Tech',
    status: 'Proposal Sent',
    source: 'LinkedIn',
    value: 250000,
    assignedTo: 'u-acme-sales3',
    assignedToName: 'John Smith',
    department: 'd-sales',
    aiLeadScore: 64,
    aiFollowUpSuggested: 'Schedule quick status call. Competitors are bidding heavily, highlight robust multi-branch manufacturing capabilities.',
    createdAt: '2026-06-20T09:00:00Z',
    comments: [
      {
        id: 'comment-3',
        leadId: 'lead-3',
        userId: 'u-acme-sales3',
        userName: 'John Smith',
        content: 'Proposal sent. Follow up scheduled for next Tuesday.',
        timestamp: '2026-06-21T15:00:00Z'
      }
    ]
  }
];

export const INITIAL_CRM_ACTIVITIES: CRMActivityLog[] = [
  { id: 'act-1', companyId: 'c-acme', leadId: 'lead-1', type: 'Call', subject: 'Discovery Call', description: 'Discussed product roadmap and Q4 budget allocation. Client very interested in our CNC robotics line.', performedBy: 'u-acme-sales', performedByName: 'Samantha Brady', createdAt: '2026-07-10T09:00:00Z' },
  { id: 'act-2', companyId: 'c-acme', leadId: 'lead-1', type: 'Email', subject: 'Pricing Proposal Sent', description: 'Sent enterprise CNC pricing proposal with 10% volume discount for 50-unit order.', performedBy: 'u-acme-sales', performedByName: 'Samantha Brady', createdAt: '2026-07-11T14:30:00Z' },
  { id: 'act-3', companyId: 'c-acme', leadId: 'lead-2', type: 'Meeting', subject: 'Initial Meeting', description: 'Met with Monica to discuss biotech manufacturing needs. Strong interest in custom solutions.', performedBy: 'u-acme-sales2', performedByName: 'Sarah Johnson', createdAt: '2026-07-08T11:00:00Z' },
  { id: 'act-4', companyId: 'c-acme', leadId: 'lead-3', type: 'Note', subject: 'Competitor Intel', description: 'Hooli is evaluating 3 vendors. We need to highlight our multi-branch manufacturing capability.', performedBy: 'u-acme-sales3', performedByName: 'John Smith', createdAt: '2026-07-09T16:00:00Z' },
  { id: 'act-5', companyId: 'c-acme', leadId: 'lead-3', type: 'Task', subject: 'Follow-up Contract', description: 'Send revised contract by Friday. Decision expected Monday.', performedBy: 'u-acme-sales3', performedByName: 'John Smith', createdAt: '2026-07-12T10:00:00Z' },
  { id: 'act-6', companyId: 'c-acme', leadId: 'lead-1', type: 'Call', subject: 'Demo Follow-up', description: 'Client very interested. Requested custom pricing for 50-unit order. Follow up with revised quote.', performedBy: 'u-acme-sales', performedByName: 'Samantha Brady', createdAt: '2026-07-13T15:00:00Z' },
];

export const INITIAL_CRM_TASKS: CRMTask[] = [
  { id: 'task-1', companyId: 'c-acme', leadId: 'lead-1', leadName: 'Richard Hendricks', companyName: 'Pied Piper Corp', title: 'Send revised pricing proposal', description: 'Client requested 15% volume discount for 50-unit order. Update proposal and send via DocuSign.', type: 'Proposal', priority: 'High', status: 'Pending', assignedTo: 'u-acme-sales', assignedToName: 'Samantha Brady', dueDate: '2026-07-18T00:00:00Z', createdAt: '2026-07-13T10:00:00Z' },
  { id: 'task-2', companyId: 'c-acme', leadId: 'lead-1', leadName: 'Richard Hendricks', companyName: 'Pied Piper Corp', title: 'Follow-up call on proposal', description: 'Check if client has reviewed the updated pricing. Address any objections.', type: 'Call', priority: 'Medium', status: 'Pending', assignedTo: 'u-acme-sales', assignedToName: 'Samantha Brady', dueDate: '2026-07-22T00:00:00Z', createdAt: '2026-07-13T10:00:00Z' },
  { id: 'task-3', companyId: 'c-acme', leadId: 'lead-2', leadName: 'Monica Hall', companyName: 'Raviga Capital', title: 'Schedule product demo', description: 'Client interested in biotech manufacturing solutions. Book demo slot with engineering team.', type: 'Meeting', priority: 'High', status: 'In Progress', assignedTo: 'u-acme-sales2', assignedToName: 'Sarah Johnson', dueDate: '2026-07-16T00:00:00Z', createdAt: '2026-07-10T09:00:00Z' },
  { id: 'task-4', companyId: 'c-acme', leadId: 'lead-3', leadName: 'Gavin Belson', companyName: 'Hooli Tech', title: 'Send contract revision', description: 'Update contract with multi-branch manufacturing terms. Remove competitor escalation clause.', type: 'Email', priority: 'Urgent', status: 'Pending', assignedTo: 'u-acme-sales3', assignedToName: 'John Smith', dueDate: '2026-07-15T00:00:00Z', createdAt: '2026-07-12T14:00:00Z' },
  { id: 'task-5', companyId: 'c-acme', leadId: 'lead-3', leadName: 'Gavin Belson', companyName: 'Hooli Tech', title: 'Internal review meeting', description: 'Discuss Hooli deal strategy with sales team. Competitor pressure is high.', type: 'Meeting', priority: 'Medium', status: 'Completed', assignedTo: 'u-acme-sales', assignedToName: 'John Smith', dueDate: '2026-07-14T00:00:00Z', completedAt: '2026-07-14T11:00:00Z', createdAt: '2026-07-12T14:00:00Z' },
];

export const INITIAL_CRM_EMAILS: CRMEmailLog[] = [
  { id: 'email-1', companyId: 'c-acme', leadId: 'lead-1', to: 'richard@piedpiper.com', subject: 'Enterprise CNC Pricing Proposal', body: 'Hi Richard, please find attached the updated pricing proposal for 50-unit CNC order with 10% volume discount.', sentBy: 'u-acme-sales', sentByName: 'Samantha Brady', createdAt: '2026-07-11T14:30:00Z' },
  { id: 'email-2', companyId: 'c-acme', leadId: 'lead-3', to: 'gavin@hooli.xyz', subject: 'Contract Revision - Multi-Branch Manufacturing', body: 'Hi Gavin, per our discussion, I have revised the contract to include multi-branch manufacturing capabilities. Please review and let me know if you have any questions.', sentBy: 'u-acme-sales', sentByName: 'John Smith', createdAt: '2026-07-12T16:00:00Z' },
];

export const INITIAL_GL_ACCOUNTS: GLAccount[] = [
  { id: 'gl-1010', companyId: 'c-acme', code: '1010', name: 'Operating Cash Account', type: 'Asset', balance: 450200.00 },
  { id: 'gl-1200', companyId: 'c-acme', code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 125000.00 },
  { id: 'gl-1400', companyId: 'c-acme', code: '1400', name: 'Finished Goods Inventory', type: 'Asset', balance: 350000.00 },
  { id: 'gl-2010', companyId: 'c-acme', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 48000.00 },
  { id: 'gl-3010', companyId: 'c-acme', code: '3010', name: 'Retained Earnings', type: 'Equity', balance: 500000.00 },
  { id: 'gl-4010', companyId: 'c-acme', code: '4010', name: 'Manufacturing Revenue', type: 'Revenue', balance: 420000.00 },
  { id: 'gl-5010', companyId: 'c-acme', code: '5010', name: 'Cost of Goods Sold', type: 'Expense', balance: 180000.00 },
  { id: 'gl-5020', companyId: 'c-acme', code: '5020', name: 'Employee Payroll Expense', type: 'Expense', balance: 45800.00 },
  { id: 'gl-5030', companyId: 'c-acme', code: '5030', name: 'SaaS Software & IT Expenses', type: 'Expense', balance: 12000.00 }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    companyId: 'c-acme',
    invoiceNumber: 'INV-2026-0421',
    customerId: 'lead-1',
    customerName: 'Pied Piper Corp',
    issueDate: '2026-06-15',
    dueDate: '2026-07-15',
    subtotal: 40000,
    tax: 3200,
    total: 43200,
    status: 'Sent'
  },
  {
    id: 'inv-002',
    companyId: 'c-acme',
    invoiceNumber: 'INV-2026-0422',
    customerId: 'lead-3',
    customerName: 'Hooli Tech',
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    subtotal: 250000,
    tax: 20000,
    total: 270000,
    status: 'Paid'
  },
  {
    id: 'inv-003',
    companyId: 'c-acme',
    invoiceNumber: 'INV-2026-0423',
    customerId: 'lead-2',
    customerName: 'Raviga Capital',
    issueDate: '2026-07-02',
    dueDate: '2026-08-02',
    subtotal: 12000,
    tax: 960,
    total: 12960,
    status: 'Draft'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-item-1',
    companyId: 'c-acme',
    sku: 'SKU-CNC-BR-01',
    name: 'CNC Brass Fittings (12mm)',
    category: 'Hardware',
    warehouse: 'Warehouse A (Chicago)',
    stockLevel: 1450,
    minStockLevel: 500,
    unitPrice: 3.50,
    supplier: 'Midwest Metal Supply',
    batchNumber: 'B-2026-X1',
    expiryDate: '2030-12-31'
  },
  {
    id: 'inv-item-2',
    companyId: 'c-acme',
    sku: 'SKU-SERVO-AC-200',
    name: 'Heavy Duty AC Servo Motor 200W',
    category: 'Electronics',
    warehouse: 'Warehouse B (Chicago)',
    stockLevel: 45,
    minStockLevel: 50, // ALERT! LOW STOCK
    unitPrice: 180.00,
    supplier: 'Nippon Electronics Corp',
    batchNumber: 'B-2026-S4'
  },
  {
    id: 'inv-item-3',
    companyId: 'c-acme',
    sku: 'SKU-PLC-SI-S7',
    name: 'Siemens S7 Industrial PLC Unit',
    category: 'Automation',
    warehouse: 'Warehouse A (Chicago)',
    stockLevel: 120,
    minStockLevel: 20,
    unitPrice: 850.00,
    supplier: 'Siemens AG Global',
    batchNumber: 'B-2025-PL9'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-1',
    companyId: 'c-acme',
    ticketNumber: 'TKT-1002',
    customerName: 'Richard Hendricks',
    customerEmail: 'richard@piedpiper.com',
    subject: 'Delayed delivery on order SKU-CNC-BR-01',
    description: 'We ordered 500 units of Brass Fittings and the delivery date passed. Please supply tracking or update ASAP.',
    category: 'Technical',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'u-acme-admin',
    replies: [],
    createdAt: '2026-07-05T09:12:00Z'
  },
  {
    id: 'tick-2',
    companyId: 'c-acme',
    ticketNumber: 'TKT-1003',
    customerName: 'Monica Hall',
    customerEmail: 'monica@raviga.com',
    subject: 'Request for volume pricing on electronics batch',
    description: 'Looking to purchase 100+ servo motor units. Would like to inquire if there is wholesale pricing tier.',
    category: 'Sales',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'u-acme-sales',
    replies: [],
    createdAt: '2026-07-08T15:20:00Z'
  }
];

export const INITIAL_WORKFLOWS: ERPWorkflow[] = [
  {
    id: 'wf-1',
    companyId: 'c-acme',
    name: 'Lead-to-Task CRM Automation',
    description: 'Auto-assign leads, generate task and draft AI suggestions upon registration.',
    isActive: true,
    blocks: [
      { id: 'b1', type: 'Trigger', label: 'Lead Created', value: 'CRM Lead Created', config: {} },
      { id: 'b2', type: 'Action', label: 'Assign to Sales Dept', value: 'Assign to Sales Department', config: { departmentId: 'd-sales' } },
      { id: 'b3', type: 'Condition', label: 'Check Lead Value', value: 'If Estimated Value > $50k', config: { op: 'gt', value: 50000 } },
      { id: 'b4', type: 'Action', label: 'Generate Task', value: 'Create Follow-up Task (Priority High)', config: { priority: 'High' } }
    ],
    createdAt: '2025-05-10T12:00:00Z'
  },
  {
    id: 'wf-2',
    companyId: 'c-acme',
    name: 'Low Stock Auto Procurement Request',
    description: 'When stock drops below minimum safety index, generate notification and purchase order request.',
    isActive: false,
    blocks: [
      { id: 'b21', type: 'Trigger', label: 'Stock Drops Below Threshold', value: 'Inventory Low Stock Event', config: {} },
      { id: 'b22', type: 'Action', label: 'Notify Store Manager', value: 'Send Email to Inventory Manager', config: {} },
      { id: 'b23', type: 'Action', label: 'Auto Procurement Draft', value: 'Create Draft Purchase Request with Supplier', config: {} }
    ],
    createdAt: '2025-06-15T08:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    companyId: 'c-acme',
    userId: 'u-acme-admin',
    userName: 'Alex Mercer',
    action: 'USER_LOGIN',
    module: 'Administration',
    details: 'Alex Mercer logged in successfully from NY Office IP.',
    ipAddress: '192.168.1.100',
    timestamp: '2026-07-09T08:15:30Z'
  },
  {
    id: 'log-2',
    companyId: 'c-acme',
    userId: 'u-acme-hr',
    userName: 'Elena Rostova',
    action: 'LEAVE_APPROVE',
    module: 'HR',
    details: 'Approved sick leave request for Michael Chang.',
    ipAddress: '192.168.1.104',
    timestamp: '2026-07-09T09:22:11Z'
  },
  {
    id: 'log-3',
    companyId: 'c-acme',
    userId: 'u-acme-finance',
    userName: 'David Vance',
    action: 'INVOICE_CREATE',
    module: 'Accounting',
    details: 'Created draft invoice INV-2026-0423 for Raviga Capital ($12,960.00).',
    ipAddress: '192.168.1.102',
    timestamp: '2026-07-09T10:05:00Z'
  }
];

// POS Module Initial Data
export const INITIAL_POS_CATEGORIES: POSCategory[] = [
  {
    id: 'pos-cat-1',
    companyId: 'c-acme',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    color: '#3B82F6',
    icon: '📱',
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-cat-2',
    companyId: 'c-acme',
    name: 'Clothing',
    description: 'Apparel and fashion items',
    color: '#10B981',
    icon: '👕',
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-cat-3',
    companyId: 'c-acme',
    name: 'Food & Beverages',
    description: 'Consumable items',
    color: '#F59E0B',
    icon: '🍔',
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-cat-4',
    companyId: 'c-acme',
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    color: '#8B5CF6',
    icon: '🏠',
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z'
  }
];

export const INITIAL_POS_PRODUCTS: POSProduct[] = [
  {
    id: 'pos-prod-1',
    companyId: 'c-acme',
    sku: 'ELEC-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    barcode: '1234567890123',
    unitPrice: 79.99,
    costPrice: 45.00,
    taxRate: 8.25,
    discountPrice: 69.99,
    discountStartDate: '2026-07-01T00:00:00Z',
    discountEndDate: '2026-07-31T23:59:59Z',
    image: '🎧',
    isActive: true,
    stockLevel: 150,
    reorderLevel: 20,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-prod-2',
    companyId: 'c-acme',
    sku: 'ELEC-002',
    name: 'USB-C Charging Cable',
    description: 'Fast charging USB-C cable, 6ft',
    category: 'Electronics',
    barcode: '1234567890124',
    unitPrice: 14.99,
    costPrice: 5.00,
    taxRate: 8.25,
    image: '🔌',
    isActive: true,
    stockLevel: 300,
    reorderLevel: 50,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-prod-3',
    companyId: 'c-acme',
    sku: 'CLOTH-001',
    name: 'Premium Cotton T-Shirt',
    description: '100% organic cotton t-shirt, various colors',
    category: 'Clothing',
    barcode: '1234567890125',
    unitPrice: 24.99,
    costPrice: 12.00,
    taxRate: 8.25,
    image: '👕',
    isActive: true,
    stockLevel: 200,
    reorderLevel: 30,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-prod-4',
    companyId: 'c-acme',
    sku: 'FOOD-001',
    name: 'Organic Energy Bar',
    description: 'Healthy energy bar, pack of 6',
    category: 'Food & Beverages',
    barcode: '1234567890126',
    unitPrice: 8.99,
    costPrice: 3.50,
    taxRate: 4.00,
    image: '🍫',
    isActive: true,
    stockLevel: 500,
    reorderLevel: 100,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-prod-5',
    companyId: 'c-acme',
    sku: 'HOME-001',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB port',
    category: 'Home & Garden',
    barcode: '1234567890127',
    unitPrice: 34.99,
    costPrice: 18.00,
    taxRate: 8.25,
    image: '💡',
    isActive: true,
    stockLevel: 80,
    reorderLevel: 15,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  }
];

export const INITIAL_POS_TERMINALS: POSTerminal[] = [
  {
    id: 'pos-term-1',
    companyId: 'c-acme',
    name: 'Main Store Terminal 1',
    location: 'Front Counter',
    branchId: 'b-acme-hq',
    isActive: true,
    lastSync: '2026-07-10T12:00:00Z',
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-term-2',
    companyId: 'c-acme',
    name: 'Main Store Terminal 2',
    location: 'Back Counter',
    branchId: 'b-acme-hq',
    isActive: true,
    lastSync: '2026-07-10T12:00:00Z',
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-term-3',
    companyId: 'c-acme',
    name: 'Chicago Terminal 1',
    location: 'Front Desk',
    branchId: 'b-acme-chicago',
    isActive: true,
    lastSync: '2026-07-10T12:00:00Z',
    createdAt: '2026-07-01T00:00:00Z'
  }
];

export const INITIAL_POS_CUSTOMERS: POSCustomer[] = [
  {
    id: 'pos-cust-1',
    companyId: 'c-acme',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    dateOfBirth: '1985-05-15',
    address: '123 Main St, New York, NY',
    loyaltyPoints: 1250,
    tier: 'Gold',
    totalPurchases: 45,
    totalSpent: 2450.00,
    storeCredit: 50.00,
    notes: 'VIP customer, prefers electronic products',
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z'
  },
  {
    id: 'pos-cust-2',
    companyId: 'c-acme',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.j@email.com',
    phone: '+1-555-0102',
    loyaltyPoints: 850,
    tier: 'Silver',
    totalPurchases: 28,
    totalSpent: 1420.00,
    storeCredit: 0.00,
    isActive: true,
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z'
  },
  {
    id: 'pos-cust-3',
    companyId: 'c-acme',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@email.com',
    phone: '+1-555-0103',
    loyaltyPoints: 350,
    tier: 'Bronze',
    totalPurchases: 12,
    totalSpent: 520.00,
    storeCredit: 25.00,
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z'
  }
];

export const INITIAL_POS_SHIFTS: POSShift[] = [
  {
    id: 'pos-shift-1',
    companyId: 'c-acme',
    terminalId: 'pos-term-1',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    startTime: '2026-07-10T08:00:00Z',
    endTime: '2026-07-10T16:00:00Z',
    openingBalance: 200.00,
    closingBalance: 1250.00,
    cashSales: 450.00,
    cardSales: 800.00,
    digitalWalletSales: 200.00,
    storeCreditSales: 50.00,
    totalSales: 1500.00,
    refunds: 25.00,
    status: 'Closed',
    notes: 'Normal shift, no issues',
    createdAt: '2026-07-10T08:00:00Z'
  },
  {
    id: 'pos-shift-2',
    companyId: 'c-acme',
    terminalId: 'pos-term-2',
    employeeId: 'emp-2',
    employeeName: 'Elena Rostova',
    startTime: '2026-07-10T09:00:00Z',
    openingBalance: 150.00,
    cashSales: 320.00,
    cardSales: 540.00,
    digitalWalletSales: 120.00,
    storeCreditSales: 30.00,
    totalSales: 1010.00,
    refunds: 0.00,
    status: 'Open',
    createdAt: '2026-07-10T09:00:00Z'
  }
];

export const INITIAL_POS_SALES: POSSale[] = [
  {
    id: 'pos-sale-1',
    companyId: 'c-acme',
    terminalId: 'pos-term-1',
    shiftId: 'pos-shift-1',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    customerId: 'pos-cust-1',
    customerName: 'John Smith',
    saleNumber: 'SALE-2026-07010-001',
    date: '2026-07-10T10:30:00Z',
    subtotal: 94.98,
    tax: 7.84,
    discount: 10.00,
    total: 92.82,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Completed',
    items: [
      {
        id: 'item-1',
        productId: 'pos-prod-1',
        productName: 'Wireless Bluetooth Headphones',
        sku: 'ELEC-001',
        quantity: 1,
        unitPrice: 79.99,
        discount: 10.00,
        tax: 5.83,
        total: 75.82
      },
      {
        id: 'item-2',
        productId: 'pos-prod-2',
        productName: 'USB-C Charging Cable',
        sku: 'ELEC-002',
        quantity: 1,
        unitPrice: 14.99,
        discount: 0.00,
        tax: 1.24,
        total: 16.23
      }
    ],
    payments: [
      {
        id: 'pay-1',
        method: 'Card',
        amount: 92.82,
        reference: 'TXN123456789',
        cardType: 'Visa'
      }
    ],
    createdAt: '2026-07-10T10:30:00Z',
    updatedAt: '2026-07-10T10:30:00Z'
  },
  {
    id: 'pos-sale-2',
    companyId: 'c-acme',
    terminalId: 'pos-term-1',
    shiftId: 'pos-shift-1',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    saleNumber: 'SALE-2026-07010-002',
    date: '2026-07-10T14:15:00Z',
    subtotal: 8.99,
    tax: 0.36,
    discount: 0.00,
    total: 9.35,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Completed',
    items: [
      {
        id: 'item-3',
        productId: 'pos-prod-4',
        productName: 'Organic Energy Bar',
        sku: 'FOOD-001',
        quantity: 1,
        unitPrice: 8.99,
        discount: 0.00,
        tax: 0.36,
        total: 9.35
      }
    ],
    payments: [
      {
        id: 'pay-2',
        method: 'Cash',
        amount: 9.35
      }
    ],
    createdAt: '2026-07-10T14:15:00Z',
    updatedAt: '2026-07-10T14:15:00Z'
  }
];

export const INITIAL_POS_DISCOUNTS: POSDiscount[] = [
  {
    id: 'pos-disc-1',
    companyId: 'c-acme',
    name: 'Summer Sale - 10% Off Electronics',
    type: 'Percentage',
    value: 10,
    applicableCategories: ['Electronics'],
    minPurchaseAmount: 50.00,
    maxDiscountAmount: 25.00,
    startDate: '2026-07-01T00:00:00Z',
    endDate: '2026-07-31T23:59:59Z',
    isActive: true,
    usageCount: 45,
    maxUsage: 1000,
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-disc-2',
    companyId: 'c-acme',
    name: 'Loyalty Customer - $5 Off',
    type: 'Fixed Amount',
    value: 5,
    minPurchaseAmount: 25.00,
    startDate: '2026-07-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    usageCount: 128,
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'pos-disc-3',
    companyId: 'c-acme',
    name: 'Buy One Get One Free - Energy Bars',
    type: 'BOGO',
    value: 100,
    applicableProducts: ['pos-prod-4'],
    startDate: '2026-07-01T00:00:00Z',
    endDate: '2026-07-15T23:59:59Z',
    isActive: true,
    usageCount: 22,
    maxUsage: 500,
    createdAt: '2026-07-01T00:00:00Z'
  }
];

export const INITIAL_POS_RETURNS: POSReturn[] = [
  {
    id: 'pos-ret-1',
    companyId: 'c-acme',
    terminalId: 'pos-term-1',
    employeeId: 'emp-1',
    employeeName: 'Alex Mercer',
    customerId: 'pos-cust-1',
    customerName: 'John Smith',
    originalSaleId: 'pos-sale-1',
    originalSaleNumber: 'SALE-2026-07010-001',
    returnNumber: 'RET-2026-07010-001',
    date: '2026-07-10T16:30:00Z',
    items: [
      {
        id: 'ret-item-1',
        productId: 'pos-prod-2',
        productName: 'USB-C Charging Cable',
        sku: 'ELEC-002',
        quantity: 1,
        unitPrice: 14.99,
        tax: 1.24,
        total: 16.23,
        reason: 'Wrong item purchased',
        condition: 'Good'
      }
    ],
    subtotal: 14.99,
    tax: 1.24,
    total: 16.23,
    refundMethod: 'Card',
    refundStatus: 'Processed',
    reason: 'Customer wrong item',
    notes: 'Customer returned unused item in original packaging',
    createdAt: '2026-07-10T16:30:00Z',
    processedAt: '2026-07-10T16:35:00Z'
  }
];

export const INITIAL_POS_DAILY_REPORTS: POSDailyReport[] = [
  {
    id: 'pos-report-1',
    companyId: 'c-acme',
    branchId: 'b-acme-hq',
    terminalId: 'pos-term-1',
    date: '2026-07-10',
    totalSales: 2510.00,
    totalTransactions: 35,
    averageTransactionValue: 71.71,
    cashSales: 850.00,
    cardSales: 1200.00,
    digitalWalletSales: 350.00,
    storeCreditSales: 110.00,
    refunds: 16.23,
    discounts: 125.00,
    taxCollected: 185.58,
    topSellingProducts: [
      {
        productId: 'pos-prod-1',
        productName: 'Wireless Bluetooth Headphones',
        quantity: 12,
        revenue: 950.00
      },
      {
        productId: 'pos-prod-4',
        productName: 'Organic Energy Bar',
        quantity: 18,
        revenue: 162.00
      }
    ],
    paymentMethods: [
      {
        method: 'Cash',
        amount: 850.00,
        percentage: 33.9
      },
      {
        method: 'Card',
        amount: 1200.00,
        percentage: 47.8
      },
      {
        method: 'Digital Wallet',
        amount: 350.00,
        percentage: 13.9
      },
      {
        method: 'Store Credit',
        amount: 110.00,
        percentage: 4.4
      }
    ],
    hourlySales: [
      { hour: 8, sales: 120.00, transactions: 2 },
      { hour: 9, sales: 340.00, transactions: 5 },
      { hour: 10, sales: 520.00, transactions: 8 },
      { hour: 11, sales: 480.00, transactions: 7 },
      { hour: 12, sales: 390.00, transactions: 6 },
      { hour: 13, sales: 420.00, transactions: 5 },
      { hour: 14, sales: 240.00, transactions: 2 }
    ],
    createdAt: '2026-07-10T23:59:59Z'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// CORE LEDGER - Journal Entries, Expenses, Fiscal Periods, Opening Balances
// ═══════════════════════════════════════════════════════════════════════════

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-001',
    date: '2026-07-01',
    description: 'Monthly rent payment for New York HQ',
    reference: 'RENT-JUL-2026',
    lines: [
      { id: 'jl-1', accountId: 'gl-5030', accountCode: '5030', accountName: 'SaaS Software & IT Expenses', debit: 8000, credit: 0, description: 'Office rent expense' },
      { id: 'jl-2', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: 8000, description: 'Cash payment for rent' }
    ],
    totalDebit: 8000,
    totalCredit: 8000,
    status: 'Approved',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    approvedBy: 'u-acme-admin',
    approvedByName: 'Alex Mercer',
    postedAt: '2026-07-01T10:00:00Z',
    createdAt: '2026-07-01T09:30:00Z'
  },
  {
    id: 'je-2',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-002',
    date: '2026-07-03',
    description: 'Client payment received from Pied Piper Corp',
    reference: 'PPT-INV-0421',
    lines: [
      { id: 'jl-3', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 43200, credit: 0, description: 'Cash received' },
      { id: 'jl-4', accountId: 'gl-1200', accountCode: '1200', accountName: 'Accounts Receivable', debit: 0, credit: 43200, description: 'Invoice INV-2026-0421 settled' }
    ],
    totalDebit: 43200,
    totalCredit: 43200,
    status: 'Approved',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    approvedBy: 'u-acme-admin',
    approvedByName: 'Alex Mercer',
    postedAt: '2026-07-03T14:00:00Z',
    createdAt: '2026-07-03T13:45:00Z'
  },
  {
    id: 'je-3',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-003',
    date: '2026-07-05',
    description: 'Software subscription renewal - annual license',
    reference: 'SW-SUB-2026',
    lines: [
      { id: 'jl-5', accountId: 'gl-5030', accountCode: '5030', accountName: 'SaaS Software & IT Expenses', debit: 1200, credit: 0, description: 'Annual software subscription' },
      { id: 'jl-6', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: 1200, description: 'Payment via bank transfer' }
    ],
    totalDebit: 1200,
    totalCredit: 1200,
    status: 'Approved',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    approvedBy: 'u-acme-admin',
    approvedByName: 'Alex Mercer',
    postedAt: '2026-07-05T11:00:00Z',
    createdAt: '2026-07-05T10:30:00Z'
  },
  {
    id: 'je-4',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-004',
    date: '2026-07-08',
    description: 'Payroll processing for June 2026',
    reference: 'PAY-JUN-2026',
    lines: [
      { id: 'jl-7', accountId: 'gl-5020', accountCode: '5020', accountName: 'Employee Payroll Expense', debit: 45800, credit: 0, description: 'Total payroll for June' },
      { id: 'jl-8', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: 45800, description: 'Payroll disbursal' }
    ],
    totalDebit: 45800,
    totalCredit: 45800,
    status: 'Approved',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    approvedBy: 'u-acme-admin',
    approvedByName: 'Alex Mercer',
    postedAt: '2026-07-08T09:00:00Z',
    createdAt: '2026-07-08T08:30:00Z'
  },
  {
    id: 'je-5',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-005',
    date: '2026-07-10',
    description: 'Inventory purchase - CNC brass fittings restock',
    reference: 'PO-2026-0089',
    lines: [
      { id: 'jl-9', accountId: 'gl-1400', accountCode: '1400', accountName: 'Finished Goods Inventory', debit: 15000, credit: 0, description: '5000 units @ $3.00' },
      { id: 'jl-10', accountId: 'gl-2010', accountCode: '2010', accountName: 'Accounts Payable', debit: 0, credit: 15000, description: 'Due to Midwest Metal Supply' }
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    status: 'Approved',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    approvedBy: 'u-acme-admin',
    approvedByName: 'Alex Mercer',
    postedAt: '2026-07-10T16:00:00Z',
    createdAt: '2026-07-10T15:30:00Z'
  },
  {
    id: 'je-6',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-006',
    date: '2026-07-12',
    description: 'Utility bills payment for June',
    reference: 'UTIL-JUN-2026',
    lines: [
      { id: 'jl-11', accountId: 'gl-5010', accountCode: '5010', accountName: 'Cost of Goods Sold', debit: 2800, credit: 0, description: 'Electricity and water' },
      { id: 'jl-12', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: 2800, description: 'Utility payment' }
    ],
    totalDebit: 2800,
    totalCredit: 2800,
    status: 'Posted',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    createdAt: '2026-07-12T14:00:00Z'
  },
  {
    id: 'je-7',
    companyId: 'c-acme',
    entryNumber: 'JE-2026-007',
    date: '2026-07-13',
    description: 'Marketing campaign - Q3 digital ads',
    reference: 'MKT-Q3-2026',
    lines: [
      { id: 'jl-13', accountId: 'gl-5030', accountCode: '5030', accountName: 'SaaS Software & IT Expenses', debit: 8500, credit: 0, description: 'Google Ads & LinkedIn campaign' },
      { id: 'jl-14', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', debit: 0, credit: 8500, description: 'Marketing payment' }
    ],
    totalDebit: 8500,
    totalCredit: 8500,
    status: 'Draft',
    createdBy: 'u-acme-finance',
    createdByName: 'David Vance',
    createdAt: '2026-07-13T11:00:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    companyId: 'c-acme',
    description: 'Monthly office rent - July 2026',
    category: 'Rent & Utilities',
    department: 'Operations',
    amount: 8000,
    date: '2026-07-01',
    status: 'Approved',
    glAccountId: 'gl-5030',
    journalEntryId: 'je-1',
    createdBy: 'u-acme-finance',
    createdAt: '2026-07-01T09:30:00Z'
  },
  {
    id: 'exp-2',
    companyId: 'c-acme',
    description: 'Software subscription renewal',
    category: 'Software & IT',
    department: 'IT',
    amount: 1200,
    date: '2026-07-05',
    status: 'Approved',
    glAccountId: 'gl-5030',
    journalEntryId: 'je-3',
    createdBy: 'u-acme-finance',
    createdAt: '2026-07-05T10:30:00Z'
  },
  {
    id: 'exp-3',
    companyId: 'c-acme',
    description: 'Employee payroll - June 2026',
    category: 'Payroll',
    department: 'HR',
    amount: 45800,
    date: '2026-07-08',
    status: 'Approved',
    glAccountId: 'gl-5020',
    journalEntryId: 'je-4',
    createdBy: 'u-acme-finance',
    createdAt: '2026-07-08T08:30:00Z'
  },
  {
    id: 'exp-4',
    companyId: 'c-acme',
    description: 'Utility bills - June 2026',
    category: 'Utilities',
    department: 'Operations',
    amount: 2800,
    date: '2026-07-12',
    status: 'Approved',
    glAccountId: 'gl-5010',
    journalEntryId: 'je-6',
    createdBy: 'u-acme-finance',
    createdAt: '2026-07-12T14:00:00Z'
  },
  {
    id: 'exp-5',
    companyId: 'c-acme',
    description: 'Q3 digital marketing campaign',
    category: 'Marketing',
    department: 'Sales',
    amount: 8500,
    date: '2026-07-13',
    status: 'Pending',
    glAccountId: 'gl-5030',
    createdBy: 'u-acme-finance',
    createdAt: '2026-07-13T11:00:00Z'
  }
];

export const INITIAL_FISCAL_PERIODS: FiscalPeriod[] = [
  {
    id: 'fp-1',
    companyId: 'c-acme',
    name: 'FY 2026 - Q1',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'Closed',
    closedBy: 'u-acme-finance',
    closedAt: '2026-04-05T10:00:00Z'
  },
  {
    id: 'fp-2',
    companyId: 'c-acme',
    name: 'FY 2026 - Q2',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'Closed',
    closedBy: 'u-acme-finance',
    closedAt: '2026-07-05T10:00:00Z'
  },
  {
    id: 'fp-3',
    companyId: 'c-acme',
    name: 'FY 2026 - Q3',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Open'
  },
  {
    id: 'fp-4',
    companyId: 'c-acme',
    name: 'FY 2026 - Q4',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    status: 'Open'
  }
];

export const INITIAL_OPENING_BALANCES: OpeningBalance[] = [
  { id: 'ob-1', companyId: 'c-acme', accountId: 'gl-1010', accountCode: '1010', accountName: 'Operating Cash Account', periodId: 'fp-3', debit: 450200, credit: 0, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-2', companyId: 'c-acme', accountId: 'gl-1200', accountCode: '1200', accountName: 'Accounts Receivable', periodId: 'fp-3', debit: 125000, credit: 0, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-3', companyId: 'c-acme', accountId: 'gl-1400', accountCode: '1400', accountName: 'Finished Goods Inventory', periodId: 'fp-3', debit: 350000, credit: 0, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-4', companyId: 'c-acme', accountId: 'gl-2010', accountCode: '2010', accountName: 'Accounts Payable', periodId: 'fp-3', debit: 0, credit: 48000, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-5', companyId: 'c-acme', accountId: 'gl-3010', accountCode: '3010', accountName: 'Retained Earnings', periodId: 'fp-3', debit: 0, credit: 500000, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-6', companyId: 'c-acme', accountId: 'gl-4010', accountCode: '4010', accountName: 'Manufacturing Revenue', periodId: 'fp-3', debit: 0, credit: 420000, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-7', companyId: 'c-acme', accountId: 'gl-5010', accountCode: '5010', accountName: 'Cost of Goods Sold', periodId: 'fp-3', debit: 180000, credit: 0, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-8', companyId: 'c-acme', accountId: 'gl-5020', accountCode: '5020', accountName: 'Employee Payroll Expense', periodId: 'fp-3', debit: 45800, credit: 0, createdAt: '2026-07-01T00:00:00Z' },
  { id: 'ob-9', companyId: 'c-acme', accountId: 'gl-5030', accountCode: '5030', accountName: 'SaaS Software & IT Expenses', periodId: 'fp-3', debit: 12000, credit: 0, createdAt: '2026-07-01T00:00:00Z' }
];

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2 SEED DATA
// ═══════════════════════════════════════════════════════════════════════════

export const INITIAL_BILLS: Bill[] = [
  { id: 'bill-1', companyId: 'c-acme', vendorName: 'Industrial Tooling Co.', vendorId: 'v-1', billNumber: 'BILL-1001', invoiceDate: '2026-06-15', dueDate: '2026-07-15', description: 'CNC Drill Bits x50', subtotal: 4200, tax: 336, total: 4536, amountPaid: 0, status: 'Pending', createdBy: 'u-acme-finance', createdByName: 'David Vance', createdAt: '2026-06-15T10:00:00Z' },
  { id: 'bill-2', companyId: 'c-acme', vendorName: 'Apex Chemical Lab', vendorId: 'v-2', billNumber: 'BILL-1002', invoiceDate: '2026-06-20', dueDate: '2026-07-20', description: 'Synthetic Lubricant 200L', subtotal: 7600, tax: 608, total: 8208, amountPaid: 0, status: 'Approved', createdBy: 'u-acme-finance', createdByName: 'David Vance', createdAt: '2026-06-20T11:00:00Z' },
  { id: 'bill-3', companyId: 'c-acme', vendorName: 'PowerGrid Utilities', vendorId: 'v-3', billNumber: 'BILL-1003', invoiceDate: '2026-07-01', dueDate: '2026-07-31', description: 'Factory Electricity - July', subtotal: 12500, tax: 1000, total: 13500, amountPaid: 5000, status: 'Partially Paid', createdBy: 'u-acme-finance', createdByName: 'David Vance', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'bill-4', companyId: 'c-acme', vendorName: 'CloudHost Pro', vendorId: 'v-4', billNumber: 'BILL-1004', invoiceDate: '2026-07-01', dueDate: '2026-07-15', description: 'ERP Infrastructure - Monthly', subtotal: 2800, tax: 224, total: 3024, amountPaid: 3024, status: 'Paid', createdBy: 'u-acme-finance', createdByName: 'David Vance', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'bill-5', companyId: 'c-acme', vendorName: 'Safety First Supply', vendorId: 'v-5', billNumber: 'BILL-1005', invoiceDate: '2026-07-05', dueDate: '2026-08-04', description: 'PPE kits - Q3 restock', subtotal: 5600, tax: 448, total: 6048, amountPaid: 0, status: 'Pending', createdBy: 'u-acme-finance', createdByName: 'David Vance', createdAt: '2026-07-05T14:00:00Z' },
];

export const INITIAL_BILL_PAYMENTS: BillPayment[] = [
  { id: 'bp-1', companyId: 'c-acme', billId: 'bill-3', amount: 5000, paymentDate: '2026-07-10', paymentMethod: 'Bank Transfer', reference: 'TXN-881200', bankAccountId: 'ba-1', createdBy: 'u-acme-finance', createdAt: '2026-07-10T10:00:00Z' },
  { id: 'bp-2', companyId: 'c-acme', billId: 'bill-4', amount: 3024, paymentDate: '2026-07-05', paymentMethod: 'Bank Transfer', reference: 'TXN-881201', bankAccountId: 'ba-1', createdBy: 'u-acme-finance', createdAt: '2026-07-05T09:00:00Z' },
];

export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [
  { id: 'cp-1', companyId: 'c-acme', invoiceId: 'inv-1', customerName: 'Apex Manufacturing', amount: 23000, paymentDate: '2026-07-02', paymentMethod: 'Bank Transfer', reference: 'CUST-TXN-5001', bankAccountId: 'ba-1', createdBy: 'u-acme-finance', createdAt: '2026-07-02T11:00:00Z' },
  { id: 'cp-2', companyId: 'c-acme', invoiceId: 'inv-3', customerName: 'GlobalTech Industries', amount: 12000, paymentDate: '2026-07-08', paymentMethod: 'Check', reference: 'CHK-4401', bankAccountId: 'ba-1', createdBy: 'u-acme-finance', createdAt: '2026-07-08T14:00:00Z' },
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'ba-1', companyId: 'c-acme', name: 'Operating Account', bankName: 'Chase Business', accountNumber: '****4521', accountType: 'Checking', glAccountId: 'gl-1010', balance: 450200, isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'ba-2', companyId: 'c-acme', name: 'Savings Reserve', bankName: 'Chase Business', accountNumber: '****7832', accountType: 'Savings', glAccountId: 'gl-1020', balance: 125000, isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'ba-3', companyId: 'c-acme', name: 'Corporate Card', bankName: 'Amex Business', accountNumber: '****9100', accountType: 'Credit Card', glAccountId: 'gl-2020', balance: -8450, isActive: true, createdAt: '2025-06-01T08:00:00Z' },
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  { id: 'btx-1', companyId: 'c-acme', bankAccountId: 'ba-1', date: '2026-07-02', description: 'Customer Payment - Apex Mfg', type: 'Credit', amount: 23000, reconciled: true, reconciledDate: '2026-07-05', reference: 'CUST-TXN-5001', createdAt: '2026-07-02T11:00:00Z' },
  { id: 'btx-2', companyId: 'c-acme', bankAccountId: 'ba-1', date: '2026-07-05', description: 'Payment to CloudHost Pro', type: 'Debit', amount: 3024, reconciled: true, reconciledDate: '2026-07-05', reference: 'TXN-881201', createdAt: '2026-07-05T09:00:00Z' },
  { id: 'btx-3', companyId: 'c-acme', bankAccountId: 'ba-1', date: '2026-07-08', description: 'Customer Payment - GlobalTech', type: 'Credit', amount: 12000, reconciled: false, reference: 'CHK-4401', createdAt: '2026-07-08T14:00:00Z' },
  { id: 'btx-4', companyId: 'c-acme', bankAccountId: 'ba-1', date: '2026-07-10', description: 'Payment to PowerGrid Utilities', type: 'Debit', amount: 5000, reconciled: false, reference: 'TXN-881200', createdAt: '2026-07-10T10:00:00Z' },
  { id: 'btx-5', companyId: 'c-acme', bankAccountId: 'ba-1', date: '2026-07-12', description: 'Wire Transfer - Acme Subsidiary', type: 'Credit', amount: 35000, reconciled: false, reference: 'WIRE-9901', createdAt: '2026-07-12T09:00:00Z' },
];

export const INITIAL_BANK_RECONCILIATIONS: BankReconciliation[] = [
  { id: 'br-1', companyId: 'c-acme', bankAccountId: 'ba-1', periodStartDate: '2026-07-01', periodEndDate: '2026-07-05', statementBalance: 469176, bookBalance: 469176, reconciledDifference: 0, status: 'Completed', reconciledTransactionIds: ['btx-1', 'btx-2'], completedBy: 'u-acme-finance', completedByName: 'David Vance', completedAt: '2026-07-06T10:00:00Z', createdAt: '2026-07-06T09:00:00Z' },
];

export const INITIAL_FIXED_ASSETS: FixedAsset[] = [
  { id: 'fa-1', companyId: 'c-acme', assetCode: 'FA-001', name: 'CNC Milling Machine', description: '5-axis CNC milling center', category: 'Machinery', purchaseDate: '2024-03-15', purchasePrice: 185000, salvageValue: 15000, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 28000, currentBookValue: 157000, location: 'Factory Floor A', status: 'Active', createdAt: '2024-03-15T08:00:00Z' },
  { id: 'fa-2', companyId: 'c-acme', assetCode: 'FA-002', name: 'Warehouse Forklift', description: 'Toyota 8FGU25 forklift', category: 'Vehicles', purchaseDate: '2025-01-20', purchasePrice: 32000, salvageValue: 4000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 3714, currentBookValue: 28286, location: 'Warehouse B', status: 'Active', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'fa-3', companyId: 'c-acme', assetCode: 'FA-003', name: 'Office Server Rack', description: 'Dell PowerEdge R750 cluster', category: 'IT Equipment', purchaseDate: '2025-06-10', purchasePrice: 28000, salvageValue: 2000, usefulLifeYears: 5, depreciationMethod: 'Declining Balance', accumulatedDepreciation: 8400, currentBookValue: 19600, location: 'Server Room - HQ', status: 'Active', createdAt: '2025-06-10T08:00:00Z' },
  { id: 'fa-4', companyId: 'c-acme', assetCode: 'FA-004', name: 'Delivery Truck', description: 'Ford F-650 box truck', category: 'Vehicles', purchaseDate: '2023-09-01', purchasePrice: 55000, salvageValue: 8000, usefulLifeYears: 8, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 21938, currentBookValue: 33062, location: 'Loading Dock', status: 'Active', createdAt: '2023-09-01T08:00:00Z' },
  { id: 'fa-5', companyId: 'c-acme', assetCode: 'FA-005', name: 'Old Press Machine', description: 'Hydraulic stamping press', category: 'Machinery', purchaseDate: '2018-04-10', purchasePrice: 72000, salvageValue: 5000, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 67000, currentBookValue: 5000, location: 'Factory Floor B', status: 'Fully Depreciated', createdAt: '2018-04-10T08:00:00Z' },
];

export const INITIAL_DEPRECIATION_ENTRIES: DepreciationEntry[] = [
  { id: 'de-1', companyId: 'c-acme', assetId: 'fa-1', assetCode: 'FA-001', assetName: 'CNC Milling Machine', period: 'July 2026', depreciationAmount: 1417, accumulatedDepreciation: 29417, bookValue: 155583, status: 'Draft', createdAt: '2026-07-31T08:00:00Z' },
  { id: 'de-2', companyId: 'c-acme', assetId: 'fa-2', assetCode: 'FA-002', assetName: 'Warehouse Forklift', period: 'July 2026', depreciationAmount: 333, accumulatedDepreciation: 4047, bookValue: 27953, status: 'Draft', createdAt: '2026-07-31T08:00:00Z' },
  { id: 'de-3', companyId: 'c-acme', assetId: 'fa-3', assetCode: 'FA-003', assetName: 'Office Server Rack', period: 'July 2026', depreciationAmount: 420, accumulatedDepreciation: 8820, bookValue: 19180, status: 'Draft', createdAt: '2026-07-31T08:00:00Z' },
  { id: 'de-4', companyId: 'c-acme', assetId: 'fa-4', assetCode: 'FA-004', assetName: 'Delivery Truck', period: 'July 2026', depreciationAmount: 490, accumulatedDepreciation: 22428, bookValue: 32572, status: 'Draft', createdAt: '2026-07-31T08:00:00Z' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'bud-1', companyId: 'c-acme', name: 'FY2026 Manufacturing Revenue', fiscalYear: '2026', glAccountId: 'gl-4010', accountCode: '4010', accountName: 'Manufacturing Revenue', budgetAmount: 600000, actualAmount: 420000, variance: -180000, variancePercent: -30, period: 'Q3 2026', status: 'Active', items: [], createdBy: 'u-acme-finance', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'bud-2', companyId: 'c-acme', name: 'FY2026 COGS', fiscalYear: '2026', glAccountId: 'gl-5010', accountCode: '5010', accountName: 'Cost of Goods Sold', budgetAmount: 250000, actualAmount: 180000, variance: 70000, variancePercent: 28, period: 'Q3 2026', status: 'Active', items: [], createdBy: 'u-acme-finance', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'bud-3', companyId: 'c-acme', name: 'FY2026 Payroll', fiscalYear: '2026', glAccountId: 'gl-5020', accountCode: '5020', accountName: 'Employee Payroll Expense', budgetAmount: 200000, actualAmount: 135000, variance: 65000, variancePercent: 32.5, period: 'Q3 2026', status: 'Active', items: [], createdBy: 'u-acme-finance', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'bud-4', companyId: 'c-acme', name: 'FY2026 SaaS & IT', fiscalYear: '2026', glAccountId: 'gl-5030', accountCode: '5030', accountName: 'SaaS Software & IT Expenses', budgetAmount: 60000, actualAmount: 36000, variance: 24000, variancePercent: 40, period: 'Q3 2026', status: 'Active', items: [], createdBy: 'u-acme-finance', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'bud-5', companyId: 'c-acme', name: 'FY2026 Operating Expenses', fiscalYear: '2026', glAccountId: 'gl-5040', accountCode: '5040', accountName: 'Office Rent & Utilities', budgetAmount: 96000, actualAmount: 72000, variance: 24000, variancePercent: 25, period: 'Q3 2026', status: 'Active', items: [], createdBy: 'u-acme-finance', createdAt: '2026-01-10T08:00:00Z' },
];

export const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: 'cc-1', companyId: 'c-acme', code: 'CC-MFG', name: 'Manufacturing Operations', departmentId: 'd-1', departmentName: 'Operations', managerName: 'Alex Mercer', budget: 300000, actualSpend: 215000, status: 'Active', createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cc-2', companyId: 'c-acme', code: 'CC-SALES', name: 'Sales & Distribution', departmentId: 'd-3', departmentName: 'Sales', managerName: 'Samantha Brady', budget: 120000, actualSpend: 88000, status: 'Active', createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cc-3', companyId: 'c-acme', code: 'CC-HR', name: 'Human Resources', departmentId: 'd-2', departmentName: 'Human Resources', managerName: 'Elena Rostova', budget: 80000, actualSpend: 55000, status: 'Active', createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cc-4', companyId: 'c-acme', code: 'CC-FIN', name: 'Finance & Accounting', departmentId: 'd-4', departmentName: 'Finance', managerName: 'David Vance', budget: 65000, actualSpend: 42000, status: 'Active', createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cc-5', companyId: 'c-acme', code: 'CC-IT', name: 'IT & Infrastructure', departmentId: 'd-5', departmentName: 'IT', managerName: 'Raj Patel', budget: 95000, actualSpend: 71000, status: 'Active', createdAt: '2025-01-15T08:00:00Z' },
];

export const INITIAL_CURRENCY_RATES: CurrencyRate[] = [
  { id: 'cr-1', companyId: 'c-acme', baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.92, effectiveDate: '2026-07-14', source: 'ECB', createdAt: '2026-07-14T08:00:00Z' },
  { id: 'cr-2', companyId: 'c-acme', baseCurrency: 'USD', targetCurrency: 'GBP', rate: 0.79, effectiveDate: '2026-07-14', source: 'ECB', createdAt: '2026-07-14T08:00:00Z' },
  { id: 'cr-3', companyId: 'c-acme', baseCurrency: 'USD', targetCurrency: 'JPY', rate: 149.5, effectiveDate: '2026-07-14', source: 'ECB', createdAt: '2026-07-14T08:00:00Z' },
  { id: 'cr-4', companyId: 'c-acme', baseCurrency: 'USD', targetCurrency: 'CAD', rate: 1.36, effectiveDate: '2026-07-14', source: 'ECB', createdAt: '2026-07-14T08:00:00Z' },
  { id: 'cr-5', companyId: 'c-acme', baseCurrency: 'USD', targetCurrency: 'AUD', rate: 1.51, effectiveDate: '2026-07-14', source: 'ECB', createdAt: '2026-07-14T08:00:00Z' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3 SEED DATA
// ═══════════════════════════════════════════════════════════════════════════

export const INITIAL_TAX_CODES: TaxCode[] = [
  { id: 'tc-1', companyId: 'c-acme', code: 'VAT-STD', name: 'Standard VAT', rate: 20, type: 'VAT', glAccountId: 'gl-2030', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'tc-2', companyId: 'c-acme', code: 'VAT-RED', name: 'Reduced VAT', rate: 5, type: 'VAT', glAccountId: 'gl-2030', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'tc-3', companyId: 'c-acme', code: 'VAT-EXM', name: 'Zero Rated / Exempt', rate: 0, type: 'Exempt', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'tc-4', companyId: 'c-acme', code: 'WHT-10', name: 'Withholding Tax 10%', rate: 10, type: 'WHT', glAccountId: 'gl-2040', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'tc-5', companyId: 'c-acme', code: 'GST-5', name: 'GST 5%', rate: 5, type: 'GST', glAccountId: 'gl-2050', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
];

export const INITIAL_TAX_RETURNS: TaxReturn[] = [
  { id: 'tr-1', companyId: 'c-acme', period: 'Q1 2026', taxCodeId: 'tc-1', taxCodeName: 'Standard VAT', taxableAmount: 420000, taxAmount: 84000, status: 'Paid', filedDate: '2026-04-15', dueDate: '2026-04-30', createdBy: 'u-acme-finance', createdAt: '2026-04-01T08:00:00Z' },
  { id: 'tr-2', companyId: 'c-acme', period: 'Q2 2026', taxCodeId: 'tc-1', taxCodeName: 'Standard VAT', taxableAmount: 480000, taxAmount: 96000, status: 'Paid', filedDate: '2026-07-10', dueDate: '2026-07-31', createdBy: 'u-acme-finance', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'tr-3', companyId: 'c-acme', period: 'Q3 2026', taxCodeId: 'tc-1', taxCodeName: 'Standard VAT', taxableAmount: 0, taxAmount: 0, status: 'Draft', dueDate: '2026-10-31', createdBy: 'u-acme-finance', createdAt: '2026-07-14T08:00:00Z' },
  { id: 'tr-4', companyId: 'c-acme', period: 'Q1 2026', taxCodeId: 'tc-4', taxCodeName: 'Withholding Tax 10%', taxableAmount: 85000, taxAmount: 8500, status: 'Paid', filedDate: '2026-04-20', dueDate: '2026-04-30', createdBy: 'u-acme-finance', createdAt: '2026-04-01T08:00:00Z' },
];

export const INITIAL_INTERCOMPANY_TXNS: IntercompanyTransaction[] = [
  { id: 'ic-1', companyId: 'c-acme', fromCompanyId: 'c-acme', fromCompanyName: 'Acme Global Manufacturing', toCompanyId: 'c-starlight', toCompanyName: 'Starlight Biotech Europe', type: 'Service Fee', amount: 25000, description: 'Q2 2026 Management Consulting Services', status: 'Approved', createdBy: 'u-acme-finance', createdAt: '2026-06-30T10:00:00Z' },
  { id: 'ic-2', companyId: 'c-acme', fromCompanyId: 'c-starlight', fromCompanyName: 'Starlight Biotech Europe', toCompanyId: 'c-acme', toCompanyName: 'Acme Global Manufacturing', type: 'Invoice', amount: 18500, description: 'Lab Equipment Maintenance - June 2026', status: 'Pending', createdBy: 'u-acme-finance', createdAt: '2026-07-05T14:00:00Z' },
  { id: 'ic-3', companyId: 'c-acme', fromCompanyId: 'c-acme', fromCompanyName: 'Acme Global Manufacturing', toCompanyId: 'c-zenretail', toCompanyName: 'ZenRetail Group', type: 'Loan', amount: 100000, description: 'Working capital loan - Q3 2026', status: 'Pending', createdBy: 'u-acme-finance', createdAt: '2026-07-12T09:00:00Z' },
];

export const INITIAL_CONSOLIDATION_RULES: ConsolidationRule[] = [
  { id: 'cr-1', companyId: 'c-acme', subsidiaryId: 'c-starlight', subsidiaryName: 'Starlight Biotech Europe', eliminationAccount: 'Intercompany Receivables', minorityInterestPct: 0, isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cr-2', companyId: 'c-acme', subsidiaryId: 'c-zenretail', subsidiaryName: 'ZenRetail Group', eliminationAccount: 'Intercompany Payables', minorityInterestPct: 15, isActive: true, createdAt: '2025-06-01T08:00:00Z' },
];

export const INITIAL_COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { id: 'cc-1', companyId: 'c-acme', category: 'SOX', title: 'Internal Controls Assessment', description: 'Annual SOX Section 404 internal controls testing and documentation', status: 'In Progress', dueDate: '2026-09-30', assignee: 'u-acme-finance', assigneeName: 'David Vance', lastChecked: '2026-07-01', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'cc-2', companyId: 'c-acme', category: 'Tax', title: 'Annual Tax Return Filing', description: 'Federal and state corporate income tax return preparation and filing', status: 'Open', dueDate: '2026-10-15', assignee: 'u-acme-finance', assigneeName: 'David Vance', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'cc-3', companyId: 'c-acme', category: 'Labor', title: 'OSHA Workplace Safety Audit', description: 'Annual workplace safety compliance review and OSHA report submission', status: 'Compliant', dueDate: '2026-06-30', assignee: 'u-acme-hr', assigneeName: 'Elena Rostova', lastChecked: '2026-06-15', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'cc-4', companyId: 'c-acme', category: 'Data Privacy', title: 'GDPR Data Processing Audit', description: 'Review of all personal data processing activities and DPA compliance', status: 'Open', dueDate: '2026-08-31', assignee: 'u-acme-admin', assigneeName: 'Alex Mercer', createdAt: '2026-03-01T08:00:00Z' },
  { id: 'cc-5', companyId: 'c-acme', category: 'Financial', title: 'External Audit Preparation', description: 'Prepare documentation package for external auditors - FY2026', status: 'Open', dueDate: '2027-02-28', assignee: 'u-acme-finance', assigneeName: 'David Vance', createdAt: '2026-07-01T08:00:00Z' },
];

export const INITIAL_AUDIT_SNAPSHOTS: AuditSnapshot[] = [
  { id: 'as-1', companyId: 'c-acme', entityType: 'GLAccount', entityId: 'gl-1010', entityName: 'Operating Cash Account', action: 'Update', before: { balance: 445000 }, after: { balance: 450200 }, userId: 'u-acme-finance', userName: 'David Vance', ipAddress: '192.168.1.105', timestamp: '2026-07-14T10:30:00Z' },
  { id: 'as-2', companyId: 'c-acme', entityType: 'JournalEntry', entityId: 'je-1', entityName: 'JE-0001 - Opening Balances', action: 'Post', before: { status: 'Draft' }, after: { status: 'Posted' }, userId: 'u-acme-finance', userName: 'David Vance', ipAddress: '192.168.1.105', timestamp: '2026-07-01T09:00:00Z' },
  { id: 'as-3', companyId: 'c-acme', entityType: 'Bill', entityId: 'bill-1', entityName: 'BILL-1001 - Industrial Tooling Co.', action: 'Create', before: null, after: { vendorName: 'Industrial Tooling Co.', total: 4536, status: 'Pending' }, userId: 'u-acme-finance', userName: 'David Vance', ipAddress: '192.168.1.105', timestamp: '2026-06-15T10:00:00Z' },
  { id: 'as-4', companyId: 'c-acme', entityType: 'Invoice', entityId: 'inv-1', entityName: 'INV-2026-001 - Apex Manufacturing', action: 'Update', before: { status: 'Sent' }, after: { status: 'Paid' }, userId: 'u-acme-finance', userName: 'David Vance', ipAddress: '192.168.1.105', timestamp: '2026-07-02T11:00:00Z' },
  { id: 'as-5', companyId: 'c-acme', entityType: 'Employee', entityId: 'emp-5', entityName: 'Michael Chang', action: 'Update', before: { status: 'Active' }, after: { status: 'Active', designation: 'Senior Warehouse Lead' }, userId: 'u-acme-hr', userName: 'Elena Rostova', ipAddress: '192.168.1.102', timestamp: '2026-07-10T14:00:00Z' },
  { id: 'as-6', companyId: 'c-acme', entityType: 'FixedAsset', entityId: 'fa-1', entityName: 'FA-001 - CNC Milling Machine', action: 'Update', before: { accumulatedDepreciation: 26583 }, after: { accumulatedDepreciation: 28000 }, userId: 'u-acme-finance', userName: 'David Vance', ipAddress: '192.168.1.105', timestamp: '2026-07-31T08:00:00Z' },
];

export const INITIAL_POLICY_DOCUMENTS: PolicyDocument[] = [
  { id: 'pd-1', companyId: 'c-acme', title: 'Employee Code of Conduct', category: 'HR', version: '3.2', content: 'Standards of professional behavior, anti-harassment policies, and workplace ethics.', acknowledgedBy: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'], totalEmployees: 5, dueDate: '2026-03-31', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'pd-2', companyId: 'c-acme', title: 'Information Security Policy', category: 'Security', version: '2.1', content: 'Data protection protocols, password policies, incident response procedures.', acknowledgedBy: ['emp-1', 'emp-2', 'emp-3'], totalEmployees: 5, dueDate: '2026-06-30', createdAt: '2026-02-01T08:00:00Z' },
  { id: 'pd-3', companyId: 'c-acme', title: 'Anti-Money Laundering (AML) Policy', category: 'Finance', version: '1.5', content: 'AML compliance procedures, customer due diligence, suspicious activity reporting.', acknowledgedBy: ['emp-1', 'emp-3'], totalEmployees: 5, dueDate: '2026-07-31', createdAt: '2026-04-01T08:00:00Z' },
];

export const INITIAL_FILING_DEADLINES: FilingDeadline[] = [
  { id: 'fd-1', companyId: 'c-acme', filingType: 'Corporate Income Tax', jurisdiction: 'Federal (IRS)', dueDate: '2026-10-15', status: 'Upcoming', assignee: 'u-acme-finance', assigneeName: 'David Vance', notes: 'Extension filed Form 7004', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'fd-2', companyId: 'c-acme', filingType: 'VAT Return', jurisdiction: 'State - New York', dueDate: '2026-07-31', status: 'Upcoming', assignee: 'u-acme-finance', assigneeName: 'David Vance', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'fd-3', companyId: 'c-acme', filingType: 'Payroll Tax (941)', jurisdiction: 'Federal (IRS)', dueDate: '2026-07-31', status: 'Upcoming', assignee: 'u-acme-hr', assigneeName: 'Elena Rostova', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'fd-4', companyId: 'c-acme', filingType: 'Annual Financial Statements', jurisdiction: 'SEC', dueDate: '2027-03-31', status: 'Upcoming', assignee: 'u-acme-finance', assigneeName: 'David Vance', createdAt: '2026-07-14T08:00:00Z' },
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1',
    companyId: 'c-acme',
    orderNumber: 'SO-2026-0001',
    customerName: 'Pied Piper Corp',
    customerId: 'lead-1',
    items: [
      { name: 'CNC Brass Fittings (12mm)', sku: 'SKU-CNC-BR-01', quantity: 200, unitPrice: 3.50, total: 700 },
      { name: 'Heavy Duty AC Servo Motor 200W', sku: 'SKU-SERVO-AC-200', quantity: 8, unitPrice: 180.00, total: 1440 },
    ],
    subtotal: 2140,
    tax: 171.20,
    discount: 0,
    total: 2311.20,
    status: 'Completed',
    priority: 'High',
    assignedTo: 'u-acme-sales',
    assignedToName: 'Samantha Brady',
    orderDate: '2026-06-15',
    expectedDelivery: '2026-07-15',
    notes: 'Priority client - expedite shipping',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'so-2',
    companyId: 'c-acme',
    orderNumber: 'SO-2026-0002',
    customerName: 'Hooli Tech',
    customerId: 'lead-3',
    items: [
      { name: 'Siemens S7 Industrial PLC Unit', sku: 'SKU-PLC-SI-S7', quantity: 5, unitPrice: 850.00, total: 4250 },
      { name: 'Heavy Duty AC Servo Motor 200W', sku: 'SKU-SERVO-AC-200', quantity: 12, unitPrice: 180.00, total: 2160 },
    ],
    subtotal: 6410,
    tax: 512.80,
    discount: 320.50,
    total: 6602.30,
    status: 'Processing',
    priority: 'Medium',
    assignedTo: 'u-acme-sales3',
    assignedToName: 'John Smith',
    orderDate: '2026-07-01',
    expectedDelivery: '2026-08-01',
    createdAt: '2026-07-01T09:30:00Z',
  },
  {
    id: 'so-3',
    companyId: 'c-acme',
    orderNumber: 'SO-2026-0003',
    customerName: 'Raviga Capital',
    customerId: 'lead-2',
    items: [
      { name: 'CNC Brass Fittings (12mm)', sku: 'SKU-CNC-BR-01', quantity: 500, unitPrice: 3.50, total: 1750 },
    ],
    subtotal: 1750,
    tax: 140.00,
    discount: 0,
    total: 1890.00,
    status: 'Pending',
    priority: 'Low',
    assignedTo: 'u-acme-sales2',
    assignedToName: 'Sarah Johnson',
    orderDate: '2026-07-10',
    expectedDelivery: '2026-08-10',
    createdAt: '2026-07-10T11:00:00Z',
  },
  {
    id: 'so-4',
    companyId: 'c-acme',
    orderNumber: 'SO-2026-0004',
    customerName: 'Pied Piper Corp',
    customerId: 'lead-1',
    items: [
      { name: 'Siemens S7 Industrial PLC Unit', sku: 'SKU-PLC-SI-S7', quantity: 2, unitPrice: 850.00, total: 1700 },
      { name: 'CNC Brass Fittings (12mm)', sku: 'SKU-CNC-BR-01', quantity: 100, unitPrice: 3.50, total: 350 },
    ],
    subtotal: 2050,
    tax: 164.00,
    discount: 100.00,
    total: 2114.00,
    status: 'Shipped',
    priority: 'High',
    assignedTo: 'u-acme-sales',
    assignedToName: 'Samantha Brady',
    orderDate: '2026-07-12',
    expectedDelivery: '2026-07-20',
    createdAt: '2026-07-12T14:00:00Z',
  },
];
