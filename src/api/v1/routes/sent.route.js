const express = require('express');
const sentController = require('../controllers/sent.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const parmaValidation = require('../validations/param.validation');

const router = express.Router();

// router
//   .route('/:userId')
//   .get(
//     sentController.getSentDocuments
//   );

router
  .route('/:userId')
  .get(
    verifyAccessToken,
    parmaValidation.objectId('userId'),
    verifyRoles(ROLES.user, ROLES.admin),
    sentController.getSentDocuments
  );

module.exports = router;
