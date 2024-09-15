const AppError = require("./AppError");
const CatchAsync = require("./CatchAsync");

exports.deleteOne = (Model, isDeleted) =>
  CatchAsync(async (req, res, next) => {
    if (isDeleted) {
      const doc = await Model.findByIdAndDelete(req.params?.id);
      if (!doc || doc.isDeleted) {
        return next(new AppError("No document found to delete", 404));
      }
    } else {
      const doc = await Model.findByIdAndUpdate(req.params?.id, {
        isDeleted: true,
      });
      if (!doc || doc.isDeleted) {
        return next(new AppError("No document found to delete", 404));
      }
    }

    res.status(200).json({
      message: "success",
    });
  });

exports.updateOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    if (!req.params?.id) {
      return next(new AppError("No document found to update", 404));
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc || doc.isDeleted) {
      return next(new AppError("No document found to update", 404));
    }

    res.status(200).json({
      message: "success",
      data: doc._id,
    });
  });

exports.createOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model(req.body);
    doc.payload = req.body;
    await doc.save();

    res.status(200).json({
      message: "success",
      data: doc._id,
    });
  });

exports.getOne = (Model, popOptions) =>
  CatchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc || doc.isDeleted) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      message: "success",
      data: doc,
    });
  });
