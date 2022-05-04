const express = require('express');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router
  .route('/register')
  .post(authValidation.register, authController.register);

router.route('/login').post(authValidation.login, authController.login);

router
  .route('/refresh-token')
  .post(authValidation.refreshToken, authController.refreshToken);

router.route('/logout').post(authValidation.logout, authController.logout);

module.exports = router;
