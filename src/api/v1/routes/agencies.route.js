const express = require('express');
const ROLES = require('../../../configs/roles.config');
const agencyController = require('../controllers/agency.controller');
const { verifyAccessToken } = require('../middlewares/jwt');
const verifyRoles = require('../middlewares/roles');
const agencyValidate = require('../validations/agency.validation');
const paramValidation = require('../validations/param.validation');
const router = express.Router();

// router
//   .route('/')
//   .get(agencyController.getAllAgencies)
//   .post(agencyValidate.createAgency, agencyController.createAgency);

// router
//   .route('/:agencyId')
//   .put(agencyValidate.updateAgency, agencyController.updateAgency)
//   .delete(agencyController.deleteAgency);

// ----- Test -----

router
  .route('/')
  .get(
    verifyAccessToken,
    verifyRoles(ROLES.user, ROLES.admin),
    agencyController.getAllAgencies
  )
  .post(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    agencyValidate.createAgency,
    agencyController.createAgency
  );

router
  .route('/:agencyId')
  .put(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    paramValidation.objectId('agencyId'),
    agencyValidate.updateAgency,
    agencyController.updateAgency
  )
  .delete(
    verifyAccessToken,
    verifyRoles(ROLES.admin),
    agencyController.deleteAgency
  );

module.exports = router;
