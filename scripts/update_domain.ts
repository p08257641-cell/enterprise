import 'dotenv/config';
import { db, pool } from '../db/index';
import { companies } from '../db/schema';
import { eq } from 'drizzle-orm';

async function updateDomain() {
  try {
    const newDomain = 'acme.core360.site';
    const companyId = 'c-acme';
    
    console.log(`Updating domain for ${companyId} to ${newDomain}...`);
    
    await db.update(companies)
      .set({ domain: newDomain })
      .where(eq(companies.id, companyId));
      
    console.log('Domain updated successfully!');
  } catch (err) {
    console.error('Error updating domain:', err);
  } finally {
    await pool.end();
  }
}

updateDomain();
