const Joi = require('joi');
const CreateError = require('http-errors');
const { COLORS_ENUM } = require('../models/ugentLevel.model');

const createUrgentLevel = async (req, res, next) => {
  const urgentLevelSchema = Joi.object({
    label: Joi.string().required(),
    colorTag: Joi.string()
      .allow(...COLORS_ENUM)
      .required(),
  });
  try {
    await urgentLevelSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const updateUrgentLevel = async (req, res, next) => {
  const urgentLevelSchema = Joi.object({
    label: Joi.string(),
    colorTag: Joi.string().allow(...COLORS_ENUM),
  });
  try {
    await urgentLevelSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createUrgentLevel,
  updateUrgentLevel,
};
