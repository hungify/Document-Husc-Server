module.exports = {
  port: process.env.PORT,
  appPort: process.env.APP_PORT || 3001,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || "test",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
  },
  mail: {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 465,
    secure: process.env.MAIL_SECURE || true,
    auth: {
      user: process.env.MAIL_USER || "",
      pass: process.env.MAIL_PASS || "",
    },
    from: process.env.MAIL_FROM || "",
  },
  googleAPI: {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectURL: process.env.GOOGLE_REDIRECT_URI || "",
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || "",
  },
};
