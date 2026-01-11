/**
 * Middleware untuk role-based access control
 * Mengecek apakah user memiliki role yang diizinkan
 */

/**
 * Memeriksa apakah user memiliki salah satu dari role yang diizinkan
 * @param  {...string} allowedRoles - Role yang diizinkan (student, teacher, admin)
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Pastikan user sudah terautentikasi
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Silakan login terlebih dahulu.',
                error: 'NOT_AUTHENTICATED'
            });
        }

        // Cek apakah role user ada di daftar yang diizinkan
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk mengakses resource ini.`,
                error: 'FORBIDDEN',
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

/**
 * Shortcut middleware untuk role-role umum
 */
const isStudent = authorize('student');
const isTeacher = authorize('teacher');
const isAdmin = authorize('admin');
const isTeacherOrAdmin = authorize('teacher', 'admin');
const isAuthenticated = authorize('student', 'teacher', 'admin');

/**
 * Middleware untuk memastikan user hanya bisa mengakses data miliknya sendiri
 * Digunakan bersamaan dengan auth middleware
 * @param {string} paramName - Nama parameter yang berisi user ID (default: 'id')
 */
const isOwner = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Silakan login terlebih dahulu.',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const resourceOwnerId = req.params[paramName];

        // Admin dan Teacher bisa mengakses semua data
        if (req.user.role === 'admin' || req.user.role === 'teacher') {
            return next();
        }

        // Student hanya bisa mengakses data miliknya sendiri
        if (req.user._id.toString() !== resourceOwnerId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda hanya bisa mengakses data milik sendiri.',
                error: 'NOT_OWNER'
            });
        }

        next();
    };
};

/**
 * Middleware untuk memastikan guru hanya bisa mengakses data kelas yang dia wali
 */
const isClassTeacher = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Silakan login terlebih dahulu.',
                error: 'NOT_AUTHENTICATED'
            });
        }

        // Admin bisa mengakses semua
        if (req.user.role === 'admin') {
            return next();
        }

        const classId = req.params.classId || req.body.class_id;

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: 'Class ID tidak ditemukan.',
                error: 'MISSING_CLASS_ID'
            });
        }

        const Class = require('../models/Class');
        const classData = await Class.findById(classId);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan.',
                error: 'CLASS_NOT_FOUND'
            });
        }

        // Cek apakah guru adalah wali kelas
        if (req.user.role === 'teacher' &&
            classData.teacher_id &&
            classData.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda bukan wali kelas ini.',
                error: 'NOT_CLASS_TEACHER'
            });
        }

        req.classData = classData;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server.',
            error: 'SERVER_ERROR'
        });
    }
};

module.exports = {
    authorize,
    isStudent,
    isTeacher,
    isAdmin,
    isTeacherOrAdmin,
    isAuthenticated,
    isOwner,
    isClassTeacher
};
