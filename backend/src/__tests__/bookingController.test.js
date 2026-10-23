import { createBooking } from '../controllers/bookingController.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';

jest.mock('../models/Booking.js');
jest.mock('../models/Package.js');

describe('Booking Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a booking successfully', async () => {
    const mockPackage = { _id: '123', title: 'Paris Trip', price: 1000 };
    const mockBooking = { _id: '456', customerName: 'John', totalPrice: 2000 };

    Package.findById.mockResolvedValue(mockPackage);
    Booking.create.mockResolvedValue(mockBooking);

    const req = {
      body: {
        packageId: '123',
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        numberOfTravelers: 2,
        travelDate: '2024-06-15',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await createBooking(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should return 404 if package not found', async () => {
    Package.findById.mockResolvedValue(null);

    const req = {
      body: {
        packageId: '999',
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        numberOfTravelers: 1,
        travelDate: '2024-06-15',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await createBooking(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
