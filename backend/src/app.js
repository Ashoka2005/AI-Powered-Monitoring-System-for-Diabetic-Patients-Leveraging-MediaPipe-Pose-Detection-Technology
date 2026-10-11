require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const healthRoutes = require('./routes/health');
const appointmentRoutes = require('./routes/appointments');
const alertRoutes = require('./routes/alerts');
const dietRoutes = require('./routes/diet');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const iotRoutes = require('./routes/iot');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');

// Initialize app
const app = express();

// Initialize Database connection (handles Atlas and resilient in-memory fallback)
connectDB().catch((err) => console.error('[Database Init Error]:', err.message));

// Middleware
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration - Permissive for Vercel, Localhost, Mobile & LAN
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/plain' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Rate limiting (Relaxed for clinical monitoring)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoints (multiple aliases)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    success: true,
    message: 'DiaFit AI Backend is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Direct Android APK download route
app.get(['/diafit-ai.apk', '/download/apk'], (req, res) => {
  const apkPaths = [
    path.join(__dirname, '../../DiaFit-AI.apk'),
    path.join(__dirname, '../../frontend/dist/diafit-ai.apk'),
    path.join(__dirname, '../../frontend/public/diafit-ai.apk'),
    path.join(__dirname, '../../frontend/android/app/build/outputs/apk/debug/app-debug.apk'),
  ];
  const target = apkPaths.find((f) => fs.existsSync(f));
  if (target) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="DiaFit-AI.apk"');
    return res.sendFile(target);
  }
  return res.status(404).send('APK is currently building. Please wait a moment and refresh.');
});

// Mount Routes with both /api/v1 and /api prefixes for full Vercel rewrite compatibility
const mountRoute = (prefix, router) => {
  app.use(`/api/v1/${prefix}`, router);
  app.use(`/api/${prefix}`, router);
  app.use(`/${prefix}`, router);
};

mountRoute('auth', authRoutes);
mountRoute('users', userRoutes);
mountRoute('exercises', exerciseRoutes);
mountRoute('health', healthRoutes);
mountRoute('appointments', appointmentRoutes);
mountRoute('alerts', alertRoutes);
mountRoute('diet', dietRoutes);
mountRoute('chat', chatRoutes);
mountRoute('reports', reportRoutes);
mountRoute('analytics', analyticsRoutes);
mountRoute('iot', iotRoutes);
mountRoute('admin', adminRoutes);
mountRoute('doctor', doctorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Serve Frontend built assets & SPA Fallback for standalone local runs
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist) && !process.env.VERCEL) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

module.exports = app;
