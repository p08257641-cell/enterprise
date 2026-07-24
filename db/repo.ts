import { db } from './index';
import * as schema from './schema';
import { eq, and, inArray, desc, sql, count } from 'drizzle-orm';

export { db, schema };

export async function dbAll<T = any>(table: any): Promise<T[]> {
  return (await db.select().from(table)) as T[];
}

export async function dbByCompany<T = any>(table: any, companyId: string): Promise<T[]> {
  return (await db.select().from(table).where(eq(table.companyId, companyId))) as T[];
}

export async function dbById<T = any>(table: any, id: string): Promise<T | undefined> {
  const rows = await db.select().from(table).where(eq(table.id, id));
  return rows[0] as T | undefined;
}

export async function dbInsert<T = any>(table: any, values: any): Promise<T> {
  const rows = await db.insert(table).values(values).returning();
  return rows[0] as T;
}

export async function dbInsertMany<T = any>(table: any, values: any[]): Promise<T[]> {
  if (!values.length) return [];
  const rows = await db.insert(table).values(values).returning();
  return rows as T[];
}

export async function dbUpdate<T = any>(table: any, id: string, values: any): Promise<T | undefined> {
  const rows = await db.update(table).set(values).where(eq(table.id, id)).returning();
  return rows[0] as T | undefined;
}

export async function dbDelete(table: any, id: string): Promise<void> {
  await db.delete(table).where(eq(table.id, id));
}

// Fire-and-forget audit logging (keeps logAudit synchronous for existing callers).
export function logAuditDb(entry: any): void {
  db.insert(schema.auditLogs).values(entry).catch((e) => console.error('audit log failed', e));
}

// ── Pagination Helpers ──────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function dbByCompanyPaginated<T = any>(
  table: any,
  companyId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(200, Math.max(1, opts.limit || 50));
  const offset = (page - 1) * limit;

  const [{ total }] = await db.select({ total: count() }).from(table).where(eq(table.companyId, companyId));
  const data = await db.select().from(table).where(eq(table.companyId, companyId)).limit(limit).offset(offset);

  return {
    data: data as T[],
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
}

export async function dbAllPaginated<T = any>(
  table: any,
  opts: { page?: number; limit?: number; where?: any } = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(200, Math.max(1, opts.limit || 50));
  const offset = (page - 1) * limit;

  const baseQuery = opts.where ? db.select({ total: count() }).from(table).where(opts.where) : db.select({ total: count() }).from(table);
  const [{ total }] = await baseQuery;

  const dataQuery = opts.where ? db.select().from(table).where(opts.where).limit(limit).offset(offset) : db.select().from(table).limit(limit).offset(offset);
  const data = await dataQuery;

  return {
    data: data as T[],
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
}
