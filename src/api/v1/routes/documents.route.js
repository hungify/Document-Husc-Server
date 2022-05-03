const express = require('express');
const documentValidation = require('../validations/document.validation');
const documentController = require('../controllers/document.controller');
const paramValidation = require('../validations/param.validation');
const upload = require('../middlewares/multer');

const router = express.Router();

router
  .route('/')
  .get(documentController.getListDocuments)
  .post(
    upload.array('files', 5),
    documentValidation.createDocument,
    documentController.createDocument
  );

router
  .route('/:documentId')
  .get(paramValidation.objectId, documentController.getDocumentDetail)
  .put(
    documentValidation.updateRelatedDocuments,
    documentController.updateRelatedDocuments
  );

router
  .route('/:documentId/receiver/:receiverId')
  .put(documentValidation.updateReadDate, documentController.updateReadDate);

router
  .route('/:documentId/forward/:senderId')
  .put(documentValidation.forwardDocument, documentController.forwardDocument);

module.exports = router;
