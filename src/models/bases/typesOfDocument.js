const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

const typesOfDocumentSchema = new mongoose.Schema({
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

const TypesOfDocument = connectToMongoLocal.model(
  'TypesOfDocument',
  typesOfDocumentSchema
);

module.exports = TypesOfDocument;
