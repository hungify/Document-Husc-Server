const express = require('express');
const departmentController = require('../controllers/department.controller');
const departmentValidation = require('../validations/department.validation');

const router = express.Router();

router
  .route('/')
  .get(departmentController.getDepartments)
  .post(
    departmentValidation.createDepartment,
    departmentController.createDepartment
  );

module.exports = router;
