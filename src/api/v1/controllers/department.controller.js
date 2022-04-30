const CreateError = require('http-errors');
const Department = require('../models/department.model');

const createDepartment = async (req, res, next) => {
  try {
    const { label } = req.body;

    const foundDepartment = await Department.findOne({ label });

    if (foundDepartment) {
      throw CreateError.Conflict(
        `Department with value "${label}" already exists`
      );
    }

    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');
    const newDepartment = new Department({ label, value });

    const savedDepartment = await newDepartment.save();

    return res.status(201).json({
      message: 'success',
      data: savedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();

    return res.status(200).json({
      message: 'success',
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
};
