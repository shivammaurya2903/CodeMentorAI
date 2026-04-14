const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const backendEntry = path.join(backendDir, 'index.js');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.platform === 'win32' ? 'node.exe' : 'node';

function ensureBackendDependencies() {
  if (fs.existsSync(path.join(backendDir, 'node_modules'))) {
    return;
  }

  console.log('Installing backend dependencies...');
  const installResult = spawnSync(npmCommand, ['install'], {
    cwd: backendDir,
    stdio: 'inherit',
  });

  if (installResult.status !== 0) {
    process.exit(installResult.status || 1);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
  };

  return map[ext] || 'application/octet-stream';
}

function startFrontendServer() {
  const port = Number(process.env.FRONTEND_PORT || 5500);

  const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let requestPath = decodeURIComponent(requestUrl.pathname);

    if (requestPath === '/') {
      requestPath = '/index.html';
    }

    const normalizedPath = path.normalize(requestPath).replace(/^([.]{2}[\\/])+/, '');
    const filePath = path.join(frontendDir, normalizedPath);

    if (!filePath.startsWith(frontendDir)) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': getContentType(filePath),
      });
      res.end(data);
    });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Frontend server running on http://localhost:${port}`);
  });

  return server;
}

function startBackendServer() {
  return spawn(nodeCommand, [backendEntry], {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  });
}

ensureBackendDependencies();

const frontendServer = startFrontendServer();
const backendProcess = startBackendServer();

function shutdown(signal) {
  console.log(`\nShutting down (${signal})...`);
  frontendServer.close();
  backendProcess.kill(signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

backendProcess.on('exit', (code) => {
  frontendServer.close();
  process.exit(code || 0);
});