const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Get the absolute path to the uploads directory
const getUploadDir = (dirName) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', dirName);
    console.log('[Multer] Generated upload directory path:', uploadDir);
    return uploadDir;
};

// Configure storage for company documents
const companyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('company_documents');
        try {
            console.log('[Multer] Setting destination for file:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype
            });
            if (!fsSync.existsSync(uploadDir)) {
                console.log('[Multer] Creating directory:', uploadDir);
                await fs.mkdir(uploadDir, { recursive: true });
            }
            console.log('[Multer] Using directory:', uploadDir);
            cb(null, uploadDir);
        } catch (error) {
            console.error('[Multer] Error in destination function:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        console.log('[Multer] Generated filename:', {
            originalname: file.originalname,
            filename: filename,
            fieldname: file.fieldname,
            mimetype: file.mimetype
        });
        cb(null, filename);
    }
});

// Configure storage for profile images
const profileStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('profile_images');
        try {
            console.log('[Multer] Setting destination for profile image:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype
            });
            if (!fsSync.existsSync(uploadDir)) {
                console.log('[Multer] Creating directory:', uploadDir);
                await fs.mkdir(uploadDir, { recursive: true });
            }
            console.log('[Multer] Using directory:', uploadDir);
            cb(null, uploadDir);
        } catch (error) {
            console.error('[Multer] Error in destination function:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `profile-${uniqueSuffix}${ext}`;
        console.log('[Multer] Generated filename for profile image:', {
            originalname: file.originalname,
            filename: filename,
            fieldname: file.fieldname,
            mimetype: file.mimetype
        });
        cb(null, filename);
    }
});

// Configure storage for employee policy documents
const employeePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('employee_policies');
        try {
            console.log('[Multer] Setting destination for employee policy document:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype
            });
            if (!fsSync.existsSync(uploadDir)) {
                console.log('[Multer] Creating directory:', uploadDir);
                await fs.mkdir(uploadDir, { recursive: true });
            }
            console.log('[Multer] Using directory:', uploadDir);
            cb(null, uploadDir);
        } catch (error) {
            console.error('[Multer] Error in destination function:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `employee-policy-${uniqueSuffix}${ext}`;
        console.log('[Multer] Generated filename for employee policy:', {
            originalname: file.originalname,
            filename: filename,
            fieldname: file.fieldname,
            mimetype: file.mimetype
        });
        cb(null, filename);
    }
});

// Configure storage for vehicle policy documents
const vehiclePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('vehicle_policies');
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
        const ext = path.extname(file.originalname);
        const filename = `vehicle-policy-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// Configure storage for health policy documents
const healthPolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('health_policies');
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
        const ext = path.extname(file.originalname);
        const filename = `health-policy-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// Configure storage for fire policy documents
const firePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('fire_policies');
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
        const ext = path.extname(file.originalname);
        const filename = `fire-policy-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// Configure storage for life policy documents
const lifePolicyStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = getUploadDir('life_policies');
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
        const ext = path.extname(file.originalname);
        const filename = `life-policy-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];
    
    console.log('[Multer] Checking file type:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
        size: file.size
    });
    
    if (allowedTypes.includes(file.mimetype)) {
        console.log('[Multer] File type accepted');
        cb(null, true);
    } else {
        console.log('[Multer] File type rejected');
        cb(new Error('Only PDF, Word documents, and images are allowed!'), false);
    }
};

// Create multer upload instance
const uploadCompanyDocuments = multer({
    storage: companyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
    { name: 'gst_document', maxCount: 1 },
    { name: 'pan_document', maxCount: 1 }
]);

// Add logging for debugging
const uploadCompanyDocumentsWithLogging = (req, res, next) => {
    console.log('[Multer] Starting file upload process');
    console.log('[Multer] Request body:', req.body);
    console.log('[Multer] Request files:', req.files);

    uploadCompanyDocuments(req, res, (err) => {
        if (err) {
            console.error('[Multer] Error uploading files:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Log uploaded files
        if (req.files) {
            console.log('[Multer] Files uploaded successfully:', {
                gst_document: req.files.gst_document ? {
                    fieldname: req.files.gst_document[0].fieldname,
                    originalname: req.files.gst_document[0].originalname,
                    filename: req.files.gst_document[0].filename,
                    mimetype: req.files.gst_document[0].mimetype,
                    size: req.files.gst_document[0].size,
                    path: req.files.gst_document[0].path
                } : null,
                pan_document: req.files.pan_document ? {
                    fieldname: req.files.pan_document[0].fieldname,
                    originalname: req.files.pan_document[0].originalname,
                    filename: req.files.pan_document[0].filename,
                    mimetype: req.files.pan_document[0].mimetype,
                    size: req.files.pan_document[0].size,
                    path: req.files.pan_document[0].path
                } : null
            });
        } else {
            console.log('[Multer] No files uploaded');
        }

        next();
    });
};

// Create multer upload instance for profile images
const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for profile images
}).single('profile_image');

// Add logging for profile image upload
const uploadProfileImageWithLogging = (req, res, next) => {
    console.log('[Multer] Starting profile image upload process');
    console.log('[Multer] Request body:', req.body);
    console.log('[Multer] Request file:', req.file);

    uploadProfileImage(req, res, (err) => {
        if (err) {
            console.error('[Multer] Error uploading profile image:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Log uploaded file
        if (req.file) {
            console.log('[Multer] Profile image uploaded successfully:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            });
        } else {
            console.log('[Multer] No profile image uploaded');
        }

        next();
    });
};

// Create multer upload instance for employee policy documents
const uploadEmployeePolicyDocument = multer({
    storage: employeePolicyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('policyDocument');

// Add logging for employee policy document upload
const uploadEmployeePolicyDocumentWithLogging = (req, res, next) => {
    console.log('[Multer] Starting employee policy document upload process');
    console.log('[Multer] Request body:', req.body);
    console.log('[Multer] Request file:', req.file);
    console.log('[Multer] Request files:', req.files);

    uploadEmployeePolicyDocument(req, res, (err) => {
        if (err) {
            console.error('[Multer] Error uploading employee policy document:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Log uploaded file
        if (req.file) {
            console.log('[Multer] Employee policy document uploaded successfully:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            });
        } else {
            console.log('[Multer] No employee policy document uploaded');
            console.log('[Multer] Request body after multer:', req.body);
            console.log('[Multer] Request files after multer:', req.files);
        }

        next();
    });
};

const uploadVehiclePolicyDocument = multer({
    storage: vehiclePolicyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadHealthPolicyDocument = multer({
    storage: healthPolicyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadFirePolicyDocument = multer({
    storage: firePolicyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadLifePolicyDocument = multer({
    storage: lifePolicyStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export the multer instances
module.exports = {
    uploadCompanyDocuments: uploadCompanyDocumentsWithLogging,
    uploadProfileImage: uploadProfileImageWithLogging,
    uploadEmployeePolicyDocument: uploadEmployeePolicyDocumentWithLogging,
    uploadVehiclePolicyDocument,
    uploadHealthPolicyDocument,
    uploadFirePolicyDocument,
    uploadLifePolicyDocument
}; 