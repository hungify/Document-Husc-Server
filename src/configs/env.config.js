if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: '.env.development.local',
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
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 465,
    secure: process.env.MAIL_SECURE || true,
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || '',
    },
    from: process.env.MAIL_FROM || '',
  },
  googleAPI: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectURL: process.env.GOOGLE_REDIRECT_URI || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
  },
};
