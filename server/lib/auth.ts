import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-erp-secret-change-in-production';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'enterprise-erp-secret-change-in-production') {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production!');
}
const TOKEN_EXPIRY = '24h';

export interface TokenPayload {
  userId: string;
  companyId: string;
  role: string;
  roles: string[];
  permissions: string[];
  crudPermissions?: string[];
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function crudGuard(module: string, action: string, options?: { allowOnEmpty?: boolean }) {
  return (req: any, res: any, next: any) => {
    const perms = req.user?.crudPermissions as string[] | undefined;
    if (!perms || perms.length === 0) return next();
    if (perms.includes(`${module}.${action}`)) return next();
    return res.status(403).json({ error: `Missing ${module}.${action} permission` });
  };
}

import crypto from 'crypto';

export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature.replace(/^sha256=/, ''));
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

export function maskSensitiveFields<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  const sensitiveKeys = [
    'whatsappApiKey', 'smtpPassword', 'emailApiKey', 'securityKey',
    'smsApiKey', 'smsApiSecret', 'password', 'apiSecret', 'secret'
  ];
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.includes(key) && typeof clone[key] === 'string' && clone[key].length > 0) {
      clone[key as keyof T] = '••••••••' as any;
    }
  }
  return clone;
}

