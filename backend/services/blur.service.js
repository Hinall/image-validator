import sharp from "sharp";

const DEFAULT_SIZE = 500;
const BLUR_THRESHOLD = 20;

export const detectProfileBlur = async (imageBuffer) => {
  try {
    // Normalize image
    const { data, info } = await sharp(imageBuffer)
      .resize(DEFAULT_SIZE, DEFAULT_SIZE, {
        fit: "cover",
      })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const totalPixels = width * height;

    // Store Laplacian values
    const laplacian = new Int32Array(totalPixels);

    // Apply Laplacian kernel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const center = data[idx];
        const top = data[(y - 1) * width + x];
        const bottom = data[(y + 1) * width + x];
        const left = data[y * width + (x - 1)];
        const right = data[y * width + (x + 1)];

        laplacian[idx] =
          top +
          bottom +
          left +
          right -
          4 * center;
      }
    }

    // Mean
    let sum = 0;

    for (let i = 0; i < totalPixels; i++) {
      sum += laplacian[i];
    }

    const mean = sum / totalPixels;

    // Variance
    let varianceSum = 0;

    for (let i = 0; i < totalPixels; i++) {
      const diff = laplacian[i] - mean;
      varianceSum += diff * diff;
    }

    const sharpnessScore =
      varianceSum / totalPixels;

    return {
      isBlurry: sharpnessScore < BLUR_THRESHOLD,
      score: Math.round(sharpnessScore),
    };
  } catch (error) {
    console.error("Blur Detection Error:", error);

    throw error;
  }
};