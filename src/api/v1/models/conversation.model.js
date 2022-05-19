const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Users',
        },
      ],
    },
    messages: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Messages',
        },
      ],
    },
  },
  { timestamps: true }
);

const Conversation = connectToMongoLocal.model(
  'Conversations',
  conversationSchema
);

module.exports = Conversation;
