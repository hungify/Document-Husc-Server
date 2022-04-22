const mongoose = require('mongoose');
const connectToMongoLocal = require('../../configs/db.config');

const agencySchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  timestamps: true,
});

const AgencyDocument = connectToMongoLocal.model('Agencies', agencySchema);

module.exports = AgencyDocument;
