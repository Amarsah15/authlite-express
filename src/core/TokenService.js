import jwt from "jsonwebtoken";
import { getConfig } from "../config/initAuth.js";

export function generateToken(payload) {
  const { jwtSecret, tokenExpiry } = getConfig();
  return jwt.sign(payload, jwtSecret, { expiresIn: tokenExpiry });
}

export function verifyToken(token) {
  const { jwtSecret } = getConfig();
  return jwt.verify(token, jwtSecret);
}
