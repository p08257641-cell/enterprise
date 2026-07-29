/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModuleViewsProps } from './moduleViews/shared';
import { PlatformView } from './moduleViews/PlatformView';
import { DashboardView } from './moduleViews/DashboardView';
import { AdminView } from './moduleViews/AdminView';
import { HRView } from './moduleViews/HRView';
import { PayrollView } from './moduleViews/PayrollView';
import { CRMView } from './moduleViews/CRMView';
import { AccountingView } from './moduleViews/AccountingView';
import { SalesView } from './moduleViews/SalesView';
import { InventoryView } from './moduleViews/InventoryView';
import { ProcurementView } from './moduleViews/ProcurementView';
import { ProjectView } from './moduleViews/ProjectView';
import { ManufacturingView } from './moduleViews/ManufacturingView';
import { POSView } from './moduleViews/POSView';
import { AssetView } from './moduleViews/AssetView';
import { DocumentView } from './moduleViews/DocumentView';
import { HelpDeskView } from './moduleViews/HelpDeskView';
import { VisitorView } from './moduleViews/VisitorView';
import { LMSView } from './moduleViews/LMSView';
import { ComplianceView } from './moduleViews/ComplianceView';
import { CommunicationView } from './moduleViews/CommunicationView';
import { VotingView } from './moduleViews/VotingView';
import { GalleryView } from './moduleViews/GalleryView';
import { ReportsView } from './moduleViews/ReportsView';
import { SuperAdminView } from './moduleViews/SuperAdminView';
import { ApiKeysView } from './moduleViews/ApiKeysView';
import { PendingApprovalsView } from './moduleViews/PendingApprovalsView';

export const ModuleViews: React.FC<ModuleViewsProps> = (props) => {
  const { activeView } = props;

  if (activeView.startsWith('platform')) return <PlatformView {...props} />;
  if (activeView === 'dashboard') return <DashboardView {...props} />;
  if (activeView.startsWith('admin')) return <AdminView {...props} />;
  if (activeView.startsWith('hr') || activeView === 'hire') return <HRView {...props} />;
  if (activeView.startsWith('payroll')) return <PayrollView {...props} />;
  if (activeView.startsWith('crm')) return <CRMView {...props} />;
  if (activeView === 'accounting' || activeView.startsWith('acc-')) return <AccountingView {...props} />;
  if (activeView.startsWith('sales')) return <SalesView {...props} />;
  if (activeView === 'inventory' || activeView.startsWith('inv-')) return <InventoryView {...props} />;
  if (activeView === 'procurement' || activeView.startsWith('proc-')) return <ProcurementView {...props} />;
  if (activeView === 'project' || activeView.startsWith('proj-')) return <ProjectView {...props} />;
  if (activeView === 'manufacturing' || activeView.startsWith('mfg-')) return <ManufacturingView {...props} />;
  if (activeView === 'pos' || activeView.startsWith('pos-')) return <POSView {...props} />;
  if (activeView === 'asset' || activeView.startsWith('asset-')) return <AssetView {...props} />;
  if (activeView === 'document' || activeView.startsWith('doc-')) return <DocumentView {...props} />;
  if (activeView === 'helpdesk' || activeView.startsWith('hd-')) return <HelpDeskView {...props} />;
  if (activeView === 'visitor' || activeView.startsWith('vis-')) return <VisitorView {...props} />;
  if (activeView === 'lms' || activeView.startsWith('lms-')) return <LMSView {...props} />;
  if (activeView === 'compliance' || activeView.startsWith('comp-')) return <ComplianceView {...props} />;
  if (activeView === 'communication' || activeView.startsWith('comm-')) return <CommunicationView {...props} />;
  if (activeView === 'voting' || activeView.startsWith('vote-')) return <VotingView {...props} />;
  if (activeView === 'gallery') return <GalleryView {...props} />;
  if (activeView === 'reports' || activeView.startsWith('reports-')) return <ReportsView {...props} />;
  if (activeView === 'superadmin') return <SuperAdminView {...props} />;
  if (activeView === 'pending-approvals') return <PendingApprovalsView {...props} />;
  if (activeView === 'apikeys') return <ApiKeysView {...props} />;

  return (
    <p className="fs-sm text-slate-400">The view <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded fs-xs">{activeView}</code> is not registered.</p>
  );
};
