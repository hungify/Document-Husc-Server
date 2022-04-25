const express = require('express');
const authRouter = require('./auth');
const agenciesRoute = require('./agencies.route');
const categoriesRoute = require('./categories.route');
const urgentLevelsRoute = require('./urgentLevels.route');
const typesOfDocumentsRoute = require('./typeOfDocuments.route');
const documentsRoute = require('./documents.route');
const usersRoute = require('./user.route');

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the API',
  });
});

router.use('/auth', authRouter);

router.use('/users', usersRoute);

router.use('/agencies', agenciesRoute);

router.use('/categories', categoriesRoute);

router.use('/urgent-levels', urgentLevelsRoute);

router.use('/types-of-documents', typesOfDocumentsRoute);

router.use('/documents', documentsRoute);

module.exports = router;
