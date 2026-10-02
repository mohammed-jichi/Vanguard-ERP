const fs = require('fs');

const content = fs.readFileSync('config/reportRegistry.ts', 'utf8');

const regex = /options:\s*\[\s*([\s\S]*?)\]\s*,/g;
let match;
const suspiciousNames = [];

while ((match = regex.exec(content)) !== null) {
  const block = match[1];
  if (
    block.includes('Ahmad Al-Hajj') ||
    block.includes('Maya Khoury') ||
    block.includes('Noura Haddad') ||
    block.includes('Karem Assaf') ||
    block.includes('Mohammad Zein') ||
    block.includes('Jad Tannous') ||
    block.includes('Nour Saliba') ||
    block.includes('Rania Eid') ||
    block.includes('Ali Al-Husseini') ||
    block.includes('Charbel Mattar') ||
    block.includes('Fadi Saade') ||
    block.includes('Sarah Khoury') ||
    block.includes('Ali Hassan') ||
    block.includes('Youssef Abboud') ||
    block.includes('Laila Harb') ||
    block.includes('Rami Haddad') ||
    block.includes('Karim Daher') ||
    block.includes('Samir Mansour') ||
    block.includes('Nadine Ahmar') ||
    block.includes('Rana Jichi')
  ) {
    suspiciousNames.push(block.trim());
  }
}

console.log('Found suspicious blocks:', suspiciousNames.length);
suspiciousNames.forEach((b, i) => {
  console.log(`--- BLOCK ${i + 1} ---`);
  console.log(b.slice(0, 250));
});
