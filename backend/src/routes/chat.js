const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Public routes (No auth required)
router.get('/public/:id', chatController.getPublicConversation);

// Protect all other chat endpoints with JWT auth
router.use(auth);

router.post('/create', chatController.createConversation);
router.post('/send', chatController.sendMessage);
router.post('/send-stream', chatController.sendMessageStream);
router.get('/history', chatController.getHistory);
router.get('/search', chatController.searchMessages);
router.get('/:id/messages', chatController.getMessages);
router.patch('/:id', chatController.updateConversation);
router.delete('/:id', chatController.deleteConversation);
router.delete('/:id/messages-from/:messageId', chatController.truncateConversation);
router.post('/:id/branch/:messageId', chatController.branchConversation);
router.post('/message/:id/feedback', chatController.submitFeedback);
router.post('/execute', chatController.executeCode);

module.exports = router;