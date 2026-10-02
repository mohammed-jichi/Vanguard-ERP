const fs = require('fs');
const path = require('path');

const mockNames = [
  'Sarah Khoury',
  'Ali Hassan',
  'Youssef Abboud',
  'Laila Harb',
  'Rami Haddad',
  'Karim Daher',
  'Samir Mansour',
  'Nadine Ahmar',
  'Rana Jichi',
  'Maya Khoury',
  'Ahmad Al-Hajj',
  'Noura Haddad',
  'Karem Assaf',
  'Mohammad Zein',
  'Jad Tannous',
  'Nour Saliba',
  'Rania Eid',
  'Ali Al-Husseini',
  'Charbel Mattar',
  'Fadi Saade',
  'Beirut Main Branch',
  'Sidon Regional Hub',
  'Tripoli Distribution',
  'Zeit w zaytoun ljanoub',
  '001 - Choueifat Main Facility',
  '002 - Beirut Distribution Hub',
  '003 - Saida Southern Center',
];

const ignoredDirs = new Set(['.git', '.next', 'node_modules', '.agents', '.system_generated', 'brain']);

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].includes(ext)) {
        // Skip scripts/
        if (fullPath.includes(path.sep + 'scripts' + path.sep)) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const name of mockNames) {
          if (content.includes(name)) {
            results.push({ file: fullPath, name });
          }
        }
      }
    }
  }
  return results;
}

const hits = scanDir(process.cwd());
console.log('Total hits across repository:', hits.length);
hits.forEach((h) => console.log(`${h.file}: Found "${h.name}"`));
