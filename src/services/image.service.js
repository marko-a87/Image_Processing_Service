import { prisma } from "../config/prismaClient.config.js";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

/**
 * Processes uploaded files, extracts dimensions, saves to DB,
 * and handles disk cleanup if the DB fails.
 */
const processUploadedImages = async (files, userId, requestId) => {
  if (!files || files.length === 0) {
    throw new AppError("No images provided for processing", 400);
  }

  const savedImageRecords = [];
  const filesToCleanup = []; // Track paths in case we need to rollback

  try {
    // We use a for...of loop instead of forEach to handle async correctly
    for (const file of files) {
      if (
        !file ||
        !file.path ||
        !file.originalname ||
        !file.mimetype ||
        !file.size
      ) {
        throw new AppError("Invalid file object provided for processing", 400);
      }

      logger.info(`Processing file: ${file.originalname}`, { requestId });

      // 1. Use Sharp to get dimensions and strip metadata for privacy
      // Note: Multer already saved the file to disk; we are reading it here.
      const metadata = await sharp(file.path).metadata();

      if (!metadata || !metadata.width || !metadata.height) {
        throw new AppError("Failed to get image metadata", 500);
      }

      // 2. Prepare the data for Prisma
      const imageData = {
        img_name: file.filename,
        originalName: file.originalname || "",
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        userId: userId,
      };

      // 3. Persist to Database
      const newImage = await prisma.image.create({
        data: imageData,
      });

      savedImageRecords.push(newImage);
      filesToCleanup.push(file.path);
    }

    logger.info(`Successfully processed ${savedImageRecords.length} images`, {
      requestId,
    });
    return savedImageRecords;
  } catch (error) {
    // --- ATOMIC ROLLBACK LOGIC ---
    console.error("CRITICAL ERROR OBJECT:", error);

    logger.error("Error during image processing. Initiating cleanup...", {
      requestId,
      error: error.message,
      code: error.code, // Prisma error codes (Pxxxx)
      meta: error.meta, // Specific field that failed
    });

    logger.error("Error during image processing. Initiating cleanup...", {
      requestId,
      error: error.message,
    });

    // Delete every file involved in this specific request to prevent "Storage Leaks"
    for (const file of files) {
      try {
        await fs.unlink(file.path);
        logger.warn(`Deleted orphaned file: ${file.filename}`, { requestId });
      } catch (unlinkErr) {
        logger.error(`Failed to delete orphaned file: ${file.path}`, {
          requestId,
        });
      }
    }

    // Re-throw the error so the controller/error-handler can catch it
    if (error.code === "P2002") {
      throw new AppError("A database constraint error occurred", 409);
    }

    throw new AppError("Failed to process and save images", 500);
  }
};

/**
 * Service to find an image path by publicId
 */
const imageRetrieve = async (publicId) => {
  // 1. Data Access (Repository role)
  const image = await prisma.image.findUnique({
    where: { publicId },
  });

  // 2. Business Logic (Service role)
  if (!image) {
    throw new AppError("No image found with that ID", 404);
  }

  // Convert stored path to absolute path for the controller
  return path.resolve(image.path);
};

const imageDelete = () => {
  // TODO: Image deletion function
};
const imageTransform = () => {
  // TODO: Image transformation functions (resize, crop, etc.)
};

export { processUploadedImages, imageRetrieve, imageDelete, imageTransform };
