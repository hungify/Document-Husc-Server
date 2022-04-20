const mongoose = require('mongoose');
const connectToMongoLocal = require('../configs/connectDB');

const receiverSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  readDate: {
    type: Date,
  },
  forwardDate: {
    type: Date,
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Receivers',
    },
  ],
});

const receiverDocument = connectToMongoLocal.model('Receivers', receiverSchema);

module.exports = receiverDocument;
