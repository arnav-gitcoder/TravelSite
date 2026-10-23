import express from 'express';
import { body, validationResult } from 'express-validator';
import { apiLimiter } from '../middleware/security.js';
import { sendContactNotification } from '../utils/emailService.js';
import logger from '../utils/logger.js';

const router = express.Router();

const validateContact = [
  body('name').notEmpty().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').notEmpty().trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

router.post('/', apiLimiter, validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { name, email, phone, message } = req.body;
    logger.info(`Contact form submitted by ${email}`);
    await sendContactNotification({ name, email, phone, message });

    res.status(200).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.',
    });
  } catch (error) {
    logger.error('Contact form error:', error);
    // Still return success — email failure shouldn't block the user
    res.status(200).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.',
    });
  }
});

export default router;