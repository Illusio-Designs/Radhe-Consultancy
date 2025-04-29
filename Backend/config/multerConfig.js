const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = 'uploads/company_documents';
        try {
            // Check if directory exists
            if (!fsSync.existsSync(uploadDir)) {
                // Create directory if it doesn't exist
                await fs.mkdir(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configure storage for profile images
const profileStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = 'uploads/profile_images';
        try {
            if (!fsSync.existsSync(uploadDir)) {
                await fs.mkdir(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only image and PDF files are allowed!'), false);
    }
};

// Configure upload limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB limit
};

// Create multer upload instances
const upload = multer({
    storage,
    fileFilter,
    limits
});

const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter,
    limits
});

// Middleware for handling company document uploads
const uploadCompanyDocuments = upload.fields([
    { name: 'gst_document', maxCount: 1 },
    { name: 'pan_document', maxCount: 1 }
]);

module.exports = {
    upload,
    uploadCompanyDocuments,
    uploadProfileImage
}; 