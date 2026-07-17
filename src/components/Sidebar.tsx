/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company, User } from '../types';
import { ROLE_MODULES as rolePermissions, ROLE_SUBMENUS as submenuPermissions } from '../permissions';

interface SidebarProps {
  selectedCompany: Company;
  selectedUser: User;
  activeView: string;
  onSelectView: (view: string) => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  viewId: string;
  iconClass: string;
  moduleId?: string;
}

interface ModuleItem {
  id: string;
  label: string;
  iconClass: string;
  viewId: string;
  subMenus?: SubMenuItem[];
}

interface ModuleGroup {
  title: string;
  modules: ModuleItem[];
  roleRestriction?: string; // Optional role restriction for entire group
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCompany,
  selectedUser,
  activeView,
  onSelectView
}) => {
  // Use activeRole for permission checks
  const userRole = selectedUser.activeRole || selectedUser.role;
  const isSuperAdmin = userRole === 'Super Admin';
  const isEmployee = userRole === 'Employee';

  // Employee-specific label overrides to make ESS feel distinct
  const employeeLabelOverrides: Record<string, string> = {
    'HR': 'My Workspace',
    'Payroll': 'My Compensation',
  };
  const employeeSubmenuLabelOverrides: Record<string, string> = {
    'hr-employees': 'Company Directory',
    'hr-attendance': 'My Attendance',
    'hr-leave': 'My Leaves',
    'hr-performance': 'My Goals & OKRs',
    'hr-orgchart': 'Org Chart',
    'payroll-slips': 'My Payslips',
  };
  const employeeIconOverrides: Record<string, string> = {
    'HR': 'bi bi-person-workspace',
    'Payroll': 'bi bi-wallet2',
  };

  // Role→module and role→submenu maps are owned by src/permissions.ts (single source of truth).
  // Check if user has access to a module
  const hasModuleAccess = (moduleId: string): boolean => {
    if (moduleId === 'Dashboard') return true;
    const userPermissions = rolePermissions[userRole] || [];
    return userPermissions.includes(moduleId) || userPermissions.includes('*');
  };

  // Check if user has access to a submenu item
  const hasSubmenuAccess = (submenuId: string): boolean => {
    const userPermissions = submenuPermissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(submenuId);
  };

  // Track which top-level modules are expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Auto-expand the module whose sub-view is currently active
  const isSubViewActive = (mod: ModuleItem) =>
    mod.subMenus
      ?.filter(sub => !sub.moduleId || selectedCompany.activeModules.includes(sub.moduleId))
      .some(s => s.viewId === activeView) ?? false;

  const moduleGroups: ModuleGroup[] = [
    {
      title: 'Overview',
      modules: [
        {
          id: 'Dashboard', label: 'Dashboard', iconClass: 'bi bi-speedometer2', viewId: 'dashboard',
        },
      ]
    },
    {
      title: 'Platform Management',
      modules: [
        {
          id: 'Platform Management', label: 'Platform Management', iconClass: 'bi bi-globe', viewId: 'platform',
          subMenus: [
            { id: 'platform-tenants', label: 'Tenant Companies', viewId: 'platform-tenants', iconClass: 'bi bi-buildings' },
            { id: 'platform-billing', label: 'Billing & Revenue', viewId: 'platform-billing', iconClass: 'bi bi-currency-dollar' },
            { id: 'platform-subscriptions', label: 'Module Subscriptions', viewId: 'platform-subscriptions', iconClass: 'bi bi-box-seam' },
            { id: 'platform-analytics', label: 'Platform Analytics', viewId: 'platform-analytics', iconClass: 'bi bi-graph-up' },
            { id: 'platform-users', label: 'Platform Users', viewId: 'platform-users', iconClass: 'bi bi-people' },
            { id: 'platform-settings', label: 'Platform Settings', viewId: 'platform-settings', iconClass: 'bi bi-gear' },
          ]
        },
      ],
      roleRestriction: 'Super Admin' // Only show this group to Super Admin
    },
    {
      title: 'Core Suite',
      modules: [
        {
          id: 'Administration', label: 'Administration', iconClass: 'bi bi-folder-symlink', viewId: 'admin',
        },
        {
          id: 'HR', label: isEmployee ? 'My Workspace' : 'HR & Directory', iconClass: isEmployee ? 'bi bi-person-workspace' : 'bi bi-people', viewId: 'hr',
        },
        {
          id: 'Payroll', label: isEmployee ? 'My Compensation' : 'Payroll & Salary', iconClass: isEmployee ? 'bi bi-wallet2' : 'bi bi-cash-stack', viewId: isEmployee ? 'payroll-slips' : 'payroll',
        },
        {
          id: 'CRM', label: 'CRM Leads', iconClass: 'bi bi-graph-up-arrow', viewId: 'crm',
        },
        {
          id: 'Accounting', label: 'Accounting Ledger', iconClass: 'bi bi-book', viewId: 'accounting',
        },
        {
          id: 'Sales', label: 'Sales & Orders', iconClass: 'bi bi-tag', viewId: 'sales',
        },
        {
          id: 'POS', label: 'Point of Sale', iconClass: 'bi bi-cash-coin', viewId: 'pos',
        },
      ]
    },
    {
      title: 'Enterprise Suite',
      modules: [
        {
          id: 'Operations', label: 'Operations & Projects', iconClass: 'bi bi-gear-wide-connected', viewId: 'project',
          subMenus: [
            { id: 'proj-kanban', label: 'Kanban Board', viewId: 'project', iconClass: 'bi bi-columns-gap', moduleId: 'Project Management' },
            { id: 'inv-stock', label: 'Stock Levels', viewId: 'inventory', iconClass: 'bi bi-boxes', moduleId: 'Inventory' },
            { id: 'inv-warehouses', label: 'Warehouses', viewId: 'inv-warehouses', iconClass: 'bi bi-building', moduleId: 'Inventory' },
            { id: 'inv-transfers', label: 'Stock Transfers', viewId: 'inv-transfers', iconClass: 'bi bi-arrow-left-right', moduleId: 'Inventory' },
            { id: 'inv-valuation', label: 'Valuation', viewId: 'inv-valuation', iconClass: 'bi bi-currency-dollar', moduleId: 'Inventory' },
            { id: 'proc-pos', label: 'Purchase Orders', viewId: 'procurement', iconClass: 'bi bi-file-earmark-plus', moduleId: 'Procurement' },
            { id: 'proc-vendors', label: 'Vendors', viewId: 'proc-vendors', iconClass: 'bi bi-shop', moduleId: 'Procurement' },
            { id: 'proc-rfq', label: 'RFQ / Bids', viewId: 'proc-rfq', iconClass: 'bi bi-clipboard-check', moduleId: 'Procurement' },
            { id: 'mfg-bom', label: 'Bill of Materials', viewId: 'manufacturing', iconClass: 'bi bi-list-nested', moduleId: 'Manufacturing' },
            { id: 'mfg-orders', label: 'Work Orders', viewId: 'mfg-orders', iconClass: 'bi bi-clipboard2-data', moduleId: 'Manufacturing' },
            { id: 'mfg-quality', label: 'Quality Control', viewId: 'mfg-quality', iconClass: 'bi bi-check-circle', moduleId: 'Manufacturing' },
            { id: 'asset-register', label: 'Asset Register', viewId: 'asset', iconClass: 'bi bi-collection', moduleId: 'Asset Management' },
            { id: 'asset-maintenance', label: 'Maintenance', viewId: 'asset-maintenance', iconClass: 'bi bi-wrench', moduleId: 'Asset Management' },
            { id: 'asset-depreciation', label: 'Depreciation', viewId: 'asset-depreciation', iconClass: 'bi bi-graph-down', moduleId: 'Asset Management' },
            { id: 'doc-locker', label: 'Document Locker', viewId: 'document', iconClass: 'bi bi-folder2-open', moduleId: 'Document Management' },
            { id: 'doc-esign', label: 'e-Signatures', viewId: 'doc-esign', iconClass: 'bi bi-pen', moduleId: 'Document Management' },
            { id: 'doc-ocr', label: 'OCR / Scan', viewId: 'doc-ocr', iconClass: 'bi bi-upc-scan', moduleId: 'Document Management' },
          ]
        },
        {
          id: 'Help Desk', label: 'Help Desk', iconClass: 'bi bi-heart-pulse', viewId: 'helpdesk',
        },
        {
          id: 'Visitor Management', label: 'Visitor Management', iconClass: 'bi bi-door-open', viewId: 'visitor',
        },
        {
          id: 'Compliance', label: 'Compliance', iconClass: 'bi bi-shield-check', viewId: 'compliance',
        },
        {
          id: 'Communication', label: 'Communication', iconClass: 'bi bi-megaphone', viewId: 'communication',
        },
        {
          id: 'Intelligence', label: 'Intelligence & Analytics', iconClass: 'bi bi-cpu', viewId: 'reports',
          subMenus: [
            { id: 'wf-builder', label: 'Workflow & Automation', viewId: 'workflow', iconClass: 'bi bi-diagram-3', moduleId: 'Workflow & Automation' },
            { id: 'ai-chat', label: 'Gemini AI Chat', viewId: 'ai-copilot', iconClass: 'bi bi-chat-left-text', moduleId: 'AI Assistant' },
            { id: 'ai-insights', label: 'AI Smart Insights', viewId: 'ai-insights', iconClass: 'bi bi-lightbulb', moduleId: 'AI Assistant' },
          ]
        },
      ]
    }
  ];

  useEffect(() => {
    // Find the module that contains the active view and auto-expand it
    const activeModIds = new Set<string>();
    moduleGroups.forEach(group => {
      group.modules.forEach(mod => {
        if (isSubViewActive(mod)) {
          activeModIds.add(mod.id);
        }
      });
    });

    if (activeModIds.size > 0) {
      setExpandedModules(prev => {
        const next = new Set(prev);
        activeModIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [activeView, selectedCompany.activeModules]);

  const isModuleExpanded = (mod: ModuleItem) => {
    // Check if module is in expanded state
    return expandedModules.has(mod.id);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-600">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
        <span className="text-2xl">{userRole === 'Super Admin' ? '🌐' : selectedCompany.logo}</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate w-40">
            {userRole === 'Super Admin' ? 'Platform Admin' : selectedCompany.name}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {userRole === 'Super Admin' ? 'erp-platform.com' : selectedCompany.domain}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {moduleGroups.map((group) => {
          // Skip group if it has role restriction and user doesn't have that role
          if (group.roleRestriction && userRole !== group.roleRestriction) {
            return null;
          }

          return (
            <div key={group.title}>
              <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </div>
              <nav className="space-y-0.5">
              {group.modules.map((mod) => {
                const moduleSubIds = mod.subMenus
                  ? Array.from(new Set(mod.subMenus.map(s => s.moduleId).filter((m): m is string => Boolean(m))))
                  : [];
                const isInstalled =
                  mod.id === 'Dashboard' ||
                  selectedCompany.activeModules.includes(mod.id) ||
                  moduleSubIds.some(mid => selectedCompany.activeModules.includes(mid));
                const hasModuleAccessPermission = hasModuleAccess(mod.id);
                const hasSubMenus = mod.subMenus && mod.subMenus.length > 0;
                const expanded = isModuleExpanded(mod);
                const isTopActive = activeView === mod.viewId && !isSubViewActive(mod);

                // Filter submenus based on role permissions
                const accessibleSubMenus = hasSubMenus 
                  ? mod.subMenus!.filter(sub => hasSubmenuAccess(sub.id))
                  : [];

                // Hide module completely if user doesn't have access (for Super Admin and all roles)
                if (!hasModuleAccessPermission) {
                  return null;
                }

                // For non-Super Admin, hide module if not installed
                if (!isSuperAdmin && !isInstalled) {
                  return null;
                }

                return (
                  <div key={mod.id}>
                    {/* Top-level module button */}
                    <button
                      onClick={() => {
                        if (hasSubMenus && accessibleSubMenus.length > 0) {
                          // Toggle expansion
                          toggleExpand(mod.id);
                        } else {
                          // Navigate if no submenus
                          onSelectView(mod.viewId);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                        isTopActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : expanded
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <i className={`${mod.iconClass} text-sm`}></i>
                        {mod.label}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {hasSubMenus && accessibleSubMenus.length > 0 && (
                          <i
                            className={`bi bi-chevron-down text-xs transition-transform duration-200 ${
                              expanded ? 'rotate-180' : ''
                            }`}
                          ></i>
                        )}
                      </span>
                    </button>

                    {/* Sub-menus (collapsible) */}
                    {hasSubMenus && expanded && accessibleSubMenus.length > 0 && (
                      <div className="ml-3 mt-0.5 border-l-2 border-slate-100 pl-3 space-y-0.5">
                        {accessibleSubMenus
                          .filter(sub => !sub.moduleId || selectedCompany.activeModules.includes(sub.moduleId))
                          .map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => onSelectView(sub.viewId)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                              activeView === sub.viewId
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                          >
                            <i className={`${sub.iconClass} text-sm`}></i>
                            {isEmployee && employeeSubmenuLabelOverrides[sub.id] ? employeeSubmenuLabelOverrides[sub.id] : sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        );
        })}

        {/* System Admin Panel */}
        <div className="pt-2 border-t border-slate-100">
          <div className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            System
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectView('apikeys')}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'apikeys' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <i className="bi bi-gear text-sm"></i>
              API Settings & Keys
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};
