const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        ref: 'Users',
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    messages: [
      {
        ref: 'Messages',
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);

const Conversation = connectToMongoLocal.model(
  'Conversations',
  conversationSchema
);

module.exports = Conversation;
