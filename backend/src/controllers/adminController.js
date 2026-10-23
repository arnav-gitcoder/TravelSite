import Admin from '../models/Admin.js';
import { getToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '../utils/otp.js';

const isDbConnected = () => {
  try { return Admin.db.readyState === 1; } catch { return false; }
};


export const registerAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, and name' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Please configure MongoDB URI.' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with that email already exists' });
    }

    const admin = await Admin.create({ email, password, name, role: 'admin' });
    const token = getToken(admin._id);

    logger.info(`Admin registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: { id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Please configure MongoDB URI.' });
    }
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await admin.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = getToken(admin._id);
    logger.info(`Admin login: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotAdminPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Please configure MongoDB URI.' });
    }

    const emailLower = email.toLowerCase();
    const admin = await Admin.findOne({ email: emailLower });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No admin account found with this email' });
    }

    const otp = generateOTP();
    storeOTP(emailLower, { otp, type: 'admin-reset', email: emailLower });
    await sendOTPEmail(emailLower, admin.name || 'Admin', otp);

    logger.info(`Admin password reset OTP sent to: ${emailLower}`);
    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (error) {
    next(error);
  }
};

export const resetAdminPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Please configure MongoDB URI.' });
    }

    const emailLower = email.toLowerCase();
    const result = verifyOTP(emailLower, otp);

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    if (result.data?.type !== 'admin-reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset code. Please request a new code.' });
    }

    const admin = await Admin.findOne({ email: emailLower }).select('+password');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    admin.password = newPassword;
    await admin.save();

    logger.info(`Admin password reset for: ${emailLower}`);
    res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({
      success: true,
      user: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [Package, Booking, CustomPackage] = await Promise.all([
      import('../models/Package.js').then((m) => m.default),
      import('../models/Booking.js').then((m) => m.default),
      import('../models/CustomPackage.js').then((m) => m.default),
    ]);

    const [
      totalPackages,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalCustomPackages,
      pendingCustomPackages,
      revenueData,
    ] = await Promise.all([
      Package.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      CustomPackage.countDocuments(),
      CustomPackage.countDocuments({ status: 'submitted' }),
      Booking.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPackages,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalCustomPackages,
        pendingCustomPackages,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
