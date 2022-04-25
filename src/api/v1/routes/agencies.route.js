const express = require('express');
const agencyController = require('../controllers/agency.controller');
const agencyValidate = require('../validations/agency.validation');

const router = express.Router();

router
  .route('/')
  .get(agencyController.getAllAgencies)
  .post(agencyValidate.createAgency, agencyController.createAgency);

router
  .route('/:agencyId')
  .put(agencyValidate.updateAgency, agencyController.updateAgency)
  .delete(agencyController.deleteAgency);

module.exports = router;
