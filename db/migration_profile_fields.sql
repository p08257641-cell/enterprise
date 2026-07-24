-- Migration: Add employee profile fields, profile_update_requests, and attendance_settings

-- 1. Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "dateOfBirth" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "maritalStatus" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "postalCode" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactName" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactPhone" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "emergencyContactRelation" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "employmentType" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "workLocation" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "managerId" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bio text;

-- 2. Create profile_update_requests table
CREATE TABLE IF NOT EXISTS profile_update_requests (
  id text PRIMARY KEY,
  "companyId" text,
  "employeeId" text,
  "employeeName" text,
  department text,
  field text,
  label text,
  "currentValue" text,
  "newValue" text,
  status text,
  "requestedAt" text,
  "processedAt" text,
  "processedBy" text,
  "rejectionReason" text
);

-- 3. Create attendance_settings table
CREATE TABLE IF NOT EXISTS attendance_settings (
  id text PRIMARY KEY,
  "companyId" text,
  grace_minutes integer DEFAULT 15,
  late_threshold_minutes integer DEFAULT 60,
  penalty_type text DEFAULT 'warning',
  deduction_type text DEFAULT 'fixed',
  deduction_value real DEFAULT 0,
  max_warnings integer DEFAULT 3,
  custom_penalty text,
  escalate_after_warnings boolean DEFAULT true,
  updated_at text
);

-- 4. Create bank_account_updates table (may already exist)
CREATE TABLE IF NOT EXISTS bank_account_updates (
  id text PRIMARY KEY,
  "companyId" text,
  "employeeId" text,
  "employeeName" text,
  department text,
  "newBankAccount" text,
  status text,
  "requestedAt" text
);
