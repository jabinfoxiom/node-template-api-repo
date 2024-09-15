// file upload
const express = require("express");
const multer = require("multer");
const slugify = require("slugify");
const path = require("path");
const app = express();
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = slugify(file.originalname, { lower: true });
    cb(
      null,
      sanitizedFilename.split(".")[0] +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

app.post("/", upload.array("files", 5), (req, res, next) => {
  try {
    const imagePaths = req.files.map((file) => "uploads/" + file.filename);

    if (req.body?.previousFiles) {
      const files = req.body.previousFiles.split(",");
      if (files && files.length > 0) {
        files.forEach((file) => {
          const fullPath = path.join(__dirname, "..", file);

          fs.unlink(fullPath, (err) => {
            // No need to handle errors here, just continue the loop
          });
        });
      }
    }

    return res.status(200).json({
      message: "Image uploaded successfully",
      data: imagePaths,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = app;
