const CreateError = require('http-errors');
const User = require('../models/user.model');

const getAllUsersNotMe = async (req, res, next) => {
  try {
    const userId = req?.payload?.userId; // get from jwt middleware
    if (!userId) {
      throw CreateError.BadRequest('User not found');
    }

    const users = await User.find({
      _id: { $ne: userId },
    })
      .select('-password -__v -createdAt -updatedAt')
      .populate('department', 'label')
      .lean();

    return res.status(200).json({
      message: 'success',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req?.payload?.userId; // get from jwt middleware
    if (!userId) {
      throw CreateError.BadRequest('User not found');
    }

    const user = await User.findById(userId).select(
      '-password -__v -createdAt -updatedAt -_id -role'
    );
    if (!user) {
      throw CreateError.BadRequest('User not found');
    }

    return res.status(200).json({
      message: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsersNotMe,
  getProfile,
};
