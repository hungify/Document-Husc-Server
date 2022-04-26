const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const departmentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
  ],
  timestamps: true,
});

const Department = connectToMongoLocal.model('Departments', departmentSchema);

module.exports = Department;
