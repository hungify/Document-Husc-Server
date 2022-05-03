const express = require('express');
const router = express.Router();
const sentController = require('../controllers/sent.controller');

router.route('/:userId').get(sentController.getSentDocuments);

module.exports = router;
