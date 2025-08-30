# API Testing Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your API URL
# Make sure API_BASE_URL=http://localhost:3001/api/v1
```

### 2. Start the Server
```bash
# In project root directory
npm run dev
```

## 📋 Testing Authentication Flow

### Method 1: Automatic Variable Capture (VS Code REST Client)

1. **Open** `auth/verify-reset.http`
2. **Run Step 1** - Register user (this captures `verify_email`, `verify_tokenId`, `verify_token`)
3. **Check logs** - Look for ✅ success messages in VS Code output panel
4. **Run Step 2** - Verify email using captured tokens  
5. **Run Step 3** - Request password reset (captures `reset_tokenId`, `reset_token`)
6. **Run Step 4** - Reset password using captured tokens
7. **Run Step 5** - Test login with new password

### Method 2: Manual Copy-Paste (If variables don't work)

1. **Run "Manual 1"** - Register user
2. **Copy tokens** from response:
   ```json
   {
     "data": {
       "verification": {
         "tokenId": "cm1xxx",
         "token": "abc123..."
       },
       "user": {
         "email": "manual123@example.com"
       }
     }
   }
   ```
3. **Paste tokens** into "Manual 2" request
4. **Continue** with manual steps, copying tokens as needed

## 🔍 Debugging Variable Issues

### Check Variable Capture
Run the "Debug: Show all captured variables" request to see current values:
```http
### Debug: Show all captured variables  
GET {{baseUrl}}/auth/me
```

### Common Issues & Solutions

1. **Variables show as undefined**
   - ✅ Make sure `.env` file exists with correct `API_BASE_URL`
   - ✅ Server must be running on correct port
   - ✅ Check VS Code Output panel for debug logs
   - ✅ Use Manual method as fallback

2. **"User email not found" in logs**
   - ✅ Registration might have failed
   - ✅ Check if username/email already exists
   - ✅ Try with different `{{$randomInt}}` values

3. **"Reset tokens not included"**
   - ✅ Only works in development mode (`NODE_ENV !== 'production'`)
   - ✅ Email might not exist in database
   - ✅ Check server logs for errors

4. **SMTP/Email errors**
   - ✅ Emails are logged to console in development
   - ✅ No real emails sent unless SMTP is configured
   - ✅ Tokens are included in API response for testing

## 📁 File Structure

```
tests/api-requests/
├── .env                     # Your environment variables
├── .env.example            # Template for environment
├── environments.env        # VS Code REST Client environments
├── TESTING_GUIDE.md       # This file
├── auth/
│   ├── login.http         # Login/logout tests
│   ├── register.http      # Registration tests  
│   └── verify-reset.http  # Email verification & password reset
├── books/
├── users/
├── upload/
├── email/
└── ...
```

## 🛠️ VS Code REST Client Settings

For best results with variable capture:

1. **Install Extension**: "REST Client" by Huachao Mao
2. **Open Settings**: `Ctrl+,` → search "rest-client"
3. **Enable**: "Rest-client: Enable Telemetry"
4. **Set**: "Rest-client: Environment Select" to "Automatic"

## ⚡ Pro Tips

1. **Use Debug Logs**: Check VS Code Output panel → "REST Client" for detailed logs
2. **Sequential Testing**: Always run requests in order (Step 1 → 2 → 3 → 4)
3. **Fresh Emails**: Use `{{$randomInt}}` to generate unique emails
4. **Manual Fallback**: When variables fail, manual copy-paste always works
5. **Server Status**: Ensure your API server is running and accessible

## 🔐 Environment Variables

Required in `.env`:
```bash
API_BASE_URL=http://localhost:3001/api/v1
```

Optional for convenience:
```bash
ACCESS_TOKEN=your_jwt_here
TEST_EMAIL=test@example.com
TEST_PASSWORD=Password123!
```

## 📞 Troubleshooting

If you're still having issues:

1. **Check server logs** for any errors
2. **Verify API routes** are working: `GET http://localhost:3001/api/v1/`
3. **Test manual requests** first to ensure API is working
4. **Clear VS Code variables**: Restart VS Code to clear old variables
5. **Use curl/Postman** as alternative if REST Client issues persist

---

**🎉 Once working, you can test all other endpoints using the patterns in other `.http` files!**