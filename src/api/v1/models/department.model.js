const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const departmentSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = connectToMongoLocal.model('Departments', departmentSchema);

module.exports = Department;
