const express = require('express');
const categoryController = require('../controllers/category.controller');
const categoryValidate = require('../validations/category.validation');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(categoryValidate.createCategory, categoryController.createCategory);

router
  .route('/:categoryId')
  .put(categoryValidate.updateCategory, categoryController.updateCategory);

module.exports = router;
