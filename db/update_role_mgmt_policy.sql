UPDATE approval_policies
SET "approverRoles" = ARRAY['HR Manager','HR Department Head','HR Officer','Company Admin']
WHERE module = 'Role Management';
