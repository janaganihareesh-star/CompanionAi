const mongoose = require('mongoose');
const { LANGUAGES, RELATIONSHIP_TYPES, RELATIONSHIP_BOUNDARIES } = require('../utils/constants');

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  language: {
    type: String,
    enum: LANGUAGES,
    default: 'English'
  },
  aiGender: {
    type: String,
    enum: ['female', 'male'],
    default: 'female'
  },
  aiName: {
    type: String,
    default: 'Maya'
  },
  selectedVoice: {
    type: String,
    default: 'en-US-Standard-C'
  },
  elevenLabsVoiceId: {
    type: String,
    default: ''
  },
  interactionMode: {
    type: String,
    enum: ['chat', 'voice', 'both'],
    default: 'both'
  },
  relationshipType: {
    type: String,
    enum: RELATIONSHIP_TYPES,
    default: 'friend'
  },
  nicknameEnabled: {
    type: Boolean,
    default: false
  },
  nickname: {
    type: String,
    default: ''
  },
  relationshipBoundary: {
    type: String,
    enum: RELATIONSHIP_BOUNDARIES,
    default: 'friendly'
  },
  memoryPermission: {
    type: String,
    enum: ['remember_everything', 'remember_important', 'ask'],
    default: 'remember_everything'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  morningReportEnabled: {
    type: Boolean,
    default: false
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  trustedContact1: {
    name: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  trustedContact2: {
    name: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  activePersonaId: {
    type: String,
    default: 'maya_companion'
  },
  dailyFactsEnabled: {
    type: Boolean,
    default: true
  },
  dailyFactTypes: {
    type: [String],
    default: ['science', 'psychology', 'history', 'general']
  },
  themeMode: {
    type: String,
    default: 'dark' // e.g. dark, light, cyberpunk, ocean, forest, sunset
  },
  educationLevel: {
    type: String,
    default: 'btech'
  },
  learningStyle: {
    type: String,
    default: 'practical'
  },
  learningSpeed: {
    type: String,
    default: 'medium'
  },
  teluguDialect: {
    type: String,
    default: 'standard'
  },
  learningSubjects: {
    type: [String],
    default: []
  },
  offlineMode: {
    type: Boolean,
    default: false
  },
  appStoreSafeMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);