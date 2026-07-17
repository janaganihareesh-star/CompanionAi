const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');
const os = require('os');

router.post('/analyze', auth, async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query is required.' });
        }

        // Fetch real OS stats
        const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
        const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
        const usedMem = totalMem - freeMem;
        const uptime = Math.round(os.uptime() / 3600);
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuCores = cpus.length;

        const sysPrompt = `You are the Zero-Point Reactor Core AI. You manage the infinite energy core and have access to the local system's real physical stats.
Here are the current real system stats of the computer you are running on:
- CPU: ${cpuModel} (${cpuCores} cores)
- RAM: ${usedMem}GB used out of ${totalMem}GB
- System Uptime: ${uptime} hours

The user is asking you a query: "${query}"

CRITICAL RULES:
1. Identify the EXACT language or script the user used (e.g., Telugu, English, Hindi, Tanglish).
2. You MUST reply exclusively in the EXACT SAME LANGUAGE and script the user used.
3. If they ask about the system/laptop status, incorporate the real OS stats provided above into your answer.
4. If they ask a scientific, energy, or quantum-related question, answer it profoundly and accurately.
5. Keep your tone highly advanced, slightly cybernetic, and intelligent.
6. Keep the response to 3-4 sentences maximum.
7. CRITICAL: OUTPUT PLAIN TEXT ONLY. DO NOT OUTPUT JSON. DO NOT USE ANY MARKDOWN FORMATTING OR KEY-VALUE PAIRS.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        res.json({
            success: true,
            analysis: llmResponse
        });

    } catch (err) {
        console.error('Zero-Point Reactor error:', err);
        res.status(500).json({ success: false, analysis: 'Reactor core stabilization failed. Query aborted.' });
    }
});

module.exports = router;
