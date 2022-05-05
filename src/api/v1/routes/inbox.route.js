const express = require('express');
const inboxController = require('../controllers/inbox.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const inboxValidation = require('../validations/inbox.validation');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    inboxController.getInboxDocuments
  );

router
  .route('/:documentId/read')
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    paramValidation.objectId('documentId'),
    inboxValidation.updateReadDocument,
    inboxController.updateReadDocument
  );

module.exports = router;
