import React, { useState, useMemo, useEffect } from 'react';
import { Employee, Department } from '../types';

interface OrgChartProps {
  employees: Employee[];
  departments: Department[];
  companyId: string;
  compact?: boolean;
}

const DEPT_COLORS = [
  '#0f172a', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#2563eb', '#65a30d', '#475569',
];

export const OrgChart: React.FC<OrgChartProps> = ({ employees, departments, companyId, compact = false }) => {
  const localEmployees = useMemo(() => (employees || []).filter(e => e.companyId === companyId), [employees, companyId]);
  const localDepts = useMemo(() => (departments || []).filter(d => d.companyId === companyId), [departments, companyId]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(localDepts.map(d => d.id)));
  const [expandedDesig, setExpandedDesig] = useState<Set<string>>(new Set());
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const deptChildren = useMemo(() => {
    const map: Record<string, Department[]> = {};
    localDepts.forEach(d => {
      if (d.parentId) {
        if (!map[d.parentId]) map[d.parentId] = [];
        map[d.parentId].push(d);
      }
    });
    return map;
  }, [localDepts]);

  const rootDepts = useMemo(() => localDepts.filter(d => !d.parentId), [localDepts]);

  const deptEmployeeMap = useMemo(() => {
    const map: Record<string, Employee[]> = {};
    localEmployees.forEach(e => {
      if (!map[e.department]) map[e.department] = [];
      map[e.department].push(e);
    });
    return map;
  }, [localEmployees]);

  const managerName = (managerId?: string): string => {
    if (!managerId) return '';
    const emp = localEmployees.find(e => e.id === managerId || e.userId === managerId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  };

  const toggleExpand = (id: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (expandedDepts.size === localDepts.length) {
      setExpandedDepts(new Set());
    } else {
      setExpandedDepts(new Set(localDepts.map(d => d.id)));
    }
  };

  const toggleDesig = (key: string) => {
    setExpandedDesig(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Auto-expand all designation groups on first load
  useEffect(() => {
    if (expandedDesig.size > 0) return;
    const all: string[] = [];
    localDepts.forEach(dept => {
      const emps = deptEmployeeMap[dept.name] || [];
      const desigs = [...new Set(emps.map(e => e.designation || 'Other'))];
      desigs.forEach(d => all.push(`${dept.id}:${d}`));
    });
    if (all.length > 0) setExpandedDesig(new Set(all));
  }, [localDepts, deptEmployeeMap]);

  const DeptCard = ({ dept, colorIdx, isRoot = false }: { dept: Department; colorIdx: number; isRoot?: boolean }) => {
    const children = deptChildren[dept.id] || [];
    const emps = deptEmployeeMap[dept.name] || [];
    const mgr = managerName(dept.managerId);
    const isExpanded = expandedDepts.has(dept.id);
    const isSelected = selectedDept === dept.id;
    const color = DEPT_COLORS[colorIdx % DEPT_COLORS.length];

    return (
      <div className="flex flex-col items-center">
        {/* The card */}
        <div
          onClick={() => setSelectedDept(isSelected ? null : dept.id)}
          className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 min-w-[180px] max-w-[220px] ${
            isSelected
              ? 'shadow-lg ring-2 ring-offset-1'
              : 'shadow-xs hover:shadow-md hover:-translate-y-0.5'
          }`}
          style={{
            borderColor: color,
            backgroundColor: isRoot ? color : '#fff',
            color: isRoot ? '#fff' : '#1e293b',
            ...(isSelected ? { ringColor: color } : {}),
          }}
        >
          {/* Dept icon */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: isRoot ? 'rgba(255,255,255,0.2)' : color, color: isRoot ? '#fff' : '#fff' }}
            >
              <i className="bi bi-building"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate leading-tight">{dept.name}</div>
              {mgr && <div className="text-[9px] opacity-70 truncate">{mgr}</div>}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[9px] opacity-80">
            <span className="flex items-center gap-1">
              <i className="bi bi-people-fill"></i>
              {emps.length}
            </span>
            {(children.length > 0 || emps.length > 0) && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(dept.id); }}
                className="ml-auto opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
              </button>
            )}
          </div>
        </div>

        {/* Children connector + cards */}
        {isExpanded && children.length > 0 && (
          <div className="flex flex-col items-center mt-0">
            {/* Vertical line */}
            <div className="w-px h-5" style={{ backgroundColor: `${color}40` }}></div>
            {/* Horizontal line spanning all children */}
            {children.length > 1 && (
              <div className="h-px w-full" style={{ backgroundColor: `${color}40` }}></div>
            )}
            {/* Children cards */}
            <div className="flex gap-4 pt-0">
              {children.map((child, i) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical line to child */}
                  <div className="w-px h-4" style={{ backgroundColor: `${DEPT_COLORS[(colorIdx + i + 1) % DEPT_COLORS.length]}40` }}></div>
                  <DeptCard dept={child} colorIdx={colorIdx + i + 1} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee list when expanded and no children */}
        {isExpanded && children.length === 0 && emps.length > 0 && (() => {
          const desigGroups: Record<string, Employee[]> = {};
          emps.forEach(e => {
            const d = e.designation || 'Other';
            if (!desigGroups[d]) desigGroups[d] = [];
            desigGroups[d].push(e);
          });
          const desigKeys = Object.keys(desigGroups);
          return (
            <div className="mt-2 w-full">
              <div className="w-px h-4 mx-auto" style={{ backgroundColor: `${color}30` }}></div>
              <div className="space-y-2">
                {desigKeys.map(desig => {
                  const groupKey = `${dept.id}:${desig}`;
                  const isOpen = expandedDesig.has(groupKey);
                  const groupEmps = desigGroups[desig];
                  return (
                    <div key={groupKey} className="rounded-lg border border-slate-100 bg-white shadow-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleDesig(groupKey); }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} text-[8px] text-slate-400`}></i>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{desig}</span>
                        <span className="text-[8px] text-slate-400 ml-auto">{groupEmps.length}</span>
                      </button>
                      {isOpen && (
                        <div className="px-2.5 pb-2 space-y-1">
                          {(compact ? groupEmps.slice(0, 3) : groupEmps).map(emp => (
                            <div key={emp.id} className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-slate-50 transition-colors">
                              <div className="h-5 w-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[9px] font-semibold text-slate-800 truncate">{emp.firstName} {emp.lastName}</div>
                              </div>
                            </div>
                          ))}
                          {!compact && groupEmps.length > 3 && (
                            <div className="text-center text-[8px] text-slate-400 py-0.5">+{groupEmps.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ── Personnel View ─────────────────────────────────────────────────────
  const deptGroups = useMemo(() => {
    const groups: { name: string; employees: Employee[]; color: string }[] = [];
    const deptNames = [...new Set(localEmployees.map(e => e.department))];
    deptNames.forEach((name, i) => {
      groups.push({
        name,
        employees: deptEmployeeMap[name] || [],
        color: DEPT_COLORS[i % DEPT_COLORS.length],
      });
    });
    return groups;
  }, [localEmployees, deptEmployeeMap]);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider">Organization Chart</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{localDepts.length} departments · {localEmployees.length} employees</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-[10px] fw-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-all cursor-pointer">
            {expandedDepts.size === localDepts.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Hierarchy Cards View */}
      {rootDepts.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex justify-center gap-6 min-w-max px-4">
            {rootDepts.map((root, i) => (
              <DeptCard key={root.id} dept={root} colorIdx={i} isRoot />
            ))}
          </div>
        </div>
      ) : localDepts.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex justify-center gap-6 min-w-max px-4">
            {localDepts.map((dept, i) => (
              <DeptCard key={dept.id} dept={dept} colorIdx={i} isRoot />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 fs-xs">
          <i className="bi bi-diagram-3 fs-2xl block mb-2 text-slate-300"></i>
          No departments configured yet.
        </div>
      )}

      {/* Selected Department Detail Panel */}
      {selectedDept && (() => {
        const dept = localDepts.find(d => d.id === selectedDept);
        if (!dept) return null;
        const emps = deptEmployeeMap[dept.name] || [];
        const children = deptChildren[dept.id] || [];
        const color = DEPT_COLORS[localDepts.indexOf(dept) % DEPT_COLORS.length];
        return (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-[11px] font-bold text-slate-800">{dept.name}</span>
              <span className="text-[9px] text-slate-400">·</span>
              <span className="text-[9px] text-slate-400">{emps.length} employees</span>
              {children.length > 0 && <span className="text-[9px] text-slate-400">· {children.length} sub-departments</span>}
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
              {emps.map(emp => (
                <div key={emp.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white border border-slate-100">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: `${color}12`, color }}>
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-slate-800 truncate">{emp.firstName} {emp.lastName}</div>
                    <div className="text-[8px] text-slate-400 truncate">{emp.designation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
