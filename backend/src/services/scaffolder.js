const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const DEFAULT_WORKSPACE = path.join(os.homedir(), 'CloserWorkspace');

/**
 * Scaffolds an entire project by writing multiple files and optionally running npm install.
 */
exports.createProjectFiles = async (files, workspacePath = DEFAULT_WORKSPACE) => {
  try {
    const results = [];
    
    // Ensure base workspace exists
    await fs.mkdir(workspacePath, { recursive: true });

    for (const file of files) {
      if (!file.path || !file.content) continue;

      const absolutePath = path.resolve(workspacePath, file.path);
      
      // Security check
      if (!absolutePath.startsWith(path.resolve(workspacePath))) {
        results.push({ path: file.path, success: false, error: 'Path traversal prevented.' });
        continue;
      }

      // Ensure directory exists
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(absolutePath, file.content, 'utf8');
      results.push({ path: file.path, success: true });
    }

    // Check if package.json was created to run npm install autonomously
    const hasPackageJson = files.some(f => f.path.endsWith('package.json'));
    let installLog = '';

    if (hasPackageJson) {
      // Find the root folder of the package.json
      const pkgFile = files.find(f => f.path.endsWith('package.json'));
      const pkgDir = path.dirname(path.resolve(workspacePath, pkgFile.path));
      
      console.log(`[Scaffolder] package.json detected. Running npm install in ${pkgDir}...`);
      
      installLog = await new Promise((resolve) => {
        exec('npm install', { cwd: pkgDir }, (error, stdout, stderr) => {
          if (error) resolve(`NPM Install Failed: ${stderr}`);
          else resolve(`NPM Install Success:\n${stdout}`);
        });
      });
    }

    return { 
      success: true, 
      message: 'Project scaffolded successfully.', 
      details: results,
      npmInstallLog: installLog 
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
};
