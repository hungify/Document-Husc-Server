const CreateError = require('http-errors');
const Document = require('../models/document.model');
const User = require('../models/user.model');
const _ = require('lodash');
const redisQuery = require('../utils/redis');

const getSendDocuments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { userId } = req.payload; // get from jwt middleware

    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limit;

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      next(CreateError.NotFound('User not found'));
    }

    const [total, sent] = await Promise.all([
      Document.countDocuments({
        participants: {
          $elemMatch: {
            sender: userId,
          },
        },
      }).lean(),
      await Document.find({
        participants: {
          $elemMatch: {
            sender: userId,
          },
        },
      })
        .populate('urgentLevel', 'label value colorTag -_id')
        .select(
          'title content summary urgentLevel participants publisher issueDate isPublic _id'
        )

        .limit(pageSizeNumber)
        .skip(skip)
        .lean({ autopopulate: true }),
    ]);

    const data = _.map(sent, (item) => {
      return {
        _id: item._id,
        title: item.title,
        content: item.content,
        summary: item.summary,
        isPublic: item.isPublic,
        urgentLevel: item.urgentLevel,
        publisher: item.publisher,
        issueDate: item.issueDate,
        to: _.filter(item.participants, (item) => {
          return item.sender._id.toString() === userId;
        }).map((item) => (_.isUndefined(item.receiver) ? {} : item.receiver)),
      };
    });

    return res.status(200).json({
      message: 'Success',
      total: total,
      data: data,
    });
  } catch (error) {
    return next(error);
  }
};
const forwardDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { receivers } = req.body;
    const userId = req?.payload?.userId; // get from jwt middleware
    if (!userId) {
      throw CreateError.BadRequest('User not found');
    }

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundSender = User.findOne({ _id: userId });
    if (!foundSender) {
      throw CreateError.NotFound(`Sender "${userId}" does not exist`);
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
          receiver: userId,
        },
      },
    });
    if (!validSender) {
      throw CreateError.BadRequest(
        `Sender "${userId}" must be is already a receiver of document "${documentId}" from another sender in order to forward it`
      );
    }

    const existReceivers = await Document.find({
      _id: documentId,
      'participants.$.receiver': { $in: receivers.map((r) => r.receiverId) },
    }).lean({ autopopulate: true });

    const participantsIds = existReceivers[0].participants.map((p) => {
      const arr = [];
      if (p?.sender?._id) {
        arr.push(p.sender._id.toString());
      }
      if (p?.receiver?._id) {
        arr.push(p.receiver._id.toString());
      }
      return arr;
    });

    const setParticipantsIdsIds = new Set(participantsIds.flat());

    const validReceivers = [];
    const invalidReceivers = [];
    receivers.map((r) => {
      if (!setParticipantsIdsIds.has(r.receiverId)) {
        validReceivers.push(r);
      } else {
        invalidReceivers.push(r);
      }
    });

    const updatedReceiverDocument = await Document.findOneAndUpdate(
      {
        _id: documentId,
        'participants.$.sender': userId,
      },
      {
        $addToSet: {
          participants: {
            $each: validReceivers.map((r) => ({
              sender: userId,
              receiver: r.receiverId,
              sendDate: r.sendDate,
            })),
          },
        },
      },
      {
        new: true,
      }
    )
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

    redisQuery.updateRedisValue(
      `document:${documentId}`,
      updatedReceiverDocument
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
    return next(error);
  }
};

module.exports = {
  getSendDocuments,
  forwardDocument,
};
