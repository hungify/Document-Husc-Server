const CreateError = require('http-errors');
const Document = require('../../models/document.model');
const User = require('../../models/user.model');
const getInboxDocuments = async (req, res, next) => {
  try {
    const { page, pageSize, orderBy, userId } = req.query;

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      throw new CreateError(404, 'User not found');
    }

    const inboxDocuments = await Document.find({
      participants: {
        receiver: {
          $in: [userId],
        },
      },
    });

    return res.status(200).json({
      message: 'success',
      data: inboxDocuments,
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInboxDocuments,
};
