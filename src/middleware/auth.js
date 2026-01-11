const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware untuk verifikasi JWT token
 * Token harus dikirim di header Authorization dengan format: Bearer <token>
 */
const auth = async (req, res, next) => {
    try {
        // Ambil token dari header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan.',
                error: 'NO_TOKEN'
            });
        }

        // Cek format Bearer token
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Format token tidak valid. Gunakan format: Bearer <token>',
                error: 'INVALID_TOKEN_FORMAT'
            });
        }

        // Extract token
        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Cari user berdasarkan ID dari token
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate('class_id', 'class_name grade_level school_year');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User tidak ditemukan.',
                error: 'USER_NOT_FOUND'
            });
        }

        // Attach user ke request object
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid.',
                error: 'INVALID_TOKEN'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah kadaluarsa. Silakan login ulang.',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server.',
            error: 'SERVER_ERROR'
        });
    }
};

/**
 * Middleware opsional - tidak error jika tidak ada token
 * Berguna untuk endpoint yang bisa diakses publik tapi memberikan data tambahan jika login
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate('class_id', 'class_name grade_level school_year');

        if (user) {
            req.user = user;
            req.token = token;
        }

        next();
    } catch (error) {
        // Jika token invalid, lanjutkan tanpa user
        next();
    }
};

module.exports = { auth, optionalAuth };
