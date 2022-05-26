const redisClient = require('../../../configs/redis.config');

const setWithTTL = (key, value, ttlSeconds = 60) => {
  return redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

const getRedisValue = (key) => {
  return redisClient.get(key);
};

const updateRedisValue = (key, value) => {
  return redisClient.set(key, JSON.stringify(value), 'KEEPTTL', 'XX');
};

const deleteRedisValue = (key) => {
  return redisClient.del(key);
};

module.exports = {
  setWithTTL,
  getRedisValue,
  deleteRedisValue,
  updateRedisValue,
};
