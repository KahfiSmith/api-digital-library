# API Digital Library

Backend API untuk sistem perpustakaan digital menggunakan Node.js dan TypeScript.

## Tech Stack

### Runtime & Language
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **pnpm** - Package manager

### Framework & Core Libraries
- **Express.js** - Web framework untuk Node.js
- **express-async-errors** - Error handling untuk async/await

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

### Development Tools
- **tsx** - TypeScript execution
- **rimraf** - Cross-platform rm -rf
- **@types/node** - Node.js type definitions

## Project Structure

```
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware (singular)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── database/       # Database configuration
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── helpers/       # Test helpers
├── logs/              # Application logs
├── uploads/           # File uploads
└── docs/             # Documentation
```

## Features

- **RESTful API** dengan Express.js
- **Type Safety** dengan TypeScript
- **Authentication** menggunakan JWT
- **Password Hashing** dengan bcrypt
- **File Upload** support
- **Request Validation** dengan Joi dan express-validator
- **Rate Limiting** untuk API protection
- **Comprehensive Logging** dengan Winston dan Morgan
- **Security Headers** dengan Helmet
- **CORS Support**
- **Response Compression**

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- pnpm (package manager)
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Api-Digital-Library
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Setup Database**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   # Start PostgreSQL with Docker Compose
   pnpm run docker:run
   
   # Check logs
   pnpm run docker:logs
   ```

   **Option B: Manual Setup**
   ```bash
   # Create PostgreSQL database
   createdb digital_library
   
   # Generate Prisma client
   pnpm run db:generate
   
   # Run migrations and seed
   pnpm run db:migrate
   pnpm run db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Build for production**
   ```bash
   pnpm run build
   pnpm start
   ```

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server with hot reload
pnpm run build        # Build for production
pnpm start            # Start production server
pnpm run start:prod   # Start with production environment

# Code Quality
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Fix ESLint errors
pnpm run typecheck    # Run TypeScript type checking

# Database (Prisma)
pnpm run db:generate       # Generate Prisma client
pnpm run db:push           # Push schema to database (dev)
pnpm run db:migrate        # Create and run migration
pnpm run db:migrate:prod   # Deploy migrations (production)
pnpm run db:seed           # Run database seeds
pnpm run db:studio         # Open Prisma Studio
pnpm run db:reset          # Reset database

# Docker
pnpm run docker:build  # Build Docker image
pnpm run docker:run    # Start with Docker Compose
pnpm run docker:stop   # Stop Docker containers
pnpm run docker:logs   # View container logs

# Utilities
pnpm run clean         # Clean dist and logs
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./public/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Book Endpoints
- `GET /api/books` - Get all books (with pagination, search, filter)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (admin/librarian only)
- `PUT /api/books/:id` - Update book (admin/librarian only)
- `DELETE /api/books/:id` - Delete book (admin only)

### User Endpoints
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id/loans` - Get user's book loans
- `GET /api/users/:id/reviews` - Get user's reviews

### Loan Endpoints
- `POST /api/loans` - Borrow a book
- `PUT /api/loans/:id/return` - Return a book
- `GET /api/loans` - Get all loans (admin/librarian only)

### Review Endpoints
- `POST /api/reviews` - Create book review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/books/:id/reviews` - Get book reviews

## Security Features

- JWT-based authentication
- Password hashing dengan bcrypt
- Request rate limiting
- Input validation dan sanitization
- Security headers dengan Helmet
- CORS configuration
