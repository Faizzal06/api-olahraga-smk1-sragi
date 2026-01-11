const ExcelJS = require('exceljs');
const { ActivityReport, User, Class } = require('../models');
const { asyncHandler } = require('../middleware');
const {
    errorResponse,
    getDateRange,
    capitalizeFirst,
    sanitizeFilename
} = require('../utils/helpers');

/**
 * @desc    Export activities to Excel
 * @route   GET /api/export/activities
 * @access  Teacher, Admin
 */
const exportActivities = asyncHandler(async (req, res) => {
    const { startDate, endDate, classId, status, activity_type } = req.query;

    // Build query
    const query = {};

    if (startDate || endDate) {
        const { start, end } = getDateRange(startDate, endDate);
        query.report_date = { $gte: start, $lte: end };
    }

    if (status) {
        query.status = status;
    }

    if (activity_type) {
        query.activity_type = activity_type;
    }

    // Filter by class
    if (classId) {
        const studentsInClass = await User.find({ class_id: classId, role: 'student' }).select('_id');
        query.student_id = { $in: studentsInClass.map(s => s._id) };
    }

    // If teacher, only export from their classes
    if (req.user.role === 'teacher') {
        const teacherClasses = await Class.find({ teacher_id: req.user._id }).select('_id');
        const classIds = teacherClasses.map(c => c._id);
        const studentsInClasses = await User.find({
            class_id: { $in: classIds },
            role: 'student'
        }).select('_id');

        if (!classId) {
            query.student_id = { $in: studentsInClasses.map(s => s._id) };
        }
    }

    // Get activities
    const activities = await ActivityReport.find(query)
        .populate({
            path: 'student_id',
            select: 'name nis class_id',
            populate: { path: 'class_id', select: 'class_name grade_level' }
        })
        .populate('verified_by', 'name')
        .sort({ report_date: -1, created_at: -1 });

    if (activities.length === 0) {
        return errorResponse(res, 404, 'Tidak ada data untuk di-export', 'NO_DATA');
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tracking Activity System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Laporan Aktivitas');

    // Define columns
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIS', key: 'nis', width: 15 },
        { header: 'Nama Siswa', key: 'name', width: 25 },
        { header: 'Kelas', key: 'class', width: 15 },
        { header: 'Jenis Aktivitas', key: 'activity', width: 15 },
        { header: 'Jumlah', key: 'count', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Diverifikasi Oleh', key: 'verifier', width: 20 },
        { header: 'Tanggal Verifikasi', key: 'verifiedAt', width: 18 },
        { header: 'Catatan', key: 'notes', width: 30 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    activities.forEach((activity, index) => {
        worksheet.addRow({
            no: index + 1,
            date: activity.report_date ? activity.report_date.toLocaleDateString('id-ID') : '-',
            nis: activity.student_id?.nis || '-',
            name: activity.student_id?.name || '-',
            class: activity.student_id?.class_id?.class_name || '-',
            activity: capitalizeFirst(activity.activity_type),
            count: activity.count,
            status: capitalizeFirst(activity.status),
            verifier: activity.verified_by?.name || '-',
            verifiedAt: activity.verified_at ? activity.verified_at.toLocaleDateString('id-ID') : '-',
            notes: activity.notes || '-'
        });
    });

    // Auto filter
    worksheet.autoFilter = 'A1:K1';

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `laporan_aktivitas_${dateStr}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
});

/**
 * @desc    Export students data
 * @route   GET /api/export/students
 * @access  Teacher, Admin
 */
const exportStudents = asyncHandler(async (req, res) => {
    const { classId } = req.query;

    // Build query
    const query = { role: 'student' };

    if (classId) {
        query.class_id = classId;
    }

    // If teacher, only export from their classes
    if (req.user.role === 'teacher') {
        const teacherClasses = await Class.find({ teacher_id: req.user._id }).select('_id');
        const classIds = teacherClasses.map(c => c._id);

        if (!classId) {
            query.class_id = { $in: classIds };
        }
    }

    // Get students
    const students = await User.find(query)
        .select('-password')
        .populate('class_id', 'class_name grade_level')
        .sort({ 'class_id.class_name': 1, name: 1 });

    if (students.length === 0) {
        return errorResponse(res, 404, 'Tidak ada data untuk di-export', 'NO_DATA');
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Siswa');

    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'NIS', key: 'nis', width: 15 },
        { header: 'Nama Siswa', key: 'name', width: 30 },
        { header: 'Kelas', key: 'class', width: 15 },
        { header: 'Tingkat', key: 'grade', width: 10 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Tanggal Daftar', key: 'createdAt', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    students.forEach((student, index) => {
        worksheet.addRow({
            no: index + 1,
            nis: student.nis || '-',
            name: student.name,
            class: student.class_id?.class_name || '-',
            grade: student.class_id?.grade_level || '-',
            email: student.email || '-',
            createdAt: student.created_at ? student.created_at.toLocaleDateString('id-ID') : '-'
        });
    });

    worksheet.autoFilter = 'A1:G1';

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `data_siswa_${dateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
});

/**
 * @desc    Export class activity report
 * @route   GET /api/export/class-report/:classId
 * @access  Teacher, Admin
 */
const exportClassReport = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Get class
    const classData = await Class.findById(classId).populate('teacher_id', 'name');
    if (!classData) {
        return errorResponse(res, 404, 'Kelas tidak ditemukan', 'CLASS_NOT_FOUND');
    }

    // Get students in class
    const students = await User.find({ class_id: classId, role: 'student' })
        .select('name nis')
        .sort({ name: 1 });

    if (students.length === 0) {
        return errorResponse(res, 404, 'Tidak ada siswa di kelas ini', 'NO_STUDENTS');
    }

    // Build date query
    const dateQuery = {};
    if (startDate || endDate) {
        const { start, end } = getDateRange(startDate, endDate);
        dateQuery.report_date = { $gte: start, $lte: end };
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Laporan ${classData.class_name}`);

    // Title
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `Laporan Aktivitas Kelas ${classData.class_name}`;
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = `Wali Kelas: ${classData.teacher_id?.name || '-'}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Headers
    const headerRow = worksheet.getRow(4);
    headerRow.values = ['No', 'NIS', 'Nama Siswa', 'Push-up', 'Sit-up', 'Back-up', 'Total', 'Verified'];
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    worksheet.columns = [
        { key: 'no', width: 5 },
        { key: 'nis', width: 15 },
        { key: 'name', width: 25 },
        { key: 'pushup', width: 12 },
        { key: 'situp', width: 12 },
        { key: 'backup', width: 12 },
        { key: 'total', width: 10 },
        { key: 'verified', width: 12 }
    ];

    // Add student data with activity summary
    let rowNum = 5;
    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        // Get activity stats for this student
        const activities = await ActivityReport.find({
            student_id: student._id,
            ...dateQuery
        });

        const pushupTotal = activities
            .filter(a => a.activity_type === 'pushup')
            .reduce((sum, a) => sum + a.count, 0);
        const situpTotal = activities
            .filter(a => a.activity_type === 'situp')
            .reduce((sum, a) => sum + a.count, 0);
        const backupTotal = activities
            .filter(a => a.activity_type === 'backup')
            .reduce((sum, a) => sum + a.count, 0);
        const verifiedCount = activities.filter(a => a.status === 'verified').length;

        const row = worksheet.getRow(rowNum);
        row.values = [
            i + 1,
            student.nis,
            student.name,
            pushupTotal,
            situpTotal,
            backupTotal,
            pushupTotal + situpTotal + backupTotal,
            verifiedCount
        ];
        rowNum++;
    }

    // Auto filter
    worksheet.autoFilter = 'A4:H4';

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `laporan_kelas_${sanitizeFilename(classData.class_name)}_${dateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
});

module.exports = {
    exportActivities,
    exportStudents,
    exportClassReport
};
