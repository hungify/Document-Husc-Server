const mongoose = require('mongoose');
const connectToMongoLocal = require('../../configs/db.config');

const typesOfDocumentsSchema = new mongoose.Schema(
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
  { timestamps: true }
);

const TypeOfDocument = connectToMongoLocal.model(
  'TypesOfDocuments',
  typesOfDocumentsSchema
);

module.exports = TypeOfDocument;
