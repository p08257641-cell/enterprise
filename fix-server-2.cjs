const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStrGet = `app.get('/api/employees', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.employees);
  res.json(companyId ? all.filter((e: any) => e.companyId === companyId) : all);
    }));`;

const replaceStrGet = `app.get('/api/employees', asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const all = await dbAll<any>(schema.employees);
  const parsed = all.map(e => ({
    ...e,
    assignedTaxes: e.assignedTaxes ? JSON.parse(e.assignedTaxes) : [],
    assignedBenefits: e.assignedBenefits ? JSON.parse(e.assignedBenefits) : [],
    bankAccount: e.bankAccount ? JSON.parse(e.bankAccount) : undefined
  }));
  res.json(companyId ? parsed.filter((e: any) => e.companyId === companyId) : parsed);
    }));`;

const targetStrPost = `app.post('/api/employees', asyncHandler(async (req, res) => {
  const { companyId, firstName, lastName, email, department, designation, branch, salary } = req.body;

  const empId = \`emp-\${Date.now()}\`;
  const empNumber = \`EMP-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`;

  const newEmp: Employee = {
    id: empId,
    companyId,
    employeeNumber: empNumber,
    firstName,
    lastName,
    email,
    department,
    designation,
    branch,
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: Number(salary) || 5000
  };`;

const replaceStrPost = `app.post('/api/employees', asyncHandler(async (req, res) => {
  const { companyId, firstName, lastName, email, department, designation, branch, salary, assignedTaxes, assignedBenefits, bankAccount } = req.body;

  const empId = \`emp-\${Date.now()}\`;
  const empNumber = \`EMP-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`;

  const newEmp: any = {
    id: empId,
    companyId,
    employeeNumber: empNumber,
    firstName,
    lastName,
    email,
    department,
    designation,
    branch,
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: Number(salary) || 5000,
    assignedTaxes: assignedTaxes ? JSON.stringify(assignedTaxes) : '[]',
    assignedBenefits: assignedBenefits ? JSON.stringify(assignedBenefits) : '[]',
    bankAccount: bankAccount || undefined
  };`;

if (code.includes(targetStrGet)) {
  code = code.replace(targetStrGet, replaceStrGet);
} else {
  console.log("targetStrGet not found");
}

if (code.includes(targetStrPost)) {
  code = code.replace(targetStrPost, replaceStrPost);
} else {
  console.log("targetStrPost not found");
}

fs.writeFileSync('server.ts', code);
console.log('Done!');
