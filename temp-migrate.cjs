const { Client } = require('pg');
const client = new Client({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });
client.connect().then(() => 
  client.query('ALTER TABLE payslips ADD COLUMN "customTaxesTotal" real, ADD COLUMN "customBenefitsTotal" real, ADD COLUMN "breakdown" text;')
).then(() => {
  console.log('Added missing columns to payslips!');
  client.end();
}).catch(e => {
  console.error(e.message);
  client.end();
});
