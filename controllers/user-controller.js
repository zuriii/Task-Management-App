const mongoose = require("mongoose");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id }).select("-password");
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// Update user
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const { id } = req.params;

  const user = await User.findOne({ id: req.params.id });
  if (!user) return next(new AppError("User not found", 404));

  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  res.status(200).json({
    status: "success",
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      updatedAt: updatedUser.updatedAt,
    },
  });
});

// Delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid user ID", 400));
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    message: "User removed",
  });
});
