import { verifyToken } from "../core/TokenService.js";

export function authenticate() {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Invalid authorization format" });
      }

      const token = authHeader.split(" ")[1];
      req.user = verifyToken(token);

      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };
}
