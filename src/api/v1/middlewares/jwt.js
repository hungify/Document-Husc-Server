const createError = require('http-errors');
const JWT = require('jsonwebtoken');
const redisLocal = require('../../../configs/redis.config');
const { jwt } = require('../../../configs/env.config');

const signInAccessToken = ({ userId, role }) => {
  return new Promise((resolve, reject) => {
    const payload = { userId, role };
    const secret = jwt.accessTokenSecret;
    const expiresIn = jwt.accessTokenExpiresIn;
    const options = {
      expiresIn: `${expiresIn}s`,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) return next(createError.Unauthorized());

  let token = req.headers['authorization'];
  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  const secret = jwt.accessTokenSecret;

  JWT.verify(token, secret, (err, payload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createError.Unauthorized(err.message));
      } else if (err.name === 'JsonWebTokenError') {
        return next(createError.Unauthorized());
      }
    }
    req.payload = payload;
    next();
  });
};

const signInRefreshToken = ({ userId, role }) => {
  return new Promise((resolve, reject) => {
    const payload = { userId, role };
    const secret = jwt.refreshTokenSecret;
    const expiresIn = jwt.refreshTokenExpiresIn;
    const options = {
      expiresIn: `${expiresIn}s`,
    };

    JWT.sign(payload, secret, options, async (err, token) => {
      if (err) return reject(err);
      redisLocal.set(userId.toString(), token, (err, reply) => {
        if (err) {
          return reject(createError.InternalServerError(err.message));
        }
      });

      redisLocal.expire(userId.toString(), process.env.REDIS_EXPIRE_IN);
      return resolve(token);
    });
  });
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    const secret = jwt.refreshTokenSecret;
    JWT.verify(refreshToken, secret, async (err, payload) => {
      if (err) return reject(err);

      redisLocal.get(payload.userId, (err, reply) => {
        if (err) {
          return reject(createError.InternalServerError(err.message));
        }
        if (reply === refreshToken) {
          console.log('🚀 :: payload', payload);
          return resolve(payload);
        }
        return reject(createError.Unauthorized());
      });
    });
  });
};

module.exports = {
  signInAccessToken,
  verifyAccessToken,
  signInRefreshToken,
  verifyRefreshToken,
};
