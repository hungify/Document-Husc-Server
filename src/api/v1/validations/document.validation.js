const CreateError = require('http-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const createDocument = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    //properties
    typesOfDocument: Joi.string().required(),
    urgentLevel: Joi.string().required(),
    agency: Joi.string().required(),
    category: Joi.string().required(),

    documentNumber: Joi.string().required(),
    signer: Joi.string().required(),
    issueDate: Joi.date().required(),
    //properties

    title: Joi.string().required(),
    summary: Joi.string(),
    content: Joi.string(),
    validityStatus: Joi.string().valid('valid', 'invalid').default('valid'),

    relativeDocuments: Joi.array().items(Joi.objectId()),

    publisherId: Joi.objectId().required(),
    publishDate: Joi.date().required(),

    participants: Joi.array().items({
      senderId: Joi.objectId().required(),
      sendDate: Joi.date().required(),
      receivers: Joi.array().items({
        receiverId: Joi.objectId().required(),
        readDate: Joi.date().default(null),
      }),
    }),
  });

  try {
    console.log('🚀 :: req.body', req.body);
    await documentSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

const updateReadDate = async (req, res, next) => {
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

const getListDocuments = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
    sort: Joi.string().valid('-createdAt', '-updatedAt').default('-createdAt'),
  });
  try {
    await documentSchema.validateAsync(req.query);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

const forwardDocument = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    receiverId: Joi.array().items(Joi.objectId().required()),
    parentId: Joi.objectId().required(),
    readDate: Joi.date().default(null),
    forwardedDate: Joi.date().required(),
  });
  try {
    await documentSchema.validateAsync(req.body);
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

const getDocumentByFilter = async (req, res, next) => {
  console.log('🚀 :: req.query', req.query);
  const documentSchema = Joi.object().keys({
    field: Joi.string()
      .valid('types-of-document', 'agency', 'category')
      .required(),
    value: Joi.string().required(),
  });
  try {
    await documentSchema.validateAsync(req.query);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createDocument,
  updateReadDate,
  getListDocuments,
  forwardDocument,
  getDocumentByFilter,
};
