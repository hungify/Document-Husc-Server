const CreateError = require('http-errors');
const Document = require('../models/document.model');
const TypeOfDocument = require('../models/typeOfDocument.model');
const Agency = require('../models/agency.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const { UrgentLevel } = require('../models/ugentLevel.model');
const APICore = require('../libs/apiCore');
const { uploadFiles } = require('../utils/s3');
const { isJSON, removeEmptyObjInArrByKeys, listToTree } = require('../utils');
const _ = require('lodash');

const createDocument = async (req, res, next) => {
  try {
    const {
      //properties
      documentNumber,
      signer,
      issueDate,
      typesOfDocument,
      urgentLevel,
      agency,
      category,

      title,
      content,
      summary,
      relatedDocuments,
      publisher,
      participants,
    } = req.body;

    let participantsParsed = null;
    if (participants) {
      const participantsTemp = isJSON(participants)
        ? JSON.parse(participants)
        : participants;

      if (Array.isArray(participantsTemp)) {
        participantsParsed = _.filter(participantsTemp, (p) => {
          return p.receiver !== publisher;
        });
      } else {
        participantsParsed = participantsTemp;
      }
    }

    // get reference to typeOfDocument
    const foundTypeOfDocument = await TypeOfDocument.findOne({
      value: typesOfDocument,
    });

    if (!foundTypeOfDocument) {
      throw CreateError.BadRequest(
        `Type of document "${typesOfDocument}" does not exist`
      );
    }

    const foundAgency = await Agency.findOne({ value: agency });
    if (!foundAgency) {
      throw CreateError.BadRequest(`Agency "${agency}" does not exist`);
    }

    const foundCategory = await Category.findOne({ value: category });
    if (!foundCategory) {
      throw CreateError.BadRequest(`Category "${category}" does not exist`);
    }

    const foundUrgentLevel = await UrgentLevel.findOne({ value: urgentLevel });
    if (!foundUrgentLevel) {
      throw CreateError.BadRequest(
        `Urgent level "${urgentLevel}" does not exist`
      );
    }

    if (relatedDocuments) {
      const countValidDocuments = await Document.countDocuments({
        _id: { $in: relatedDocuments },
      }).lean();

      if (countValidDocuments !== relatedDocuments?.length) {
        throw CreateError.BadRequest(
          `Some of the relative documents does not exist`
        );
      }
    }

    const foundPublisher = await User.findOne({ _id: publisher });
    if (!foundPublisher) {
      throw CreateError.BadRequest(`Publisher "${publisher}" does not exist`);
    }

    if (participantsParsed.length > 0) {
      const countValidReceivers = await User.countDocuments({
        _id: {
          $in: participantsParsed?.map((r) => r.receiver),
        },
      });

      if (countValidReceivers === 0) {
        throw CreateError.BadRequest(`Some of the receivers does not exist`);
      }
    }

    let files = [];
    if (req.files) {
      files = await uploadFiles(req.files);
    }

    const newDocument = new Document({
      //properties
      title,
      documentNumber,
      signer,
      issueDate,
      typesOfDocument: foundTypeOfDocument._id,
      urgentLevel: foundUrgentLevel._id,
      agency: foundAgency._id,
      category: foundCategory._id,
      isPublic: Array.isArray(participantsParsed) ? false : true,

      title,
      content,
      summary,
      fileList: files,
      relatedDocuments: relatedDocuments || [],
      participants: participantsParsed,

      publisher,
    });

    const savedDocument = await newDocument.save();

    return res.status(201).json({
      message: 'Văn bản đã được ban hành thành công',
      data: savedDocument,
    });
  } catch (error) {
    next(error);
  }
};

const getListDocuments = async (req, res, next) => {
  try {
    const api = new APICore(req.query, Document)
      .paginating()
      .sorting()
      .searching()
      .filtering();

    const result = await Promise.allSettled([
      api.query
        .select(
          'agency category urgentLevel typesOfDocument documentNumber title signer issueDate fileList'
        )
        .lean({ autopopulate: true }),
      Document.countDocuments({}),
    ]);

    const documents = result[0].status === 'fulfilled' ? result[0].value : [];
    const total = result[1].status === 'fulfilled' ? result[1].value : 0;

    const keysPopulate = [
      'agency',
      'category',
      'urgentLevel',
      'typesOfDocument',
    ];

    const realDocs = removeEmptyObjInArrByKeys(documents, keysPopulate);

    return res.status(200).json({
      total,
      totalMatch: realDocs.length,
      data: realDocs,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentDetail = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { tab } = req.query;
    const foundDocument = await Document.findOne({ _id: documentId })
      .populate('agency', 'label value -_id')
      .populate('category', 'title value -_id')
      .populate('urgentLevel', 'label value colorTag -_id')
      .populate('typesOfDocument', 'label value -_id')
      .populate('publisher', 'username _id')
      .populate({
        path: 'relatedDocuments',
        select:
          'documentNumber signer title issueDate fileList urgentLevel publisher',
        populate: [
          {
            path: 'publisher',
            select: 'username _id',
          },
          {
            path: 'urgentLevel',
            select: 'label value colorTag -_id',
          },
        ],
      })
      .select('-__v -createdAt -updatedAt')
      .lean({ autopopulate: true });

    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }
    const {
      agency,
      category,
      typesOfDocument,
      documentNumber,
      urgentLevel,
      issueDate,
      signer,
      title,
      content,
      summary,
      participants,
      relatedDocuments,
      fileList,
      publisher,
      isPublic,
      isArchived,
    } = foundDocument;
    let result = [];

    if (tab === 'participants') {
      const tree = listToTree(
        participants,
        'receiver',
        'sender',
        'children',
        '_id'
      );
      const participantsTree = [
        {
          root: true,
          receiver: {
            username: publisher.username,
            _id: publisher._id,
            issueDate,
          },
          children: tree,
        },
      ];
      result = participantsTree;
    } else if (tab === 'relatedDocuments') {
      delete relatedDocuments[0].participants;
      result = relatedDocuments;
    } else if (tab === 'property') {
      result = {
        agency,
        category,
        typesOfDocument,
        documentNumber,
        urgentLevel,
        issueDate,
        signer,
        title,
        content,
        summary,
        publisher,
        isPublic,
        isArchived,
      };
    } else if (tab === 'files') {
      result = fileList;
    } else if (tab === 'analytics') {
      let read = [];
      let unread = [];

      _.forEach(participants, (p) => {
        if (p.readDate) {
          read.push({
            username: p.receiver.username,
            _id: p.receiver._id,
            readDate: p.readDate,
          });
        } else {
          unread.push({
            username: p.receiver.username,
            _id: p.receiver._id,
          });
        }
      });

      result = {
        read: {
          users: read,
          count: read.length,
        },
        unread: {
          users: unread,
          count: unread.length,
        },
      };
    } else {
      result = foundDocument;
    }

    return res.status(200).json({
      message: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateReadDate = async (req, res, next) => {
  try {
    const { documentId, receiverId } = req.params;

    const readDate = req.body.readDate || new Date();

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundReceiver = User.findOne({ _id: receiverId });
    if (!foundReceiver) {
      throw CreateError.NotFound(`Receiver "${receiverId}" does not exist`);
    }

    const updateReadDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
        participants: {
          $elemMatch: {
            receiver: receiverId,
          },
        },
      },
      {
        $set: {
          'participants.$.readDate': new Date(readDate).toLocaleDateString(),
        },
      },
      {
        new: true,
      }
    ).lean();

    return res.status(200).json({
      message: 'success',
      data: updateReadDocument,
    });
  } catch (error) {
    next(error);
  }
};

const forwardDocument = async (req, res, next) => {
  try {
    const { documentId, senderId } = req.params;
    const { receivers } = req.body;

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundSender = User.findOne({ _id: senderId });
    if (!foundSender) {
      throw CreateError.NotFound(`Sender "${senderId}" does not exist`);
    }

    const countValidReceivers = await User.countDocuments({
      _id: { $in: receivers.map((r) => r.receiverId) },
    });
    if (countValidReceivers !== receivers.length) {
      throw CreateError.BadRequest(
        `Receivers "${receivers.map((r) => r.receiverId)}" does not exist`
      );
    }
    const validSender = await Document.find({
      _id: documentId,
      participants: {
        $elemMatch: {
          receiver: senderId,
        },
      },
    });
    if (!validSender) {
      throw CreateError.BadRequest(
        `Sender "${senderId}" must be is already a receiver of document "${documentId}" from another sender in order to forward it`
      );
    }

    const existReceivers = await Document.find({
      _id: documentId,
      'participants.$.receiver': { $in: receivers.map((r) => r.receiverId) },
    }).lean({ autopopulate: true });

    const validReceivers = [];
    const invalidReceivers = [];
    _.forEach(receivers, (r) => {
      !_.forEach(existReceivers[0].participants, (p) => {
        if (
          p?.receiver?._id?.toString() === r.receiverId ||
          p?.sender?._id?.toString() === r.receiverId
        ) {
          invalidReceivers.push(r);
        } else {
          validReceivers.push(r);
        }
      });
    });

    await Document.updateOne(
      {
        _id: documentId,
        'participants.$.sender': senderId,
      },
      {
        $addToSet: {
          participants: {
            $each: validReceivers.map((r) => ({
              sender: senderId,
              receiver: r.receiverId,
              sendDate: r.sendDate || new Date(),
            })),
          },
        },
      }
    );

    return res.status(200).json({
      message:
        invalidReceivers.length > 0
          ? `Receivers "${invalidReceivers.map(
              (r) => r.receiverId
            )}" already exist in this document`
          : 'success',
      dataFailed: invalidReceivers,
      dataSuccess: validReceivers,
    });
  } catch (error) {
    next(error);
  }
};

const updateRelatedDocuments = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const ids = req.query.ids.split(',');

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const countValidRelatedDocuments = await Document.countDocuments({
      _id: { $in: ids },
    });
    if (countValidRelatedDocuments !== ids.length) {
      throw CreateError.BadRequest(`Related documents "${ids}" does not exist`);
    }

    const updateRelatedDocuments = await Document.findOneAndUpdate(
      {
        _id: documentId,
      },
      { $addToSet: { relatedDocuments: { $each: ids } } },
      {
        new: true,
      }
    ).lean();

    return res.status(200).json({
      message: 'success',
      data: updateRelatedDocuments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocument,
  getListDocuments,
  getDocumentDetail,
  updateReadDate,
  forwardDocument,
  updateRelatedDocuments,
};
