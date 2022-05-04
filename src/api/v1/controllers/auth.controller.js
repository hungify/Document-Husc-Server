const CreateError = require('http-errors');
const User = require('../models/user.model');
const {
  signInAccessToken,
  signInRefreshToken,
  verifyRefreshToken,
} = require('../middlewares/jwt');
const redisLocal = require('../../../configs/redis.config');

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
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      throw CreateError.NotFound(`User with email "${email}" not found`);
    }

    const isMatch = await foundUser.isMatchPassword(password);

    if (!isMatch) {
      throw CreateError.Unauthorized('Invalid credentials');
    }

    const accessToken = await signInAccessToken(foundUser._id);
    const refreshToken = await signInRefreshToken(foundUser._id);

    return res.status(200).json({
      message: 'success',
      data: {
        accessToken,
        refreshToken,
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

    const { userId } = await verifyRefreshToken(refreshToken);

    const newAccessToken = await signInAccessToken(userId);
    const newRefreshToken = await signInRefreshToken(userId);

    return res.status(200).json({
      message: 'success',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    let { refreshToken } = req.body;
    if (!refreshToken) throw CreateError.BadRequest();
    if (refreshToken.startsWith('Bearer '))
      refreshToken = refreshToken.slice(7);

    if (!refreshToken) {
      throw CreateError.BadRequest();
    }

    const { userId } = await verifyRefreshToken(refreshToken);

    redisLocal.del(userId.toString(), (err, reply) => {
      if (err) throw CreateError.InternalServerError();

      return res.status(200).json({
        message: 'success',
      });
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
