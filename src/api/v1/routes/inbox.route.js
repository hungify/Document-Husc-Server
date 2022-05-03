const express = require('express');
const router = express.Router();
const inboxController = require('../controllers/inbox.controller');

router.route('/:userId').get(inboxController.getInboxDocuments);

module.exports = router;
