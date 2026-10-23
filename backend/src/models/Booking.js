import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    packageTitle: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Please provide customer email'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    customerPhone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    numberOfTravelers: {
      type: Number,
      required: [true, 'Please provide number of travelers'],
      min: [1, 'At least 1 traveler is required'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    travelDate: {
      type: Date,
      required: [true, 'Please provide travel date'],
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customerEmail: 1, status: 1 });
bookingSchema.index({ packageId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
