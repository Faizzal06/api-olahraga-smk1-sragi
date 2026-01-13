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
| File Upload | Multer + Cloudinary |
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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
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
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary configuration
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
│   │   ├── fileUpload.js        # Multer file upload
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
│   │   ├── validators.js        # Validation rules
│   │   └── uploadService.js     # Cloudinary upload service
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

---

### Authentication

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/register` | Admin | Register user baru |
| GET | `/api/auth/profile` | Authenticated | Get profil user |
| PUT | `/api/auth/profile` | Authenticated | Update profil user |
| PUT | `/api/auth/change-password` | Authenticated | Ganti password |

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

#### PUT /api/auth/profile

Update profil user yang sedang login.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Andi Wijaya Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya Updated",
      "avatar": "https://example.com/avatar.jpg"
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

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| GET | `/api/users` | Admin, Teacher | Get semua users |
| GET | `/api/users/:id` | Admin, Teacher | Get user by ID |
| POST | `/api/users` | Admin | Create user baru |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| PUT | `/api/users/:id/reset-password` | Admin | Reset password user |

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

**Headers:** `Authorization: Bearer <token>`

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

#### POST /api/users

Create user baru (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request (Student):**
```json
{
  "name": "Eko Prasetyo",
  "nis": "20250005",
  "password": "siswa123",
  "role": "student",
  "class_id": "65f1a2b3c4d5e6f7a8b9c001"
}
```

**Request (Teacher):**
```json
{
  "name": "Budi Setiawan",
  "email": "budi.setiawan@sekolah.id",
  "password": "guru123",
  "role": "teacher"
}
```

**Response Sukses (201):**
```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c206",
      "name": "Eko Prasetyo",
      "nis": "20250005",
      "role": "student"
    }
  }
}
```

---

#### PUT /api/users/:id

Update user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Andi Wijaya Updated",
  "class_id": "65f1a2b3c4d5e6f7a8b9c002"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User berhasil diperbarui",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c201",
      "name": "Andi Wijaya Updated",
      "class_id": "65f1a2b3c4d5e6f7a8b9c002"
    }
  }
}
```

---

#### DELETE /api/users/:id

Delete user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

---

#### PUT /api/users/:id/reset-password

Reset password user ke default (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "newPassword": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

---

### Classes

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| GET | `/api/classes` | Authenticated | Get semua kelas |
| GET | `/api/classes/:id` | Authenticated | Get kelas by ID |
| GET | `/api/classes/:id/students` | Admin, Teacher | Get siswa dalam kelas |
| POST | `/api/classes` | Admin | Buat kelas baru |
| PUT | `/api/classes/:id` | Admin | Update kelas |
| DELETE | `/api/classes/:id` | Admin | Delete kelas |

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

#### GET /api/classes/:id

Get kelas by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Kelas berhasil diambil",
  "data": {
    "class": {
      "_id": "65f1a2b3c4d5e6f7a8b9c001",
      "class_name": "10 IPA 1",
      "grade_level": "10",
      "school_year": "2025/2026",
      "teacher_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c101",
        "name": "Pak Ahmad Hidayat"
      }
    }
  }
}
```

---

#### GET /api/classes/:id/students

Get daftar siswa dalam kelas.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Siswa berhasil diambil",
  "data": {
    "class": {
      "_id": "65f1a2b3c4d5e6f7a8b9c001",
      "class_name": "10 IPA 1"
    },
    "students": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "nis": "20250001"
      },
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c202",
        "name": "Budi Santoso",
        "nis": "20250002"
      }
    ]
  }
}
```

---

#### POST /api/classes

Buat kelas baru (Admin only).

**Headers:** `Authorization: Bearer <token>`

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

#### PUT /api/classes/:id

