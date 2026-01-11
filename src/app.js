import express from "express";
import cookieParser from "cookie-parser";

// Middleware Imports
import { requestId } from "./middleware/requestId.middleware.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { morganMiddleware } from "./middleware/morgan.middleware.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

// Router Imports
import authRoute from "./routers/auth.route.js";
import userRoute from "./routers/user.route.js";
import imageRoute from "./routers/image.route.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";

const app = express();

// --- 1. PRE-ROUTE MIDDLEWARE ---
app.use(requestId); // Generate ID first so everything else can log it
app.use(morganMiddleware);
app.use(cookieParser());
app.use(express.json()); // Parse body before rate limiter/logging in case they need it
app.use(rateLimiter);

// --- 2. ROUTES ---
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/images", imageRoute);

// --- 3. 404 HANDLER ---
app.use(notFoundMiddleware);

// --- 4. GLOBAL ERROR HANDLER ---
app.use(errorHandler); // Must be the last one!

export default app;
