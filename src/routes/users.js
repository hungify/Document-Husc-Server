const express = require("express");
const router = express.Router();
const { uploadFile } = require("../models/upload.model");
/* GET users listing. */
router.get("/upload", function (req, res, next) {
  uploadFile();
});

module.exports = router;
