const express = require('express');
const sentController = require('../controllers/sent.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    sentController.getSentDocuments
  );

module.exports = router;
