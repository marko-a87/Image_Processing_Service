import logger from "../utils/logger.js";

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  // Log error with request metadata
  logger.error({
    message: err.message,
    stack: err.stack,
    status: statusCode,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
  });

  // Send safe response in production
  const response = {
    status: "error",
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message,
  };

  // Optionally expose stack in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { errorHandler };
