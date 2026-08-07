import 'dotenv/config';
import { db, pool } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function updatePassword() {
  try {
    const hash = bcrypt.hashSync('password123', 10);
    const email = 'sarah.connor@erp-saas.com';
    
    console.log(`Updating password for ${email}...`);
    
    await db.update(users)
      .set({ passwordHash: hash })
      .where(eq(users.email, email));
      
    console.log('Password updated successfully to "password123"!');
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await pool.end();
  }
}

updatePassword();
