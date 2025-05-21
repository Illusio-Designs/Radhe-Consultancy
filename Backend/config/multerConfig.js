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

// Configure storage for employee policy documents
const employeePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = 'uploads/employee_policies';
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `employee-policy-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Configure storage for vehicle policy documents
const vehiclePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/vehicle_policies');
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
        // Generate a unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `vehicle-policy-${uniqueSuffix}${ext}`;
        console.log('[Multer] Generated filename:', filename);
        cb(null, filename);
    }
});

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Word documents are allowed!'), false);
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

const uploadEmployeePolicyDocument = multer({
    storage: employeePolicyStorage,
    fileFilter,
    limits
});

const uploadVehiclePolicyDocument = multer({
    storage: vehiclePolicyStorage,
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
    uploadProfileImage,
    uploadEmployeePolicyDocument,
    uploadVehiclePolicyDocument
}; 