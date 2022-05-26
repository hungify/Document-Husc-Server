const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the API',
    link: 'Check out the docs at https://github.com/hungpurdie/DocumentKHH-server',
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

router.use('/send', require('./send.route'));

router.use('/dashboard', require('./dashboard.route'));

router.use('/archives', require('./archives.route'));

router.use('/draft', require('./draft.route'));

module.exports = router;
