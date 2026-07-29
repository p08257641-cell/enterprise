export function hasCrudPermission(
  userCrudPerms: string[] | undefined | null,
  module: string,
  action: string
): boolean {
  if (!userCrudPerms || userCrudPerms.length === 0) return true;
  return userCrudPerms.includes(`${module}.${action}`);
}
