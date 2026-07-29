-- Approval Policies table
CREATE TABLE IF NOT EXISTS approval_policies (
  id text PRIMARY KEY,
  "companyId" text,
  module text,
  description text,
  "approverRoles" text[],
  enabled boolean DEFAULT true,
  "createdAt" text
);

-- Pending Approvals table (tracks each individual approval request)
CREATE TABLE IF NOT EXISTS pending_approvals (
  id text PRIMARY KEY,
  "companyId" text,
  module text,
  "recordId" text,
  "recordType" text,
  "requesterId" text,
  "requesterName" text,
  title text,
  description text,
  status text DEFAULT 'Pending',
  "assignedRoles" text[],
  "approvedBy" text,
  "approvedAt" text,
  "rejectionReason" text,
  "createdAt" text
);

-- Seed default approval policies for existing companies
DO $$
DECLARE
  comp RECORD;
BEGIN
  FOR comp IN SELECT id FROM companies LOOP

    INSERT INTO approval_policies (id, "companyId", module, description, "approverRoles", enabled, "createdAt")
    VALUES
    ('ap-' || comp.id || '-leave', comp.id, 'Leave Requests', 'Annual, sick, casual, and maternity leave applications', ARRAY['HR Department Head', 'HR Manager', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-payroll', comp.id, 'Payroll Processing', 'Monthly salary processing and payslip generation', ARRAY['HR Manager', 'Finance Department Head', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-expense', comp.id, 'Expense Claims', 'Employee reimbursements and cost reports', ARRAY['Finance Manager', 'Finance Department Head', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-procurement', comp.id, 'Procurement / PO', 'Purchase orders and vendor requisitions', ARRAY['Finance Manager', 'Operations Department Head', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-recruitment', comp.id, 'Recruitment Offers', 'Job offers, hiring decisions and onboarding', ARRAY['HR Department Head', 'HR Manager'], true, now()::text),
    ('ap-' || comp.id || '-assets', comp.id, 'Asset Requests', 'Equipment requisitions and asset assignments', ARRAY['Company Admin', 'Operations Department Head'], true, now()::text),
    ('ap-' || comp.id || '-exit', comp.id, 'Exit Management', 'Employee resignation and termination processing', ARRAY['HR Department Head', 'HR Manager', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-bank', comp.id, 'Bank Account Updates', 'Employee bank account change requests', ARRAY['HR Manager', 'HR Officer', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-profile', comp.id, 'Profile Updates', 'Employee profile field change requests', ARRAY['HR Manager', 'HR Officer', 'Company Admin'], true, now()::text),
    ('ap-' || comp.id || '-role-mgmt', comp.id, 'Role Management', 'Create, update, or delete roles and permission sets', ARRAY['HR Manager', 'HR Department Head', 'HR Officer', 'Company Admin'], true, now()::text)
    ON CONFLICT DO NOTHING;

  END LOOP;
END $$;
