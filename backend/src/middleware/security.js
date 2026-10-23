import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import compression from 'compression';
import logger from '../utils/logger.js';

// Helmet - Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// Rate limiting - General API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many requests' });
  },
});

// Rate limiting - Login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts',
});

// Rate limiting - Price calculation (expensive operation)
export const priceCalcLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many price calculations',
});

// XSS Protection
export const xssProtection = xss();

// Compression
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
});

// Request logging
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
};

// Error logging
export const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next(err);
};

export default {
  securityHeaders,
  apiLimiter,
  loginLimiter,
  priceCalcLimiter,
  xssProtection,
  compressionMiddleware,
  requestLogger,
  errorLogger,
};
