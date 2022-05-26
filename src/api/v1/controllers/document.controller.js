const CreateError = require('http-errors');
const Document = require('../models/document.model');
const TypeOfDocument = require('../models/typeOfDocument.model');
const Agency = require('../models/agency.model');
const Category = require('../models/category.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const { UrgentLevel } = require('../models/ugentLevel.model');
const APICore = require('../libs/apiCore');
const { uploadFiles } = require('../utils/s3');
const { isJSON, removeEmptyObjInArrByKeys, listToTree } = require('../utils');
const _ = require('lodash');
const { getPayload } = require('../middlewares/jwt');
const TABS = require('../constants/tabs');
const { redisClient, setWithTTL } = require('../../../configs/redis.config');

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
      type,
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

    if (!foundTypeOfDocument && type === 'official') {
      throw CreateError.BadRequest(
        `Type of document "${typesOfDocument}" does not exist`
      );
    }

    const foundAgency = await Agency.findOne({ value: agency });
    if (!foundAgency && type === 'official') {
      throw CreateError.BadRequest(`Agency "${agency}" does not exist`);
    }

    const foundCategory = await Category.findOne({ value: category });
    if (!foundCategory && type === 'official') {
      throw CreateError.BadRequest(`Category "${category}" does not exist`);
    }

    const foundUrgentLevel = await UrgentLevel.findOne({ value: urgentLevel });
    if (!foundUrgentLevel && type === 'official') {
      throw CreateError.BadRequest(
        `Urgent level "${urgentLevel}" does not exist`
      );
    }

    const relatedDocumentsList =
      relatedDocuments && _.isString(relatedDocuments)
        ? relatedDocuments.split(',')
        : [];

    if (relatedDocumentsList?.length > 0) {
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

    if (participantsParsed?.length > 0) {
      const countValidReceivers = await User.countDocuments({
        _id: {
          $in: participantsParsed?.map((r) => r.receiver),
        },
      });

      if (countValidReceivers === 0) {
        throw CreateError.BadRequest(`Some of the receivers does not exist`);
      }
    }

    const files = req.files?.length > 0 ? await uploadFiles(req.files) : [];
    let newConversation;
    if (Array.isArray(participantsParsed) && type === 'official') {
      newConversation = new Conversation({
        messages: [],
        members: [publisher],
      });
      await newConversation.save();
    }

    const newDocument = new Document({
      //properties
      title,
      documentNumber,
      signer,
      issueDate,
      typesOfDocument: foundTypeOfDocument?._id,
      urgentLevel: foundUrgentLevel?._id,
      agency: foundAgency?._id,
      category: foundCategory?._id,
      isPublic: Array.isArray(participantsParsed) ? false : true,

      content,
      summary,
      fileList: files,
      relatedDocuments: relatedDocumentsList,
      participants: participantsParsed,
      type,
      publisher,
      conversation: newConversation ? newConversation._id : null,
    });

    const savedDocument = await newDocument.save();

    return res.status(201).json({
      message: 'success',
      data: savedDocument,
    });
  } catch (error) {
    return next(error);
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
      type,
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
        type,
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
    return next(error);
  }
};

const getListDocuments = async (req, res, next) => {
  try {
    const payload = await getPayload(req);
    const api = new APICore(req.query, Document, payload?.userId, 'official')
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
    return next(error);
  }
};

const getDocumentDetails = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { tab } = req.query;
    const payload = await getPayload(req);

    const foundDocument = await Document.findOne({
      _id: documentId,
      type: 'official',
    })
      .populate('agency', 'label value -_id')
      .populate('category', 'title value -_id')
      .populate('urgentLevel', 'label value colorTag -_id')
      .populate('typesOfDocument', 'label value -_id')
      .populate({
        path: 'relatedDocuments',
        populate: [
          {
            path: 'agency',
            select: 'label value -_id',
          },
          {
            path: 'urgentLevel',
            select: 'label value colorTag -_id',
          },
        ],
        select:
          'documentNumber signer title issueDate fileList urgentLevel publisher ',
      })
      .populate({
        path: 'conversation',
        populate: {
          path: 'messages',
          select: 'content sender receiver createdAt -_id',
          populate: {
            path: 'sender',
            select: 'username avatar _id',
          },
        },
      })
      .select('-__v -createdAt -updatedAt')
      .lean({ autopopulate: true });

    await setWithTTL(`document:${documentId}`, foundDocument, 60 * 60 * 24);

    if (!foundDocument) {
      throw CreateError.BadRequest(`Document "${documentId}" does not exist`);
    }

    if (!tab) {
      // if tab is not defined, return all document details
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
      type,
      conversation,
    } = foundDocument;
    let result = [];
    let myReadDate = null;
    let myConversation = null;

    if (payload?.userId) {
      const myUser = participants.find(
        (p) => p?.receiver?._id.toString() === payload.userId
      );
      myReadDate = myUser?.readDate;
      myConversation = {
        messages: conversation?.messages,
        conversationId: conversation?._id,
      };
    }

    if (tab === TABS.PARTICIPANTS) {
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
    } else if (tab === TABS.RELATED_DOCUMENTS) {
      if (relatedDocuments.length > 0) {
        delete relatedDocuments[0].participants;
      }
      result = relatedDocuments;
    } else if (tab === TABS.PROPERTY) {
      result = {
        _id: documentId,
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
        type,
      };
    } else if (tab === TABS.FILES) {
      result = fileList;
    } else if (tab === TABS.ANALYTICS) {
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
    } else if (tab === TABS.CHAT_ROOM) {
      result = myConversation;
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
    return next(error);
  }
};

const updateRelatedDocuments = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const ids = req.query.ids.split(',');

    const foundDocument = await Document.findOne({
      _id: documentId,
      type: 'official',
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
    return next(error);
  }
};

const revokeDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const foundDocument = await Document.findOne({
      _id: documentId,
    });

    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const updateRevokeDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
      },
      {
        type: 'archive',
      }
    );

    return res.status(200).json({
      message: 'success',
      data: updateRevokeDocument,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDocument,
  updateDocument,
  getListDocuments,
  getDocumentDetails,
  updateRelatedDocuments,
  revokeDocument,
};
