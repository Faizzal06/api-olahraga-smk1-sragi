const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler, AppError } = require('../middleware');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @desc    Login user (siswa dengan NIS, guru/admin dengan email)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    // Cari user berdasarkan NIS atau email
    const user = await User.findOne({
        $or: [
            { nis: identifier },
            { email: identifier.toLowerCase() }
        ]
    }).populate('class_id', 'class_name grade_level school_year');

    if (!user) {
        return errorResponse(res, 401, 'NIS/Email atau password salah', 'INVALID_CREDENTIALS');
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return errorResponse(res, 401, 'NIS/Email atau password salah', 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, 200, 'Login berhasil', {
        user: user.toPublicJSON(),
        token
    });
});

/**
 * @desc    Register user baru (hanya admin)
 * @route   POST /api/auth/register
 * @access  Admin
 */
const register = asyncHandler(async (req, res) => {
    const { name, password, role, class_id, avatar } = req.body;

    // Normalize nis and email - treat empty strings as undefined
    const nis = req.body.nis?.trim() || undefined;
    const email = req.body.email?.trim() || undefined;

    // Validasi role-based requirements
    if (role === 'student' && !nis) {
        return errorResponse(res, 400, 'NIS wajib diisi untuk siswa', 'VALIDATION_ERROR');
    }

    if ((role === 'teacher' || role === 'admin') && !email) {
        return errorResponse(res, 400, 'Email wajib diisi untuk guru/admin', 'VALIDATION_ERROR');
    }

    // Cek apakah NIS atau email sudah digunakan
    if (nis) {
        const existingNis = await User.findOne({ nis });
        if (existingNis) {
            return errorResponse(res, 400, 'NIS sudah digunakan', 'DUPLICATE_NIS');
        }
    }

    if (email) {
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return errorResponse(res, 400, 'Email sudah digunakan', 'DUPLICATE_EMAIL');
        }
    }

    // Build user data conditionally - omit null fields so sparse index works
    const userData = {
        name,
        password,
        role,
        class_id: class_id || null,
        avatar: avatar || null
    };

    // Only include nis/email if they have values (for sparse unique index)
    if (nis) userData.nis = nis;
    if (email) userData.email = email.toLowerCase();

    const user = await User.create(userData);

    return successResponse(res, 201, 'User berhasil didaftarkan', {
        user: user.toPublicJSON()
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Authenticated
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year teacher_id');

    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Profil berhasil diambil', { user });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Authenticated
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Ambil user dengan password
    const user = await User.findById(req.user._id);

    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    // Verifikasi password saat ini
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return errorResponse(res, 400, 'Password saat ini tidak sesuai', 'INVALID_PASSWORD');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password berhasil diubah');
});

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Authenticated
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
    )
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year');

    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Profil berhasil diupdate', { user });
});

module.exports = {
    login,
    register,
    getProfile,
    changePassword,
    updateProfile
};
