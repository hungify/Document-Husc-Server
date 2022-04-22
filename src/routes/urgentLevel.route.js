const express = require('express');
const urgentLevelController = require('../controllers/urgentLevel.controller');
const urgentLevelValidation = require('../validations/ugentLevel.validation');

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
    urgentLevelValidation.updateUrgentLevel,
    urgentLevelController.updateUrgentLevel
  );

module.exports = router;
