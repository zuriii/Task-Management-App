const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { sendResponse } = require("../utils/response-handler");
const { ResponseCodes } = require("../enums/response-codes");

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1; // default page 1
  const limit = parseInt(req.query.limit, 10) || 10; // default 10 users per page
  const skip = (page - 1) * limit;

  // Fetch users with pagination
  const users = await User.find()
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Total count for pagination info
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  return sendResponse(
    res,
    ResponseCodes.Success,
    "Users fetched successfully",
    {
      page,
      totalPages,
      results: users.length,
      totalUsers,
      users,
    }
  );
});

// Get a user by ID
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id }).select("-password");
  if (!user) {
    return sendResponse(res, ResponseCodes.NotFound, "User not found");
  }

  return sendResponse(res, ResponseCodes.Success, "User fetched successfully", {
    user,
  });
});

// Update user
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  // Find user by ID
  const user = await User.findOne({ id: req.params.id });
  if (!user) return sendResponse(res, ResponseCodes.NotFound, "User not found");

  console.log("req.user.role::", req.user.role);

  // Allow only the logged-in user OR admin to update
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return sendResponse(
      res,
      ResponseCodes.Forbidden,
      "You are not authorized to update this user"
    );
  }

  // Update fields
  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  return sendResponse(res, ResponseCodes.Success, "User updated successfully", {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    updatedAt: updatedUser.updatedAt,
  });
});

// Delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("id::", id);

    // Find user by ID using findOne
    const user = await User.findOne({ id: id });
    console.log("user:::", user);

    if (!user) {
      return sendResponse(res, ResponseCodes.NotFound, "User not found");
    }

    // Check permissions (only self or admin)
    if (req.user.id !== id && req.user.role !== "admin") {
      return sendResponse(
        res,
        ResponseCodes.Forbidden,
        "Not authorized to delete this user"
      );
    }

    // Delete user
    await User.findOneAndDelete({ id: id });

    return sendResponse(
      res,
      ResponseCodes.Success,
      "User removed successfully"
    );
  } catch (err) {
    console.error("Error deleting user:", err);
    return sendResponse(res, ResponseCodes.ServerError, "Error deleting user");
  }
});
