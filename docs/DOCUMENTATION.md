# Digital Library API - Dokumentasi Lengkap

## 📌 Tentang Proyek

Digital Library API adalah sistem backend untuk perpustakaan digital yang dikembangkan menggunakan Node.js dan TypeScript. Proyek ini menyediakan API RESTful yang komprehensif untuk mengelola buku, pengguna, peminjaman, reservasi, dan fitur perpustakaan digital lainnya.

## 🚀 Tech Stack

### Runtime & Language
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **pnpm** - Package manager

### Framework & Core Libraries
- **Express.js** - Web framework untuk Node.js
- **express-async-errors** - Error handling untuk async/await
- **swagger-ui-express** - API Documentation menggunakan Swagger/OpenAPI

### Database
- **PostgreSQL** - Database utama
- **Prisma** - Modern database toolkit dan ORM
- **@prisma/client** - Type-safe database client

### Authentication & Security
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-Origin Resource Sharing
- **express-rate-limit** - Rate limiting
- **express-validator** - Request validation

### File Management
- **multer** - File upload handling

### Utilities
- **uuid** - UUID generator
- **dotenv** - Environment variables
- **compression** - Response compression
- **morgan** - HTTP request logger
- **winston** - Advanced logging

## 🏗️ Arsitektur Sistem

API Digital Library menggunakan arsitektur MVC (Model-View-Controller) dengan beberapa modifikasi untuk API:

1. **Routes**: Mendefinisikan endpoint API dan mengarahkan request ke controller yang sesuai
2. **Controllers**: Menangani HTTP request dan response
3. **Services**: Mengimplementasikan business logic
4. **Models**: Didefinisikan melalui Prisma schema
5. **Middleware**: Fungsi-fungsi yang dijalankan sebelum request mencapai controller
6. **Utils**: Helper functions dan utilitas lainnya
7. **Validators**: Validasi input request

### Struktur Proyek

```
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── validators/     # Request validation
│   ├── database/       # Database configuration
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── prisma/
│   ├── schema.prisma   # Database schema definition
│   ├── seed.ts         # Database seeder
│   └── migrations/     # Database migrations
├── public/
│   ├── uploads/        # Uploaded files
│   └── claudes/        # Static files
├── tests/
│   └── api-requests/   # HTTP request tests
├── logs/               # Application logs
└── docs/               # Documentation
```

## 🔄 Alur Kerja (Workflow)

### 1. Alur Autentikasi
1. **Registrasi**: User mendaftar dengan email, username, dan password
2. **Verifikasi Email**: User memverifikasi email (opsional)
3. **Login**: User login dan mendapatkan access token dan refresh token
4. **Akses Protected Routes**: User mengakses API menggunakan token
5. **Refresh Token**: User mendapatkan token baru tanpa harus login ulang
6. **Logout**: User logout dan refresh token diinvalidasi

### 2. Alur Peminjaman Buku
1. **Browse Buku**: User menelusuri koleksi buku
2. **Peminjaman**: User meminjam buku jika tersedia
3. **Pengembalian**: User mengembalikan buku sebelum tanggal jatuh tempo
4. **Penghitungan Denda**: Sistem menghitung denda jika buku terlambat dikembalikan

### 3. Alur Reservasi Buku
1. **Cek Ketersediaan**: User memeriksa ketersediaan buku
2. **Reservasi**: User mereservasi buku jika tidak tersedia
3. **Notifikasi**: User mendapat notifikasi saat buku tersedia
4. **Peminjaman**: User meminjam buku yang sudah direservasi

### 4. Alur Review dan Rating
1. **Baca Buku**: User membaca buku
2. **Review**: User memberikan rating dan review
3. **Moderasi**: Admin memoderasi review jika diperlukan
4. **Tampilan**: Review ditampilkan di halaman buku

## 📚 Model Database

### Entitas Utama
1. **User**: Pengguna sistem (admin, librarian, user)
2. **Book**: Buku dalam koleksi perpustakaan
3. **Category**: Kategori buku
4. **BookLoan**: Catatan peminjaman buku
5. **BookReview**: Review dan rating buku
6. **BookReservation**: Reservasi buku
7. **UserBookList**: Daftar buku personal user (wishlist, favorites, dll)
8. **Notification**: Notifikasi untuk user
9. **RefreshToken**: Token untuk autentikasi refresh
10. **EmailVerificationToken**: Token untuk verifikasi email
11. **PasswordResetToken**: Token untuk reset password

### Detail Tabel Database

