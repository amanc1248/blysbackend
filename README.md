# Blys Task Manager - Backend API

Production-ready REST API built with Node.js, Express, and PostgreSQL for the Blys Task Manager application.

## 🚀 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken) with bcrypt
- **Validation**: express-validator
- **Security**: CORS, cookie-parser, httpOnly cookies

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── taskController.js     # Task CRUD operations
├── middleware/
│   └── authMiddleware.js     # JWT verification
├── models/
│   ├── User.js              # User model
│   ├── Task.js              # Task model
│   └── index.js             # Model associations
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── taskRoutes.js        # Task endpoints
├── utils/
│   └── validation.js        # Input validation rules
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_tasks_table.sql
│   └── runMigrations.js
├── server.js                # App entry point
├── package.json
└── .env.example
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

**macOS/Linux:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Create database
createdb taskmanager
```

**Windows:**
```bash
# Open pgAdmin or psql
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

### 3. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (choose one option)
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

```bash
npm run migrate
```

Expected output:
```
✅ Connected successfully
📄 Running migration: 001_create_users_table.sql
✅ Migration completed
📄 Running migration: 002_create_tasks_table.sql
✅ Migration completed
🎉 All migrations completed successfully!
```

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user tasks (paginated) | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Query Parameters for GET /api/tasks

```
?page=1              # Page number (default: 1)
?limit=10            # Items per page (default: 10, max: 100)
?sortBy=end_date     # Sort field: end_date, priority, created_at
?order=asc           # Sort order: asc, desc
```

## 📝 API Request Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Complete documentation",
    "description": "Write API docs",
    "priority": "high",
    "endDate": "2025-12-31"
  }'
```

### Get Tasks with Pagination

```bash
curl http://localhost:5000/api/tasks?page=1&limit=10&sortBy=end_date&order=asc \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗄️ Database Schema

### Users Table
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
email       VARCHAR(255) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL (bcrypt hashed)
created_at  TIMESTAMP DEFAULT NOW()
```

### Tasks Table
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE
title       VARCHAR(255) NOT NULL
description TEXT
priority    VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high'))
end_date    DATE NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
```

### Indexes
- `users.email` - For fast login queries
- `tasks.user_id` - For user's task queries
- `tasks.end_date` - For sorting by due date
- `tasks.priority` - For sorting by priority

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **HTTP-only Cookies**: Prevents XSS attacks
- **Password Hashing**: bcrypt with 10 salt rounds
- **Input Validation**: express-validator on all endpoints
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **CORS**: Configured for frontend domain only
- **Task Ownership**: Users can only access their own tasks

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Database Connection Error

```
❌ Unable to connect to the database
```

**Solutions:**
- Check if PostgreSQL is running: `brew services list` (macOS)
- Verify DATABASE_URL in `.env`
- Test connection: `psql -d taskmanager`

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solutions:**
- Change PORT in `.env`
- Kill process: `lsof -ti:5000 | xargs kill`

### Migration Errors

```
❌ Migration failed: relation already exists
```

**Solutions:**
- Tables already exist, skip migrations
- Or drop tables: `psql -d taskmanager -c "DROP TABLE tasks; DROP TABLE users;"`
- Then re-run: `npm run migrate`

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_secret
JWT_EXPIRE=7d
COOKIE_SECURE=true
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms

- **Render**: Auto-deploy from GitHub
- **Railway**: One-click PostgreSQL + Node.js
- **Heroku**: Add Heroku Postgres addon

## 📦 Dependencies

### Core Dependencies
- `express` - Web framework
- `sequelize` - ORM for PostgreSQL
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cookie-parser` - Cookie handling
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `express-validator` - Input validation

### Dev Dependencies
- `nodemon` - Development auto-reload

## 📄 License

MIT License - Built for Blys Job Application

## 👤 Aman

Built with ❤️ for Blys

