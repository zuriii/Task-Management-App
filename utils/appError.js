class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // console.log(this.statusCode);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    console.log("app error");
    // all the errors that we will create by ourselves are operational error
    this.isOperational = true;
    // these errors will be operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
