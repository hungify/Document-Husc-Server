if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: '.env.development.local',
  });
} else {
  require('dotenv').config({
    path: '.env.production.local',
  });
}

module.exports = {
  port: process.env.PORT || process.env.APP_PORT || 8888,
  mongoDB: {
    username: process.env.MONGO_DB_USERNAME || '',
    password: process.env.MONGO_DB_PASSWORD || '',
    host: process.env.MONGO_DB_HOST || 'localhost',
    port: process.env.MONGO_DB_PORT || 27017,
    databaseName: process.env.MONGO_DB_NAME || 'test',
    authSource: process.env.MONGO_DB_AUTH_SOURCE || 'admin',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    expireIn: process.env.REDIS_EXPIRE_IN || 60 * 60 * 24,
    connectTimeout: process.env.REDIS_CONNECT_TIMEOUT || 10000,
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    region: process.env.S3_REGION_NAME || '',
    bucket: process.env.S3_BUCKET_NAME || '',
  },
};
