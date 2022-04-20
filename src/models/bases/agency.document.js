const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

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
});

const AgencyDocument = connectToMongoLocal.model(
  'Agencies',
  agencyDocumentSchema
);

module.exports = AgencyDocument;
