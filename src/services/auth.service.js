import { prisma } from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError, ValidationError } from "../utils/appError.js";
import logger from "../utils/logger.js";

const MAX_FAILED_ATTEMPTS = 5;

/**
 * Signup a new user
 */
const signup = async (email, username, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    logger.warning({
      message: "Signup failed: User with this email already exists",
      email,
      timestamp: new Date().toISOString(),
    });
    throw new AppError(
      "User with this email already exists",
      400,
      "USER_EXISTS"
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      tokenVersion: 1,
    },
  });

  logger.info({
    message: "New user signed up",
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
};

/**
 * Login a user
 */
const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warning({
      message: "Login failed: Invalid email",
      email,
      timestamp: new Date().toISOString(),
    });
    throw new ValidationError("Invalid email or password", "email");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    logger.warning({
      message: "Login failed: Account temporarily locked",
      userId: user.id,
      lockedUntil: user.lockedUntil,
      timestamp: new Date().toISOString(),
    });
    throw new ValidationError("Account temporarily locked", "account");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const failed = user.failedLoginCount + 1;
    const lockedUntil =
      failed >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: lockedUntil ? 0 : failed,
        lockedUntil,
      },
    });

    logger.warning({
      message: "Login failed: Invalid password",
      userId: user.id,
      failedCount: failed,
      lockedUntil,
      timestamp: new Date().toISOString(),
    });

    throw new ValidationError("Invalid email or password", "password");
  }

  // Successful login: reset failed attempts and rotate token version
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      tokenVersion: { increment: 1 },
    },
  });

  logger.info({
    message: "User logged in successfully",
    userId: updatedUser.id,
    email: updatedUser.email,
    timestamp: new Date().toISOString(),
  });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    role: updatedUser.role,
    tokenVersion: updatedUser.tokenVersion,
  };
};

/**
 * Refresh tokens
 */
const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    logger.warning({
      message: "Refresh token missing",
      timestamp: new Date().toISOString(),
    });
    throw new AppError("Unauthorized", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
  } catch (err) {
    logger.warning({
      message: "Invalid or expired refresh token",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
    throw new AppError("Invalid refresh token or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || decoded.version !== user.tokenVersion) {
    logger.warning({
      message: "Refresh token version mismatch",
      userId: decoded.id,
      tokenVersion: decoded.version,
      timestamp: new Date().toISOString(),
    });
    throw new AppError("Refresh token invalidated", 401);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
  });

  logger.info({
    message: "Refresh token rotated",
    userId: updatedUser.id,
    newTokenVersion: updatedUser.tokenVersion,
    timestamp: new Date().toISOString(),
  });

  return {
    id: updatedUser.id,
    role: updatedUser.role,
    tokenVersion: updatedUser.tokenVersion,
  };
};

/**
 * Logout user
 */
const logout = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { tokenVersion: { increment: 1 } },
    });

    logger.info({
      message: "User logged out",
      userId: decoded.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Invalid / expired token: logout still succeeds client-side
    logger.info({
      message: "Logout attempted with invalid/expired token",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};

export { signup, login, refreshTokens, logout };
