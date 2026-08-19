import { getUserFromToken } from "../utils/auth.js";

/**
 * Authentication Middleware to protect routes
 * Checks for "Bearer <token>" in Authorization header,
 * verifies the token with JWT_SECRET, and attaches the user to req.user
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Reject if no token provided
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Not authorized, no token provided",
    });
  }

  try {
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Not authorized, user not found",
      });
    }

    // 5. Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Not authorized, token failed",
    });
  }
};
