const Joi = require('joi');
const CreateError = require('http-errors');

const createAgency = async (req, res, next) => {
  const agencySchema = Joi.object({
    label: Joi.string().required(),
  });
  try {
    await agencySchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const updateAgency = async (req, res, next) => {
  const agencySchema = Joi.object({
    label: Joi.string().required(),
  });
  try {
    await agencySchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createAgency,
  updateAgency,
};
