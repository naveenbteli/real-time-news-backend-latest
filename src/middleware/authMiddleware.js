import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Middleware to protect routes by verifying JWT
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT and decode
    const decoded = jwt.verify(token, JWT_SECRET);

    /**
     * Expected decoded format:
     * {
     *   id: 1,
     *   role: 'PUBLISHER' // Must match Prisma.UserRole
     * }
     */
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ error: "Token invalid or expired" });
  }
};

/**
 * Middleware to authorize based on user roles
 * @param {...Prisma.UserRole} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};
