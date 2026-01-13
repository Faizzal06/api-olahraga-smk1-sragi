/**
 * File Upload Middleware
 * Middleware untuk handling file upload menggunakan multer
 */
const multer = require('multer');

// Konfigurasi storage - gunakan memory storage untuk buffer
const storage = multer.memoryStorage();

// Filter file - hanya terima gambar
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'), false);
    }
};

// Konfigurasi multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Maksimal 5MB
    }
});

// Middleware untuk single file upload dengan field name 'image'
const uploadSingleImage = upload.single('image');

// Wrapper untuk handling error multer
const handleUpload = (req, res, next) => {
    uploadSingleImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Error dari multer
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran file terlalu besar. Maksimal 5MB.',
                    error: 'FILE_TOO_LARGE'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
                error: 'UPLOAD_ERROR'
            });
        } else if (err) {
            // Error dari file filter atau lainnya
            return res.status(400).json({
                success: false,
                message: err.message,
                error: 'INVALID_FILE'
            });
        }
        next();
    });
};

module.exports = {
    upload,
    uploadSingleImage,
    handleUpload
};
