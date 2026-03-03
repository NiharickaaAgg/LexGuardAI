const multer = require('multer');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${req.user._id}_${Date.now()}_${safeName}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
    ];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error('Only PDF, DOCX, DOC, and TXT files are supported.'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '20') * 1024 * 1024 },
});

module.exports = upload;