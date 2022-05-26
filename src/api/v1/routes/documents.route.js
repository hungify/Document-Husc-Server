const express = require('express');
const documentValidation = require('../validations/document.validation');
const documentController = require('../controllers/document.controller');
const paramValidation = require('../validations/param.validation');
const upload = require('../middlewares/multer');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const cache = require('../middlewares/cache');

const router = express.Router();

router
  .route('/')
  .get(documentController.getListDocuments)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    upload.array('files', 5),
    documentValidation.createDocument,
    documentController.createDocument
  );

router
  .route('/:documentId')
  .get(
    paramValidation.objectId('documentId'),
    cache.cacheDocumentDetail,
    documentController.getDocumentDetails
  )
  .put(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    upload.array('files', 5),
    paramValidation.objectId('documentId'),
    documentValidation.updateDocument,
    documentController.updateDocument
  )
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('documentId'),
    documentValidation.updateRelatedDocuments,
    documentController.updateRelatedDocuments
  )
  .delete(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('documentId'),
    documentController.revokeDocument
  );

module.exports = router;
