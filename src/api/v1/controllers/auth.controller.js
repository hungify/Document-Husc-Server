const CreateError = require('http-errors');
const User = require('../models/user.model');

const register = async (req, res, next) => {
  try {
    const { username, email, password, role, department } = req.body;

    const foundUser = await User.findOne({ email });
    if (foundUser) {
      throw CreateError.Conflict(`User with email "${email}" already exists`);
    }

    const user = new User({ username, department, email, password, role });
    const savedUser = await user.save();

    return res.status(201).json({
      message: 'success',
      data: savedUser,
    });
  } catch (error) {
    next(CreateError(error.message));
  }
};

module.exports = {
  register,
};
