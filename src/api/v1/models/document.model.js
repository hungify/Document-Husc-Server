const mongoose = require('mongoose');
const { connectToMongoLocal } = require('../../../configs/db.config');

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['draft', 'official', 'archive'],
      required: true,
    },
    //Properties
    documentNumber: {
      type: String,
      required: [
        function () {
          return this.type === 'official';
        },
        'documentNumber is required if type is official',
      ],
    },
    signer: {
      type: String,
      required: [
        function () {
          return this.type === 'official';
        },
        'signer is required if type is official',
      ],
    },
    issueDate: {
      type: Date,
      required: [
        function () {
          return this.type === 'official';
        },
        'issueDate is required if type is official',
      ],
    },
    typesOfDocument: {
      ref: 'TypesOfDocuments',
      type: mongoose.Schema.Types.ObjectId,
      required: [
        function () {
          return this.type === 'official';
        },
        'typesOfDocument is required if type is official',
      ],
    },
    urgentLevel: {
      ref: 'UrgentLevel',
      type: mongoose.Schema.Types.ObjectId,
      required: [
        function () {
          return this.type === 'official';
        },
        'urgentLevel is required if type is official',
      ],
    },
    agency: {
      ref: 'Agencies',
      type: mongoose.Schema.Types.ObjectId,
      required: [
        function () {
          return this.type === 'official';
        },
        'agency is required if type is official',
      ],
    },
    category: {
      ref: 'Categories',
      type: mongoose.Schema.Types.ObjectId,
      required: [
        function () {
          return this.type === 'official';
        },
        'category is required if type is official',
      ],
    },
    title: {
      type: String,
      required: [
        function () {
          return this.type === 'official';
        },
        'title is required if type is official',
      ],
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
      required: [
        function () {
          return this.type === 'official';
        },
        'isPublic is required if type is official',
      ],
    },
    relatedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Documents',
        default: [],
      },
    ],
    publisher: {
      ref: 'Users',
      type: mongoose.Schema.Types.ObjectId,
      autopopulate: { select: 'username avatar email _id' },
      required: [
        function () {
          return this.type === 'official';
        },
        'publisher is required if type is official',
      ],
    },
    participants: [
      {
        _id: false,
        sender: {
          ref: 'Users',
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          autopopulate: { select: 'username avatar email _id' },
        },
        sendDate: {
          type: Date,
          default: null,
        },
        receiver: {
          ref: 'Users',
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: { select: 'username avatar email _id' },
        },
        readDate: {
          type: Date,
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
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversations',
      required: [
        function () {
          return this.type === 'official' && this.participants?.receiver;
        },
        'Conversations is required if type is official and participants.receiver is defined',
      ],
    },
  },
  { autoIndex: false, timestamps: true }
);

documentSchema.index({ title: 'text', documentNumber: 'text' });
documentSchema.plugin(require('mongoose-autopopulate'));

documentSchema.statics = {
  searchFull: function (q) {
    return this.find({
      $text: {
        $search: q,
        $caseSensitive: false,
      },
    });
  },
};

const Document = connectToMongoLocal.model('Documents', documentSchema);
Document.createIndexes();

module.exports = Document;
