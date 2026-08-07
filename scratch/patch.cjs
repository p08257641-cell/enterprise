const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace(/  \/\/ Migrate legacy users - hash blank passwords[\s\S]*?logger\.warn\(\{ err \}, 'Password migration error'\);/, `  // Migrate legacy users - hash blank passwords
  try {
    const allUsers = await dbAll(schema.users);
    for (const u of allUsers) {
      if (!u.passwordHash || (await comparePassword('', u.passwordHash))) {
        const hash = await hashPassword('password123');
        await dbUpdate(schema.users, u.id, { passwordHash: hash });
        logger.info({ userId: u.id, email: u.email }, 'Hashed default password123 for legacy user');
      }
    }
    const acmeCompany = await dbById(schema.companies, 'c-acme');
    if (acmeCompany && acmeCompany.domain !== 'acme.core360.site') {
      await dbUpdate(schema.companies, 'c-acme', { domain: 'acme.core360.site' });
      logger.info('Updated c-acme domain to acme.core360.site');
    }
  } catch (err) {
    logger.warn({ err }, 'Password migration error');`);
fs.writeFileSync('server.ts', c);
