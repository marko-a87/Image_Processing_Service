import logger from "../utils/logger.js";
import { AppError, ValidationError } from "../utils/appError.js";
/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err instanceof AppError || err instanceof ValidationError)
    logger.warn({
      message: err.message,
      status: statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  else {
    // Unexpected errors
    logger.error("Unexpected error occurred", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  }

  const response = {
    status: "error",
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { errorHandler };
