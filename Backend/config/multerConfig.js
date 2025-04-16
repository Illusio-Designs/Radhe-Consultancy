const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure upload limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB limit
};

// Create multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits
});

// Simple file upload middleware
const uploadFile = (fieldName) => {
    return upload.single(fieldName);
};

module.exports = {
    upload,
    uploadFile
}; 