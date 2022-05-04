const express = require('express');
const ROLES = require('../../../configs/roles.config');
const dashboardController = require('.././controllers/dashboard.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const router = express.Router();

router
  .route('/analytics')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    dashboardController.getAnalytics
  );

module.exports = router;
