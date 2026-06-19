const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));

// Key helpers
const keys = {
  online: (userId) => `user:online:${userId}`,
  socket: (userId) => `user:socketid:${userId}`,
};

const ONLINE_TTL = 300; // 5 minutes — refreshed by heartbeat every 60s

module.exports = { redis, keys, ONLINE_TTL };
