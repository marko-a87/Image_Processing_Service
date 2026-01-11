import DailyRotateFile from "winston-daily-rotate-file";
import config from "../config/log.config.js";
import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Formats a log message for console output.
 * @param {object} logObject - Log object containing timestamp, level, message, logMetadata, and stack.
 * @returns {string} - Formatted log message string.
 */
// const consoleFormat = (info) => {
//   const { timestamp, level, message, requestId, logMetadata, stack } = info;

//   return `${timestamp} [${level.toUpperCase()}]: ${message} ${
//     stack ? "\n" + stack : ""
//   } ${logMetadata ? JSON.stringify(logMetadata) : ""}`;
// };
// const consoleFormat = (info) => {
//   // 1. Extract properties and provide a default empty object for logMetadata
//   const {
//     timestamp,
//     level,
//     message,
//     requestId,
//     logMetadata = {},
//     stack,
//   } = info;

//   // 2. Format the Request ID tag (only if it exists)
//   const idTag = requestId ? ` [${requestId.split("-")[0]}]` : "";

//   // 3. Stringify metadata only if there is actually data inside it
//   const metaString = Object.keys(logMetadata).length
//     ? ` ${JSON.stringify(logMetadata)}`
//     : "";

//   // 4. Return the combined string
//   return `${timestamp}${idTag} [${level.toUpperCase()}]: ${message}${
//     stack ? "\n" + stack : ""
//   }${metaString}`;
// };

const consoleFormat = (info) => {
  const {
    timestamp,
    level,
    message,
    requestId,
    logMetadata = {},
    stack,
  } = info;

  // If requestId exists (from manual logger.info calls), format it.
  // If it doesn't exist, we don't add a tag because Morgan already puts the ID in the message.
  const idTag = requestId ? ` [${requestId.split("-")[0]}]` : "";

  const metaString = Object.keys(logMetadata).length
    ? ` ${JSON.stringify(logMetadata)}`
    : "";

  return `${timestamp}${idTag} [${level.toUpperCase()}]: ${message}${
    stack ? "\n" + stack : ""
  }${metaString}`;
};

const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: logLevels,
  level: "debug",

  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS A" }),
    winston.format.printf(consoleFormat)
  ),
  transports: [new winston.transports.Console()],
});

const fileRotateActivityTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
  format: fileFormat,
});
const fileRotateServerErrorTransport = new DailyRotateFile({
  filename: "logs/server-error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
  format: fileFormat,
});

const fileRotateClientErrorTransport = new DailyRotateFile({
  filename: "logs/client-warnings-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "warn",
  logType: "client",
  format: fileFormat,
});
const fileRotateSecurityTransport = new DailyRotateFile({
  filename: "logs/security-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "warn",
  logType: "security",
  format: fileFormat,
});

// Add the file transports to the logger
logger.add(fileRotateActivityTransport);
logger.add(fileRotateServerErrorTransport);
logger.add(fileRotateClientErrorTransport);
logger.add(fileRotateSecurityTransport);

export default logger;
