const fs = require('fs');

const content = fs.readFileSync('config/reportRegistry.ts', 'utf8');

const regex = /{\s*id:\s*['"]([a-zA-Z0-9_-]+)['"],[\s\S]*?options:\s*\[([\s\S]*?)\]\s*}/g;
let match;
const suspicious = [];

while ((match = regex.exec(content)) !== null) {
  const [full, filterId, optBlock] = match;
  if (
    optBlock.includes('Ahmad Al-Hajj') ||
    optBlock.includes('Maya Khoury') ||
    optBlock.includes('Noura Haddad') ||
    optBlock.includes('Karem Assaf') ||
    optBlock.includes('Mohammad Zein') ||
    optBlock.includes('Jad Tannous') ||
    optBlock.includes('Nour Saliba') ||
    optBlock.includes('Rania Eid') ||
    optBlock.includes('Ali Al-Husseini') ||
    optBlock.includes('Charbel Mattar') ||
    optBlock.includes('Fadi Saade') ||
    optBlock.includes('Sarah Khoury') ||
    optBlock.includes('Ali Hassan') ||
    optBlock.includes('Youssef Abboud') ||
    optBlock.includes('Laila Harb') ||
    optBlock.includes('Rami Haddad') ||
    optBlock.includes('Karim Daher') ||
    optBlock.includes('Samir Mansour') ||
    optBlock.includes('Nadine Ahmar') ||
    optBlock.includes('Rana Jichi')
  ) {
    suspicious.push({ filterId, fullSnippet: full.slice(0, 120) });
  }
}

console.log('Total matching filters:', suspicious.length);
suspicious.forEach((s, idx) => console.log(`${idx + 1}. Filter ID: ${s.filterId} -> ${s.fullSnippet.replace(/\n/g, ' ')}`));
