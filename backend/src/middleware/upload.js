import multer from 'multer';
import logger from '../utils/logger.js';

const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET &&
     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name');

const memoryStorage = multer.memoryStorage();

// Accept all common image formats including avif, heic
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif'];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error(`File type ${file.mimetype} not allowed. Use JPG, PNG, WebP or AVIF.`), false);
};

const limits = { fileSize: 15 * 1024 * 1024 }; // 15MB

const promisifyUpload = (upload) => (req, res) =>
  new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') reject(new Error('File too large. Max 15MB allowed.'));
        else reject(new Error(err.message));
      } else if (err) reject(err);
      else resolve();
    });
  });

const getCloudinaryStorage = async (folder, transformation) => {
  const { CloudinaryStorage } = await import('multer-storage-cloudinary');
  const { default: cloudinary } = await import('../utils/cloudinary.js');
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic'],
      transformation,
      resource_type: 'image',
    },
  });
};

export const handlePackageImageUpload = async (req, res, next) => {
  try {
    let storage = memoryStorage;
    if (isCloudinaryConfigured()) {
      storage = await getCloudinaryStorage('travelhub/packages', [
        { width: 1200, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ]);
    }
    const upload = multer({ storage, fileFilter, limits }).array('images', 5);
    await promisifyUpload(upload)(req, res);
    if (isCloudinaryConfigured() && req.files?.length) {
      req.body.images = req.files.map(f => f.path);
    }
    next();
  } catch (err) {
    logger.error('Package image upload error:', err.message);
    return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
  }
};

export const handleDestinationImageUpload = async (req, res, next) => {
  try {
    let storage = memoryStorage;
    if (isCloudinaryConfigured()) {
      storage = await getCloudinaryStorage('travelhub/destinations', [
        { width: 800, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ]);
    }
    const upload = multer({ storage, fileFilter, limits }).single('image');
    await promisifyUpload(upload)(req, res);
    if (isCloudinaryConfigured() && req.file?.path) {
      req.body.image = req.file.path;
    }
    next();
  } catch (err) {
    logger.error('Destination image upload error:', err.message);
    return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
  }
};