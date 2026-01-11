# 🏃 Tracking Activity Backend API

Backend REST API untuk Sistem Tracking Aktivitas Olahraga Sekolah menggunakan Node.js, Express.js, dan MongoDB.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#️-teknologi)
- [Quick Start](#-quick-start)
- [Struktur Folder](#-struktur-folder)
- [Login Credentials](#-login-credentials)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Classes](#classes)
  - [Activities](#activities)
  - [Announcements](#announcements)
  - [Dashboard](#dashboard)
  - [Export](#export)
- [Error Handling](#-error-handling)
- [License](#-license)

---

## 🎯 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Autentikasi** | Login dengan NIS (siswa) atau Email (guru/admin) |
| **Manajemen User** | CRUD untuk siswa, guru, dan admin |
| **Manajemen Kelas** | CRUD untuk kelas dengan wali kelas |
| **Laporan Aktivitas** | Submit dan verifikasi aktivitas (pushup, situp, backup) |
| **Pengumuman** | Broadcast ke kelas tertentu atau semua kelas |
| **Dashboard** | Statistik khusus untuk setiap role |
| **Export Data** | Export ke Excel |

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| Validation | express-validator |
| Export | ExcelJS |
| Security | Helmet, CORS, Rate Limiting |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tracking-activity
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Seed Database (Optional)

```bash
npm run seed
```

### 4. Jalankan Server

```bash
# Development
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:5000`

---

## 📁 Struktur Folder

```
tracking-activity/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Login, register, profile
│   │   ├── userController.js    # User CRUD
│   │   ├── classController.js   # Class CRUD
│   │   ├── activityController.js # Activity CRUD, verify
│   │   ├── announcementController.js
│   │   ├── dashboardController.js
│   │   └── exportController.js  # Excel export
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleAuth.js          # Role-based access
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validate.js          # Request validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── ActivityReport.js
│   │   ├── Announcement.js
│   │   └── AnnouncementRead.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── classRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── exportRoutes.js
│   ├── utils/
│   │   ├── helpers.js           # Response helpers
│   │   └── validators.js        # Validation rules
│   └── app.js                   # Main application
├── sample-data/
│   └── sampleData.json          # Sample data for frontend
├── seeds/
│   └── seed.js                  # Database seeder
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Login Credentials

Setelah menjalankan `npm run seed`:

| Role | Identifier | Password | Keterangan |
|------|------------|----------|------------|
| Admin | admin@sekolah.id | admin123 | Login dengan email |
| Teacher | ahmad.hidayat@sekolah.id | guru123 | Wali kelas 10 IPA 1 & 11 IPA 1 |
| Teacher | siti.rahayu@sekolah.id | guru123 | Wali kelas 10 IPA 2 |
| Student | 20250001 | siswa123 | Andi Wijaya - 10 IPA 1 |
| Student | 20250002 | siswa123 | Budi Santoso - 10 IPA 1 |
| Student | 20250003 | siswa123 | Citra Dewi - 10 IPA 2 |
| Student | 20250004 | siswa123 | Dina Putri - 11 IPA 1 |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

#### POST /api/auth/login

Login user dengan NIS (siswa) atau email (guru/admin).

**Request:**
```json
{
  "identifier": "20250001",
  "password": "siswa123"
}
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya",
      "nis": "20250001",
      "email": null,
      "role": "student",
      "class_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1",
        "grade_level": "10",
        "school_year": "2025/2026"
      },
      "avatar": null,
      "created_at": "2025-07-20T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "NIS/Email atau password salah",
  "error": "INVALID_CREDENTIALS"
}
```

---

#### POST /api/auth/register

Register user baru (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Eko Prasetyo",
  "nis": "20250005",
  "password": "siswa123",
  "role": "student",
  "class_id": "65f1a2b3c4d5e6f7a8b9c001"
}
```

**Response Sukses (201):**
```json
{
  "success": true,
  "message": "User berhasil didaftarkan",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c205",
      "name": "Eko Prasetyo",
      "nis": "20250005",
      "role": "student",
      "class_id": "65f1a2b3c4d5e6f7a8b9c001"
    }
  }
}
```

---

#### GET /api/auth/profile

Get profil user yang sedang login.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diambil",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya",
      "nis": "20250001",
      "role": "student",
      "class_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1",
        "grade_level": "10",
        "school_year": "2025/2026"
      }
    }
  }
}
```

---

#### PUT /api/auth/change-password

Ganti password user.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currentPassword": "siswa123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

### Users

#### GET /api/users

Get semua users (Admin/Teacher).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int): Halaman (default: 1)
- `limit` (int): Jumlah per halaman (default: 20)
- `role` (string): Filter by role (student/teacher/admin)
- `class_id` (string): Filter by class
- `search` (string): Cari berdasarkan nama/NIS/email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya",
      "nis": "20250001",
      "role": "student",
      "class_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 4,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### GET /api/users/:id

Get user by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "User berhasil diambil",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya",
      "nis": "20250001",
      "role": "student",
      "class_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1",
        "grade_level": "10"
      }
    }
  }
}
```

---

### Classes

#### GET /api/classes

Get semua kelas.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c001",
      "class_name": "10 IPA 1",
      "grade_level": "10",
      "school_year": "2025/2026",
      "teacher_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat",
        "email": "ahmad.hidayat@sekolah.id"
      },
      "student_count": 2
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 20
  }
}
```

---

#### POST /api/classes

Buat kelas baru (Admin only).

**Request:**
```json
{
  "class_name": "10 IPA 3",
  "grade_level": "10",
  "school_year": "2025/2026",
  "teacher_id": "65f1a2b3c4d5e6f7a8b9c102"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Kelas berhasil dibuat",
  "data": {
    "class": {
      "_id": "65f1a2b3c4d5e6f7a8b9c004",
      "class_name": "10 IPA 3",
      "grade_level": "10",
      "school_year": "2025/2026",
      "teacher_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c102",
        "name": "Bu Siti Rahayu"
      }
    }
  }
}
```

---

### Activities

#### POST /api/activities

Submit laporan aktivitas (Student only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "activity_type": "pushup",
  "count": 50,
  "image_url": "https://i.ibb.co/example/proof.jpg",
  "image_proof_id": "abc123xyz"
}
```

