import express from 'express';
import {
  createCustomPackage,
  updateCustomPackage,
  getCustomPackage,
  getAllCustomPackages,
  submitCustomPackage,
  deleteCustomPackage,
} from '../controllers/customPackageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/', createCustomPackage);
router.get('/:id', getCustomPackage);
router.put('/:id', updateCustomPackage);
router.post('/:id/submit', submitCustomPackage);

// Admin only
router.get('/', protect, getAllCustomPackages);
router.patch('/:id/status', protect, updateCustomPackage);
router.delete('/:id', protect, deleteCustomPackage);

export default router;