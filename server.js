const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let parsedPort = process.env.PORT;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '-p' || args[i] === '--port') && args[i + 1]) {
    parsedPort = parseInt(args[i + 1], 10);
    break;
  }
}
const PORT = parsedPort || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const handleRequest = async (req, res) => {
  let cleanUrl = req.url.split('?')[0];

  // API Proxy Route for Gemini
  if (cleanUrl === '/api/gemini' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { prompt, systemInstruction } = JSON.parse(body || '{}');
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt || 'Hello' }] }],
            systemInstruction: { parts: [{ text: systemInstruction || 'You are Vara, the voice AI assistant.' }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
          })
        });

        const data = await response.json();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          const text = data.candidates[0].content.parts.map(p => p.text).join('\n');
          res.end(JSON.stringify({ text: text.trim(), success: true }));
        } else {
          res.end(JSON.stringify({ error: 'No text generated', details: data }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (cleanUrl === '/') cleanUrl = '/index.html';
  if (cleanUrl === '/admin' || cleanUrl === '/vanguard-admin' || cleanUrl === '/vanguard-hub' || cleanUrl === '/vanguard/hub') cleanUrl = '/vanguard-admin.html';
  if (cleanUrl === '/erp') cleanUrl = '/index.html';

  let filePath = path.join(__dirname, cleanUrl);

  // If exact file doesn't exist, try adding .html extension
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // If path is a directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 Page Not Found</h1><p><a href="/">Return to Southern Olive ERP Home</a></p></body></html>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Southern Olive Oil Products ERP Portal running at http://localhost:${PORT}/`);
  });
}

module.exports = handleRequest;
