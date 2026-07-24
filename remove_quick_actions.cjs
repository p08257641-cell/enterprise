const fs = require('fs');
let code = fs.readFileSync('src/components/RoleDashboards.tsx', 'utf8');

// The Quick Actions block starts with:
// <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5">
//   <h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>

const quickActionRegex = /<div className="rounded-xl border border-slate-200\/80 bg-white shadow-xs p-5">\s*<h3 className="fs-xs fw-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions<\/h3>.*?<\/div>\s*<\/div>/gs;

const initialLength = code.length;
code = code.replace(quickActionRegex, '');
const finalLength = code.length;

if (initialLength !== finalLength) {
  fs.writeFileSync('src/components/RoleDashboards.tsx', code);
  console.log('Removed Quick Actions successfully.');
} else {
  console.log('No Quick Actions found.');
}