**Response Sukses (201):**
```json
{
  "success": true,
  "message": "Laporan aktivitas berhasil dibuat",
  "data": {
    "activity": {
      "_id": "65f1a2b3c4d5e6f7a8b9c311",
      "student_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "nis": "20250001"
      },
      "activity_type": "pushup",
      "count": 50,
      "image_url": "https://i.ibb.co/example/proof.jpg",
      "image_proof_id": "abc123xyz",
      "report_date": "2026-01-10T00:00:00.000Z",
      "status": "pending",
      "verified_by": null,
      "verified_at": null,
      "notes": null,
      "created_at": "2026-01-10T07:15:00.000Z"
    }
  }
}
```

**Response Error - Duplikat (400):**
```json
{
  "success": false,
  "message": "Anda sudah melaporkan aktivitas pushup untuk tanggal ini",
  "error": "DUPLICATE_REPORT"
}
```

---

#### GET /api/activities

Get semua aktivitas dengan filter.

**Query Parameters:**
- `page` (int): Halaman
- `limit` (int): Jumlah per halaman
- `status` (string): pending/verified/rejected
- `activity_type` (string): pushup/situp/backup
- `class_id` (string): Filter by class
- `student_id` (string): Filter by student
- `startDate` (date): Tanggal mulai (ISO format)
- `endDate` (date): Tanggal selesai (ISO format)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c301",
      "student_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "nis": "20250001",
        "class_id": {
          "_id": "65f1a2b3c4d5e6f7a8b9c001",
          "class_name": "10 IPA 1"
        }
      },
      "activity_type": "pushup",
      "count": 50,
      "image_url": "https://i.ibb.co/sample/pushup-proof-1.jpg",
      "report_date": "2026-01-10T00:00:00.000Z",
      "status": "verified",
      "verified_by": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      },
      "verified_at": "2026-01-10T09:30:00.000Z",
      "notes": "Bagus, terus pertahankan!",
      "created_at": "2026-01-10T07:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 10,
    "itemsPerPage": 20
  }
}
```

---

#### GET /api/activities/pending

Get aktivitas pending untuk verifikasi (Teacher/Admin).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c302",
      "student_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "nis": "20250001",
        "class_id": {
          "_id": "65f1a2b3c4d5e6f7a8b9c001",
          "class_name": "10 IPA 1"
        }
      },
      "activity_type": "situp",
      "count": 40,
      "image_url": "https://i.ibb.co/sample/situp-proof-1.jpg",
      "status": "pending",
      "created_at": "2026-01-10T07:20:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3
  }
}
```

