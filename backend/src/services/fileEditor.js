const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const DEFAULT_WORKSPACE = path.join(os.homedir(), 'CloserWorkspace');

/**
 * Replaces a specific block of code in a file with new code.
 * This acts as a surgical diff patch.
 */
exports.patchFile = async (relativePath, targetContent, replacementContent, workspacePath = DEFAULT_WORKSPACE) => {
  try {
    const absolutePath = path.resolve(workspacePath, relativePath);
    
    if (!absolutePath.startsWith(path.resolve(workspacePath))) {
      return { success: false, error: 'SECURITY VIOLATION: Path traversal detected.' };
    }

    const data = await fs.readFile(absolutePath, 'utf8');
    
    // Normalize line endings to avoid \r\n vs \n mismatch failures
    const normalizedData = data.replace(/\r\n/g, '\n');
    const normalizedTarget = targetContent.replace(/\r\n/g, '\n');
    const normalizedReplacement = replacementContent.replace(/\r\n/g, '\n');

    if (!normalizedData.includes(normalizedTarget)) {
      return { 
        success: false, 
        error: 'Target content not found in the file. Ensure you provide the exact string (including whitespace/indentation) to replace.'
      };
    }

    const newData = normalizedData.replace(normalizedTarget, normalizedReplacement);
    
    await fs.writeFile(absolutePath, newData, 'utf8');
    
    return { success: true, message: `Successfully patched ${relativePath}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
