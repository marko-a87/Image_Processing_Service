import { prisma } from "../config/prismaClient.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError, ValidationError } from "../utils/appError.js";
import logger from "../utils/logger.js";
import { verifyRefreshToken } from "../utils/jwt.js";

/**
 * Signup a new user
 */
const signup = async (email, username, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
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
  const MAX_FAILED_ATTEMPTS = process.env.MAX_FAILED_ATTEMPTS;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ValidationError("Invalid email or password", "email");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
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
    throw new AppError("Refresh token missing", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid refresh token or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || decoded.version !== user.tokenVersion) {
    throw new AppError("Refresh token version does not match", 401);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
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

  const decoded = verifyRefreshToken(refreshToken);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { tokenVersion: { increment: 1 } },
  });
};

export { signup, login, refreshTokens, logout };
