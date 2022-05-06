const express = require('express');
const typesOfDocumentController = require('../controllers/typesOfDocuments.controller');
const typesOfDocumentValidation = require('../validations/typesOfDocuments.validation');
const paramValidation = require('../validations/param.validation');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

const router = express.Router();

router
  .route('/')
  .get(typesOfDocumentController.getAllTypesOfDocuments)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    typesOfDocumentValidation.createTypesOfDocuments,
    typesOfDocumentController.createTypesOfDocuments
  );

router
  .route('/:typesOfDocumentId')
  .put(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('typesOfDocumentId'),
    typesOfDocumentValidation.createTypesOfDocuments,
    typesOfDocumentController.updateTypesOfDocuments
  );

module.exports = router;
