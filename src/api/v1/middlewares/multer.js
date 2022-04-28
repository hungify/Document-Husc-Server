const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage({});

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
