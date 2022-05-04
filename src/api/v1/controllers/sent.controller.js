const CreateError = require('http-errors');
const Document = require('../models/document.model');
const User = require('../models/user.model');
const _ = require('lodash');

const getSentDocuments = async (req, res, next) => {
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

    const inboxDocuments = await Document.find({
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
      .lean({ autopopulate: true });

    const data = _.map(inboxDocuments, (item) => {
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
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSentDocuments,
};
