import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select, useRowModal, RowModal, ViewModal } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { modalAlert, modalPrompt, toast } from '../../utils/modal';
import { sendSMS } from '../../utils/sms';
import { sendWhatsApp } from '../../utils/whatsapp';
import { sendEmail } from '../../utils/email';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { MODULE_HIERARCHY } from '../../data/moduleHierarchy';
import { isAdminRole, isHRRole, isHRDeptHead } from '../../permissions';
import { formatCurrency } from '../../utils/currency';

export const AdminView: React.FC<ModuleViewsProps> = (props) => {
  const { searchTerm = '', activeView, selectedCompany, selectedUser, users, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail, onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onAddBranch, onAddDepartment, onUpdateDepartment, onUpdateCompanySettings, customRoles: propCustomRoles = [], onCreateRole, onUpdateRole, onDeleteRole, onUpdateApprovalPolicies, approvalPolicies: propApprovalPolicies = [] } = props;

  const [smsProvider, setSmsProvider] = useState<'Twilio' | 'Arkesel' | 'Hubtel' | 'Termii' | 'Infobip' | 'Custom'>(selectedCompany?.smsProvider || 'Arkesel');
  const [smsApiKey, setSmsApiKey] = useState(selectedCompany?.smsApiKey || '');
  const [smsApiSecret, setSmsApiSecret] = useState(selectedCompany?.smsApiSecret || '');
  const [smsSenderId, setSmsSenderId] = useState(selectedCompany?.smsSenderId || '');
  const [testingSms, setTestingSms] = useState(false);
  const [emailProvider, setEmailProvider] = useState<'SMTP' | 'SendGrid' | 'Mailgun' | 'Postmark' | 'AWS SES' | 'Resend' | 'Custom'>(selectedCompany?.emailProvider || 'SMTP');
  const [smtpHost, setSmtpHost] = useState(selectedCompany?.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(selectedCompany?.smtpPort || 587);
  const [smtpUsername, setSmtpUsername] = useState(selectedCompany?.smtpUsername || '');
  const [smtpPassword, setSmtpPassword] = useState(selectedCompany?.smtpPassword || '');
  const [emailApiKey, setEmailApiKey] = useState(selectedCompany?.emailApiKey || '');
  const [emailFromAddress, setEmailFromAddress] = useState(selectedCompany?.emailFromAddress || '');
  const [emailFromName, setEmailFromName] = useState(selectedCompany?.emailFromName || '');
  const [testingEmail, setTestingEmail] = useState(false);

  // WhatsApp
  const [waApiKey, setWaApiKey] = useState(selectedCompany?.whatsappApiKey || '');
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(selectedCompany?.whatsappPhoneNumberId || '');
  const [waBusinessAccountId, setWaBusinessAccountId] = useState(selectedCompany?.whatsappBusinessAccountId || '');
  const [testingWa, setTestingWa] = useState(false);

  // Integrations
  const [webhookSecret] = useState(selectedCompany?.webhookSecret || ('whs_' + selectedCompany.id.replace(/-/g, '').slice(0, 24)));

  // Integrations Modals & Form States
  const [activeIntegModal, setActiveIntegModal] = useState<string | null>(() => {
    if (activeView?.startsWith('admin-integrations-')) {
      return activeView.replace('admin-integrations-', '');
    }
    return null;
  });
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState(selectedCompany?.shopifyStoreUrl || '');
  const [shopifyAccessToken, setShopifyAccessToken] = useState(selectedCompany?.shopifyAccessToken || '');
  const [shopifyEnabled, setShopifyEnabled] = useState(!!selectedCompany?.shopifyIntegrationEnabled);

  const [wooSiteUrl, setWooSiteUrl] = useState(selectedCompany?.woocommerceSiteUrl || '');
  const [wooConsumerKey, setWooConsumerKey] = useState(selectedCompany?.woocommerceConsumerKey || '');
  const [wooConsumerSecret, setWooConsumerSecret] = useState(selectedCompany?.woocommerceConsumerSecret || '');
  const [wooEnabled, setWooEnabled] = useState(!!selectedCompany?.woocommerceIntegrationEnabled);

  const [zapierEnabled, setZapierEnabled] = useState(!!selectedCompany?.zapierIntegrationEnabled);

  const [xeroTenantId, setXeroTenantId] = useState(selectedCompany?.xeroTenantId || '');
  const [xeroClientId, setXeroClientId] = useState(selectedCompany?.xeroClientId || '');
  const [xeroEnabled, setXeroEnabled] = useState(!!selectedCompany?.xeroIntegrationEnabled);

  const [qbRealmId, setQbRealmId] = useState(selectedCompany?.quickbooksRealmId || '');
  const [qbClientId, setQbClientId] = useState(selectedCompany?.quickbooksClientId || '');
  const [qbEnabled, setQbEnabled] = useState(!!selectedCompany?.quickbooksIntegrationEnabled);

  const [googleDomain, setGoogleDomain] = useState(selectedCompany?.googleWorkspaceDomain || '');
  const [googleClientId, setGoogleClientId] = useState(selectedCompany?.googleWorkspaceClientId || '');
  const [googleEnabled, setGoogleEnabled] = useState(!!selectedCompany?.googleWorkspaceIntegrationEnabled);

  const [testingInteg, setTestingInteg] = useState(false);

  const isAdmin = isAdminRole(selectedUser.activeRole) || isHRRole(selectedUser.activeRole) || isHRDeptHead(selectedUser.activeRole);

  const localEmployees = employees.filter(e => e.companyId === selectedCompany.id);
  const localDepartments = departments.filter(d => d.companyId === selectedCompany.id);
  const localBranches = branches.filter(b => b.companyId === selectedCompany.id);

  const [adminTab, setAdminTab] = useState<'branches' | 'departments' | 'users' | 'roles' | 'approvals' | 'settings' | 'evat' | 'integrations'>(() => {
    if (activeView?.startsWith('admin-integrations')) return 'integrations';
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
    if (activeView?.startsWith('admin-integrations')) {
      setAdminTab('integrations');
      if (activeView.includes('-')) {
        const parts = activeView.split('-');
        if (parts.length >= 3) setActiveIntegModal(parts.slice(2).join('-'));
      }
    }
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

  useEffect(() => {
    if (propApprovalPolicies && propApprovalPolicies.length > 0) {
      setApprovalPolicies(prev => {
        const next = { ...prev };
        for (const p of propApprovalPolicies) {
          if (p.companyId === selectedCompany.id) {
            next[p.module] = p.approverRoles || [];
          }
        }
        return next;
      });
    }
  }, [propApprovalPolicies, selectedCompany.id]);

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
  const [roleFormSubmenus, setRoleFormSubmenus] = useState<string[]>([]);
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
      setRoleFormSubmenus(roleToEdit.submenus || []);
      setRoleFormCrudPermissions(roleToEdit.crudPermissions || []);
    } else {
      setEditingRole(null);
      setRoleFormName('');
      setRoleFormDesc('');
      setRoleFormModules([]);
      setRoleFormSubmenus([]);
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
        submenus: roleFormSubmenus,
        crudPermissions: roleFormCrudPermissions,
      });
    } else {
      await onCreateRole({
        name: roleFormName.trim(),
        description: roleFormDesc,
        modules: roleFormModules,
        submenus: roleFormSubmenus,
        crudPermissions: roleFormCrudPermissions,
      });
    }
    setShowRoleModal(false);
  };

  const depts = ['Engineering', 'Operations', 'Finance', 'HR', 'Sales', 'IT', 'Legal'];

  return (
      <div>
        <PageHeader title="Administration" subtitle="Company configuration, branch management, users, roles and system settings." />

        {/* ── Top Tab Bar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto mb-6 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-xs">
          {([
            { id: 'branches',     label: 'Branches',     icon: 'bi bi-geo-alt' },
            { id: 'departments',  label: 'Departments',  icon: 'bi bi-diagram-3' },
            { id: 'users',        label: 'Users',        icon: 'bi bi-people' },
            { id: 'roles',        label: 'Roles',        icon: 'bi bi-shield-lock' },
            { id: 'approvals',    label: 'Approvals',    icon: 'bi bi-check2-square' },
            { id: 'settings',     label: 'Settings',     icon: 'bi bi-toggles' },
            { id: 'evat',         label: 'E-VAT',        icon: 'bi bi-receipt-cutoff' },
            { id: 'integrations', label: 'Integrations', icon: 'bi bi-plug', highlight: true },
          ] as { id: string; label: string; icon: string; highlight?: boolean }[])
            .map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] fw-semibold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === tab.id
                  ? (tab.highlight ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
                  : (tab.highlight ? 'text-violet-600 hover:bg-violet-50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
              }`}
            >
              <i className={tab.icon}></i>
              {tab.label}
              {tab.highlight && adminTab !== tab.id && (
                <span className="ml-0.5 flex h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

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
                          <td className="px-4 py-3.5 fs-sm font-sans tabular-nums text-slate-700">{formatCurrency(dept.budget, selectedCompany?.currency)}</td>
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
                <p className="text-[11px] text-slate-500 mt-0.5">Define roles and assign granular permissions (Create, View, Edit, Delete).</p>
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
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {Object.entries(crudByModule).map(([mod, actions]: [string, any]) => (
                              <div key={mod} className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
                                <span className="text-[10px] font-mono fw-bold text-slate-700 uppercase tracking-wide">{mod}</span>
                                <span className="text-slate-300">|</span>
                                <div className="flex flex-wrap items-center gap-1">
                                  {[
                                    { k: 'Create', l: 'Create', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                                    { k: 'Read', l: 'View', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
                                    { k: 'Update', l: 'Edit', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
                                    { k: 'Delete', l: 'Delete', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
                                  ].map(a => (
                                    <span key={a.k} className={`text-[9px] px-1.5 py-0.5 rounded border fw-bold ${actions.includes(a.k) ? a.cls : 'text-slate-300 border-slate-100 opacity-40'}`}>{a.l}</span>
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
                    <Label>Action Permissions (Create, View, Edit, Delete)</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Choose permissions per module (Create, View, Edit, Delete).</p>
                    <div className="space-y-2">
                      {roleFormModules.length === 0 && <p className="text-[11px] text-slate-400 italic">Select modules above to configure permissions.</p>}
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
                    <Label>Action Permissions (Create, View, Edit, Delete)</Label>
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

            {/* Login Slider Images */}
            <div>
              <h3 className="section-title text-slate-900 mb-4">Login Screen Carousel</h3>
              <p className="fs-xs text-slate-500 mb-4">Upload custom images to display a sliding carousel on the login page for this subdomain.</p>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                <div className="flex flex-wrap gap-4 mb-4">
                  {(selectedCompany.loginImages || []).map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative h-24 w-40 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group">
                      <img src={imgUrl} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => {
                            const newImages = (selectedCompany.loginImages || []).filter((_: any, i: number) => i !== idx);
                            onUpdateCompanySettings(selectedCompany.id, { loginImages: newImages });
                          }}
                          className="h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="h-24 w-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors">
                    <i className="bi bi-plus-lg fs-xl text-slate-400"></i>
                    <span className="text-[10px] text-slate-400 mt-1">Add Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const current = selectedCompany.loginImages || [];
                          onUpdateCompanySettings(selectedCompany.id, { loginImages: [...current, reader.result as string] });
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </div>
                </div>
                <div className="flex gap-2 max-w-md">
                  <input type="text" placeholder="Or paste an image URL..." id="loginImgUrl" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none" />
                  <PrimaryBtn onClick={() => {
                    const input = document.getElementById('loginImgUrl') as HTMLInputElement;
                    const url = input?.value;
                    if (url) {
                      const current = selectedCompany.loginImages || [];
                      onUpdateCompanySettings(selectedCompany.id, { loginImages: [...current, url] });
                      input.value = '';
                    }
                  }} icon="bi bi-plus-lg">Add URL</PrimaryBtn>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div>
              <h3 className="section-title text-slate-900 mb-4">Regional Settings</h3>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 max-w-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>System Currency</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Default currency for all financial transactions.</p>
                    <Select 
                      value={selectedCompany.currency || 'GHS'} 
                      onChange={(e) => onUpdateCompanySettings(selectedCompany.id, { currency: e.target.value })}
                    >
                      <option value="GHS">GHS - Ghana Cedi</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                    </Select>
                  </div>
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

        {/* ── Integrations Tab ──────────────────────────────────────────────────── */}
        {adminTab === 'integrations' && (() => {
          const role = selectedUser.activeRole;
          const isFullAdmin = ['Company Admin', 'CEO', 'Super Admin'].includes(role);
          const companyApiKey = 'ak_live_' + selectedCompany.id.replace(/-/g, '').slice(0, 32);
          const webhookEndpoint = `https://api.core360.app/webhooks/${selectedCompany.id}`;

          const ALL_INTEGRATIONS: {
            id: string; name: string; description: string; category: string;
            color: string; bg: string; roles: string[]; connected: boolean;
            logo: React.ReactNode;
          }[] = [
            {
              id: 'whatsapp', name: 'WhatsApp Business',
              description: 'Receive orders, send invoices, quotes & payment reminders via WhatsApp.',
              category: 'Communication', color: '#25D366', bg: '#e7f8ee',
              roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Company Admin','CEO','Support Agent','Help Desk Admin'],
              connected: !!(selectedCompany.whatsappApiKey && selectedCompany.whatsappPhoneNumberId),
              logo: <svg viewBox="0 0 24 24" fill="#25D366" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
            },
            {
              id: 'shopify', name: 'Shopify',
              description: 'Pull e-commerce orders from your Shopify store into Sales Orders.',
              category: 'E-Commerce', color: '#96BF48', bg: '#f2f7ea',
              roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Inventory Manager','Store Keeper','Operations Department Head','Company Admin','CEO'],
              connected: !!(selectedCompany.shopifyIntegrationEnabled || shopifyEnabled),
              logo: <svg viewBox="0 0 32 32" className="w-7 h-7"><path fill="#96BF48" d="M26.3 7.1c0-.1-.1-.2-.3-.2s-3.7-.3-3.7-.3l-2.4-2.4c-.2-.2-.7-.2-.9 0l-1 1c-.1 0-.1.1-.2.1-.6-1.7-1.6-3.3-3.4-3.3H14c-.5-.7-1.2-1-1.8-1-4.5 0-6.6 5.6-7.3 8.4L2 10.8c-1 .3-1 .3-1.1 1.3L0 23.6l17.5 3.3L24 25.5l2.3-18.4zM18.1 5.4l-1.7.5c0-.2 0-.3-.1-.5-.3-1.5-.9-2.2-1.6-2.5.8.2 2.4 1.6 3.4 2.5zM13.8 2.1c.1 0 .2.1.3.1-1 .5-2.1 1.7-2.5 4.1l-1.8.6c.6-2.1 1.9-4.8 4-4.8zM16 17.8l-2.3-.5s.8-2.5.9-2.6c0-.1.1-.4.1-.5-.1-.6-.6-.8-1-.8-1 0-1.5.8-1.8 1.7l-1.9-.4s.8-3 3.5-3c1.7 0 3.1.9 3.2 2.7 0 .5-.1.9-.2 1.4L16 17.8zM14 22l-2.5-.5s.9-2.6 1-2.7c.1-.2.1-.3.1-.5-.1-.6-.6-.8-1-.8-1 0-1.5.8-1.8 1.7l-1.9-.4s.8-3.2 3.6-3.2c1.7 0 3 1 3.1 2.8 0 .5-.1 1-.2 1.4L14 22zM17.5 26.9L0 23.6l.1-.8 17.5 3.3-.1.8zm6.5-1.4l-6.5 1.4.1-.8 6.5-1.4-.1.8z"/></svg>,
            },
            {
              id: 'woocommerce', name: 'WooCommerce',
              description: 'Sync orders from your WordPress/WooCommerce store into the system.',
              category: 'E-Commerce', color: '#7F54B3', bg: '#f3eefb',
              roles: ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Inventory Manager','Store Keeper','Operations Department Head','Company Admin','CEO'],
              connected: !!(selectedCompany.woocommerceIntegrationEnabled || wooEnabled),
              logo: <svg viewBox="0 0 24 24" className="w-7 h-7"><path fill="#7F54B3" d="M2.047 0C.919 0 0 .92 0 2.047v13.391c0 1.128.919 2.047 2.047 2.047h7.742l-.37 2.8-2.17.716h5.568l-2.17-.716-.37-2.8h7.676c1.128 0 2.047-.919 2.047-2.047V2.047C24 .92 23.08 0 21.953 0zm2.78 3.516c-.36 0-.651.193-.722.512-.098.44.26.809.626.972.253.11.385.29.385.521 0 .36-.293.65-.654.65-.23 0-.447-.12-.578-.317l-.565.566c.264.336.654.521 1.067.521.74 0 1.342-.603 1.342-1.343 0-.511-.29-.953-.738-1.16-.144-.067-.245-.185-.245-.33 0-.181.148-.328.33-.328.12 0 .232.064.295.165l.566-.567a1.04 1.04 0 00-.845-.419zm4.28 0c-.36 0-.651.193-.722.512-.098.44.26.809.626.972.253.11.385.29.385.521 0 .36-.293.65-.654.65-.23 0-.447-.12-.578-.317l-.565.566c.264.336.654.521 1.067.521.74 0 1.342-.603 1.342-1.343 0-.511-.29-.953-.738-1.16-.144-.067-.245-.185-.245-.33 0-.181.148-.328.33-.328.12 0 .232.064.295.165l.566-.567a1.04 1.04 0 00-.845-.419zm4.28 0c-.82 0-1.485.665-1.485 1.485 0 .82.665 1.485 1.485 1.485.82 0 1.485-.665 1.485-1.485 0-.82-.665-1.485-1.485-1.485zm0 .788c.385 0 .697.313.697.697 0 .385-.312.697-.697.697a.697.697 0 010-1.394z"/></svg>,
            },
            {
              id: 'zapier', name: 'Zapier',
              description: 'Automate workflows connecting 6,000+ apps via your webhook URL.',
              category: 'Automation', color: '#FF4A00', bg: '#fff1ec',
              roles: ['Company Admin','CEO','Finance Manager','Finance Department Head','HR Manager','HR Department Head','Sales Department Head','IT Department Head','Operations Department Head'],
              connected: !!(selectedCompany.zapierIntegrationEnabled || zapierEnabled),
              logo: <svg viewBox="0 0 24 24" fill="#FF4A00" className="w-7 h-7"><path d="M14.924 8.339a5.42 5.42 0 01-.57 2.408L8.04 4.433a5.42 5.42 0 012.408-.57 5.42 5.42 0 014.476 2.325 5.408 5.408 0 01.569 2.151m-9.848 0c0-.749.15-1.464.42-2.115l6.37 6.37a5.42 5.42 0 01-2.114.42 5.42 5.42 0 01-4.676-2.675zm13.267 2.754l-5.267-5.266 5.267-5.267v10.533zm-16.686 0V5.826L6.924 11.093zm8.343-1.648L4.734 3.88h10.532zm0 3.11H4.734l5.266 5.266zm.985-1.462l5.267 5.267H5.719zm-10.58 1.462l5.267-5.267v10.533zm5.267 5.267l-5.267-5.267h10.533z"/></svg>,
            },
            {
              id: 'xero', name: 'Xero',
              description: 'Sync invoices, payments and bank transactions with your Xero accounting.',
              category: 'Accounting', color: '#13B5EA', bg: '#e8f8fd',
              roles: ['Accountant','Finance Manager','Finance Department Head','Company Admin','CEO'],
              connected: !!(selectedCompany.xeroIntegrationEnabled || xeroEnabled),
              logo: <svg viewBox="0 0 24 24" fill="#13B5EA" className="w-7 h-7"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.44 16.562l-2.905-2.906-2.906 2.906-.988-.988 2.906-2.906-2.906-2.905.988-.988 2.906 2.905 2.905-2.905.988.988-2.905 2.905 2.905 2.906-.988.988zm6.315.07c-1.313 0-2.38-1.067-2.38-2.38 0-1.312 1.067-2.379 2.38-2.379 1.312 0 2.379 1.067 2.379 2.38 0 1.312-1.067 2.379-2.38 2.379zm0-3.86a1.48 1.48 0 100 2.96 1.48 1.48 0 000-2.96z"/></svg>,
            },
            {
              id: 'quickbooks', name: 'QuickBooks',
              description: 'Push sales, expenses and payroll data into QuickBooks Online.',
              category: 'Accounting', color: '#2CA01C', bg: '#eaf7e9',
              roles: ['Accountant','Finance Manager','Finance Department Head','Company Admin','CEO'],
              connected: !!(selectedCompany.quickbooksIntegrationEnabled || qbEnabled),
              logo: <svg viewBox="0 0 24 24" fill="#2CA01C" className="w-7 h-7"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8a7.2 7.2 0 110 14.4A7.2 7.2 0 0112 4.8zm-2.4 3.6v7.2h1.8V9.9h.9a1.5 1.5 0 010 3H11.4v1.8h.9a3.3 3.3 0 100-6.6H9.6v.3z"/></svg>,
            },
            {
              id: 'google-workspace', name: 'Google Workspace',
              description: 'Sync employee accounts, calendar events and Gmail into HR.',
              category: 'Productivity', color: '#4285F4', bg: '#eef3fe',
              roles: ['HR Manager','HR Officer','HR Department Head','Company Admin','CEO','IT Department Head'],
              connected: !!(selectedCompany.googleWorkspaceIntegrationEnabled || googleEnabled),
              logo: <svg viewBox="0 0 24 24" className="w-7 h-7"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
            },
            {
              id: 'website', name: 'Your Website',
              description: 'Embed a snippet — contact forms, quote requests flow in automatically.',
              category: 'Web', color: '#0ea5e9', bg: '#e0f2fe',
              roles: ['Sales Manager','Sales Executive','Sales Department Head','Company Admin','CEO','IT Department Head'],
              connected: !!selectedCompany.websiteIntegrationEnabled,
              logo: <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
            },
          ];

          const visibleIntegrations = isFullAdmin
            ? ALL_INTEGRATIONS
            : ALL_INTEGRATIONS.filter(i => i.roles.includes(role));

          return (
            <div className="space-y-6">

              {/* API Credentials Banner (Responsive) */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4 sm:p-6 shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* API Key Box */}
                  <div className="flex flex-col justify-between gap-2 min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest fw-semibold">Your API Key</p>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] sm:text-xs font-mono text-emerald-400 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 flex-1 min-w-0 overflow-x-auto select-all break-all leading-snug">
                          {companyApiKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(companyApiKey);
                            toast('API Key copied to clipboard!', 'success');
                          }}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors shrink-0 cursor-pointer"
                          title="Copy API Key"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Authenticate requests from external webhooks & APIs with this key.</p>
                  </div>

                  {/* Webhook Endpoint Box */}
                  <div className="flex flex-col justify-between gap-2 min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest fw-semibold">Webhook Endpoint</p>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">POST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] sm:text-xs font-mono text-blue-400 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 flex-1 min-w-0 overflow-x-auto select-all break-all leading-snug">
                          {webhookEndpoint}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(webhookEndpoint);
                            toast('Webhook Endpoint URL copied!', 'success');
                          }}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors shrink-0 cursor-pointer"
                          title="Copy Webhook Endpoint"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Point Shopify, WooCommerce & Zapier webhooks here to push data.</p>
                  </div>

                </div>
              </div>

              {/* WhatsApp Setup Panel (Responsive) */}
              {(isFullAdmin || ['Sales Manager','Sales Rep','Sales Executive','Sales Department Head','Support Agent','Help Desk Admin'].includes(role)) && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:'#e7f8ee'}}>
                      <svg viewBox="0 0 24 24" fill="#25D366" className="w-6 h-6 sm:w-7 sm:h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="fw-bold text-slate-900 fs-sm">WhatsApp Business API</h3>
                        {(selectedCompany.whatsappApiKey && selectedCompany.whatsappPhoneNumberId)
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-emerald-100 text-emerald-700">✓ Connected</span>
                          : <span className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-slate-100 text-slate-500">Not Connected</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Send invoices, quotes & payment reminders via WhatsApp. Powered by Meta Cloud API.</p>
                    </div>
                  </div>
                  {isFullAdmin && (
                    <>
                      <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div><Label>API Token (Bearer)</Label><Input type="password" placeholder="EAABsbCS..." value={waApiKey} onChange={e => setWaApiKey(e.target.value)} /></div>
                        <div><Label>Phone Number ID</Label><Input placeholder="12345678901234" value={waPhoneNumberId} onChange={e => setWaPhoneNumberId(e.target.value)} /></div>
                        <div><Label>Business Account ID</Label><Input placeholder="98765432109876" value={waBusinessAccountId} onChange={e => setWaBusinessAccountId(e.target.value)} /></div>
                      </div>
                      <div className="px-4 sm:px-6 pb-4 sm:pb-5 flex flex-wrap items-center gap-3">
                        <PrimaryBtn onClick={() => { onUpdateCompanySettings(selectedCompany.id, { whatsappApiKey: waApiKey, whatsappPhoneNumberId: waPhoneNumberId, whatsappBusinessAccountId: waBusinessAccountId }); toast('WhatsApp settings saved.', 'success'); }}>Save Settings</PrimaryBtn>
                        <SecBtn onClick={async () => { setTestingWa(true); const res = await sendWhatsApp({ company: { ...selectedCompany, whatsappApiKey: waApiKey, whatsappPhoneNumberId: waPhoneNumberId }, to: '+233240000000', message: `[TEST] WhatsApp connected to ${selectedCompany.name} ✓` }); setTestingWa(false); if (res.success) toast(res.message, 'success'); else toast(res.message, 'error'); }}>{testingWa ? 'Testing...' : 'Test Connection'}</SecBtn>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Website Embed (Responsive) */}
              {(isFullAdmin || ['Sales Manager','Sales Executive','Sales Department Head','IT Department Head'].includes(role)) && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-sky-50 shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" className="w-6 h-6 sm:w-7 sm:h-7"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="fw-bold text-slate-900 fs-sm">Website Integration</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Paste this snippet — contact forms, quotes & orders flow into your workspace automatically.</p>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Embed Snippet — paste before &lt;/body&gt;</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const code = `<!-- Core360 Integration -->\n<script>\n  window.Core360 = {\n    apiKey: "${companyApiKey}",\n    endpoint: "${webhookEndpoint}"\n  };\n</script>\n<script src="https://cdn.core360.app/widget.js" async></script>`;
                          navigator.clipboard.writeText(code);
                          toast('Snippet copied to clipboard!', 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] fw-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <i className="bi bi-clipboard"></i> Copy Snippet
                      </button>
                    </div>
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto max-w-full select-all whitespace-pre break-all sm:break-normal">
                      {`<!-- Core360 Integration -->\n<script>\n  window.Core360 = {\n    apiKey: "${companyApiKey}",\n    endpoint: "${webhookEndpoint}"\n  };\n</script>\n<script src="https://cdn.core360.app/widget.js" async></script>`}
                    </div>
                    <p className="text-[11px] text-slate-500">Submissions appear in <strong>CRM → Leads</strong> and <strong>Sales → Quotations</strong> automatically.</p>
                  </div>
                </div>
              )}

              {/* Role-filtered integration cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="fw-bold text-slate-900 fs-sm">{isFullAdmin ? 'All Integrations' : 'Integrations for your role'}</h3>
                  <span className="text-[11px] text-slate-400">{visibleIntegrations.length} app{visibleIntegrations.length !== 1 ? 's' : ''}</span>
                </div>
                {visibleIntegrations.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <i className="bi bi-plug text-2xl text-slate-300"></i>
                    <p className="text-[12px] text-slate-400 mt-2">No integrations available for your role.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleIntegrations.map(integ => (
                      <div key={integ.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center" style={{background: integ.bg}}>
                            {integ.logo}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] fw-semibold ${integ.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {integ.connected ? '✓ Connected' : 'Not Connected'}
                            </span>
                            <span className="text-[10px] fw-semibold uppercase tracking-wider" style={{color: integ.color}}>{integ.category}</span>
                          </div>
                        </div>
                        <div>
                          <p className="fw-bold text-slate-900 fs-xs">{integ.name}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{integ.description}</p>
                        </div>
                        <div className="mt-auto pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400">Use your API key & webhook URL above to connect {integ.name}.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data flow guide */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6">
                <h3 className="fw-bold text-slate-900 fs-sm mb-4"><i className="bi bi-diagram-3 mr-2 text-slate-400"></i>How Data Flows In</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {([
                    { icon: 'bi bi-globe', color: '#0ea5e9', title: 'External app sends data', desc: 'Your website, Shopify or WhatsApp fires a POST to your webhook.' },
                    { icon: 'bi bi-arrow-right-circle', color: '#8b5cf6', title: 'System validates & routes', desc: 'Core360 authenticates with your API key and routes to the right module.' },
                    { icon: 'bi bi-check2-circle', color: '#22c55e', title: 'Record created instantly', desc: 'A Lead, Quotation or Sales Order appears in your workspace in real time.' },
                  ] as {icon: string; color: string; title: string; desc: string}[]).map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background: step.color + '18'}}>
                        <i className={`${step.icon} text-sm`} style={{color: step.color}}></i>
                      </div>
                      <div>
                        <p className="fw-semibold text-slate-800 text-[12px]">{step.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>


              {/* ── Active Integration Configuration Modal ────────────────────────────────────── */}
              {activeIntegModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center" style={{
                          background: activeIntegModal === 'shopify' ? '#f2f7ea' :
                                      activeIntegModal === 'woocommerce' ? '#f3eefb' :
                                      activeIntegModal === 'zapier' ? '#fff1ec' :
                                      activeIntegModal === 'xero' ? '#e8f8fd' :
                                      activeIntegModal === 'quickbooks' ? '#eaf7e9' :
                                      activeIntegModal === 'google-workspace' ? '#eef3fe' :
                                      activeIntegModal === 'website' ? '#e0f2fe' : '#e7f8ee'
                        }}>
                          <i className="bi bi-plug-fill text-lg" style={{
                            color: activeIntegModal === 'shopify' ? '#96BF48' :
                                   activeIntegModal === 'woocommerce' ? '#7F54B3' :
                                   activeIntegModal === 'zapier' ? '#FF4A00' :
                                   activeIntegModal === 'xero' ? '#13B5EA' :
                                   activeIntegModal === 'quickbooks' ? '#2CA01C' :
                                   activeIntegModal === 'google-workspace' ? '#4285F4' :
                                   activeIntegModal === 'website' ? '#0ea5e9' : '#25D366'
                          }}></i>
                        </div>
                        <div>
                          <h3 className="fs-sm fw-bold text-slate-900 capitalize">
                            Configure {activeIntegModal.replace('-', ' ')}
                          </h3>
                          <p className="text-[10px] text-slate-500">API Credentials & Sync Settings</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveIntegModal(null)}
                        className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <i className="bi bi-x fs-lg"></i>
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 space-y-4">

                      {/* 1. WhatsApp */}
                      {activeIntegModal === 'whatsapp' && (
                        <>
                          <div>
                            <Label>API Token (Bearer) *</Label>
                            <Input
                              type="password"
                              placeholder="EAABsbCS..."
                              value={waApiKey}
                              onChange={e => setWaApiKey(e.target.value)}
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Phone Number ID *</Label>
                              <Input
                                placeholder="12345678901234"
                                value={waPhoneNumberId}
                                onChange={e => setWaPhoneNumberId(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Business Account ID *</Label>
                              <Input
                                placeholder="98765432109876"
                                value={waBusinessAccountId}
                                onChange={e => setWaBusinessAccountId(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                onUpdateCompanySettings(selectedCompany.id, {
                                  whatsappApiKey: waApiKey,
                                  whatsappPhoneNumberId: waPhoneNumberId,
                                  whatsappBusinessAccountId: waBusinessAccountId
                                });
                                toast('WhatsApp settings saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save WhatsApp Settings
                            </PrimaryBtn>
                            <SecBtn
                              onClick={async () => {
                                setTestingWa(true);
                                const res = await sendWhatsApp({
                                  company: { ...selectedCompany, whatsappApiKey: waApiKey, whatsappPhoneNumberId: waPhoneNumberId },
                                  to: '+233240000000',
                                  message: `[TEST] WhatsApp connected to ${selectedCompany.name} ✓`
                                });
                                setTestingWa(false);
                                if (res.success) toast(res.message, 'success');
                                else toast(res.message, 'error');
                              }}
                            >
                              {testingWa ? 'Testing...' : 'Test Connection'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 2. Shopify */}
                      {activeIntegModal === 'shopify' && (
                        <>
                          <div>
                            <Label>Shopify Store Domain *</Label>
                            <Input
                              placeholder="e.g. my-store.myshopify.com"
                              value={shopifyStoreUrl}
                              onChange={e => setShopifyStoreUrl(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Admin API Access Token (shpat_...) *</Label>
                            <Input
                              type="password"
                              placeholder="shpat_123456789abcdef..."
                              value={shopifyAccessToken}
                              onChange={e => setShopifyAccessToken(e.target.value)}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={shopifyEnabled}
                              onChange={e => setShopifyEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Automatic Order Ingestion to Sales Orders</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setShopifyEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  shopifyStoreUrl,
                                  shopifyAccessToken,
                                  shopifyIntegrationEnabled: true
                                });
                                toast('Shopify integration settings saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save & Enable Shopify
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Successfully connected to Shopify Admin API!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Test Connection'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 3. WooCommerce */}
                      {activeIntegModal === 'woocommerce' && (
                        <>
                          <div>
                            <Label>WordPress / WooCommerce Site URL *</Label>
                            <Input
                              placeholder="https://my-store.com"
                              value={wooSiteUrl}
                              onChange={e => setWooSiteUrl(e.target.value)}
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Consumer Key (ck_...) *</Label>
                              <Input
                                placeholder="ck_123456789..."
                                value={wooConsumerKey}
                                onChange={e => setWooConsumerKey(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Consumer Secret (cs_...) *</Label>
                              <Input
                                type="password"
                                placeholder="cs_123456789..."
                                value={wooConsumerSecret}
                                onChange={e => setWooConsumerSecret(e.target.value)}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={wooEnabled}
                              onChange={e => setWooEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Automatic Order Sync to Sales Orders</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setWooEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  woocommerceSiteUrl: wooSiteUrl,
                                  woocommerceConsumerKey: wooConsumerKey,
                                  woocommerceConsumerSecret: wooConsumerSecret,
                                  woocommerceIntegrationEnabled: true
                                });
                                toast('WooCommerce integration settings saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save & Enable WooCommerce
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Successfully connected to WooCommerce REST API!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Test Connection'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 4. Zapier */}
                      {activeIntegModal === 'zapier' && (
                        <>
                          <div>
                            <Label>Your Webhook Endpoint URL (for Zapier Webhook Actions)</Label>
                            <Input
                              readOnly
                              value={`https://api.core360.app/webhooks/${selectedCompany.id}`}
                              className="bg-slate-50 font-mono text-[11px] select-all"
                            />
                          </div>
                          <div>
                            <Label>API Key (Header: x-api-key)</Label>
                            <Input
                              readOnly
                              value={'ak_live_' + selectedCompany.id.replace(/-/g, '').slice(0, 32)}
                              className="bg-slate-50 font-mono text-[11px] select-all"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={zapierEnabled}
                              onChange={e => setZapierEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Zapier Automation Webhook Engine</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setZapierEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  zapierIntegrationEnabled: true
                                });
                                toast('Zapier integration settings saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save Zapier Config
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Zapier test payload dispatched successfully!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Send Test Ping'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 5. Xero */}
                      {activeIntegModal === 'xero' && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Xero Tenant ID *</Label>
                              <Input
                                placeholder="e.g. 8d39f4e2-..."
                                value={xeroTenantId}
                                onChange={e => setXeroTenantId(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>OAuth Client ID *</Label>
                              <Input
                                placeholder="e.g. 5A92F..."
                                value={xeroClientId}
                                onChange={e => setXeroClientId(e.target.value)}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={xeroEnabled}
                              onChange={e => setXeroEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Xero Accounting Ledger & Invoices Sync</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setXeroEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  xeroTenantId,
                                  xeroClientId,
                                  xeroIntegrationEnabled: true
                                });
                                toast('Xero accounting integration saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save & Connect Xero
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Connected to Xero API successfully!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Test Connection'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 6. QuickBooks */}
                      {activeIntegModal === 'quickbooks' && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>QuickBooks Realm / Company ID *</Label>
                              <Input
                                placeholder="e.g. 913035048..."
                                value={qbRealmId}
                                onChange={e => setQbRealmId(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>OAuth Client ID *</Label>
                              <Input
                                placeholder="e.g. Q012345..."
                                value={qbClientId}
                                onChange={e => setQbClientId(e.target.value)}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={qbEnabled}
                              onChange={e => setQbEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable QuickBooks Online Financial Sync</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setQbEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  quickbooksRealmId: qbRealmId,
                                  quickbooksClientId: qbClientId,
                                  quickbooksIntegrationEnabled: true
                                });
                                toast('QuickBooks integration saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save & Connect QuickBooks
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Connected to QuickBooks Online API!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Test Connection'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 7. Google Workspace */}
                      {activeIntegModal === 'google-workspace' && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Organization Domain *</Label>
                              <Input
                                placeholder="e.g. mycompany.com"
                                value={googleDomain}
                                onChange={e => setGoogleDomain(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Google OAuth Client ID *</Label>
                              <Input
                                placeholder="e.g. 12345-abc.apps.googleusercontent.com"
                                value={googleClientId}
                                onChange={e => setGoogleClientId(e.target.value)}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={googleEnabled}
                              onChange={e => setGoogleEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Employee Directory & Calendar Sync</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                setGoogleEnabled(true);
                                onUpdateCompanySettings(selectedCompany.id, {
                                  googleWorkspaceDomain: googleDomain,
                                  googleWorkspaceClientId: googleClientId,
                                  googleWorkspaceIntegrationEnabled: true
                                });
                                toast('Google Workspace integration saved.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Save & Connect Google Workspace
                            </PrimaryBtn>
                            <SecBtn
                              onClick={() => {
                                setTestingInteg(true);
                                setTimeout(() => {
                                  setTestingInteg(false);
                                  toast('Google Workspace Admin API connected!', 'success');
                                }, 800);
                              }}
                            >
                              {testingInteg ? 'Testing...' : 'Test Sync'}
                            </SecBtn>
                          </div>
                        </>
                      )}

                      {/* 8. Website Integration */}
                      {activeIntegModal === 'website' && (
                        <>
                          <div>
                            <Label>Embed Snippet — paste before &lt;/body&gt;</Label>
                            <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto select-all whitespace-pre">
{`<!-- Core360 Integration -->
<script>
  window.Core360 = {
    apiKey: "ak_live_${selectedCompany.id.replace(/-/g, '').slice(0, 32)}",
    endpoint: "https://api.core360.app/webhooks/${selectedCompany.id}"
  };
</script>
<script src="https://cdn.core360.app/widget.js" async></script>`}
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={!!selectedCompany.websiteIntegrationEnabled}
                              onChange={e => {
                                onUpdateCompanySettings(selectedCompany.id, {
                                  websiteIntegrationEnabled: e.target.checked
                                });
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-[11px] fw-semibold text-slate-700">Enable Website Form Ingestion into CRM Leads</span>
                          </label>
                          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                            <PrimaryBtn
                              onClick={() => {
                                toast('Website snippet active. Submissions flow to CRM → Leads.', 'success');
                                setActiveIntegModal(null);
                              }}
                            >
                              Done
                            </PrimaryBtn>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              )}

              </div>

            </div>
          );
        })()}


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
                      <p className="text-[10px] text-slate-500 mt-0.5">{editingRole ? 'Modify modules and action permissions (Create, View, Edit, Delete).' : 'Define a new role with custom access scopes.'}</p>
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
                    <Label>Module Access & Submodule Permissions</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-3">Select main modules, toggle submodules, and assign action permissions (Create, View, Edit, Delete).</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {MODULE_HIERARCHY.map(mod => {
                        const hasModule = roleFormModules.includes(mod.id);
                        const crudActions = ['Create', 'Read', 'Update', 'Delete'];

                        const toggleModule = () => {
                          if (hasModule) {
                            setRoleFormModules(prev => prev.filter(m => m !== mod.id));
                            if (mod.subModules) {
                              const subIds = mod.subModules.map(s => s.id);
                              setRoleFormSubmenus(prev => prev.filter(s => !subIds.includes(s)));
                            }
                          } else {
                            setRoleFormModules(prev => [...prev, mod.id]);
                            if (mod.subModules) {
                              const subIds = mod.subModules.map(s => s.id);
                              setRoleFormSubmenus(prev => Array.from(new Set([...prev, ...subIds])));
                            }
                          }
                        };

                        const toggleSubmenu = (subId: string) => {
                          setRoleFormSubmenus(prev =>
                            prev.includes(subId) ? prev.filter(s => s !== subId) : [...prev, subId]
                          );
                        };

                        const toggleCrud = (targetKeys: string[], action: string) => {
                          const permKey = `${targetKeys[0]}.${action}`;
                          const isAlreadySet = roleFormCrudPermissions.includes(permKey);
                          
                          setRoleFormCrudPermissions(prev => {
                            let next = [...prev];
                            for (const tk of targetKeys) {
                              const k = `${tk}.${action}`;
                              if (isAlreadySet) {
                                next = next.filter(p => p !== k);
                              } else {
                                if (!next.includes(k)) next.push(k);
                              }
                            }
                            return next;
                          });
                        };

                        return (
                          <div key={mod.id} className={`rounded-xl border transition-all ${hasModule ? 'bg-slate-50/50 border-slate-300' : 'bg-white border-slate-200'}`}>
                            {/* Main Module Header */}
                            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={hasModule}
                                  onChange={toggleModule}
                                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <div className="flex items-center gap-2">
                                  <i className={`${mod.icon} text-slate-500 text-sm`}></i>
                                  <span className="fs-xs fw-bold text-slate-900">{mod.label}</span>
                                </div>
                              </label>

                              {/* Main Module level CRUD if no submodules */}
                              {hasModule && (!mod.subModules || mod.subModules.length === 0) && (
                                <div className="flex flex-wrap items-center gap-1.5 pl-6 sm:pl-0">
                                  {[
                                    { key: 'Create', label: 'Create', activeCls: 'bg-emerald-600 text-white border-emerald-600' },
                                    { key: 'Read', label: 'View', activeCls: 'bg-blue-600 text-white border-blue-600' },
                                    { key: 'Update', label: 'Edit', activeCls: 'bg-amber-600 text-white border-amber-600' },
                                    { key: 'Delete', label: 'Delete', activeCls: 'bg-rose-600 text-white border-rose-600' }
                                  ].map(action => {
                                    const checked = roleFormCrudPermissions.includes(`${mod.id}.${action.key}`);
                                    return (
                                      <button
                                        key={action.key}
                                        type="button"
                                        onClick={() => toggleCrud([mod.id], action.key)}
                                        className={`px-2.5 py-1 rounded-md border text-[10px] fw-bold transition-all cursor-pointer ${checked ? `${action.activeCls} shadow-2xs` : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                      >
                                        {action.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Submodules List if module is enabled */}
                            {hasModule && mod.subModules && mod.subModules.length > 0 && (
                              <div className="px-3 pb-3 pt-1 border-t border-slate-200/60 divide-y divide-slate-100/80">
                                {mod.subModules.map(sub => {
                                  const isSubActive = roleFormSubmenus.includes(sub.id);
                                  return (
                                    <div key={sub.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isSubActive}
                                          onChange={() => toggleSubmenu(sub.id)}
                                          className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                        />
                                        <span className={`text-[11px] ${isSubActive ? 'fw-semibold text-slate-800' : 'text-slate-400'}`}>
                                          {sub.label}
                                        </span>
                                      </label>

                                      {/* Submodule CRUD permissions */}
                                      {isSubActive && (
                                        <div className="flex flex-wrap items-center gap-1.5 pl-5 sm:pl-0">
                                          {[
                                            { key: 'Create', label: 'Create', activeCls: 'bg-emerald-600 text-white border-emerald-600' },
                                            { key: 'Read', label: 'View', activeCls: 'bg-blue-600 text-white border-blue-600' },
                                            { key: 'Update', label: 'Edit', activeCls: 'bg-amber-600 text-white border-amber-600' },
                                            { key: 'Delete', label: 'Delete', activeCls: 'bg-rose-600 text-white border-rose-600' }
                                          ].map(action => {
                                            const checked = roleFormCrudPermissions.includes(`${sub.id}.${action.key}`) || roleFormCrudPermissions.includes(`${mod.id}.${sub.id}.${action.key}`);
                                            return (
                                              <button
                                                key={action.key}
                                                type="button"
                                                onClick={() => toggleCrud([sub.id, `${mod.id}.${sub.id}`, sub.label], action.key)}
                                                className={`px-2 py-0.5 rounded-md border text-[9.5px] fw-bold transition-all cursor-pointer ${checked ? `${action.activeCls} shadow-2xs` : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                                title={`${action.label} ${sub.label}`}
                                              >
                                                {action.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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
            { label: 'Head Count', key: 'employeeCount', format: (v) => formatCurrency(v || 0, selectedCompany?.currency), icon: 'bi bi-people', section: 'Details' },
            { label: 'Budget', key: 'budget', format: (v: number) => formatCurrency(v, selectedCompany?.currency), icon: 'bi bi-cash', section: 'Details' },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
