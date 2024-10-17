const util = require("util");

function UnauthorizedError(code, error) {
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = error.message;
  this.code = code;
  this.status = 403;
  this.inner = error;
}

util.inherits(UnauthorizedError, Error);

const PermissionError = new UnauthorizedError("permission_denied", {
  message: "Permission Denied",
});

module.exports = { UnauthorizedError, PermissionError };
