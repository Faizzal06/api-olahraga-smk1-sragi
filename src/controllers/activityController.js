const { ActivityReport, User, Class } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    successResponse,
    errorResponse,
    getPagination,
    paginatedResponse,
    getTodayRange,
    getDateRange
} = require('../utils/helpers');

/**
 * @desc    Create activity report
 * @route   POST /api/activities
 * @access  Student
 */
const createActivity = asyncHandler(async (req, res) => {
    const { activity_type, count, image_url, image_proof_id, report_date } = req.body;
    const student_id = req.user._id;

    // Set report date (default hari ini)
    const reportDate = report_date ? new Date(report_date) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    // Cek apakah sudah ada laporan untuk aktivitas ini hari ini
    const existingReport = await ActivityReport.checkDuplicateReport(
        student_id,
        activity_type,
        reportDate
    );

    if (existingReport) {
        return errorResponse(
            res,
            400,
            `Anda sudah melaporkan aktivitas ${activity_type} untuk tanggal ini`,
            'DUPLICATE_REPORT'
        );
    }

    const activity = await ActivityReport.create({
        student_id,
        activity_type,
        count,
        image_url,
        image_proof_id,
        report_date: reportDate,
        status: 'pending'
    });

    const createdActivity = await ActivityReport.findById(activity._id)
        .populate('student_id', 'name nis class_id');

    return successResponse(res, 201, 'Laporan aktivitas berhasil dibuat', { activity: createdActivity });
});

/**
 * @desc    Get all activities
 * @route   GET /api/activities
 * @access  Authenticated
 */
const getAllActivities = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { status, activity_type, class_id, student_id, startDate, endDate } = req.query;

    // Build query
    const query = {};

    if (status) {
        query.status = status;
    }

    if (activity_type) {
        query.activity_type = activity_type;
    }

    if (student_id) {
        query.student_id = student_id;
    }

    // Filter by date range
    if (startDate || endDate) {
        const { start, end } = getDateRange(startDate, endDate);
        query.report_date = { $gte: start, $lte: end };
    }

    // Filter by class
    if (class_id) {
        const studentsInClass = await User.find({ class_id, role: 'student' }).select('_id');
        query.student_id = { $in: studentsInClass.map(s => s._id) };
    }

    // Jika student, hanya tampilkan aktivitas miliknya
    if (req.user.role === 'student') {
        query.student_id = req.user._id;
    }

    // Jika teacher, hanya tampilkan aktivitas dari kelas yang dia wali
    if (req.user.role === 'teacher') {
        const teacherClasses = await Class.find({ teacher_id: req.user._id }).select('_id');
        const classIds = teacherClasses.map(c => c._id);
        const studentsInClasses = await User.find({
            class_id: { $in: classIds },
            role: 'student'
        }).select('_id');

        if (!student_id) {
            query.student_id = { $in: studentsInClasses.map(s => s._id) };
        }
    }

    const total = await ActivityReport.countDocuments(query);
    const activities = await ActivityReport.find(query)
        .populate({
            path: 'student_id',
            select: 'name nis avatar class_id',
            populate: {
                path: 'class_id',
                select: 'class_name grade_level'
            }
        })
        .populate('verified_by', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, activities, total, page, limit);
});

/**
 * @desc    Get activity by ID
 * @route   GET /api/activities/:id
 * @access  Authenticated
 */
const getActivityById = asyncHandler(async (req, res) => {
    const activity = await ActivityReport.findById(req.params.id)
        .populate({
            path: 'student_id',
            select: 'name nis avatar class_id',
            populate: {
                path: 'class_id',
                select: 'class_name grade_level'
            }
        })
        .populate('verified_by', 'name email');

    if (!activity) {
        return errorResponse(res, 404, 'Aktivitas tidak ditemukan', 'ACTIVITY_NOT_FOUND');
    }

    // Student hanya bisa lihat aktivitas miliknya
    if (req.user.role === 'student' &&
        activity.student_id._id.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Akses ditolak', 'FORBIDDEN');
    }

    return successResponse(res, 200, 'Aktivitas berhasil diambil', { activity });
});

/**
 * @desc    Get activities by student
 * @route   GET /api/activities/student/:studentId
 * @access  Authenticated
 */
const getActivitiesByStudent = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { studentId } = req.params;
    const { status, activity_type, startDate, endDate } = req.query;

    // Jika student, hanya bisa lihat aktivitas miliknya
    if (req.user.role === 'student' && studentId !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Akses ditolak', 'FORBIDDEN');
    }

    const query = { student_id: studentId };

    if (status) query.status = status;
    if (activity_type) query.activity_type = activity_type;

    if (startDate || endDate) {
        const { start, end } = getDateRange(startDate, endDate);
        query.report_date = { $gte: start, $lte: end };
    }

    const total = await ActivityReport.countDocuments(query);
    const activities = await ActivityReport.find(query)
        .populate('verified_by', 'name')
        .sort({ report_date: -1, created_at: -1 })
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, activities, total, page, limit);
});

