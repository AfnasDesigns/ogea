const multer = require('multer');

// Use MemoryStorage to prevent unhandled promise rejections from CloudinaryStorage
// We will upload to Cloudinary manually in the route handlers
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

function setUploadType(type) {
    return (req, res, next) => {
        req.uploadType = type;
        next();
    };
}

module.exports = { 
    uploadProgram: upload, 
    uploadPoster: upload, 
    uploadProof: upload, 
    setUploadType 
};
