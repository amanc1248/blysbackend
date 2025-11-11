-- Migration: Create users table
-- Run this migration first before tasks table

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores authenticated user information';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password (never stored in plain text)';

