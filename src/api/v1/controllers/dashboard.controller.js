const Document = require('../models/document.model');
const Agency = require('../models/agency.model');
const TypeOfDocument = require('../models/typeOfDocument.model');
const Category = require('../models/category.model');
const ROLES = require('../../../configs/roles.config');

const getAnalytics = async (req, res, next) => {
  try {
    const { role, userId } = req.payload; // get from jwt middleware

    const countDocuments = await Document.countDocuments().lean();
    const countAgencies = await Agency.countDocuments().lean();
    const countTypeOfDocuments = await TypeOfDocument.countDocuments().lean();
    const countCategories = await Category.countDocuments().lean();

    const countInboxDocuments = await Document.countDocuments({
      participants: {
        $elemMatch: {
          receiver: userId,
        },
      },
    }).lean();

    const countSentDocuments = await Document.countDocuments({
      participants: {
        $elemMatch: {
          sender: userId,
        },
      },
    }).lean();

    const countReadDocuments = await Document.countDocuments({
      participants: {
        $elemMatch: {
          receiver: userId,
          readDate: { $ne: null },
        },
      },
    }).lean();

    const countUnreadDocuments = await Document.countDocuments({
      participants: {
        $elemMatch: {
          receiver: userId,
          readDate: null,
        },
      },
    }).lean();
    let users = [
      {
        name: 'inbox',
        value: countInboxDocuments,
      },
      {
        name: 'sent',
        value: countSentDocuments,
      },
      {
        name: 'read',
        value: countReadDocuments,
      },
      {
        name: 'unread',
        value: countUnreadDocuments,
      },
    ];
    const admin = [
      {
        name: 'documents',
        value: countDocuments,
      },
      {
        name: 'agencies',
        value: countAgencies,
      },
      {
        name: 'type of documents',
        value: countTypeOfDocuments,
      },
      {
        name: 'categories',
        value: countCategories,
      },
    ];
    const result = role === ROLES.admin ? admin.concat(users) : users;

    return res.status(200).json({
      message: 'success',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  getAnalytics,
};
