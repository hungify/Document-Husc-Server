const Joi = require('joi');
const CreateError = require('http-errors');
const { COLORS_ENUM } = require('../models/bases/ugentLevel.model');

const createUrgentLevel = async (req, res, next) => {
  const urgentLevelSchema = Joi.object({
    label: Joi.string().required(),
    colorTag: Joi.string()
      .allow(...COLORS_ENUM)
      .required(),
  });
  try {
    await urgentLevelSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

const updateUrgentLevel = async (req, res, next) => {
  const urgentLevelSchema = Joi.object({
    label: Joi.string(),
    colorTag: Joi.string().allow(...COLORS_ENUM),
  });
  try {
    await urgentLevelSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

module.exports = {
  createUrgentLevel,
  updateUrgentLevel,
};
