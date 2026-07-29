const fs = require('fs');
const { Client } = require('pg');
const client = new Client({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });
const sql = fs.readFileSync('db/migration_chat_reads.sql', 'utf8');

client.connect().then(() => 
  client.query(sql)
).then(() => {
  console.log('Applied migration_chat_reads.sql!');
  client.end();
}).catch(e => {
  console.error(e.message);
  client.end();
});
