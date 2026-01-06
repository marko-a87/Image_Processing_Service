import winston from "winston";
import config from "../config.js";
const logLevels = {
  error: 0,
  warning: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS a",
    }),
    winston.format.printf(
      ({ timestamp, level, message, logMetadata, stack }) =>
        `${timestamp} ${level}:${logMetadata || ""} ${message} ${stack || ""}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({
      filename: "logs/activity.log",
      level: "info",
    }),
  ],
});

export default logger;
