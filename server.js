const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

/**
 * Middleware Configuration
 */

// CORS configuration - allows frontend to communicate with backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
    credentials: true // Allow cookies to be sent
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (required for JWT in httpOnly cookies)
app.use(cookieParser());

/**
 * Routes
 */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

/**
 * Server Initialization
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Sync database models (creates tables if they don't exist)
    // Note: In production, use migrations instead of sync
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\n📚 Available endpoints:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   POST   /api/auth/logout`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   GET    /api/tasks`);
      console.log(`   POST   /api/tasks`);
      console.log(`   GET    /api/tasks/:id`);
      console.log(`   PUT    /api/tasks/:id`);
      console.log(`   DELETE /api/tasks/:id`);
      console.log(`\n✨ Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app;

