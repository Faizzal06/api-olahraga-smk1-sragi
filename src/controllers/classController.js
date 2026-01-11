const { Class, User } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    successResponse,
    errorResponse,
    getPagination,
    paginatedResponse
} = require('../utils/helpers');

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 * @access  Authenticated
 */
const getAllClasses = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { grade_level, school_year, search } = req.query;

    // Build query
    const query = {};

    if (grade_level) {
        query.grade_level = grade_level;
    }

    if (school_year) {
        query.school_year = school_year;
    }

    if (search) {
        query.class_name = { $regex: search, $options: 'i' };
    }

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
        .populate('teacher_id', 'name email')
        .sort({ grade_level: 1, class_name: 1 })
        .skip(skip)
        .limit(limit);

    // Count students per class
    const classesWithCount = await Promise.all(
        classes.map(async (classItem) => {
            const studentCount = await User.countDocuments({
                class_id: classItem._id,
                role: 'student'
            });
            return {
                ...classItem.toObject(),
                student_count: studentCount
            };
        })
    );

    return paginatedResponse(res, classesWithCount, total, page, limit);
});

/**
 * @desc    Get class by ID
 * @route   GET /api/classes/:id
 * @access  Authenticated
 */
const getClassById = asyncHandler(async (req, res) => {
    const classData = await Class.findById(req.params.id)
        .populate('teacher_id', 'name email avatar');

    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    // Get students in this class
    const students = await User.find({
        class_id: classData._id,
        role: 'student'
    })
        .select('name nis avatar')
        .sort({ name: 1 });

    return successResponse(res, 200, 'Kelas berhasil diambil', {
        class: classData,
        students,
        student_count: students.length
    });
});

/**
 * @desc    Create class
 * @route   POST /api/classes
 * @access  Admin
 */
const createClass = asyncHandler(async (req, res) => {
    const { class_name, grade_level, school_year, teacher_id } = req.body;

    // Validasi teacher jika ada
    if (teacher_id) {
        const teacher = await User.findOne({ _id: teacher_id, role: 'teacher' });
        if (!teacher) {
            return errorResponse(res, 400, 'Teacher tidak ditemukan atau bukan guru', 'INVALID_TEACHER');
        }
    }

    const newClass = await Class.create({
        class_name,
        grade_level,
        school_year,
        teacher_id: teacher_id || null
    });

    const classData = await Class.findById(newClass._id)
        .populate('teacher_id', 'name email');

    return successResponse(res, 201, 'Kelas berhasil dibuat', { class: classData });
});

/**
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Admin
 */
const updateClass = asyncHandler(async (req, res) => {
    const { class_name, grade_level, school_year, teacher_id } = req.body;

    const classData = await Class.findById(req.params.id);
    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    // Validasi teacher jika ada
    if (teacher_id) {
        const teacher = await User.findOne({ _id: teacher_id, role: 'teacher' });
        if (!teacher) {
            return errorResponse(res, 400, 'Teacher tidak ditemukan atau bukan guru', 'INVALID_TEACHER');
        }
    }

    // Update fields
    if (class_name) classData.class_name = class_name;
    if (grade_level) classData.grade_level = grade_level;
    if (school_year) classData.school_year = school_year;
    if (teacher_id !== undefined) classData.teacher_id = teacher_id || null;

    await classData.save();

    const updatedClass = await Class.findById(classData._id)
        .populate('teacher_id', 'name email');

    return successResponse(res, 200, 'Kelas berhasil diupdate', { class: updatedClass });
});

/**
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Admin
 */
const deleteClass = asyncHandler(async (req, res) => {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    // Cek apakah ada siswa di kelas ini
    const studentCount = await User.countDocuments({ class_id: classData._id });
    if (studentCount > 0) {
        return errorResponse(
            res,
            400,
            `Tidak dapat menghapus kelas. Masih ada ${studentCount} siswa di kelas ini.`,
            'CLASS_HAS_STUDENTS'
        );
    }

    await Class.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Kelas berhasil dihapus');
});

/**
 * @desc    Get students in a class
 * @route   GET /api/classes/:id/students
 * @access  Admin, Teacher
 */
const getClassStudents = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    const classData = await Class.findById(req.params.id);
    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    const query = { class_id: classData._id, role: 'student' };

    const total = await User.countDocuments(query);
    const students = await User.find(query)
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, students, total, page, limit);
});

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassStudents
};
