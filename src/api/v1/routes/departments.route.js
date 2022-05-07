const express = require('express');
const departmentController = require('../controllers/department.controller');
const departmentValidation = require('../validations/department.validation');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const paramsValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(departmentController.getDepartments)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    departmentValidation.createDepartment,
    departmentController.createDepartment
  );

router
  .route('/:departmentId')
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramsValidation.objectId('departmentId'),
    departmentValidation.updateDepartment,
    departmentController.updateDepartment
  );

module.exports = router;
