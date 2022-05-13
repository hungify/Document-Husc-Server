const CreateError = require('http-errors');
const Category = require('../models/category.model');
const { listToTreeSimple } = require('../utils');

const createCategory = async (req, res, next) => {
  try {
    const { title, parentId } = req.body;
    const foundCategory = await Category.findOne({ title }).lean();
    if (foundCategory) {
      throw CreateError.Conflict(
        `Category with value "${title}" already exists`
      );
    }
    if (parentId) {
      const foundCategoryWithSameParentId = await Category.findOne({
        _id: parentId,
      }).lean();

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

    return res.status(201).json({
      message: 'success',
      data: savedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { categoryId } = req.params;

    const foundCategory = await Category.findById(categoryId);
    if (!foundCategory) {
      throw CreateError.NotFound(
        `Category with categoryId "${categoryId}" not found`
      );
    }

    const foundCategoryWithSameTitle = await Category.findOne({ title }).lean();
    if (
      foundCategoryWithSameTitle &&
      foundCategoryWithSameTitle._id !== categoryId
    ) {
      throw CreateError.Conflict(
        `Category with value "${title}" already exists`
      );
    }

    const value = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        title,
        value,
      },
      { new: true }
    ).lean();

    return res.status(200).json({
      message: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const foundCategories = await Category.find({})
      .select('-__v -createdAt -updatedAt')
      .lean();

    const categoriesTree = listToTreeSimple(
      foundCategories,
      '_id',
      'children',
      'parentId'
    );
    return res.status(200).json({
      message: 'success',
      data: categoriesTree,
      total: foundCategories.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
};
