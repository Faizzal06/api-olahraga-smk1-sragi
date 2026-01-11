const { User, Class } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    successResponse,
    errorResponse,
    getPagination,
    paginatedResponse
} = require('../utils/helpers');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin, Teacher
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { role, class_id, search } = req.query;

    // Build query
    const query = {};

    if (role) {
        query.role = role;
    }

    if (class_id) {
        query.class_id = class_id;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { nis: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Jika teacher, hanya tampilkan students dari kelas yang dia wali
    if (req.user.role === 'teacher') {
        const teacherClasses = await Class.find({ teacher_id: req.user._id }).select('_id');
        const classIds = teacherClasses.map(c => c._id);
        query.class_id = { $in: classIds };
        query.role = 'student';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, users, total, page, limit);
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin, Teacher
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year teacher_id');

    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    return successResponse(res, 200, 'User berhasil diambil', { user });
});

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Admin
 */
const createUser = asyncHandler(async (req, res) => {
    const { name, nis, email, password, role, class_id, avatar } = req.body;

    // Validasi role-based requirements
    if (role === 'student' && !nis) {
        return errorResponse(res, 400, 'NIS wajib diisi untuk siswa', 'VALIDATION_ERROR');
    }

    if ((role === 'teacher' || role === 'admin') && !email) {
        return errorResponse(res, 400, 'Email wajib diisi untuk guru/admin', 'VALIDATION_ERROR');
    }

    // Cek duplikasi
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

    const user = await User.create({
        name,
        nis: nis || null,
        email: email ? email.toLowerCase() : null,
        password,
        role,
        class_id: class_id || null,
        avatar: avatar || null
    });

    const createdUser = await User.findById(user._id)
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year');

    return successResponse(res, 201, 'User berhasil dibuat', { user: createdUser });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
    const { name, nis, email, role, class_id, avatar } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    // Cek duplikasi jika update NIS atau email
    if (nis && nis !== user.nis) {
        const existingNis = await User.findOne({ nis });
        if (existingNis) {
            return errorResponse(res, 400, 'NIS sudah digunakan', 'DUPLICATE_NIS');
        }
    }

    if (email && email.toLowerCase() !== user.email) {
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return errorResponse(res, 400, 'Email sudah digunakan', 'DUPLICATE_EMAIL');
        }
    }

    // Update fields
    if (name) user.name = name;
    if (nis !== undefined) user.nis = nis || null;
    if (email !== undefined) user.email = email ? email.toLowerCase() : null;
    if (role) user.role = role;
    if (class_id !== undefined) user.class_id = class_id || null;
    if (avatar !== undefined) user.avatar = avatar || null;

    await user.save();

    const updatedUser = await User.findById(user._id)
        .select('-password')
        .populate('class_id', 'class_name grade_level school_year');

    return successResponse(res, 200, 'User berhasil diupdate', { user: updatedUser });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
        return errorResponse(res, 400, 'Tidak dapat menghapus akun sendiri', 'CANNOT_DELETE_SELF');
    }

    await User.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'User berhasil dihapus');
});

/**
 * @desc    Reset user password (Admin only)
 * @route   PUT /api/users/:id/reset-password
 * @access  Admin
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return errorResponse(res, 400, 'Password baru minimal 6 karakter', 'VALIDATION_ERROR');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return errorResponse(res, 404, 'User tidak ditemukan', 'USER_NOT_FOUND');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password berhasil direset');
});

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
};
