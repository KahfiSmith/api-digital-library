# API Testing Setup (VS Code REST Client)

## Requirements

- VS Code extension: REST Client (Huachao Mao)

## Environment Setup

1) Copy env file
```
cp tests/api-requests/.env.example tests/api-requests/.env
```
2) Edit `tests/api-requests/.env` and set:
- `API_BASE_URL=http://localhost:3001/api/v1`
- `TEST_EMAIL`, `TEST_PASSWORD` (dan `ADMIN_EMAIL`, `ADMIN_PASSWORD` bila perlu)

## Run Order (Disarankan)

1) Start API server
```
pnpm dev
```

2) Health check
- Open `tests/api-requests/quick-tests.http` → request "Health Check"

3) Auto-login (set global token untuk semua request)
- Open `tests/api-requests/auth/auto-login.http`
- Send request "Auto-login as test user"
- Optional: jalankan bagian admin untuk `{{adminToken}}`

4) Quick checks (tanpa copy-paste token)
- Open `tests/api-requests/quick-tests.http`
- Jalankan urut: Health → API Info → Login (opsional) → Get Profile → Books → Categories → Search → Loans

5) Domain-specific
- Books: `books/*.http`
- Categories: `categories/categories.http`
- Users: `users/profile.http`
- Reviews: `reviews/reviews.http`
- Loans: `loans/*.http`
- Notifications: `notifications/notifications.http`
- Recommendations: `recommendations/*.http`
- Admin: `admin/*.http`

6) Token expired? Auto-refresh
- Open `auth/auto-refresh.http` → kirim request pertama

7) Logout & cleanup
- `auth/logout.http` (membersihkan token global)

## Catatan

- Semua file `.http` membaca `@baseUrl` dari `{{$dotenv API_BASE_URL}}`.
- Header Authorization otomatis pakai `{{token}}` global jika tersedia; fallback ke `{{$dotenv ACCESS_TOKEN}}`.
- Seed data contoh di `prisma/seed.ts` (admin/librarian/user) dapat digunakan untuk uji cepat.
