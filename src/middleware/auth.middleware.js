import jwt from "jsonwebtoken";
import { prisma } from "../config/prismaClient.config.js";
import { AppError } from "../utils/appError.js";

// 1. Identity Verification
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

    // Fetch user from DB to ensure they still exist and check tokenVersion
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true}, // Only fetch what we need
    });

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    // ATTACH USER TO REQ 
    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

// 2. Role Authorization (RBAC)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role ${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
