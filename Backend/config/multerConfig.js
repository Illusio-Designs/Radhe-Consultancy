const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for memory storage
const storage = multer.memoryStorage();

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

// Image compression function
const compressImage = async (buffer, options = {}) => {
    const {
        width = 800,
        height = 800,
        quality = 80,
        format = 'jpeg'
    } = options;

    try {
        const compressedImage = await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat(format, { quality })
            .toBuffer();
        return compressedImage;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
};

// Middleware to handle image upload and compression
const uploadAndCompress = (fieldName) => {
    return async (req, res, next) => {
        try {
            upload.single(fieldName)(req, res, async (err) => {
                if (err) {
                    console.error('File upload error:', err);
                    return res.status(400).json({ error: err.message });
                }

                if (!req.file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                // Compress the uploaded image
                const compressedBuffer = await compressImage(req.file.buffer);
                
                // Replace the original buffer with compressed buffer
                req.file.buffer = compressedBuffer;
                
                next();
            });
        } catch (error) {
            console.error('Error in uploadAndCompress middleware:', error);
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = {
    upload,
    uploadAndCompress,
    compressImage
}; 