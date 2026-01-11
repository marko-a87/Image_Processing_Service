import "dotenv/config";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;
//Starts the server
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
