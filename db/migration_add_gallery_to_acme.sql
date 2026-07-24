-- Add Gallery module to Acme Corp's activeModules if missing
UPDATE companies
SET "activeModules" = array_append("activeModules", 'Gallery')
WHERE id = 'c-acme' AND NOT ('Gallery' = ANY("activeModules"));
