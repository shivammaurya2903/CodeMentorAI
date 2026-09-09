const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const backendEntry = path.join(backendDir, 'index.js');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.platform === 'win32' ? 'node.exe' : 'node';

function ensureDependencies(dir, name) {
  if (fs.existsSync(path.join(dir, 'node_modules'))) {
    return;
  }

  console.log(`Installing ${name} dependencies...`);
  const installResult = spawnSync(npmCommand, ['install'], {
    cwd: dir,
    stdio: 'inherit',
  });

  if (installResult.status !== 0) {
    process.exit(installResult.status || 1);
  }
}

function startViteFrontendServer() {
  console.log('🚀 Starting React + Vite Frontend Dev Server...');
  return spawn(npmCommand, ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });
}

function startBackendServer() {
  console.log('⚡ Starting Express Backend Server...');
  return spawn(nodeCommand, [backendEntry], {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  });
}

ensureDependencies(backendDir, 'backend');
ensureDependencies(frontendDir, 'frontend');

const frontendProcess = startViteFrontendServer();
const backendProcess = startBackendServer();

function shutdown(signal) {
  console.log(`\nShutting down servers (${signal})...`);
  frontendProcess.kill(signal);
  backendProcess.kill(signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

frontendProcess.on('exit', (code) => {
  backendProcess.kill();
  process.exit(code || 0);
});

backendProcess.on('exit', (code) => {
  frontendProcess.kill();
  process.exit(code || 0);
});