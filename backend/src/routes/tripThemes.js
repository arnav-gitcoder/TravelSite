import express from 'express';
import {
  getAllTripThemes,
  getTripThemeById,
  createTripTheme,
} from '../controllers/tripThemeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllTripThemes);
router.get('/:id', getTripThemeById);
router.post('/', protect, createTripTheme);

export default router;
