const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi);
const CreateError = require('http-errors');

const createDepartment = async (req, res, next) => {
  const departmentSchema = Joi.object({
    label: Joi.string().required(),
  });

  try {
    await departmentSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const updateDepartment = async (req, res, next) => {
  const departmentSchema = Joi.object({
    label: Joi.string().required(),
  });
  try {
    await departmentSchema.validateAsync(req.body);
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createDepartment,
  updateDepartment,
};
