import * as authService from "../services/auth.service.js";
import {
  deleteAccessToken,
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import logger from "../utils/logger.js";

const signupController = async (req, res, next) => {
  const { email, username, password } = req.body;
  try {
    logger.info(`Signup attempt for user...`);
    const user = await authService.signup(email, username, password);

    logger.info(`User created with ID: ${user.id}`);

    return res.status(201).json({ message: "User created", user });
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    logger.info("Login attempt");
    const user = await authService.login(email, password);

    generateAccessToken(user.id, user.role, res);
    generateRefreshToken(user.id, user.role, user.tokenVersion, res);
    logger.info(`User logged in with ID: ${user.id}`);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const refreshTokenController = async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  try {
    logger.info("Refresh token attempt...");
    const decoded = await authService.refreshTokens(token);
    logger.info(`User identified for token refresh: ID ${decoded.id}`);
    logger.info("Generating new tokens");
    // Rotate tokens

    generateAccessToken(decoded.id, decoded.role, res);
    generateRefreshToken(decoded.id, decoded.role, decoded.tokenVersion, res);

    logger.info("Token refresh successful");

    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (err) {
    next(err);
  }
};

const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    logger.info("Logout attempt");
    await authService.logout(refreshToken);
    deleteAccessToken(res);
    deleteRefreshToken(res);
    logger.info("Logout successful");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};

export {
  signupController,
  loginController,
  refreshTokenController,
  logoutController,
};
