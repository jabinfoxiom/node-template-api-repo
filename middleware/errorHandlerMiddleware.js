const globalErrorHandler = require("../utils/ErrorController");

function setupErrorHandler(app) {
  app.use(globalErrorHandler);
}

module.exports = setupErrorHandler;
