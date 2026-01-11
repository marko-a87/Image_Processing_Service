import logger from "../utils/logger.js";
const notFoundMiddleware = (req, res, next) => {
  const errorMessage = `Route ${req.originalUrl} not found`;

  // Manually log this so it shows up in your log files/console
  logger.warn(errorMessage, {
    requestId: req.id,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    status: "error",
    message: errorMessage,
  });
};
export default notFoundMiddleware;
