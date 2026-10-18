const express = require('express');
const cors = require('cors');
const multer = require('multer');
const config = require('./src/config');
const matlabRunner = require('./src/matlabRunner');

const healthRoutes = require('./src/routes/health');
const recordsRoutes = require('./src/routes/records');
const analysesRoutes = require('./src/routes/analyses');

const app = express();

// Initialize backend directories, orphaned job recovery, and background MATLAB detection
matlabRunner.init();

// CORS configuration - allow FRONTEND_ORIGIN as well as localhost/127.0.0.1/local LAN IPs
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Explicitly configured origin
      if (origin === config.frontendOrigin) {
        return callback(null, true);
      }

      // Allow any localhost, 127.0.0.1, or local LAN IP on any port
      const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
      if (isLocalOrLan) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint for status check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bearing Condition Monitoring Backend API is running',
    endpoints: {
      health: '/api/health',
      records: '/api/records',
      analyses: '/api/analyses'
    }
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api', recordsRoutes);
app.use('/api', analysesRoutes);

// Catch-all 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized JSON Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);

  // Handle Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File exceeds maximum allowed upload size of ${config.maxUploadMb} MB`
      });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  // Handle standard errors
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`Allowed frontend origin: ${config.frontendOrigin}`);
});