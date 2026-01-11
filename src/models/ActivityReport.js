const mongoose = require('mongoose');

const activityReportSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID wajib diisi']
    },
    activity_type: {
        type: String,
        enum: {
            values: ['pushup', 'situp', 'backup'],
            message: 'Jenis aktivitas harus pushup, situp, atau backup'
        },
        required: [true, 'Jenis aktivitas wajib diisi']
    },
    count: {
        type: Number,
        required: [true, 'Jumlah aktivitas wajib diisi'],
        min: [1, 'Jumlah aktivitas minimal 1']
    },
    image_url: {
        type: String,
        required: [true, 'URL gambar bukti wajib diisi']
    },
    image_proof_id: {
        type: String,
        required: [true, 'ID gambar bukti wajib diisi']
    },
    report_date: {
        type: Date,
        required: [true, 'Tanggal laporan wajib diisi'],
        default: function () {
            // Set ke awal hari ini (00:00:00)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'verified', 'rejected'],
            message: 'Status harus pending, verified, atau rejected'
        },
        default: 'pending'
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verified_at: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        maxlength: [500, 'Catatan maksimal 500 karakter'],
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Compound index untuk mencegah duplikasi laporan per hari per jenis aktivitas
activityReportSchema.index(
    { student_id: 1, report_date: 1, activity_type: 1 },
    { unique: true }
);

// Other indexes
activityReportSchema.index({ status: 1 });
activityReportSchema.index({ report_date: 1 });
activityReportSchema.index({ verified_by: 1 });

// Virtual untuk populate student
activityReportSchema.virtual('student', {
    ref: 'User',
    localField: 'student_id',
    foreignField: '_id',
    justOne: true
});

// Virtual untuk populate verifier
activityReportSchema.virtual('verifier', {
    ref: 'User',
    localField: 'verified_by',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
activityReportSchema.set('toJSON', { virtuals: true });
activityReportSchema.set('toObject', { virtuals: true });

// Static method untuk cek apakah sudah ada laporan hari ini
activityReportSchema.statics.checkDuplicateReport = async function (studentId, activityType, reportDate) {
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingReport = await this.findOne({
        student_id: studentId,
        activity_type: activityType,
        report_date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    return existingReport;
};

const ActivityReport = mongoose.model('ActivityReport', activityReportSchema);

module.exports = ActivityReport;
