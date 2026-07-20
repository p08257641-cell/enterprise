const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });
(async () => {
  const tables = ['pos_shifts', 'pos_sales', 'pos_discounts', 'pos_returns', 'pos_products', 'pos_customers', 'pos_terminals'];
  for (const t of tables) {
    try {
      const r = await pool.query(`SELECT COUNT(*) as count FROM "${t}" WHERE "companyId" = 'c-acme'`);
      console.log(`${t}: ${r.rows[0].count} rows`);
    } catch (e) {
      try {
        const r = await pool.query(`SELECT COUNT(*) as count FROM ${t} WHERE companyId = 'c-acme'`);
        console.log(`${t}: ${r.rows[0].count} rows`);
      } catch (e2) {
        console.log(`${t}: ERROR - ${e2.message.split('\n')[0]}`);
      }
    }
  }
  await pool.end();
})();
