/**
 * GRA E-VAT Utility Functions
 */

import { EvatSubmission } from '../types';

/**
 * Get badge styling for E-VAT submission status
 */
export function getEvatStatusBadge(status: string): { color: string; bg: string; label: string } {
  switch (status) {
    case 'Validated':
      return { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Validated' };
    case 'Failed':
      return { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Failed' };
    case 'Queued':
      return { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Queued' };
    case 'Pending':
      return { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', label: 'Pending' };
    default:
      return { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', label: status };
  }
}

/**
 * Format a GRA QR code URL as an HTML img element for print templates
 */
export function formatEvatQrCodeHtml(qrCodeUrl: string, size: number = 120): string {
  if (!qrCodeUrl) return '';
  return `<img src="${qrCodeUrl}" alt="GRA QR Code" style="width: ${size}px; height: ${size}px; image-rendering: pixelated;" />`;
}

/**
 * Format a GRA QR code URL as a React element
 */
export function EvatQrCode({ url, size = 120 }: { url: string; size?: number }) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt="GRA QR Code"
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      className="border border-slate-200 rounded"
    />
  );
}

/**
 * Get entity type display name
 */
export function getEntityTypeLabel(entityType: string): string {
  switch (entityType) {
    case 'invoice': return 'Invoice';
    case 'pos_sale': return 'POS Sale';
    case 'refund': return 'Refund';
    case 'z_report': return 'Z-Report';
    default: return entityType;
  }
}

/**
 * Check if an invoice/POS sale has been GRA-validated
 */
export function isEvatValidated(submission?: EvatSubmission | null): boolean {
  return submission?.status === 'Validated';
}

/**
 * Get E-VAT footer HTML for print templates
 */
export function getEvatFooterHtml(irn?: string, sdcCode?: string, qrCodeUrl?: string): string {
  if (!irn && !sdcCode && !qrCodeUrl) return '';

  let html = '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">';
  html += '<div style="font-size: 10px; color: #6b7280; margin-bottom: 8px;">GRA E-VAT Validation</div>';

  if (irn) {
    html += `<div style="font-size: 10px; color: #374151;"><strong>IRN:</strong> ${irn}</div>`;
  }
  if (sdcCode) {
    html += `<div style="font-size: 10px; color: #374151;"><strong>SDC Code:</strong> ${sdcCode}</div>`;
  }
  if (qrCodeUrl) {
    html += `<div style="margin-top: 8px;"><img src="${qrCodeUrl}" alt="GRA QR Code" style="width: 100px; height: 100px;" /></div>`;
  }

  html += '</div>';
  return html;
}
