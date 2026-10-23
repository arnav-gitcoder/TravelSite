import Package from '../models/Package.js';
import { packages as mockPackages } from '../data/mockData.js';

const isDbConnected = () => Package.db.readyState === 1;

const matchesPackageQuery = (pkg, { category, search }) => {
  const categoryMatches = !category || pkg.category === category;
  const searchText = `${pkg.title} ${pkg.description} ${pkg.destination}`.toLowerCase();
  const searchMatches = !search || searchText.includes(String(search).toLowerCase());
  return categoryMatches && searchMatches;
};

const sortPackages = (items, sortBy) => {
  const sortKey = String(sortBy || '-createdAt');
  const direction = sortKey.startsWith('-') ? -1 : 1;
  const field = sortKey.replace(/^-/, '');

  return [...items].sort((a, b) => {
    const aValue = a[field] ?? 0;
    const bValue = b[field] ?? 0;
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });
};

export const getAllPackages = async (req, res, next) => {
  try {
    const { category, search, sortBy = '-createdAt', page = 1, limit = 12, minPrice, maxPrice, minDuration, maxDuration, difficulty, all } = req.query;

    if (!isDbConnected()) {
      let filtered = mockPackages.filter(pkg => matchesPackageQuery(pkg, { category, search }));
      
      // Memory store filtering
      if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
      if (minDuration) filtered = filtered.filter(p => p.duration >= parseInt(minDuration));
      if (maxDuration) filtered = filtered.filter(p => p.duration <= parseInt(maxDuration));
      if (difficulty) filtered = filtered.filter(p => p.difficulty === difficulty);

      const sorted = sortPackages(filtered, sortBy);
      
      let data = sorted;
      const isPaginated = all !== 'true' && limit !== '0';
      
      if (isPaginated) {
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.max(parseInt(limit, 10) || 12, 1);
        const start = (pageNumber - 1) * limitNumber;
        data = sorted.slice(start, start + limitNumber);
      }

      return res.status(200).json({
        success: true,
        count: data.length,
        total: filtered.length,
        pages: isPaginated ? Math.ceil(filtered.length / (parseInt(limit, 10) || 12)) : 1,
        data,
      });
    }

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { destination: searchRegex },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const isPaginated = all !== 'true' && limit !== '0';
    let packagesQuery = Package.find(query).sort(sortBy);

    if (isPaginated) {
      const skip = (page - 1) * parseInt(limit);
      packagesQuery = packagesQuery.skip(skip).limit(parseInt(limit));
    }

    const packages = await packagesQuery;
    const total = await Package.countDocuments(query);

    res.status(200).json({
      success: true,
      count: packages.length,
      total,
      pages: isPaginated ? Math.ceil(total / parseInt(limit)) : 1,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const pkg = mockPackages.find(item => item._id === req.params.id);

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: pkg,
      });
    }

    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    // If images were uploaded via multer-cloudinary, use their secure_urls
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(f => f.path); // multer-storage-cloudinary sets path = secure_url
    }
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    let pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    // If new images uploaded, replace existing
    if (req.files && req.files.length > 0) {
      // Delete old Cloudinary images
      const { deleteCloudinaryImage } = await import('../utils/cloudinary.js');
      await Promise.allSettled(pkg.images.map(img => deleteCloudinaryImage(img)));
      req.body.images = req.files.map(f => f.path);
    }

    pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    // Delete images from Cloudinary
    const { deleteCloudinaryImage } = await import('../utils/cloudinary.js');
    await Promise.allSettled(pkg.images.map(img => deleteCloudinaryImage(img)));

    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPackagesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    if (!isDbConnected()) {
      const packages = mockPackages.filter(pkg => pkg.category === category);

      return res.status(200).json({
        success: true,
        count: packages.length,
        data: packages,
      });
    }

    const packages = await Package.find({ category });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedPackages = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const packages = sortPackages(mockPackages, '-rating').slice(0, 6);

      return res.status(200).json({
        success: true,
        count: packages.length,
        data: packages,
      });
    }

    const packages = await Package.find().sort('-rating').limit(6);

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};