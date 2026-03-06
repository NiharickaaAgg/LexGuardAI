const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        docType: {
            type: String,
            enum: ['other', 'employment', 'rental', 'nda', 'service', 'trade', 'financial'],
            default: 'other'
        },
        region: { type: String, enum: ['national', 'international'], default: 'national' },
        country: { type: String, default: 'IN' },
        field: { type: String, enum: ['legal', 'financial', 'both'], default: 'legal' },
        industry: { type: String, default: 'general' },
        storagePath: { type: String, required: true },
        status: { type: String, enum: ['uploaded', 'processing', 'analyzed', 'failed'], default: 'uploaded' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);