const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' }); // load main .env
const osAgent = require('../../src/services/osAgent');
const autonomousCICDAgent = require('../../src/services/autonomousCICDAgent');
const codeExecutionService = require('../../src/services/codeExecutionService');
const workspaceScanner = require('../../src/services/workspaceScanner');
const auth = require('../../src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'code-service', time: new Date() });
});

// OS Routes
app.post('/api/os/execute-script', auth, async (req, res) => {
    try {
        const { script, allowedModules } = req.body;
        if (!script) return res.status(400).json({ success: false, message: 'Script is required' });
        const result = await codeExecutionService.executeSecurely(script, allowedModules);
        res.json({ success: true, output: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err });
    }
});

app.post('/api/os/execute', auth, async (req, res) => {
    try {
        const { command } = req.body;
        if (!command) return res.status(400).json({ success: false, message: 'Command is required' });
        const result = await osAgent.executeCommand(command);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/os/devin', auth, async (req, res) => {
    try {
        const { repoUrl, issueDescription } = req.body;
        const result = await autonomousCICDAgent.startJob(repoUrl, issueDescription);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/os/read', auth, async (req, res) => {
    try {
        const { path } = req.body;
        if (!path) return res.status(400).json({ success: false, message: 'Path is required' });
        const result = await osAgent.readFile(path);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/os/write', auth, async (req, res) => {
    try {
        const { path, content } = req.body;
        if (!path || !content) return res.status(400).json({ success: false, message: 'Path and content are required' });
        const result = await osAgent.writeFile(path, content);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/os/workspace/scan', auth, async (req, res) => {
    try {
        const result = await workspaceScanner.getWorkspaceTree();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = 7001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Microservice] Code Service running on port ${PORT}`);
});
