import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: 'Too many API requests, please try again later',
});

export const bookingLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // Max 50 bookings per day
  skipSuccessfulRequests: false,
  message: 'Booking limit exceeded, please try again tomorrow',
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 contact submissions per hour
  message: 'Too many contact submissions, please try again later',
});

export const priceCalculationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 price calculations per minute
  message: 'Too many price calculations, please try again later',
});
