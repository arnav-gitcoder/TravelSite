import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    country: String,
    isInternational: {
      type: Boolean,
      default: false,
    },
    region: String,
    description: String,
    image: String,
    category: {
      type: String,
      enum: ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Honeymoon', 'Family'],
    },

    // ── Pricing Engine Fields ──────────────────────────────
    economyPerNight: {
      type: Number,
      default: 2000,
    },
    standardPerNight: {
      type: Number,
      default: 5000,
    },
    luxuryPerNight: {
      type: Number,
      default: 10000,
    },
    transportCharge: {
      type: Number,
      default: 2000,
      comment: 'One-time charge per destination visit',
    },
    activitiesCharge: {
      type: Number,
      default: 1500,
      comment: 'One-time activities charge per destination visit',
    },

    // ── Legacy fields (kept for backward compat) ───────────
    minPrice: {
      type: Number,
    },
    maxPrice: {
      type: Number,
    },
    avgPrice: {
      type: Number,
    },

    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Hard'],
      default: 'Easy',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    highlights: [String],
    activities: [String],
    bestTime: String,
    seasonalPrices: {
      peak: { multiplier: Number, months: [Number] },
      shoulder: { multiplier: Number, months: [Number] },
      low: { multiplier: Number, months: [Number] },
    },
  },
  { timestamps: true }
);

// Sync legacy fields from pricing engine fields
destinationSchema.pre('save', function (next) {
  this.minPrice = this.economyPerNight;
  this.maxPrice = this.luxuryPerNight;
  this.avgPrice = this.standardPerNight;
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;