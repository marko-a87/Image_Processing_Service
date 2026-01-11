import * as ImageService from "../services/image.service.js";
import logger from "../utils/logger.js";

//  Controller to handle image upload
// const imageUploadController = async (req, res, next) => {
//   try {
//     const images = await ImageService.processUploadedImages(req.files);
//     res.status(201).json({
//       message: "Images uploaded successfully",
//       images,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const imageUploadController = async (req, res, next) => {
  try {
    // 1. Log the start with the ID
    logger.info(`Upload request received for ${req.files?.length} files`, {
      requestId: req.id,
    });

    // 2. Pass the user and request context to the service
    const images = await ImageService.processUploadedImages(
      req.files,
      req.user.id,
      req.id
    );

    res.status(201).json({
      status: "success",
      message: "Images uploaded successfully",
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

const imageRetrieveController = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    const absolutePath = await ImageService.imageRetrieve(publicId);

    // This streams the file to the browser
    res.sendFile(absolutePath, (err) => {
      if (err) {
        next(new AppError("Failed to deliver image file", 500));
      }
    });
  } catch (error) {
    next(error);
  }
};

const imageDeleteController = async (req, res, next) => {
  try {
    // Call the image deletion service
    await ImageService.imageDelete();
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const imageTransformController = async (req, res, next) => {
  try {
    // Call the image transformation service
    const transformedImage = await ImageService.imageTransform();
    res
      .status(200)
      .json({ message: "Image transformed successfully", transformedImage });
  } catch (error) {
    next(error);
  }
};

export {
  imageUploadController,
  imageRetrieveController,
  imageDeleteController,
  imageTransformController,
};
