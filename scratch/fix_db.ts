import { pool } from '../db/index.js';

pool.query('ALTER TABLE companies ADD COLUMN "loginImages" text[]')
  .then(() => {
    console.log('success');
    pool.end();
  })
  .catch(e => {
    console.error(e);
    pool.end();
  });
