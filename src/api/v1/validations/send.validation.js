const CreateError = require('http-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const forwardDocument = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    receivers: Joi.array()
      .items(
        Joi.object().keys({
          receiverId: Joi.string().required(),
          sendDate: Joi.string().required(),
        })
      )
      .required(),
  });
  try {
    await documentSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  forwardDocument,
};
