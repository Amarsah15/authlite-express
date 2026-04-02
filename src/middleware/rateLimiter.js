import rateLimit from "express-rate-limit";
import { createError } from "../utils/AppError.js";

/**
 * Generic Rate Limiter Factory
 * @param {Object} options
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 min
    max = 100,
    message = "Too many requests, please try again later",
    code = "RATE_LIMIT_EXCEEDED",
    keyGenerator, // optional custom key (IP/email/userId)
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,

    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: keyGenerator || ((req) => req.ip),

    skipSuccessfulRequests,

    handler: (req, res, next) => {
      next(
        createError({
          message,
          statusCode: 429,
          code,
        }),
      );
    },
  });
}

/**
 * Prebuilt Login Rate Limiter
 * (User can use directly OR ignore)
 */
export function createLoginRateLimiter(options = {}) {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again later",
    code: "TOO_MANY_LOGIN_ATTEMPTS",

    // 🔥 Advanced: per IP + email protection
    keyGenerator: (req) => {
      const email = req.body?.email || "unknown";
      return `${req.ip}-${email}`;
    },

    skipSuccessfulRequests: true,

    ...options, // allow override
  });
}
