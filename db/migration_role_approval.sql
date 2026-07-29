-- Add Role Management approval policy for all companies
-- Only Company Admin can approve role changes (Super Admin owns the SaaS platform, not individual companies)
DO $$
DECLARE
  comp RECORD;
BEGIN
  FOR comp IN SELECT id FROM companies LOOP
    INSERT INTO approval_policies (id, "companyId", module, description, "approverRoles", enabled, "createdAt")
    VALUES
    ('ap-' || comp.id || '-role-mgmt', comp.id, 'Role Management', 'Changes to role permissions, modules, and submenus', ARRAY['Company Admin'], true, now()::text)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
