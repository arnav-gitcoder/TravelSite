import Destination from '../models/Destination.js';
import logger from '../utils/logger.js';

const isDbConnected = () => {
  try { return Destination.db.readyState === 1; } catch { return false; }
};

// In-memory fallback destinations with full tier pricing
const mockDestinations = [
  { _id: 'dest-goa', name: 'Goa', country: 'India', isInternational: false, category: 'Beach', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500', economyPerNight: 2500, standardPerNight: 5000, luxuryPerNight: 12000, transportCharge: 1500, activitiesCharge: 2000, rating: 4.6, highlights: ['Beaches', 'Nightlife', 'Portuguese Heritage'], bestTime: 'Nov-Feb' },
  { _id: 'dest-manali', name: 'Manali', country: 'India', isInternational: false, category: 'Mountain', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500', economyPerNight: 1800, standardPerNight: 4000, luxuryPerNight: 9000, transportCharge: 2500, activitiesCharge: 2000, rating: 4.7, highlights: ['Rohtang Pass', 'Solang Valley', 'River Rafting'], bestTime: 'Mar-Jun' },
  { _id: 'dest-kashmir', name: 'Kashmir', country: 'India', isInternational: false, category: 'Mountain', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=500', economyPerNight: 2000, standardPerNight: 5500, luxuryPerNight: 14000, transportCharge: 3000, activitiesCharge: 2500, rating: 4.9, highlights: ['Dal Lake', 'Shikara Ride', 'Gulmarg', 'Pahalgam'], bestTime: 'Apr-Oct' },
  { _id: 'dest-bali', name: 'Bali', country: 'Indonesia', isInternational: true, category: 'Beach', image: 'https://images.unsplash.com/photo-1537996266356-c90e9c6ba746?w=500', economyPerNight: 3500, standardPerNight: 7000, luxuryPerNight: 18000, transportCharge: 5000, activitiesCharge: 4000, rating: 4.8, highlights: ['Temples', 'Rice Terraces', 'Beaches', 'Spa'], bestTime: 'Apr-Oct' },
  { _id: 'dest-dubai', name: 'Dubai', country: 'UAE', isInternational: true, category: 'City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500', economyPerNight: 6000, standardPerNight: 12000, luxuryPerNight: 30000, transportCharge: 4000, activitiesCharge: 5000, rating: 4.7, highlights: ['Burj Khalifa', 'Desert Safari', 'Shopping', 'Palm Jumeirah'], bestTime: 'Nov-Mar' },
];

/* ── Pricing calculator ── */
export const calcDestinationCost = (dest, nights, budgetTier, travelers) => {
  const perNight = {
    Economy:  dest.economyPerNight  || dest.minPrice  || 1500,
    Standard: dest.standardPerNight || dest.avgPrice  || 4000,
    Luxury:   dest.luxuryPerNight   || dest.maxPrice  || 9000,
  }[budgetTier] || dest.standardPerNight || 4000;

  const accommodation = perNight * nights * travelers;
  const transport     = (dest.transportCharge  || 1500) * travelers;
  const activities    = (dest.activitiesCharge || 1500) * travelers;

  return { accommodation, transport, activities, total: accommodation + transport + activities };
};

export const getAllDestinations = async (req, res, next) => {
  try {
    const { category, search, international } = req.query;

    if (!isDbConnected()) {
      let data = mockDestinations;
      if (category) data = data.filter(d => d.category === category);
      if (international !== undefined) data = data.filter(d => d.isInternational === (international === 'true'));
      if (search) data = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
      return res.status(200).json({ success: true, count: data.length, data });
    }

    let query = {};
    if (category) query.category = category;
    if (international !== undefined) query.isInternational = international === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const destinations = await Destination.find(query).sort('name');
    res.status(200).json({ success: true, count: destinations.length, data: destinations });
  } catch (error) { next(error); }
};

export const getDestinationById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const dest = mockDestinations.find(d => d._id === req.params.id);
      if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
      return res.status(200).json({ success: true, data: dest });
    }
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.status(200).json({ success: true, data: dest });
  } catch (error) { next(error); }
};

export const getDestinationsByCategory = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const data = mockDestinations.filter(d => d.category === req.params.category);
      return res.status(200).json({ success: true, count: data.length, data });
    }
    const data = await Destination.find({ category: req.params.category }).sort('name');
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

export const createDestination = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.path;
    const dest = await Destination.create(req.body);
    logger.info(`Destination created: ${dest.name}`);
    res.status(201).json({ success: true, data: dest });
  } catch (error) { next(error); }
};

export const updateDestination = async (req, res, next) => {
  try {
    // Handle new image upload
    if (req.file) {
      const existing = await Destination.findById(req.params.id);
      if (existing?.image) {
        const { deleteCloudinaryImage } = await import('../utils/cloudinary.js');
        await deleteCloudinaryImage(existing.image);
      }
      req.body.image = req.file.path; // multer-storage-cloudinary sets path = secure_url
    }
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    logger.info(`Destination updated: ${dest.name}`);
    res.status(200).json({ success: true, data: dest });
  } catch (error) { next(error); }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    // Delete image from Cloudinary
    if (dest.image) {
      const { deleteCloudinaryImage } = await import('../utils/cloudinary.js');
      await deleteCloudinaryImage(dest.image);
    }
    await Destination.findByIdAndDelete(req.params.id);
    logger.info(`Destination deleted: ${dest.name}`);
    res.status(200).json({ success: true, message: 'Destination deleted' });
  } catch (error) { next(error); }
};

// Live pricing calc endpoint used by CustomBuilder
export const calculatePriceRange = async (req, res, next) => {
  try {
    const { destinations, budgetTier = 'Standard', travelers = 1 } = req.body;

    if (!destinations || destinations.length === 0) {
      return res.status(400).json({ success: false, message: 'No destinations provided' });
    }

    let breakdown = [];
    let grandTotal = { accommodation: 0, transport: 0, activities: 0, total: 0 };

    for (const item of destinations) {
      let destData;
      if (isDbConnected()) {
        destData = item._id
          ? await Destination.findById(item._id)
          : await Destination.findOne({ name: new RegExp(item.name, 'i') });
      } else {
        destData = mockDestinations.find(d =>
          d._id === item._id || d.name.toLowerCase() === item.name?.toLowerCase()
        );
      }

      // fallback if not found in DB
      if (!destData) {
        destData = { name: item.name, economyPerNight: 2000, standardPerNight: 5000, luxuryPerNight: 12000, transportCharge: 2000, activitiesCharge: 2000 };
      }

      const cost = calcDestinationCost(destData, item.days || 1, budgetTier, travelers);
      breakdown.push({ name: destData.name, nights: item.days || 1, ...cost });
      grandTotal.accommodation += cost.accommodation;
      grandTotal.transport     += cost.transport;
      grandTotal.activities    += cost.activities;
      grandTotal.total         += cost.total;
    }

    res.status(200).json({ success: true, data: { breakdown, grandTotal, budgetTier, travelers } });
  } catch (error) { next(error); }
};