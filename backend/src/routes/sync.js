const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const protect = require('../middleware/auth');

router.post('/', protect, syncController.syncOfflineData);

module.exports = router;
