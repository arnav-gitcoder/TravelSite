import CustomPackage from '../models/CustomPackage.js';
import {
  sendCustomPackageNotification,
  sendCustomPackageAck,
} from '../utils/emailService.js';
import logger from '../utils/logger.js';

const isDbConnected = () => {
  try { return CustomPackage.db.readyState === 1; } catch { return false; }
};

// In-memory store when DB not connected
const memStore = new Map();

const makeInMemoryPackage = (data) => {
  const id = 'cp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const totalDays = data.destinations.reduce((s, d) => s + (d.days || 0), 0);
  const totalPrice = data.destinations.reduce((s, d) => s + (d.costPerDay || 0) * (d.days || 0), 0) * (data.numberOfTravelers || 1);
  const pkg = {
    _id: id,
    ...data,
    totalDays,
    totalPrice,
    status: 'submitted',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memStore.set(id, pkg);
  return pkg;
};

export const createCustomPackage = async (req, res, next) => {
  try {
    const {
      title, destinations, startDate, endDate,
      numberOfTravelers = 1, specialRequests,
      customerName, customerEmail, customerPhone, userId,
    } = req.body;

    if (!title || !destinations || destinations.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide title and at least one destination' });
    }

    let customPackage;

    if (!isDbConnected()) {
      customPackage = makeInMemoryPackage({
        userId: userId || 'guest-' + Date.now(),
        title, destinations, startDate, endDate,
        numberOfTravelers, specialRequests,
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
      });
    } else {
      const totalDays = destinations.reduce((s, d) => s + (d.days || 0), 0);
      const totalPrice = destinations.reduce((s, d) => s + (d.costPerDay || 0) * (d.days || 0), 0) * numberOfTravelers;

      customPackage = await CustomPackage.create({
        userId: userId || 'guest-' + Date.now(),
        title, destinations, startDate, endDate,
        numberOfTravelers, totalDays, totalPrice, specialRequests,
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        status: 'submitted',
      });
    }

    await Promise.allSettled([
      sendCustomPackageNotification(customPackage),
      sendCustomPackageAck(customPackage),
    ]);

    logger.info(`Custom package created: ${customPackage._id}`);

    res.status(201).json({
      success: true,
      message: 'Custom package created! Our team will contact you shortly.',
      data: customPackage,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomPackage = async (req, res, next) => {
  try {
    let pkg;
    if (!isDbConnected()) {
      pkg = memStore.get(req.params.id);
    } else {
      pkg = await CustomPackage.findById(req.params.id);
    }
    if (!pkg) return res.status(404).json({ success: false, message: 'Custom package not found' });
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomPackages = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const all = Array.from(memStore.values());
      return res.status(200).json({ success: true, count: all.length, total: all.length, data: all });
    }
    const { status, page = 1, limit = 20, all } = req.query;
    let query = {};
    if (status) query.status = status;

    const isPaginated = all !== 'true' && limit !== '0';
    let packagesQuery = CustomPackage.find(query).sort('-createdAt');

    if (isPaginated) {
      const skip = (page - 1) * parseInt(limit);
      packagesQuery = packagesQuery.skip(skip).limit(parseInt(limit));
    }

    const packages = await packagesQuery;
    const total = await CustomPackage.countDocuments(query);
    res.status(200).json({ success: true, count: packages.length, total, data: packages });
  } catch (error) {
    next(error);
  }
};

export const updateCustomPackage = async (req, res, next) => {
  try {
    const { destinations, numberOfTravelers, status, startDate, endDate, specialRequests } = req.body;

    if (!isDbConnected()) {
      const existing = memStore.get(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
      const merged = { ...existing };
      if (destinations !== undefined) merged.destinations = destinations;
      if (numberOfTravelers !== undefined) merged.numberOfTravelers = numberOfTravelers;
      if (status !== undefined) merged.status = status;
      if (startDate !== undefined) merged.startDate = startDate;
      if (endDate !== undefined) merged.endDate = endDate;
      if (specialRequests !== undefined) merged.specialRequests = specialRequests;
      const updated = makeInMemoryPackage(merged);
      memStore.set(req.params.id, updated);
      return res.status(200).json({ success: true, data: updated });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (endDate !== undefined) updateFields.endDate = endDate;
    if (specialRequests !== undefined) updateFields.specialRequests = specialRequests;
    if (numberOfTravelers !== undefined) updateFields.numberOfTravelers = numberOfTravelers;

    if (destinations !== undefined) {
      updateFields.destinations = destinations;
      const travelers = numberOfTravelers !== undefined ? numberOfTravelers : (await CustomPackage.findById(req.params.id))?.numberOfTravelers || 1;
      updateFields.totalDays = destinations.reduce((s, d) => s + (d.days || 0), 0);
      updateFields.totalPrice = destinations.reduce((s, d) => s + (d.costPerDay || 0) * (d.days || 0), 0) * travelers;
    }

    const pkg = await CustomPackage.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const submitCustomPackage = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const pkg = memStore.get(req.params.id);
      if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
      pkg.status = 'submitted';
      return res.status(200).json({ success: true, data: pkg });
    }
    const pkg = await CustomPackage.findByIdAndUpdate(req.params.id, { status: 'submitted' }, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    await sendCustomPackageNotification(pkg);
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomPackage = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      memStore.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Deleted' });
    }
    const pkg = await CustomPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Custom package deleted' });
  } catch (error) {
    next(error);
  }
};