const { Announcement, AnnouncementRead, User, Class } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    successResponse,
    errorResponse,
    getPagination,
    paginatedResponse
} = require('../utils/helpers');

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 * @access  Teacher
 */
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, target_type, target_class_id, attachment_url, is_published } = req.body;

    // Validasi target_class_id jika target_type adalah 'class'
    if (target_type === 'class') {
        if (!target_class_id) {
            return errorResponse(res, 400, 'Target class wajib diisi', 'MISSING_TARGET_CLASS');
        }

        const classExists = await Class.findById(target_class_id);
        if (!classExists) {
            return errorResponse(res, 400, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
        }
    }

    const announcement = await Announcement.create({
        title,
        content,
        author_id: req.user._id,
        target_type,
        target_class_id: target_type === 'class' ? target_class_id : null,
        attachment_url: attachment_url || null,
        is_published: is_published !== false
    });

    const createdAnnouncement = await Announcement.findById(announcement._id)
        .populate('author_id', 'name')
        .populate('target_class_id', 'class_name');

    return successResponse(res, 201, 'Pengumuman berhasil dibuat', { announcement: createdAnnouncement });
});

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Authenticated
 */
const getAllAnnouncements = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { target_type, is_published } = req.query;

    const query = {};

    if (target_type) {
        query.target_type = target_type;
    }

    if (is_published !== undefined) {
        query.is_published = is_published === 'true';
    }

    // Jika bukan admin, hanya tampilkan yang published
    if (req.user.role !== 'admin') {
        query.is_published = true;
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
        .populate('author_id', 'name avatar')
        .populate('target_class_id', 'class_name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    // Add read status for current user
    const announcementIds = announcements.map(a => a._id);
    const readRecords = await AnnouncementRead.find({
        announcement_id: { $in: announcementIds },
        user_id: req.user._id
    });
    const readMap = new Map(readRecords.map(r => [r.announcement_id.toString(), r.read_at]));

    const announcementsWithReadStatus = announcements.map(a => ({
        ...a.toObject(),
        is_read: readMap.has(a._id.toString()),
        read_at: readMap.get(a._id.toString()) || null
    }));

    return paginatedResponse(res, announcementsWithReadStatus, total, page, limit);
});

/**
 * @desc    Get announcement by ID
 * @route   GET /api/announcements/:id
 * @access  Authenticated
 */
const getAnnouncementById = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id)
        .populate('author_id', 'name email avatar')
        .populate('target_class_id', 'class_name grade_level');

    if (!announcement) {
        return errorResponse(res, 404, 'Pengumuman tidak ditemukan', 'ANNOUNCEMENT_NOT_FOUND');
    }

    // Check read status
    const readRecord = await AnnouncementRead.findOne({
        announcement_id: announcement._id,
        user_id: req.user._id
    });

    // Auto mark as read for students
    if (req.user.role === 'student' && !readRecord) {
        await AnnouncementRead.create({
            announcement_id: announcement._id,
            user_id: req.user._id
        });
    }

    return successResponse(res, 200, 'Pengumuman berhasil diambil', {
        announcement: {
            ...announcement.toObject(),
            is_read: !!readRecord,
            read_at: readRecord?.read_at || new Date()
        }
    });
});

/**
 * @desc    Get announcements for current student
 * @route   GET /api/announcements/for-student
 * @access  Student
 */
const getAnnouncementsForStudent = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    // Get student's class
    const student = await User.findById(req.user._id);

    // Query: target semua ATAU target kelas siswa
    const query = {
        is_published: true,
        $or: [
            { target_type: 'all' },
            { target_type: 'class', target_class_id: student.class_id }
        ]
    };

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
        .populate('author_id', 'name avatar')
        .populate('target_class_id', 'class_name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    // Add read status
    const announcementIds = announcements.map(a => a._id);
    const readRecords = await AnnouncementRead.find({
        announcement_id: { $in: announcementIds },
        user_id: req.user._id
    });
    const readMap = new Map(readRecords.map(r => [r.announcement_id.toString(), r.read_at]));

    const announcementsWithReadStatus = announcements.map(a => ({
        ...a.toObject(),
        is_read: readMap.has(a._id.toString()),
        read_at: readMap.get(a._id.toString()) || null
    }));

    return paginatedResponse(res, announcementsWithReadStatus, total, page, limit);
});

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Teacher (author only)
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, target_type, target_class_id, attachment_url, is_published } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return errorResponse(res, 404, 'Pengumuman tidak ditemukan', 'ANNOUNCEMENT_NOT_FOUND');
    }

    // Only author or admin can update
    if (req.user.role !== 'admin' &&
        announcement.author_id.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Anda tidak berhak mengubah pengumuman ini', 'FORBIDDEN');
    }

    // Update fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (target_type) announcement.target_type = target_type;
    if (target_type === 'class' && target_class_id) {
        announcement.target_class_id = target_class_id;
    } else if (target_type === 'all') {
        announcement.target_class_id = null;
    }
    if (attachment_url !== undefined) announcement.attachment_url = attachment_url;
    if (is_published !== undefined) announcement.is_published = is_published;

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(announcement._id)
        .populate('author_id', 'name')
        .populate('target_class_id', 'class_name');

    return successResponse(res, 200, 'Pengumuman berhasil diupdate', { announcement: updatedAnnouncement });
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Teacher (author only), Admin
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return errorResponse(res, 404, 'Pengumuman tidak ditemukan', 'ANNOUNCEMENT_NOT_FOUND');
    }

    // Only author or admin can delete
    if (req.user.role !== 'admin' &&
        announcement.author_id.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Anda tidak berhak menghapus pengumuman ini', 'FORBIDDEN');
    }

    // Delete all read records
    await AnnouncementRead.deleteMany({ announcement_id: announcement._id });

    // Delete announcement
    await Announcement.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Pengumuman berhasil dihapus');
});

/**
 * @desc    Mark announcement as read
 * @route   POST /api/announcements/:id/read
 * @access  Authenticated
 */
const markAsRead = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return errorResponse(res, 404, 'Pengumuman tidak ditemukan', 'ANNOUNCEMENT_NOT_FOUND');
    }

    // Check if already read
    const existingRead = await AnnouncementRead.findOne({
        announcement_id: announcement._id,
        user_id: req.user._id
    });

    if (existingRead) {
        return successResponse(res, 200, 'Pengumuman sudah ditandai sebagai dibaca', {
            read_at: existingRead.read_at
        });
    }

    const readRecord = await AnnouncementRead.create({
        announcement_id: announcement._id,
        user_id: req.user._id
    });

    return successResponse(res, 201, 'Pengumuman berhasil ditandai sebagai dibaca', {
        read_at: readRecord.read_at
    });
});

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    getAnnouncementsForStudent,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead
};
