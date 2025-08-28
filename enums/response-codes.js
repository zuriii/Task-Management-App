exports.ResponseCodes = {
  Success: 200, // Indicates that the request has succeeded.
  BadRequest: 400, // The request could not be understood by the server due to incorrect syntax
  NotFound: 404, // The server can not find the requested resource
  InternalServer: 500, // The server encountered an unexpected condition that prevented it from fulfilling the request
  Created: 201, // Indicates that the request has succeeded and a new resource has been created as a result.
  Deleted: 204,
  Unauthorized: 401, // Indicates that the request requires user authentication information
  Forbidden: 403, // Unauthorized request. The client does not have access rights to the content
  Conflict: 409,
  Expired: 410,
  ExpiredToken: 498,
  Unavailable: 503,
  BadGateway: 502,
};
