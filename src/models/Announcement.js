const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Judul pengumuman wajib diisi'],
        trim: true,
        maxlength: [200, 'Judul maksimal 200 karakter']
    },
    content: {
        type: String,
        required: [true, 'Isi pengumuman wajib diisi']
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID wajib diisi']
    },
    target_type: {
        type: String,
        enum: {
            values: ['class', 'all'],
            message: 'Target harus class atau all'
        },
        required: [true, 'Target type wajib diisi']
    },
    target_class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: null,
        validate: {
            validator: function (v) {
                // target_class_id wajib jika target_type adalah 'class'
                if (this.target_type === 'class') {
                    return v !== null && v !== undefined;
                }
                return true;
            },
            message: 'Target class wajib diisi jika target_type adalah class'
        }
    },
    attachment_url: {
        type: String,
        default: null
    },
    is_published: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
announcementSchema.index({ author_id: 1 });
announcementSchema.index({ target_type: 1, target_class_id: 1 });
announcementSchema.index({ created_at: -1 });
announcementSchema.index({ is_published: 1 });

// Virtual untuk populate author
announcementSchema.virtual('author', {
    ref: 'User',
    localField: 'author_id',
    foreignField: '_id',
    justOne: true
});

// Virtual untuk populate target class
announcementSchema.virtual('target_class', {
    ref: 'Class',
    localField: 'target_class_id',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
announcementSchema.set('toJSON', { virtuals: true });
announcementSchema.set('toObject', { virtuals: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
