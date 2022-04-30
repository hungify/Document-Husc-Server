const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi);
const CreateError = require('http-errors');

const createDepartment = async (req, res, next) => {
  const departmentSchema = Joi.object({
    label: Joi.string().required(),
  });

  try {
    await departmentSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createDepartment,
};
