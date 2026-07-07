const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Import services for automatic startup database seeding
const authService = require('./services/authService');
const slideService = require('./services/slideService');
const productService = require('./services/productService');
const galleryService = require('./services/galleryService');
const settingService = require('./services/settingService');

const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();

// Ensure uploads directory exists on boot
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Standard Request Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Log request information in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Import & Mount Route Hub
const apiRouter = require('./routes/api');
app.use('/api/v1', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'House of Shah Admin Backend is fully functional',
    timestamp: new Date().toISOString(),
  });
});

// Fallback 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  console.error(`[Unhandled Exception Error] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: 'An unexpected application error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start Server & Connect Database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Perform Startup Database Seeding Checks
    console.log('[Seeding] Checking database health and seeding default templates...');
    await authService.seedAdmin();
    await slideService.seedSlides();
    await productService.seedProducts();
    await galleryService.seedGallery();
    await settingService.seedSettings();
    console.log('[Seeding] Database startup seeding verification finished.');

    // 3. Start Listening for connections
    app.listen(PORT, () => {
      console.log(`===========================================================`);
      console.log(`[Server Started] Port: ${PORT}`);
      console.log(`[Environment]    Mode: ${process.env.NODE_ENV}`);
      console.log(`[API Live]       Health check: http://localhost:${PORT}/health`);
      console.log(`===========================================================`);
    });
  } catch (error) {
    console.error(`[Fatal Startup Error] Failed to bootstrap application: ${error.message}`);
    process.exit(1);
  }
};

startServer();
