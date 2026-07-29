import { pgTable, text, boolean } from 'drizzle-orm/pg-core';

export const approvalPolicies = pgTable('approval_policies', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  module: text('module'),
  description: text('description'),
  approverRoles: text('approverRoles').array(),
  enabled: boolean('enabled').default(true),
  createdAt: text('createdAt'),
});
