# Sistem Absensi Digital Peserta Pelatihan Pekan Vokasi BPVP Bantaeng

## Overview
Sistem Absensi Digital berbasis web untuk mengelola absensi peserta pelatihan di Pekan Vokasi BPVP Bantaeng. Sistem ini dibangun menggunakan Node.js, Express, dan SQLite dengan fitur lengkap untuk form absensi publik dan dashboard admin.

## Fitur Utama

### Form Absensi Publik
- Form absensi dengan validasi lengkap:
  - Program Pelatihan (dropdown)
  - Nama Lengkap
  - Jenis Kelamin (L/P)
  - Pendidikan Terakhir (SD - S3)
  - Tempat & Tanggal Lahir
  - Alamat Lengkap
  - Kabupaten
  - Nomor HP (otomatis convert 08→+62)
  - NIK (validasi 16 digit angka)
  - Email (validasi format)
  - Tanda Tangan Digital menggunakan Canvas
- Pencegahan absen ganda (cek NIK di hari yang sama)
- Pesan otomatis jika absensi OFF: "Absensi OFF, hubungi admin di +6281243397116"

### Dashboard Admin
- **Login Superadmin**
  - Username: `Pemberdayaan`
  - Password: `Kios3in1*`
  
- **Manajemen Program Pelatihan**
  - Tambah, Edit, Hapus program pelatihan
  
- **Manajemen Admin**
  - Tambah, Edit, Hapus akun admin
  
- **Rekap Absensi**
  - Lihat detail absensi lengkap dengan tanda tangan
  - Edit data absensi
  - Hapus data absensi
  - Kirim chat WhatsApp otomatis (format wa.me)
  - Pencarian dan filter (nama, NIK, email, program, tanggal)
  
- **Pengaturan**
  - ON/OFF status absensi
  - Konfigurasi pesan custom untuk absensi OFF
  
- **Export/Import Data**
  - Export CSV
  - Export PDF (menggunakan pdfkit)
  - Import dari CSV
  - Import dari Google Sheets
  
- **Statistik**
  - Total peserta absensi
  - Total program pelatihan
  - Absensi hari ini
  - Status absensi (ON/OFF)

## Teknologi yang Digunakan

### Backend
- Node.js 20
- Express.js (web framework)
- better-sqlite3 (database SQLite)
- bcrypt (hash password)
- express-session (session management)
- pdfkit (generate PDF)
- json2csv (export CSV)
- csv-parser (import CSV)
- multer (upload file)
- googleapis (Google Sheets integration)

### Frontend
- Bootstrap 5 (UI framework)
- SweetAlert2 (notifikasi)
- signature_pad.js (tanda tangan digital)
- Bootstrap Icons
- Vanilla JavaScript

## Struktur Database

### Tabel: users
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password (TEXT)
- created_at (DATETIME)

### Tabel: programs
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- created_at (DATETIME)

### Tabel: attendances
- id (INTEGER PRIMARY KEY)
- program_id (INTEGER)
- nama (TEXT)
- jenis_kelamin (TEXT)
- pendidikan (TEXT)
- tempat_lahir (TEXT)
- tanggal_lahir (TEXT)
- alamat (TEXT)
- kabupaten (TEXT)
- nomor_hp (TEXT)
- nik (TEXT)
- email (TEXT)
- signature (TEXT)
- created_at (DATETIME)

### Tabel: settings
- id (INTEGER PRIMARY KEY)
- key (TEXT UNIQUE)
- value (TEXT)

Keys yang digunakan:
- absensi_status: Status ON/OFF absensi
- absensi_message: Pesan custom yang ditampilkan saat absensi OFF

## Struktur Folder
```
.
├── server.js                 # Main server file
├── database.js              # Database setup and initialization
├── package.json             # Dependencies
├── absensi.db              # SQLite database
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── attendance.js       # Attendance routes
│   └── admin.js            # Admin routes
├── middleware/
│   └── auth.js             # Authentication middleware
├── views/
│   ├── index.html          # Form absensi publik
│   ├── login.html          # Login admin
│   └── dashboard.html      # Dashboard admin
├── public/
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/
│       ├── attendance.js   # Form absensi logic
│       ├── login.js        # Login logic
│       └── dashboard.js    # Dashboard logic
└── utils/                  # Utility functions (if needed)
```

## Cara Menjalankan
1. Server akan otomatis berjalan di port 5000
2. Akses form absensi: http://localhost:5000
3. Akses login admin: http://localhost:5000/admin-login
4. Login dengan username: `Pemberdayaan`, password: `Kios3in1*`

## API Endpoints

### Authentication
- POST `/auth/login` - Login admin
- POST `/auth/logout` - Logout admin
- GET `/auth/check` - Check authentication status

### Attendance (Public)
- GET `/attendance/status` - Get absensi status
- GET `/attendance/programs` - Get list programs
- POST `/attendance/submit` - Submit absensi

### Admin
- GET `/admin/programs` - Get all programs
- POST `/admin/programs` - Create program
- PUT `/admin/programs/:id` - Update program
- DELETE `/admin/programs/:id` - Delete program
- GET `/admin/users` - Get all admins
- POST `/admin/users` - Create admin
- PUT `/admin/users/:id` - Update admin
- DELETE `/admin/users/:id` - Delete admin
- GET `/admin/attendances` - Get attendances with filter
- GET `/admin/attendances/:id` - Get attendance detail
- PUT `/admin/attendances/:id` - Update attendance
- DELETE `/admin/attendances/:id` - Delete attendance
- GET `/admin/statistics` - Get statistics
- GET `/admin/settings` - Get settings
- POST `/admin/settings` - Update settings
- GET `/admin/export/csv` - Export to CSV
- GET `/admin/export/pdf` - Export to PDF
- POST `/admin/import/csv` - Import from CSV
- POST `/admin/import/sheets` - Import from Google Sheets

## Catatan Penting
- NIK harus 16 digit angka
- Nomor HP yang dimulai dengan 08 akan otomatis diubah menjadi +62
- Peserta tidak dapat absen 2x di hari yang sama (validasi berdasarkan NIK)
- Jika absensi OFF, peserta akan melihat pesan untuk menghubungi admin
- Tanda tangan digital disimpan dalam format base64 PNG
- Google Sheets integration memerlukan kredensial yang sudah disetup

## Recent Changes
- [2025-10-15] Initial setup sistem absensi lengkap dengan semua fitur
- [2025-10-15] Implementasi custom message untuk absensi OFF yang bisa dikonfigurasi oleh admin (bukan hard-coded)
