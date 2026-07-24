-- Add Voting module to Acme Corp's activeModules if missing
UPDATE companies
SET "activeModules" = array_append("activeModules", 'Voting')
WHERE id = 'c-acme' AND NOT ('Voting' = ANY("activeModules"));
