const { body, param, query } = require('express-validator');

/**
 * Validators untuk Auth Routes
 */
const authValidators = {
    login: [
        body('identifier')
            .notEmpty()
            .withMessage('NIS atau Email wajib diisi'),
        body('password')
            .notEmpty()
            .withMessage('Password wajib diisi')
    ],

    register: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Nama wajib diisi')
            .isLength({ max: 100 })
            .withMessage('Nama maksimal 100 karakter'),
        body('role')
            .isIn(['student', 'teacher', 'admin'])
            .withMessage('Role harus student, teacher, atau admin'),
        body('nis')
            .if(body('role').equals('student'))
            .notEmpty()
            .withMessage('NIS wajib diisi untuk siswa')
            .isLength({ min: 5 })
            .withMessage('NIS minimal 5 karakter'),
        body('email')
            .if(body('role').isIn(['teacher', 'admin']))
            .notEmpty()
            .withMessage('Email wajib diisi untuk guru/admin')
            .isEmail()
            .withMessage('Format email tidak valid'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password minimal 6 karakter'),
        body('class_id')
            .if(body('role').equals('student'))
            .notEmpty()
            .withMessage('Class ID wajib diisi untuk siswa')
            .isMongoId()
            .withMessage('Class ID tidak valid')
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Password saat ini wajib diisi'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password baru minimal 6 karakter')
    ]
};

/**
 * Validators untuk User Routes
 */
const userValidators = {
    create: authValidators.register,

    update: [
        param('id')
            .isMongoId()
            .withMessage('User ID tidak valid'),
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Nama maksimal 100 karakter'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Format email tidak valid'),
        body('class_id')
            .optional()
            .isMongoId()
            .withMessage('Class ID tidak valid')
    ],

    getById: [
        param('id')
            .isMongoId()
            .withMessage('User ID tidak valid')
    ]
};

/**
 * Validators untuk Class Routes
 */
const classValidators = {
    create: [
        body('class_name')
            .trim()
            .notEmpty()
            .withMessage('Nama kelas wajib diisi')
            .isLength({ max: 50 })
            .withMessage('Nama kelas maksimal 50 karakter'),
        body('grade_level')
            .trim()
            .notEmpty()
            .withMessage('Tingkat kelas wajib diisi'),
        body('school_year')
            .trim()
            .notEmpty()
            .withMessage('Tahun ajaran wajib diisi')
            .matches(/^\d{4}\/\d{4}$/)
            .withMessage('Format tahun ajaran harus YYYY/YYYY (contoh: 2023/2024)'),
        body('teacher_id')
            .optional()
            .isMongoId()
            .withMessage('Teacher ID tidak valid')
    ],

    update: [
        param('id')
            .isMongoId()
            .withMessage('Class ID tidak valid'),
        body('class_name')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Nama kelas maksimal 50 karakter'),
        body('school_year')
            .optional()
            .matches(/^\d{4}\/\d{4}$/)
            .withMessage('Format tahun ajaran harus YYYY/YYYY'),
        body('teacher_id')
            .optional()
            .isMongoId()
            .withMessage('Teacher ID tidak valid')
    ],

    getById: [
        param('id')
            .isMongoId()
            .withMessage('Class ID tidak valid')
    ]
};

/**
 * Validators untuk Activity Routes
 */
const activityValidators = {
    create: [
        body('activity_type')
            .isIn(['pushup', 'situp', 'backup'])
            .withMessage('Jenis aktivitas harus pushup, situp, atau backup'),
        body('count')
            .isInt({ min: 1 })
            .withMessage('Jumlah aktivitas minimal 1'),
        // image_url dan image_proof_id tidak perlu validasi karena file upload ditangani oleh multer
        body('report_date')
            .optional()
            .isISO8601()
            .withMessage('Format tanggal tidak valid')
    ],

    verify: [
        param('id')
            .isMongoId()
            .withMessage('Activity ID tidak valid'),
        body('status')
            .isIn(['verified', 'rejected'])
            .withMessage('Status harus verified atau rejected'),
        body('notes')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Catatan maksimal 500 karakter')
    ],

    getById: [
        param('id')
            .isMongoId()
            .withMessage('Activity ID tidak valid')
    ],

    getByStudent: [
        param('studentId')
            .isMongoId()
            .withMessage('Student ID tidak valid')
    ],

    getByClass: [
        param('classId')
            .isMongoId()
            .withMessage('Class ID tidak valid')
    ]
};

/**
 * Validators untuk Announcement Routes
 */
const announcementValidators = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Judul pengumuman wajib diisi')
            .isLength({ max: 200 })
            .withMessage('Judul maksimal 200 karakter'),
        body('content')
            .notEmpty()
            .withMessage('Isi pengumuman wajib diisi'),
        body('target_type')
            .isIn(['class', 'all'])
            .withMessage('Target harus class atau all'),
        body('target_class_id')
            .if(body('target_type').equals('class'))
            .notEmpty()
            .withMessage('Target class wajib diisi jika target_type adalah class')
            .isMongoId()
            .withMessage('Target class ID tidak valid'),
        body('attachment_url')
            .optional()
            .isURL()
            .withMessage('URL attachment tidak valid')
    ],

    update: [
        param('id')
            .isMongoId()
            .withMessage('Announcement ID tidak valid'),
        body('title')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Judul maksimal 200 karakter'),
        body('target_type')
            .optional()
            .isIn(['class', 'all'])
            .withMessage('Target harus class atau all'),
        body('target_class_id')
            .optional()
            .isMongoId()
            .withMessage('Target class ID tidak valid')
    ],

    getById: [
        param('id')
            .isMongoId()
            .withMessage('Announcement ID tidak valid')
    ]
};

/**
 * Validators untuk Export Routes
 */
const exportValidators = {
    activities: [
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Format startDate tidak valid'),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('Format endDate tidak valid'),
        query('classId')
            .optional()
            .isMongoId()
            .withMessage('Class ID tidak valid'),
        query('status')
            .optional()
            .isIn(['pending', 'verified', 'rejected'])
            .withMessage('Status harus pending, verified, atau rejected')
    ]
};

/**
 * Common validators
 */
const commonValidators = {
    mongoId: (paramName) => [
        param(paramName)
            .isMongoId()
            .withMessage(`${paramName} tidak valid`)
    ],

    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page harus angka positif'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit harus antara 1-100')
    ]
};

module.exports = {
    authValidators,
    userValidators,
    classValidators,
    activityValidators,
    announcementValidators,
    exportValidators,
    commonValidators
};
