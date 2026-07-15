import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole } from '../../permissions';

export const AdminView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole);

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const localBranches = branches.filter(b => b.companyId === selectedCompany.id);

  const [adminTab, setAdminTab] = useState<'branches' | 'departments' | 'users' | 'roles' | 'approvals' | 'settings'>(() => {
    if (activeView === 'admin-users') return 'users';
    if (activeView === 'admin-roles') return 'roles';
    if (activeView === 'admin-branches') return 'branches';
    if (activeView === 'admin-departments') return 'departments';
    if (activeView === 'admin-approvals') return 'approvals';
    if (activeView === 'admin-settings') return 'settings';
    return 'branches';
  });

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviteRoles, setInviteRoles] = useState<string[]>(['Employee']);
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [inviteBranch, setInviteBranch] = useState('HQ');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [approvalPolicies, setApprovalPolicies] = useState<Record<string, string[]>>({
    'Leave Requests': ['Department Head', 'Company Admin'],
    'Payroll Processing': ['HR Manager', 'Company Admin'],
    'Expense Claims': ['Finance Manager', 'Company Admin'],
    'Procurement / PO': ['Finance Manager', 'Company Admin'],
    'Recruitment Offers': ['Department Head', 'HR Manager'],
    'Asset Requests': ['Company Admin'],
  });
  const [approvalSaveSuccess, setApprovalSaveSuccess] = useState(false);

  const [customRoles, setCustomRoles] = useState([
    { id: 'role-1', name: 'Company Admin', permissions: 'Full system access within tenant', rawPermissions: ['admin_all'], users: 1 },
    { id: 'role-ceo', name: 'CEO', permissions: 'Full company access, executive oversight', rawPermissions: ['admin_all', 'executive_view'], users: 0 },
    { id: 'role-2', name: 'HR Manager', permissions: 'HR, Payroll, Attendance, Recruitment, Leave Approvals', rawPermissions: ['hr_view', 'hr_edit', 'leave_approve', 'payroll_manage'], users: 2 },
    { id: 'role-hro', name: 'HR Officer', permissions: 'HR, Payroll, Attendance, Recruitment', rawPermissions: ['hr_view', 'hr_edit', 'leave_approve'], users: 1 },
    { id: 'role-3', name: 'Finance Manager', permissions: 'Accounting, Invoices, Ledger, Expenses, Payroll Processing', rawPermissions: ['accounting_view', 'accounting_edit', 'payroll_manage'], users: 1 },
    { id: 'role-acc', name: 'Accountant', permissions: 'Accounting, Journal Entries, Reports', rawPermissions: ['accounting_view', 'accounting_edit'], users: 1 },
    { id: 'role-4', name: 'Sales Manager', permissions: 'CRM pipeline, Customer contacts, Sales logs', rawPermissions: ['sales_manage'], users: 2 },
    { id: 'role-sr', name: 'Sales Rep', permissions: 'CRM pipeline, Customer contacts', rawPermissions: ['crm_view', 'crm_edit'], users: 2 },
    { id: 'role-se', name: 'Sales Executive', permissions: 'CRM pipeline, Sales targets, Customer contacts', rawPermissions: ['crm_view', 'crm_edit', 'sales_manage'], users: 0 },
    { id: 'role-5', name: 'Inventory Manager', permissions: 'Stock Levels, Warehouse transfers, Procurement POs', rawPermissions: ['inventory_manage'], users: 1 },
    { id: 'role-sk', name: 'Store Keeper', permissions: 'Stock Levels, Warehouse management', rawPermissions: ['inventory_view', 'inventory_edit'], users: 1 },
    { id: 'role-6', name: 'Support Agent', permissions: 'Help Desk tickets, Visitor logs, Internal chat', rawPermissions: ['helpdesk_edit'], users: 3 },
    { id: 'role-dh', name: 'Department Head', permissions: 'Department management, limited admin access', rawPermissions: ['hr_view', 'admin_manage'], users: 0 },
  ]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; permissions: string; rawPermissions: string[]; users: number } | null>(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormPermissions, setRoleFormPermissions] = useState<string[]>([]);

  const handleOpenRoleModal = (roleToEdit: typeof customRoles[0] | null) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleFormName(roleToEdit.name);
      setRoleFormDesc(roleToEdit.permissions);
      setRoleFormPermissions(roleToEdit.rawPermissions);
    } else {
      setEditingRole(null);
      setRoleFormName('');
      setRoleFormDesc('');
      setRoleFormPermissions([]);
    }
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;

    if (editingRole) {
      setCustomRoles(prev => prev.map(r => r.id === editingRole.id ? {
        ...r,
        name: roleFormName,
        permissions: roleFormDesc || 'Custom permissions assigned',
        rawPermissions: roleFormPermissions
      } : r));
    } else {
      const newRole = {
        id: `role-${Date.now()}`,
        name: roleFormName,
        permissions: roleFormDesc || 'Custom permissions assigned',
        rawPermissions: roleFormPermissions,
        users: 0
      };
      setCustomRoles(prev => [...prev, newRole]);
    }
    setShowRoleModal(false);
  };

  const depts = ['Engineering', 'Operations', 'Finance', 'HR', 'Sales', 'IT', 'Legal'];

  return (
      <div>
        <PageHeader title="Administration" subtitle="Company configuration, branch management, users, roles and system settings." />

        {adminTab === 'branches' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">Branch Locations</h3>
              {isAdmin && <PrimaryBtn icon="bi bi-plus-lg">Add Branch</PrimaryBtn>}
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Branch Name' }, { label: 'Location' }, { label: 'Type' }, { label: 'Employees' }, { label: 'Status' }]} />
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'New York Headquarters', location: 'New York, USA', type: 'Main HQ', emp: localEmployees.filter(e => e.branch.includes('New York') || e.branch.includes('HQ')).length, status: 'Active' },
                  { name: 'Chicago Production Plant', location: 'Chicago, USA', type: 'Plant', emp: localEmployees.filter(e => e.branch.includes('Chicago')).length, status: 'Active' },
                  { name: 'London Regional Office', location: 'London, UK', type: 'Regional', emp: 0, status: 'Opening Soon' },
                ].map(b => (
                  <tr key={b.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3.5"><div className="data-value font-semibold text-slate-900">{b.name}</div></td>
                    <td className="px-4 py-3.5 data-value text-slate-500">{b.location}</td>
                    <td className="px-4 py-3.5"><Badge label={b.type} /></td>
                    <td className="px-4 py-3.5 data-value font-sans tabular-nums text-slate-700">{b.emp}</td>
                    <td className="px-4 py-3.5"><Badge label={b.status} variant={b.status === 'Active' ? 'success' : 'warning'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {adminTab === 'departments' && (() => {
          const companyDepts = departments.filter(d => d.companyId === selectedCompany.id);
          const getDeptName = (id?: string) => companyDepts.find(d => d.id === id)?.name;

          // Build tree for organogram
          const roots = companyDepts.filter(d => !d.parentId);
          const getChildren = (parentId: string) => companyDepts.filter(d => d.parentId === parentId);

          const renderOrgNode = (dept: typeof companyDepts[0], depth: number): React.ReactNode => {
            const children = getChildren(dept.id);
            const manager = localEmployees.find(e => e.userId === dept.managerId);
            return (
              <div key={dept.id} className="flex flex-col items-center">
                {/* Node card */}
                <div className={`px-4 py-3 rounded-xl border text-center min-w-[140px] max-w-[180px] transition-all hover:shadow-md ${depth === 0
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : depth === 1
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                  <div className={`text-xs font-bold ${depth === 0 ? 'text-white' : 'text-slate-900'}`}>{dept.name}</div>
                  <div className={`text-[9px] mt-0.5 ${depth === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                    {manager ? `${manager.firstName} ${manager.lastName}` : 'No manager'}
                  </div>
                  <div className={`text-[9px] font-mono mt-0.5 ${depth === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                    {dept.employeeCount} staff
                  </div>
                </div>
                {/* Children */}
                {children.length > 0 && (
                  <>
                    <div className="w-px h-5 bg-slate-300"></div>
                    <div className="flex items-start gap-0 relative">
                      {children.length > 1 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-300" style={{
                          width: `${Math.max(0, (children.length - 1) * 180)}px`
                        }}></div>
                      )}
                      <div className="flex gap-6">
                        {children.map(child => (
                          <div key={child.id} className="flex flex-col items-center">
                            <div className="w-px h-5 bg-slate-300"></div>
                            {renderOrgNode(child, depth + 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          };

          return (
            <div className="space-y-6">
              {/* Department Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Department Structure</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure reporting hierarchy and department assignments.</p>
                  </div>
                  {isAdmin && <PrimaryBtn icon="bi bi-plus-lg">Add Department</PrimaryBtn>}
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Department' }, { label: 'Reports To' }, { label: 'Head Count' }, { label: 'Budget' }, { label: 'Manager' }, { label: '' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {companyDepts.map(dept => {
                      const manager = localEmployees.find(e => e.userId === dept.managerId);
                      const parentName = getDeptName(dept.parentId);
                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full shrink-0 ${!dept.parentId ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                              <span className="text-xs font-semibold text-slate-900">{dept.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {isAdmin ? (
                              <select
                                value={dept.parentId || ''}
                                onChange={() => { }}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[130px]"
                              >
                                <option value="">ΓÇö Root (Top Level)</option>
                                {companyDepts.filter(d => d.id !== dept.id).map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-slate-500">{parentName || 'ΓÇö Root'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-sans tabular-nums text-slate-700">{dept.employeeCount} staff</td>
                          <td className="px-4 py-3.5 text-xs font-sans tabular-nums text-slate-700">${dept.budget.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {manager ? `${manager.firstName} ${manager.lastName}` : 'ΓÇö'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {isAdmin && <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">Edit</button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual Organogram */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-diagram-3 text-slate-500 text-sm"></i>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Department Organogram</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Visual reporting hierarchy showing which department reports to which.</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 overflow-x-auto">
                  <div className="flex justify-center gap-12">
                    {roots.map(root => renderOrgNode(root, 0))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {adminTab === 'users' && (
          <div className="space-y-4">
            {showInviteForm && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-slate-900">Invite New User</h3>
                  <button onClick={() => setShowInviteForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                {inviteSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
                    User invited successfully!
                  </div>
                )}
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!inviteName || !inviteEmail) return;
                  onInviteUser({
                    name: inviteName,
                    email: inviteEmail,
                    role: inviteRole,
                    roles: inviteRoles,
                    department: inviteDept,
                    branch: inviteBranch
                  });
                  setInviteSuccess(true);
                  setTimeout(() => {
                    setInviteSuccess(false);
                    setShowInviteForm(false);
                    setInviteName('');
                    setInviteEmail('');
                    setInviteRole('Employee');
                    setInviteRoles(['Employee']);
                  }, 2000);
                }} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Full Name *</Label><Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="John Doe" required /></div>
                    <div><Label>Email Address *</Label><Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="john@company.com" required /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Primary Role *</Label>
                      <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)} required>
                        <option value="Employee">Employee</option>
                        {selectedCompany.activeModules.includes('Administration') && <option value="CEO">CEO</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="HR Manager">HR Manager</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="HR Officer">HR Officer</option>}
                        {selectedCompany.activeModules.includes('Accounting') && <option value="Accountant">Accountant</option>}
                        {selectedCompany.activeModules.includes('Accounting') && <option value="Finance Manager">Finance Manager</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Manager">Sales Manager</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Rep">Sales Rep</option>}
                        {selectedCompany.activeModules.includes('CRM') && <option value="Sales Executive">Sales Executive</option>}
                        {selectedCompany.activeModules.includes('Operations') && <option value="Inventory Manager">Inventory Manager</option>}
                        {selectedCompany.activeModules.includes('Operations') && <option value="Store Keeper">Store Keeper</option>}
                        {selectedCompany.activeModules.includes('Help Desk') && <option value="Support Agent">Support Agent</option>}
                        {selectedCompany.activeModules.includes('HR') && <option value="Department Head">Department Head</option>}
                      </Select>
                    </div>
                    <div>
                      <Label>Department *</Label>
                      <Select value={inviteDept} onChange={e => setInviteDept(e.target.value)} required>
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="IT">IT</option>
                        <option value="Legal">Legal</option>
                        <option value="Marketing">Marketing</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Additional Roles (multi-select)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {['Employee', 'Department Head', 'CEO', 'HR Manager', 'HR Officer', 'Accountant', 'Finance Manager', 'Sales Manager', 'Sales Rep', 'Sales Executive', 'Inventory Manager', 'Store Keeper', 'Support Agent']
                        .filter(role => {
                          if (role === 'Employee' || role === 'Department Head') return selectedCompany.activeModules.includes('HR');
                          if (role === 'CEO') return selectedCompany.activeModules.includes('Administration');
                          if (['HR Manager', 'HR Officer'].includes(role)) return selectedCompany.activeModules.includes('HR');
                          if (['Accountant', 'Finance Manager'].includes(role)) return selectedCompany.activeModules.includes('Accounting');
                          if (['Sales Manager', 'Sales Rep', 'Sales Executive'].includes(role)) return selectedCompany.activeModules.includes('CRM');
                          if (['Inventory Manager', 'Store Keeper'].includes(role)) return selectedCompany.activeModules.includes('Operations');
                          if (role === 'Support Agent') return selectedCompany.activeModules.includes('Help Desk');
                          return true;
                        })
                        .map(role => (
                          <label key={role} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inviteRoles.includes(role)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setInviteRoles([...inviteRoles, role]);
                                } else {
                                  setInviteRoles(inviteRoles.filter(r => r !== role));
                                }
                              }}
                              className="rounded border-slate-300"
                            />
                            {role}
                          </label>
                        ))}
                    </div>
                  </div>
                  <div>
                    <Label>Branch *</Label>
                    <Select value={inviteBranch} onChange={e => setInviteBranch(e.target.value)} required>
                      <option value="HQ">HQ</option>
                      <option value="Chicago Factory">Chicago Factory</option>
                      <option value="Regional West">Regional West</option>
                      <option value="Regional East">Regional East</option>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <PrimaryBtn icon="bi bi-send">Send Invitation</PrimaryBtn>
                    <SecBtn onClick={() => setShowInviteForm(false)}>Cancel</SecBtn>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">System Users</h3>
                {isAdmin && <PrimaryBtn icon="bi bi-person-plus" onClick={() => setShowInviteForm(true)}>Invite User</PrimaryBtn>}
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'User' }, { label: 'Active Role' }, { label: 'All Roles' }, { label: 'Department' }, { label: 'Status' }, { label: 'Joined' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.slice(0, 8).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center avatar-text text-slate-700">{emp.firstName[0]}{emp.lastName[0]}</div>
                          <div><div className="table-cell-semibold text-slate-900">{emp.firstName} {emp.lastName}</div><div className="data-value-small text-slate-400">{emp.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{emp.designation}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{emp.designation}</td>
                      <td className="px-4 py-3.5 table-cell text-slate-600">{emp.department}</td>
                      <td className="px-4 py-3.5"><Badge label={emp.status} variant={emp.status === 'Active' ? 'success' : 'warning'} /></td>
                      <td className="px-4 py-3.5 table-cell-mono text-slate-400">{emp.joiningDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'roles' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Role Management & Permissions</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage job definitions, modify raw permissions, and create custom security roles.</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenRoleModal(null)}
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
                >
                  <i className="bi bi-plus-lg text-xs"></i> Add Role
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {customRoles.map(r => (
                <div key={r.id} className="p-5 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <i className="bi bi-shield-lock text-slate-500 text-sm"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{r.permissions}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.rawPermissions.map(p => (
                          <span key={p} className="bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-mono">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-[11px] text-slate-400 font-sans tabular-nums">{r.users} users</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenRoleModal(r)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Edit Role
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'approvals' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white"><i className="bi bi-diagram-3 text-sm"></i></div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Approval Workflow Configuration</div>
                  <div className="text-[11px] text-slate-500">Define who approves requests for each module. Select multiple roles as needed.</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setApprovalSaveSuccess(true);
                  setTimeout(() => setApprovalSaveSuccess(false), 3000);
                }}
                className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
              >
                <i className="bi bi-check2 text-xs"></i> Save Policies
              </button>
            </div>
            {approvalSaveSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <i className="bi bi-check-circle-fill"></i> Approval policies saved successfully.
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {Object.entries(approvalPolicies).map(([module, approvers]) => {
                const icons: Record<string, string> = {
                  'Leave Requests': 'bi bi-calendar-check',
                  'Payroll Processing': 'bi bi-cash-stack',
                  'Expense Claims': 'bi bi-receipt',
                  'Procurement / PO': 'bi bi-cart3',
                  'Recruitment Offers': 'bi bi-person-plus',
                  'Asset Requests': 'bi bi-box-seam',
                };
                const descriptions: Record<string, string> = {
                  'Leave Requests': 'Annual, sick, casual, and maternity leave applications',
                  'Payroll Processing': 'Monthly salary processing and payslip generation',
                  'Expense Claims': 'Employee reimbursements and cost reports',
                  'Procurement / PO': 'Purchase orders and vendor requisitions',
                  'Recruitment Offers': 'Job offers, hiring decisions and onboarding',
                  'Asset Requests': 'Equipment requisitions and asset assignments',
                };
                const availableRoles = [
                  'Department Head',
                  'HR Manager',
                  'HR Officer',
                  'Finance Manager',
                  'Company Admin'
                ];

                const toggleRole = (roleName: string) => {
                  setApprovalPolicies(prev => {
                    const currentList = prev[module] || [];
                    const updated = currentList.includes(roleName)
                      ? currentList.filter(r => r !== roleName)
                      : [...currentList, roleName];
                    return { ...prev, [module]: updated };
                  });
                };

                return (
                  <div key={module} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3 min-w-0 max-w-md">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <i className={`${icons[module] || 'bi bi-gear'} text-slate-500 text-sm`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{module}</div>
                        <div className="text-[11px] text-slate-400 leading-normal mt-0.5">{descriptions[module]}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                      {availableRoles.map(roleOption => {
                        const isSelected = (approvers as string[]).includes(roleOption);
                        return (
                          <button
                            key={roleOption}
                            type="button"
                            onClick={() => toggleRole(roleOption)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border cursor-pointer select-none ${isSelected
                              ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                          >
                            {isSelected && <i className="bi bi-check text-xs"></i>}
                            {roleOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <i className="bi bi-info-circle"></i>
                Authorized roles will be able to review, approve, or reject requests. Company Admin always has override rights.
              </div>
            </div>
          </div>
        )}

        {adminTab === 'settings' && (
          <div className="space-y-6">
            {/* ΓöÇΓöÇ System Settings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">System Settings</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  { title: 'Email Notifications', desc: 'Configure automated email triggers for key ERP events.', icon: 'bi bi-envelope', active: true },
                  { title: 'Two-Factor Authentication', desc: 'Require 2FA for all Company Admin and Manager logins.', icon: 'bi bi-phone', active: false },
                  { title: 'Single Sign-On (SSO)', desc: 'Connect with Google Workspace, Azure AD or Okta.', icon: 'bi bi-key', active: false },
                  { title: 'API Rate Limiting', desc: 'Throttle external API calls to protect platform performance.', icon: 'bi bi-speedometer', active: true },
                  { title: 'Data Backup Schedule', desc: 'Automated nightly backups to encrypted cloud storage.', icon: 'bi bi-cloud-arrow-up', active: true },
                  { title: 'Audit Log Retention', desc: 'Keep audit logs for 12 months (compliance standard).', icon: 'bi bi-journal-text', active: true },
                ].map(s => (
                  <div key={s.title} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><i className={`${s.icon} text-slate-500 text-sm`}></i></div>
                      <div><div className="table-cell-semibold text-slate-900">{s.title}</div><div className="data-value text-slate-500 mt-0.5 leading-snug">{s.desc}</div></div>
                    </div>
                    <div className={`relative h-5 w-9 rounded-full cursor-pointer transition-colors shrink-0 ml-3 mt-0.5 ${s.active ? 'bg-slate-900' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${s.active ? 'left-4' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ΓöÇΓöÇ Add/Edit Role Modal ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSaveRole}>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{editingRole ? 'Edit Permissions' : 'Create Custom Role'}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Assign access scopes and customize permission groups.</p>
                  </div>
                  <button type="button" onClick={() => setShowRoleModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><i className="bi bi-x text-xl"></i></button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label>Role Name *</Label>
                    <Input
                      type="text"
                      value={roleFormName}
                      onChange={e => setRoleFormName(e.target.value)}
                      placeholder="e.g. Compliance Officer, Product Manager"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description / Functional Summary</Label>
                    <textarea
                      value={roleFormDesc}
                      onChange={e => setRoleFormDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="Describe what scope of work users in this role perform..."
                    />
                  </div>

                  <div>
                    <Label>System Permissions Checklists</Label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      {[
                        { key: 'admin_all', label: 'Full Admin Access', desc: 'Absolute system access within tenant' },
                        { key: 'hr_view', label: 'HR Directory View', desc: 'Allows viewing of employee list' },
                        { key: 'hr_edit', label: 'HR Directory Edit', desc: 'Add/manage/dismiss personnel' },
                        { key: 'leave_approve', label: 'Leave Approvals', desc: 'Approve or reject leave requests' },
                        { key: 'attendance_manage', label: 'Attendance Management', desc: 'Manage attendance and logs' },
                        { key: 'payroll_manage', label: 'Payroll Management', desc: 'Process monthly payroll runs' },
                        { key: 'accounting_view', label: 'Accounting Read', desc: 'View financial ledger records' },
                        { key: 'accounting_edit', label: 'Accounting Write', desc: 'Invoices, expenses, journal posts' },
                        { key: 'sales_manage', label: 'CRM & Sales', desc: 'Manage CRM leads, sales logs' },
                        { key: 'inventory_manage', label: 'Inventory & Stock', desc: 'Stock control, warehouse, POs' },
                        { key: 'helpdesk_edit', label: 'Support Operations', desc: 'Manage customer support tickets' }
                      ].map(perm => {
                        const hasPerm = roleFormPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${hasPerm
                              ? 'bg-slate-50 border-slate-900/40 text-slate-900'
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasPerm}
                              onChange={() => {
                                setRoleFormPermissions(prev =>
                                  prev.includes(perm.key)
                                    ? prev.filter(p => p !== perm.key)
                                    : [...prev, perm.key]
                                );
                              }}
                              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/50"
                            />
                            <div>
                              <div className="text-[11px] font-bold">{perm.label}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5 leading-normal">{perm.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button type="button" onClick={() => setShowRoleModal(false)} className="text-xs font-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                  <button type="submit" className="text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Save Role Settings</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

