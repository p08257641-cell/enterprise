import { pool } from './db/index.js';

async function updateAcme() {
  try {
    const res = await pool.query('SELECT "activeModules" FROM companies WHERE id = $1', ['c-acme']);
    if (res.rows.length > 0) {
      let modules = res.rows[0].activeModules;
      if (typeof modules === 'string') modules = JSON.parse(modules);
      
      if (!modules.includes('Project Management')) modules.push('Project Management');
      if (!modules.includes('Gallery')) modules.push('Gallery');
      if (!modules.includes('Operations')) modules.push('Operations');
      if (!modules.includes('Workflow & Automation')) modules.push('Workflow & Automation');

      await pool.query(
        'UPDATE companies SET "activeModules" = $1 WHERE id = $2',
        [modules, 'c-acme']
      );
      console.log("Updated active modules:", modules.length);
    } else {
      console.log("Company not found in DB.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateAcme();
