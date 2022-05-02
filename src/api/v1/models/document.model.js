const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

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
    issueDate: {
      type: Date,
      required: true,
    },
    typesOfDocument: {
      ref: 'TypesOfDocuments',
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
    relatedDocuments: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Documents',
        default: [],
      },
    ],
    publisher: {
      ref: 'Users',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    participants: [
      {
        _id: false,
        sender: {
          ref: 'Users',
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          autopopulate: { select: 'username avatar ' },
        },
        sendDate: {
          type: Date,
          default: null,
        },
        readDate: {
          type: Date,
          default: null,
        },
        receiver: {
          ref: 'Users',
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          autopopulate: { select: 'username avatar ' },
        },
      },
    ],
    fileList: [
      {
        _id: false,
        originalName: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { autoIndex: false, timestamps: true }
);

documentSchema.index({ title: 'text', documentNumber: 'text' });
documentSchema.plugin(require('mongoose-autopopulate'));

documentSchema.statics = {
  searchPartial: function (q, callback) {
    return this.find(
      {
        $or: [{ title: new RegExp(q, 'gi') }, { body: new RegExp(q, 'gi') }],
      },
      callback
    );
  },
  searchFull: function (q, callback) {
    return this.find(
      {
        $text: { $search: q, $caseSensitive: false },
      },
      callback
    );
  },
  search: async function (q, callback) {
    const documents = await this.searchFull(q);
    const partialDocuments = await this.searchPartial(q);
    if (documents.length > 0) {
      return documents;
    } else if (partialDocuments.length > 0) {
      return partialDocuments;
    } else {
      return [];
    }
  },
};

const Document = connectToMongoLocal.model('Documents', documentSchema);
Document.createIndexes();

module.exports = Document;
