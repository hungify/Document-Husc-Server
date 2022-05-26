const Redis = require('ioredis');
const { redis } = require('.././configs/env.config');

const redisClient = new Redis({
  host: redis.host,
  port: redis.port,
  password: redis.password,
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('error', function (err) {
  if (err.code == 'ECONNREFUSED') {
    redisClient.disconnect();
    return;
  } else console.log('Redis error: ' + err.message);
});

module.exports = redisClient;
