require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const setupMiddlewares = require("./middleware/mainMiddlewares");
const setupRouteHandler = require("./middleware/routesMiddleares");
const setupErrorHandler = require("./middleware/errorHandlerMiddleware");
const { deleteErrorLog } = require("./utils/Fns");
const app = express();

setupMiddlewares(app);
setupRouteHandler(app);
setupErrorHandler(app);

cron.schedule("0 0 * * *", () => {
  deleteErrorLog();
});

const port = process.env.PORT || 8001;

app.listen(port, () => console.log(`Server running on ${port}`));
