const express = require('express');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const router = express.Router();
const ROLES = require('../../../configs/roles.config');
const verifyRoles = require('../middlewares/roles');

router
  .route('/register')
  .post(authValidation.register, authController.register);

router.route('/login').post(authValidation.login, authController.login);

router
  .route('/refresh-token')
  .post(authValidation.refreshToken, authController.refreshToken);

router
  .route('/logout/:refreshToken')
  .delete(authValidation.logout, authController.logout);

module.exports = router;
