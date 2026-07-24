import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <div className="fs-xs text-slate-500">
        Showing <span className="fw-semibold text-slate-700">{start}</span>–<span className="fw-semibold text-slate-700">{end}</span> of <span className="fw-semibold text-slate-700">{total.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1">
        {onLimitChange && (
          <select value={limit} onChange={e => onLimitChange(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg px-2 py-1 mr-2 cursor-pointer">
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        )}
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors">
          <i className="bi bi-chevron-left"></i>
        </button>
        {pages.map((p, i) => p === '...' ? (
          <span key={`e${i}`} className="px-2 py-1.5 text-xs text-slate-400">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)} className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${p === page ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors">
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
