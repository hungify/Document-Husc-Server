const CreateError = require('http-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const updateReadDocument = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    readDate: Joi.date().required(),
  });
  try {
    await documentSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  updateReadDocument,
};
