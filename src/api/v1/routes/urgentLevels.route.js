const express = require('express');
const urgentLevelController = require('../controllers/urgentLevel.controller');
const urgentLevelValidation = require('../validations/ugentLevel.validation');
const paramValidation = require('../validations/param.validation');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    urgentLevelController.getAllUrgentLevels
  )
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    urgentLevelValidation.createUrgentLevel,
    urgentLevelController.createUrgentLevel
  );

router
  .route('/:urgentLevelId')
  .put(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('urgentLevelId'),
    urgentLevelValidation.updateUrgentLevel,
    urgentLevelController.updateUrgentLevel
  );

module.exports = router;
