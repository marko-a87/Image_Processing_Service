import morgan from "morgan";
import logger from "../utils/logger.js";

// morgan.token("id", (req) => req.id);
// const morganMiddleware = morgan(
//   "[:id] :method :url :status :res[content-length] - :response-time ms",
//   {
//     stream: {
//       write: (message) => {
//         console.log("MORGAN IS FIRING:", message); // <--- Add this
//         logger.http(message.trim());
//       },
//     },
//   }
// );
// const morganMiddleware = morgan(
//   ":method :url :status :res[content-length] - :response-time ms", // Remove [:id] from here
//   {
//     stream: {
//       write: (message, req) => {
//         // Pass the requestId explicitly as the second argument (metadata)
//         // This allows your Winston formatter to see it!
//         logger.http(message.trim(), { requestId: req.id });
//       },
//     },
//   }
// );

const morganMiddleware = (req, res, next) => {
  // We use morgan as a function here so we can capture the 'req' object
  // and pass the requestId into Winston's metadata.
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => {
        logger.http(message.trim(), { requestId: req.id });
      },
    },
  })(req, res, next); // Execute the morgan middleware with the current req/res
};

export { morganMiddleware };
