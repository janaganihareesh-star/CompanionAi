const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    organizationId: {
        type: String, // E.g., for SSO mapping
        unique: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'member', 'viewer'],
            default: 'member'
        }
    }],
    settings: {
        requireSSO: { type: Boolean, default: false },
        allowedDomains: [String],
        dataRetentionDays: { type: Number, default: 30 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
