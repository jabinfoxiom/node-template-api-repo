const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../model/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");
const fetchData = require("../utils/FetchData");
const { getOne, createOne, updateOne } = require("../utils/HandlerFactory");
const fs = require("fs");
const path = require("path");
const CatchAsync = require("../utils/CatchAsync");
const moment = require("moment");

const signToken = (id, role, name) => {
  const accessToken = jwt.sign(
    { id, role, name },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );

  const refreshToken = jwt.sign(
    { id, role, name },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );

  return { accessToken, refreshToken };
};

module.exports.login = catchAsync(async (req, res, next) => {
  const { email, password, mobile, role } = req.body;

  if (role !== "super_admin" && (!mobile || mobile?.length === 0)) {
    return next(new AppError("Mobile number can't be empty.", 400));
  }

  let user;
  if (role === "super_admin") {
    user = await User.findOne({ email, password, isDeleted: false }).select(
      "-password"
    );
  } else {
    user = await User.findOne({
      mobile,
      verified: true,
      isActive: true,
      isDeleted: false,
    });
  }

  if (!user && req.body.role !== "super_admin") {
    return next(new AppError("There is no user with this mobile number", 401));
  }

  if (!user && req.body.role === "super_admin") {
    return next(new AppError("Invalid username or password", 401));
  }

  const token = signToken(user._id, user.role, user.name);
  user.fcm = req.body?.fcm;
  user.refreshToken = token.refreshToken;
  user.lastLogin = new Date();

  await user.save();

  return res.status(200).json({
    data: {
      token,
      profile: user,
    },
    message: "Success",
  });
});

module.exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();

    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const condition = { role: { $ne: "super_admin" }, isDeleted: false };

    if (req.query.role) {
      condition.role = req.query.role;
    }

    if (req.query.active === "true") {
      condition.isActive = true;
    }

    if (req.query.active === "false") {
      condition.isActive = false;
    }

    if (req.query.fromDate && req.query.toDate) {
      condition.endDate = {
        $gte: moment(req.query.fromDate).toDate(),
        $lt: moment(req.query.toDate).add(1, "days").toDate(),
      };
    }

    const data = await fetchData(req, res, User, {
      condition,
      sort: { name: 1 },
    });

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.getUser = getOne(User);
module.exports.createUser = createOne(User);
module.exports.updateUser = updateOne(User);

const deleteFilesUpload = async (data) => {
  if (data?.image) {
    const fullPath = path.join(__dirname, "..", data?.image);
    if (fullPath) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          return;
        }
        // No need to handle errors here, just continue the loop
      });
    }
  }

  return;
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndUpdate(req.params?.id, {
      isDeleted: true,
    });
    await deleteFilesUpload(doc);

    if (!doc || doc.isDeleted) {
      return next(new AppError("No document found with that ID", 404));
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    next(error);
  }
};

module.exports.refreshToken = catchAsync(async (req, res, next) => {
  let token;
  if (!req.body.token) {
    return next(new AppError("No refresh token passed", 401));
  }
  token = req.body.token;

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_REFRESH_SECRET
  );

  // 3) Check if user still exists
  const currentUser = await User.findOne({
    _id: new mongoose.Types.ObjectId(decoded.id),
    refreshToken: token,
  });

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  const newToken = signToken(
    currentUser._id,
    currentUser.role,
    currentUser.name
  );
  currentUser.refreshToken = newToken.refreshToken;
  currentUser.save();

  res.status(200).json({ data: newToken, message: "success" });
});
