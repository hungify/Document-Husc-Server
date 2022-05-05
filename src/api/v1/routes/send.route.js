const express = require('express');
const sendController = require('../controllers/send.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const sendValidation = require('../validations/send.validation');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    sendController.getSendDocuments
  );

router
  .route('/:documentId/forward')
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    paramValidation.objectId('documentId'),
    sendValidation.forwardDocument,
    sendController.forwardDocument
  );

module.exports = router;
