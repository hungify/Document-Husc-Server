const createError = require('http-errors');
const JWT = require('jsonwebtoken');
const redisLocal = require('../../../configs/redis.config');
const { jwt, redis } = require('../../../configs/env.config');

const signInAccessToken = ({ userId, role }) => {
  return new Promise((resolve, reject) => {
    const payload = { userId, role };
    const secret = jwt.accessTokenSecret;
    const expiresIn = jwt.accessTokenExpiresIn;
    const options = {
      expiresIn: expiresIn,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) return next(createError.Unauthorized());
  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  const secret = jwt.accessTokenSecret;

  JWT.verify(token, secret, (err, payload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createError.Unauthorized('access token has expired'));
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
      expiresIn: expiresIn,
    };

    JWT.sign(payload, secret, options, async (err, token) => {
      if (err) return reject(err);
      try {
        await redisLocal.set(userId.toString(), token);
        const redisExpiresIn = redis.expireIn;
        await redisLocal.expire(userId.toString(), redisExpiresIn);

        return resolve(token);
      } catch (err) {
        return reject(createError.InternalServerError(err.message));
      }
    });
  });
};

const verifyRefreshToken = (refreshToken) => {
  try {
    return new Promise((resolve, reject) => {
      const secret = jwt.refreshTokenSecret;
      JWT.verify(refreshToken, secret, async (err, payload) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return reject(
              createError.Unauthorized('refresh token has expired')
            );
          }
          return reject(err);
        }
        const reply = await redisLocal.get(payload.userId);
        if (reply === refreshToken) {
          return resolve(payload);
        }
        return reject(createError.Unauthorized('refresh token is invalid'));
      });
    });
  } catch (err) {
    return reject(createError.InternalServerError(err.message));
  }
};

const getPayload = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) return null;
  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  const secret = jwt.accessTokenSecret;

  JWT.verify(token, secret, (err, payload) => {
    req.payload = payload;
  });
  return req.payload;
};

const revokeRefreshToken = async (userId) => {
  try {
    if (!userId) return;
    await redisLocal.del(userId);
  } catch (error) {
    return reject(createError.InternalServerError(error.message));
  }
};

module.exports = {
  signInAccessToken,
  verifyAccessToken,
  signInRefreshToken,
  verifyRefreshToken,
  getPayload,
  revokeRefreshToken,
};
