import { createError, ERROR } from "../utils/AppError.js";

export function authorize(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return next(createError(ERROR.UNAUTHORIZED));
    }

    if (!allowed.includes(req.user.role)) {
      return next(createError(ERROR.FORBIDDEN));
    }

    next();
  };
}