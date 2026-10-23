import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import {
  securityHeaders,
  apiLimiter,
  xssProtection,
  compressionMiddleware,
  requestLogger,
  errorLogger,
} from './middleware/security.js';
import logger from './utils/logger.js';

// Route imports
import packageRoutes from './routes/packages.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import contactRoutes from './routes/contact.js';
import customPackageRoutes from './routes/customPackages.js';
import destinationRoutes from './routes/destinations.js';
import tripThemeRoutes from './routes/tripThemes.js';

dotenv.config();

const app = express();
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].concat((process.env.ALLOWED_ORIGINS || '').split(','))
  .map(origin => origin ? origin.trim() : '')
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ========== SECURITY MIDDLEWARE ==========
app.use(securityHeaders);
app.use(xssProtection);
app.use(compressionMiddleware);

// ========== LOGGING MIDDLEWARE ==========
app.use(requestLogger);

// ========== CORE MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ========== RATE LIMITING ==========
app.use('/api/', apiLimiter);

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ========== API ROUTES ==========
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/custom-packages', customPackageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trip-themes', tripThemeRoutes);

// ========== 404 HANDLER ==========
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ========== ERROR HANDLING ==========
app.use(errorLogger);
app.use(errorHandler);

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Travel Website Backend Server    ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   Status: ✅ Running & Secure          ║
╚════════════════════════════════════════╝
  `);
  logger.info(`Server started on port ${PORT}`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

export default app;