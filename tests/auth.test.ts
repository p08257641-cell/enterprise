import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../server/lib/auth';

describe('Auth', () => {
  const payload = {
    userId: 'u-test',
    companyId: 'c-test',
    role: 'Employee',
    roles: ['Employee'],
    permissions: [],
  };

  it('signToken returns a string', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifyToken decodes the payload', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('u-test');
    expect(decoded.companyId).toBe('c-test');
    expect(decoded.role).toBe('Employee');
  });

  it('verifyToken rejects invalid tokens', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
