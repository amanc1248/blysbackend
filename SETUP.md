# Backend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## PostgreSQL Installation & Setup

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database
createdb taskmanager

# Access PostgreSQL shell (optional)
psql taskmanager
```

### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database
createdb taskmanager

# Create user (optional)
createuser --interactive --pwprompt
```

### Windows

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Open pgAdmin or use command line to create database:

```sql
CREATE DATABASE taskmanager;
```

## Backend Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development

# Option 1: Using DATABASE_URL (recommended for deployment)
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager

# Option 2: Using individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cookie Configuration
COOKIE_SECURE=false
```

**Important**: 
- Replace `your_postgres_username` and `your_postgres_password` with your actual PostgreSQL credentials
- Generate a strong JWT_SECRET (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 3. Run Database Migrations

```bash
npm run migrate
```

This will create the `users` and `tasks` tables with proper indexes.

Expected output:
```
🔄 Connecting to database...
✅ Connected successfully

📄 Running migration: 001_create_users_table.sql
✅ Migration completed: 001_create_users_table.sql

📄 Running migration: 002_create_tasks_table.sql
✅ Migration completed: 002_create_tasks_table.sql

🎉 All migrations completed successfully!
```

### 4. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Expected output:
```
✅ Database connection established successfully.
✅ Database models synchronized

🚀 Server running on port 5000
📍 Environment: development
🔗 API Base URL: http://localhost:5000/api

📚 Available endpoints:
   POST   /api/auth/register
   POST   /api/auth/login
   POST   /api/auth/logout
   GET    /api/auth/me
   GET    /api/tasks
   POST   /api/tasks
   GET    /api/tasks/:id
   PUT    /api/tasks/:id
   DELETE /api/tasks/:id

✨ Ready to accept requests!
```

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "priority": "high",
    "endDate": "2025-11-20"
  }'
```

### 5. Get All Tasks

```bash
curl http://localhost:5000/api/tasks?page=1&limit=10&sortBy=end_date&order=asc \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Connection Error: "ECONNREFUSED"

- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if port 5432 is accessible: `lsof -i :5432`

### Authentication Error: "password authentication failed"

- Verify your database credentials in `.env`
- Try connecting manually: `psql -U username -d taskmanager`

### Migration Error: "relation already exists"

- Tables already exist, you can skip migrations
- Or drop and recreate: `DROP TABLE tasks; DROP TABLE users;` then re-run migrations

### JWT Error: "jwt must be provided"

- Make sure you're sending the token in the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`

## Database Schema

### Users Table
```sql
id SERIAL PRIMARY KEY
name VARCHAR(100) NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL (bcrypt hashed)
created_at TIMESTAMP DEFAULT NOW()
```

### Tasks Table
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
title VARCHAR(255) NOT NULL
description TEXT
priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high'))
end_date DATE NOT NULL
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

## Next Steps

Once the backend is running successfully:
1. Test all API endpoints with Postman or curl
2. Proceed to frontend setup
3. Configure CORS for frontend URL

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check database connection with: `psql -d taskmanager`

