const Joi = require('joi');
const CreateError = require('http-errors');

const register = async (req, res, next) => {
  const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('admin', 'user').default('user'),
  });
  try {
    await userSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

module.exports = {
  register,
};