#### 1. Users (`users`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| username | TEXT | Username unik |
| email | TEXT | Email unik |
| password_hash | TEXT | Hash password |
| first_name | TEXT | Nama depan |
| last_name | TEXT | Nama belakang |
| avatar_url | TEXT | URL avatar (nullable) |
| role | Role | ADMIN, LIBRARIAN, USER |
| is_active | BOOLEAN | Status aktif (default: true) |
| email_verified | BOOLEAN | Status verifikasi email |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 2. Books (`books`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| isbn | TEXT | ISBN buku (nullable, unique) |
| title | TEXT | Judul buku |
| subtitle | TEXT | Subjudul (nullable) |
| authors | TEXT[] | Array penulis |
| description | TEXT | Deskripsi buku (nullable) |
| publisher | TEXT | Penerbit (nullable) |
| published_date | TIMESTAMP | Tanggal terbit (nullable) |
| page_count | INTEGER | Jumlah halaman (nullable) |
| language | TEXT | Bahasa (default: 'en') |
| cover_url | TEXT | URL cover buku (nullable) |
| pdf_url | TEXT | URL file PDF (nullable) |
| category_id | TEXT | Foreign key ke categories |
| tags | TEXT[] | Array tag |
| rating | FLOAT | Rating rata-rata (default: 0.0) |
| total_copies | INTEGER | Total salinan (default: 1) |
| available_copies | INTEGER | Salinan tersedia (default: 1) |
| is_active | BOOLEAN | Status aktif (default: true) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 3. Categories (`categories`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| name | TEXT | Nama kategori (unique) |
| description | TEXT | Deskripsi kategori (nullable) |
| slug | TEXT | Slug URL (unique) |
| is_active | BOOLEAN | Status aktif (default: true) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 4. Book Loans (`book_loans`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| book_id | TEXT | Foreign key ke books |
| loan_date | TIMESTAMP | Tanggal peminjaman |
| due_date | TIMESTAMP | Tanggal jatuh tempo |
| return_date | TIMESTAMP | Tanggal pengembalian (nullable) |
| status | LoanStatus | ACTIVE, RETURNED, OVERDUE, LOST |
| fine_amount | FLOAT | Jumlah denda (default: 0.0) |
| notes | TEXT | Catatan (nullable) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 5. Book Reviews (`book_reviews`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| book_id | TEXT | Foreign key ke books |
| rating | INTEGER | Rating 1-5 |
| review_text | TEXT | Teks review (nullable) |
| is_public | BOOLEAN | Status publik (default: true) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 6. User Book Lists (`user_book_lists`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| book_id | TEXT | Foreign key ke books |
| list_type | ListType | FAVORITES, WISHLIST, READING, COMPLETED |
| added_at | TIMESTAMP | Waktu ditambahkan |

#### 7. Book Reservations (`book_reservations`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| book_id | TEXT | Foreign key ke books |
| status | ReservationStatus | PENDING, READY, FULFILLED, CANCELLED, EXPIRED |
| reserved_at | TIMESTAMP | Waktu reservasi |
| expires_at | TIMESTAMP | Waktu expire |
| fulfilled_at | TIMESTAMP | Waktu fulfill (nullable) |
| cancelled_at | TIMESTAMP | Waktu cancel (nullable) |
| priority | INTEGER | Prioritas antrian (default: 0) |
| notes | TEXT | Catatan (nullable) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update |

#### 8. Notifications (`notifications`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| type | NotificationType | BOOK_DUE_REMINDER, BOOK_OVERDUE, NEW_BOOK_AVAILABLE, RESERVATION_READY, REVIEW_REPLY, SYSTEM_ANNOUNCEMENT |
| title | TEXT | Judul notifikasi |
| message | TEXT | Pesan notifikasi |
| metadata | JSON | Data tambahan (nullable) |
| is_read | BOOLEAN | Status baca (default: false) |
| read_at | TIMESTAMP | Waktu dibaca (nullable) |
| created_at | TIMESTAMP | Waktu pembuatan |

#### 9. Refresh Tokens (`refresh_tokens`) 🔐
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key (JTI dari JWT) |
| user_id | TEXT | Foreign key ke users |
| token_hash | TEXT | Hash dari refresh token |
| expires_at | TIMESTAMP | Waktu expire |
| is_revoked | BOOLEAN | Status revoke (default: false) |
| created_at | TIMESTAMP | Waktu pembuatan |

#### 10. Email Verification Tokens (`email_verification_tokens`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| token_hash | TEXT | Hash dari token |
| expires_at | TIMESTAMP | Waktu expire |
| is_used | BOOLEAN | Status penggunaan (default: false) |
| created_at | TIMESTAMP | Waktu pembuatan |

#### 11. Password Reset Tokens (`password_reset_tokens`)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | TEXT | Primary key |
| user_id | TEXT | Foreign key ke users |
| token_hash | TEXT | Hash dari token |
| expires_at | TIMESTAMP | Waktu expire |
| is_used | BOOLEAN | Status penggunaan (default: false) |
| created_at | TIMESTAMP | Waktu pembuatan |

### Relasi Antar Entitas
- **User** (1) → (N) **BookLoan, BookReview, UserBookList, BookReservation, Notification, RefreshToken, EmailVerificationToken, PasswordResetToken**
- **Book** (1) → (N) **BookLoan, BookReview, UserBookList, BookReservation**
- **Category** (1) → (N) **Book**
- **User** (1) → (1) **BookReview** per Book (unique constraint)
- **User** (1) → (1) **UserBookList** per Book per ListType (unique constraint)
- **User** (1) → (1) **BookReservation** per Book (unique constraint)

## 🌟 Fitur Utama

### 1. Manajemen Pengguna
- Registrasi dan login pengguna
- Verifikasi email
- Manajemen profil (avatar, informasi personal)
- Manajemen password (reset, update)
- Role-based access control (admin, librarian, user)

### 2. Manajemen Buku
- CRUD operasi untuk buku
- Upload cover dan file PDF
- Kategorisasi buku
- Pencarian dan filtering buku
- Manajemen metadata (penulis, penerbit, tahun, dll)

### 3. Sistem Peminjaman
- Peminjaman dan pengembalian buku
- Penghitungan tanggal jatuh tempo
- Pengelolaan denda
- Riwayat peminjaman
- Perpanjangan peminjaman

### 4. Sistem Reservasi
- Reservasi buku yang tidak tersedia
- Antrian reservasi dengan prioritas
- Notifikasi ketersediaan
- Manajemen reservasi (cancel, fulfil)

### 5. Review dan Rating
- Rating buku (1-5 bintang)
- Review teks
- Pengaturan privasi review (publik/privat)
- Penghitungan rating rata-rata

### 6. Daftar Bacaan Personal
- Wishlist buku
- Daftar favorit
- Daftar sedang dibaca
- Daftar sudah selesai dibaca

### 7. Sistem Notifikasi
- Pengingat buku jatuh tempo
- Notifikasi keterlambatan
- Notifikasi buku baru
- Notifikasi reservasi siap diambil
- Pengumuman sistem

### 8. Admin Dashboard
- Manajemen pengguna
- Manajemen koleksi buku
- Laporan peminjaman
- Laporan reservasi
- Analytics dan statistik lengkap
- Pengumuman sistem

### 9. Sistem Rekomendasi Buku 🤖
- **Rekomendasi Personal**: Berdasarkan riwayat peminjaman, kategori favorit, dan pola rating
- **Buku Serupa**: Rekomendasi berdasarkan kesamaan kategori, penulis, dan rating
- **Buku Trending**: Berdasarkan aktivitas terbaru (peminjaman, review, wishlist)
- **Rekomendasi Kategori**: Buku terbaik dalam kategori tertentu
- **AI-powered Scoring**: Algoritma cerdas dengan bobot preferensi user
- **Analytics**: Statistik dan monitoring performa rekomendasi

### 10. Upload dan Storage
- Upload avatar pengguna
- Upload cover buku
- Upload file PDF buku
- Manajemen storage

## 🔒 Keamanan

### Fitur Keamanan
- Password hashing dengan bcrypt
- Authentication dengan JWT
- Refresh token rotation
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- Security headers dengan Helmet
- Request logging dan monitoring

## 🔧 API Endpoints

### Dokumentasi API
Dokumentasi API interaktif tersedia melalui Swagger UI:
- **Swagger UI**: `/api/v1/swagger` - Interface interaktif untuk menjelajahi dan menguji API
- **OpenAPI JSON**: `/api/v1/openapi.json` - Spesifikasi OpenAPI dalam format JSON
- **HTML Docs**: `/api/v1/docs` - Dokumentasi API dalam format HTML

Untuk informasi lebih lanjut tentang cara menggunakan dokumentasi API, lihat [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- POST /api/v1/auth/verify-email
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/me

### Users
- GET /api/v1/users/profile
- PUT /api/v1/users/profile
- POST /api/v1/users/profile/avatar
- PUT /api/v1/users/profile/password
- GET /api/v1/users (admin only)
- GET /api/v1/users/:id (admin only)

### Books
- GET /api/v1/books
- GET /api/v1/books/:id
- POST /api/v1/books (admin/librarian)
- PUT /api/v1/books/:id (admin/librarian)
- DELETE /api/v1/books/:id (admin/librarian)
- POST /api/v1/books/:id/cover (admin/librarian)
- POST /api/v1/books/:id/pdf (admin/librarian)

### Categories
- GET /api/v1/categories
- GET /api/v1/categories/:id
- GET /api/v1/categories/:id/books
- POST /api/v1/categories (admin/librarian)
- PUT /api/v1/categories/:id (admin/librarian)
- DELETE /api/v1/categories/:id (admin/librarian)

### Loans
- GET /api/v1/loans
- GET /api/v1/loans/:id
- POST /api/v1/loans
- PATCH /api/v1/loans/:id/return
- PATCH /api/v1/loans/:id/extend

### Reviews
- POST /api/v1/reviews
- PUT /api/v1/reviews/:id
- DELETE /api/v1/reviews/:id
- GET /api/v1/reviews/book/:id
- GET /api/v1/reviews/user/:userId

### Lists
- GET /api/v1/lists
- GET /api/v1/lists/:listType
- POST /api/v1/lists/:listType
- DELETE /api/v1/lists/:listType/:bookId

### Reservations
- GET /api/v1/reservations
- GET /api/v1/reservations/:id
- POST /api/v1/reservations
- PATCH /api/v1/reservations/:id/cancel
- PATCH /api/v1/reservations/:id/fulfill (admin/librarian)

### Notifications
- GET /api/v1/notifications
- GET /api/v1/notifications/unread-count
- PATCH /api/v1/notifications/:id/read
- PATCH /api/v1/notifications/read-all
- DELETE /api/v1/notifications/:id
- DELETE /api/v1/notifications
- POST /api/v1/notifications/system-announcement (admin)
- POST /api/v1/notifications/custom (admin)

### Search
- GET /api/v1/search
- GET /api/v1/search/advanced

### Recommendations 🤖
- GET /api/v1/recommendations/personalized (authenticated)
- GET /api/v1/recommendations/similar/:bookId
- GET /api/v1/recommendations/trending
- GET /api/v1/recommendations/category/:categoryId
- GET /api/v1/recommendations/analytics (admin)
- GET /api/v1/recommendations/health

### Admin
- GET /api/v1/admin/stats
- GET /api/v1/admin/users
- PUT /api/v1/admin/users/:id/status
- PUT /api/v1/admin/users/:id/role
- PUT /api/v1/admin/users/:id/password
- GET /api/v1/admin/recent
- GET /api/v1/admin/export/users.csv
- GET /api/v1/admin/export/books.csv
- GET /api/v1/admin/export/loans.csv
- GET /api/v1/admin/analytics/overview
- GET /api/v1/admin/analytics/loans
- GET /api/v1/admin/analytics/users/engagement
- GET /api/v1/admin/analytics/books/popularity
- GET /api/v1/admin/analytics/dashboard

## 🚀 Deployment

### Opsi Deployment
1. **Traditional Server**: Node.js runtime dengan PM2
2. **Docker Container**: Menggunakan Dockerfile dan docker-compose.yml yang disediakan
3. **Kubernetes**: Dapat di-deploy ke cluster Kubernetes

### Kebutuhan Sistem
- Node.js 18+
- PostgreSQL 15+
- Minimal 512MB RAM
- 1GB disk space

## 💻 Pengembangan Lokal

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- pnpm
- Docker & Docker Compose (opsional)

### Setup
1. Clone repository
2. Install dependencies: `pnpm install`
3. Setup environment variables: Copy `.env.example` ke `.env`
4. Setup database:
   - Dengan Docker: `pnpm run docker:run`
   - Manual: Create database dan run `pnpm run db:migrate && pnpm run db:seed`
5. Start development server: `pnpm run dev`

### Testing
Gunakan HTTP request files di `tests/api-requests/` untuk testing manual endpoint API.

## 🔮 Pengembangan Masa Depan

Fitur-fitur yang direncanakan untuk pengembangan selanjutnya:

1. **Real-time Features**: WebSocket untuk notifikasi real-time
2. **Advanced Search**: Full-text search dan filtering yang lebih canggih
3. ✅ **Recommendation System**: Rekomendasi buku berbasis AI (SELESAI)
4. **Mobile Push Notifications**: Integrasi dengan FCM/APNS
5. **Email Notifications**: Integrasi email untuk pemberitahuan penting
6. **Analytics Dashboard**: Statistik penggunaan dan laporan
7. **Internationalization**: Dukungan multi-bahasa
8. **Bulk Operations**: Import/export data buku
9. **OAuth Integration**: Login dengan Google, Facebook, dll
10. **E-book Reader**: Integrasi pembaca e-book dalam aplikasi

## 📞 Kontak & Support

Untuk pertanyaan atau dukungan, hubungi:
- Email: [support@digitallibrary.com](mailto:support@digitallibrary.com)
- GitHub: [github.com/KahfiSmith/api-digital-library](https://github.com/KahfiSmith/api-digital-library)

---

Dokumentasi ini dibuat pada 30 Agustus 2025 dan mungkin akan diperbarui seiring dengan pengembangan proyek.
