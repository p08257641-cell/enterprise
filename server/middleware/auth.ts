import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const hasAll = permissions.every(p => req.user!.permissions.includes(p));
    if (!hasAll) return res.status(403).json({ error: 'Missing required permissions' });
    next();
  };
}

export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'Super Admin') {
    try {
      const existingQuery = (req.query && typeof req.query === 'object') ? req.query : {};
      const newQuery = { ...existingQuery, companyId: req.user.companyId };
      Object.defineProperty(req, 'query', {
        value: newQuery,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      // Fallback
    }

    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      try {
        req.body.companyId = req.user.companyId;
      } catch {
        // Fallback
      }
    }
  }
  next();
}

