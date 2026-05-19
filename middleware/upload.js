const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'ogea/general';
        if (req.uploadType === 'poster') folder = 'ogea/posters';
        else if (req.uploadType === 'program') folder = 'ogea/programs';
        else if (req.uploadType === 'proof') folder = 'ogea/proofs';

        return {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'],
        };
    }
});

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
