import { v4 as uuidv4 } from "uuid";

export const requestId = (req, res, next) => {
  // Generate a unique ID for this request
  const id = uuidv4();

  // Attach it to the request object so other parts of the app can see it
  req.id = id;

  // Set it in the response header (great for debugging in the browser)
  res.setHeader("X-Request-Id", id);

  next();
};
