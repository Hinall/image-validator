import {
    createImage,
    getAllImages,
} from "../services/image.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { validateImage } from "../services/validation.service.js";
import { convertHeicToJpeg } from "../services/heic.service.js";
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        let file = req.file;

        // Convert HEIC if required
        file = await convertHeicToJpeg(file);
        const validation = await validateImage(file);

        if (!validation.valid) {
            const image = await createImage({
                originalName: file.originalname,
                storageUrl: null,
                format: file.mimetype,
                size: file.size,
                width: null,
                height: null,
                status: "REJECTED",
                reason: validation.reason,
            });

            return res.status(400).json({
                success: false,
                data: image,
            });
        }

        // Upload to Cloudinary
        const uploadedImage = await uploadToCloudinary(file.buffer);

        // Save in PostgreSQL
        const image = await createImage({
            originalName: file.originalname,
            storageUrl: uploadedImage.secure_url,
            format: file.mimetype,
            size: file.size,
            width: validation.metadata.width,
            height: validation.metadata.height,
            status: "ACCEPTED",
            reason: null,
        });

        res.status(201).json({
            success: true,
            data: image,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
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