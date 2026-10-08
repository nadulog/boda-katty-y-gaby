const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.ics': 'text/calendar; charset=utf-8',
};

http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const relativePath = decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname).replace(/^[/\\]+/, '');
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(5173, '0.0.0.0', () => console.log('Preview: http://0.0.0.0:5173'));
