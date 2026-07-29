import React, { useState } from 'react';
import { ModuleViewsProps, Badge } from './shared';
import { toast } from '../../utils/modal';
import { PendingApproval } from '../../types';

export const PendingApprovalsView: React.FC<ModuleViewsProps> = (props) => {
  const { pendingApprovals = [], selectedUser, selectedCompany, onRefreshPendingApprovals } = props;
  const userRole = selectedUser.activeRole || selectedUser.role;

  const [filterModule, setFilterModule] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);

  const localApprovals = pendingApprovals.filter(a => a.companyId === selectedCompany.id);

  const filtered = localApprovals.filter(a => {
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    if (filterModule !== 'All' && a.module !== filterModule) return false;
    return true;
  });

  const modules = Array.from(new Set(localApprovals.map(a => a.module)));

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/pending-approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', approvedBy: selectedUser.name, userRole, approvedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast(err.error || 'Approval failed', 'error', 'Error');
        return;
      }
      toast('Request approved', 'success', 'Approved');
      setSelectedApproval(null);
      onRefreshPendingApprovals?.();
    } catch (err) {
      console.error(err);
      toast('Failed to approve request', 'error', 'Error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/pending-approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', approvedBy: selectedUser.name, userRole, rejectionReason: 'Rejected by approver', approvedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast(err.error || 'Rejection failed', 'error', 'Error');
        return;
      }
      toast('Request rejected', 'info', 'Rejected');
      setSelectedApproval(null);
      onRefreshPendingApprovals?.();
    } catch (err) {
      console.error(err);
      toast('Failed to reject request', 'error', 'Error');
    }
  };

  const moduleIcons: Record<string, string> = {
    'Leave Requests': 'bi bi-calendar-check',
    'Payroll Processing': 'bi bi-cash-stack',
    'Expense Claims': 'bi bi-receipt',
    'Procurement / PO': 'bi bi-cart3',
    'Recruitment Offers': 'bi bi-person-plus',
    'Asset Requests': 'bi bi-box-seam',
    'Exit Management': 'bi bi-door-closed',
    'Bank Account Updates': 'bi bi-bank',
    'Profile Updates': 'bi bi-person-gear',
    'Role Management': 'bi bi-shield-lock',
  };

  const renderDescription = (desc: string) => {
    if (!desc) return null;
    try {
      const data = JSON.parse(desc);
      if (data.roleId && data.changes) {
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="fs-xs fw-semibold text-slate-500">Role:</span>
              <span className="fs-xs fw-bold text-slate-900">{data.roleName || data.roleId}</span>
            </div>
            {data.changes.name && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="fs-[10px] fw-semibold text-slate-500 uppercase tracking-wider mb-1">Name Change</div>
                <div className="flex items-center gap-2">
                  <span className="fs-xs text-red-500 line-through">{data.changes.name.from}</span>
                  <i className="bi bi-arrow-right text-slate-400"></i>
                  <span className="fs-xs text-emerald-600 fw-semibold">{data.changes.name.to}</span>
                </div>
              </div>
            )}
            {data.changes.modules && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="fs-[10px] fw-semibold text-slate-500 uppercase tracking-wider mb-1">Module Access</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.changes.modules.from?.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-red-100 text-red-600 line-through">{m}</span>
                  ))}
                  <i className="bi bi-arrow-right text-slate-400 mx-1 self-center"></i>
                  {data.changes.modules.to?.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-emerald-100 text-emerald-700">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {data.changes.submenus && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="fs-[10px] fw-semibold text-slate-500 uppercase tracking-wider mb-1">Submenu Access</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {data.changes.submenus.from?.length || 0} items → {data.changes.submenus.to?.length || 0} items
                </div>
              </div>
            )}
            {data.changes.crudPermissions && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="fs-[10px] fw-semibold text-slate-500 uppercase tracking-wider mb-1">CRUD Permissions</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.changes.crudPermissions.from?.map((p: string) => (
                    <span key={p} className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-red-100 text-red-600 line-through">{p}</span>
                  ))}
                  <i className="bi bi-arrow-right text-slate-400 mx-1 self-center"></i>
                  {data.changes.crudPermissions.to?.map((p: string) => (
                    <span key={p} className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-emerald-100 text-emerald-700">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {data.changes.description && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="fs-[10px] fw-semibold text-slate-500 uppercase tracking-wider mb-1">Description</div>
                <div className="flex items-center gap-2">
                  <span className="fs-xs text-slate-500">{data.changes.description.from || '(empty)'}</span>
                  <i className="bi bi-arrow-right text-slate-400"></i>
                  <span className="fs-xs text-slate-900">{data.changes.description.to || '(empty)'}</span>
                </div>
              </div>
            )}
          </div>
        );
      }
      return <div className="fs-xs text-slate-600 whitespace-pre-wrap">{desc}</div>;
    } catch {
      return <div className="fs-xs text-slate-600 whitespace-pre-wrap">{desc}</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl fw-bold text-slate-900">Pending Approvals</h1>
          <p className="fs-sm text-slate-500 mt-1">Review and process requests requiring your approval.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
          {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-md fs-xs fw-semibold cursor-pointer transition-all ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
              {s === 'Pending' && (
                <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1 py-0 text-[9px] fw-bold">
                  {localApprovals.filter(a => a.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 fs-xs fw-medium text-slate-700 bg-white cursor-pointer"
        >
          <option value="All">All Modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Approvals List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <i className="bi bi-check-circle text-slate-400 fs-lg"></i>
            </div>
            <p className="fs-sm fw-semibold text-slate-500">No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} approval requests</p>
            <p className="fs-xs text-slate-400 mt-1">Requests matching your role will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(a => (
              <div
                key={a.id}
                onClick={() => setSelectedApproval(a)}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <i className={`${moduleIcons[a.module] || 'bi bi-gear'} text-slate-500 fs-sm`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="fs-sm fw-semibold text-slate-900 truncate">{a.title}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] fw-bold ${a.status === 'Pending' ? 'bg-amber-100 text-amber-700' : a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {a.module} · Requested by {a.requesterName} · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                    {a.description && (
                      <div className="text-[11px] text-slate-500 mt-1 max-w-lg truncate">{a.description}</div>
                    )}
                  </div>
                </div>

                {a.status === 'Pending' && (
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleReject(a.id)}
                      className="flex items-center gap-1 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all bg-white"
                    >
                      <i className="bi bi-x-lg fs-xs"></i> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(a.id)}
                      className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-emerald-700 transition-all shadow-xs"
                    >
                      <i className="bi bi-check-lg fs-xs"></i> Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApproval(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <i className={`${moduleIcons[selectedApproval.module] || 'bi bi-gear'} text-slate-600`}></i>
                </div>
                <div>
                  <h3 className="fs-sm fw-bold text-slate-900">{selectedApproval.title}</h3>
                  <div className="text-[11px] text-slate-400">{selectedApproval.module}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="bi bi-x-lg text-slate-400 fs-xs"></i>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="fs-xs fw-semibold text-slate-500 w-20">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] fw-bold ${
                  selectedApproval.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  selectedApproval.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedApproval.status}
                </span>
              </div>

              {/* Requester */}
              <div className="flex items-center gap-3">
                <span className="fs-xs fw-semibold text-slate-500 w-20">From</span>
                <span className="fs-xs text-slate-900">{selectedApproval.requesterName}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <span className="fs-xs fw-semibold text-slate-500 w-20">Requested</span>
                <span className="fs-xs text-slate-900">{new Date(selectedApproval.createdAt).toLocaleString()}</span>
              </div>

              {/* Assigned Roles */}
              {selectedApproval.assignedRoles && selectedApproval.assignedRoles.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="fs-xs fw-semibold text-slate-500 w-20 shrink-0 pt-0.5">Approvers</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedApproval.assignedRoles.map(r => (
                      <span key={r} className="px-2 py-0.5 rounded-full text-[10px] fw-semibold bg-slate-100 text-slate-600">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved By */}
              {selectedApproval.approvedBy && (
                <div className="flex items-center gap-3">
                  <span className="fs-xs fw-semibold text-slate-500 w-20">Reviewed</span>
                  <span className="fs-xs text-slate-900">{selectedApproval.approvedBy}</span>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApproval.rejectionReason && (
                <div className="flex items-start gap-3">
                  <span className="fs-xs fw-semibold text-slate-500 w-20 shrink-0 pt-0.5">Reason</span>
                  <span className="fs-xs text-red-600">{selectedApproval.rejectionReason}</span>
                </div>
              )}

              {/* Description / Changes */}
              {selectedApproval.description && (
                <div>
                  <div className="fs-xs fw-semibold text-slate-500 mb-2">Details</div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {renderDescription(selectedApproval.description)}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedApproval.status === 'Pending' && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReject(selectedApproval.id)}
                  className="flex items-center gap-1.5 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all bg-white"
                >
                  <i className="bi bi-x-lg fs-xs"></i> Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApproval.id)}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-emerald-700 transition-all shadow-xs"
                >
                  <i className="bi bi-check-lg fs-xs"></i> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
