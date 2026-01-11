const { ActivityReport, User, Class, Announcement, AnnouncementRead } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    successResponse,
    getTodayRange,
    getWeekRange,
    getMonthRange
} = require('../utils/helpers');

/**
 * @desc    Get student dashboard data
 * @route   GET /api/dashboard/student
 * @access  Student
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { startOfDay, endOfDay } = getTodayRange();
    const { startOfWeek, endOfWeek } = getWeekRange();

    // Get student info with class
    const student = await User.findById(studentId)
        .select('name nis avatar class_id')
        .populate('class_id', 'class_name grade_level');

    // Today's activities
    const todayActivities = await ActivityReport.find({
        student_id: studentId,
        report_date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ created_at: -1 });

    // Weekly stats
    const weeklyActivities = await ActivityReport.find({
        student_id: studentId,
        report_date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const weeklyStats = {
        totalActivities: weeklyActivities.length,
        totalPushup: weeklyActivities.filter(a => a.activity_type === 'pushup').reduce((sum, a) => sum + a.count, 0),
        totalSitup: weeklyActivities.filter(a => a.activity_type === 'situp').reduce((sum, a) => sum + a.count, 0),
        totalBackup: weeklyActivities.filter(a => a.activity_type === 'backup').reduce((sum, a) => sum + a.count, 0),
        verifiedCount: weeklyActivities.filter(a => a.status === 'verified').length,
        pendingCount: weeklyActivities.filter(a => a.status === 'pending').length,
        rejectedCount: weeklyActivities.filter(a => a.status === 'rejected').length
    };

    // Recent announcements (for this student)
    const announcementQuery = {
        is_published: true,
        $or: [
            { target_type: 'all' },
            { target_type: 'class', target_class_id: student.class_id?._id }
        ]
    };

    const recentAnnouncements = await Announcement.find(announcementQuery)
        .populate('author_id', 'name')
        .sort({ created_at: -1 })
        .limit(5);

    // Add read status
    const announcementIds = recentAnnouncements.map(a => a._id);
    const readRecords = await AnnouncementRead.find({
        announcement_id: { $in: announcementIds },
        user_id: studentId
    });
    const readSet = new Set(readRecords.map(r => r.announcement_id.toString()));

    const announcementsWithStatus = recentAnnouncements.map(a => ({
        _id: a._id,
        title: a.title,
        author_name: a.author_id?.name,
        created_at: a.created_at,
        is_read: readSet.has(a._id.toString())
    }));

    // Unread count
    const allAnnouncementIds = await Announcement.find(announcementQuery).select('_id');
    const allReadRecords = await AnnouncementRead.find({
        announcement_id: { $in: allAnnouncementIds.map(a => a._id) },
        user_id: studentId
    });
    const unreadCount = allAnnouncementIds.length - allReadRecords.length;

    return successResponse(res, 200, 'Dashboard student berhasil diambil', {
        user: {
            _id: student._id,
            name: student.name,
            nis: student.nis,
            avatar: student.avatar,
            class_name: student.class_id?.class_name
        },
        todayActivities: todayActivities.map(a => ({
            activity_type: a.activity_type,
            count: a.count,
            status: a.status
        })),
        weeklyStats,
        recentAnnouncements: announcementsWithStatus,
        unreadAnnouncementsCount: unreadCount
    });
});

/**
 * @desc    Get teacher dashboard data
 * @route   GET /api/dashboard/teacher
 * @access  Teacher
 */