/**
 * @desc    Get activities by class
 * @route   GET /api/activities/class/:classId
 * @access  Teacher, Admin
 */
const getActivitiesByClass = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { classId } = req.params;
    const { status, activity_type, startDate, endDate } = req.query;

    // Cek apakah kelas ada
    const classData = await Class.findById(classId);
    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    // Get students in class
    const studentsInClass = await User.find({ class_id: classId, role: 'student' }).select('_id');
    const studentIds = studentsInClass.map(s => s._id);

    const query = { student_id: { $in: studentIds } };

    if (status) query.status = status;
    if (activity_type) query.activity_type = activity_type;

    if (startDate || endDate) {
        const { start, end } = getDateRange(startDate, endDate);
        query.report_date = { $gte: start, $lte: end };
    }

    const total = await ActivityReport.countDocuments(query);
    const activities = await ActivityReport.find(query)
        .populate({
            path: 'student_id',
            select: 'name nis avatar'
        })
        .populate('verified_by', 'name')
        .sort({ report_date: -1, created_at: -1 })
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, activities, total, page, limit);
});

/**
 * @desc    Verify activity (accept/reject)
 * @route   PUT /api/activities/:id/verify
 * @access  Teacher
 */
const verifyActivity = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
        return errorResponse(res, 400, 'Status harus verified atau rejected', 'INVALID_STATUS');
    }

    const activity = await ActivityReport.findById(req.params.id)
        .populate('student_id', 'name class_id');

    if (!activity) {
        return errorResponse(res, 404, 'Aktivitas tidak ditemukan', 'ACTIVITY_NOT_FOUND');
    }

    // Cek apakah teacher adalah wali kelas dari siswa ini (opsional, bisa diaktifkan)
    // const studentClass = await Class.findById(activity.student_id.class_id);
    // if (studentClass.teacher_id.toString() !== req.user._id.toString()) {
    //   return errorResponse(res, 403, 'Anda bukan wali kelas siswa ini', 'NOT_CLASS_TEACHER');
    // }

    activity.status = status;
    activity.verified_by = req.user._id;
    activity.verified_at = new Date();
    if (notes) activity.notes = notes;

    await activity.save();

    const updatedActivity = await ActivityReport.findById(activity._id)
        .populate({
            path: 'student_id',
            select: 'name nis class_id',
            populate: {
                path: 'class_id',
                select: 'class_name'
            }
        })
        .populate('verified_by', 'name');

    return successResponse(res, 200, `Aktivitas berhasil di-${status}`, { activity: updatedActivity });
});

/**
 * @desc    Delete activity
 * @route   DELETE /api/activities/:id
 * @access  Student (own), Admin
 */
const deleteActivity = asyncHandler(async (req, res) => {
    const activity = await ActivityReport.findById(req.params.id);

    if (!activity) {
        return errorResponse(res, 404, 'Aktivitas tidak ditemukan', 'ACTIVITY_NOT_FOUND');
    }

    // Student hanya bisa hapus aktivitas miliknya yang masih pending
    if (req.user.role === 'student') {
        if (activity.student_id.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Akses ditolak', 'FORBIDDEN');
        }
        if (activity.status !== 'pending') {
            return errorResponse(
                res,
                400,
                'Hanya aktivitas dengan status pending yang bisa dihapus',
                'CANNOT_DELETE_VERIFIED'
            );
        }
    }

    await ActivityReport.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Aktivitas berhasil dihapus');
});

/**
 * @desc    Get pending activities for teacher
 * @route   GET /api/activities/pending
 * @access  Teacher, Admin
 */
const getPendingActivities = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    let query = { status: 'pending' };

    // Jika teacher, filter berdasarkan kelas yang diwali
    if (req.user.role === 'teacher') {
        const teacherClasses = await Class.find({ teacher_id: req.user._id }).select('_id');
        const classIds = teacherClasses.map(c => c._id);
        const studentsInClasses = await User.find({
            class_id: { $in: classIds },
            role: 'student'
        }).select('_id');

        query.student_id = { $in: studentsInClasses.map(s => s._id) };
    }

    const total = await ActivityReport.countDocuments(query);
    const activities = await ActivityReport.find(query)
        .populate({
            path: 'student_id',
            select: 'name nis avatar class_id',
            populate: {
                path: 'class_id',
                select: 'class_name grade_level'
            }
        })
        .sort({ created_at: 1 }) // Oldest first for fair processing
        .skip(skip)
        .limit(limit);

    return paginatedResponse(res, activities, total, page, limit);
});

module.exports = {
    createActivity,
    getAllActivities,
    getActivityById,
    getActivitiesByStudent,
    getActivitiesByClass,
    verifyActivity,
    deleteActivity,
    getPendingActivities
};
