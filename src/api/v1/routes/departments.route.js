const express = require('express');
const departmentController = require('../controllers/department.controller');
const departmentValidation = require('../validations/department.validation');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

// router
//   .route('/')
//   .get(departmentController.getDepartments)
//   .post(
//     departmentValidation.createDepartment,
//     departmentController.createDepartment
//   );

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    departmentController.getDepartments
  )
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    departmentValidation.createDepartment,
    departmentController.createDepartment
  );

module.exports = router;
