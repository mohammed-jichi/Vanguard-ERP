const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                searchFiles(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('loading') && content.includes('animate-spin') && content.includes('h-screen')) {
                console.log('FOUND SPINNER IN:', fullPath);
            }
            if (content.includes('useState(true)') && fullPath.includes('Context')) {
                console.log('FOUND useState(true) Context IN:', fullPath);
            }
        }
    }
}

searchFiles('c:\\Projects\\Vanguard_ERP');
console.log('Search complete.');
