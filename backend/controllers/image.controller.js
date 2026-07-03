import {
    createImage,
    getAllImages,
} from "../services/image.service.js";
import { processImage } from "../services/imageProcessor.service.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const accepted = [];
    const rejected = [];

    // Request-scoped context — embeddings are never persisted across requests
    const context = { seenEmbeddings: [] };

    for (const file of req.files) {
      const result = await processImage(file, context);

    if (result.status === "ACCEPTED") {
        accepted.push(result.image);
    } else {
        rejected.push(result.image);
    }

    }

    return res.status(200).json({
      success: true,
      accepted,
      rejected,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getImages = async (req, res) => {
    try {
        const images = await getAllImages();

        res.json({
            success: true,
            data: images,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};