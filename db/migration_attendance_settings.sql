ALTER TABLE attendance_settings DROP COLUMN IF EXISTS workstarttime;
ALTER TABLE attendance_settings DROP COLUMN IF EXISTS departmentid;
ALTER TABLE attendance_settings ADD COLUMN IF NOT EXISTS "workStartTime" TEXT DEFAULT '09:00';
ALTER TABLE attendance_settings ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
