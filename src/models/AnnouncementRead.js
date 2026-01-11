const mongoose = require('mongoose');

const announcementReadSchema = new mongoose.Schema({
    announcement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement',
        required: [true, 'Announcement ID wajib diisi']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID wajib diisi']
    },
    read_at: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index untuk mencegah duplikasi read
announcementReadSchema.index(
    { announcement_id: 1, user_id: 1 },
    { unique: true }
);

// Index untuk query berdasarkan user
announcementReadSchema.index({ user_id: 1 });

const AnnouncementRead = mongoose.model('AnnouncementRead', announcementReadSchema);

module.exports = AnnouncementRead;
