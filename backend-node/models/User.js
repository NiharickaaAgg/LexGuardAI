const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: {
            type: String, required: true, unique: true,
            lowercase: true, trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        },
        password: { type: String, required: true, minlength: 8, select: false },
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        preferredLanguage: { type: String, default: 'en' },
        auditCount: { type: Number, default: 0 },
        lastLoginAt: Date,
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);