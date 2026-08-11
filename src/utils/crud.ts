import { CustomRole } from '../types';

export function hasCrudPermission(
  roleId: string,
  customRoles: CustomRole[],
  companyId: string,
  moduleOrSubmenu: string | string[],
  action: string
): boolean {
  if (!roleId || ['Super Admin', 'System Administrator', 'Company Admin', 'IT Department Head'].includes(roleId)) return true;

  const role = customRoles.find(r => r.id === roleId && r.companyId === companyId) || customRoles.find(r => r.name === roleId && r.companyId === companyId);
  if (!role) return true;

  const perms = role.crudPermissions || [];
  if (perms.length === 0) return true;

  const modules = Array.isArray(moduleOrSubmenu) ? moduleOrSubmenu : [moduleOrSubmenu];
  return modules.some(m => perms.includes(`${m}.${action}`));
}
