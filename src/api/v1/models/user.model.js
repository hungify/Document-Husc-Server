const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { connectToMongoLocal } = require('../../../configs/db.config');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      _id: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Departments',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    const salt = await bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hashSync(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isMatchPassword = async function (password) {
  try {
    return await bcryptjs.compareSync(password, this.password);
  } catch (error) {
    console.log(error);
  }
};

const User = connectToMongoLocal.model('Users', userSchema);

module.exports = User;
