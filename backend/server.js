const dotenv = require('dotenv');

// Load environment variables immediately at top of file
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Catch Uncaught Exceptions globally to prevent ECONNRESET socket drop
process.on('uncaughtException', (err) => {
  console.error('💥 [Global Uncaught Exception]:', err.message, err.stack);
});

// Catch Unhandled Promise Rejections globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Global Unhandled Rejection]:', reason);
});

// Initialize Express App
const app = express();

// 1. Body Parsers (Must be registered before routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Security & CORS Middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global Request Logger Middleware
app.use((req, res, next) => {
  console.log(`📡 [HTTP ${req.method}] ${req.url} - IP: ${req.ip}`);
  next();
});

// ----------------------------------------------------
// ROOT & HEALTH ROUTES
// ----------------------------------------------------

// GET / -> Root API Status
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ACES Club Management Portal Backend API is running successfully.',
    version: '1.0.0',
    status: 'Healthy'
  });
});

// GET /health -> Health Check Endpoint
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    database: isConnected ? 'Connected' : 'Disconnected',
    server: 'Running'
  });
});

// GET /api/health -> API Health Check Alias
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    database: isConnected ? 'Connected' : 'Disconnected',
    server: 'Running',
    timestamp: new Date()
  });
});

// ----------------------------------------------------
// API MODULE ROUTES
// ----------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/profile', require('./routes/adminProfileRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/positions', require('./routes/positionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// ----------------------------------------------------
// 404 UNKNOWN ROUTE HANDLER (Must be after all routes)
// ----------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// ----------------------------------------------------
// CENTRALIZED ERROR HANDLER (Must be last middleware)
// ----------------------------------------------------
app.use(errorHandler);

// Helper function to print registered routes in console
const printRegisteredRoutes = () => {
  console.log('\n====================================================');
  console.log('📌 REGISTERED BACKEND API ROUTES:');
  console.log('====================================================');
  console.log('GET  /             -> Root Welcome Message');
  console.log('GET  /health       -> Server & DB Health Status');
  console.log('GET  /api/health   -> API Health Check');
  console.log('ANY  /api/auth/*   -> Authentication Routes');
  console.log('ANY  /api/users/*  -> Member Management Routes');
  console.log('ANY  /api/teams/*  -> Team Management Routes');
  console.log('ANY  /api/positions/* -> Club Positions Routes');
  console.log('ANY  /api/attendance/* -> QR Attendance Routes');
  console.log('ANY  /api/events/*  -> Event Routes');
  console.log('ANY  /api/gallery/* -> Gallery Routes');
  console.log('ANY  /api/notifications/* -> Notifications Routes');
  console.log('ANY  /api/certificates/* -> Certificate Routes');
  console.log('ANY  /api/analytics/* -> Analytics & Audit Log Routes');
  console.log('====================================================\n');
};

const PORT = process.env.PORT || 5000;

// Start Server ONLY after MongoDB Atlas connects successfully
const startServer = async () => {
  try {
    // 1. Await database connection before listening for HTTP requests
    await connectDB();
    
    // 2. Audit and ensure all user accounts are active in MongoDB Atlas
    const activateAllUsers = require('./config/activateAllUsers');
    await activateAllUsers();

    // 3. Start HTTP listener
    app.listen(PORT, () => {
      console.log(`✅ Server Running on Port ${PORT}`);
      printRegisteredRoutes();
    });
  } catch (error) {
    console.error('❌ Failed to start server due to MongoDB connection error:', error.message);
    console.log('⚠️ Server startup aborted. Fix your MongoDB Atlas URI or network access and try again.');
  }
};

startServer();
