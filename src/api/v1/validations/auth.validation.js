const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const CreateError = require('http-errors');

const register = async (req, res, next) => {
  const userSchema = Joi.object({
    username: Joi.string().required(),
    role: Joi.string().valid('admin', 'user'),
    password: Joi.string().min(6).max(30).required(),
    email: Joi.string().email().required(),
  })
    .when('.role', {
      is: 'admin',
      then: Joi.object().keys({
        department: Joi.string(),
      }),
    })
    .when('.role', {
      is: 'user',
      then: Joi.object().keys({
        department: Joi.string().required(),
      }),
    });
  try {
    await userSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const login = async (req, res, next) => {
  const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });
  try {
    await userSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError(error.message));
  }
};

const refreshToken = async (req, res, next) => {
  const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  try {
    await refreshTokenSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const logout = async (req, res, next) => {
  const logoutSchema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  try {
    await logoutSchema.validateAsync(req.params);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
