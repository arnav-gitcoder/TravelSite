import User from '../models/User.js';
import bcryptjs from 'bcryptjs';
import { getToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '../utils/otp.js';

const isDbConnected = () => {
  try { return User.db.readyState === 1; } catch { return false; }
};

const memUsers = new Map();

/* ─── Step 1: Register → send OTP ─── */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const emailLower = email.toLowerCase();

    // Check duplicate
    if (isDbConnected()) {
      const exists = await User.findOne({ email: emailLower });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    } else {
      if ([...memUsers.values()].find(u => u.email === emailLower))
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password + store pending OTP
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);
    const otp = generateOTP();
    storeOTP(emailLower, { otp, name, email: emailLower, phone, passwordHash });

    // Send OTP (fire-and-forget)
    sendOTPEmail(emailLower, name, otp);

    logger.info(`OTP sent for registration: ${emailLower}`);
    res.status(200).json({ success: true, message: 'OTP sent to your email. Please verify to complete registration.', email: emailLower });
  } catch (err) { next(err); }
};

/* ─── Step 2: Verify OTP → create account ─── */
export const verifyOTPAndRegister = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const result = verifyOTP(email, otp);
    if (!result.valid)
      return res.status(400).json({ success: false, message: result.message });

    const { name, email: emailLower, phone, passwordHash } = result.data;

    let userId, userName, userEmail;

    if (isDbConnected()) {
      const user = await User.create({ name, email: emailLower, phone, password: passwordHash });
      // password already hashed — skip pre-save hook
      await User.findByIdAndUpdate(user._id, { password: passwordHash });
      userId = user._id; userName = user.name; userEmail = user.email;
    } else {
      userId = 'user-' + Date.now();
      const user = { _id: userId, name, email: emailLower, phone, password: passwordHash, role: 'customer' };
      memUsers.set(userId, user);
      userId = user._id; userName = user.name; userEmail = user.email;
    }

    const token = getToken(userId);
    logger.info(`User registered after OTP: ${emailLower}`);
    res.status(201).json({ success: true, token, user: { id: userId, name: userName, email: userEmail, role: 'customer' } });
  } catch (err) { next(err); }
};

/* ─── Login ─── */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    if (!isDbConnected()) {
      const user = [...memUsers.values()].find(u => u.email === email.toLowerCase());
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      const match = await bcryptjs.compare(password, user.password || '');
      if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      return res.json({ success: true, token: getToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: 'customer' } });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();
    res.json({ success: true, token: getToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: 'customer' } });
  } catch (err) { next(err); }
};

/* ─── Resend OTP ─── */
export const resendOTP = async (req, res) => {
  const { email, name, type } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  const otp = generateOTP();

  if (type === 'reset') {
    // Password-reset resend — preserve reset context
    storeOTP(email, { otp, type: 'reset', email: email.toLowerCase() });
  } else {
    // Registration resend — preserve existing pending data if available
    storeOTP(email, { otp, name: name || 'Traveler', email, phone: '', passwordHash: '' });
  }

  await sendOTPEmail(email, name || 'Traveler', otp);
  res.json({ success: true, message: 'OTP resent successfully' });
};

/* ─── Get me ─── */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!isDbConnected()) {
      const user = memUsers.get(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: 'customer' } });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: 'customer' } });
  } catch (err) { next(err); }
};

/* ─── Forgot Password → send reset OTP ─── */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const emailLower = email.toLowerCase();
    let userName = 'Traveler';

    if (isDbConnected()) {
      const user = await User.findOne({ email: emailLower });
      if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
      userName = user.name || 'Traveler';
    } else {
      const user = [...memUsers.values()].find(u => u.email === emailLower);
      if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
      userName = user.name || 'Traveler';
    }

    const otp = generateOTP();
    storeOTP(emailLower, { otp, type: 'reset', email: emailLower });
    sendOTPEmail(emailLower, userName, otp);

    logger.info(`Password reset OTP sent to: ${emailLower}`);
    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (err) { next(err); }
};

/* ─── Reset Password ─── */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const emailLower = email.toLowerCase();
    const result = verifyOTP(emailLower, otp);
    if (!result.valid)
      return res.status(400).json({ success: false, message: result.message });
    if (result.data?.type !== 'reset')
      return res.status(400).json({ success: false, message: 'Invalid reset code. Please request a new code.' });

    if (isDbConnected()) {
      const user = await User.findOne({ email: emailLower }).select('+password');
      if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
      user.password = newPassword;
      await user.save();
    } else {
      const user = [...memUsers.values()].find(u => u.email === emailLower);
      if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(newPassword, salt);
    }

    logger.info(`Password reset for: ${emailLower}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};
