const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

const row = db.prepare('SELECT * FROM companies WHERE id = ?').get('c-acme');
if (row) {
  let modules = JSON.parse(row.activeModules);
  if (!modules.includes('Project Management')) {
    modules.push('Project Management');
  }
  if (!modules.includes('Gallery')) modules.push('Gallery');
  if (!modules.includes('Operations')) modules.push('Operations');
  
  db.prepare('UPDATE companies SET activeModules = ? WHERE id = ?').run(JSON.stringify(modules), 'c-acme');
  console.log("Updated activeModules for Acme:", modules.length);
} else {
  console.log("Company not found");
}
