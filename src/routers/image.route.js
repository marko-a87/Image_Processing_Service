import express from "express";
import {
  imageRetrieveController,
  imageUploadController,
  imageDeleteController,
} from "../controllers/image.controller.js";

import { uploadImageMiddleware } from "../middleware/uploadImage.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadImageMiddleware.array("files", 10),
  imageUploadController
);
router.get("/:publicId", authenticate, imageRetrieveController);
router.delete("/:publicId", authenticate, imageDeleteController);

export default router;
