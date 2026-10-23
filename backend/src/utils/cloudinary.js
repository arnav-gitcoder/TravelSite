import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import logger from './logger.js';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET &&
     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name');

/* ── Multer storage for packages ── */
const packageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travelhub/packages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

/* ── Multer storage for destinations ── */
const destinationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travelhub/destinations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

export const uploadPackageImages = multer({ storage: packageStorage, fileFilter, limits }).array('images', 5);
export const uploadDestinationImage = multer({ storage: destinationStorage, fileFilter, limits }).single('image');

/* ── Delete image from Cloudinary ── */
export const deleteCloudinaryImage = async (imageUrl) => {
  if (!isConfigured() || !imageUrl) return;
  try {
    // Extract public_id from URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted cloudinary image: ${publicId}`);
  } catch (err) {
    logger.error('Cloudinary delete error:', err.message);
  }
};

/* ── Upload from URL (for seeding) ── */
export const uploadFromUrl = async (url, folder = 'travelhub/misc') => {
  if (!isConfigured()) return url; // return original if not configured
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      transformation: [{ quality: 'auto' }],
    });
    return result.secure_url;
  } catch (err) {
    logger.warn(`Cloudinary upload from URL failed, using original: ${err.message}`);
    return url;
  }
};

export { cloudinary, isConfigured };
export default cloudinary;