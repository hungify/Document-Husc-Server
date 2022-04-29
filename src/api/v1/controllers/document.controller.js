const CreateError = require('http-errors');
const Document = require('../models/document.model');
const TypeOfDocument = require('../models/typeOfDocument.model');
const Agency = require('../models/agency.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const { UrgentLevel } = require('../models/ugentLevel.model');
const APICore = require('../libs/apiCore');
const { uploadFiles } = require('../utils/s3');

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
      relativeDocuments,
      publisher,
      publishDate,
      participants,
    } = req.body;

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

    if (relativeDocuments) {
      const countValidDocuments = await Document.countDocuments({
        _id: { $in: relativeDocuments },
      }).exec();

      if (countValidDocuments !== relativeDocuments?.length) {
        throw CreateError.BadRequest(
          `Some of the relative documents are invalid`
        );
      }
    }

    const foundPublisher = await User.findOne({ _id: publisher });
    if (!foundPublisher) {
      throw CreateError.BadRequest(`Publisher "${publisher}" does not exist`);
    }

    if (participants) {
      const validSender = User.findOne({ _id: participants[0].senderId });
      if (!validSender) {
        throw CreateError.BadRequest(
          `Sender "${participants[0].senderId}" does not exist`
        );
      }

      const countValidReceivers = await User.countDocuments({
        _id: {
          $in: participants[0].receivers.map((r) => r.receiverId),
        },
      });

      if (countValidReceivers === 0) {
        throw CreateError.BadRequest(`Some of the parents are invalid`);
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

      title,
      content,
      summary,
      fileList: files,
      relativeDocuments,

      publisher,
      publishDate,
    });

    const savedDocument = await newDocument.save();

    return res.status(201).json({
      message: 'Văn bản đã được ban hành thành công',
      savedDocument,
    });
  } catch (error) {
    next(error);
  }
};

const getListDocuments = async (req, res, next) => {
  try {
    const api = new APICore(req.query, Document.find({}))
      .paginating()
      .sorting()
      .searching()
      .filtering();

    const result = await Promise.allSettled([
      api.query
        .populate('agency', 'label value -_id')
        .populate('category', 'title value -_id')
        .populate('urgentLevel', 'label value colorTag -_id')
        .populate('typesOfDocument', 'label value -_id')
        .populate('publisher', 'username -_id')
        .select(
          'agency category urgentLevel typesOfDocument documentNumber title signer issueDate fileList'
        ),
      Document.countDocuments({}),
    ]);

    const documents = result[0].status === 'fulfilled' ? result[0].value : [];
    const total = result[1].status === 'fulfilled' ? result[1].value : 0;
    const realDocs = documents.filter((d) => d.category); //populate will be null if filter is't match

    return res.status(200).json({
      total,
      totalMatch: realDocs.length,
      documents: realDocs,

      documents: documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentDetail = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const foundDocument = await Document.findOne({ _id: documentId })
      .select('-__v')
      .populate('agency', 'label value -_id')
      .populate('category', 'title value -_id')
      .populate('urgentLevel', 'label value colorTag -_id')
      .populate('typesOfDocument', 'label value -_id')
      .populate('publisher', 'username -_id')
      .select('-__v -createdAt -updatedAt')
      .exec();

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
    } = foundDocument;

    const result = {
      property: {
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
      },
      files: foundDocument.fileList,
      participants: foundDocument.participants,
      relatedDocuments: foundDocument.relativeDocuments,
    };

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateReadDate = async (req, res, next) => {
  try {
    const { documentId, receiverId, senderId } = req.params;

    const { readDate } = req.body;

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundReceiver = User.findOne({ _id: receiverId });
    if (!foundReceiver) {
      throw CreateError.NotFound(`Receiver "${receiverId}" does not exist`);
    }

    const foundSender = User.findOne({ _id: senderId });
    if (!foundSender) {
      throw CreateError.NotFound(`Sender "${senderId}" does not exist`);
    }

    const updateReadDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
        participants: {
          $elemMatch: {
            senderId: senderId,
          },
        },
      },
      {
        $set: {
          'participants.$[elm1].receivers.$[elm2].readDate': readDate,
        },
      },
      {
        arrayFilters: [
          {
            'elm1.senderId': senderId,
          },
          {
            'elm2.receiverId': receiverId,
          },
        ],
      }
    ).exec();

    return res.status(200).json(updateReadDocument);
  } catch (error) {
    next(error);
  }
};

const forwardDocument = async (req, res, next) => {
  try {
    const { documentId, senderId } = req.params;
    const { receivers, forwardDate } = req.body;

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundSender = User.findOne({ _id: senderId });
    if (!foundSender) {
      throw CreateError.NotFound(`Sender "${senderId}" does not exist`);
    }

    const isExistSender = await Document.findOne(
      {
        _id: documentId,
        'participants.senderId': senderId,
      },
      {
        'participants.$': 1,
      }
    );
    if (isExistSender) {
      // sender is already in participants
      const updatedNewReceivers = await Document.findOneAndUpdate(
        {
          _id: documentId,
          'participants.senderId': senderId,
        },
        {
          $addToSet: {
            'participants.$.forwardDate': forwardDate,
            'participants.$.receivers': receivers.map((r) => ({
              receiverId: r,
              readDate: null,
            })),
          },
        },
        {
          new: true,
        }
      ).exec();
      return res.status(200).json(updatedNewReceivers);
    } else {
      const forwardedDocument = await Document.findOneAndUpdate(
        {
          _id: documentId,
        },
        {
          $push: {
            participants: [
              {
                senderId: senderId,
                receivers: receivers.map((r) => ({
                  receiverId: r,
                  readDate: null,
                })),
              },
            ],
          },
        },
        {
          new: true,
        }
      ).exec();
      return res.status(200).json(forwardedDocument);
    }
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
};