---

#### PUT /api/activities/:id/verify

Verifikasi aktivitas (Teacher only).

**Request:**
```json
{
  "status": "verified",
  "notes": "Bagus, terus pertahankan!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Aktivitas berhasil di-verified",
  "data": {
    "activity": {
      "_id": "65f1a2b3c4d5e6f7a8b9c302",
      "student_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "class_id": {
          "class_name": "10 IPA 1"
        }
      },
      "activity_type": "situp",
      "count": 40,
      "status": "verified",
      "verified_by": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      },
      "verified_at": "2026-01-10T10:00:00.000Z",
      "notes": "Bagus, terus pertahankan!"
    }
  }
}
```

---

### Announcements

#### POST /api/announcements

Buat pengumuman (Teacher only).

**Request - Untuk Kelas Tertentu:**
```json
{
  "title": "Jadwal Pengumpulan Laporan",
  "content": "Mohon untuk rutin mengumpulkan laporan aktivitas setiap hari sebelum pukul 20:00 WIB.",
  "target_type": "class",
  "target_class_id": "65f1a2b3c4d5e6f7a8b9c001"
}
```

**Request - Untuk Semua Kelas:**
```json
{
  "title": "Pengumuman Lomba",
  "content": "Akan diadakan lomba kebugaran antar kelas.",
  "target_type": "all",
  "attachment_url": "https://i.ibb.co/example/poster.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pengumuman berhasil dibuat",
  "data": {
    "announcement": {
      "_id": "65f1a2b3c4d5e6f7a8b9c406",
      "title": "Jadwal Pengumpulan Laporan",
      "content": "Mohon untuk rutin mengumpulkan laporan aktivitas setiap hari sebelum pukul 20:00 WIB.",
      "author_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      },
      "target_type": "class",
      "target_class_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1"
      },
      "is_published": true,
      "created_at": "2026-01-10T08:00:00.000Z"
    }
  }
}
```

---

#### GET /api/announcements/for-student

Get pengumuman untuk siswa yang login.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c401",
      "title": "Jadwal Pengumpulan Laporan Aktivitas Mingguan",
      "content": "Kepada seluruh siswa kelas 10 IPA 1...",
      "author_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      },
      "target_type": "class",
      "target_class_id": {
        "class_name": "10 IPA 1"
      },
      "is_published": true,
      "created_at": "2026-01-08T08:00:00.000Z",
      "is_read": true,
      "read_at": "2026-01-08T08:30:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c402",
      "title": "Pengumuman: Lomba Kebugaran Antar Kelas",
      "content": "Dalam rangka memperingati Hari Olahraga Nasional...",
      "author_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      },
      "target_type": "all",
      "attachment_url": "https://i.ibb.co/sample/poster-lomba.jpg",
      "is_published": true,
      "created_at": "2026-01-05T10:00:00.000Z",
      "is_read": false,
      "read_at": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5
  }
}
```

---

### Dashboard

#### GET /api/dashboard/student

Dashboard untuk siswa.

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard student berhasil diambil",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya",
      "nis": "20250001",
      "avatar": null,
      "class_name": "10 IPA 1"
    },
    "todayActivities": [
      {
        "activity_type": "pushup",
        "count": 50,
        "status": "verified"
      },
      {
        "activity_type": "situp",
        "count": 40,
        "status": "pending"
      }
    ],
    "weeklyStats": {
      "totalActivities": 8,
      "totalPushup": 100,
      "totalSitup": 80,
      "totalBackup": 60,
      "verifiedCount": 6,
      "pendingCount": 2,
      "rejectedCount": 0
    },
    "recentAnnouncements": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c401",
        "title": "Jadwal Pengumpulan Laporan",
        "author_name": "Pak Ahmad Hidayat",
        "created_at": "2026-01-08T08:00:00.000Z",
        "is_read": true
      }
    ],
    "unreadAnnouncementsCount": 2
  }
}
```

---

