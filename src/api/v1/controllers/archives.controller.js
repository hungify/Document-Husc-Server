const CreateError = require('http-errors');
const Document = require('../models/document.model');
const APICore = require('../libs/apiCore');
const { removeEmptyObjInArrByKeys, listToTree } = require('../utils');
const { getPayload } = require('../middlewares/jwt');

const getListArchives = async (req, res, next) => {
  try {
    const payload = await getPayload(req);

    const keys = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];
    const populates = keys.map((key) => {
      return {
        path: key,
        select: 'value title label colorTag -_id',
      };
    });
    const api = new APICore(
      req.query,
      Document,
      payload?.userId,
      'archive'
    ).paginating();

    const result = await Promise.allSettled([
      api.query.populate(populates).lean({ autopopulate: true }),
      Document.countDocuments({}),
    ]);

    const documents = result[0].status === 'fulfilled' ? result[0].value : [];
    const total = result[1].status === 'fulfilled' ? result[1].value : 0;

    return res.status(200).json({
      total,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDetailsArchive = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { tab } = req.query;
    const payload = await getPayload(req);

    if (!tab) {
      // if tab is not defined, return all document details
      const foundDocument = await Document.findOne({
        _id: documentId,
        type: 'archive',
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
      type: 'archive',
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
      type,
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
        type,
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

const restoreArchive = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const foundDocument = await Document.findOne({
      _id: documentId,
    });

    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const updateRestoreDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
      },
      {
        type: 'official',
      }
    );

    return res.status(200).json({
      message: 'success',
      data: updateRestoreDocument,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListArchives,
  getDetailsArchive,
  restoreArchive,
};
