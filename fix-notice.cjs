const { Pool } = require('pg');
const p = new Pool({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });
(async () => {
  try {
    await p.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS "noticePeriodDays" INTEGER DEFAULT 30');
    await p.query("UPDATE companies SET \"noticePeriodDays\" = 30 WHERE \"noticePeriodDays\" IS NULL");
    console.log('Added noticePeriodDays column, default 30 days');
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.end();
  }
})();
