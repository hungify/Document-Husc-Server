const CreateError = require('http-errors');
const Joi = require('joi');
const { isJSON } = require('../utils/index');

Joi.objectId = require('joi-objectid')(Joi);

const createDocument = async (req, res, next) => {
  const documentSchema = Joi.object()
    .keys({
      //properties
      typesOfDocument: Joi.string().required(),
      urgentLevel: Joi.string().required(),
      agency: Joi.string().required(),
      category: Joi.string().required(),

      documentNumber: Joi.string().required(),
      signer: Joi.string().required(),

      title: Joi.string().required(),
      relatedDocuments: Joi.alternatives()
        .try(Joi.array().items(Joi.objectId()), Joi.string().allow(''))
        .required(), // Form data transfer array to empty string
      //properties
      validityStatus: Joi.string().valid('valid', 'invalid').default('valid'),

      publisher: Joi.objectId().required(),
      issueDate: Joi.date().required(),

      documentFrom: Joi.string().valid('input', 'attach').required(),

      participants: Joi.alternatives()
        .try(
          Joi.array().items(
            Joi.object().keys({
              sender: Joi.objectId().required(),
              sendDate: Joi.date().required(),
              readDate: Joi.date().default(null),
              receiver: Joi.objectId(),
            })
          ),
          Joi.object().keys({
            sender: Joi.objectId().required(),
            sendDate: Joi.date().required(),
          })
        )
        .required(),
    })
    .when('.documentFrom', {
      is: 'input',
      then: Joi.object().keys({
        content: Joi.string().required(),
      }),
    })
    .when('.documentFrom', {
      is: 'attach',
      then: Joi.object().keys({
        summary: Joi.string().required(),
      }),
    });

  try {
    let body = {
      ...req.body,
    };

    if (isJSON(req.body.participants)) {
      body.participants = JSON.parse(req.body.participants);
    }
    await documentSchema.validateAsync(body);
    next();
  } catch (error) {
    next(CreateError.BadRequest(error.message));
  }
};

const updateReadDate = async (req, res, next) => {
  const documentSchema = Joi.object().keys({
    readDate: Joi.date(),
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

const updateRelatedDocuments = async (req, res, next) => {
  try {
    const querySchema = Joi.array().items(Joi.objectId());
    const paramSchema = Joi.object().keys({
      documentId: Joi.objectId().required(),
    });
    const ids = req.query.ids.split(',');

    await Promise.all([
      querySchema.validateAsync(ids),
      paramSchema.validateAsync(req.params),
    ]);

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
  updateRelatedDocuments,
};
