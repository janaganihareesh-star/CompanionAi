const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');
const os = require('os');

/**
 * Autonomous CI/CD Agent (Real execution)
 * Runs actual local npm/git commands inside a workspace.
 */
class AutonomousCICDAgent {
    constructor() {
        this.status = 'IDLE';
    }

    async executeStep(command, cwd) {
        console.log(`[DevinAgent] Executing: ${command} in ${cwd}`);
        try {
            // Ensure the workspace exists
            const fs = require('fs').promises;
            await fs.mkdir(cwd, { recursive: true });

            // Escape quotes
            const safeCommand = command.replace(/"/g, '\\"');
            
            // Run inside node:20-slim Docker container
            const dockerCommand = `docker run --rm -v "${cwd}:/workspace" -w /workspace node:20-slim bash -c "${safeCommand}"`;
            
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 60000 });
            return { success: true, log: stdout || stderr || 'Command executed silently.' };
        } catch (error) {
            return { success: false, log: error.message || error.stderr };
        }
    }

    async startJob(repoName, issueDescription) {
        console.log(`[DevinAgent] Starting real autonomous job for ${repoName}`);
        this.status = 'RUNNING';
        
        // Define a safe workspace path (assuming CloserWorkspace exists or using temp)
        const workspaceDir = path.join(os.homedir(), 'CloserWorkspace', repoName || 'demo-repo');
        
        const results = [];
        
        // Step 1: Check Git Status
        let step = await this.executeStep('git status', workspaceDir).catch(() => ({ success: false, log: 'Directory not found or not a git repo.' }));
        results.push({ command: 'git status', ...step });

        // Step 2: Run npm install if package.json exists
        step = await this.executeStep('npm install', workspaceDir).catch(() => ({ success: false, log: 'Failed to run npm install.' }));
        results.push({ command: 'npm install', ...step });

        this.status = 'IDLE';
        return { success: true, message: 'Real Execution Completed.', details: results };
    }
}

module.exports = new AutonomousCICDAgent();
