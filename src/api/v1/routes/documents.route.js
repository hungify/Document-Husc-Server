const express = require('express');
const documentValidation = require('../validations/document.validation');
const documentController = require('../controllers/document.controller');
const paramValidation = require('../validations/param.validation');
const upload = require('../middlewares/multer');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

// router
//   .route('/')
//   .get(
//     documentController.getListDocuments
//   )
//   .post(
//     upload.array('files', 5),
//     documentValidation.createDocument,
//     documentController.createDocument
//   );

// router
//   .route('/:documentId')
//   .get(
//     paramValidation.objectId,
//     documentController.getDocumentDetail
//   )
//   .patch(
//     documentValidation.updateRelatedDocuments,
//     documentController.updateRelatedDocuments
//   );

// router
//   .route('/:documentId/receiver/:receiverId/read')
//   .patch(
//     documentValidation.updateReadDate,
//     documentController.updateReadDate
//   );

// router.route('/:documentId/sender/:senderId/forward').patch(
//   // paramValidation.objectId,
//   documentController.forwardDocument
// );

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    documentController.getListDocuments
  )
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
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    paramValidation.objectId('documentId'),
    documentController.getDocumentDetail
  )
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    documentValidation.updateRelatedDocuments,
    documentController.updateRelatedDocuments
  );

router
  .route('/:documentId/receiver/:receiverId/read')
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    paramValidation.objectId('documentId', 'receiverId'),
    documentValidation.updateReadDate,
    documentController.updateReadDate
  );

router
  .route('/:documentId/sender/:senderId/forward')
  .patch(
    verifyAccessToken,
    paramValidation.objectId('documentId', 'senderId'),
    verifyRoles(ROLES.user, ROLES.admin),
    documentController.forwardDocument
  );

module.exports = router;
