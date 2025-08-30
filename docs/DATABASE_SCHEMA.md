# 🗄️ Database Schema - Digital Library API

## 📊 Database Overview

Digital Library API menggunakan **PostgreSQL** sebagai database utama dengan **Prisma** sebagai ORM. Database terdiri dari 11 tabel utama yang saling terhubung untuk mendukung semua fitur perpustakaan digital.

## 📋 Daftar Tabel

| No | Tabel | Deskripsi | Jumlah Kolom |
|----|-------|-----------|--------------|
| 1 | `users` | Data pengguna sistem | 12 |
| 2 | `books` | Data koleksi buku | 20 |
| 3 | `categories` | Kategori buku | 7 |
| 4 | `book_loans` | Catatan peminjaman | 11 |
| 5 | `book_reviews` | Review dan rating buku | 8 |
| 6 | `user_book_lists` | Daftar personal user | 5 |
| 7 | `book_reservations` | Reservasi buku | 12 |
| 8 | `notifications` | Notifikasi user | 9 |
| 9 | `refresh_tokens` | Token autentikasi | 6 |
| 10 | `email_verification_tokens` | Token verifikasi email | 6 |
| 11 | `password_reset_tokens` | Token reset password | 6 |

## 🔗 Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    USERS    │───────│ BOOK_LOANS  │───────│    BOOKS    │
│             │       │             │       │             │
│ - id (PK)   │       │ - id (PK)   │       │ - id (PK)   │
│ - username  │       │ - user_id   │       │ - title     │
│ - email     │       │ - book_id   │       │ - authors[] │
│ - role      │       │ - status    │       │ - rating    │
│ ...         │       │ ...         │       │ ...         │
└─────────────┘       └─────────────┘       └─────────────┘
       │                      │                      │
       │                      │                      │
       │               ┌─────────────┐                │
       │               │BOOK_REVIEWS │                │
       └───────────────│             │────────────────┘
                       │ - id (PK)   │
                       │ - user_id   │
                       │ - book_id   │
                       │ - rating    │
                       └─────────────┘