#### GET /api/dashboard/teacher

Dashboard untuk guru.

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard teacher berhasil diambil",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c101",
      "name": "Pak Ahmad Hidayat"
    },
    "classes": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c001",
        "class_name": "10 IPA 1",
        "grade_level": "10",
        "student_count": 2
      },
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c003",
        "class_name": "11 IPA 1",
        "grade_level": "11",
        "student_count": 1
      }
    ],
    "totalStudents": 3,
    "pendingReports": {
      "total": 4,
      "reports": [
        {
          "_id": "65f1a2b3c4d5e6f7a8b9c302",
          "student_name": "Andi Wijaya",
          "student_nis": "20250001",
          "class_name": "10 IPA 1",
          "activity_type": "situp",
          "count": 40,
          "image_url": "https://i.ibb.co/sample/situp-proof-1.jpg",
          "created_at": "2026-01-10T07:20:00.000Z"
        }
      ]
    },
    "todayStats": {
      "totalReports": 6,
      "verified": 2,
      "pending": 3,
      "rejected": 1
    },
    "weeklyStats": {
      "totalActivities": 25,
      "averagePerStudent": 8.3
    }
  }
}
```

---

#### GET /api/dashboard/admin

Dashboard untuk admin.

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard admin berhasil diambil",
  "data": {
    "overview": {
      "totalStudents": 4,
      "totalTeachers": 2,
      "totalClasses": 3,
      "totalActivities": 10
    },
    "activityStats": {
      "today": 6,
      "thisWeek": 10,
      "thisMonth": 10
    },
    "statusDistribution": {
      "pending": 3,
      "verified": 6,
      "rejected": 1
    },
    "topActiveClasses": [
      {
        "class_name": "10 IPA 1",
        "total_activities": 6
      },
      {
        "class_name": "11 IPA 1",
        "total_activities": 2
      }
    ],
    "recentActivities": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c301",
        "student_name": "Andi Wijaya",
        "class_name": "10 IPA 1",
        "activity_type": "pushup",
        "count": 50,
        "status": "verified",
        "created_at": "2026-01-10T07:15:00.000Z"
      }
    ]
  }
}
```

---

### Export

#### GET /api/export/activities

Export data aktivitas ke Excel.

**Query Parameters:**
- `startDate`: Tanggal mulai
- `endDate`: Tanggal selesai
- `classId`: Filter by class
- `status`: Filter by status
- `activity_type`: Filter by activity type

**Response:** File Excel (.xlsx)

---

#### GET /api/export/students

Export data siswa ke Excel.

**Query Parameters:**
- `classId`: Filter by class

**Response:** File Excel (.xlsx)

---

#### GET /api/export/class-report/:classId

Export laporan aktivitas per kelas ke Excel.

**Query Parameters:**
- `startDate`: Tanggal mulai
- `endDate`: Tanggal selesai

**Response:** File Excel (.xlsx) dengan summary per siswa

---

## ❌ Error Handling

### Format Response Error

```json
{
  "success": false,
  "message": "Pesan error yang dibaca manusia",
  "error": "ERROR_CODE"
}
```

### Error Codes

| Code | HTTP Status | Deskripsi |
|------|-------------|-----------|
| `INVALID_CREDENTIALS` | 401 | NIS/Email atau password salah |
| `NO_TOKEN` | 401 | Token tidak ditemukan |
| `INVALID_TOKEN` | 401 | Token tidak valid |
| `TOKEN_EXPIRED` | 401 | Token sudah kadaluarsa |
| `FORBIDDEN` | 403 | Tidak punya akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Validasi gagal |
| `DUPLICATE_REPORT` | 400 | Sudah submit aktivitas untuk hari ini |
| `DUPLICATE_NIS` | 400 | NIS sudah digunakan |
| `DUPLICATE_EMAIL` | 400 | Email sudah digunakan |
| `RATE_LIMIT_EXCEEDED` | 429 | Terlalu banyak request |

### Contoh Response Validation Error

```json
{
  "success": false,
  "message": "Validasi gagal",
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "count",
      "message": "Jumlah aktivitas minimal 1"
    },
    {
      "field": "image_url",
      "message": "URL gambar bukti wajib diisi"
    }
  ]
}
```

---

## 📄 License

MIT
