const CreateError = require('http-errors');
const User = require('../models/user.model');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password -__v -createdAt -updatedAt')
      .populate('department', 'label')
      .lean();

    res.status(200).json({
      message: 'success',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
};
