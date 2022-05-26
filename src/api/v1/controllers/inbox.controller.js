const CreateError = require('http-errors');
const Document = require('../models/document.model');
const User = require('../models/user.model');
const _ = require('lodash');

const getInboxDocuments = async (req, res, next) => {
  try {
    const { page, limit, orderBy } = req.query;
    const { userId } = req.payload; // get from jwt middleware

    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limit;
    const orderByString = orderBy || 'all';

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      next(CreateError.NotFound('User not found'));
    }

    let totalInbox = [];

    let result = [];
    if (orderByString === 'all') {
      const [total, inbox] = await Promise.all([
        Document.countDocuments({
          participants: {
            $elemMatch: {
              receiver: userId,
            },
          },
        }),
        Document.find({
          participants: {
            $elemMatch: {
              receiver: userId,
            },
          },
        })
          .populate('urgentLevel', 'label value colorTag -_id')
          .select(
            'title content summary urgentLevel participants publisher issueDate _id'
          )

          .limit(pageSizeNumber)
          .skip(skip)
          .lean({ autopopulate: true }),
      ]);

      totalInbox = total;
      result = inbox;
    } else {
      //['read', 'unread'].includes(orderByString)
      const [total, inbox] = await Promise.all([
        await Document.find({
          participants: {
            $elemMatch: {
              receiver: userId,
              readDate: orderByString === 'unread' ? null : { $ne: null },
            },
          },
        })
          .count()
          .lean(),
        Document.find({
          participants: {
            $elemMatch: {
              receiver: userId,
              readDate: orderByString === 'unread' ? null : { $ne: null },
            },
          },
        })
          .populate('urgentLevel', 'label value colorTag -_id')
          .select(
            'title content summary urgentLevel participants publisher issueDate _id'
          )

          .limit(pageSizeNumber)
          .skip(skip)
          .lean({ autopopulate: true }),
      ]);
      totalInbox = total;
      result = inbox;
    }

    const data = _.map(result, (item) => {
      return {
        _id: item._id,
        issueDate: item.issueDate,
        title: item.title,
        summary: item.summary,
        content: item.content,
        isPublic: item.isPublic,
        urgentLevel: item.urgentLevel,
        readDate: _.find(item.participants, (i) => {
          return i.receiver._id.toString() === userId;
        })?.readDate,
        from: _.find(item.participants, (i) => {
          return i.receiver._id.toString() === userId;
        })?.sender,
      };
    });

    return res.status(200).json({
      message: 'success',
      total: totalInbox,
      data: data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateReadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const userId = req?.payload?.userId; // get from jwt middleware
    if (!userId) {
      throw CreateError.BadRequest('User not found');
    }

    const readDate = req.body.readDate;

    const foundDocument = await Document.findOne({ _id: documentId });
    if (!foundDocument) {
      throw CreateError.NotFound(`Document "${documentId}" does not exist`);
    }

    const foundReceiver = User.findOne({ _id: userId });
    if (!foundReceiver) {
      throw CreateError.NotFound(`Receiver "${userId}" does not exist`);
    }

    const updateReadDocument = await Document.updateOne(
      {
        _id: documentId,
        participants: {
          $elemMatch: {
            receiver: userId,
          },
        },
      },
      {
        $set: {
          'participants.$.readDate': readDate,
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
    return next(error);
  }
};

module.exports = {
  getInboxDocuments,
  updateReadDocument,
};
