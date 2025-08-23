# 🗄️ Database Setup Guide

## 📋 Prerequisites
Database PostgreSQL harus running sebelum migration!

## 🚀 Setup Options

### Option 1: Docker (Recommended)
```bash
# 1. Install Docker Desktop
# 2. Run PostgreSQL container
docker run --name digital-library-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=digital_library \
  -p 5432:5432 -d postgres:15-alpine

# 3. Verify container is running
docker ps
```

### Option 2: Local PostgreSQL Installation
1. Download PostgreSQL: https://www.postgresql.org/download/
2. Install dengan default settings
3. Set password untuk user 'postgres': `postgres`
4. Create database:
```sql
psql -U postgres
CREATE DATABASE digital_library;
\q
```

### Option 3: Cloud Database
- **Supabase**: https://supabase.com (Free tier available)
- **ElephantSQL**: https://www.elephantsql.com (Free tier available)
- **Railway**: https://railway.app
- **Neon**: https://neon.tech

Update `.env` dengan connection string dari cloud provider.

## 🏃‍♂️ After Database Setup

### 1. Test Connection
```bash
pnpm test:db
# or
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connected!');
  return prisma.\$disconnect();
}).catch(console.error);
"
```

### 2. Run Migration
```bash
# Generate Prisma client
pnpm db:generate

# Create initial migration
pnpm db:migrate

# Seed with dummy data
pnpm db:seed

# Open Prisma Studio to verify
pnpm db:studio
```

## 🔧 Troubleshooting

### Error: "database does not exist"
```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE digital_library;
\q
```

### Error: "authentication failed"
Check your credentials in `.env`:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/digital_library"
```

### Error: "Connection refused"
- Make sure PostgreSQL is running
- Check port 5432 is not blocked
- For Docker: `docker start digital-library-db`

### Error: "Migration failed"
```bash
# Reset and try again
pnpm db:reset
pnpm db:migrate
```

## 📊 Expected Tables After Migration

- `users` (4 rows after seed)
- `categories` (6 rows after seed) 
- `books` (6 rows after seed)
- `book_loans` (2 rows after seed)
- `book_reviews` (3 rows after seed)
- `user_book_lists` (4 rows after seed)
- `refresh_tokens` (empty initially)

## 🎯 Quick Setup Commands

```bash
# If using Docker
docker run --name digital-library-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=digital_library -p 5432:5432 -d postgres:15-alpine

# Then run migrations
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```