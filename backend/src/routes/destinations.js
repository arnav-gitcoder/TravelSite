import express from 'express';
import {
  getAllDestinations, getDestinationById, getDestinationsByCategory,
  createDestination, updateDestination, deleteDestination, calculatePriceRange,
} from '../controllers/destinationController.js';
import { protect } from '../middleware/auth.js';
import { handleDestinationImageUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllDestinations);
router.get('/category/:category', getDestinationsByCategory);
router.get('/:id', getDestinationById);
router.post('/calculate-price', calculatePriceRange);

router.post('/',    protect, handleDestinationImageUpload, createDestination);
router.put('/:id',  protect, handleDestinationImageUpload, updateDestination);
router.delete('/:id', protect, deleteDestination);

export default router;