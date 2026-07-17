const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { messageId, conversationId, rating, correctionText, modelUsed } = req.body;
    const newFeedback = await Feedback.create({
      userId: req.user.id,
      messageId,
      conversationId,
      rating,
      correctionText,
      modelUsed
    });
    res.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Feedback saving error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
