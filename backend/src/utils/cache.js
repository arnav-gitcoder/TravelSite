import logger from '../utils/logger.js';

let redisClient = null;

export const initRedis = async () => {
  try {
    const { createClient } = await import('redis').catch(() => null);
    if (!createClient) {
      logger.warn('Redis package not installed — caching disabled');
      return;
    }
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: false, // don't retry if not available
      },
    });
    redisClient.on('error', () => { redisClient = null; });
    await redisClient.connect();
    logger.info('Redis connected');
  } catch {
    logger.warn('Redis unavailable — running without cache');
    redisClient = null;
  }
};

export const cacheGet = async (key) => {
  try { return redisClient ? JSON.parse(await redisClient.get(key)) : null; }
  catch { return null; }
};

export const cacheSet = async (key, value, ttl = 3600) => {
  try { if (redisClient) await redisClient.setEx(key, ttl, JSON.stringify(value)); }
  catch { /* no-op */ }
};

export const cacheDel = async (key) => {
  try { if (redisClient) await redisClient.del(key); }
  catch { /* no-op */ }
};

export const cacheFlush = async () => {
  try { if (redisClient) await redisClient.flushAll(); }
  catch { /* no-op */ }
};

export default { initRedis, cacheGet, cacheSet, cacheDel, cacheFlush };