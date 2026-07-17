const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/execute', protect, codeController.executeCode);
router.post('/render-chart', protect, codeController.renderServerChart);

module.exports = router;
