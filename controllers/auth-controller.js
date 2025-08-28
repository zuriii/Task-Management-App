const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { getCustomId } = require("../utils/custom-id");
const { sendResponse } = require("../utils/response-handler");
const { ResponseCodes } = require("../enums/response-codes");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  return sendResponse(res, statusCode, "Authentication successful", {
    // user,
    token,
  });
};

// Sign Up
exports.signUp = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(
      res,
      ResponseCodes.BadRequest,
      "Email is already registered. Please login instead."
    );
  }

  // Generate custom ID
  req.body.id = await getCustomId(User);

  // Create the user
  const user = await User.create(req.body);

  // Send JWT token in response
  createSendToken(user, ResponseCodes.Created, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendResponse(
      res,
      ResponseCodes.BadRequest,
      "Please provide email and password"
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return sendResponse(
      res,
      ResponseCodes.Unauthorized,
      "Incorrect email or password"
    );
  }

  createSendToken(user, ResponseCodes.Success, res);
});

// Protect middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendResponse(
      res,
      ResponseCodes.Unauthorized,
      "You are not logged in! Please login to get access"
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findOne({ id: decoded.id });
  if (!freshUser) {
    return sendResponse(
      res,
      ResponseCodes.Unauthorized,
      "The user with this token does not exist"
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return sendResponse(
      res,
      ResponseCodes.Unauthorized,
      "User recently changed password! Please login again"
    );
  }

  req.user = freshUser;
  next();
});

// Get current logged-in user
exports.getMe = catchAsync(async (req, res, next) => {
  return sendResponse(
    res,
    ResponseCodes.Success,
    "User fetched successfully",
    req.user
  );
});
