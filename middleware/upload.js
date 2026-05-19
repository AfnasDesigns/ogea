const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const dirs = ['uploads', 'uploads/programs', 'uploads/posters', 'uploads/proofs'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/';
        if (req.uploadType === 'program') folder = 'uploads/programs/';
        else if (req.uploadType === 'poster') folder = 'uploads/posters/';
        else if (req.uploadType === 'proof') folder = 'uploads/proofs/';

        const fullPath = path.join(__dirname, '..', folder);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp_randomstring_originalname
        const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, WebP, GIF) and PDF files are allowed'), false);
    }
};

// Create multer instances for different upload types
const uploadProgram = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadPoster = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadProof = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware to set upload type
function setUploadType(type) {
    return (req, res, next) => {
        req.uploadType = type;
        next();
    };
}

module.exports = { uploadProgram, uploadPoster, uploadProof, setUploadType };
