const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

const propertyDocumentSchema = new mongoose.Schema({
  documentNumber: {
    type: String,
    required: true,
  },
  signer: {
    type: String,
    required: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
  typesOfDocument: {
    ref: 'TypesOfDocument',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  urgentLevel: {
    ref: 'UrgentLevel',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  authorityIssued: {
    ref: 'Agencies',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  category: {
    ref: 'Categories',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const propertyDocument = connectToMongoLocal.model(
  'propertyDocument',
  propertyDocumentSchema
);

module.exports = propertyDocument;
