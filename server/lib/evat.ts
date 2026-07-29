/**
 * GRA E-VAT API Client Library
 * Handles communication with Ghana Revenue Authority E-VAT system
 */

import { db } from '../../db/index.js';
import { evatConfig, evatSubmissions } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from './logger.js';

const GRA_API_ENDPOINTS = {
  test: 'https://apitest.e-vatgh.com/evat_apiqa',
  production: 'https://api.e-vatgh.com/evat_api',
};

export interface EvatConfig {
  id: string;
  companyId: string;
  companyTin: string;
  companyName: string;
  securityKey: string;
  apiMode: 'test' | 'production';
  apiBaseUrl?: string;
  isActive: boolean;
  lastSignature?: string;
  lastSignatureDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvatSubmission {
  id: string;
  companyId: string;
  entityType: 'invoice' | 'pos_sale' | 'refund' | 'z_report';
  entityId: string;
  entityNumber: string;
  status: 'Pending' | 'Validated' | 'Failed' | 'Queued';
  irn?: string;
  sdcCode?: string;
  qrCodeUrl?: string;
  digitalSignature?: string;
  requestPayload?: any;
  responsePayload?: any;
  errorMessage?: string;
  retryCount: number;
  submittedAt?: string;
  validatedAt?: string;
  createdAt: string;
}

export interface InvoiceItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
}

export interface GraInvoicePayload {
  COMPANY_TIN: string;
  COMPANY_NAMES: string;
  COMPANY_SECURITY_KEY: string;
  INVOICE: {
    INVOICE_NUMBER: string;
    INVOICE_DATE: string;
    CUSTOMER_NAME: string;
    CUSTOMER_TIN?: string;
    TOTAL_AMOUNT: number;
    TAXABLE_AMOUNT: number;
    TAX_AMOUNT: number;
    ITEMS: Array<{
      ITEM_NUMBER: number;
      DESCRIPTION: string;
      QUANTITY: number;
      UNIT_PRICE: number;
      TAX_RATE: number;
      TAX_AMOUNT: number;
    }>;
  };
}

export interface GraResponse {
  status: 'Validated' | 'Failed';
  irn?: string;
  sdcCode?: string;
  qrCodeUrl?: string;
  digitalSignature?: string;
  message?: string;
  raw?: any;
}

export interface EvatHealthCheck {
  online: boolean;
  message: string;
  timestamp: string;
}

export interface EvatValidationResult {
  valid: boolean;
  tin: string;
  name?: string;
  message?: string;
}

/**
 * Get E-VAT configuration for a company
 */
export async function getEvatConfig(companyId: string): Promise<EvatConfig | null> {
  const rows = await db.select().from(evatConfig).where(eq(evatConfig.companyId, companyId));
  if (!rows[0]) return null;
  return {
    ...rows[0],
    apiMode: (rows[0].apiMode || 'test') as 'test' | 'production',
  };
}

/**
 * Create or update E-VAT configuration
 */
