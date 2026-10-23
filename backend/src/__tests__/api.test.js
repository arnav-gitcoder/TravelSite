import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = 'http://localhost:5000';

describe('Health Check', () => {
  it('should return server status', async () => {
    const res = await request(apiUrl).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Destinations API', () => {
  it('should get all destinations', async () => {
    const res = await request(apiUrl).get('/api/destinations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should validate price calculation input', async () => {
    const res = await request(apiUrl)
      .post('/api/destinations/price-calculation')
      .send({
        destinationIds: [],
        days: [],
        startDate: 'invalid-date',
      });
    expect(res.status).toBe(400);
  });
});

describe('Validation Tests', () => {
  it('should reject invalid email', async () => {
    const res = await request(apiUrl)
      .post('/api/bookings')
      .send({
        packageId: '123',
        customerName: 'John',
        customerEmail: 'invalid-email',
        customerPhone: '1234567890',
        numberOfTravelers: 1,
        travelDate: new Date().toISOString(),
      });
    expect(res.status).toBe(400);
  });
});

describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    // Make multiple requests rapidly
    const requests = [];
    for (let i = 0; i < 35; i++) {
      requests.push(
        request(apiUrl)
          .post('/api/destinations/price-calculation')
          .send({
            destinationIds: ['123'],
            days: [2],
            startDate: '2024-06-15',
          })
      );
    }

    const responses = await Promise.all(requests);
    const limitedResponses = responses.filter((res) => res.status === 429);
    expect(limitedResponses.length).toBeGreaterThan(0);
  });
});

export { apiUrl };
