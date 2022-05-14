const express = require('express');
const router = express.Router();
const archivesController = require('../controllers/archives.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const paramValidation = require('../validations/param.validation');
const ROLES = require('../../../configs/roles.config');

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    archivesController.getListArchives
  );

router
  .route('/:documentId')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    archivesController.getDetailsArchive
  )
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('documentId'),
    archivesController.restoreArchive
  );

module.exports = router;
