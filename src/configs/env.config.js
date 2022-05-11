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
  port: process.env.PORT || process.env.APP_PORT,
  mongoDB: {
    username: process.env.MONGO_DB_USERNAME ,
    password: process.env.MONGO_DB_PASSWORD ,
    host: process.env.MONGO_DB_HOST ,
    port: process.env.MONGO_DB_PORT,
    databaseName: process.env.MONGO_DB_NAME,
    authSource: process.env.MONGO_DB_AUTH_SOURCE ,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD ,
    expireIn: process.env.REDIS_EXPIRE_IN,
    connectTimeout: process.env.REDIS_CONNECT_TIMEOUT,
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
