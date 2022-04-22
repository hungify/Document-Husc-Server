const mongoose = require('mongoose');
const connectToMongoLocal = require('../../configs/db.config');

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  parentId: {
    type: String,
    default: null,
  },
});

const CategoryDocument = connectToMongoLocal.model(
  'Categories',
  categorySchema
);

module.exports = CategoryDocument;
