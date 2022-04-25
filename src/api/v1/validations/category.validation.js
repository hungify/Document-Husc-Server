const CreateError = require('http-errors');
const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi);

const createCategory = async (req, res, next) => {
  const categorySchema = Joi.object({
    title: Joi.string().required(),
    parentId: Joi.ObjectId().allow(null),
  });
  try {
    await categorySchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

const updateCategory = async (req, res, next) => {
  const categorySchema = Joi.object({
    title: Joi.string().required(),
    parentId: Joi.string().allow(null),
  });
  try {
    await categorySchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError(error.message));
  }
};

module.exports = {
  createCategory,
  updateCategory,
};
