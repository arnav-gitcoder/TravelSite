import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validateBooking, validateGetById } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/security.js';

const router = express.Router();

// ⚠️ FIX: /stats MUST be before /:id or Express matches "stats" as an ObjectId
router.get('/stats', protect, getBookingStats);

// Public routes
router.post('/', apiLimiter, validateBooking, createBooking);
router.get('/:id', validateGetById, getBookingById);

// Protected routes (admin only)
router.get('/', protect, getAllBookings);
router.put('/:id', protect, validateGetById, updateBookingStatus);

export default router;