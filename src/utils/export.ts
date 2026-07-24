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

export async function downloadPDF(
  filename: string,
  title: string,
  htmlBody: string,
  company?: { name: string; logo?: string }
) {
  const win = window.open('', '_blank');
  if (!win) {
    await modalAlert('Please allow pop-ups to download the PDF.', { variant: 'warning' });
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const companyName = company?.name || '';

  const logoHtml = company?.logo
    ? `<div style="display:flex;align-items:center;gap:14px;"><img src="${company.logo}" alt="" style="height:44px;object-fit:contain;" /><div style="border-left:2px solid #e2e8f0;padding-left:14px;"><div style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">${companyName}</div><div style="font-size:10px;color:#94a3b8;margin-top:1px;">${title}</div></div></div>`
    : `<div><div style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${companyName}</div><div style="font-size:10px;color:#94a3b8;margin-top:2px;">${title}</div></div>`;

  const signatureHtml = `
    <div style="margin-top:60px;display:flex;justify-content:flex-end;">
      <div style="text-align:center;min-width:220px;">
        <div style="font-family:'Georgia','Times New Roman',serif;font-size:22px;color:#0f172a;font-style:italic;padding-bottom:6px;border-bottom:1.5px solid #cbd5e1;margin-bottom:6px;">
          ${companyName || 'Authorized'}
        </div>
        <div style="font-size:10px;color:#64748b;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Authorized Signatory</div>
        <div style="font-size:9px;color:#94a3b8;margin-top:3px;">Date: ${dateStr}</div>
      </div>
    </div>
  `;

  const css = `
    @page { margin: 18mm 16mm 20mm 16mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      font-size: 12px;
      line-height: 1.6;
      background: #fff;
      padding: 0;
    }

    /* ── Header ─────────────────────────────────────────────────── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 2px solid #0f172a;
    }
    .doc-meta {
      text-align: right;
      font-size: 10px;
      color: #64748b;
      line-height: 1.8;
    }
    .doc-meta strong { color: #334155; }

    /* ── Title ──────────────────────────────────────────────────── */
    .doc-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 11px;
      color: #64748b;
    }

    /* ── Table ──────────────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 11px;
    }
    thead th {
      background: #0f172a;
      color: #fff;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 10px 12px;
      text-align: left;
      border: none;
    }
    tbody td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #f1f5f9; }
    tbody tr:last-child td { border-bottom: none; }

    .right { text-align: right; }
    .center { text-align: center; }

    tfoot td, .total-row td {
      border-top: 2px solid #0f172a !important;
      font-weight: 700;
      background: #f1f5f9 !important;
      padding: 10px 12px;
    }

    /* ── Summary Boxes ──────────────────────────────────────────── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .summary-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .summary-box .label {
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    .summary-box .value {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
    }

    /* ── Footer ─────────────────────────────────────────────────── */
    .doc-footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }

    /* ── Section Heading ────────────────────────────────────────── */
    .section-heading {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin: 20px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    @media print {
      body { padding: 0; }
      .doc-header { break-inside: avoid; }
      table { break-inside: auto; }
      tr { break-inside: avoid; }
    }
  `;

  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>
      <div class="doc-header">
        <div>
          <div class="doc-title">${title}</div>
          <div class="doc-subtitle">${companyName}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
          ${company?.logo ? `<img src="${company.logo}" alt="" style="height:36px;object-fit:contain;margin-bottom:4px;" />` : ''}
          <div class="doc-meta">
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>Time:</strong> ${timeStr}</div>
            <div><strong>Ref:</strong> ${filename.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 30).toUpperCase()}</div>
          </div>
        </div>
      </div>
      ${htmlBody}
      ${signatureHtml}
      <div class="doc-footer">
        <div>${companyName} — Confidential</div>
        <div>Generated ${dateStr} at ${timeStr}</div>
      </div>
    </body></html>`
  );
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
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
