const ErrorLog = require("../model/ErrorLog");
const AppError = require("./AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleMulterFileSize = (err) => {
  const message = err.message;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const fieldName = Object.keys(err.keyPattern)[0];

  const message = `${
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  } already exist.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  console.log(err);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = async (err, req, res) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR 💥", err);
  // save error in db
  await ErrorLog.create({
    user: req?.user?._id,
    url: req?.originalUrl,
    method: req?.method,
    jsonBody: req?.body,
    params: req?.params,
    query: req?.query,
    status: err?.status,
    error: err,
    message: err?.message,
    stack: err?.stack,
  });
  // 2) Send generic message
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.message.includes("Validation"))
      error = handleValidationErrorDB(error);
    if (error.message.includes("validation"))
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.code === "LIMIT_FILE_SIZE") error = handleMulterFileSize(error);
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
