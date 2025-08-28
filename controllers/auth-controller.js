const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/appError");
const { getCustomId } = require("../utils/custom-id");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  console.log(token);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure:true, // cookie will only send to encrypted connection
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  req.body.id = await getCustomId(User);

  const user = await User.create(req.body);
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if  email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  // check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Please provide email or password", 401));
  }

  // if everything is working fine than send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1)getting the token and check if it exsits
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("tokennnnnnnnnnnnn", token);

  if (!token) {
    return next(
      new AppError("You are not loggin! please login to get access", 401)
    );
  }

  // 2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("decoded::", decoded);

  // 3)check if user still exists
  const freshUser = await User.findOne({ id: decoded.id });
  if (!freshUser) {
    return next(new AppError("the user with this token does no exists", 401));
  }

  // 4)check if user changed password after the token has issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed password! Please login with new password",
        401
      )
    );
  }

  req.user = freshUser;

  next();
});

exports.getMe = catchAsync(async (req, res, next) => {
  console.log("req.user::", req.user);
  res.status(200).json({ status: "success", data: req.user });
});
