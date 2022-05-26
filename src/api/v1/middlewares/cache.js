const CreateError = require('http-errors');
const redisQuery = require('../utils/redis');
const TABS = require('../constants/tabs');
const { getPayload } = require('./jwt');
const { listToTree } = require('../utils');
const _ = require('lodash');

const cacheDocumentDetail = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { tab } = req.query;
    const payload = await getPayload(req);
    const entryDocument = JSON.parse(
      await redisQuery.getRedisValue(`document:${documentId}`)
    );

    if (!entryDocument || tab === TABS.CHAT_ROOM) {
      return next();
    }
    if (!tab) {
      // if tab is not defined, return all document details
      const property = {
        agency: entryDocument.agency,
        category: entryDocument.category,
        typesOfDocument: entryDocument.typesOfDocument,
        urgentLevel: entryDocument.urgentLevel,
        documentNumber: entryDocument.documentNumber,
        issueDate: entryDocument.issueDate,
        signer: entryDocument.signer,
        title: entryDocument.title,
        content: entryDocument.content,
        summary: entryDocument.summary,
        publisher: entryDocument.publisher,
        isPublic: entryDocument.isPublic,
      };
      const fileList = entryDocument.fileList;
      const relatedDocuments = entryDocument.relatedDocuments;
      const participants = entryDocument.participants
        ?.map((p) => p.receiver)
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
    } = entryDocument;
    let result = [];
    let myReadDate = null;
    let myConversation = null;

    if (payload?.userId) {
      const myUser = participants.find(
        (p) => p?.receiver?._id?.toString() === payload.userId
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
      result = entryDocument;
    }

    return res.status(200).json({
      message: 'success',
      myReadDate,
      data: result,
      publisherId: publisher._id,
      isPublic,
    });
  } catch (error) {
    return next(CreateError(500, error.message));
  }
};

module.exports = {
  cacheDocumentDetail,
};
