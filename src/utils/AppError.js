// Base Error Class
export class AppError extends Error {
  constructor({
    message = "Something went wrong",
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null,
  } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Generic Error Creator
export function createError(options) {
  return new AppError(options);
}

// Common errors for reusable presets
export const ERROR = {
  UNAUTHORIZED: {
    message: "Authentication required",
    statusCode: 401,
    code: "AUTH_REQUIRED",
  },

  FORBIDDEN: {
    message: "You do not have permission to perform this action",
    statusCode: 403,
    code: "ACCESS_DENIED",
  },

  INVALID_CREDENTIALS: {
    message: "Invalid email or password",
    statusCode: 401,
    code: "INVALID_CREDENTIALS",
  },

  BAD_REQUEST: {
    message: "Invalid request data",
    statusCode: 400,
    code: "BAD_REQUEST",
  },
};