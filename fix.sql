ALTER TABLE custom_roles ADD COLUMN "crudPermissions" text[] DEFAULT ARRAY[]::text[];
