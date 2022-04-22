const mongoose = require('mongoose');
const connectToMongoLocal = require('../../configs/db.config');
const COLORS_ENUM = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
];

const urgentLevelSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  colorTag: {
    type: String,
    enum: COLORS_ENUM,
    required: true,
  },
  timestamps: true,
});

const UrgentLevel = connectToMongoLocal.model('UrgentLevel', urgentLevelSchema);

module.exports = {
  UrgentLevel,
  COLORS_ENUM,
};
