/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, PendingApproval } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  selectedUser: User;
  notificationCount: number;
  pendingApprovalCount: number;
  pendingApprovals?: PendingApproval[];
  selectedCompanyId?: string;
  onClearNotifications: () => void;
  onSearch: (term: string) => void;
  onSwitchRole?: (userId: string, newRole: string) => void;
  onToggleSidebar?: () => void;
  onNavigateView?: (view: string) => void;
}

const MODULE_ICONS: Record<string, string> = {
  'Leave': 'bi-calendar-check',
  'Expense': 'bi-receipt',
  'Payroll': 'bi-cash-stack',
  'Procurement': 'bi-bag',
  'Invoice': 'bi-file-earmark-text',
  'Journal': 'bi-journal-text',
  'HR': 'bi-person-check',
  'Asset': 'bi-box-seam',
  'Recruitment': 'bi-person-plus',
  'Exit': 'bi-door-open',
  'Bank': 'bi-bank',
  'Compliance': 'bi-shield-check',
  'default': 'bi-bell',
};

function getModuleIcon(module: string): string {
  for (const key of Object.keys(MODULE_ICONS)) {
    if (module.toLowerCase().includes(key.toLowerCase())) return MODULE_ICONS[key];
  }
  return MODULE_ICONS.default;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const Header: React.FC<HeaderProps> = ({
  selectedUser,
  notificationCount,
  pendingApprovalCount,
  pendingApprovals = [],
  selectedCompanyId,
  onClearNotifications,
  onSearch,
  onSwitchRole,
  onToggleSidebar,
  onNavigateView,
}) => {
  const { logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalCount = notificationCount + pendingApprovalCount;

  // Filter to current company's pending approvals
  const companyApprovals = pendingApprovals.filter(
    a => a.status === 'Pending' && (!selectedCompanyId || a.companyId === selectedCompanyId)
  );

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  return (
    <header className="sticky top-0 z-45 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 md:px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
            title="Toggle Menu"
          >
            <i className="bi bi-list fs-xl"></i>
          </button>
        )}
        <div className="relative hidden sm:block w-44 md:w-64 lg:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <i className="bi bi-search fs-xs"></i>
          </span>
          <input
            type="text"
            placeholder="Search ERP index..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-10 pr-4 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logged-in user name */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 md:pl-4">
          <i className="bi bi-person-circle text-slate-400 fs-xs"></i>
          <span className="fs-xs fw-semibold text-slate-700 max-w-[100px] sm:max-w-[180px] truncate">
            {selectedUser.name}
          </span>
        </div>

        {/* Multi-Role Switcher */}
        {selectedUser.roles && selectedUser.roles.length > 1 && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 md:pl-4">
            <i className="bi bi-arrow-repeat text-slate-400 fs-xs"></i>
            <div className="relative">
              <select
                value={selectedUser.activeRole}
                onChange={(e) => {
                  if (onSwitchRole) onSwitchRole(selectedUser.id, e.target.value);
                }}
                className="rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 py-1.5 pl-2 pr-8 fs-xs fw-medium text-slate-700 outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer max-w-[80px] sm:max-w-[150px] truncate"
              >
                {selectedUser.roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Notification Bell + Panel */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPanelOpen(prev => !prev)}
            className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <i className={`bi bi-bell${totalCount > 0 ? '-fill' : ''} text-slate-500 hover:text-slate-900 fs-sm`}></i>
            {totalCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] fw-bold text-white ring-2 ring-white">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {panelOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <h3 className="fs-sm fw-bold text-slate-900">Notifications</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {totalCount > 0 ? `${totalCount} unread` : 'All caught up'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {totalCount > 0 && (
                    <button
                      onClick={() => { onClearNotifications(); setPanelOpen(false); }}
                      className="text-[11px] fw-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
                  >
                    <i className="bi bi-x text-base"></i>
                  </button>
                </div>
              </div>

              {/* Notification Items */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {companyApprovals.length === 0 && notificationCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <i className="bi bi-check2-all text-slate-400 fs-lg"></i>
                    </div>
                    <p className="fs-xs fw-semibold text-slate-600">You're all caught up!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No pending notifications</p>
                  </div>
                ) : (
                  <>
                    {/* System notification count (non-approval) */}
                    {notificationCount > 0 && (
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="bi bi-info-circle text-white text-[11px]"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="fs-xs fw-semibold text-slate-900">
                            {notificationCount} system alert{notificationCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Activity updates and system events
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 mt-1">now</span>
                      </div>
                    )}

                    {/* Pending Approvals as notifications */}
                    {companyApprovals.slice(0, 8).map(approval => (
                      <button
                        key={approval.id}
                        onClick={() => {
                          if (onNavigateView) onNavigateView('pending-approvals');
                          setPanelOpen(false);
                        }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                          <i className={`bi ${getModuleIcon(approval.module)} text-amber-600 text-[11px]`}></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="fs-xs fw-semibold text-slate-900 truncate">{approval.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                            {approval.description}
                          </p>
                          <p className="text-[10px] text-amber-600 fw-semibold mt-1">
                            <i className="bi bi-clock mr-1"></i>{approval.module} · by {approval.requesterName}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 mt-1">
                          {timeAgo(approval.createdAt)}
                        </span>
                      </button>
                    ))}

                    {companyApprovals.length > 8 && (
                      <div className="px-4 py-2 text-center text-[11px] text-slate-400">
                        +{companyApprovals.length - 8} more approvals
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {(companyApprovals.length > 0 || notificationCount > 0) && (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
                  <button
                    onClick={() => {
                      if (onNavigateView) onNavigateView('pending-approvals');
                      setPanelOpen(false);
                    }}
                    className="w-full text-center text-[11px] fw-semibold text-slate-700 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    View all pending approvals <i className="bi bi-arrow-right ml-1"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Super Admin badge */}
        {selectedUser.activeRole === 'Super Admin' && (
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-900 border border-slate-200 px-2 md:px-2.5 py-1 rounded fs-xs fw-semibold animate-pulse">
            <i className="bi bi-shield text-slate-850 fs-xs"></i>
            <span className="hidden md:inline">Super Admin</span>
          </div>
        )}

        {/* Logout */}
        <div className="border-l border-slate-200 pl-2 md:pl-4">
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600 rounded-full transition-colors cursor-pointer"
            title="Sign out"
          >
            <i className="bi bi-box-arrow-right fs-sm"></i>
          </button>
        </div>
      </div>
    </header>
  );
};
