const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the API',
  });
});

router.use('/auth', require('./auth.route'));

router.use('/users', require('./user.route'));

router.use('/agencies', require('./agencies.route'));

router.use('/categories', require('./categories.route'));

router.use('/urgent-levels', require('./urgentLevels.route'));

router.use('/types-of-documents', require('./typeOfDocuments.route'));

router.use('/departments', require('./departments.route'));

router.use('/documents', require('./documents.route'));

router.use('/inbox', require('./inbox.route'));

router.use('/sent', require('./sent.route'));

module.exports = router;
