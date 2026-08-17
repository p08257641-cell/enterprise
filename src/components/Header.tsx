/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, PendingApproval } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isEmployeeRole } from '../permissions';

interface HeaderProps {
  selectedUser: User;
  selectedCompany?: any;
  notificationCount: number;
  pendingApprovalCount: number;
  pendingApprovals?: PendingApproval[];
  selectedCompanyId?: string;
  onClearNotifications: () => void;
  onSearch: (term: string) => void;
  onSwitchRole?: (userId: string, newRole: string) => void;
  onToggleSidebar?: () => void;
  onNavigateView?: (view: string) => void;
  onStartTour?: () => void;
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
  selectedCompany,
  notificationCount,
  pendingApprovalCount,
  pendingApprovals = [],
  selectedCompanyId,
  onClearNotifications,
  onSearch,
  onSwitchRole,
  onToggleSidebar,
  onNavigateView,
  onStartTour,
}) => {
  const { logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  const totalCount = notificationCount + pendingApprovalCount;

  // Filter to current company's pending approvals
  const isEmployee = isEmployeeRole(selectedUser.activeRole || selectedUser.role);
  const companyApprovals = isEmployee ? [] : pendingApprovals.filter(
    a => a.status === 'Pending' && (!selectedCompanyId || a.companyId === selectedCompanyId)
  );

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen && !appsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) {
        setAppsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen, appsMenuOpen]);


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

        {/* Multi-Role Switcher */}
        {selectedUser.roles && selectedUser.roles.length > 1 && (
          <div className="flex items-center pl-2 md:pl-4 border-l border-slate-200">
            <div className="relative" ref={roleRef}>
              <div 
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-full transition-all cursor-pointer shadow-md ring-1 ring-white/10"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  <i className="bi bi-person-badge text-[10px] text-white"></i>
                </div>
                <span className="fs-xs fw-bold max-w-[80px] sm:max-w-[150px] truncate">{selectedUser.activeRole}</span>
                <i className={`bi bi-chevron-down text-[10px] text-slate-300 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`}></i>
              </div>
              
              {/* Dropdown Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider">Switch Role</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {selectedUser.roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(selectedUser.id, role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 fs-xs flex items-center justify-between transition-colors ${
                          selectedUser.activeRole === role 
                            ? 'bg-indigo-50 text-indigo-700 fw-bold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <i className={`bi ${selectedUser.activeRole === role ? 'bi-check2-circle text-indigo-600' : 'bi-circle text-slate-300'}`}></i>
                          <span className="truncate">{role}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI System Walkthrough & Onboarding Tour Button ───────────────── */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="h-10 px-3 sm:h-11 sm:px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center gap-2 transition-all cursor-pointer shadow-2xs font-semibold text-xs group"
            title="Start AI System Onboarding Walkthrough"
          >
            <i className="bi bi-compass-fill text-indigo-600 text-sm group-hover:rotate-45 transition-transform"></i>
            <span className="hidden sm:inline">AI Tour</span>
          </button>
        )}

        {/* ── Google-Style 9-Dots App Launcher Waffle Menu (Hidden for regular Employees) ─────────────────── */}
        {!isEmployee && (
          <div className="relative" ref={appsRef}>
            <button
              onClick={() => setAppsMenuOpen(prev => !prev)}
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                appsMenuOpen
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                  : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80'
              }`}
              title="Apps & Integrations Launcher"
            >
              <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 fill-current">
                <path d="M6 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </button>

            {/* App Launcher Popover */}
            {appsMenuOpen && (
              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/15 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <i className="bi bi-grid-3x3-gap-fill text-indigo-600 text-sm"></i>
                    </div>
                    <span className="text-xs fw-bold text-slate-900 tracking-wide">Apps & Integrations</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateView) onNavigateView('admin');
                      setAppsMenuOpen(false);
                    }}
                    className="text-[11px] fw-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Manage All →
                  </button>
                </div>

                {/* Grid of Apps (Filtered by Role) */}
                <div className="grid grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {[
                    {
                      id: 'whatsapp',
                      name: 'WhatsApp',
                      category: 'Business API',
                      color: '#25D366',
                      bg: '#e7f8ee',
                      view: 'admin',
                      roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Company Admin','CEO','Support Agent','Help Desk Admin','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    },
                    {
                      id: 'shopify',
                      name: 'Shopify',
                      category: 'E-Commerce',
                      color: '#96BF48',
                      bg: '#f2f7ea',
                      view: 'sales',
                      roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Inventory Manager','Store Keeper','Operations Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#96BF48" className="w-5 h-5"><path d="M15.337.93c-.072 0-.145.005-.217.014-.047-.239-.143-.466-.286-.672-.384-.55-.933-.647-1.227-.623-.054.004-.11.012-.167.023C13.298.04 12.897 0 12.474 0c-.422 0-.833.04-1.223.11-.054-.011-.11-.019-.164-.023-.293-.024-.842.073-1.226.623a1.42 1.42 0 00-.286.672 2.22 2.22 0 00-.217-.014C8.5.93 7.5 2.02 7.5 3.4c0 .12.008.24.023.358l-.54.105C5.84 4.085 5 5.044 5 6.195V20c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6.195c0-1.151-.84-2.11-1.983-2.332l-.54-.105c.015-.118.023-.238.023-.358 0-1.38-1-2.47-2.163-2.47zm-2.887 19.32a.75.75 0 110 1.5.75.75 0 010-1.5zm0-2.25a.75.75 0 110 1.5.75.75 0 010-1.5zm0-2.25a.75.75 0 110 1.5.75.75 0 010-1.5z"/></svg>
                    },
                    {
                      id: 'woocommerce',
                      name: 'WooCommerce',
                      category: 'WordPress Store',
                      color: '#7F54B3',
                      bg: '#f3eefb',
                      view: 'sales',
                      roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Inventory Manager','Store Keeper','Operations Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#7F54B3" className="w-5 h-5"><path d="M2.047 0C.919 0 0 .92 0 2.047v13.391c0 1.128.919 2.047 2.047 2.047h7.742l-.37 2.8-2.17.716h5.568l-2.17-.716-.37-2.8h7.676c1.128 0 2.047-.919 2.047-2.047V2.047C24 .92 23.08 0 21.953 0zm2.78 3.516c-.36 0-.651.193-.722.512-.098.44.26.809.626.972.253.11.385.29.385.521 0 .36-.293.65-.654.65-.23 0-.447-.12-.578-.317l-.565.566c.264.336.654.521 1.067.521.74 0 1.342-.603 1.342-1.343 0-.511-.29-.953-.738-1.16-.144-.067-.245-.185-.245-.33 0-.181.148-.328.33-.328.12 0 .232.064.295.165l.566-.567a1.04 1.04 0 00-.845-.419zm4.28 0c-.36 0-.651.193-.722.512-.098.44.26.809.626.972.253.11.385.29.385.521 0 .36-.293.65-.654.65-.23 0-.447-.12-.578-.317l-.565.566c.264.336.654.521 1.067.521.74 0 1.342-.603 1.342-1.343 0-.511-.29-.953-.738-1.16-.144-.067-.245-.185-.245-.33 0-.181.148-.328.33-.328.12 0 .232.064.295.165l.566-.567a1.04 1.04 0 00-.845-.419zm4.28 0c-.82 0-1.485.665-1.485 1.485 0 .82.665 1.485 1.485 1.485.82 0 1.485-.665 1.485-1.485 0-.82-.665-1.485-1.485-1.485zm0 .788c.385 0 .697.313.697.697 0 .385-.312.697-.697.697a.697.697 0 010-1.394z"/></svg>
                    },
                    {
                      id: 'zapier',
                      name: 'Zapier',
                      category: 'Automation',
                      color: '#FF4A00',
                      bg: '#fff1ec',
                      view: 'admin',
                      roles: ['Company Admin','CEO','Finance Manager','Finance Department Head','HR Manager','HR Department Head','Sales Department Head','IT Department Head','Operations Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#FF4A00" className="w-5 h-5"><path d="M14.924 8.339a5.42 5.42 0 01-.57 2.408L8.04 4.433a5.42 5.42 0 012.408-.57 5.42 5.42 0 014.476 2.325 5.408 5.408 0 01.569 2.151m-9.848 0c0-.749.15-1.464.42-2.115l6.37 6.37a5.42 5.42 0 01-2.114.42 5.42 5.42 0 01-4.676-2.675zm13.267 2.754l-5.267-5.266 5.267-5.267v10.533zm-16.686 0V5.826L6.924 11.093zm8.343-1.648L4.734 3.88h10.532zm0 3.11H4.734l5.266 5.266zm.985-1.462l5.267 5.267H5.719zm-10.58 1.462l5.267-5.267v10.533zm5.267 5.267l-5.267-5.267h10.533z"/></svg>
                    },
                    {
                      id: 'xero',
                      name: 'Xero',
                      category: 'Accounting',
                      color: '#13B5EA',
                      bg: '#e8f8fd',
                      view: 'accounting',
                      roles: ['Accountant','Finance Manager','Finance Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#13B5EA" className="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.44 16.562l-2.905-2.906-2.906 2.906-.988-.988 2.906-2.906-2.906-2.905.988-.988 2.906 2.905 2.905-2.905.988.988-2.905 2.905 2.905 2.906-.988.988zm6.315.07c-1.313 0-2.38-1.067-2.38-2.38 0-1.312 1.067-2.379 2.38-2.379 1.312 0 2.379 1.067 2.379 2.38 0 1.312-1.067 2.379-2.38 2.379zm0-3.86a1.48 1.48 0 100 2.96 1.48 1.48 0 000-2.96z"/></svg>
                    },
                    {
                      id: 'quickbooks',
                      name: 'QuickBooks',
                      category: 'Finance',
                      color: '#2CA01C',
                      bg: '#eaf7e9',
                      view: 'accounting',
                      roles: ['Accountant','Finance Manager','Finance Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="#2CA01C" className="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8a7.2 7.2 0 110 14.4A7.2 7.2 0 0112 4.8zm-2.4 3.6v7.2h1.8V9.9h.9a1.5 1.5 0 010 3H11.4v1.8h.9a3.3 3.3 0 100-6.6H9.6v.3z"/></svg>
                    },
                    {
                      id: 'google-workspace',
                      name: 'Google Workspace',
                      category: 'Productivity',
                      color: '#4285F4',
                      bg: '#eef3fe',
                      view: 'hr',
                      roles: ['HR Manager','HR Officer','HR Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    },
                    {
                      id: 'website',
                      name: 'Your Website',
                      category: 'Embed Widget',
                      color: '#0ea5e9',
                      bg: '#e0f2fe',
                      view: 'admin',
                      roles: ['Sales Manager','Sales Executive','Sales Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                    },
                    {
                      id: 'sales',
                      name: 'Sales & POS',
                      category: 'Core App',
                      color: '#6366f1',
                      bg: '#eef2ff',
                      view: 'sales',
                      roles: ['Sales Manager','Sales Rep','Sales Executive','Store Keeper','Accountant','Company Admin','CEO','IT Department Head'],
                      icon: <i className="bi bi-cart-check-fill text-indigo-600 text-base"></i>
                    },
                    {
                      id: 'hr',
                      name: 'HR & Staff',
                      category: 'Core App',
                      color: '#10b981',
                      bg: '#ecfdf5',
                      view: 'hr',
                      roles: ['HR Manager','HR Officer','HR Department Head','Company Admin','CEO','IT Department Head'],
                      icon: <i className="bi bi-people-fill text-emerald-600 text-base"></i>
                    },
                    {
                      id: 'crm',
                      name: 'CRM Pipeline',
                      category: 'Core App',
                      color: '#f59e0b',
                      bg: '#fffbeb',
                      view: 'crm',
                      roles: ['Sales Manager','Sales Rep','Sales Executive','Company Admin','CEO','IT Department Head'],
                      icon: <i className="bi bi-funnel-fill text-amber-600 text-base"></i>
                    },
                    {
                      id: 'admin',
                      name: 'Admin Panel',
                      category: 'System Config',
                      color: '#334155',
                      bg: '#f1f5f9',
                      view: 'admin',
                      roles: ['Company Admin','CEO','IT Department Head','Super Admin'],
                      icon: <i className="bi bi-gear-wide-connected text-slate-700 text-base"></i>
                    },
                  ]
                  .filter(app => {
                    const activeRole = selectedUser.activeRole || selectedUser.role || '';
                    if (['Company Admin', 'CEO', 'Super Admin', 'IT Department Head'].includes(activeRole)) return true;
                    return app.roles && app.roles.includes(activeRole);
                  })
                  .map(app => (
                    <button
                      key={app.id}
                      onClick={() => {
                        if (onNavigateView) onNavigateView(app.view);
                        setAppsMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition-all group cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105" style={{ background: app.bg }}>
                        {app.icon}
                      </div>
                      <span className="text-[11px] fw-bold text-slate-800 group-hover:text-indigo-900 truncate w-full">{app.name}</span>
                      <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 truncate w-full">{app.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <h3 className="fs-sm fw-bold text-slate-900">Notifications</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {totalCount > 0 ? `${totalCount} unread` : 'All caught up'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
              {!isEmployeeRole(selectedUser.activeRole) && (companyApprovals.length > 0 || notificationCount > 0) && (
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