```

## 📑 Detail Schema Tabel

### 1. 👥 Users (`users`)

**Deskripsi**: Menyimpan data pengguna sistem dengan berbagai role dan informasi profil.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik pengguna |
| `username` | TEXT | UNIQUE, NOT NULL | - | Username unik |
| `email` | TEXT | UNIQUE, NOT NULL | - | Email unik |
| `password_hash` | TEXT | NOT NULL | - | Hash password (bcrypt) |
| `first_name` | TEXT | NOT NULL | - | Nama depan |
| `last_name` | TEXT | NOT NULL | - | Nama belakang |
| `avatar_url` | TEXT | NULLABLE | - | URL foto profil |
| `role` | Role | NOT NULL | USER | ADMIN, LIBRARIAN, USER |
| `is_active` | BOOLEAN | NOT NULL | true | Status aktif pengguna |
| `email_verified` | BOOLEAN | NOT NULL | false | Status verifikasi email |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan akun |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update terakhir |

**Indexes**:
- `users_username_key` (UNIQUE pada username)
- `users_email_key` (UNIQUE pada email)

### 2. 📚 Books (`books`)

**Deskripsi**: Menyimpan data koleksi buku dengan metadata lengkap.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik buku |
| `isbn` | TEXT | UNIQUE, NULLABLE | - | Nomor ISBN |
| `title` | TEXT | NOT NULL | - | Judul buku |
| `subtitle` | TEXT | NULLABLE | - | Subjudul buku |
| `authors` | TEXT[] | NOT NULL | [] | Array nama penulis |
| `description` | TEXT | NULLABLE | - | Deskripsi/sinopsis |
| `publisher` | TEXT | NULLABLE | - | Nama penerbit |
| `published_date` | TIMESTAMP | NULLABLE | - | Tanggal terbit |
| `page_count` | INTEGER | NULLABLE | - | Jumlah halaman |
| `language` | TEXT | NOT NULL | 'en' | Bahasa buku |
| `cover_url` | TEXT | NULLABLE | - | URL cover buku |
| `pdf_url` | TEXT | NULLABLE | - | URL file PDF |
| `category_id` | TEXT | NOT NULL, FK | - | ID kategori |
| `tags` | TEXT[] | NOT NULL | [] | Array tag |
| `rating` | DOUBLE | NOT NULL | 0.0 | Rating rata-rata |
| `total_copies` | INTEGER | NOT NULL | 1 | Total eksemplar |
| `available_copies` | INTEGER | NOT NULL | 1 | Eksemplar tersedia |
| `is_active` | BOOLEAN | NOT NULL | true | Status aktif buku |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu penambahan |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update terakhir |

**Indexes**:
- `books_isbn_key` (UNIQUE pada isbn)

**Foreign Keys**:
- `books_category_id_fkey` → `categories(id)`

### 3. 🏷️ Categories (`categories`)

**Deskripsi**: Kategori untuk pengelompokan buku.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik kategori |
| `name` | TEXT | UNIQUE, NOT NULL | - | Nama kategori |
| `description` | TEXT | NULLABLE | - | Deskripsi kategori |
| `slug` | TEXT | UNIQUE, NOT NULL | - | URL slug |
| `is_active` | BOOLEAN | NOT NULL | true | Status aktif |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update |

**Indexes**:
- `categories_name_key` (UNIQUE pada name)
- `categories_slug_key` (UNIQUE pada slug)

### 4. 📖 Book Loans (`book_loans`)

**Deskripsi**: Catatan peminjaman buku oleh pengguna.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik peminjaman |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `book_id` | TEXT | NOT NULL, FK | - | ID buku |
| `loan_date` | TIMESTAMP | NOT NULL | now() | Tanggal peminjaman |
| `due_date` | TIMESTAMP | NOT NULL | - | Tanggal jatuh tempo |
| `return_date` | TIMESTAMP | NULLABLE | - | Tanggal pengembalian |
| `status` | LoanStatus | NOT NULL | ACTIVE | ACTIVE, RETURNED, OVERDUE, LOST |
| `fine_amount` | DOUBLE | NOT NULL | 0.0 | Jumlah denda |
| `notes` | TEXT | NULLABLE | - | Catatan tambahan |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pencatatan |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update |

**Foreign Keys**:
- `book_loans_user_id_fkey` → `users(id)` ON DELETE CASCADE
- `book_loans_book_id_fkey` → `books(id)` ON DELETE CASCADE

### 5. ⭐ Book Reviews (`book_reviews`)

**Deskripsi**: Review dan rating buku dari pengguna.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik review |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `book_id` | TEXT | NOT NULL, FK | - | ID buku |
| `rating` | INTEGER | NOT NULL | - | Rating 1-5 |
| `review_text` | TEXT | NULLABLE | - | Teks review |
| `is_public` | BOOLEAN | NOT NULL | true | Status publikasi |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update |

**Indexes**:
- `book_reviews_user_id_book_id_key` (UNIQUE pada user_id, book_id)

**Foreign Keys**:
- `book_reviews_user_id_fkey` → `users(id)` ON DELETE CASCADE
- `book_reviews_book_id_fkey` → `books(id)` ON DELETE CASCADE

### 6. 📝 User Book Lists (`user_book_lists`)

**Deskripsi**: Daftar personal pengguna (wishlist, favorites, dll).

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik list |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `book_id` | TEXT | NOT NULL, FK | - | ID buku |
| `list_type` | ListType | NOT NULL | - | FAVORITES, WISHLIST, READING, COMPLETED |
| `added_at` | TIMESTAMP | NOT NULL | now() | Waktu penambahan |

**Indexes**:
- `user_book_lists_user_id_book_id_list_type_key` (UNIQUE pada user_id, book_id, list_type)

**Foreign Keys**:
- `user_book_lists_user_id_fkey` → `users(id)` ON DELETE CASCADE
- `user_book_lists_book_id_fkey` → `books(id)` ON DELETE CASCADE

### 7. 🔖 Book Reservations (`book_reservations`)

**Deskripsi**: Reservasi buku yang tidak tersedia.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik reservasi |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `book_id` | TEXT | NOT NULL, FK | - | ID buku |
| `status` | ReservationStatus | NOT NULL | PENDING | PENDING, READY, FULFILLED, CANCELLED, EXPIRED |
| `reserved_at` | TIMESTAMP | NOT NULL | now() | Waktu reservasi |
| `expires_at` | TIMESTAMP | NOT NULL | - | Waktu expire |
| `fulfilled_at` | TIMESTAMP | NULLABLE | - | Waktu fulfill |
| `cancelled_at` | TIMESTAMP | NULLABLE | - | Waktu pembatalan |
| `priority` | INTEGER | NOT NULL | 0 | Prioritas antrian |
| `notes` | TEXT | NULLABLE | - | Catatan |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pencatatan |
| `updated_at` | TIMESTAMP | NOT NULL | - | Waktu update |

**Indexes**:
- `book_reservations_user_id_book_id_key` (UNIQUE pada user_id, book_id)

**Foreign Keys**:
- `book_reservations_user_id_fkey` → `users(id)` ON DELETE CASCADE
- `book_reservations_book_id_fkey` → `books(id)` ON DELETE CASCADE

### 8. 🔔 Notifications (`notifications`)

**Deskripsi**: Notifikasi untuk pengguna.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik notifikasi |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `type` | NotificationType | NOT NULL | - | Jenis notifikasi |
| `title` | TEXT | NOT NULL | - | Judul notifikasi |
| `message` | TEXT | NOT NULL | - | Pesan notifikasi |
| `metadata` | JSON | NULLABLE | - | Data tambahan |
| `is_read` | BOOLEAN | NOT NULL | false | Status baca |
| `read_at` | TIMESTAMP | NULLABLE | - | Waktu dibaca |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |

**NotificationType Values**:
- `BOOK_DUE_REMINDER`
- `BOOK_OVERDUE`
- `NEW_BOOK_AVAILABLE`
- `RESERVATION_READY`
- `REVIEW_REPLY`
- `SYSTEM_ANNOUNCEMENT`

**Foreign Keys**:
- `notifications_user_id_fkey` → `users(id)` ON DELETE CASCADE

### 9. 🔐 Refresh Tokens (`refresh_tokens`)

**Deskripsi**: Token untuk refresh authentication.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | - | JTI dari JWT token |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `token_hash` | TEXT | NOT NULL | - | Hash dari token |
| `expires_at` | TIMESTAMP | NOT NULL | - | Waktu expire |
| `is_revoked` | BOOLEAN | NOT NULL | false | Status revoke |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |

**Foreign Keys**:
- `refresh_tokens_user_id_fkey` → `users(id)` ON DELETE CASCADE

### 10. 📧 Email Verification Tokens (`email_verification_tokens`)

**Deskripsi**: Token untuk verifikasi email.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik token |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `token_hash` | TEXT | NOT NULL | - | Hash dari token |
| `expires_at` | TIMESTAMP | NOT NULL | - | Waktu expire |
| `is_used` | BOOLEAN | NOT NULL | false | Status penggunaan |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |

**Foreign Keys**:
- `email_verification_tokens_user_id_fkey` → `users(id)` ON DELETE CASCADE

### 11. 🔑 Password Reset Tokens (`password_reset_tokens`)

**Deskripsi**: Token untuk reset password.

| Kolom | Tipe | Constraint | Default | Deskripsi |
|-------|------|------------|---------|-----------|
| `id` | TEXT | PRIMARY KEY | cuid() | ID unik token |
| `user_id` | TEXT | NOT NULL, FK | - | ID pengguna |
| `token_hash` | TEXT | NOT NULL | - | Hash dari token |
| `expires_at` | TIMESTAMP | NOT NULL | - | Waktu expire |
| `is_used` | BOOLEAN | NOT NULL | false | Status penggunaan |
| `created_at` | TIMESTAMP | NOT NULL | now() | Waktu pembuatan |

**Foreign Keys**:
- `password_reset_tokens_user_id_fkey` → `users(id)` ON DELETE CASCADE

## 🔗 Relationship Summary

### One-to-Many Relationships
- `users` → `book_loans` (1:N)
- `users` → `book_reviews` (1:N)  
- `users` → `user_book_lists` (1:N)
- `users` → `book_reservations` (1:N)
- `users` → `notifications` (1:N)
- `users` → `refresh_tokens` (1:N)
- `users` → `email_verification_tokens` (1:N)
- `users` → `password_reset_tokens` (1:N)
- `books` → `book_loans` (1:N)
- `books` → `book_reviews` (1:N)
- `books` → `user_book_lists` (1:N)
- `books` → `book_reservations` (1:N)
- `categories` → `books` (1:N)

### One-to-One Relationships (with unique constraints)
- `users` + `books` → `book_reviews` (1:1 per user per book)
- `users` + `books` + `list_type` → `user_book_lists` (1:1 per user per book per list type)
- `users` + `books` → `book_reservations` (1:1 per user per book)

## 📊 Enum Types

### Role
```sql
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LIBRARIAN', 'USER');
```

### LoanStatus
```sql
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST');
```

### ListType
```sql
CREATE TYPE "ListType" AS ENUM ('FAVORITES', 'WISHLIST', 'READING', 'COMPLETED');
```

### NotificationType
```sql
CREATE TYPE "NotificationType" AS ENUM (
  'BOOK_DUE_REMINDER', 
  'BOOK_OVERDUE', 
  'NEW_BOOK_AVAILABLE', 
  'RESERVATION_READY', 
  'REVIEW_REPLY', 
  'SYSTEM_ANNOUNCEMENT'
);
```

### ReservationStatus
```sql
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'READY', 'FULFILLED', 'CANCELLED', 'EXPIRED');
```

## 🚀 Performance Considerations

### Recommended Indexes
```sql
-- Performance indexes (tambahan dari yang sudah ada)
CREATE INDEX idx_book_loans_user_id ON book_loans(user_id);
CREATE INDEX idx_book_loans_book_id ON book_loans(book_id);
CREATE INDEX idx_book_loans_status ON book_loans(status);
CREATE INDEX idx_book_loans_due_date ON book_loans(due_date);
CREATE INDEX idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_rating ON books(rating);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Cleanup Queries
```sql
-- Cleanup expired tokens (jalankan secara berkala)
DELETE FROM refresh_tokens WHERE expires_at < NOW();
DELETE FROM email_verification_tokens WHERE expires_at < NOW();
DELETE FROM password_reset_tokens WHERE expires_at < NOW();
```

## 📈 Database Statistics

**Total Tables**: 11  
**Total Columns**: ~102  
**Total Indexes**: 15+  
**Total Foreign Keys**: 18  
**Total Unique Constraints**: 6  

Database ini dirancang untuk:
- **Skalabilitas**: Mendukung ribuan pengguna dan buku
- **Integritas**: Foreign keys dan constraints yang ketat
- **Performa**: Index yang optimal untuk query umum
- **Keamanan**: Hash untuk semua token dan password
- **Fleksibilitas**: JSON metadata untuk extensibility

---

**Updated**: 30 Agustus 2025  
**Version**: 1.0.0