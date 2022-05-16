const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const { connectToMongoLocal } = require('../../configs/db.config');
const { errorHandler, multerErrorHandler } = require('./middlewares/error');

const bootServer = () => {
  const app = express();

  app.use(helmet());
  app.use(xss());
  app.use(mongoSanitize());
  app.use(compression());
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // app.use(cors(require('../../configs/cors.config')));
  app.use(cors('*'));

  app.use('/api/v1', require('./routes'));

  app.get('/', (req, res, next) => {
    return res.status(200).json({
      message:
        'The API Server is running!. Redirect to /api/v1 to see the API endpoints.',
    });
  });

  app.use(multerErrorHandler);
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });
  // error handler
  app.use(errorHandler);

  return app;
};

const app = bootServer();

if (connectToMongoLocal) {
  connectToMongoLocal.on('open', () => {
    app.emit('ready');
  });
}

module.exports = app;
