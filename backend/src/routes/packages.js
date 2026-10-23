import express from 'express';
import {
  getAllPackages, getPackageById, createPackage,
  updatePackage, deletePackage, getPackagesByCategory, getFeaturedPackages,
} from '../controllers/packageController.js';
import { protect } from '../middleware/auth.js';
import { handlePackageImageUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllPackages);
router.get('/featured', getFeaturedPackages);
router.get('/category/:category', getPackagesByCategory);
router.get('/:id', getPackageById);

// Image upload middleware runs before controller
router.post('/',    protect, handlePackageImageUpload, createPackage);
router.put('/:id',  protect, handlePackageImageUpload, updatePackage);
router.delete('/:id', protect, deletePackage);

export default router;