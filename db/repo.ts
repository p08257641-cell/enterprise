import { db } from './index';
import * as schema from './schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';

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
