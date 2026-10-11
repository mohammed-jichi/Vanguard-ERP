const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // We want to replace <Link (with space or newline) with <Link prefetch={false}
  // but avoid replacing if prefetch is already there
  const newContent = content.replace(/<Link(?!\s+prefetch)/g, '<Link prefetch={false}');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

const targetDirs = ['app', 'components'];

for (const dir of targetDirs) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    walkDir(fullPath, processFile);
  }
}
