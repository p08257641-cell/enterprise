import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { modalAlert, toast } from '../../utils/modal';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { isAdminRole, isHRRole, isHRDeptHead } from '../../permissions';

export const AdminView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, users, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onAddBranch, onAddDepartment, onUpdateDepartment, onUpdateCompanySettings, customRoles: propCustomRoles = [], onCreateRole, onUpdateRole, onDeleteRole, onUpdateApprovalPolicies } = props;

  const isAdmin = isAdminRole(selectedUser.activeRole) || isHRRole(selectedUser.activeRole) || isHRDeptHead(selectedUser.activeRole);

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const localBranches = branches.filter(b => b.companyId === selectedCompany.id);

  const [adminTab, setAdminTab] = useState<'branches' | 'departments' | 'users' | 'roles' | 'approvals' | 'settings' | 'evat'>(() => {
    if (activeView === 'admin-users') return 'users';
    if (activeView === 'admin-roles') return 'roles';
    if (activeView === 'admin-branches') return 'branches';
    if (activeView === 'admin-departments') return 'departments';
    if (activeView === 'admin-approvals') return 'approvals';
    if (activeView === 'admin-settings') return 'settings';
    if (activeView === 'admin-evat') return 'evat';
    return 'branches';
  });

  useEffect(() => {
    if (activeView === 'admin-users') setAdminTab('users');
    else if (activeView === 'admin-roles') setAdminTab('roles');
    else if (activeView === 'admin-branches') setAdminTab('branches');
    else if (activeView === 'admin-departments') setAdminTab('departments');
    else if (activeView === 'admin-approvals') setAdminTab('approvals');
    else if (activeView === 'admin-settings') setAdminTab('settings');
    else if (activeView === 'admin-evat') setAdminTab('evat');
  }, [activeView]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviteRoles, setInviteRoles] = useState<string[]>(['Employee']);
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [inviteBranch, setInviteBranch] = useState('HQ');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const branchModal = useRowModal<typeof localBranches[0]>();
  const deptModal = useRowModal<typeof departments[0] & { managerName: string; parentName: string }>();
  const userModal = useRowModal<typeof localEmployees[0]>();

  const [approvalPolicies, setApprovalPolicies] = useState<Record<string, string[]>>({
    'Leave Requests': ['HR Department Head', 'HR Manager', 'Company Admin'],
    'Payroll Processing': ['HR Manager', 'Finance Department Head', 'Company Admin'],
    'Expense Claims': ['Finance Manager', 'Finance Department Head', 'Company Admin'],
    'Procurement / PO': ['Finance Manager', 'Operations Department Head', 'Company Admin'],
    'Recruitment Offers': ['HR Department Head', 'HR Manager'],
    'Asset Requests': ['Company Admin', 'Operations Department Head'],
    'Role Management': ['HR Manager', 'HR Department Head', 'HR Officer', 'Company Admin'],
  });
  const [approvalSaveSuccess, setApprovalSaveSuccess] = useState(false);
  const [openWorkflowDropdown, setOpenWorkflowDropdown] = useState<string | null>(null);

  const [editDeptModal, setEditDeptModal] = useState<{ id: string; name: string; managerId: string; budget: number; parentId?: string } | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptManager, setEditDeptManager] = useState('');
  const [editDeptBudget, setEditDeptBudget] = useState('');
  const [editDeptParent, setEditDeptParent] = useState('');

  // Roles are DB-backed via props.customRoles — filter to current company
  const customRoles = propCustomRoles.filter(r => r.companyId === selectedCompany.id);

  // Count users assigned to a role (checks user.role, activeRole and roles array)
  const countUsersForRole = (roleName: string) => {
    const companyUsers = (users || []).filter(u => u.companyId === selectedCompany.id);
    return companyUsers.filter(u =>
      u.role === roleName || u.activeRole === roleName || (Array.isArray(u.roles) && u.roles.includes(roleName))
    ).length;
  };

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<import('../../types').CustomRole | null>(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormModules, setRoleFormModules] = useState<string[]>([]);
  const [roleFormCrudPermissions, setRoleFormCrudPermissions] = useState<string[]>([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchType, setBranchType] = useState('Regional');
  const [showDeptModal, setShowDeptModal] = useState(false);
const [deptName, setDeptName] = useState('');
const [deptManager, setDeptManager] = useState('');
const [deptParent, setDeptParent] = useState('');

  const handleOpenRoleModal = (roleToEdit: import('../../types').CustomRole | null) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleFormName(roleToEdit.name);
      setRoleFormDesc(roleToEdit.description);
      setRoleFormModules(roleToEdit.modules || []);
      setRoleFormCrudPermissions(roleToEdit.crudPermissions || []);
    } else {
      setEditingRole(null);
      setRoleFormName('');
      setRoleFormDesc('');
      setRoleFormModules([]);
      setRoleFormCrudPermissions([]);
    }
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;

    if (editingRole) {
      await onUpdateRole(editingRole.id, {
        name: roleFormName.trim(),
        description: roleFormDesc,
        modules: roleFormModules,
        crudPermissions: roleFormCrudPermissions,
      });
    } else {
      await onCreateRole({
        name: roleFormName.trim(),
        description: roleFormDesc,
        modules: roleFormModules,
        crudPermissions: roleFormCrudPermissions,
        submenus: [],
      });
    }
    setShowRoleModal(false);
  };

  const depts = ['Engineering', 'Operations', 'Finance', 'HR', 'Sales', 'IT', 'Legal'];

  return (
      <div>
        <PageHeader title="Administration" subtitle="Company configuration, branch management, users, roles and system settings." />

        {adminTab === 'branches' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="section-title text-slate-900">Branch Locations</h3>
              <div className="flex items-center gap-2.5">
                {isAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setBranchName(''); setBranchLocation(''); setShowBranchModal(true); }}>Add Branch</PrimaryBtn>}
              </div>
            </div>
            <table className="w-full text-left">
              <TableHead cols={[{ label: 'Branch Name' }, { label: 'Location' }, { label: 'Type' }, { label: 'Employees' }, { label: 'Status' }, { label: '' }]} />
              <tbody className="divide-y divide-slate-100">
                {localBranches.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center fs-xs text-slate-400">No branches yet. Click “Add Branch” to create one.</td></tr>
                )}
                {localBranches.filter(b => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || (b.location || '').toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3.5"><div className="data-value fw-semibold text-slate-900">{b.name}</div></td>
                    <td className="px-4 py-3.5 data-value text-slate-500">{b.location}</td>
                    <td className="px-4 py-3.5"><Badge label={b.isMain ? 'Main HQ' : 'Regional'} /></td>
                    <td className="px-4 py-3.5 data-value font-sans tabular-nums text-slate-700">{localEmployees.filter(e => e.branch === b.name).length}</td>
                    <td className="px-4 py-3.5"><Badge label="Active" variant="success" /></td>
                    <td className="px-4 py-3.5 text-right">
                      <button type="button" onClick={() => branchModal.open(b)} className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer ml-auto bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <i className="bi bi-eye fs-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {adminTab === 'departments' && (() => {
          const companyDepts = departments.filter(d => d.companyId === selectedCompany.id);
          const getDeptName = (id?: string) => companyDepts.find(d => d.id === id)?.name;

          return (
            <div className="space-y-6">
              {/* Department Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="fs-sm fw-bold text-slate-900">Department Structure</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure reporting hierarchy and department assignments.</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {isAdmin && <PrimaryBtn icon="bi bi-plus-lg" onClick={() => { setDeptName(''); setDeptManager(''); setDeptParent(''); setShowDeptModal(true); }}>Add Department</PrimaryBtn>}
                  </div>
                </div>
                <table className="w-full text-left">
                  <TableHead cols={[{ label: 'Department' }, { label: 'Reports To' }, { label: 'Head Count' }, { label: 'Budget' }, { label: 'Manager' }, { label: '' }]} />
                  <tbody className="divide-y divide-slate-100">
                    {companyDepts.filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(dept => {
                      const manager = localEmployees.find(e => e.userId === dept.managerId);
                      const parentName = getDeptName(dept.parentId);
                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className={`h-7 w-7 rounded-md flex shrink-0 items-center justify-center border transition-all ${
                                !dept.parentId 
                                  ? 'bg-indigo-50 border-indigo-100/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
                                  : 'bg-slate-50 border-slate-100/50'
                              }`}>
                                <i className={`fs-sm ${!dept.parentId ? 'bi bi-diagram-3 text-indigo-500' : 'bi bi-folder2 text-slate-400'}`}></i>
                              </div>
                              <span className="fs-sm fw-semibold text-slate-900">{dept.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="fs-sm text-slate-500">{parentName || '— Root'}</span>
                          </td>
                          <td className="px-4 py-3.5 fs-sm font-sans tabular-nums text-slate-700">{dept.employeeCount} staff</td>
                          <td className="px-4 py-3.5 fs-sm font-sans tabular-nums text-slate-700">${dept.budget.toLocaleString()}</td>
                          <td className="px-4 py-3.5 fs-sm text-slate-600">
                            {manager ? `${manager.firstName} ${manager.lastName}` : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right flex items-center justify-end gap-1.5">
                            <button type="button" onClick={() => deptModal.open({ ...dept, managerName: manager ? `${manager.firstName} ${manager.lastName}` : '—', parentName: parentName || '— Root' })} className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <i className="bi bi-eye fs-xs"></i>
                            </button>
                            {isAdmin && (
                              <button onClick={() => { setEditDeptModal({ id: dept.id, name: dept.name, managerId: dept.managerId || '', budget: dept.budget, parentId: dept.parentId }); setEditDeptName(dept.name); setEditDeptManager(dept.managerId || ''); setEditDeptBudget(String(dept.budget)); setEditDeptParent(dept.parentId || ''); }} className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <i className="bi bi-pencil fs-xs"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Branch Modal */}
              {showBranchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowBranchModal(false)}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <i className="bi bi-building text-blue-600 fs-xs"></i>
                          </div>
                          <h3 className="fs-sm fw-bold text-slate-900">Add Branch</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Create a new company location, office or facility.</p>
                      </div>
                      <button type="button" onClick={() => setShowBranchModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <i className="bi bi-x fs-xl"></i>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div><Label>Branch Name *</Label><Input value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Accra Branch" /></div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Location</Label><Input value={branchLocation} onChange={e => setBranchLocation(e.target.value)} placeholder="Accra, Ghana" /></div>
                        <div><Label>Type</Label><Select value={branchType} onChange={e => setBranchType(e.target.value)}><option>Main HQ</option><option>Regional</option><option>Plant</option><option>Warehouse</option></Select></div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button type="button" onClick={() => setShowBranchModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                      <button type="button" onClick={() => {
                        if (!branchName) return void modalAlert('Branch name required', { variant: 'warning' });
                        onAddBranch({ companyId: selectedCompany.id, name: branchName, location: branchLocation, isMain: branchType === 'Main HQ' });
                        setShowBranchModal(false); setBranchName('');
                      }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Branch</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Department Modal */}
              {showDeptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setShowDeptModal(false)}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                            <i className="bi bi-diagram-3 text-violet-600 fs-xs"></i>
                          </div>
                          <h3 className="fs-sm fw-bold text-slate-900">Add Department</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Create a new organisational unit within this company.</p>
                      </div>
                      <button type="button" onClick={() => setShowDeptModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <i className="bi bi-x fs-xl"></i>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div><Label>Department Name *</Label><Input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="Operations" /></div>
                      <div><Label>Manager</Label><Input value={deptManager} onChange={e => setDeptManager(e.target.value)} placeholder="Manager name" /></div>
                      <div><Label>Reports To</Label><Select value={deptParent} onChange={e => setDeptParent(e.target.value)}><option value="">Top Level (no parent)</option>{companyDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button type="button" onClick={() => setShowDeptModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                      <button type="button" onClick={() => {
                        if (!deptName) return void modalAlert('Department name required', { variant: 'warning' });
                        onAddDepartment({ companyId: selectedCompany.id, name: deptName, managerId: '', budget: 0, parentId: deptParent || undefined });
                        setShowDeptModal(false); setDeptName('');
                      }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Create Department</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Department Modal */}
              {editDeptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={() => setEditDeptModal(null)}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                            <i className="bi bi-pencil text-violet-600 fs-xs"></i>
                          </div>
                          <h3 className="fs-sm fw-bold text-slate-900">Edit Department</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 ml-9">Update this department's name, manager, and budget.</p>
                      </div>
                      <button type="button" onClick={() => setEditDeptModal(null)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <i className="bi bi-x fs-xl"></i>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div><Label>Department Name *</Label><Input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} /></div>
                      <div><Label>Manager</Label><Select value={editDeptManager} onChange={e => setEditDeptManager(e.target.value)}><option value="">Unassigned</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</Select></div>
                      <div><Label>Reports To</Label><Select value={editDeptParent} onChange={e => setEditDeptParent(e.target.value)}><option value="">Top Level (no parent)</option>{companyDepts.filter(d => editDeptModal ? d.id !== editDeptModal.id : true).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
                      <div><Label>Budget</Label><Input type="number" value={editDeptBudget} onChange={e => setEditDeptBudget(e.target.value)} /></div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button type="button" onClick={() => setEditDeptModal(null)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                      <button type="button" onClick={() => {
                        if (!editDeptName) return void modalAlert('Department name required', { variant: 'warning' });
                        onUpdateDepartment(editDeptModal.id, { name: editDeptName, managerId: editDeptManager || undefined, budget: Number(editDeptBudget), parentId: editDeptParent || undefined });
                        setEditDeptModal(null);
                      }} className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {adminTab === 'users' && (
          <div className="space-y-4">


            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-slate-900">System Users</h3>
              </div>
              <table className="w-full text-left">
                <TableHead cols={[{ label: 'User' }, { label: 'Active Role' }, { label: 'All Roles' }, { label: 'Department' }, { label: 'Status' }, { label: 'Joined' }, { label: '' }]} />
                <tbody className="divide-y divide-slate-100">
                  {localEmployees.filter(e => !searchTerm || `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center avatar-text text-slate-700">{emp.firstName[0]}{emp.lastName[0]}</div>
                          <div><div className="table-cell-semibold text-slate-900">{emp.firstName} {emp.lastName}</div><div className="data-value-small text-slate-400">{emp.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 fs-xs text-slate-600">{emp.designation}</td>
                      <td className="px-4 py-3.5 fs-xs text-slate-500">{emp.designation}</td>
                      <td className="px-4 py-3.5 table-cell text-slate-600">{emp.department}</td>
                      <td className="px-4 py-3.5"><Badge label={emp.status} variant={emp.status === 'Active' ? 'success' : 'warning'} /></td>
                      <td className="px-4 py-3.5 table-cell-mono text-slate-400">{emp.joiningDate}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button type="button" onClick={() => userModal.open(emp)} className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer ml-auto bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <i className="bi bi-eye fs-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'roles' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900">Role Management</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Define roles and assign granular CRUD permissions.</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenRoleModal(null)}
                  className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-3.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
                >
                  <i className="bi bi-plus-lg fs-xs"></i> Add Role
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {customRoles.length === 0 && (
                <div className="px-5 py-8 text-center text-[11px] text-slate-400">No roles found. Click "Add Role" to create one.</div>
              )}
              {customRoles.map(r => {
                const userCount = countUsersForRole(r.name);
                const crudByModule = (r.crudPermissions || []).reduce((acc: any, p: string) => {
                  const [mod, action] = p.split('.');
                  if (!acc[mod]) acc[mod] = [];
                  acc[mod].push(action);
                  return acc;
                }, {});
                return (
                  <div key={r.id} className="p-5 flex items-start justify-between hover:bg-slate-50/40 transition-colors gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${r.isSystem ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        <i className={`bi bi-shield-lock ${r.isSystem ? 'text-white' : 'text-slate-500'} fs-sm`}></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="fs-sm fw-bold text-slate-900">{r.name}</span>
                          {r.isSystem && <span className="bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 text-[9px] font-mono">built-in</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{r.description || 'No description'}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(r.modules || []).slice(0, 8).map(m => (
                            <span key={m} className="bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-mono">{m}</span>
                          ))}
                          {(r.modules || []).length > 8 && (
                            <span className="text-[9px] text-slate-400">+{(r.modules || []).length - 8} more</span>
                          )}
                        </div>
                        {Object.keys(crudByModule).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(crudByModule).map(([mod, actions]: [string, any]) => (
                              <div key={mod} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                                <span className="text-[9px] font-mono fw-bold text-slate-500">{mod}</span>
                                <span className="text-slate-300">|</span>
                                <div className="flex gap-0.5">
                                  {['Create','Read','Update','Delete'].map(a => (
                                    <span key={a} className={`text-[9px] px-1 py-0 rounded-sm fw-semibold ${actions.includes(a) ? 'text-slate-900 bg-slate-200/60' : 'text-slate-300'}`}>{a[0]}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2 pt-0.5">
                      <span className="text-[11px] text-slate-400 font-sans tabular-nums whitespace-nowrap">{userCount} user{userCount !== 1 ? 's' : ''}</span>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenRoleModal(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-slate-600 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                          >
                            <i className="bi bi-pencil text-[11px]"></i>
                          </button>
                          {!r.isSystem && r.name !== 'Employee' && userCount === 0 && onDeleteRole && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete role "${r.name}"? This cannot be undone.`)) {
                                  await onDeleteRole(r.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 text-red-500 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                            >
                              <i className="bi bi-trash text-[11px]"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {adminTab === 'approvals' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white"><i className="bi bi-diagram-3 fs-sm"></i></div>
                <div>
                  <div className="fs-sm fw-bold text-slate-900">Approval Workflow Configuration</div>
                  <div className="text-[11px] text-slate-500">Define who approves requests for each module. Select multiple roles as needed.</div>
                </div>
              </div>
              <button
                onClick={() => {
                  const policiesToSave = Object.entries(approvalPolicies).map(([module, approverRoles]) => ({
                    module,
                    description: '',
                    approverRoles,
                    enabled: true,
                  }));
                  onUpdateApprovalPolicies(policiesToSave);
                  setApprovalSaveSuccess(true);
                  setTimeout(() => setApprovalSaveSuccess(false), 3000);
                }}
                className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
              >
                <i className="bi bi-check2 fs-xs"></i> Save Policies
              </button>
            </div>
            {approvalSaveSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 fs-xs text-emerald-700 fw-semibold">
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
                  'Role Management': 'bi bi-shield-lock',
                };
                const descriptions: Record<string, string> = {
                  'Leave Requests': 'Annual, sick, casual, and maternity leave applications',
                  'Payroll Processing': 'Monthly salary processing and payslip generation',
                  'Expense Claims': 'Employee reimbursements and cost reports',
                  'Procurement / PO': 'Purchase orders and vendor requisitions',
                  'Recruitment Offers': 'Job offers, hiring decisions and onboarding',
                  'Asset Requests': 'Equipment requisitions and asset assignments',
                  'Role Management': 'Create, update, or delete roles and permission sets',
                };
                const availableRoles = [
                  'HR Department Head',
                  'Sales Department Head',
                  'Finance Department Head',
                  'Operations Department Head',
                  'IT Department Head',
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
                        <i className={`${icons[module] || 'bi bi-gear'} text-slate-500 fs-sm`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="fs-sm fw-semibold text-slate-900">{module}</div>
                        <div className="text-[11px] text-slate-400 leading-normal mt-0.5">{descriptions[module]}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 max-w-[280px] sm:max-w-md justify-end">
                      {(approvers as string[]).map(role => (
                        <div key={role} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-[10px] fw-bold bg-slate-900 text-white shadow-xs">
                          {role}
                          <button type="button" onClick={() => toggleRole(role)} className="h-4 w-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors cursor-pointer text-white shrink-0">
                            <i className="bi bi-x fs-[9px]"></i>
                          </button>
                        </div>
                      ))}
                      
                      <div className="relative">
                        <button type="button" onClick={() => setOpenWorkflowDropdown(openWorkflowDropdown === module ? null : module)} className="h-7 w-7 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer bg-white shrink-0">
                          <i className="bi bi-plus-lg fs-xs"></i>
                        </button>
                        {openWorkflowDropdown === module && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenWorkflowDropdown(null)}></div>
                            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 max-h-64 overflow-y-auto">
                              <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                                <span className="fs-[10px] fw-bold text-slate-400 uppercase tracking-wider">Add Approver</span>
                                <button type="button" onClick={() => setOpenWorkflowDropdown(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer h-5 w-5 flex items-center justify-center rounded hover:bg-slate-50"><i className="bi bi-x"></i></button>
                              </div>
                              {availableRoles.filter(r => !(approvers as string[]).includes(r)).length === 0 ? (
                                <div className="px-3 py-2 fs-xs text-slate-500 italic">All roles added</div>
                              ) : (
                                availableRoles.filter(r => !(approvers as string[]).includes(r)).map(roleOption => (
                                  <button
                                    key={roleOption}
                                    type="button"
                                    onClick={() => { toggleRole(roleOption); setOpenWorkflowDropdown(null); }}
                                    className="w-full text-left px-3 py-2 fs-xs fw-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                                  >
                                    <i className="bi bi-person-plus text-slate-400"></i>
                                    {roleOption}
                                  </button>
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
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
            {/* Company Identity: Logo & Signature */}
            <div>
              <h3 className="section-title text-slate-900 mb-4">Company Identity</h3>
              <p className="fs-xs text-slate-500 mb-4">Upload your company logo and authorized signature. These will appear on official letters and documents generated by HR.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <h4 className="fs-sm fw-bold text-slate-900 mb-3">Company Logo</h4>
                  {selectedCompany.companyLogo ? (
                    <div className="mb-3">
                      <div className="h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        <img src={selectedCompany.companyLogo} alt="Company Logo" className="max-h-20 max-w-full object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                      <div className="text-center"><i className="bi bi-image fs-2xl text-slate-300"></i><p className="text-[10px] text-slate-400 mt-1">No logo uploaded</p></div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mb-2">Paste an image URL or upload a file:</p>
                  <div className="space-y-2">
                    <input type="text" placeholder="https://example.com/logo.png" defaultValue={selectedCompany.companyLogo || ''} id="logoUrl" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none" />
                    <input type="file" accept="image/*" id="logoFile" className="w-full fs-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:fs-xs file:fw-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-700 file:cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        onUpdateCompanySettings(selectedCompany.id, { companyLogo: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <PrimaryBtn onClick={() => {
                      const url = (document.getElementById('logoUrl') as HTMLInputElement)?.value;
                      if (url) onUpdateCompanySettings(selectedCompany.id, { companyLogo: url });
                    }} icon="bi bi-check-lg">Save URL</PrimaryBtn>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <h4 className="fs-sm fw-bold text-slate-900 mb-3">Authorized Signature</h4>
                  {selectedCompany.companySignature ? (
                    <div className="mb-3">
                      <div className="h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        <img src={selectedCompany.companySignature} alt="Signature" className="max-h-20 max-w-full object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                      <div className="text-center"><i className="bi bi-pen fs-2xl text-slate-300"></i><p className="text-[10px] text-slate-400 mt-1">No signature uploaded</p></div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mb-2">Paste an image URL or upload a file:</p>
                  <div className="space-y-2">
                    <input type="text" placeholder="https://example.com/signature.png" defaultValue={selectedCompany.companySignature || ''} id="sigUrl" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none" />
                    <input type="file" accept="image/*" id="sigFile" className="w-full fs-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:fs-xs file:fw-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-700 file:cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        onUpdateCompanySettings(selectedCompany.id, { companySignature: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <PrimaryBtn onClick={() => {
                      const url = (document.getElementById('sigUrl') as HTMLInputElement)?.value;
                      if (url) onUpdateCompanySettings(selectedCompany.id, { companySignature: url });
                    }} icon="bi bi-check-lg">Save URL</PrimaryBtn>
                    </div>
                  </div>

                  <div>
                    <Label>CRUD Permissions</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Choose one CRUD action per module (or none).</p>
                    <div className="space-y-2">
                      {roleFormModules.length === 0 && <p className="text-[11px] text-slate-400 italic">Select modules above to configure CRUD permissions.</p>}
                      {roleFormModules.map(mod => {
                        const crudActions = ['Create', 'Read', 'Update', 'Delete'];
                        const current = crudActions.find(a => roleFormCrudPermissions.includes(`${mod}.${a}`));
                        return (
                          <div key={mod} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white">
                            <span className="text-[11px] fw-bold text-slate-700 w-24 shrink-0">{mod}</span>
                            <div className="flex gap-1.5">
                              {crudActions.map(action => {
                                const perm = `${mod}.${action}`;
                                const checked = roleFormCrudPermissions.includes(perm);
                                return (
                                  <label
                                    key={perm}
                                    className={`px-2.5 py-1 rounded-md border text-[10px] fw-semibold cursor-pointer transition-all ${checked
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                      }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`crud-${mod}`}
                                      checked={checked}
                                      onChange={() => setRoleFormCrudPermissions(prev => [...prev.filter(p => !p.startsWith(`${mod}.`)), perm])}
                                      className="sr-only"
                                    />
                                    {action}
                                  </label>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => setRoleFormCrudPermissions(prev => prev.filter(p => !p.startsWith(`${mod}.`)))}
                                className={`px-2.5 py-1 rounded-md border text-[10px] fw-semibold cursor-pointer transition-all ${!current ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                              >
                                None
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  </div>

                  <div>
                    <Label>CRUD Permissions</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Choose one action per module (or None).</p>
                    <div className="space-y-1.5">
                      {roleFormModules.length === 0 && <p className="text-[11px] text-slate-400 italic">Select modules above first.</p>}
                      {roleFormModules.map(mod => {
                        const crudActions = ['Create', 'Read', 'Update', 'Delete'];
                        const current = crudActions.find(a => roleFormCrudPermissions.includes(`${mod}.${a}`));
                        return (
                          <div key={mod} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
                            <span className="text-[10px] fw-bold text-slate-700 w-20 shrink-0">{mod}</span>
                            <div className="flex gap-1">
                              {crudActions.map(action => {
                                const perm = `${mod}.${action}`;
                                const checked = roleFormCrudPermissions.includes(perm);
                                return (
                                  <label
                                    key={perm}
                                    className={`px-2 py-0.5 rounded border text-[9px] fw-semibold cursor-pointer transition-all ${checked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                  >
                                    <input type="radio" name={`crud-${mod}`} checked={checked} onChange={() => setRoleFormCrudPermissions(prev => [...prev.filter(p => !p.startsWith(`${mod}.`)), perm])} className="sr-only" />
                                    {action}
                                  </label>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => setRoleFormCrudPermissions(prev => prev.filter(p => !p.startsWith(`${mod}.`)))}
                                className={`px-2 py-0.5 rounded border text-[9px] fw-semibold cursor-pointer transition-all ${!current ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                              >
                                None
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

            {/* System Settings */}
            <div>
              <h3 className="section-title text-slate-900 mb-4">System Settings</h3>
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
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><i className={`${s.icon} text-slate-500 fs-sm`}></i></div>
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

        {adminTab === 'evat' && (
          <EvatSettingsView selectedCompany={selectedCompany} searchTerm={searchTerm} />
        )}

        {/* ── Add/Edit Role Modal ──────────────────────────────────── */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSaveRole}>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${editingRole ? 'bg-violet-500' : 'bg-slate-900'}`}>
                      <i className={`bi ${editingRole ? 'bi-pencil' : 'bi-plus-lg'} text-white fs-sm`}></i>
                    </div>
                    <div>
                      <h3 className="fs-sm fw-bold text-slate-900">{editingRole ? `Edit ${editingRole.name}` : 'Create Custom Role'}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{editingRole ? 'Modify modules and CRUD permissions.' : 'Define a new role with custom access scopes.'}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowRoleModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><i className="bi bi-x fs-xl"></i></button>
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="Describe what scope of work users in this role perform..."
                    />
                  </div>

                  <div>
                    <Label>Module Access</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Select which ERP modules this role can access.</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {['HR', 'Accounting', 'CRM', 'Operations', 'Administration', 'Help Desk', 'Payroll', 'Sales', 'Procurement', 'Compliance'].map(mod => {
                        const hasModule = roleFormModules.includes(mod);
                        return (
                          <label
                            key={mod}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${hasModule
                              ? 'bg-slate-50 border-slate-900/40 text-slate-900'
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasModule}
                              onChange={() => {
                                setRoleFormModules(prev =>
                                  prev.includes(mod)
                                    ? prev.filter(m => m !== mod)
                                    : [...prev, mod]
                                );
                              }}
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900/50"
                            />
                            <div className="text-[11px] fw-bold">{mod}</div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>CRUD Permissions</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Select any combination of Create, Read, Update, Delete per module.</p>
                    <div className="space-y-1.5">
                      {roleFormModules.length === 0 && <p className="text-[11px] text-slate-400 italic">Select modules above first.</p>}
                      {roleFormModules.map(mod => {
                        const crudActions = ['Create', 'Read', 'Update', 'Delete'];
                        return (
                          <div key={mod} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
                            <span className="text-[10px] fw-bold text-slate-700 w-20 shrink-0">{mod}</span>
                            <div className="flex gap-1">
                              {crudActions.map(action => {
                                const perm = `${mod}.${action}`;
                                const checked = roleFormCrudPermissions.includes(perm);
                                return (
                                  <label
                                    key={perm}
                                    className={`px-2 py-0.5 rounded border text-[9px] fw-semibold cursor-pointer transition-all ${checked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        setRoleFormCrudPermissions(prev =>
                                          prev.includes(perm)
                                            ? prev.filter(p => p !== perm)
                                            : [...prev, perm]
                                        );
                                      }}
                                      className="sr-only"
                                    />
                                    {action}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button type="button" onClick={() => setShowRoleModal(false)} className="fs-xs fw-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-all">Cancel</button>
                  <button type="submit" className="fs-xs fw-semibold bg-slate-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs">{editingRole ? 'Save Changes' : 'Create Role'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      {branchModal.selected && (
        <RowModal row={branchModal.selected}
          icon="bi bi-geo-alt" accentColor="#0f766e"
          fields={[
            { label: 'Branch', key: 'name', icon: 'bi bi-building' },
            { label: 'Location', key: 'location', icon: 'bi bi-geo-alt' },
            { label: 'Type', key: 'isMain', format: (v: boolean) => v ? 'Main HQ' : 'Regional', icon: 'bi bi-diagram-3', section: 'Details' },
            { label: 'Employees', key: 'id', format: (v: any) => `${localEmployees.filter(e => e.branch === branchModal.selected.name).length}`, icon: 'bi bi-people', section: 'Details' },
            { label: 'Status', key: 'id', format: () => 'Active', icon: 'bi bi-flag', section: 'Details' },
          ]}
          title={r => r.name} subtitle={r => r.location}
          onClose={branchModal.close} />
      )}
      {deptModal.selected && (
        <RowModal row={deptModal.selected}
          icon="bi bi-diagram-3" accentColor="#7c3aed"
          fields={[
            { label: 'Department', key: 'name', icon: 'bi bi-collection' },
            { label: 'Manager', key: 'managerName', icon: 'bi bi-person-vcard', section: 'Details' },
            { label: 'Reports To', key: 'parentName', icon: 'bi bi-arrow-up-right', section: 'Details' },
            { label: 'Head Count', key: 'employeeCount', format: (v: number) => `${v} staff`, icon: 'bi bi-people', section: 'Details' },
            { label: 'Budget', key: 'budget', format: (v: number) => `$${v.toLocaleString()}`, icon: 'bi bi-cash', section: 'Details' },
          ]}
          title={r => r.name} subtitle={r => 'Department Details'}
          onClose={deptModal.close} />
      )}
      {userModal.selected && (
        <ViewModal title={`${userModal.selected.firstName} ${userModal.selected.lastName}`} subtitle={userModal.selected.email} onClose={userModal.close}>
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 -mt-1"
            style={{ background: '#2563eb0d', border: '1px solid #2563eb1f' }}
          >
            <div
              className="h-11 w-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: '#2563eb' }}
            >
              <i className="bi bi-person-badge fs-lg" />
            </div>
            <div className="min-w-0">
              <div className="fs-sm fw-bold text-slate-900 truncate">{userModal.selected.firstName} {userModal.selected.lastName}</div>
              <div className="fs-xs text-slate-500 truncate">{userModal.selected.designation}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Email', value: userModal.selected.email, icon: 'bi bi-envelope' },
              { label: 'Active Role', value: userModal.selected.designation, icon: 'bi bi-stars' },
              { label: 'Department', value: userModal.selected.department, icon: 'bi bi-collection' },
              { label: 'Branch', value: userModal.selected.branch, icon: 'bi bi-geo-alt' },
              { label: 'Status', value: userModal.selected.status, icon: 'bi bi-flag' },
              { label: 'Joined', value: userModal.selected.joiningDate, icon: 'bi bi-calendar-event' },
              { label: 'Employee #', value: userModal.selected.employeeNumber, icon: 'bi bi-hash' },
            ].map(f => (
              <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center gap-1.5 data-value-small text-slate-400 mb-1"><i className={`${f.icon} text-[10px]`} />{f.label}</div>
                <div className="data-value fw-semibold text-slate-900">{f.value}</div>
              </div>
            ))}
          </div>
        </ViewModal>
      )}
    </div>
  );
};

const EvatSettingsView: React.FC<{ selectedCompany: any, searchTerm: string }> = ({ selectedCompany, searchTerm }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState({
    companyTin: '',
    companyName: '',
    securityKey: '',
    apiMode: 'test' as 'test' | 'production',
    isActive: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/evat/config?companyId=${selectedCompany.id}`);
        const data = await res.json();
        if (data && data.companyTin) {
          setConfig(data);
          setForm({
            companyTin: data.companyTin || '',
            companyName: data.companyName || '',
            securityKey: data.securityKey || '',
            apiMode: data.apiMode || 'test',
            isActive: data.isActive !== false,
          });
        }
        const subRes = await fetch(`/api/evat/submissions?companyId=${selectedCompany.id}`);
        const subData = await subRes.json();
        if (Array.isArray(subData)) setSubmissions(subData);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [selectedCompany.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/evat/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId: selectedCompany.id }),
      });
      const data = await res.json();
      if (data.error) return toast(data.error, 'error');
      setConfig(data);
      toast('E-VAT configuration saved', 'success');
    } catch (e: any) { toast(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/evat/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id }),
      });
      const data = await res.json();
      if (data.success) setTestResult({ ok: true, message: data.message || 'Connection successful' });
      else setTestResult({ ok: false, message: data.error || 'Connection failed' });
    } catch { setTestResult({ ok: false, message: 'Network error' }); }
    setTesting(false);
  };

  if (loading) return <div className="p-6 text-[11px] text-slate-400">Loading E-VAT configuration...</div>;

  return (
    <div className="space-y-5 p-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="fs-sm fw-bold text-slate-900">GRA E-VAT Credentials</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Configure your Ghana Revenue Authority E-VAT API credentials.</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company TIN *</Label>
              <Input type="text" value={form.companyTin} onChange={e => setForm(f => ({ ...f, companyTin: e.target.value }))} placeholder="e.g. C000123456789" />
            </div>
            <div>
              <Label>Company Legal Name *</Label>
              <Input type="text" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Registered business name" />
            </div>
          </div>
          <div>
            <Label>Security Key *</Label>
            <Input type="password" value={form.securityKey} onChange={e => setForm(f => ({ ...f, securityKey: e.target.value }))} placeholder="GRA API security key" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Label>API Mode</Label>
              <label className={`px-3 py-1.5 rounded-lg border text-[11px] fw-semibold cursor-pointer transition-all ${form.apiMode === 'test' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white text-slate-400 border-slate-200'}`}>
                <input type="radio" name="apiMode" checked={form.apiMode === 'test'} onChange={() => setForm(f => ({ ...f, apiMode: 'test' }))} className="sr-only" />
                Test (Sandbox)
              </label>
              <label className={`px-3 py-1.5 rounded-lg border text-[11px] fw-semibold cursor-pointer transition-all ${form.apiMode === 'production' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white text-slate-400 border-slate-200'}`}>
                <input type="radio" name="apiMode" checked={form.apiMode === 'production'} onChange={() => setForm(f => ({ ...f, apiMode: 'production' }))} className="sr-only" />
                Production (Live)
              </label>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`relative h-5 w-9 rounded-full cursor-pointer transition-colors ${form.isActive ? 'bg-slate-900' : 'bg-slate-200'}`} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-4' : 'left-0.5'}`}></div>
              </div>
              <span className="text-[11px] text-slate-600">E-VAT Active</span>
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-slate-900 text-white fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button onClick={handleTest} disabled={testing} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 fw-semibold fs-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all disabled:opacity-50">
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
          {testResult && (
            <div className={`p-3 rounded-lg border text-[11px] fw-semibold flex items-center gap-2 ${testResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <i className={`bi ${testResult.ok ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="fs-sm fw-bold text-slate-900">E-VAT Submission History</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Recent submissions to GRA.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Entity', 'Number', 'IRN', 'Status', 'Submitted', 'Error'].map(h => <th key={h} className="text-left px-4 py-3 text-[10px] fw-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {submissions.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-[11px] text-slate-400">No submissions yet.</td></tr>}
              {submissions.filter((s: any) => !searchTerm || s.entityNumber.includes(searchTerm) || (s.irn || '').includes(searchTerm)).map((s: any) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="px-4 py-2.5 text-[11px] text-slate-600">{s.entityType}</td>
                  <td className="px-4 py-2.5 text-[11px] font-mono text-slate-900">{s.entityNumber}</td>
                  <td className="px-4 py-2.5 text-[11px] font-mono text-slate-600">{s.irn || '—'}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] fw-semibold ${
                    s.status === 'Validated' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'Failed' ? 'bg-red-100 text-red-600' :
                    s.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{s.status}</span></td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2.5 text-[11px] text-red-500 max-w-[200px] truncate">{s.errorMessage || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

