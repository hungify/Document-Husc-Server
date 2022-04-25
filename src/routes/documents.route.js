const express = require('express');
const documentValidation = require('../validations/document.validation');
const documentController = require('../controllers/document.controller');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(documentController.getListDocuments)
  .post(documentValidation.createDocument, documentController.createDocument);

router
  .route('/:documentId')
  .get(paramValidation.objectId, documentController.getDocumentDetail);

router.route('/:documentId/receivers/:senderId/:receiverId').put(
  // paramValidation.objectId,
  documentValidation.updateReadDate,
  documentController.updateReadDate
);

router.route('/:documentId/forward/:senderId').put(
  // paramValidation.objectId,
  documentController.forwardDocument
);

module.exports = router;
