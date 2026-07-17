const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const customAgentController = require('../controllers/customAgentController');

router.use(authMiddleware);

router.get('/', customAgentController.getCustomAgents);
router.post('/', customAgentController.createCustomAgent);
router.delete('/:id', customAgentController.deleteCustomAgent);

module.exports = router;
