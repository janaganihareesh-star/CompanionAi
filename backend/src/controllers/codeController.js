/**
 * codeController.js — Engine 37
 */
const codingService = require('../services/codingService');
const UserPreference = require('../models/UserPreference');

async function getLang(userId) {
  const p = await UserPreference.findOne({ userId }).select('language').lean();
  return p?.language || 'English';
}

exports.generateCode = async (req, res, next) => {
  try {
    const { description, language, framework, requirements } = req.body;
    if (!description || !language) return res.status(400).json({ success: false, message: 'description and language are required.' });
    const result = await codingService.generateCode({ description, language, framework, requirements });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.debugCode = async (req, res, next) => {
  try {
    const { code, language, errorMessage, context } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.debugCode({ code, language, errorMessage, context });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.reviewCode = async (req, res, next) => {
  try {
    const { code, language, reviewType } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.reviewCode({ code, language, reviewType });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.optimizeCode = async (req, res, next) => {
  try {
    const { code, language, optimizationGoal } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.optimizeCode({ code, language, optimizationGoal });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.generateTests = async (req, res, next) => {
  try {
    const { code, language, testFramework, coverageLevel } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.generateTests({ code, language, testFramework, coverageLevel });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.generateDocs = async (req, res, next) => {
  try {
    const { code, language, docStyle } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.generateDocumentation({ code, language, docStyle });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.explainCode = async (req, res, next) => {
  try {
    const { code, language, level } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const lang = await getLang(req.user.id);
    const result = await codingService.explainCode({ code, language, level, language: lang });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.securityReview = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ success: false, message: 'code and language are required.' });
    const result = await codingService.securityReview({ code, language });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getSupportedLanguages = (req, res) => {
  res.status(200).json({ success: true, languages: codingService.SUPPORTED_LANGUAGES });
};

// Local Code Execution replacing Piston API
const fs = require('fs').promises;
const pathNode = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

const languageMap = {
  'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
  'py': 'python', 'cpp': 'c++', 'cs': 'csharp', 'sh': 'bash', 'rb': 'ruby', 'rs': 'rust',
  'c': 'c', 'java': 'java'
};

exports.executeCode = async (req, res) => {
  let tempDir = null;
  try {
    let { language, code } = req.body;
    if (!language || !code) return res.status(400).json({ error: 'Language and code are required.' });
    
    language = language.toLowerCase();
    if (['html', 'css', 'xml'].includes(language)) {
      return res.status(400).json({ error: 'HTML/CSS should be executed on the client side.' });
    }

    const canonicalLang = languageMap[language] || language;
    
    const runId = crypto.randomBytes(16).toString('hex');
    tempDir = pathNode.join(__dirname, '..', '..', 'temp_code_exec', runId);
    await fs.mkdir(tempDir, { recursive: true });

    let command = '';
    const isWindows = process.platform === 'win32';
    const dockerVolumePath = isWindows ? tempDir.replace(/\\/g, '/') : tempDir;
    
    if (canonicalLang === 'javascript') {
      const filePath = pathNode.join(tempDir, 'main.js');
      await fs.writeFile(filePath, code);
      command = `docker run --rm --memory="512m" --cpus="1.0" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app node:18-alpine node main.js`;
    } else if (canonicalLang === 'python') {
      const filePath = pathNode.join(tempDir, 'main.py');
      await fs.writeFile(filePath, code);
      command = `docker run --rm --memory="512m" --cpus="1.0" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app python:3.9-slim python main.py`;
    } else if (canonicalLang === 'java') {
      const match = code.match(/(?:public\s+)?class\s+([a-zA-Z0-9_]+)/);
      const className = match ? match[1] : 'Main';
      const filePath = pathNode.join(tempDir, `${className}.java`);
      await fs.writeFile(filePath, code);
      command = `docker run --rm --memory="512m" --cpus="1.0" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app openjdk:17-slim sh -c "javac ${className}.java && java ${className}"`;
    } else if (canonicalLang === 'cpp' || canonicalLang === 'c++') {
      const filePath = pathNode.join(tempDir, 'main.cpp');
      await fs.writeFile(filePath, code);
      command = `docker run --rm --memory="512m" --cpus="1.0" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app gcc:latest sh -c "g++ main.cpp -o main && ./main"`;
    } else if (canonicalLang === 'go') {
      const filePath = pathNode.join(tempDir, 'main.go');
      await fs.writeFile(filePath, code);
      command = `docker run --rm --network none --memory="512m" --cpus="1.0" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app golang:1.20-alpine go run main.go`;
    } else {
      return res.status(400).json({ error: `Secure Sandbox execution for ${canonicalLang} is currently unsupported.` });
    }

    console.log(`[Code Engine] Executing ${canonicalLang} with Docker...`);
    
    exec(command, { timeout: 10000, cwd: tempDir }, async (error, stdout, stderr) => {
      const isDockerMissing = (error && error.code === 127) ||
                              (error && error.message && (error.message.includes('failed to connect to the docker API') || error.message.includes('docker: not found') || error.message.includes('docker: command not found') || error.message.includes('docker'))) || 
                              (stderr && (stderr.includes('failed to connect to the docker API') || stderr.includes('error during connect') || stderr.includes('docker: not found') || stderr.includes('docker: command not found') || stderr.includes('docker')));

      if (isDockerMissing) {
        console.warn('[Code Engine] Docker unavailable. Falling back to native host execution...');
        let nativeCommand = '';
        if (canonicalLang === 'javascript') {
          nativeCommand = `node main.js`;
        } else if (canonicalLang === 'python') {
          nativeCommand = `python main.py`;
        } else if (canonicalLang === 'java') {
          const match = code.match(/(?:public\\s+)?class\\s+([a-zA-Z0-9_]+)/);
          const className = match ? match[1] : 'Main';
          nativeCommand = `javac ${className}.java && java ${className}`;
        } else if (canonicalLang === 'cpp' || canonicalLang === 'c++') {
          nativeCommand = isWindows ? `g++ main.cpp -o main.exe && main.exe` : `g++ main.cpp -o main && ./main`;
        } else if (canonicalLang === 'go') {
          nativeCommand = `go run main.go`;
        }

        if (nativeCommand) {
          return exec(nativeCommand, { timeout: 10000, cwd: tempDir }, (nativeErr, nativeStdout, nativeStderr) => {
            if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
            if (nativeErr && nativeErr.killed) {
              return res.json({ stdout: nativeStdout || '', stderr: 'Execution Timed Out (10s)', code: 1, signal: 'SIGTERM' });
            }
            return res.json({
              stdout: nativeStdout || '',
              stderr: nativeStderr || (nativeErr ? nativeErr.message : ''),
              code: nativeErr ? (nativeErr.code || 1) : 0,
              signal: nativeErr ? nativeErr.signal : null
            });
          });
        } else {
          if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
          return res.status(503).json({ error: 'Secure execution environment (Docker) is unavailable, and native fallback is unsupported for this language.' });
        }
      }

      if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
      if (error && error.killed) return res.json({ stdout: stdout || '', stderr: 'Execution Timed Out (10s)', code: 1, signal: 'SIGTERM' });

      res.json({
        stdout: stdout || '',
        stderr: stderr || (error ? error.message : ''),
        code: error ? (error.code || 1) : 0,
        signal: error ? error.signal : null
      });
    });

  } catch (error) {
    if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
    console.error("Execution error:", error);
    res.status(500).json({ error: 'Server error during code execution.', details: error.message });
  }
};

exports.renderServerChart = async (req, res) => {
  const { code, data } = req.body;
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = `
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body style="width: 800px; height: 600px; margin: 0; display: flex; justify-content: center; align-items: center; background: #1e1e2e;">
          <canvas id="chartCanvas"></canvas>
          <script>
            const ctx = document.getElementById('chartCanvas').getContext('2d');
            ${code}
          </script>
        </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const element = await page.$('body');
    const screenshotBuffer = await element.screenshot({ type: 'png' });
    await browser.close();
    
    const base64Image = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    res.status(200).json({ success: true, image: base64Image });
  } catch (err) {
    console.error('Chart Render Error:', err);
    res.status(500).json({ success: false, error: 'Server-side chart rendering failed' });
  }
};

exports.executeCodeInternally = async (language, codeStr) => {
  let tempDir = null;
  try {
    const canonicalLang = languageMap[language.toLowerCase()] || language.toLowerCase();
    const runId = crypto.randomBytes(16).toString('hex');
    tempDir = pathNode.join(__dirname, '..', '..', 'temp_code_exec', runId);
    await fs.mkdir(tempDir, { recursive: true });

    let command = '';
    const isWindows = process.platform === 'win32';
    const dockerVolumePath = isWindows ? tempDir.replace(/\\/g, '/') : tempDir;

    if (canonicalLang === 'javascript') {
      await fs.writeFile(pathNode.join(tempDir, 'main.js'), codeStr);
      command = `docker run --rm --memory="256m" --cpus="0.5" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app node:18-alpine node main.js`;
    } else if (canonicalLang === 'python') {
      await fs.writeFile(pathNode.join(tempDir, 'main.py'), codeStr);
      command = `docker run --rm --memory="256m" --cpus="0.5" -v "${dockerVolumePath}:/usr/src/app" -w /usr/src/app python:3.9-slim python main.py`;
    } else {
      throw new Error(`Unsupported internal language: ${canonicalLang}`);
    }

    return new Promise((resolve, reject) => {
      exec(command, { timeout: 15000, cwd: tempDir }, (error, stdout, stderr) => {
        const isDockerMissing = (error && error.code === 127) || (error && error.message && (error.message.includes('docker') || error.message.includes('docker: not found') || error.message.includes('docker: command not found'))) || (stderr && (stderr.includes('docker') || stderr.includes('docker: not found') || stderr.includes('docker: command not found')));
        if (isDockerMissing) {
          if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
          resolve({ stdout: '', stderr: 'Docker is required for secure internal execution but is not running.', error: new Error('Docker unavailable') });
        } else {
          if (tempDir) fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
          resolve({ stdout, stderr, error });
        }
      });
    });
  } catch (error) {
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
};
