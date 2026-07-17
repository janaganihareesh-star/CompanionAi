const express = require('express');
const router = express.Router();
const osAgent = require('../services/osAgent');
const auth = require('../middleware/auth');
const codeExecutionService = require('../services/codeExecutionService');

// Note: In a real app, this should be heavily restricted.
router.post('/execute-script', auth, async (req, res) => {
  try {
    const { script, allowedModules } = req.body;
    if (!script) return res.status(400).json({ success: false, message: 'Script is required' });
    
    // Execute securely in the VM sandbox
    const result = await codeExecutionService.executeSecurely(script, allowedModules);
    res.json({ success: true, output: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});
router.post('/execute', auth, async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ success: false, message: 'Command is required' });
    
    // In Phase 3, we execute the command requested by the OS Agent / User
    const result = await osAgent.executeCommand(command);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
const autonomousCICDAgent = require('../services/autonomousCICDAgent');

router.post('/devin', auth, async (req, res) => {
  try {
    const { repoUrl, issueDescription } = req.body;
    const result = await autonomousCICDAgent.startJob(repoUrl, issueDescription);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/read', auth, async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ success: false, message: 'Path is required' });
    
    const result = await osAgent.readFile(path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const workspaceScanner = require('../services/workspaceScanner');

router.get('/workspace/scan', auth, async (req, res) => {
  try {
    const result = await workspaceScanner.getWorkspaceTree();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/write', auth, async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path || !content) return res.status(400).json({ success: false, message: 'Path and content are required' });
    
    const result = await osAgent.writeFile(path, content);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
