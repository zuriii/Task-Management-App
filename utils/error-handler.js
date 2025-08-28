const AppError = require("../utils/appError");
const { ResponseCodes } = require("../enums/response-codes");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, ResponseCodes.BadRequest);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value '${
    Object.values(err.keyValue)[0]
  }'.Please use another value.`;
  return new AppError(message, ResponseCodes.BadRequest);
};

const handleValidationErrorDB = (err) => {
  const errMsgs = Object.values(err.errors).map((el) => el.message);
  const message = `${errMsgs[0]}`;
  return new AppError(message, ResponseCodes.BadRequest);
};

const sendErrorDev = (err, req, res) => {
  // a) API
  return res.status(err.statusCode).json({
    name: err.name,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const createLogData = (req, err) => {
  const logData = {
    err: err.stack,
  };

  // Check if the request has a user object with an ID
  if (req.user && req.user.id) {
    logData.userID = req.user.id;
  }

  if (
    err.isoperational &&
    (err.statusCode === ResponseCodes.Unauthorized ||
      err.statusCode === ResponseCodes.ExpiredToken)
  ) {
    const IpAddress = req.connection.remoteAddress.replace("::ffff:", "");
    logData.IpAddress = IpAddress;
    logData.err = err;
  }

  return logData;
};

const sendErrorprod = (stack, err, req, res) => {
  const logData = createLogData(req, err);

  // if error is operational, it means trusted error, so it can be sent to the client
  if (err.isoperational) {
    // Check the error's statusCode
    if (
      err.statusCode === ResponseCodes.Unauthorized ||
      err.statusCode === ResponseCodes.ExpiredToken
    ) {

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
      });
    }

    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
  }

  // For programming or other errors
  return res.status(err.statusCode).json({
    error: true,
    message: "Internal Server Error!",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  // console.log("error:", err);
  err.statusCode = err.statusCode || ResponseCodes.InternalServer;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    let stack = err;
    //resolve error message problem
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);

    sendErrorprod(stack, error, req, res);
  }
};

module.exports = globalErrorHandler;
