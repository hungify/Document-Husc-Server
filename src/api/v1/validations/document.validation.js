const CreateError = require('http-errors');
const Joi = require('joi');
const { isJSON } = require('../utils/index');

Joi.objectId = require('joi-objectid')(Joi);

const createDocument = async (req, res, next) => {
  const documentSchema = Joi.object()
    .keys({
      type: Joi.string().valid('official', 'draft', 'archive').required(),
      documentFrom: Joi.string().valid('input', 'attach').required(),
    })
    .when('.type', {
      is: 'official',
      then: Joi.object()
        .keys({
          //classification
          typesOfDocument: Joi.string().required(),
          urgentLevel: Joi.string().required(),
          agency: Joi.string().required(),
          category: Joi.string().required(),

          //properties
          documentNumber: Joi.string().required(),
          signer: Joi.string().required(),
          title: Joi.string().required(),
          validityStatus: Joi.string()
            .valid('valid', 'invalid')
            .default('valid'),
          issueDate: Joi.date().required(),

          //related documents
          relatedDocuments: Joi.alternatives()
            .try(Joi.array().items(Joi.objectId()), Joi.string().allow(''))
            .required(), // Form data alway transfer array to empty string

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
            summary: Joi.string(),
          }),
        }),
    })
    .when('.type', {
      is: 'draft',
      then: Joi.object()
        .keys({
          //classification
          typesOfDocument: Joi.string(),
          urgentLevel: Joi.string(),
          agency: Joi.string(),
          category: Joi.string(),

          //properties
          documentNumber: Joi.string(),
          signer: Joi.string(),
          title: Joi.string(),
          validityStatus: Joi.string()
            .valid('valid', 'invalid')
            .default('valid'),
          issueDate: Joi.date(),

          //related documents
          relatedDocuments: Joi.alternatives().try(
            Joi.array().items(Joi.objectId()),
            Joi.string().allow('')
          ), // Form data alway transfer array to empty string
          participants: Joi.alternatives().try(
            Joi.array().items(
              Joi.object().keys({
                sender: Joi.objectId(),
                sendDate: Joi.date(),
                readDate: Joi.date().default(null),
                receiver: Joi.objectId(),
              })
            ),
            Joi.object().keys({
              sender: Joi.objectId(),
              sendDate: Joi.date(),
            })
          ),
        })
        .when('.documentFrom', {
          is: 'input',
          then: Joi.object().keys({
            content: Joi.string(),
          }),
        })
        .when('.documentFrom', {
          is: 'attach',
          then: Joi.object().keys({
            summary: Joi.string(),
          }),
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
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

const updateDocument = async (req, res, next) => {
  const documentSchema = Joi.object()
    .keys({
      //properties
      typesOfDocument: Joi.string(),
      urgentLevel: Joi.string(),
      agency: Joi.string(),
      category: Joi.string(),

      documentNumber: Joi.string(),
      signer: Joi.string(),

      title: Joi.string(),
      relatedDocuments: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.string().allow('')
      ), // Form data alway transfer array to empty string
      //properties
      validityStatus: Joi.string().valid('valid', 'invalid').default('valid'),
      type: Joi.string().valid('official', 'draft', 'archive').required(),
      issueDate: Joi.date(),
      documentFrom: Joi.string().valid('input', 'attach'),
      participants: Joi.alternatives().try(
        Joi.array().items(
          Joi.object().keys({
            sender: Joi.objectId(),
            sendDate: Joi.date(),
            readDate: Joi.date().default(null),
            receiver: Joi.objectId(),
          })
        ),
        Joi.object().keys({
          sender: Joi.objectId(),
          sendDate: Joi.date(),
        })
      ),
    })
    .when('.documentFrom', {
      is: 'input',
      then: Joi.object().keys({
        content: Joi.string(),
      }),
    })
    .when('.documentFrom', {
      is: 'attach',
      then: Joi.object().keys({
        summary: Joi.string(),
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
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
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
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
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
    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
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

    return next();
  } catch (error) {
    return next(CreateError.BadRequest(error.message));
  }
};

module.exports = {
  createDocument,
  updateDocument,
  getListDocuments,
  getDocumentByFilter,
  updateRelatedDocuments,
};
