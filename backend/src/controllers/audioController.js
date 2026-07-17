const fs = require('fs');
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }

    // Use Groq Whisper for transcription
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-large-v3',
      prompt: 'Translate or transcribe the speech to text.', // Optional context
      response_format: 'json',
      temperature: 0.0,
    });

    // Delete temp file after transcription
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp audio file:', err);
    });

    res.status(200).json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('[Audio Controller] Transcription Error:', error);
    // Cleanup on error too
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, message: 'Transcription failed.', error: error.message });
  }
};
