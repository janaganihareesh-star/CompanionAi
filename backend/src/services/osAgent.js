const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

const WORKSPACE_DIR = path.join(os.homedir(), 'CloserWorkspace');
/**
 * Executes an OS command securely inside a Docker container.
 * WARNING: V14 Production Upgrade. Commands are sandboxed.
 */
exports.executeCommand = async (command) => {
  try {
    const dangerousKeywords = ['rm -rf /', 'format', 'mkfs'];
    if (dangerousKeywords.some(kw => command.toLowerCase().includes(kw))) {
      throw new Error('SECURITY VIOLATION: Extremely dangerous command blocked.');
    }

    // Ensure the workspace directory exists
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });

    // Escape quotes in command for bash execution
    const safeCommand = command.replace(/"/g, '\\"');
    
    // Run the command inside a transient Ubuntu container, mapping the workspace volume
    const dockerCommand = `docker run --rm -v "${WORKSPACE_DIR}:/workspace" -w /workspace ubuntu:latest bash -c "${safeCommand}"`;
    
    console.log('[OS Agent] Executing Sandboxed Docker command:', dockerCommand);
    const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 30000 });
    
    return {
      stdout: stdout || '',
      stderr: stderr || '',
      code: 0
    };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      code: error.code || 1
    };
  }
};

/**
 * Gets real local system metrics.
 */
exports.getSystemMetrics = async () => {
  return {
    platform: os.platform(),
    release: os.release(),
    totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
    freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
    cpus: os.cpus().length,
    cpuModel: os.cpus()[0].model,
    uptime: (os.uptime() / 3600).toFixed(2) + ' Hours'
  };
};
// Helper to ensure path is inside workspace
const resolveSecurePath = (requestedPath) => {
  const absolutePath = path.resolve(WORKSPACE_DIR, requestedPath);
  if (!absolutePath.startsWith(WORKSPACE_DIR)) {
    throw new Error('SECURITY VIOLATION: Path traversal outside workspace is forbidden.');
  }
  return absolutePath;
};

exports.readFile = async (filePath) => {
  try {
    const securePath = resolveSecurePath(filePath);
    const data = await fs.readFile(securePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

exports.writeFile = async (filePath, content) => {
  try {
    const securePath = resolveSecurePath(filePath);
    await fs.mkdir(path.dirname(securePath), { recursive: true });
    await fs.writeFile(securePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Closer-AI v6.0 Omniscient Senses
// ─────────────────────────────────────────────────────────────────────────────

const screenshot = require('screenshot-desktop');

/**
 * Native Desktop Vision (Task 5)
 * Takes a screenshot of the user's actual monitors.
 */
exports.takeDesktopScreenshot = async () => {
  try {
    console.log('[Omniscient OS] Taking native desktop screenshot...');
    const imgBuffer = await screenshot({ format: 'png' });
    const base64 = imgBuffer.toString('base64');
    return { success: true, imageBase64: `data:image/png;base64,${base64}` };
  } catch (error) {
    console.error('[Omniscient OS Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * OS Power Blocker (Task 2)
 * Prevents the Windows PC from sleeping during God-Mode Swarm Tasks.
 */
let powerBlockerInterval = null;
exports.preventSleep = (enable = true) => {
  if (enable) {
    if (powerBlockerInterval) return;
    console.log('[Omniscient OS] Power Blocker Enabled. PC will not sleep.');
    // Keep Windows awake by simulating a harmless keystroke or resetting the idle timer
    powerBlockerInterval = setInterval(() => {
      // Windows specific command to reset idle timer
      exec('powershell.exe -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'{F15}\')"');
    }, 60000); // every 60s
  } else {
    if (powerBlockerInterval) {
      clearInterval(powerBlockerInterval);
      powerBlockerInterval = null;
      console.log('[Omniscient OS] Power Blocker Disabled.');
    }
  }
};
