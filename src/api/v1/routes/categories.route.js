const express = require('express');
const categoryController = require('../controllers/category.controller');
const categoryValidate = require('../validations/category.validation');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');
const paramValidation = require('../validations/param.validation');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    categoryValidate.createCategory,
    categoryController.createCategory
  );

router.route('/:categoryId').put(
  verifyAccessToken,
  verifyRoles(ROLES.admin),
  paramValidation.objectId('categoryId'),
  categoryValidate.updateCategory,
  categoryController.updateCategory
);

module.exports = router;
