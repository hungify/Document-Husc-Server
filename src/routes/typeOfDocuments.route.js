const express = require('express');
const typesOfDocumentController = require('../controllers/typesOfDocuments.controller');
const typesOfDocumentValidation = require('../validations/typesOfDocuments.validation');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(typesOfDocumentController.getAllTypesOfDocuments)
  .post(
    typesOfDocumentValidation.createTypesOfDocuments,
    typesOfDocumentController.createTypesOfDocuments
  );

router
  .route('/:typesOfDocumentId')
  .put(
    paramValidation.objectId,
    typesOfDocumentValidation.createTypesOfDocuments,
    typesOfDocumentController.updateTypesOfDocuments
  );

module.exports = router;
