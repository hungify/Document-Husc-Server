const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

const categorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Categories',
    },
  ],
});

const CategoryDocument = connectToMongoLocal.model(
  'Categories',
  categorySchema
);

module.exports = CategoryDocument;
