const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'Admin',
    database: 'enterprise',
  });
  const password = process.argv[2] || 'CompanyAdmin@2026';
  const hash = await bcrypt.hash(password, 12);
  const res = await pool.query(
    'UPDATE users SET "passwordHash" = $1 WHERE email = $2 RETURNING email, name, role',
    [hash, 'alex.mercer@acme-mfg.com']
  );
  if (res.rowCount === 0) {
    console.error('User not found');
    process.exit(1);
  }
  console.log('Updated:', JSON.stringify(res.rows[0]));
  console.log('Password:', password);
  await pool.end();
})();
