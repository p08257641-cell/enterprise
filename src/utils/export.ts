// Dependency-free client-side export helpers (CSV + PDF).
import { modalAlert } from './modal';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','));
  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export async function downloadPDF(filename: string, title: string, htmlBody: string) {
  const win = window.open('', '_blank');
  if (!win) {
    await modalAlert('Please allow pop-ups to download the PDF.', { variant: 'warning' });
    return;
  }
  win.document.write(
    `<!DOCTYPE html><html><head><title>${title}</title>` +
    `<style>@page{margin:16mm}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;padding:8px}` +
    `h2{margin:0 0 12px;font-size:18px}.meta{color:#64748b;font-size:12px;margin-bottom:16px}` +
    `table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:7px 9px;text-align:left;font-size:12px}` +
    `th{background:#f1f5f9;font-weight:600}.right{text-align:right}.total{border-top:2px solid #cbd5e1;font-weight:700}</style></head>` +
    `<body><h2>${title}</h2><div class="meta">Generated ${new Date().toLocaleString()}</div>${htmlBody}</body></html>`
  );
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

export function rowsToHtmlTable(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  rightAlignCols: number[] = []
): string {
  const th = headers.map((h) => `<th>${escapeCell(h)}</th>`).join('');
  const tr = rows
    .map((r) => {
      const tds = r
        .map((c, i) => `<td class="${rightAlignCols.includes(i) ? 'right' : ''}">${escapeCell(c)}</td>`)
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}
