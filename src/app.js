import express from "express";
import authRoute from "./routers/auth.route.js";
import userRoute from "./routers/user.route.js";
import imageRoute from "./routers/image.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Apply rate limiter to all requests
//Rate Limiter
app.use(rateLimiter);


app.use(express.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1/images", imageRoute);



//Global Error Handler
app.use(errorHandler);
export default app;
