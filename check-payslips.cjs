const { Client } = require('pg');
const client = new Client({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });
client.connect().then(() => 
  client.query('SELECT * FROM payslips LIMIT 1')
).then((res) => {
  console.log(res.fields.map(f => f.name));
  client.end();
}).catch(e => {
  console.error(e.message);
  client.end();
});
