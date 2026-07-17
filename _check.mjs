import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Admin@127.0.0.1:5432/enterprise' });
const r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'departments' ORDER BY ordinal_position`);
console.log(JSON.stringify(r.rows, null, 2));
await pool.end();
