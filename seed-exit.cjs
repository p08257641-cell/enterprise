const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', port: 5432, database: 'enterprise', user: 'postgres', password: 'Admin' });

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exit_requests (
        id TEXT PRIMARY KEY,
        companyId TEXT,
        employeeId TEXT,
        employeeName TEXT,
        department TEXT,
        exitType TEXT,
        lastWorkingDay TEXT,
        reason TEXT,
        status TEXT,
        hodApprovedBy TEXT,
        hodApprovedAt TEXT,
        hrApprovedBy TEXT,
        hrApprovedAt TEXT,
        rejectedBy TEXT,
        rejectedAt TEXT,
        notes TEXT,
        createdAt TEXT
      )
    `);
    console.log('exit_requests table created');

    // Seed sample data
    const samples = [
      {
        id: 'exit-1',
        companyId: 'c-acme',
        employeeId: 'emp-acme-1',
        employeeName: 'Sarah Johnson',
        department: 'Sales',
        exitType: 'Resignation',
        lastWorkingDay: '2026-08-31',
        reason: 'Pursuing MBA full-time',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exit-2',
        companyId: 'c-acme',
        employeeId: 'emp-acme-5',
        employeeName: 'Marcus Brody',
        department: 'Logistics & Stock',
        exitType: 'Resignation',
        lastWorkingDay: '2026-09-15',
        reason: 'Relocating to another city',
        status: 'HOD Approved',
        hodApprovedBy: 'Alex Mercer',
        hodApprovedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    for (const s of samples) {
      await pool.query(
        `INSERT INTO exit_requests (id, companyid, employeeid, employeename, department, exittype, lastworkingday, reason, status, hodapprovedby, hodapprovedat, createdat)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.companyId, s.employeeId, s.employeeName, s.department, s.exitType, s.lastWorkingDay, s.reason, s.status, s.hodApprovedBy || null, s.hodApprovedAt || null, s.createdAt]
      );
    }
    console.log('Seeded 2 exit requests');
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
