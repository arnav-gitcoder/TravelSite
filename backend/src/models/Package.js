import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a package title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a full description'],
    },
    category: {
      type: String,
      enum: ['Adventure', 'Family', 'Luxury', 'Budget', 'Cultural', 'Beach', 'Domestic', 'International', 'Honeymoon'],
      required: [true, 'Please provide a category'],
    },
    destination: {
      type: String,
      required: [true, 'Please provide a destination'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in days'],
      min: [1, 'Duration must be at least 1 day'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one image'],
    },
    highlights: [String],
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],
    maxGroupSize: {
      type: Number,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Hard'],
      default: 'Moderate',
    },
    includesFood: {
      type: Boolean,
      default: true,
    },
    includesAccommodation: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

packageSchema.index({ category: 1, destination: 1 });
packageSchema.index({ title: 'text', description: 'text', destination: 'text' });

const Package = mongoose.model('Package', packageSchema);

export default Package;