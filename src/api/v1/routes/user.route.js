const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

router.route('/').get(
  // verifyAccessToken,
  // verifyRoles(ROLES.admin),
  userController.getAllUsers
);

module.exports = router;
