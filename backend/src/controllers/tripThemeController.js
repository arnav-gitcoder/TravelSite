import TripTheme from '../models/TripTheme.js';
import { tripThemes as mockTripThemes } from '../data/mockData.js';

const isDbConnected = () => TripTheme.db.readyState === 1;

export const getAllTripThemes = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: mockTripThemes.length,
        data: mockTripThemes,
      });
    }

    const themes = await TripTheme.find().populate('suggestedDestinations');

    res.status(200).json({
      success: true,
      count: themes.length,
      data: themes,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripThemeById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const theme = mockTripThemes.find(item => item._id === req.params.id);

      if (!theme) {
        return res.status(404).json({
          success: false,
          message: 'Trip theme not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: theme,
      });
    }

    const theme = await TripTheme.findById(req.params.id).populate('suggestedDestinations');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Trip theme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    next(error);
  }
};

export const createTripTheme = async (req, res, next) => {
  try {
    const theme = await TripTheme.create(req.body);

    res.status(201).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    next(error);
  }
};
