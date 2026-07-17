const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const audioController = require('../controllers/audioController');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = 'webm'; // Browser MediaRecorder usually sends webm or ogg
    cb(null, `audio-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`);
  }
});

const upload = multer({ storage: storage });

router.post('/transcribe', protect, upload.single('audio'), audioController.transcribeAudio);

module.exports = router;
