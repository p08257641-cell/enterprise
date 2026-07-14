/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Company, User } from '../types';

interface HeaderProps {
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  users: User[];
  selectedUser: User;
  onSelectUser: (user: User) => void;
  notificationCount: number;
  onClearNotifications: () => void;
  onSearch: (term: string) => void;
  onSwitchRole?: (userId: string, newRole: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  users,
  selectedUser,
  onSelectUser,
  notificationCount,
  onClearNotifications,
  onSearch,
  onSwitchRole
}) => {
  // Filter users relevant to selected company or Super Admin
  const availableUsers = users.filter(u => u.companyId === selectedCompany.id || u.role === 'Super Admin');

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-6">
      {/* Search and Context Indicators */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-64 md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <i className="bi bi-search text-xs"></i>
          </span>
          <input
            type="text"
            placeholder="Search ERP index (leads, employees, accounts...)"
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-10 pr-4 text-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-sans"
          />
        </div>
      </div>

      {/* Multi-Tenant Switcher and RBAC Controller */}
      <div className="flex items-center gap-4">
        {/* User Role Sim Switcher */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <i className="bi bi-person-circle text-slate-400 text-xs"></i>
          <div className="relative">
            <select
              value={selectedUser.id}
              onChange={(e) => {
                const usr = users.find(u => u.id === e.target.value);
                if (usr) onSelectUser(usr);
              }}
              className="rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 py-1.5 pl-2 pr-8 text-xs font-semibold text-slate-900 outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.activeRole})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Role Switcher (only show if user has multiple roles) */}
        {selectedUser.roles && selectedUser.roles.length > 1 && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <i className="bi bi-arrow-repeat text-slate-400 text-xs"></i>
            <div className="relative">
              <select
                value={selectedUser.activeRole}
                onChange={(e) => {
                  if (onSwitchRole) {
                    onSwitchRole(selectedUser.id, e.target.value);
                  }
                }}
                className="rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 py-1.5 pl-2 pr-8 text-xs font-medium text-slate-700 outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {selectedUser.roles.map((role) => (
                  <option key={role} value={role}>
                    {role} {role === selectedUser.activeRole && '(Active)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Global Notifications Panel */}
        <div className="relative">
          <button 
            onClick={onClearNotifications}
            className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Clear all alerts"
          >
            <i className="bi bi-bell text-slate-500 hover:text-slate-900 text-sm"></i>
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Support login indicator if Super Admin acts as Company */}
        {selectedUser.activeRole === 'Super Admin' && (
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-900 border border-slate-200 px-2.5 py-1 rounded text-xs font-semibold animate-pulse">
            <i className="bi bi-shield text-slate-850 text-xs"></i>
            Super Admin Access
          </div>
        )}
      </div>
    </header>
  );
};
