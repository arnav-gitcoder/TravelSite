import mongoose from 'mongoose';

const tripThemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Honeymoon', 'Family', 'Adventure', 'Cultural', 'Beach', 'Budget', 'Luxury', 'Solo'],
    },
    description: String,
    icon: String,
    suggestedDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    avgDuration: Number,
    avgBudget: Number,
    features: [String],
    image: String,
  },
  { timestamps: true }
);

const TripTheme = mongoose.model('TripTheme', tripThemeSchema);

export default TripTheme;
