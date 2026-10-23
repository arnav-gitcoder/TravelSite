import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  forgotAdminPassword,
  resetAdminPassword,
  verifyToken,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { validateAdminLogin, validateAdminRegister } from '../middleware/validation.js';
import { loginLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', validateAdminRegister, registerAdmin);
router.post('/login', loginLimiter, validateAdminLogin, loginAdmin);
router.post('/forgot-password', loginLimiter, forgotAdminPassword);
router.post('/reset-password', loginLimiter, resetAdminPassword);

router.get('/verify', protect, verifyToken);
router.get('/dashboard', protect, getDashboardStats);

export default router;
