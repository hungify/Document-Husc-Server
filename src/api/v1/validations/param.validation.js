const CreateError = require('http-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectId = async (req, res, next) => {
  const keys = Object.keys(req.params);
  const schema = Joi.object({
    [keys]: Joi.objectId().required(),
  });

  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};
module.exports = {
  objectId,
};
