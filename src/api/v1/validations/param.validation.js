const CreateError = require('http-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectId =
  (...params) =>
  async (req, res, next) => {
    const idKeys = [...params];
    const ids = idKeys.reduce(
      (pre, cur) => ({
        ...pre,
        [cur]: Joi.objectId().required(),
      }),
      {}
    );

    const schema = Joi.object(ids);
    try {
      await schema.validateAsync(req.params);
      return next();
    } catch (error) {
      return next(CreateError.BadRequest(error.message));
    }
  };
module.exports = {
  objectId,
};
