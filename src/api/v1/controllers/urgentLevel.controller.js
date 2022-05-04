const CreateError = require('http-errors');
const { UrgentLevel } = require('../models/ugentLevel.model');

const createUrgentLevel = async (req, res, next) => {
  try {
    const { label, colorTag } = req.body;
    const foundUrgentLevel = await UrgentLevel.findOne({ label }).lean();
    if (foundUrgentLevel) {
      throw CreateError.Conflict(
        `UrgentLevel with value "${label}" already exists`
      );
    }
    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');

    const newUrgentLevel = new UrgentLevel({ label, value, colorTag });
    const savedUrgentLevel = await newUrgentLevel.save();
    return res.status(201).json({
      message: 'success',
      data: savedUrgentLevel,
    });
  } catch (error) {
    next(error);
  }
};

const updateUrgentLevel = async (req, res, next) => {
  try {
    const { label, colorTag } = req.body;
    const { urgentLevelId } = req.params;

    const foundUrgentLevel = await UrgentLevel.findById(urgentLevelId)
      .select('-__v -createdAt -updatedAt')
      .lean();
    if (!foundUrgentLevel) {
      throw CreateError.NotFound(
        `UrgentLevel with id "${urgentLevelId}" not found`
      );
    }

    const foundUrgentLevelWithSameLabel = await UrgentLevel.findOne({
      label,
    }).lean();

    if (
      foundUrgentLevelWithSameLabel &&
      foundUrgentLevelWithSameLabel._id !== urgentLevelId
    ) {
      throw CreateError.Conflict(
        `UrgentLevel with value "${label}" already exists`
      );
    }

    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');

    const updatedUrgentLevel = await UrgentLevel.findByIdAndUpdate(
      urgentLevelId,
      { label, value, colorTag },
      { new: true }
    );
    return res.status(200).json({
      message: 'success',
      data: updatedUrgentLevel,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUrgentLevels = async (req, res, next) => {
  try {
    const foundUrgentLevels = await UrgentLevel.find({}).lean();
    return res.status(200).json({
      message: 'success',
      data: foundUrgentLevels,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUrgentLevel,
  updateUrgentLevel,
  getAllUrgentLevels,
};
