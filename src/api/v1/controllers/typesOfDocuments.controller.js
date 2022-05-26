const CreateError = require('http-errors');
const TypeOfDocument = require('../models/typeOfDocument.model');

const createTypesOfDocuments = async (req, res, next) => {
  try {
    const { label } = req.body;
    const foundTypesOfDocument = await TypeOfDocument.findOne({ label });
    if (foundTypesOfDocument) {
      throw CreateError.Conflict(
        `TypeOfDocument with value "${label}" already exists`
      );
    }

    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');
    const newTypesOfDocument = new TypeOfDocument({ label, value });
    const savedTypesOfDocument = await newTypesOfDocument.save();

    return res.status(201).json({
      message: 'success',
      data: savedTypesOfDocument,
    });
  } catch (error) {
    return next(error);
  }
};

const updateTypesOfDocuments = async (req, res, next) => {
  try {
    const { label } = req.body;
    const { typesOfDocumentId } = req.params;
    const foundTypesOfDocument = await TypeOfDocument.findById(
      typesOfDocumentId
    ).lean();

    if (!foundTypesOfDocument) {
      throw CreateError.NotFound(
        `TypeOfDocument with typesOfDocumentId "${typesOfDocumentId}" not found`
      );
    }

    const foundTypesOfDocumentWithSameLabel = await TypeOfDocument.findOne({
      label,
    }).lean();
    if (
      foundTypesOfDocumentWithSameLabel &&
      foundTypesOfDocumentWithSameLabel._id !== typesOfDocumentId
    ) {
      throw CreateError.Conflict(
        `TypeOfDocument with value "${label}" already exists`
      );
    }

    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
      .replace(/\s/g, '-');

    const updatedTypesOfDocument = await TypeOfDocument.findByIdAndUpdate(
      typesOfDocumentId,
      { label, value },
      { new: true }
    );

    return res.status(200).json({
      message: 'success',
      data: updatedTypesOfDocument,
    });
  } catch (error) {
    return next(error);
  }
};

const getAllTypesOfDocuments = async (req, res, next) => {
  try {
    const foundTypesOfDocuments = await TypeOfDocument.find({})
      .select('-__v -createdAt -updatedAt')
      .lean();
    return res.status(200).json({
      message: 'success',
      data: foundTypesOfDocuments,
      total: foundTypesOfDocuments.length,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTypesOfDocuments,
  updateTypesOfDocuments,
  getAllTypesOfDocuments,
};
