import express from 'express';
import { registerUser, verifyOTPAndRegister, loginUser, resendOTP, getMe, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',         registerUser);
router.post('/verify-otp',       verifyOTPAndRegister);
router.post('/resend-otp',       resendOTP);
router.post('/login',            loginUser);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.get('/me',  protect,      getMe);

export default router;