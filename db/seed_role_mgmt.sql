INSERT INTO approval_policies (id, "companyId", module, description, "approverRoles", enabled, "createdAt")
SELECT 'ap-' || id || '-role-mgmt', id, 'Role Management', 'Create, update, or delete roles and permission sets', ARRAY['HR Manager','HR Department Head','HR Officer','Company Admin'], true, now()::text
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM approval_policies WHERE module = 'Role Management' AND "companyId" = companies.id
)
ON CONFLICT DO NOTHING;
