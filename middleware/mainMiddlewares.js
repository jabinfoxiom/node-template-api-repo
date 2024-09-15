const cors = require("cors");
const logger = require("morgan");
const compression = require("compression");
const db = require("../config/DBconnection");
const express = require("express");

function setupMiddlewares(app) {
  app.use(cors({ origin: "*" }));
  app.use(logger("dev"));
  app.use(compression({ level: 6 }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: "15mb" }));
  db.connect();
}

module.exports = setupMiddlewares;