export async function upsertEvatConfig(
  companyId: string,
  config: Partial<EvatConfig>
): Promise<EvatConfig> {
  const existing = await getEvatConfig(companyId);
  const now = new Date().toISOString();

  if (existing) {
    const updated = await db.update(evatConfig)
      .set({
        ...config,
        apiMode: config.apiMode,
        updatedAt: now,
      })
      .where(eq(evatConfig.id, existing.id))
      .returning();
    return {
      ...updated[0],
      apiMode: (updated[0].apiMode || 'test') as 'test' | 'production',
    };
  } else {
    const newConfig = await db.insert(evatConfig)
      .values({
        id: `evat-config-${Date.now()}`,
        companyId,
        companyTin: config.companyTin || '',
        companyName: config.companyName || '',
        securityKey: config.securityKey || '',
        apiMode: config.apiMode || 'test',
        apiBaseUrl: config.apiBaseUrl,
        isActive: config.isActive || false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return {
      ...newConfig[0],
      apiMode: (newConfig[0].apiMode || 'test') as 'test' | 'production',
    };
  }
}

/**
 * Get the API base URL for a company's E-VAT config
 */
function getApiBaseUrl(config: EvatConfig): string {
  if (config.apiBaseUrl) return config.apiBaseUrl;
  return GRA_API_ENDPOINTS[config.apiMode] || GRA_API_ENDPOINTS.test;
}

/**
 * Submit an invoice to GRA for validation
 */
export async function submitInvoiceToGRA(
  companyId: string,
  invoice: {
    invoiceNumber: string;
    issueDate: string;
    customerName: string;
    customerTin?: string;
    subtotal: number;
    tax: number;
    total: number;
    items?: InvoiceItem[];
  }
): Promise<GraResponse> {
  const config = await getEvatConfig(companyId);
  if (!config || !config.isActive) {
    return { status: 'Failed', message: 'E-VAT not configured or inactive' };
  }

  const baseUrl = getApiBaseUrl(config);
  const payload: GraInvoicePayload = {
    COMPANY_TIN: config.companyTin,
    COMPANY_NAMES: config.companyName,
    COMPANY_SECURITY_KEY: config.securityKey,
    INVOICE: {
      INVOICE_NUMBER: invoice.invoiceNumber,
      INVOICE_DATE: invoice.issueDate,
      CUSTOMER_NAME: invoice.customerName,
      CUSTOMER_TIN: invoice.customerTin,
      TOTAL_AMOUNT: invoice.total,
      TAXABLE_AMOUNT: invoice.subtotal,
      TAX_AMOUNT: invoice.tax,
      ITEMS: (invoice.items || []).map(item => ({
        ITEM_NUMBER: item.itemNumber,
        DESCRIPTION: item.description,
        QUANTITY: item.quantity,
        UNIT_PRICE: item.unitPrice,
        TAX_RATE: item.taxRate,
        TAX_AMOUNT: item.taxAmount,
      })),
    },
  };

  try {
    logger.info({ companyId, invoiceNumber: invoice.invoiceNumber }, 'Submitting invoice to GRA');

    const response = await fetch(`${baseUrl}/post_receipt_Json.jsp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ companyId, status: response.status, error: errorText }, 'GRA API error');
      return { status: 'Failed', message: `GRA API error: ${response.status}` };
    }

    const data = await response.json();
    logger.info({ companyId, invoiceNumber: invoice.invoiceNumber, response: data }, 'GRA response received');

    // Parse GRA response structure
    const result: GraResponse = {
      status: data.STATUS === 'VALID' || data.status === 'success' ? 'Validated' : 'Failed',
      irn: data.IRN || data.irn,
      sdcCode: data.SDC_CODE || data.sdcCode,
      qrCodeUrl: data.QR_CODE_URL || data.qrCodeUrl,
      digitalSignature: data.SIGNATURE || data.signature,
      message: data.MESSAGE || data.message,
      raw: data,
    };

    return result;
  } catch (error: any) {
    logger.error({ companyId, invoiceNumber: invoice.invoiceNumber, error: error.message }, 'GRA submission failed');

    // Network error or timeout — queue for retry
    if (error.name === 'AbortError' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return { status: 'Failed', message: 'GRA system unavailable, queued for retry' };
    }

    return { status: 'Failed', message: error.message };
  }
}

/**
 * Submit a refund to GRA
 */
export async function submitRefundToGRA(
  companyId: string,
  refund: {
    originalInvoiceNumber: string;
    refundNumber: string;
    refundDate: string;
    customerName: string;
    amount: number;
    taxAmount: number;
  }
): Promise<GraResponse> {
  const config = await getEvatConfig(companyId);
  if (!config || !config.isActive) {
    return { status: 'Failed', message: 'E-VAT not configured or inactive' };
  }

  const baseUrl = getApiBaseUrl(config);
  const payload = {
    COMPANY_TIN: config.companyTin,
    COMPANY_NAMES: config.companyName,
    COMPANY_SECURITY_KEY: config.securityKey,
    REFUND: {
      ORIGINAL_INVOICE_NUMBER: refund.originalInvoiceNumber,
      REFUND_NUMBER: refund.refundNumber,
      REFUND_DATE: refund.refundDate,
      CUSTOMER_NAME: refund.customerName,
      TOTAL_AMOUNT: refund.amount,
      TAX_AMOUNT: refund.taxAmount,
    },
  };

  try {
    const response = await fetch(`${baseUrl}/post_refund_Json.jsp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return { status: 'Failed', message: `GRA API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      status: data.STATUS === 'VALID' ? 'Validated' : 'Failed',
      irn: data.IRN || data.irn,
      sdcCode: data.SDC_CODE || data.sdcCode,
      qrCodeUrl: data.QR_CODE_URL || data.qrCodeUrl,
      digitalSignature: data.SIGNATURE || data.signature,
      message: data.MESSAGE || data.message,
      raw: data,
    };
  } catch (error: any) {
    logger.error({ companyId, error: error.message }, 'GRA refund submission failed');
    return { status: 'Failed', message: error.message };
  }
}

/**
 * Validate a buyer's TIN
 */
export async function validateTIN(
  companyId: string,
  tin: string
): Promise<EvatValidationResult> {
  const config = await getEvatConfig(companyId);
  if (!config || !config.isActive) {
    return { valid: false, tin, message: 'E-VAT not configured or inactive' };
  }

  const baseUrl = getApiBaseUrl(config);
  const payload = {
    COMPANY_TIN: config.companyTin,
    COMPANY_NAMES: config.companyName,
    COMPANY_SECURITY_KEY: config.securityKey,
    TIN: tin,
  };

  try {
    const response = await fetch(`${baseUrl}/post_TinValidation_Json.jsp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { valid: false, tin, message: `GRA API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      valid: data.STATUS === 'VALID' || data.valid === true,
      tin,
      name: data.NAME || data.name,
      message: data.MESSAGE || data.message,
    };
  } catch (error: any) {
    logger.error({ companyId, tin, error: error.message }, 'TIN validation failed');
    return { valid: false, tin, message: error.message };
  }
}

/**
 * Get daily signature from GRA
 */
export async function getDailySignature(companyId: string): Promise<string | null> {
  const config = await getEvatConfig(companyId);
  if (!config || !config.isActive) return null;

  const today = new Date().toISOString().split('T')[0];

  // Return cached signature if from today
  if (config.lastSignature && config.lastSignatureDate === today) {
    return config.lastSignature;
  }

  const baseUrl = getApiBaseUrl(config);
  try {
    const response = await fetch(`${baseUrl}/get_Signature.jsp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        COMPANY_TIN: config.companyTin,
        COMPANY_NAMES: config.companyName,
        COMPANY_SECURITY_KEY: config.securityKey,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const signature = data.SIGNATURE || data.signature;

    if (signature) {
      // Cache the signature
      await db.update(evatConfig)
        .set({ lastSignature: signature, lastSignatureDate: today, updatedAt: new Date().toISOString() })
        .where(eq(evatConfig.id, config.id));
    }

    return signature;
  } catch (error: any) {
    logger.error({ companyId, error: error.message }, 'Failed to get daily signature');
    return null;
  }
}

/**
 * Check GRA system health
 */
export async function healthCheck(companyId: string): Promise<EvatHealthCheck> {
  const config = await getEvatConfig(companyId);
  if (!config) {
    return { online: false, message: 'E-VAT not configured', timestamp: new Date().toISOString() };
  }

  const baseUrl = getApiBaseUrl(config);
  try {
    const response = await fetch(`${baseUrl}/get_VSDC_HealthCheck.jsp`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { online: false, message: `GRA returned ${response.status}`, timestamp: new Date().toISOString() };
    }

    const data = await response.json();
    return {
      online: data.STATUS === 'OK' || data.status === 'online',
      message: data.MESSAGE || data.message || 'GRA system operational',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      online: false,
      message: error.message || 'GRA system unreachable',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Submit a Z-Report (daily summary)
 */
export async function submitZReport(
  companyId: string,
  report: {
    reportDate: string;
    totalSales: number;
    totalTax: number;
    totalTransactions: number;
  }
): Promise<GraResponse> {
  const config = await getEvatConfig(companyId);
  if (!config || !config.isActive) {
    return { status: 'Failed', message: 'E-VAT not configured or inactive' };
  }

  const baseUrl = getApiBaseUrl(config);
  const payload = {
    COMPANY_TIN: config.companyTin,
    COMPANY_NAMES: config.companyName,
    COMPANY_SECURITY_KEY: config.securityKey,
    Z_REPORT: {
      REPORT_DATE: report.reportDate,
      TOTAL_SALES: report.totalSales,
      TOTAL_TAX: report.totalTax,
      TOTAL_TRANSACTIONS: report.totalTransactions,
    },
  };

  try {
    const response = await fetch(`${baseUrl}/post_ZReport_Json.jsp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return { status: 'Failed', message: `GRA API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      status: data.STATUS === 'VALID' ? 'Validated' : 'Failed',
      irn: data.IRN || data.irn,
      sdcCode: data.SDC_CODE || data.sdcCode,
      message: data.MESSAGE || data.message,
      raw: data,
    };
  } catch (error: any) {
    logger.error({ companyId, error: error.message }, 'GRA Z-Report submission failed');
    return { status: 'Failed', message: error.message };
  }
}

/**
 * Queue a submission for later retry
 */
export async function queueSubmission(
  companyId: string,
  entityType: EvatSubmission['entityType'],
  entityId: string,
  entityNumber: string,
  requestPayload: any
): Promise<EvatSubmission> {
  const submission = await db.insert(evatSubmissions)
    .values({
      id: `evat-sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId,
      entityType,
      entityId,
      entityNumber,
      status: 'Queued',
      requestPayload,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return {
    ...submission[0],
    entityType: submission[0].entityType as EvatSubmission['entityType'],
    status: submission[0].status as EvatSubmission['status'],
  };
}

/**
 * Record a GRA submission result
 */
export async function recordSubmission(
  companyId: string,
  entityType: EvatSubmission['entityType'],
  entityId: string,
  entityNumber: string,
  graResponse: GraResponse,
  requestPayload: any
): Promise<EvatSubmission> {
  const submission = await db.insert(evatSubmissions)
    .values({
      id: `evat-sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId,
      entityType,
      entityId,
      entityNumber,
      status: graResponse.status,
      irn: graResponse.irn,
      sdcCode: graResponse.sdcCode,
      qrCodeUrl: graResponse.qrCodeUrl,
      digitalSignature: graResponse.digitalSignature,
      requestPayload,
      responsePayload: graResponse.raw,
      errorMessage: graResponse.message,
      submittedAt: new Date().toISOString(),
      validatedAt: graResponse.status === 'Validated' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return {
    ...submission[0],
    entityType: submission[0].entityType as EvatSubmission['entityType'],
    status: submission[0].status as EvatSubmission['status'],
  };
}

/**
 * Retry a queued submission
 */
export async function retrySubmission(submissionId: string): Promise<GraResponse> {
  const rows = await db.select().from(evatSubmissions).where(eq(evatSubmissions.id, submissionId));
  const submission = rows[0];
  if (!submission) {
    return { status: 'Failed', message: 'Submission not found' };
  }

  if (submission.status !== 'Queued' && submission.status !== 'Failed') {
    return { status: 'Failed', message: `Cannot retry submission with status: ${submission.status}` };
  }

  let result: GraResponse;

  switch (submission.entityType as EvatSubmission['entityType']) {
    case 'invoice':
    case 'pos_sale':
      result = await submitInvoiceToGRA(submission.companyId, submission.requestPayload as any);
      break;
    case 'refund':
      result = await submitRefundToGRA(submission.companyId, submission.requestPayload as any);
      break;
    case 'z_report':
      result = await submitZReport(submission.companyId, submission.requestPayload as any);
      break;
    default:
      return { status: 'Failed', message: `Unknown entity type: ${submission.entityType}` };
  }

  // Update the submission record
  await db.update(evatSubmissions)
    .set({
      status: result.status,
      irn: result.irn,
      sdcCode: result.sdcCode,
      qrCodeUrl: result.qrCodeUrl,
      digitalSignature: result.digitalSignature,
      responsePayload: result.raw,
      errorMessage: result.message,
      retryCount: submission.retryCount + 1,
      submittedAt: new Date().toISOString(),
      validatedAt: result.status === 'Validated' ? new Date().toISOString() : undefined,
    })
    .where(eq(evatSubmissions.id, submissionId));

  return result;
}

/**
 * Retry all queued submissions for a company
 */
export async function retryQueuedSubmissions(companyId?: string): Promise<void> {
  const whereCondition = companyId
    ? and(eq(evatSubmissions.status, 'Queued'), eq(evatSubmissions.companyId, companyId))
    : eq(evatSubmissions.status, 'Queued');

  const queued = await db.select().from(evatSubmissions).where(whereCondition);

  logger.info({ count: queued.length, companyId }, 'Retrying queued E-VAT submissions');

  for (const sub of queued) {
    if (sub.retryCount >= 5) {
      logger.warn({ submissionId: sub.id }, 'Max retries reached, marking as Failed');
      await db.update(evatSubmissions)
        .set({ status: 'Failed', errorMessage: 'Max retries exceeded' })
        .where(eq(evatSubmissions.id, sub.id));
      continue;
    }

    const result = await retrySubmission(sub.id);
    if (result.status === 'Validated') {
      logger.info({ submissionId: sub.id }, 'Retry successful');
    } else {
      logger.warn({ submissionId: sub.id, message: result.message }, 'Retry failed');
    }
  }
}

/**
 * Get submission history for a company
 */
export async function getSubmissions(
  companyId: string,
  options?: {
    entityType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<EvatSubmission[]> {
  const conditions = [eq(evatSubmissions.companyId, companyId)];

  if (options?.entityType) {
    conditions.push(eq(evatSubmissions.entityType, options.entityType));
  }
  if (options?.status) {
    conditions.push(eq(evatSubmissions.status, options.status));
  }

  const rows = await db.select().from(evatSubmissions)
    .where(and(...conditions))
    .orderBy(evatSubmissions.createdAt);

  return rows.slice(0, options?.limit || 100).map(row => ({
    ...row,
    entityType: row.entityType as EvatSubmission['entityType'],
    status: row.status as EvatSubmission['status'],
  }));
}
