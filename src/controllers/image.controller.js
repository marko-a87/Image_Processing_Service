import * as ImageService from "../services/image.service.js";

//  Controller to handle image upload
const imageUploadController = async (req, res, next) => {
  try {
    const images = await ImageService.processUploadedImages(req.files);
    res.status(201).json({
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    next(error);
  }
};

const imageRetrieveController = async (req, res, next) => {
  try {
    // Call the image retrieval service
    const image = ImageService.imageRetrieve();
    res.status(200).json({ message: "Image retrieved successfully" });
  } catch (error) {
    next(error);
  }
};
export { imageUploadController, imageRetrieveController };
