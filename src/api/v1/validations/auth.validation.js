const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const CreateError = require('http-errors');

const register = async (req, res, next) => {
  const userSchema = Joi.object({
    username: Joi.string().required(),
    department: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid('admin', 'user').default('user'),
  });
  try {
    await userSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

const login = async (req, res, next) => {
  const userSchema = Joi.object({
    email: Joi.string().email().required(),
    // password: Joi.string().min(6).max(30).required(),
    password: Joi.string().required(),
  });
  try {
    await userSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

const refreshToken = async (req, res, next) => {
  const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  try {
    await refreshTokenSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

const logout = async (req, res, next) => {
  const logoutSchema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  try {
    await logoutSchema.validateAsync(req.params);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
