const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Message = connectToMongoLocal.model('Messages', messageSchema);

module.exports = Message;
