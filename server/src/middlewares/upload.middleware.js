const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./error.middleware');

// Fix: Base path targets server directory root safely
const baseUploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Configure storage matching structural field constraints
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let subDir = '';
        
        // Match specific structural subdirectories based on field parameters
        if (file.fieldname === 'profilePicture') {
            subDir = 'profiles';
        } else if (file.fieldname === 'productImage') {
            subDir = 'products';
        } else if (file.fieldname === 'report') {
            subDir = 'reports';
        } else if (file.fieldname === 'invoice') {
            subDir = 'invoices';
        }
        
        // Safe combined paths mapping layout destination target
        const fullPath = path.join(baseUploadDir, subDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter matching common application attachments configurations
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
        'application/pdf', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed`, 400), false);
    }
};

// Safe numerical environment limit validation checking parser helper
const getFileLimitInBytes = () => {
    const envLimit = process.env.MAX_FILE_SIZE;
    if (!envLimit) return 5 * 1024 * 1024; // 5MB default

    const parsed = parseInt(envLimit, 10);
    // If the value is tiny (e.g., 5), treat it as MegaBytes and convert to bytes
    return parsed < 1024 ? parsed * 1024 * 1024 : parsed;
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: getFileLimitInBytes()
    },
    fileFilter: fileFilter
});

// Upload middleware for single file
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadHandler = upload.single(fieldName);
        uploadHandler(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'FILE_TOO_LARGE') {
                    return res.status(400).json({
                        status: 'fail',
                        message: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE || 5}MB`
                    });
                }
                return res.status(400).json({ status: 'fail', message: err.message });
            } else if (err) {
                return res.status(400).json({ status: 'fail', message: err.message });
            }
            next();
        });
    };
};

// Upload middleware for multiple files
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        const uploadHandler = upload.array(fieldName, maxCount);
        uploadHandler(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'FILE_TOO_LARGE') {
                    return res.status(400).json({
                        status: 'fail',
                        message: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE || 5}MB`
                    });
                }
                return res.status(400).json({ status: 'fail', message: err.message });
            } else if (err) {
                return res.status(400).json({ status: 'fail', message: err.message });
            }
            next();
        });
    };
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple
};
