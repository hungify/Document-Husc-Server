const multer = require('multer');
const CreateError = require('http-errors');

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(CreateError(413, 'File too large'));
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(CreateError(413, 'Too many files'));
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(CreateError(413, 'Unexpected file'));
    }
  }
  next(err);
};

const errorHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  return res.status(err.status || 500).json({
    message: err.message,
  });
};

module.exports = { errorHandler, multerErrorHandler };
