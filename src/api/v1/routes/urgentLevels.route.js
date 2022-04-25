const express = require('express');
const urgentLevelController = require('../controllers/urgentLevel.controller');
const urgentLevelValidation = require('../validations/ugentLevel.validation');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(urgentLevelController.getAllUrgentLevels)
  .post(
    urgentLevelValidation.createUrgentLevel,
    urgentLevelController.createUrgentLevel
  );

router
  .route('/:urgentLevelId')
  .put(
    paramValidation.objectId,
    urgentLevelValidation.updateUrgentLevel,
    urgentLevelController.updateUrgentLevel
  );

module.exports = router;
