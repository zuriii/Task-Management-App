exports.sendResponse = (res, statusCode, message, data) => {
  data = data || null;
  return res.status(statusCode).json({
    message: message || "",
    data: data,
  });
};
