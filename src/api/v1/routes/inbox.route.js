const express = require('express');
const inboxController = require('../controllers/inbox.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

// router
//   .route('/:userId')
//   .get(
//     inboxController.getInboxDocuments
//   );

router
  .route('/:userId')
  .get(
    verifyAccessToken,
    paramValidation.objectId('userId'),
    verifyRoles(ROLES.user, ROLES.admin),
    inboxController.getInboxDocuments
  );

module.exports = router;
