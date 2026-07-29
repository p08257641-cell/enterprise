import { dbAll, dbUpdate } from '../db/repo.js';
import * as schema from '../db/schema.js';
import { hashPassword } from '../server/lib/auth.js';
import { eq, isNull, or } from 'drizzle-orm';
import { db } from '../db/index.js';

async function run() {
  console.log('Starting seed user password hash generation...');
  try {
    const allUsers = await dbAll(schema.users);
    
    // Find users with no password hash
    const usersToUpdate = allUsers.filter(u => !u.passwordHash);
    
    if (usersToUpdate.length === 0) {
      console.log('No users found missing a password hash. DB is up to date.');
      process.exit(0);
    }

    console.log(`Found ${usersToUpdate.length} users missing a password hash. Generating...`);
    const defaultPassword = 'Password123!';
    const defaultHash = await hashPassword(defaultPassword);

    for (const user of usersToUpdate) {
      await dbUpdate(schema.users, user.id, { passwordHash: defaultHash });
      console.log(`Updated user ${user.id} (${user.email})`);
    }

    console.log('Successfully updated all users.');
    console.log(`Default password for these accounts is: ${defaultPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating users:', err);
    process.exit(1);
  }
}

run();
