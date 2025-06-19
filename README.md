# Elysia Backend API

Backend API 

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based with role management
- 🏢 **User Management** - Students, Employers, Admins
- 💼 **Job Management** - Post, search, and manage part-time jobs
- 📝 **Application System** - Apply and track job applications
- 🗄️ **PostgreSQL Database** - Pure SQL queries (no ORM)
- 📚 **API Documentation** - Swagger/OpenAPI
- 🐳 **Docker Support** - Development and production environments

## 🛠️ Tech Stack

- **Runtime**: Bun.js
- **Framework**: Elysia
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Documentation**: Swagger/OpenAPI
- **Database Client**: postgres.js (no ORM)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start with database
docker-compose -f docker-compose.dev.yml up --build

# API will be available at http://localhost:3001
# Swagger docs at http://localhost:3001/docs
```

### Option 2: Local Development

```bash
# Install dependencies and setup
bun run setup

# Start PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on port 5432

# Setup database
bun run db:setup

# Start development server
bun run dev
```

## 📝 Environment Variables

Copy `env.example` to `.env` and update values:

```bash
cp env.example .env
```

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` - Change in production!
- `FRONTEND_URL` - For CORS settings

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- `users` - User accounts (students, employers, admins)
- `student_profiles` - Extended student information
- `employer_profiles` - Company/employer information  
- `jobs` - Job postings
- `applications` - Job applications

### Sample Users

After running `bun run db:setup`, you'll have these test accounts:

**Admin:**
- Email: `admin@rmu.ac.th`
- Password: `admin123`

**Students:**
- Email: `student1@rmu.ac.th` / Password: `student123`
- Email: `student2@rmu.ac.th` / Password: `student123`

**Employers:**
- Email: `employer1@company.com` / Password: `employer123`
- Email: `employer2@business.com` / Password: `employer123`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employers only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application status

## 🧪 Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@rmu.ac.th","password":"student123"}'

# Get current user (with token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List jobs
curl -X GET http://localhost:3001/api/jobs
```

### Using the Swagger UI

Visit `http://localhost:3001/docs` for interactive API documentation.

## 🗄️ Database Commands

```bash
# Setup database with sample data
bun run db:setup

# Reset database (drop and recreate)
bun run db:reset

# Connect to database manually
psql -h localhost -U postgres -d rmu_parttime
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Database operations
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   ├── config/         # Configuration files
│   └── index.ts        # Main application file
├── database/
│   └── schema.sql      # Database schema
├── scripts/
│   ├── setup.sh        # Setup script
│   └── db-setup.sql    # Database setup with sample data
└── README.md
```

## 🔧 Development Scripts

```bash
bun run dev         # Start development server with hot reload
bun run start       # Start production server
bun run setup       # Initial project setup
bun run db:setup    # Setup database with sample data
bun run db:reset    # Reset database
```

## 🐳 Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Account Locking**: Automatic lockout after failed attempts
- **Role-based Access**: Student/Employer/Admin roles
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Configurable origins

## 📊 Database Security

- Uses parameterized queries with postgres.js
- No ORM to reduce attack surface
- Proper indexing for performance
- Foreign key constraints for data integrity
- Enum types for controlled values

## 🚀 Deployment

See `docker-compose.prod.yml` for production deployment configuration.

Remember to:
1. Change `JWT_SECRET` to a strong value
2. Use proper database credentials
3. Enable SSL in production
4. Set up proper logging
5. Configure reverse proxy (nginx)

## 📄 License

This project is licensed under the MIT License.