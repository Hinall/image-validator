import { uploadToCloudinary } from "./cloudinary.service.js";
import { convertHeicToJpeg } from "./heic.service.js";
import { createImage } from "./image.service.js";
import { validateImage } from "./validation.service.js";
import { generateEmbedding } from "./embedding.service.js";
import { isNearDuplicate } from "./duplicate.service.js";

/**
 * Process a single image file end-to-end.
 *
 * @param {object} file    - Multer file object
 * @param {object} context - Request-scoped context: { seenEmbeddings: Float32Array[] }
 */
export const processImage = async (file, context) => {
  // 1. HEIC conversion
  file = await convertHeicToJpeg(file);

  // 2. Structural validations (size, resolution, blur, face detection)
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

    return { status: "REJECTED", image };
  }

  // 3. Generate DINOv2 whole-image embedding
  const embedding = await generateEmbedding(file.buffer);

  // 4. Near-duplicate detection against this request's already-seen embeddings
  if (isNearDuplicate(embedding, context.seenEmbeddings)) {
    const image = await createImage({
      originalName: file.originalname,
      storageUrl: null,
      format: file.mimetype,
      size: file.size,
      width: validation.metadata.width,
      height: validation.metadata.height,
      status: "REJECTED",
      reason: "Too similar to another uploaded image.",
    });

    return { status: "REJECTED", image };
  }

  // 5. Upload to Cloudinary
  const uploadedImage = await uploadToCloudinary(file.buffer);

  // 6. Save to database
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

  return { status: "ACCEPTED", image };
};
