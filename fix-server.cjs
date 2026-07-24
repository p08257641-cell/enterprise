const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  const empId = \`emp-\${Date.now()}\`;
  const empNumber = \`EMP-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`;

      sortCode: bankAccount.sortCode
    }) : undefined
  };`;

const replaceStr = `  const empId = \`emp-\${Date.now()}\`;
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

if (code.includes('sortCode: bankAccount.sortCode')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed server.ts');
} else {
  console.log('Could not find target string');
}
