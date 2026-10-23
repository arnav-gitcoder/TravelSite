import redis from 'redis';
import logger from './logger.js';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

client.on('connect', () => {
  logger.info('Redis connected');
});

export const getCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error('Cache get error:', err);
    return null;
  }
};

export const setCache = async (key, value, ttl = 3600) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.error('Cache set error:', err);
  }
};

export const deleteCache = async (key) => {
  try {
    await client.del(key);
  } catch (err) {
    logger.error('Cache delete error:', err);
  }
};

export default client;
