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
  '.mp3': 'audio/mpeg',
};
const port = Number(process.env.PORT || 5173);

http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const relativePath = decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname).replace(/^[/\\]+/, '');
  let filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error && /^\d+\.webp$/i.test(relativePath)) {
      filePath = path.resolve(__dirname, relativePath);
      fs.readFile(filePath, sendFile);
      return;
    }
    sendFile(error, data);
  });

  function sendFile(error, data) {
    if (error) {
      response.writeHead(404).end('Not found');
      return;
    }
    const headers = { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    // Safari en iPhone pide el audio por partes (Range) y no lo reproduce si el servidor no responde así.
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : Math.max(0, data.length - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1 });
      response.end(request.method === 'HEAD' ? undefined : data.subarray(start, end + 1));
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Length': data.length });
    response.end(request.method === 'HEAD' ? undefined : data);
  }
}).listen(port, '0.0.0.0', () => console.log(`Preview: http://0.0.0.0:${port}`));
