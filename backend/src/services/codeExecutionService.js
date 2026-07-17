const vm = require('vm');
const path = require('path');
const os = require('os');
const osAgent = require('./osAgent');

const axios = require('axios');

const { exec } = require('child_process');

/**
 * Executes AI-generated code securely.
 * Hybrid Mode: Routes to Piston Docker by default. If network is required, routes to Local Native OS.
 */
exports.executeSecurely = async (codeToRun, language = 'javascript') => {
  return new Promise(async (resolve, reject) => {
    try {
// Removed Hybrid Execution Mode (RCE Security Vulnerability)
      // All code execution is now strictly isolated in the Piston Sandbox.
      // Phase 2 Optimization: Static Analysis to prevent Piston waste
      const dangerousPatterns = [
        /while\s*\(\s*true\s*\)/i,          // Infinite loops
        /require\(['"]child_process['"]\)/, // Local process execution
        /require\(['"]fs['"]\)/,            // File system access
        /import\s+os/,                      // Python OS module
        /import\s+subprocess/,              // Python subprocess
        /__import__\(['"]os['"]\)/          // Python hidden import
      ];

      for (let pattern of dangerousPatterns) {
        if (pattern.test(codeToRun)) {
          console.warn(`[Security] Blocked execution of dangerous pattern: ${pattern}`);
          return reject(`ERROR: Code rejected by Static Analysis. Dangerous pattern detected.`);
        }
      }

      const langMap = {
        'javascript': 'javascript',
        'js': 'javascript',
        'python': 'python',
        'py': 'python',
        'cpp': 'cpp',
        'c++': 'cpp',
        'java': 'java'
      };
      
      const pistonLang = langMap[language.toLowerCase()] || 'javascript';
      const versionMap = {
        'javascript': '18.15.0',
        'python': '3.10.0',
        'cpp': '10.2.0',
        'java': '15.0.2'
      };

      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: pistonLang,
        version: versionMap[pistonLang] || '*',
        files: [
          {
            name: `main.${language === 'python' || language === 'py' ? 'py' : 'js'}`,
            content: codeToRun
          }
        ],
        compile_timeout: 10000,
        run_timeout: 3000
      });

      const { run, compile } = response.data;
      if (compile && compile.code !== 0) {
        return reject(`ERROR: Compilation failed:\n${compile.stderr}`);
      }
      if (run.code !== 0) {
        return reject(`ERROR: Runtime failed:\n${run.stderr}`);
      }
      
      resolve(run.stdout || run.stderr || 'Execution completed with no output.');
    } catch (err) {
      reject(`Sandbox Error: ${err.message}`);
    }
  });
};

/**
 * Safely saves code to the desktop if requested.
 */
exports.saveToDesktopSecurely = async (code, extension = 'js') => {
  const desktopPath = path.join(os.homedir(), 'Desktop', `CloserSwarmOutput.${extension}`);
  await osAgent.writeFile(desktopPath, code);
  return desktopPath;
};
