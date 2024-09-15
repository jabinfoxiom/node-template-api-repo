const express = require("express");
const path = require("path");

function setupRouteHandler(app) {
  app.use("/api/upload", require("../utils/Uploads"));
  app.use(
    "/api/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
  );
}

module.exports = setupRouteHandler;
