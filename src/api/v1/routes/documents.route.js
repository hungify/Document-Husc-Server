const express = require('express');
const documentValidation = require('../validations/document.validation');
const documentController = require('../controllers/document.controller');
const paramValidation = require('../validations/param.validation');
const upload = require('../middlewares/multer');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

router.route('/').get(documentController.getListDocuments).post(
  // verifyAccessToken,
  // verifyRoles(ROLES.admin),
  upload.array('files', 5),
  documentValidation.createDocument,
  documentController.createDocument
);

router
  .route('/:documentId')
  .get(
    paramValidation.objectId('documentId'),
    documentController.getDocumentDetail
  )
  .patch(
    // verifyAccessToken,
    // verifyRoles(ROLES.admin),
    documentValidation.updateRelatedDocuments,
    documentController.updateRelatedDocuments
  );

module.exports = router;
