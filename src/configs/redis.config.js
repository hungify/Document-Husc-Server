const Redis = require('ioredis');
const { redis } = require('.././configs/env.config');

const redisLocal = new Redis({
  host: redis.host,
  port: redis.port,
  password: redis.password,
});

redisLocal.on('connect', () => {
  console.log('Redis client connected');
});

redisLocal.on('ready', () => {
  console.log('Redis client is ready');
});

redisLocal.on('error', function (err) {
  if (err.code == 'ECONNREFUSED') {
    redisLocal.disconnect();
    return;
  } else console.log('Redis error: ' + err.message);
});

module.exports = redisLocal;