const getTeacherDashboard = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;
    const { startOfDay, endOfDay } = getTodayRange();
    const { startOfWeek, endOfWeek } = getWeekRange();

    // Get teacher's classes
    const teacherClasses = await Class.find({ teacher_id: teacherId })
        .select('class_name grade_level');

    // Get classes with student count
    const classesWithCount = await Promise.all(
        teacherClasses.map(async (c) => {
            const studentCount = await User.countDocuments({ class_id: c._id, role: 'student' });
            return {
                _id: c._id,
                class_name: c.class_name,
                grade_level: c.grade_level,
                student_count: studentCount
            };
        })
    );

    // Get student IDs from teacher's classes
    const classIds = teacherClasses.map(c => c._id);
    const studentsInClasses = await User.find({
        class_id: { $in: classIds },
        role: 'student'
    }).select('_id name class_id');
    const studentIds = studentsInClasses.map(s => s._id);

    // Pending reports
    const pendingReports = await ActivityReport.find({
        student_id: { $in: studentIds },
        status: 'pending'
    })
        .populate({
            path: 'student_id',
            select: 'name nis class_id',
            populate: { path: 'class_id', select: 'class_name' }
        })
        .sort({ created_at: 1 })
        .limit(10);

    // Today stats
    const todayActivities = await ActivityReport.find({
        student_id: { $in: studentIds },
        report_date: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayStats = {
        totalReports: todayActivities.length,
        verified: todayActivities.filter(a => a.status === 'verified').length,
        pending: todayActivities.filter(a => a.status === 'pending').length,
        rejected: todayActivities.filter(a => a.status === 'rejected').length
    };

    // Weekly stats
    const weeklyActivities = await ActivityReport.find({
        student_id: { $in: studentIds },
        report_date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const weeklyStats = {
        totalActivities: weeklyActivities.length,
        averagePerStudent: studentIds.length > 0
            ? Math.round((weeklyActivities.length / studentIds.length) * 10) / 10
            : 0
    };

    // Total pending count
    const totalPendingCount = await ActivityReport.countDocuments({
        student_id: { $in: studentIds },
        status: 'pending'
    });

    return successResponse(res, 200, 'Dashboard teacher berhasil diambil', {
        user: {
            _id: req.user._id,
            name: req.user.name
        },
        classes: classesWithCount,
        totalStudents: studentIds.length,
        pendingReports: {
            total: totalPendingCount,
            reports: pendingReports.map(r => ({
                _id: r._id,
                student_name: r.student_id?.name,
                student_nis: r.student_id?.nis,
                class_name: r.student_id?.class_id?.class_name,
                activity_type: r.activity_type,
                count: r.count,
                image_url: r.image_url,
                created_at: r.created_at
            }))
        },
        todayStats,
        weeklyStats
    });
});

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/dashboard/admin
 * @access  Admin
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
    const { startOfDay, endOfDay } = getTodayRange();
    const { startOfWeek, endOfWeek } = getWeekRange();
    const { startOfMonth, endOfMonth } = getMonthRange();

    // Overview counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();
    const totalActivities = await ActivityReport.countDocuments();

    // Activity stats by time
    const todayActivities = await ActivityReport.countDocuments({
        report_date: { $gte: startOfDay, $lte: endOfDay }
    });
    const weekActivities = await ActivityReport.countDocuments({
        report_date: { $gte: startOfWeek, $lte: endOfWeek }
    });
    const monthActivities = await ActivityReport.countDocuments({
        report_date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Status distribution
    const pendingCount = await ActivityReport.countDocuments({ status: 'pending' });
    const verifiedCount = await ActivityReport.countDocuments({ status: 'verified' });
    const rejectedCount = await ActivityReport.countDocuments({ status: 'rejected' });

    // Top active classes (by activity count this month)
    const classActivityStats = await ActivityReport.aggregate([
        {
            $match: {
                report_date: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'student_id',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: '$student' },
        {
            $group: {
                _id: '$student.class_id',
                total_activities: { $sum: 1 }
            }
        },
        { $sort: { total_activities: -1 } },
        { $limit: 5 }
    ]);

    // Get class names
    const classIds = classActivityStats.map(c => c._id);
    const classes = await Class.find({ _id: { $in: classIds } }).select('class_name');
    const classMap = new Map(classes.map(c => [c._id.toString(), c.class_name]));

    const topActiveClasses = classActivityStats.map(c => ({
        class_name: classMap.get(c._id?.toString()) || 'Unknown',
        total_activities: c.total_activities
    }));

    // Recent activities
    const recentActivities = await ActivityReport.find()
        .populate({
            path: 'student_id',
            select: 'name class_id',
            populate: { path: 'class_id', select: 'class_name' }
        })
        .sort({ created_at: -1 })
        .limit(10);

    return successResponse(res, 200, 'Dashboard admin berhasil diambil', {
        overview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalActivities
        },
        activityStats: {
            today: todayActivities,
            thisWeek: weekActivities,
            thisMonth: monthActivities
        },
        statusDistribution: {
            pending: pendingCount,
            verified: verifiedCount,
            rejected: rejectedCount
        },
        topActiveClasses,
        recentActivities: recentActivities.map(a => ({
            _id: a._id,
            student_name: a.student_id?.name,
            class_name: a.student_id?.class_id?.class_name,
            activity_type: a.activity_type,
            count: a.count,
            status: a.status,
            created_at: a.created_at
        }))
    });
});

module.exports = {
    getStudentDashboard,
    getTeacherDashboard,
    getAdminDashboard
};
