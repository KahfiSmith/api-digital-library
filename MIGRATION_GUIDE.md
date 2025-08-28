# Database Migration Guide

## 🗄️ **Running the Notifications Migration**

Untuk mengaktifkan notification system, Anda perlu menjalankan migration database:

### Option 1: Automatic Migration (Recommended)
```bash
# Jalankan migration dan regenerate Prisma client
npx prisma migrate deploy
npx prisma generate
```

### Option 2: Manual Migration
Jika automatic migration bermasalah, jalankan SQL secara manual:

```sql
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'BOOK_DUE_REMINDER', 
  'BOOK_OVERDUE', 
  'NEW_BOOK_AVAILABLE', 
  'RESERVATION_READY', 
  'REVIEW_REPLY', 
  'SYSTEM_ANNOUNCEMENT'
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" 
ADD CONSTRAINT "notifications_user_id_fkey" 
FOREIGN KEY ("user_id") 
REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
```

### Step 3: Regenerate Prisma Client
Setelah migration berhasil, regenerate client:
```bash
npx prisma generate
```

### Step 4: Update Type Imports (Optional)
Jika Prisma client sudah regenerated dengan success, Anda bisa update import di file berikut untuk menggunakan Prisma types:

**Files yang perlu diupdate:**
- `src/services/notifications.service.ts` 
- `src/controllers/notifications.controller.ts`
- `src/validators/notifications.ts`
- `src/services/lists.service.ts`
- `src/controllers/lists.controller.ts` 
- `src/validators/lists.ts`
- `src/services/loans.service.ts`
- `src/controllers/loans.controller.ts`

**Change imports dari:**
```typescript
import { NotificationType, ListType, LoanStatus } from '@/types/enums';
```

**Ke:**
```typescript
import { NotificationType, ListType, LoanStatus } from '@prisma/client';
```

**Dan ganti semua `(prisma as any).notification` menjadi `prisma.notification`**

## ✅ **Verification**

Untuk memastikan migration berhasil:

1. **Check Database:**
   ```sql
   -- Check if table exists
   SELECT * FROM notifications LIMIT 1;
   
   -- Check enum values
   SELECT enum_name, enum_label 
   FROM information_schema.enum_label 
   WHERE enum_name = 'NotificationType';
   ```

2. **Test TypeScript Compilation:**
   ```bash
   npm run build
   # atau
   npx tsc --noEmit
   ```

3. **Test API Endpoints:**
   ```bash
   # Get notifications (should return 200 empty array for new users)
   curl -X GET http://localhost:3001/api/v1/notifications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 🔧 **Troubleshooting**

### Issue: Prisma Client Generation Fails
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npx prisma generate
```

### Issue: TypeScript Enum Import Errors
**Solution:** Continue using manual enum from `@/types/notifications` until Prisma client regeneration succeeds.

### Issue: Database Connection Issues
**Solution:** 
1. Check `.env` file has correct DATABASE_URL
2. Ensure PostgreSQL is running
3. Verify database exists and is accessible

## 📝 **Notes**

- Migration file sudah dibuat di: `prisma/migrations/20250828_add_notifications/migration.sql`
- Manual enum di `src/types/notifications.ts` bisa dihapus setelah Prisma client berhasil regenerated
- Semua notification features akan otomatis aktif setelah migration berhasil