Update kelas (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "class_name": "10 IPA 3 Updated",
  "teacher_id": "65f1a2b3c4d5e6f7a8b9c101"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Kelas berhasil diperbarui",
  "data": {
    "class": {
      "_id": "65f1a2b3c4d5e6f7a8b9c004",
      "class_name": "10 IPA 3 Updated",
      "teacher_id": "65f1a2b3c4d5e6f7a8b9c101"
    }
  }
}
```

---

#### DELETE /api/classes/:id

Delete kelas (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Kelas berhasil dihapus"
}
```

---

### Activities

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| POST | `/api/activities` | Student | Submit laporan aktivitas |
| GET | `/api/activities` | Authenticated | Get semua aktivitas |
| GET | `/api/activities/pending` | Teacher, Admin | Get aktivitas pending |
| GET | `/api/activities/student/:studentId` | Authenticated | Get aktivitas per siswa |
| GET | `/api/activities/class/:classId` | Teacher, Admin | Get aktivitas per kelas |
| GET | `/api/activities/:id` | Authenticated | Get aktivitas by ID |
| PUT | `/api/activities/:id/verify` | Teacher | Verifikasi aktivitas |
| DELETE | `/api/activities/:id` | Student (own), Admin | Hapus aktivitas |

#### POST /api/activities

Submit laporan aktivitas dengan upload gambar bukti (Student only).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request (Form-Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activity_type` | string | ✅ | Jenis aktivitas: `pushup`, `situp`, atau `backup` |
| `count` | number | ✅ | Jumlah aktivitas (minimal 1) |
| `image` | file | ✅ | File gambar bukti (JPG, JPEG, PNG, WEBP - max 5MB) |
| `report_date` | string | ❌ | Tanggal laporan (ISO format, default: hari ini) |

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
      "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/activity-proofs/abc123.jpg",
      "image_proof_id": "activity-proofs/abc123",
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

---

#### GET /api/activities

Get semua aktivitas dengan filter.

**Headers:** `Authorization: Bearer <token>`

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

**Headers:** `Authorization: Bearer <token>`

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

#### GET /api/activities/student/:studentId

Get aktivitas berdasarkan student ID.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int): Halaman
- `limit` (int): Jumlah per halaman
- `status` (string): Filter by status
- `activity_type` (string): Filter by activity type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c301",
      "activity_type": "pushup",
      "count": 50,
      "status": "verified",
      "report_date": "2026-01-10T00:00:00.000Z"
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

#### GET /api/activities/class/:classId

Get aktivitas berdasarkan class ID (Teacher/Admin).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int): Halaman
- `limit` (int): Jumlah per halaman
- `status` (string): Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c301",
      "student_id": {
        "name": "Andi Wijaya",
        "nis": "20250001"
      },
      "activity_type": "pushup",
      "count": 50,
      "status": "verified"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 6
  }
}
```

---

#### GET /api/activities/:id

Get aktivitas by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Aktivitas berhasil diambil",
  "data": {
    "activity": {
      "_id": "65f1a2b3c4d5e6f7a8b9c301",
      "student_id": {
        "_id": "65f1a2b3c4d5e6f7a8b9c201",
        "name": "Andi Wijaya",
        "nis": "20250001"
      },
      "activity_type": "pushup",
      "count": 50,
      "image_url": "https://i.ibb.co/sample/pushup-proof-1.jpg",
      "status": "verified",
      "verified_by": {
        "name": "Pak Ahmad Hidayat"
      },
      "notes": "Bagus!"
    }
  }
}
```

---

#### PUT /api/activities/:id/verify

Verifikasi aktivitas (Teacher only).

**Headers:** `Authorization: Bearer <token>`

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

#### DELETE /api/activities/:id

Hapus aktivitas. Student hanya bisa hapus aktivitas sendiri yang masih pending. Admin bisa hapus semua.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Aktivitas berhasil dihapus"
}
```

---

