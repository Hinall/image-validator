import sharp from "sharp";
import { detectFaces } from "./face.service.js";
import { detectProfileBlur } from "./blur.service.js";

/**
 * Run all structural validations on an uploaded image file.
 * Does NOT perform duplicate detection — that is handled by imageProcessor.
 *
 * @param {object} file - Multer file object (must have .buffer and .size)
 * @returns {{ valid: boolean, reason?: string, metadata?: object }}
 */
export const validateImage = async (file) => {
    console.log("Validation started");

    // File size check (min 1 KB)
    if (file.size < 1 * 1024) {
        return { valid: false, reason: "Image file size is too small" };
    }

    // Resolution Validation
    const metadata = await sharp(file.buffer).metadata();

    if (metadata.width < 100 || metadata.height < 100) {
        return { valid: false, reason: "Image resolution is too small" };
    }

    // Blur Detection
    const blurResult = await detectProfileBlur(file.buffer);

    console.log("Sharpness Score:", blurResult.score);

    if (blurResult.isBlurry) {
        return { valid: false, reason: `Image is blurry (Score: ${blurResult.score})` };
    }

    // Face Detection
    const faces = await detectFaces(file.buffer);

    // No Face
    if (faces.length === 0) {
        return { valid: false, reason: "No face detected" };
    }

    // Multiple Faces
    if (faces.length > 1) {
        return { valid: false, reason: "Multiple faces detected" };
    }

    // Face Too Small
    const face = faces[0];
    const faceWidthPercentage = (face.box.width / metadata.width) * 100;

    if (faceWidthPercentage < 15) {
        return { valid: false, reason: "Detected face is too small" };
    }

    return { valid: true, metadata };
};

