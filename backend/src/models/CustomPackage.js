import mongoose from 'mongoose';

const customPackageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    // Customer contact info (added so we can email them)
    customerName: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
      lowercase: true,
    },
    customerPhone: {
      type: String,
      default: '',
    },
    destinations: [
      {
        name: String,
        days: Number,
        description: String,
        costPerDay: Number,
      },
    ],
    startDate: Date,
    endDate: Date,
    numberOfTravelers: {
      type: Number,
      default: 1,
    },
    totalDays: Number,
    totalPrice: Number,
    specialRequests: String,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'confirmed', 'cancelled'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

const CustomPackage = mongoose.model('CustomPackage', customPackageSchema);
export default CustomPackage;