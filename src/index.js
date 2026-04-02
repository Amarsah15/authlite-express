export { initAuth } from "./config/initAuth.js";
export { authenticate } from "./middleware/authenticate.js";
export { authorize } from "./middleware/authorize.js";
export * as AuthService from "./core/AuthService.js";
export * as AppError from "./utils/AppError.js";
export {
  createRateLimiter,
  createLoginRateLimiter,
} from "./middleware/rateLimiter.js";

// Example of error handling middleware
export function errorHandler(err, req, res, next) {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
    ...(err.details && { details: err.details }),
  });
}
