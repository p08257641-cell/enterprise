# Production Readiness Plan

## Issue 1: Password Authentication (Critical)
- **Problem**: Login endpoint has `if (user.passwordHash) { compare }` — if hash is undefined (all seed users), password check is **skipped entirely**
- **Fix**:
  1. Hash blank passwords for all seed users in `server.ts` login flow (or seed a known default)
  2. Add `passwordHash` to Drizzle schema's users table definition
  3. Update `POST /api/auth/login` to require password comparison (remove the conditional bypass)
  4. Add a `POST /api/auth/reset-password` endpoint

## Issue 2: Multi-tenancy Hardcodes
- **Problem**: Whispers form hardcodes `companyId: 'c-acme'`; initial company select hardcodes
- **Fix**:
  1. Fix LoginPage whispers to derive companyId from user context or make it dynamic
  2. Fix initial company auto-select to use first available company

## Issue 3: E-VAT Settings UI
- **Problem**: Sidebar `admin-evat` link → falls through to Branches tab (no UI)
- **Fix**:
  1. Add `evat` to `adminTab` type union
  2. Add `adminTab === 'evat'` rendering in AdminView
  3. Build E-VAT settings form (TIN, company name, security key, API mode toggle)
  4. Add connection test button
  5. Add submission history table

## Issue 4: Error Handling
- **Problem**: `safeJson` returns parsed error objects on 4xx/5xx → corrupts state
- **Fix**:
  1. Make `safeJson` check `res.ok` and return `[]` on non-2xx responses
  2. Add toast notification for critical data load failures

## Files to modify:
- `server.ts` — login endpoint, seed hash
- `db/schema.ts` — passwordHash column
- `src/App.tsx` — safeJson, initial select
- `src/components/LoginPage.tsx` — whispers companyId
- `src/components/moduleViews/AdminView.tsx` — evat tab
- `src/types.ts` — if needed
