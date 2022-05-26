const Joi = require('joi');
const CreateError = require('http-errors');

const createTypesOfDocuments = async (req, res, next) => {
  const typeOfCategorySchema = Joi.object({
    label: Joi.string().required(),
  });
  try {
    await typeOfCategorySchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const updateTypesOfDocuments = async (req, res, next) => {
  const typeOfCategorySchema = Joi.object({
    label: Joi.string().required(),
  });
  try {
    await typeOfCategorySchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createTypesOfDocuments,
  updateTypesOfDocuments,
};
