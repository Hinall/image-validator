import sharp from "sharp";

export const validateImage = async (file) => {
  // Minimum file size: 20 KB
  if (file.size < 20 * 1024) {
    return {
      valid: false,
      reason: "Image file size is too small",
    };
  }

  const metadata = await sharp(file.buffer).metadata();

  if (metadata.width < 500 || metadata.height < 500) {
    return {
      valid: false,
      reason: "Image resolution is too small",
    };
  }

  return {
    valid: true,
    metadata,
  };
};