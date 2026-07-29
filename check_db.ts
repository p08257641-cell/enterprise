import { dbAll } from './db/repo.js';
import * as schema from './db/schema.js';
async function run() {
  const users = await dbAll(schema.users);
  const emps = await dbAll(schema.employees);
  console.log('Users:', users.slice(0, 3).map(u => u.id));
  console.log('Employees:', emps.slice(0, 3).map(e => ({ id: e.id, userId: e.userId })));
  process.exit(0);
}
run();
