const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ResumeUpload = require('../models/ResumeUpload');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const multer = require('multer');

// Configure upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('resume');

exports.resumeUploadMiddleware = upload;

// Helper to extract text based on mime types
const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else {
    // Fallback to reading buffer directly as text
    return buffer.toString('utf-8');
  }
};

// POST /api/resume/upload
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume document file is required.' });
    }

    const userId = req.user.id;
    const { mimetype, buffer } = req.file;

    // 1. Upload file to Cloudinary raw folder
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'closer_resumes',
          public_id: `resume_${userId}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const fileUrl = uploadRes.secure_url;

    // 2. Extract text from PDF/DOCX
    let extractedText = '';
    try {
      extractedText = await extractText(buffer, mimetype);
    } catch (parseErr) {
      console.error('Error parsing resume document:', parseErr.message);
      return res.status(400).json({
        success: false,
        message: 'Could not parse text from this file format. Ensure it is a valid PDF or DOCX.'
      });
    }

    // 3. Save to database
    const resumeObj = await ResumeUpload.create({
      userId,
      fileUrl,
      extractedText
    });

    res.status(201).json({
      success: true,
      resumeId: resumeObj._id,
      preview: extractedText.substring(0, 200) + '...'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/resume/analyze
exports.analyzeResume = async (req, res, next) => {
  try {
    const { resumeId, targetRole = 'Software Engineer' } = req.body;
    const userId = req.user.id;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Resume ID is required.' });
    }

    const resume = await ResumeUpload.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume file not found.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'AIzaSyDummyKeyForGeminiAPI') {
      const mockAnalysis = {
        atsScore: 78,
        skills: ['React', 'Node.js', 'Express', 'Mongoose', 'MongoDB', 'JavaScript'],
        missingSkills: ['AWS', 'Docker', 'Jest testing', 'CI/CD pipeline configuration'],
        improvements: [
          'Add detailed numeric metrics to project achievements.',
          'Add a section focusing specifically on cloud devops skills.',
          'Rewrite your introduction profile summary to emphasize target role.'
        ],
        strengths: [
          'Excellent core Javascript foundations.',
          'Solid database modeling examples with MongoDB.'
        ],
        interviewQuestions: [
          'What is the difference between SQL and MongoDB databases?',
          'How do you handle middleware routing errors in Express?',
          'Explain the rendering cycle of a React component.',
          'What is the role of indexes in Mongoose queries?',
          'How do you manage cross-origin request headers in Node?'
        ]
      };

      resume.atsScore = mockAnalysis.atsScore;
      resume.skills = mockAnalysis.skills;
      resume.missingSkills = mockAnalysis.missingSkills;
      resume.improvements = mockAnalysis.improvements;
      resume.strengths = mockAnalysis.strengths;
      resume.interviewQuestions = mockAnalysis.interviewQuestions;
      await resume.save();

      return res.status(200).json({ success: true, analysis: mockAnalysis });
    }

    const systemPrompt = `You are an expert technical recruiter and resume reviewer.
Analyze the provided resume text and compare it to the target role of "${targetRole}".
Return a JSON object exactly with:
{
  "atsScore": number (0-100),
  "skills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1"],
  "improvements": ["improvement 1", "improvement 2"],
  "strengths": ["strength 1", "strength 2"],
  "interviewQuestions": ["q1", "q2", "q3", "q4", "q5"]
}
Do not wrap in markdown code blocks.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: `Resume Text:\n${resume.extractedText}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
    };

    const response = await axios.post(url, requestBody);
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (err) {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleaned);
    }

    resume.atsScore = analysis.atsScore || 65;
    resume.skills = analysis.skills || [];
    resume.missingSkills = analysis.missingSkills || [];
    resume.improvements = analysis.improvements || [];
    resume.strengths = analysis.strengths || [];
    resume.interviewQuestions = analysis.interviewQuestions || [];

    await resume.save();

    res.status(200).json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
};

// GET /api/resume/history
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await ResumeUpload.find({ userId })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (err) {
    next(err);
  }
};