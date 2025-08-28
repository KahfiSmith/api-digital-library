# Auth API Documentation

## Overview
Dokumentasi lengkap untuk testing Authentication API menggunakan HTTP request files. Semua endpoint menggunakan base URL `http://localhost:3001/api/v1/auth`.

## 📁 File Structure
```
tests/api-requests/auth/
├── register.http           # User registration
├── login.http             # User login
├── refresh.http           # Token refresh
├── logout.http            # User logout
├── me.http                # Get current user
├── verify-email.http      # Email verification
├── password-reset.http    # Password reset
└── verify-reset.http      # Complete verification & reset flow
```

## 🚀 Quick Start Guide

### 1. Setup
1. Pastikan server berjalan di `localhost:3001`
2. Database sudah terkoneksi
3. Gunakan REST Client extension di VS Code

### 2. Basic Flow
```
Register → Login → Access Protected Routes → Logout
```

## 📋 API Endpoints

### 🔐 Authentication Endpoints

#### 1. Register New User
**File:** `register.http`
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "email": "test123@example.com", 
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User"
}
```
**Response:** Returns user data, tokens, and verification info

---

#### 2. User Login
**File:** `login.http`

**Login with Email:**
```http
POST /api/v1/auth/login
{
  "identifier": "test123@example.com",
  "password": "Password123!"
}
```

**Login with Username:**
```http
POST /api/v1/auth/login
{
  "identifier": "testuser123", 
  "password": "Password123!"
}
```
**Response:** Returns user data and tokens

---

#### 3. Refresh Token
**File:** `refresh.http`

**Using Cookie (Recommended):**
```http
POST /api/v1/auth/refresh
```

**Using Body:**
```http
POST /api/v1/auth/refresh
{
  "refreshToken": "your_refresh_token_here"
}
```

---

#### 4. Logout
**File:** `logout.http`

**Using Cookie:**
```http
POST /api/v1/auth/logout
```

**Using Body:**
```http
POST /api/v1/auth/logout
{
  "refreshToken": "your_refresh_token_here"
}
```

---

#### 5. Get Current User
**File:** `me.http`
```http
GET /api/v1/auth/me
```
**Note:** Requires authentication (cookie atau Authorization header)

---

### ✉️ Email Verification

#### 6. Verify Email
**File:** `verify-email.http`

**Via POST (Body):**
```http
POST /api/v1/auth/verify-email
{
  "tokenId": "your_token_id_here",
  "token": "your_verification_token_here"
}
```

**Via GET (Link):**
```http
GET /api/v1/auth/verify-email?tokenId=xxx&token=xxx
```

---

### 🔑 Password Reset

#### 7. Request Password Reset
**File:** `password-reset.http`
```http
POST /api/v1/auth/request-password-reset
{
  "email": "test123@example.com"
}
```

#### 8. Reset Password
```http
POST /api/v1/auth/reset-password
{
  "tokenId": "your_reset_token_id_here",
  "token": "your_reset_token_here", 
  "newPassword": "NewPassword123!"
}
```

---

## 🔄 Complete Flow Testing

### Auto-Variable Flow
**File:** `verify-reset.http`

Jalankan secara berurutan untuk testing complete flow:
1. **Register** → Capture verification tokens
2. **Verify Email** → Uses captured tokens
3. **Request Reset** → Capture reset tokens  
4. **Reset Password** → Uses captured tokens

## 🎯 Testing Scenarios

### ✅ Success Cases
- Register dengan data valid
- Login dengan email/username
- Refresh token yang valid
- Verify email dengan token valid
- Reset password dengan token valid

### ❌ Error Cases
- Register dengan email/username yang sudah ada
- Login dengan credentials salah
- Refresh dengan token invalid/expired
- Verify dengan token invalid/expired
- Reset dengan token invalid/expired
- Access protected route tanpa auth

## 📊 Expected Status Codes

| Endpoint | Success | Error |
|----------|---------|--------|
| Register | 201 | 400 (validation), 409 (conflict) |
| Login | 200 | 400 (validation), 401 (unauthorized) |
| Refresh | 200 | 401 (unauthorized) |
| Logout | 200 | - (best effort) |
| Me | 200 | 401 (unauthorized) |
| Verify Email | 200 | 400 (invalid token) |
| Password Reset | 200 | 400 (invalid token) |

## 🍪 Cookie vs Header Authentication

### Cookie (Recommended)
- Otomatis diset setelah login/register
- Lebih aman untuk web applications
- Tidak perlu manual header

### Authorization Header
```http
Authorization: Bearer your_access_token_here
```

## 🛠️ Troubleshooting

### Common Issues:

1. **JSON Parse Error**
   - Hapus response handler scripts
   - Pastikan JSON format valid

2. **401 Unauthorized** 
   - Login terlebih dahulu
   - Check token expiry
   - Refresh token jika perlu

3. **400 Bad Request**
   - Check required fields
   - Validate data format

4. **Connection Refused**
   - Pastikan server running di port 3001
   - Check database connection

## 📝 Notes

- Tokens disimpan sebagai HTTP-only cookies
- Email verification diperlukan untuk beberapa fitur
- Password harus memenuhi kriteria keamanan
- Refresh token rotation diimplementasikan untuk keamanan
- Best-effort logout (tidak error jika token invalid)

## 🔍 Development Mode
Dalam development mode, verification dan reset tokens ditampilkan di response untuk kemudahan testing.

---
*Generated for Digital Library API v1*