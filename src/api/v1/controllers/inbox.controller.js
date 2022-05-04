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

    let result = [];
    if (orderByString === 'all') {
      result = await Document.find({
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
        .lean({ autopopulate: true });
    } else {
      //['read', 'unread'].includes(orderByString)
      result = await Document.find({
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
        .lean({ autopopulate: true });
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
      totalMatch: data.length,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInboxDocuments,
};
