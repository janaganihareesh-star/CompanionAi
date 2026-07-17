const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let dockerProcess = null;

/**
 * Initializes a pseudo-terminal (using Docker spawn) and pipes it to Socket.IO.
 * This runs an ephemeral, sandboxed Alpine Linux container instead of a host shell.
 */
exports.initTerminal = (io) => {
  // Prevent multiple terminal instances from stacking up
  if (dockerProcess) {
    dockerProcess.kill();
  }

  const containerName = `closer-terminal-${crypto.randomBytes(4).toString('hex')}`;
  console.log(`[TerminalService] Spawning sandboxed Docker terminal: ${containerName}`);

  // Spawn an interactive alpine shell inside Docker with strict resource limits
  // Memory: 128M, CPUs: 0.5
  dockerProcess = spawn('docker', [
    'run', '-i', '--rm',
    '--name', containerName,
    '--memory=128m', '--cpus=0.5',
    '--network=none', // Restrict network access completely
    'alpine', 'sh'
  ]);

  dockerProcess.on('error', (err) => {
    console.error('[TerminalService] Docker spawn error. Is Docker installed?', err);
    io.emit('terminal:data', '\r\n[ERROR] Failed to start secure terminal. Ensure Docker is running.\r\n');
  });

  io.on('connection', (socket) => {
    socket.emit('terminal:data', 'Welcome to Closer-AI Secure Sandboxed Terminal (Alpine Linux)\r\n');
    socket.emit('terminal:data', 'Type commands to interact. Network and host access are disabled.\r\n$ ');

    socket.on('terminal:input', (data) => {
      if (dockerProcess && dockerProcess.stdin.writable) {
        dockerProcess.stdin.write(data);
      }
    });
    
    // When the agent executes a command autonomously
    socket.on('terminal:execute', (command) => {
      if (dockerProcess && dockerProcess.stdin.writable) {
        dockerProcess.stdin.write(`${command}\n`);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      // Keep stateful/persistent if needed
    });
  });

  dockerProcess.stdout.on('data', (data) => {
    // Basic formatting for xterm.js (replacing \n with \r\n)
    const output = data.toString().replace(/\n/g, '\r\n');
    io.emit('terminal:data', output);
  });

  dockerProcess.stderr.on('data', (data) => {
    const output = data.toString().replace(/\n/g, '\r\n');
    io.emit('terminal:data', output);
  });

  dockerProcess.on('exit', (code) => {
    console.log(`[TerminalService] Sandboxed container exited with code ${code}`);
    io.emit('terminal:data', `\r\n[Session ended with code ${code}]\r\n`);
  });
};

