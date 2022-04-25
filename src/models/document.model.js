const connectToMongoLocal = require('../configs/db.config');
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    //Properties
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
    agency: {
      ref: 'Agencies',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    category: {
      ref: 'Categories',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    summary: {
      type: String,
    },
    validityStatus: {
      type: String,
      enum: ['valid', 'invalid'],
      default: 'valid',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    relativeDocuments: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Documents',
        default: [],
      },
    ],
    publisherId: {
      ref: 'Users',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    publishDate: {
      type: Date,
      required: true,
    },
    participants: [
      {
        _id: false,
        senderId: {
          ref: 'Users',
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        sendDate: {
          type: Date,
          default: null,
        },
        receivers: [
          {
            _id: false,
            readDate: {
              type: Date,
              default: null,
            },
            receiverId: {
              ref: 'Users',
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
          },
        ],
      },
    ],
    fileList: [
      {
        _id: false,
        fileName: {
          type: String,
        },
        filePath: {
          type: String,
        },
      },
    ],
  },
  { autoIndex: false, timestamps: true }
);

documentSchema.index({ title: 'text', documentNumber: 'text' });

const Document = connectToMongoLocal.model('Documents', documentSchema);
Document.createIndexes();

module.exports = Document;
