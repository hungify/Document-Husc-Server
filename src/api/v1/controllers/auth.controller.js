const CreateError = require('http-errors');
const User = require('../models/user.model');
const {
  signInAccessToken,
  signInRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../middlewares/jwt');

const register = async (req, res, next) => {
  try {
    const { username, email, password, role, department } = req.body;

    const foundUser = await User.findOne({ email });
    if (foundUser) {
      throw CreateError.Conflict(`User with email "${email}" already exists`);
    }
    const avatar = username.chartAt(0).toUpperCase();
    const user = new User({
      username,
      department,
      email,
      avatar,
      password,
      role,
    });
    const savedUser = await user.save();

    return res.status(201).json({
      message: 'success',
      data: savedUser,
    });
  } catch (error) {
    next(CreateError(error.message));
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      throw CreateError.NotFound(`Email or password is incorrect`);
    }

    const isMatch = await foundUser.isMatchPassword(password);

    if (!isMatch) {
      throw CreateError.Unauthorized('Email or password is incorrect');
    }

    const accessToken = await signInAccessToken({
      userId: foundUser._id,
      role: foundUser.role,
    });
    const refreshToken = await signInRefreshToken({
      userId: foundUser._id,
      role: foundUser.role,
    });

    return res.status(200).json({
      message: 'success',
      data: {
        accessToken,
        refreshToken,
        role: foundUser.role,
        userId: foundUser._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    let { refreshToken } = req.body;
    if (!refreshToken) throw CreateError.BadRequest();
    if (refreshToken.startsWith('Bearer '))
      refreshToken = refreshToken.slice(7);

    const { userId, role } = await verifyRefreshToken(refreshToken);

    const newAccessToken = await signInAccessToken({ userId, role });
    const newRefreshToken = await signInRefreshToken({ userId, role });

    return res.status(200).json({
      message: 'success',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userId: userId,
        role: role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    let { refreshToken } = req.params;
    if (!refreshToken) throw CreateError.BadRequest();
    if (refreshToken.startsWith('Bearer '))
      refreshToken = refreshToken.slice(7);

    if (!refreshToken) {
      throw CreateError.BadRequest('Refresh token is required');
    }

    const payload = await verifyRefreshToken(refreshToken);
    await revokeRefreshToken(payload.userId);

    return res.status(200).json({
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
