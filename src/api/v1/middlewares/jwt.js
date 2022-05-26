const CreateError = require('http-errors');
const JWT = require('jsonwebtoken');
const redisQuery = require('../utils/redis');
const { jwt, redis } = require('../../../configs/env.config');

const signInAccessToken = async ({ userId, role }) => {
  try {
    const payload = { userId, role };
    const secret = jwt.accessTokenSecret;
    const expiresIn = jwt.accessTokenExpiresIn;
    const options = {
      expiresIn: expiresIn,
    };

    const accessToken = await JWT.sign(payload, secret, options);
    return accessToken;
  } catch (err) {
    return CreateError.InternalServerError(err.message);
  }
};

const verifyAccessToken = async (req, res, next) => {
  try {
    let token = req.headers['authorization'];

    if (!token) return next(CreateError.Unauthorized());
    if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

    const secret = jwt.accessTokenSecret;

    const payload = await JWT.verify(token, secret);
    req.payload = payload;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(CreateError.Unauthorized('access token has expired'));
    } else if (err.name === 'JsonWebTokenError') {
      return next(CreateError.Unauthorized());
    } else {
      return next(CreateError.InternalServerError(err.message));
    }
  }
};

const signInRefreshToken = async ({ userId, role }) => {
  try {
    const payload = { userId, role };
    const secret = jwt.refreshTokenSecret;
    const expiresIn = jwt.refreshTokenExpiresIn;
    const redisExpiresIn = redis.expireIn;
    const options = {
      expiresIn: expiresIn,
    };

    const refreshToken = await JWT.sign(payload, secret, options);
    await redisQuery.setWithTTL(userId, refreshToken, redisExpiresIn);
    return refreshToken;
  } catch (err) {
    return CreateError.InternalServerError(err.message);
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const secret = jwt.refreshTokenSecret;
    const payload = await JWT.verify(refreshToken, secret);
    if (payload) {
      const userId = payload.userId;
      const redisValue = JSON.parse(await redisQuery.getRedisValue(userId));

      if (redisValue === refreshToken) {
        return payload;
      }
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return CreateError.Unauthorized('refresh token has expired');
    } else if (err.name === 'JsonWebTokenError') {
      return CreateError.Unauthorized();
    } else if (err.name === 'NotBeforeError') {
      return CreateError.Unauthorized('refresh token is invalid');
    } else {
      return CreateError.InternalServerError(err.message);
    }
  }
};

const getPayload = async (req) => {
  try {
    let token = req.headers['authorization'];

    if (!token) return null;
    if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

    const secret = jwt.accessTokenSecret;
    const payload = await JWT.verify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
};

const revokeRefreshToken = async (userId) => {
  try {
    if (!userId) return;
    await redisQuery.deleteRedisValue(userId);
  } catch (error) {
    return CreateError.InternalServerError(error.message);
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
