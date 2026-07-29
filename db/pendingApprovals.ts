import { pgTable, text } from 'drizzle-orm/pg-core';

export const pendingApprovals = pgTable('pending_approvals', {
  id: text('id').primaryKey(),
  companyId: text('companyId'),
  module: text('module'),
  recordId: text('recordId'),
  recordType: text('recordType'),
  requesterId: text('requesterId'),
  requesterName: text('requesterName'),
  title: text('title'),
  description: text('description'),
  status: text('status').default('Pending'),
  assignedRoles: text('assignedRoles').array(),
  approvedBy: text('approvedBy'),
  approvedAt: text('approvedAt'),
  rejectionReason: text('rejectionReason'),
  createdAt: text('createdAt'),
});
