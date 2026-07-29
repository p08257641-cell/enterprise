const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/components'));
let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix button overlaps
  content = content.replace(/className="flex gap-2"/g, 'className="flex flex-wrap gap-2"');
  content = content.replace(/className="flex gap-3"/g, 'className="flex flex-wrap gap-3"');
  content = content.replace(/className="flex items-center gap-2"/g, 'className="flex flex-wrap items-center gap-2"');
  content = content.replace(/className="flex items-center gap-3"/g, 'className="flex flex-wrap items-center gap-3"');

  // Fix table overflows
  content = content.replace(/className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"/g, 'className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden overflow-x-auto"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${path.basename(file)}`);
  }
});

console.log(`\nFinished! Modified ${modifiedFiles} files.`);
