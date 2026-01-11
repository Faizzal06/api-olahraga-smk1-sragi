const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama wajib diisi'],
        trim: true,
        maxlength: [100, 'Nama maksimal 100 karakter']
    },
    nis: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        trim: true,
        validate: {
            validator: function (v) {
                // NIS hanya wajib untuk siswa
                if (this.role === 'student') {
                    return v && v.length >= 5;
                }
                return true;
            },
            message: 'NIS minimal 5 digit untuk siswa'
        }
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                // Email wajib untuk guru dan admin
                if (this.role === 'teacher' || this.role === 'admin') {
                    return v && /^\S+@\S+\.\S+$/.test(v);
                }
                return true;
            },
            message: 'Email tidak valid'
        }
    },
    password: {
        type: String,
        required: [true, 'Password wajib diisi'],
        minlength: [6, 'Password minimal 6 karakter']
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'teacher', 'admin'],
            message: 'Role harus student, teacher, atau admin'
        },
        required: [true, 'Role wajib diisi']
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: null
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index untuk pencarian cepat
userSchema.index({ role: 1 });
userSchema.index({ class_id: 1 });

// Hash password sebelum save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method untuk compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method untuk mendapatkan data publik (tanpa password)
userSchema.methods.toPublicJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Virtual untuk populate activities
userSchema.virtual('activities', {
    ref: 'ActivityReport',
    localField: '_id',
    foreignField: 'student_id'
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
