import express from "express";
import {
  imageRetrieveController,
  imageUploadController,
} from "../controllers/image.controller.js";

import { uploadImageMiddleware } from "../middleware/uploadImage.middleware.js";
const router = express.Router();

router.post(
  "/",
  uploadImageMiddleware.array("files", 10),
  imageUploadController
);
router.get("/:id", imageRetrieveController);

export default router;
