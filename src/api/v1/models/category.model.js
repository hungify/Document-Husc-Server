const mongoose = require('mongoose');
const connectToMongoLocal = require('../../../configs/db.config');

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
      unique: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

const CategoryDocument = connectToMongoLocal.model(
  'Categories',
  categorySchema
);

module.exports = CategoryDocument;
