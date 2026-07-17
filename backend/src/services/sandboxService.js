const axios = require('axios');

/**
 * Executes code using the public Piston execution engine (emkc.org).
 * Supports Python, JavaScript, C++, Java, Rust, Go, etc.
 * 
 * @param {string} language - The programming language (e.g., 'python', 'javascript')
 * @param {string} code - The source code to execute
 */
async function executeCodeRemote(language, code) {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  const os = require('os');
  
  const tmpDir = os.tmpdir();
  const fileId = crypto.randomBytes(4).toString('hex');
  
  let output = '';
  let success = false;
  let command = '';
  let tmpFile = '';

  const lang = language.toLowerCase();
  
  try {
    if (lang === 'javascript' || lang === 'js' || lang === 'node') {
      tmpFile = path.join(tmpDir, `script_${fileId}.js`);
      fs.writeFileSync(tmpFile, code);
      command = `node ${tmpFile}`;
    } else if (lang === 'python' || lang === 'py') {
      tmpFile = path.join(tmpDir, `script_${fileId}.py`);
      fs.writeFileSync(tmpFile, code);
      command = `python ${tmpFile}`; // Assuming 'python' is in PATH on Windows
    } else if (lang === 'cpp' || lang === 'c++') {
      tmpFile = path.join(tmpDir, `script_${fileId}.cpp`);
      const outFile = path.join(tmpDir, `script_${fileId}.exe`);
      fs.writeFileSync(tmpFile, code);
      // Compile & Run
      execSync(`g++ ${tmpFile} -o ${outFile}`, { stdio: 'pipe' });
      command = outFile;
    } else if (lang === 'java') {
      tmpFile = path.join(tmpDir, 'Main.java');
      fs.writeFileSync(tmpFile, code);
      command = `java ${tmpFile}`; // Java 11+ supports running single files directly
    } else if (lang === 'rust' || lang === 'rs') {
      tmpFile = path.join(tmpDir, `script_${fileId}.rs`);
      const outFile = path.join(tmpDir, `script_${fileId}.exe`);
      fs.writeFileSync(tmpFile, code);
      execSync(`rustc ${tmpFile} -o ${outFile}`, { stdio: 'pipe' });
      command = outFile;
    } else if (lang === 'go') {
      tmpFile = path.join(tmpDir, `script_${fileId}.go`);
      fs.writeFileSync(tmpFile, code);
      command = `go run ${tmpFile}`;
    } else {
      return { success: false, output: `Unsupported language: ${language}` };
    }

    // Execute the final command with a strict timeout
    output = execSync(command, { timeout: 10000, encoding: 'utf-8', stdio: 'pipe' });
    success = true;
    if (!output.trim()) output = "Execution completed successfully with no console output.";
  } catch (error) {
    console.error('Local Sandbox Execution Error:', error.message);
    success = false;
    output = error.stderr ? error.stderr.toString() : error.message;
  }

  // Cleanup temporary files
  try {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (command && command.endsWith('.exe') && fs.existsSync(command)) fs.unlinkSync(command);
  } catch (e) {}

  return {
    success,
    output: output.trim(),
    language: lang,
    version: 'local'
  };
}

module.exports = {
  executeCodeRemote
};
