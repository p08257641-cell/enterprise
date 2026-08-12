import { CustomRole } from '../types';

export function hasCrudPermission(
  roleId: string,
  customRoles: CustomRole[] = [],
  companyId: string,
  moduleOrSubmenu: string | string[],
  action: 'Create' | 'Read' | 'Update' | 'Delete' | 'View' | 'Edit'
): boolean {
  if (!roleId) return true;

  // Built-in system admin roles bypass role-level restrictions
  if (['Super Admin', 'System Administrator', 'Company Admin', 'IT Department Head', 'Admin', 'SuperAdmin'].includes(roleId)) {
    return true;
  }

  const role = (customRoles || []).find(
    r => (r.id === roleId || r.name === roleId) && (r.companyId === companyId || !r.companyId)
  );

  // If not a custom role, default to allowing built-in operations
  if (!role) return true;

  const perms = role.crudPermissions || [];
  if (perms.length === 0) return true;

  // Normalize action name
  const normAction = action === 'View' ? 'Read' : action === 'Edit' ? 'Update' : action;

  const modules = Array.isArray(moduleOrSubmenu) ? moduleOrSubmenu : [moduleOrSubmenu];

  return modules.some(m => {
    if (!m) return false;
    const cleanMod = m.trim();
    return (
      perms.includes(`${cleanMod}.${normAction}`) ||
      perms.includes(`${cleanMod.toLowerCase()}.${normAction}`) ||
      perms.some(p => {
        const parts = p.split('.');
        const pAction = parts[parts.length - 1];
        const pMod = parts.slice(0, parts.length - 1).join('.');
        return pAction === normAction && (
          pMod.toLowerCase() === cleanMod.toLowerCase() ||
          cleanMod.toLowerCase().includes(pMod.toLowerCase()) ||
          pMod.toLowerCase().includes(cleanMod.toLowerCase())
        );
      })
    );
  });
}
