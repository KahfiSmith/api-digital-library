# 🗄️ Database Migration Guide

## Langkah-langkah Migration Database

### 1. Setup Environment File
```bash
# Copy .env.example ke .env
cp .env.example .env
```

Edit `.env` dengan konfigurasi database Anda:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/digital_library"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=your_username
DB_PASSWORD=your_password
```

### 2. Pastikan PostgreSQL Running
Jika menggunakan Docker:
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d db
```

Atau install PostgreSQL lokal dan buat database:
```sql
CREATE DATABASE digital_library;
```

### 3. Generate Prisma Client
```bash
npm run db:generate
# atau
pnpm db:generate
```

### 4. Run Migrations (Buat Tables)
```bash
# Development migration
npm run db:migrate
# atau
pnpm db:migrate
```

### 5. Seed Database dengan Data Dummy
```bash
npm run db:seed
# atau  
pnpm db:seed
```

### 6. Verify Migration Success
```bash
# Open Prisma Studio untuk lihat data
npm run db:studio
# atau
pnpm db:studio
```

## 🚨 Troubleshooting

### Error: Database connection failed
1. Pastikan PostgreSQL running
2. Check DATABASE_URL di .env
3. Test koneksi manual:
```bash
psql -h localhost -p 5432 -U your_username -d digital_library
```

### Error: Migration failed
```bash
# Reset database (HATI-HATI: Akan hapus semua data)
npm run db:reset
```

### Error: Prisma generate failed
```bash
# Manual generate
npx prisma generate
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `db:generate` | Generate Prisma client |
| `db:migrate` | Run migrations (dev) |
| `db:migrate:prod` | Deploy migrations (prod) |
| `db:seed` | Seed database dengan data |
| `db:studio` | Open Prisma Studio |
| `db:reset` | Reset database |
| `db:push` | Push schema changes |

## 🏗️ Tables Yang Akan Dibuat

1. **users** - User accounts (Admin, Librarian, User)
2. **categories** - Book categories
3. **books** - Book catalog
4. **book_loans** - Book borrowing records
5. **book_reviews** - User book reviews
6. **user_book_lists** - User favorites/wishlist
7. **refresh_tokens** - JWT refresh tokens

## 📊 Data Dummy Yang Akan Di-seed

- 4 users (admin, librarian, 2 regular users)
- 6 categories (Programming, Architecture, etc.)
- 6 books (Clean Code, Effective Java, etc.)
- 2 active loans
- 3 book reviews
- 4 user book lists entries