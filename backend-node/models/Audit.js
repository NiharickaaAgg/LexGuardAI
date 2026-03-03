const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema({
    text: { type: String, required: true },
    classification: { type: String, enum: ['RED', 'YELLOW', 'GREEN'], required: true },
    reason: { type: String, required: true },
    counterDraft: { type: String, default: null },
    pageReference: { type: Number, default: null },
}, { _id: false });

const jurisdictionFlagSchema = new mongoose.Schema({
    clause: String,
    jurisdictions: [String],
    conflict: String,
    recommendation: String,
}, { _id: false });

const auditSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
        legalScore: { type: Number, min: 0, max: 100, default: null },
        scoreLabel: { type: String, enum: ['HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK', null], default: null },
        clauses: [clauseSchema],
        summary: { type: [String], default: [] },
        summaryTranslated: {
            language: { type: String, default: null },
            bullets: { type: [String], default: [] },
        },
        jurisdictionFlags: [jurisdictionFlagSchema],
        processingTimeMs: { type: Number, default: null },
        modelUsed: { type: String, default: 'gemini-1.5-pro' },
        language: { type: String, default: 'en' },
        status: { type: String, enum: ['pending', 'processing', 'complete', 'failed'], default: 'pending' },
        errorMessage: { type: String, default: null },
    },
    { timestamps: true }
);

auditSchema.virtual('clauseBreakdown').get(function () {
    return {
        red: this.clauses.filter(c => c.classification === 'RED').length,
        yellow: this.clauses.filter(c => c.classification === 'YELLOW').length,
        green: this.clauses.filter(c => c.classification === 'GREEN').length,
        total: this.clauses.length,
    };
});

auditSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Audit', auditSchema);