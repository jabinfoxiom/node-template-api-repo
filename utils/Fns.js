const catchAsync = require("./CatchAsync");
const AppError = require("./AppError");
const ErrorLog = require("../model/ErrorLog");
const moment = require("moment");

module.exports.deleteErrorLog = async () => {
  try {
    const sixMonthsAgo = moment().subtract(6, "months").toDate();
    await ErrorLog.deleteMany({ createdAt: { $lte: sixMonthsAgo } });
    return;
  } catch (err) {
    await ErrorLog.create({
      status: err?.status,
      error: err,
      message: err?.message,
      stack: err?.stack,
      isCron: true,
    });
    return;
  }
};

module.exports.apiValidation = catchAsync(async (req, res, next) => {
  const contentType = req.headers["content-type"];
  const method = req.method.toLowerCase();

  if (
    (method === "post" || method === "put") &&
    (!contentType ||
      (!contentType.includes("application/json") &&
        !contentType.includes("multipart/form-data")))
  ) {
    return next(new AppError("Only JSON or form-data format is accepted", 400));
  }

  if (
    (method === "post" || method === "put") &&
    contentType &&
    contentType.includes("application/json")
  ) {
    // Check if request body is an empty object
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return next(new AppError("JSON body cannot be an empty object", 400));
    }
  }
  next();
});

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

//paginate fuction
module.exports.paginate = (docs, pageNumber, pageLimit) => {
  const limit = parseInt(pageLimit) || 10;
  const page = parseInt(pageNumber) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedDocs = docs.slice(startIndex, endIndex);
  const totalDocs = docs.length;
  const hasNextPage = endIndex < totalDocs;
  const hasPreviousPage = startIndex > 0;

  return { docs: paginatedDocs, totalDocs, hasNextPage, hasPreviousPage };
};
