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
const { getPayload } = require('../middlewares/jwt');

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
      participants,
    } = req.body;

    const publisher = req.payload?.userId;

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

    const relatedDocumentsList =
      relatedDocuments && _.isString(relatedDocuments)
        ? relatedDocuments.split(',')
        : [];

    if (relatedDocumentsList.length > 0) {
      const countValidDocuments = await Document.countDocuments({
        _id: { $in: relatedDocumentsList },
      }).lean();

      if (countValidDocuments !== relatedDocumentsList?.length) {
        throw CreateError.BadRequest(
          `Some of the related documents does not exist`
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

    const files = req.files ? await uploadFiles(req.files) : [];

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
      relatedDocuments: relatedDocumentsList,
      participants: participantsParsed,

      publisher,
    });

    const savedDocument = await newDocument.save();

    return res.status(201).json({
      message: 'success',
      data: savedDocument,
    });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
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
      participants,
    } = req.body;

    const publisher = req.payload?.userId;

    const { documentId } = req.params;

    if (!documentId) {
      throw CreateError.BadRequest('Document id is required');
    }

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
    })
      .select('_id')
      .lean();

    if (!foundTypeOfDocument) {
      throw CreateError.BadRequest(
        `Type of document "${typesOfDocument}" does not exist`
      );
    }

    const foundAgency = await Agency.findOne({ value: agency })
      .select('_id')
      .lean();
    if (!foundAgency) {
      throw CreateError.BadRequest(`Agency "${agency}" does not exist`);
    }

    const foundCategory = await Category.findOne({ value: category })
      .select('_id')
      .lean();
    if (!foundCategory) {
      throw CreateError.BadRequest(`Category "${category}" does not exist`);
    }

    const foundUrgentLevel = await UrgentLevel.findOne({ value: urgentLevel })
      .select('_id')
      .lean();
    if (!foundUrgentLevel) {
      throw CreateError.BadRequest(
        `Urgent level "${urgentLevel}" does not exist`
      );
    }

    const relatedDocumentsList =
      relatedDocuments && _.isString(relatedDocuments)
        ? relatedDocuments.split(',')
        : [];

    if (relatedDocumentsList.length > 0) {
      const countValidDocuments = await Document.countDocuments({
        _id: { $in: relatedDocumentsList },
      }).lean();

      if (countValidDocuments !== relatedDocumentsList?.length) {
        throw CreateError.BadRequest(
          `Some of the related documents does not exist`
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

    const updatedDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
      },
      {
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
        relatedDocuments: relatedDocumentsList,
        participants: participantsParsed,

        publisher,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      message: 'success',
      data: updatedDocument,
    });
  } catch (error) {
    next(error);
  }
};

const getListDocuments = async (req, res, next) => {
  try {
    const payload = await getPayload(req);
    const api = new APICore(req.query, Document, payload?.userId)
      .paginating()
      .sorting()
      .searching()
      .filtering();

    const result = await Promise.allSettled([
      api.query.lean({ autopopulate: true }),
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

const getDocumentDetails = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { tab } = req.query;
    const payload = await getPayload(req);

    if (!tab) {
      // if tab is not defined, return all document details
      const foundDocument = await Document.findOne({
        _id: documentId,
        isArchived: {
          $eq: false,
        },
      })
        .populate('agency', 'label value -_id')
        .populate('category', 'title value -_id')
        .populate('urgentLevel', 'label value  -_id')
        .populate('typesOfDocument', 'label value -_id')
        .select('-__v -createdAt -updatedAt')
        .lean({ autopopulate: true });

      if (!foundDocument) {
        throw CreateError.BadRequest(`Document "${documentId}" does not exist`);
      }

      const property = {
        agency: foundDocument.agency,
        category: foundDocument.category,
        typesOfDocument: foundDocument.typesOfDocument,
        urgentLevel: foundDocument.urgentLevel,
        documentNumber: foundDocument.documentNumber,
        issueDate: foundDocument.issueDate,
        signer: foundDocument.signer,
        title: foundDocument.title,
        content: foundDocument.content,
        summary: foundDocument.summary,
        publisher: foundDocument.publisher,
        isPublic: foundDocument.isPublic,
      };
      const fileList = foundDocument.fileList;
      const relatedDocuments = foundDocument.relatedDocuments;
      const participants = foundDocument.participants
        .map((p) => p.receiver)
        .filter((item) => item);

      return res.status(200).json({
        message: 'success',
        data: {
          property,
          fileList,
          relatedDocuments,
          participants,
        },
      });
    }

    const foundDocument = await Document.findOne({
      _id: documentId,
      isArchived: {
        $eq: false,
      },
    })
      .populate('agency', 'label value -_id')
      .populate('category', 'title value -_id')
      .populate('urgentLevel', 'label value colorTag -_id')
      .populate('typesOfDocument', 'label value -_id')
      .populate({
        path: 'relatedDocuments',
        select:
          'documentNumber signer title issueDate fileList urgentLevel publisher ',
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
    let myReadDate = null;

    if (payload?.userId) {
      const myUser = participants.find(
        (p) => p?.receiver?._id.toString() === payload.userId
      );
      myReadDate = myUser?.readDate;
    }

    if (tab === 'participants') {
      if (isPublic) {
        const participantsTree = [
          {
            root: true,
            key: publisher._id,
            receiver: {
              username: publisher.username,
              issueDate,
            },
            children: [],
          },
        ];
        result = participantsTree;
      } else {
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
            key: publisher._id,
            receiver: {
              username: publisher.username,
              issueDate,
            },
            children: tree,
          },
        ];
        result = participantsTree;
      }
    } else if (tab === 'relatedDocuments') {
      if (relatedDocuments.length > 0) {
        delete relatedDocuments[0].participants;
      }
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
      if (isPublic || !payload?.userId) {
        result = [];
      } else {
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
      }
    } else {
      result = foundDocument;
    }

    return res.status(200).json({
      message: 'success',
      myReadDate,
      data: result,
      publisherId: publisher._id,
      isPublic,
    });
  } catch (error) {
    next(error);
  }
};

const updateRelatedDocuments = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const ids = req.query.ids.split(',');

    const foundDocument = await Document.findOne({
      _id: documentId,
      isArchived: {
        $eq: false,
      },
    });
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
  updateDocument,
  getListDocuments,
  getDocumentDetails,
  updateRelatedDocuments,
};
