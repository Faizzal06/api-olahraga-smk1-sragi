const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: [true, 'Nama kelas wajib diisi'],
        trim: true,
        maxlength: [50, 'Nama kelas maksimal 50 karakter']
    },
    grade_level: {
        type: String,
        required: [true, 'Tingkat kelas wajib diisi'],
        trim: true
    },
    school_year: {
        type: String,
        required: [true, 'Tahun ajaran wajib diisi'],
        trim: true,
        validate: {
            validator: function (v) {
                // Format: 2023/2024
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: 'Format tahun ajaran harus YYYY/YYYY (contoh: 2023/2024)'
        }
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index
classSchema.index({ teacher_id: 1 });
classSchema.index({ grade_level: 1, school_year: 1 });

// Virtual untuk populate students
classSchema.virtual('students', {
    ref: 'User',
    localField: '_id',
    foreignField: 'class_id'
});

// Virtual untuk populate teacher
classSchema.virtual('teacher', {
    ref: 'User',
    localField: 'teacher_id',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
