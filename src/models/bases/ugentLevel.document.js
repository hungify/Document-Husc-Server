const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

const urgentLevelSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  colorTag: {
    type: String,
    enum: ['red', 'green'],
  },
});

const UrgentLevel = connectToMongoLocal.model('UrgentLevel', urgentLevelSchema);
