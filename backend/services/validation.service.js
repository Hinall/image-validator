import sharp from "sharp";
import { detectFaces } from "./face.service.js";

export const validateImage = async (file) => {
  // Minimum file size: 20 KB
  if (file.size < 10 * 1024) {
    return {
      valid: false,
      reason: "Image file size is too small",
    };
  }
    // Resolution Validation
  const metadata = await sharp(file.buffer).metadata();

  if (metadata.width < 100 || metadata.height < 100) {
    return {
      valid: false,
      reason: "Image resolution is too small",
    };
  }
      // Face Detection
    const faces = await detectFaces(file.buffer);

    // No Face
    if (faces.length === 0) {
        return {
            valid: false,
            reason: "No face detected",
        };
    }

    // Multiple Faces
    if (faces.length > 1) {
        return {
            valid: false,
            reason: "Multiple faces detected",
        };
    }

    // Face Too Small
    const face = faces[0];

    if (face.box.width < 120) {
        return {
            valid: false,
            reason: "Detected face is too small",
        };
    }
  return {
    valid: true,
    metadata,
  };
};