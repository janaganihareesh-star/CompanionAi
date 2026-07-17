const express = require('express');
const router = express.Router();
const videoGenerationService = require('../services/videoGenerationService');
const authMiddleware = require('../middleware/auth');

// Generate a new video
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    
    const result = await videoGenerationService.generateVideo(prompt, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check job status
router.get('/status/:jobId', authMiddleware, (req, res) => {
  try {
    const status = videoGenerationService.getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: 'Job not found' });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
