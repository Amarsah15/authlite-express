import { verifyAccessToken } from "../core/TokenService.js";
import { createError, ERROR } from "../utils/AppError.js";

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw createError(ERROR.UNAUTHORIZED);
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw createError({
      message: "Invalid authorization format",
      statusCode: 401,
      code: "INVALID_AUTH_FORMAT",
    });
  }

  return token;
}

export function authenticate() {
  return (req, res, next) => {
    try {
      const token = extractToken(req);

      const decoded = verifyAccessToken(token);

      req.user = decoded;

      next();
    } catch (err) {
      if (err.statusCode) {
        return next(err);
      }
      return next(
        createError({
          message: "Invalid or expired access token",
          statusCode: 401,
          code: "INVALID_ACCESS_TOKEN",
        }),
      );
    }
  };
}
