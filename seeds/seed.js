require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const ActivityReport = require('../src/models/ActivityReport');
const Announcement = require('../src/models/Announcement');
const AnnouncementRead = require('../src/models/AnnouncementRead');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracking-activity';

// Helper untuk hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed data
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Class.deleteMany({});
        await ActivityReport.deleteMany({});
        await Announcement.deleteMany({});
        await AnnouncementRead.deleteMany({});
        console.log('✅ Existing data cleared');

        // Create Classes
        console.log('📚 Creating classes...');
        const classes = await Class.insertMany([
            {
                class_name: '10 IPA 1',
                grade_level: '10',
                school_year: '2025/2026'
            },
            {
                class_name: '10 IPA 2',
                grade_level: '10',
                school_year: '2025/2026'
            },
            {
                class_name: '11 IPA 1',
                grade_level: '11',
                school_year: '2025/2026'
            }
        ]);
        console.log(`✅ Created ${classes.length} classes`);

        // Create Admin
        console.log('👤 Creating admin...');
        const adminPassword = await hashPassword('admin123');
        const admin = await User.create({
            name: 'Administrator',
            email: 'admin@sekolah.id',
            password: adminPassword,
            role: 'admin'
        });
        console.log('✅ Admin created: admin@sekolah.id / admin123');

        // Create Teachers
        console.log('👨‍🏫 Creating teachers...');
        const teacherPassword = await hashPassword('guru123');
        const teachers = await User.insertMany([
            {
                name: 'Pak Ahmad Hidayat',
                email: 'ahmad.hidayat@sekolah.id',
                password: teacherPassword,
                role: 'teacher'
            },
            {
                name: 'Bu Siti Rahayu',
                email: 'siti.rahayu@sekolah.id',
                password: teacherPassword,
                role: 'teacher'
            }
        ]);
        console.log(`✅ Created ${teachers.length} teachers: guru123`);

        // Update classes with teacher_id
        await Class.findByIdAndUpdate(classes[0]._id, { teacher_id: teachers[0]._id });
        await Class.findByIdAndUpdate(classes[1]._id, { teacher_id: teachers[1]._id });
        await Class.findByIdAndUpdate(classes[2]._id, { teacher_id: teachers[0]._id });
        console.log('✅ Teachers assigned to classes');

        // Create Students
        console.log('👨‍🎓 Creating students...');
        const studentPassword = await hashPassword('siswa123');
        const students = await User.insertMany([
            {
                name: 'Andi Wijaya',
                nis: '20250001',
                password: studentPassword,
                role: 'student',
                class_id: classes[0]._id
            },
            {
                name: 'Budi Santoso',
                nis: '20250002',
                password: studentPassword,
                role: 'student',
                class_id: classes[0]._id
            },
            {
                name: 'Citra Dewi',
                nis: '20250003',
                password: studentPassword,
                role: 'student',
                class_id: classes[1]._id
            },
            {
                name: 'Dina Putri',
                nis: '20250004',
                password: studentPassword,
                role: 'student',
                class_id: classes[2]._id
            }
        ]);
        console.log(`✅ Created ${students.length} students: siswa123`);

        // Create Activity Reports
        console.log('📊 Creating activity reports...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const activities = await ActivityReport.insertMany([
            // Andi's activities
            {
                student_id: students[0]._id,
                activity_type: 'pushup',
                count: 50,
                image_url: 'https://i.ibb.co/sample/pushup-proof-1.jpg',
                image_proof_id: 'abc123xyz001',
                report_date: today,
                status: 'verified',
                verified_by: teachers[0]._id,
                verified_at: new Date(),
                notes: 'Bagus, terus pertahankan!'
            },
            {
                student_id: students[0]._id,
                activity_type: 'situp',
                count: 40,
                image_url: 'https://i.ibb.co/sample/situp-proof-1.jpg',
                image_proof_id: 'abc123xyz002',
                report_date: today,
                status: 'pending'
            },
            {
                student_id: students[0]._id,
                activity_type: 'backup',
                count: 30,
                image_url: 'https://i.ibb.co/sample/backup-proof-2.jpg',
                image_proof_id: 'abc123xyz009',
                report_date: yesterday,
                status: 'verified',
                verified_by: teachers[0]._id,
                verified_at: new Date(),
                notes: 'Good job!'
            },
            // Budi's activities
            {
                student_id: students[1]._id,
                activity_type: 'pushup',
                count: 35,
                image_url: 'https://i.ibb.co/sample/pushup-proof-2.jpg',
                image_proof_id: 'abc123xyz003',
                report_date: today,
                status: 'pending'
            },
            {
                student_id: students[1]._id,
                activity_type: 'backup',
                count: 25,
                image_url: 'https://i.ibb.co/sample/backup-proof-1.jpg',
                image_proof_id: 'abc123xyz004',
                report_date: yesterday,
                status: 'verified',
                verified_by: teachers[0]._id,
                verified_at: new Date()
            },
            {
                student_id: students[1]._id,
                activity_type: 'situp',
                count: 28,
                image_url: 'https://i.ibb.co/sample/situp-proof-4.jpg',
                image_proof_id: 'abc123xyz010',
                report_date: twoDaysAgo,
                status: 'verified',
                verified_by: teachers[0]._id,
                verified_at: new Date()
            },
            // Citra's activities
            {
                student_id: students[2]._id,
                activity_type: 'pushup',
                count: 20,
                image_url: 'https://i.ibb.co/sample/pushup-proof-3.jpg',
                image_proof_id: 'abc123xyz005',
                report_date: today,
                status: 'rejected',
                verified_by: teachers[1]._id,
                verified_at: new Date(),
                notes: 'Foto tidak jelas, mohon upload ulang'
            },
            {
                student_id: students[2]._id,
                activity_type: 'situp',
                count: 30,
                image_url: 'https://i.ibb.co/sample/situp-proof-2.jpg',
                image_proof_id: 'abc123xyz006',
                report_date: yesterday,
                status: 'verified',
                verified_by: teachers[1]._id,
                verified_at: new Date(),
                notes: 'Mantap!'
            },
            // Dina's activities
            {
                student_id: students[3]._id,
                activity_type: 'pushup',
                count: 45,
                image_url: 'https://i.ibb.co/sample/pushup-proof-4.jpg',
                image_proof_id: 'abc123xyz007',
                report_date: today,
                status: 'pending'
            },
            {
                student_id: students[3]._id,
                activity_type: 'situp',
                count: 35,
                image_url: 'https://i.ibb.co/sample/situp-proof-3.jpg',
                image_proof_id: 'abc123xyz008',
                report_date: today,
                status: 'verified',
                verified_by: teachers[0]._id,
                verified_at: new Date()
            }
        ]);
        console.log(`✅ Created ${activities.length} activity reports`);

        // Create Announcements
        console.log('📢 Creating announcements...');
        const announcements = await Announcement.insertMany([
            {
                title: 'Jadwal Pengumpulan Laporan Aktivitas Mingguan',
                content: 'Kepada seluruh siswa kelas 10 IPA 1,\n\nMohon untuk rutin mengumpulkan laporan aktivitas olahraga setiap hari sebelum pukul 20:00 WIB. Laporan yang dikumpulkan setelah batas waktu akan diproses keesokan harinya.\n\nTerima kasih atas kerjasamanya.',
                author_id: teachers[0]._id,
                target_type: 'class',
                target_class_id: classes[0]._id,
                is_published: true
            },
            {
                title: 'Pengumuman: Lomba Kebugaran Antar Kelas',
                content: 'Dalam rangka memperingati Hari Olahraga Nasional, sekolah akan mengadakan Lomba Kebugaran Antar Kelas pada tanggal 15 Januari 2026.\n\nKategori lomba:\n1. Push-up terbanyak\n2. Sit-up terbanyak\n3. Back-up terbanyak\n\nSetiap kelas akan diwakili oleh 3 siswa terbaik berdasarkan data aktivitas mingguan.\n\nPersiapkan diri kalian dengan baik!',
                author_id: teachers[0]._id,
                target_type: 'all',
                attachment_url: 'https://i.ibb.co/sample/poster-lomba.jpg',
                is_published: true
            },
            {
                title: 'Reminder: Upload Bukti Aktivitas dengan Jelas',
                content: 'Perhatian untuk seluruh siswa,\n\nMohon pastikan foto bukti aktivitas yang di-upload memenuhi kriteria berikut:\n1. Foto jelas dan tidak blur\n2. Terlihat wajah dan aktivitas yang dilakukan\n3. Format file: JPG, PNG, atau JPEG\n4. Ukuran maksimal: 5MB\n\nLaporan dengan foto yang tidak jelas akan ditolak.',
                author_id: teachers[1]._id,
                target_type: 'all',
                is_published: true
            },
            {
                title: 'Selamat kepada Siswa Teraktif Minggu Ini!',
                content: 'Selamat kepada siswa-siswa yang telah menunjukkan konsistensi luar biasa dalam aktivitas olahraga minggu ini:\n\n🥇 Andi Wijaya - 10 IPA 1 (Total: 120 aktivitas)\n🥈 Dina Putri - 11 IPA 1 (Total: 115 aktivitas)\n🥉 Budi Santoso - 10 IPA 1 (Total: 88 aktivitas)\n\nPertahankan semangat kalian!',
                author_id: teachers[0]._id,
                target_type: 'all',
                is_published: true
            },
            {
                title: 'Jadwal Konsultasi Guru Olahraga',
                content: 'Untuk siswa kelas 10 IPA 2 yang membutuhkan konsultasi terkait teknik olahraga yang benar, silakan menemui Bu Siti Rahayu pada:\n\nHari: Senin - Rabu\nWaktu: 14:00 - 15:00 WIB\nTempat: Ruang Guru Olahraga\n\nKonsultasi bersifat opsional namun sangat direkomendasikan.',
                author_id: teachers[1]._id,
                target_type: 'class',
                target_class_id: classes[1]._id,
                is_published: true
            }
        ]);
        console.log(`✅ Created ${announcements.length} announcements`);

        // Create some announcement reads
        console.log('📖 Creating announcement reads...');
        await AnnouncementRead.insertMany([
            { announcement_id: announcements[0]._id, user_id: students[0]._id },
            { announcement_id: announcements[0]._id, user_id: students[1]._id },
            { announcement_id: announcements[1]._id, user_id: students[0]._id },
            { announcement_id: announcements[1]._id, user_id: students[2]._id },
            { announcement_id: announcements[2]._id, user_id: students[3]._id }
        ]);
        console.log('✅ Created announcement reads');

        // Create indexes
        console.log('🔍 Creating indexes...');

        // User indexes
        await User.collection.createIndex({ nis: 1 }, { unique: true, sparse: true });
        await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await User.collection.createIndex({ class_id: 1 });
        await User.collection.createIndex({ role: 1 });

        // ActivityReport indexes
        await ActivityReport.collection.createIndex(
            { student_id: 1, report_date: 1, activity_type: 1 },
            { unique: true }
        );
        await ActivityReport.collection.createIndex({ status: 1 });
        await ActivityReport.collection.createIndex({ report_date: 1 });
        await ActivityReport.collection.createIndex({ verified_by: 1 });

        // Announcement indexes
        await Announcement.collection.createIndex({ author_id: 1 });
        await Announcement.collection.createIndex({ target_type: 1, target_class_id: 1 });
        await Announcement.collection.createIndex({ created_at: -1 });

        // AnnouncementRead indexes
        await AnnouncementRead.collection.createIndex(
            { announcement_id: 1, user_id: 1 },
            { unique: true }
        );
        await AnnouncementRead.collection.createIndex({ user_id: 1 });

        // Class indexes
        await Class.collection.createIndex({ teacher_id: 1 });
        await Class.collection.createIndex({ grade_level: 1, school_year: 1 });

        console.log('✅ Indexes created');

        console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✅ DATABASE SEEDED SUCCESSFULLY!                             ║
║                                                                ║
║   Login Credentials:                                           ║
║   ─────────────────────────────────────────────────────────    ║
║   Admin:                                                       ║
║   • Email: admin@sekolah.id                                    ║
║   • Password: admin123                                         ║
║                                                                ║
║   Teachers:                                                    ║
║   • Email: ahmad.hidayat@sekolah.id                            ║
║   • Email: siti.rahayu@sekolah.id                              ║
║   • Password: guru123                                          ║
║                                                                ║
║   Students:                                                    ║
║   • NIS: 20250001 (Andi Wijaya - 10 IPA 1)                     ║
║   • NIS: 20250002 (Budi Santoso - 10 IPA 1)                    ║
║   • NIS: 20250003 (Citra Dewi - 10 IPA 2)                      ║
║   • NIS: 20250004 (Dina Putri - 11 IPA 1)                      ║
║   • Password: siswa123                                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
