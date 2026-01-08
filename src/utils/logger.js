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

const consoleFormat = ({ timestamp, level, message, logMetadata, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${
    stack ? "\n" + stack : ""
  } ${logMetadata ? JSON.stringify(logMetadata) : ""}`;
};

const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel,

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
  logType:"client",
  format: fileFormat,
});
const fileRotateSecurityTransport = new DailyRotateFile({
  filename: "logs/security-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "warn",
  logType:"security",
  format: fileFormat,
});

// Add the file transports to the logger
logger.add(fileRotateActivityTransport);
logger.add(fileRotateServerErrorTransport);
logger.add(fileRotateClientErrorTransport);
logger.add(fileRotateSecurityTransport);

export default logger;
