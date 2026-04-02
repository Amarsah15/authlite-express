import jwt from "jsonwebtoken";
import { getConfig } from "../config/initAuth.js";

// Generate Access Token
export function generateAccessToken(payload) {
  const { jwtSecret, accessTokenExpiry } = getConfig();

  return jwt.sign(payload, jwtSecret, {
    expiresIn: accessTokenExpiry,
  });
}

// Generate Refresh Token
export function generateRefreshToken(payload) {
  const { refreshSecret, refreshTokenExpiry } = getConfig();

  return jwt.sign(payload, refreshSecret, {
    expiresIn: refreshTokenExpiry,
  });
}

// Verify Access Token
export function verifyAccessToken(token) {
  const { jwtSecret } = getConfig();
  return jwt.verify(token, jwtSecret);
}

// Verify Refresh Token
export function verifyRefreshToken(token) {
  const { refreshSecret } = getConfig();
  return jwt.verify(token, refreshSecret);
}
