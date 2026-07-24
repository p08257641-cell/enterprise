const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Target only text sizes (not colors like text-white or alignments like text-center)
const textSizeRegex = /\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/g;

// Target only font weights
const fontWeightRegex = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g;

let updatedFiles = 0;

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (textSizeRegex.test(content)) {
      content = content.replace(textSizeRegex, (match, size) => {
        return `fs-${size}`;
      });
      changed = true;
    }

    if (fontWeightRegex.test(content)) {
      content = content.replace(fontWeightRegex, (match, weight) => {
        return `fw-${weight}`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
    }
  }
});

console.log(`Updated typography classes in ${updatedFiles} files.`);
