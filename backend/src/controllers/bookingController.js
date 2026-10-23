import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import { packages as mockPackages } from '../data/mockData.js';
import logger from '../utils/logger.js';
import { sendBookingConfirmation, sendBookingAdminAlert } from '../utils/emailService.js';

const isDbConnected = () => Booking.db.readyState === 1;

export const createBooking = async (req, res, next) => {
  try {
    const {
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      numberOfTravelers,
      travelDate,
      specialRequests,
    } = req.body;

    // If DB not connected, find package from mock data
    let pkg;
    if (!isDbConnected()) {
      pkg = mockPackages.find((p) => p._id === packageId);
    } else {
      pkg = await Package.findById(packageId);
    }

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const totalPrice = pkg.price * numberOfTravelers;

    let booking;
    if (!isDbConnected()) {
      // In-memory booking (no persistence)
      booking = {
        _id: 'BOOK-' + Date.now(),
        packageId,
        packageTitle: pkg.title,
        customerName,
        customerEmail,
        customerPhone,
        numberOfTravelers,
        totalPrice,
        travelDate,
        specialRequests,
        status: 'pending',
        createdAt: new Date(),
      };
    } else {
      booking = await Booking.create({
        packageId,
        packageTitle: pkg.title,
        customerName,
        customerEmail,
        customerPhone,
        numberOfTravelers,
        totalPrice,
        travelDate,
        specialRequests,
      });
    }

    // Send emails (both fire-and-forget, won't break response)
    await Promise.allSettled([
      sendBookingConfirmation(booking),
      sendBookingAdminAlert(booking),
    ]);

    logger.info(`Booking created: ${booking._id}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! Check your email for confirmation.',
      data: booking,
    });
  } catch (error) {
    logger.error('Booking creation error:', error);
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, sortBy = '-createdAt', page = 1, limit = 20, all } = req.query;

    let query = {};
    if (status) query.status = status;

    const isPaginated = all !== 'true' && limit !== '0';
    let bookingsQuery = Booking.find(query).sort(sortBy);

    if (isPaginated) {
      const skip = (page - 1) * parseInt(limit);
      bookingsQuery = bookingsQuery.skip(skip).limit(parseInt(limit));
    }

    const bookings = await bookingsQuery;
    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: isPaginated ? Math.ceil(total / parseInt(limit)) : 1,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, message: 'Booking updated', data: booking });
  } catch (error) {
    next(error);
  }
};

export const getBookingStats = async (req, res, next) => {
  try {
    const [total, pending, confirmed, cancelled, revenueData] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        cancelled,
        totalRevenue: revenueData[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};