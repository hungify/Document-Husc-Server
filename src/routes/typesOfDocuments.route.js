const express = require('express');
const typesOfDocumentController = require('../controllers/typesOfDocuments.controller');
const typesOfDocumentValidation = require('../validations/typesOfDocuments.validation');

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
    typesOfDocumentValidation.createTypesOfDocuments,
    typesOfDocumentController.updateTypesOfDocuments
  );

module.exports = router;
