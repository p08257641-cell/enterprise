import { pgTable, text, boolean } from 'drizzle-orm/pg-core';

export const customRoles = pgTable('custom_roles', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  name: text('name'),
  description: text('description'),
  modules: text('modules').array(),
  submenus: text('submenus').array(),
  crudPermissions: text('crudPermissions').array(),
  isSystem: boolean('isSystem').default(false),
  createdAt: text('createdAt'),
});
