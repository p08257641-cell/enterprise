ALTER TABLE budgets ADD COLUMN IF NOT EXISTS "items" jsonb DEFAULT '[]'::jsonb;
