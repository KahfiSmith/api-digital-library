# API Testing Setup

## 📋 Requirements

### VS Code Extension
Install **REST Client** extension by Huachao Mao:
```
Name: REST Client
Id: humao.rest-client
Description: REST Client for Visual Studio Code
Publisher: Huachao Mao
```

**Installation:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "REST Client"
4. Install the extension by Huachao Mao

## 📁 Folder Structure

```
tests/api-requests/
├── README.md                 # This file
├── environments.env          # Environment configurations
├── auth/
│   ├── login.http           # Login endpoints
│   ├── register.http        # Registration endpoints
│   └── refresh.http         # Token refresh
├── books/
│   ├── books-crud.http      # Book CRUD operations
│   ├── books-search.http    # Search functionality
│   └── books-categories.http # Category filtering
├── users/
│   ├── profile.http         # User profile management
│   ├── user-lists.http      # Favorites, wishlist, reading
│   └── user-admin.http      # Admin user management
├── categories/
│   └── categories.http      # Category management
├── loans/
│   ├── loan-operations.http # Borrow, return books
│   └── loan-admin.http      # Admin loan management
├── reviews/
│   └── reviews.http         # Book reviews
├── admin/
│   ├── admin-dashboard.http # Admin endpoints
│   └── system-health.http   # Health checks
└── quick-tests.http         # Quick testing scenarios
```

## 🚀 Usage

1. **Start your API server**
   ```bash
   npm run dev
   ```

2. **Select Environment**
   - Open any `.http` file
   - Click on environment selector in bottom-right
   - Choose: `dev`, `prod`, `docker`, or `test`

3. **Run Requests**
   - Click "Send Request" above any request block
   - Use Ctrl+Alt+R (Windows) or Cmd+Alt+R (Mac)

## 🔑 Authentication Flow

1. First login using `auth/login.http`
2. Copy the `accessToken` from response
3. Use token in other authenticated requests

## 📝 Environment Variables

Available in `environments.env`:
- `baseUrl` - API base URL
- `adminEmail`, `adminPassword` - Admin credentials
- `userEmail`, `userPassword` - User credentials
- `librarianEmail`, `librarianPassword` - Librarian credentials

## 🧪 Test Data

From seed data (`prisma/seed.ts`):
- **Admin**: admin@digitallibrary.com / password123
- **Librarian**: librarian@digitallibrary.com / password123  
- **User 1**: john.doe@example.com / password123
- **User 2**: alice@example.com / password123