### Announcements

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| POST | `/api/announcements` | Teacher | Buat pengumuman |
| GET | `/api/announcements` | Authenticated | Get semua pengumuman |
| GET | `/api/announcements/for-student` | Student | Get pengumuman untuk siswa |
| GET | `/api/announcements/:id` | Authenticated | Get pengumuman by ID |
| POST | `/api/announcements/:id/read` | Authenticated | Tandai sudah dibaca |
| PUT | `/api/announcements/:id` | Teacher (author) | Update pengumuman |
| DELETE | `/api/announcements/:id` | Teacher (author), Admin | Hapus pengumuman |

#### POST /api/announcements

Buat pengumuman (Teacher only).

**Headers:** `Authorization: Bearer <token>`

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

#### GET /api/announcements

Get semua pengumuman.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int): Halaman
- `limit` (int): Jumlah per halaman

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c401",
      "title": "Jadwal Pengumpulan Laporan",
      "content": "Mohon untuk rutin mengumpulkan...",
      "author_id": {
        "name": "Pak Ahmad Hidayat"
      },
      "target_type": "class",
      "target_class_id": {
        "class_name": "10 IPA 1"
      },
      "is_published": true,
      "created_at": "2026-01-08T08:00:00.000Z"
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

#### GET /api/announcements/for-student

Get pengumuman untuk siswa yang login.

**Headers:** `Authorization: Bearer <token>`

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

#### GET /api/announcements/:id

Get pengumuman by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Pengumuman berhasil diambil",
  "data": {
    "announcement": {
      "_id": "65f1a2b3c4d5e6f7a8b9c401",
      "title": "Jadwal Pengumpulan Laporan",
      "content": "Mohon untuk rutin mengumpulkan laporan aktivitas...",
      "author_id": {
        "name": "Pak Ahmad Hidayat"
      },
      "target_type": "class",
      "target_class_id": {
        "class_name": "10 IPA 1"
      },
      "attachment_url": null,
      "is_published": true,
      "created_at": "2026-01-08T08:00:00.000Z"
    }
  }
}
```

---

#### POST /api/announcements/:id/read

Tandai pengumuman sudah dibaca.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Pengumuman ditandai sudah dibaca"
}
```

---

#### PUT /api/announcements/:id

Update pengumuman (Teacher author only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Jadwal Pengumpulan Laporan (Updated)",
  "content": "Pengumpulan laporan diperpanjang sampai pukul 21:00 WIB."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pengumuman berhasil diperbarui",
  "data": {
    "announcement": {
      "_id": "65f1a2b3c4d5e6f7a8b9c401",
      "title": "Jadwal Pengumpulan Laporan (Updated)",
      "content": "Pengumpulan laporan diperpanjang sampai pukul 21:00 WIB."
    }
  }
}
```

---

#### DELETE /api/announcements/:id

Hapus pengumuman (Teacher author atau Admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Pengumuman berhasil dihapus"
}
```

---

### Dashboard

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| GET | `/api/dashboard/student` | Student | Dashboard siswa |
| GET | `/api/dashboard/teacher` | Teacher | Dashboard guru |
| GET | `/api/dashboard/admin` | Admin | Dashboard admin |

#### GET /api/dashboard/student

Dashboard untuk siswa.

**Headers:** `Authorization: Bearer <token>`

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

**Headers:** `Authorization: Bearer <token>`

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

**Headers:** `Authorization: Bearer <token>`

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

| Method | Endpoint | Access | Deskripsi |
|--------|----------|--------|-----------|
| GET | `/api/export/activities` | Teacher, Admin | Export aktivitas ke Excel |
| GET | `/api/export/students` | Teacher, Admin | Export data siswa ke Excel |
| GET | `/api/export/class-report/:classId` | Teacher, Admin | Export laporan kelas ke Excel |

#### GET /api/export/activities

Export data aktivitas ke Excel.

**Headers:** `Authorization: Bearer <token>`

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

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `classId`: Filter by class

**Response:** File Excel (.xlsx)

---

#### GET /api/export/class-report/:classId

Export laporan aktivitas per kelas ke Excel.

**Headers:** `Authorization: Bearer <token>`

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
