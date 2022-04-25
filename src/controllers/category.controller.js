const CreateError = require('http-errors');
const Category = require('../models/bases/category.model');

const createCategory = async (req, res, next) => {
  try {
    const { title, parentId } = req.body;
    const foundCategory = await Category.findOne({ title });
    if (foundCategory) {
      throw CreateError.Conflict(
        `Category with value "${title}" already exists`
      );
    }
    if (parentId) {
      const foundCategoryWithSameParentId = await Category.findOne({
        _id: parentId,
      });

      if (!foundCategoryWithSameParentId && parentId !== null) {
        throw CreateError.Conflict(
          `Category with parentId "${parentId}" not found`
        );
      }
    }
    const value = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');
    const newCategory = new Category({ title, value, parentId });
    const savedCategory = await newCategory.save();

    return res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { title, parentId } = req.body;
    const { categoryId } = req.params;
    const foundCategory = await Category.findById(categoryId);
    if (!foundCategory) {
      throw CreateError.NotFound(
        `Category with categoryId "${categoryId}" not found`
      );
    }

    const foundCategoryWithSameTitle = await Category.findOne({ title });
    if (
      foundCategoryWithSameTitle &&
      foundCategoryWithSameTitle._id !== categoryId
    ) {
      throw CreateError.Conflict(
        `Category with value "${title}" already exists`
      );
    }

    const foundCategoryWithSameParentId = await Category.findOne({
      _id: parentId,
    });
    if (!foundCategoryWithSameParentId && parentId !== null) {
      throw CreateError.Conflict(
        `Category with parentId "${parentId}" not found`
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title, parentId },
      { new: true }
    );

    return res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const foundCategories = await Category.find({});
    return res.status(200).json(foundCategories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
};
