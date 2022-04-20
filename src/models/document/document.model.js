const connectToMongoLocal = require('../configs/connectDB');
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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
  },
  isFinish: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  properties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Properties',
    },
  ],
  relativeDocuments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Documents',
    },
  ],
  fileList: [
    {
      fileName: {
        type: String,
      },
      filePath: {
        type: String,
      },
    },
  ],
  treeProcessing: [
    {
      key: {
        type: String,
        required: true,
        default: 'root',
      },
      name: {
        type: String,
        required: true,
      },
      publishDate: {
        type: Date,
        required: true,
      },
      children: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Receivers',
        },
      ],
    },
  ],
});

const Document = connectToMongoLocal.model('Documents', documentSchema);

module.exports = Document;
