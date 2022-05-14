const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draft.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const ROLES = require('../../../configs/roles.config');

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    draftController.getListDraft
  );

router
  .route('/:documentId')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    draftController.getDetailsDraft
  );

module.exports = router;
