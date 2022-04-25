const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
// const apicache = require('apicache');
const connectToMongoLocal = require('../../configs/db.config');

const bootServer = () => {
  const app = express();
  // const cache = apicache.middleware;
  // app.use(cache('5 minutes'));
  app.use(helmet());
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(cors(require('../../configs/cors.config')));
  app.use('/api/v1', require('./routes'));

  app.get('/', (req, res, next) => {
    return res.status(200).json({
      message:
        'The API Server is running!. Redirect to /api/v1 to see the API endpoints.',
    });
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
      message: err.message,
    });
  });
  return app;
};

let app;
if (connectToMongoLocal) {
  app = bootServer();
}

module.exports = app;
