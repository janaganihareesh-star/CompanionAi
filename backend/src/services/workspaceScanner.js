const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const DEFAULT_WORKSPACE = path.join(os.homedir(), 'CloserWorkspace');

// Ignore common heavy/unimportant directories
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'];

/**
 * Recursively scans a directory and returns a flat list of all file paths.
 */
async function scanDirectory(dir, basePath = dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    
    for (const dirent of list) {
      if (IGNORE_DIRS.includes(dirent.name)) continue;

      const fullPath = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        results = results.concat(await scanDirectory(fullPath, basePath));
      } else {
        // Return paths relative to the workspace root for easier reading by AI
        results.push(path.relative(basePath, fullPath).replace(/\\/g, '/'));
      }
    }
  } catch (error) {
    console.error(`[WorkspaceScanner] Error scanning directory ${dir}:`, error.message);
  }
  return results;
}

/**
 * Returns the entire file tree structure of the workspace.
 */
exports.getWorkspaceTree = async (workspacePath = DEFAULT_WORKSPACE) => {
  try {
    // Ensure workspace exists
    await fs.mkdir(workspacePath, { recursive: true });
    const files = await scanDirectory(workspacePath);
    return { success: true, files, workspacePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const CodeSplitter = require('./codeSplitter');

/**
 * Safely reads a specific file from the workspace.
 * Automatically chunks/truncates files over 5000 characters to prevent context window explosion.
 */
exports.readWorkspaceFile = async (relativePath, workspacePath = DEFAULT_WORKSPACE, targetKeyword = null) => {
  try {
    const absolutePath = path.resolve(workspacePath, relativePath);
    
    // Security check to prevent path traversal
    if (!absolutePath.startsWith(path.resolve(workspacePath))) {
      throw new Error('SECURITY VIOLATION: Path traversal detected.');
    }

    let data = await fs.readFile(absolutePath, 'utf8');
    
    // Context Window Management: Prevent massive files from blowing up the context
    if (data.length > 5000) {
      console.warn(`[WorkspaceScanner] File ${relativePath} is very large (${data.length} chars). Applying code splitter...`);
      data = CodeSplitter.extractRelevantChunk(data, targetKeyword);
    }

    return { success: true, path: relativePath, content: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
