const express = require('express');
const usersRouter = require('./users');
const agencyRoute = require('./agency.route');
const categoryRoute = require('./category.route');
const urgentLevelRoute = require('./urgentLevel.route');
const typesOfDocumentRoute = require('./typesOfDocuments.route');

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the API',
  });
});

router.use('/users', usersRouter);

router.use('/agencies', agencyRoute);

router.use('/categories', categoryRoute);

router.use('/urgent-levels', urgentLevelRoute);

router.use('/types-of-documents', typesOfDocumentRoute);

module.exports = router;
