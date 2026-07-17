const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

const WORKSPACE_DIR = path.join(os.homedir(), 'CloserWorkspace');

router.post('/execute', auth, async (req, res) => {
    try {
        const { command } = req.body;
        
        if (!command) {
            return res.status(400).json({ success: false, message: 'Command is required.' });
        }

        const sysPrompt = `You are the Matrix Base Reality AI. The user gives you a natural language command in ANY language (English, Telugu, Hindi, etc.).
Your goal is to parse their intent into a safe predefined action.
CRITICAL RULE: FIRST, internally translate the user's input to English to understand their true intent. 
SECOND, you MUST generate a 'reply' string that acknowledges the action in the EXACT SAME LANGUAGE AND SCRIPT the user used (e.g. if they typed in Telugu, reply in Telugu script. If Tanglish, reply in Tanglish).
FINALLY, map it to exactly one of the following JSON structures:

- If they want to know system details, CPU, battery, RAM, or uptime:
{"action": "SYSTEM_METRICS", "reply": "<your_localized_reply>"}

- If they want to open a specific website (e.g., GitHub, YouTube, Google, Facebook):
{"action": "OPEN_URL", "url": "https://www.<website>.com", "reply": "<your_localized_reply>"}

- If they want to search for something, or ask to find information:
{"action": "SEARCH_WEB", "query": "<search_query_in_english>", "reply": "<your_localized_reply>"}

- If they want to open or launch a desktop application:
{"action": "OPEN_APP", "appName": "<exact_windows_executable_name>", "reply": "<your_localized_reply>"}

- If they want to create a folder or directory:
{"action": "CREATE_FOLDER", "folderName": "<name_of_the_folder>", "reply": "<your_localized_reply>"}

- If they want to know their IP address, Wi-Fi details, or network info:
{"action": "NETWORK_INFO", "reply": "<your_localized_reply>"}

- If it's anything else, or if it sounds dangerous:
{"action": "UNKNOWN", "reply": "<your_localized_reply_explaining_why_it_failed>"}

User's natural language command: "${command}"

Output STRICTLY valid JSON only. Do not output anything else.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        let parsed;
        try {
            parsed = JSON.parse(llmResponse.match(/\{[\s\S]*\}/)[0]);
        } catch(e) {
            parsed = { action: 'UNKNOWN', message: 'Reality parsing failed.' };
        }

        let output = '';

        switch(parsed.action) {
            case 'SYSTEM_METRICS':
                output = `--- SYSTEM METRICS ---
Platform: ${os.platform()}
Release: ${os.release()}
Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB
CPU Cores: ${os.cpus().length}
CPU Model: ${os.cpus()[0].model}
Uptime: ${(os.uptime() / 3600).toFixed(2)} Hours`;
                break;
                
            case 'OPEN_URL':
                try {
                    await execPromise(`start "" "${parsed.url}"`);
                    output = `SUCCESS: Uplink established to '${parsed.url}'.`;
                } catch (e) {
                    output = `ERROR: Failed to route to '${parsed.url}'. ${e.message.substring(0, 50)}`;
                }
                break;
                
            case 'SEARCH_WEB':
                try {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(parsed.query)}`;
                    await execPromise(`start "" "${searchUrl}"`);
                    output = `SUCCESS: Querying global network for '${parsed.query}'.`;
                } catch (e) {
                    output = `ERROR: Search uplink failed. ${e.message.substring(0, 50)}`;
                }
                break;

            case 'OPEN_APP':
                // Safe execution on Windows
                // Using 'start' to open applications by name
                try {
                    await execPromise(`start "" "${parsed.appName}"`);
                    output = `SUCCESS: Initialized launch sequence for '${parsed.appName}'.`;
                } catch (e) {
                    output = `ERROR: Failed to launch '${parsed.appName}'. ${e.message.substring(0, 50)}`;
                }
                break;
                
            case 'CREATE_FOLDER':
                try {
                    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
                    const newFolderPath = path.join(WORKSPACE_DIR, parsed.folderName);
                    await fs.mkdir(newFolderPath, { recursive: true });
                    output = `SUCCESS: Spawned matter structure '${parsed.folderName}' at ${WORKSPACE_DIR}.`;
                } catch (e) {
                    output = `ERROR: Reality collapse while creating folder.`;
                }
                break;
                
            case 'NETWORK_INFO':
                const nets = os.networkInterfaces();
                let ipDetails = '';
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) {
                        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                        if (net.family === 'IPv4' && !net.internal) {
                            ipDetails += `${name}: ${net.address}\n`;
                        }
                    }
                }
                output = `--- NETWORK INTERFACES ---\n${ipDetails || 'No external IPv4 found.'}`;
                break;
                
            default:
                output = parsed.message || 'Unknown simulation hook.';
                break;
        }

        if (parsed.reply) {
            output = `${parsed.reply}\n\n${output}`;
        }

        res.json({
            success: true,
            output
        });

    } catch (err) {
        console.error('Matrix execution error:', err);
        res.status(500).json({ success: false, output: 'Matrix linkage failed.' });
    }
});

module.exports = router;
