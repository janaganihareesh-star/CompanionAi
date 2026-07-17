const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    creatorId: {
        type: String, // Or ObjectId if linked to User model
        required: true
    },
    tagline: {
        type: String,
        maxLength: 100
    },
    description: {
        type: String,
        maxLength: 500
    },
    systemPrompt: {
        type: String,
        required: true
    },
    greetingMessage: {
        type: String,
        default: "Hello! I am ready to chat."
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    interactions: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Persona', personaSchema);
