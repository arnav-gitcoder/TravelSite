import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const validateDestination = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('country').optional().trim(),
  body('economyPerNight').optional().isInt({ min: 0 }),
  body('standardPerNight').optional().isInt({ min: 0 }),
  body('luxuryPerNight').optional().isInt({ min: 0 }),
  body('transportCharge').optional().isInt({ min: 0 }),
  body('activitiesCharge').optional().isInt({ min: 0 }),
  body('category').optional().isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Honeymoon', 'Family']),
  handleValidationErrors,
];

export const validateBooking = [
  body('packageId').notEmpty(),
  body('customerName').notEmpty().trim().isLength({ min: 2 }),
  body('customerEmail').isEmail().normalizeEmail(),
  body('customerPhone').notEmpty().trim(),
  body('numberOfTravelers').isInt({ min: 1, max: 100 }),
  body('travelDate').isISO8601(),
  handleValidationErrors,
];

export const validateAdminLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  handleValidationErrors,
];

export const validateAdminRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  handleValidationErrors,
];

export const validateContact = [
  body('name').notEmpty().trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('message').notEmpty().trim().isLength({ min: 10 }),
  handleValidationErrors,
];

export const validateGetById = [
  param('id').isMongoId(),
  handleValidationErrors,
];

export const validatePriceCalculation = [
  body('destinationIds').isArray({ min: 1 }),
  body('days').isArray(),
  body('startDate').isISO8601(),
  handleValidationErrors,
];