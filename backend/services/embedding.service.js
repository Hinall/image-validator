// src/services/embedding.service.js
// ONNX Runtime based DINOv2 embedding extraction
import ort from "onnxruntime-node";
import sharp from "sharp";
import { readFile, writeFile } from "fs/promises";
import path from "path";

let session = null;
const DEFAULT_MODEL_PATH = path.resolve("src/models/dinov2-small.onnx");

/**
 * Load the DINOv2 ONNX model.
 * Should be called once at server startup.
 */
export const loadEmbeddingModel = async () => {
  if (session) return;
  console.log("⏳ Loading DINOv2 ONNX model...");
  const modelPath = process.env.DINO_MODEL_PATH || DEFAULT_MODEL_PATH;
  // Ensure model file exists – if not, download it (simplified placeholder).
  try {
    await readFile(modelPath);
  } catch (e) {
    console.warn(`Model not found at ${modelPath}. Please download the ONNX model manually.`);
    throw e;
  }
  session = await ort.InferenceSession.create(modelPath);
  console.log("✅ DINOv2 ONNX model loaded");
};

/**
 * Preprocess an image buffer to a Float32Tensor suitable for DINOv2.
 * Steps: flatten, resize to 224x224, convert to RGB, normalize to [0,1],
 * and arrange in NCHW order.
 */
const preprocess = async (buffer) => {
  const { data, info } = await sharp(buffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(224, 224, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // should be 224,224,3
  const size = width * height;
  const floatData = new Float32Array(channels * size);
  // Convert interleaved RGB -> channel‑first order
  for (let i = 0; i < data.length; i += channels) {
    const pixelIdx = i / channels;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    floatData[pixelIdx] = r; // channel 0
    floatData[size + pixelIdx] = g; // channel 1
    floatData[2 * size + pixelIdx] = b; // channel 2
  }
  // Create NCHW tensor
  return new ort.Tensor("float32", floatData, [1, channels, height, width]);
};

/**
 * Generate a normalized DINOv2 embedding for an image buffer.
 * @param {Buffer} imageBuffer
 * @returns {Promise<Float32Array>} Normalized embedding vector
 */
export const generateEmbedding = async (imageBuffer) => {
  if (!session) {
    throw new Error("Embedding model not loaded. Call loadEmbeddingModel() at startup.");
  }
  const inputTensor = await preprocess(imageBuffer);
  const feeds = {};
  feeds[session.inputNames[0]] = inputTensor;
  const results = await session.run(feeds);
  const outputName = session.outputNames[0];
  const outputTensor = results[outputName]; // Float32Array
  const embedding = outputTensor.data;
  // L2‑normalize (model may already output normalized vectors, but we enforce it)
  let norm = 0;
  for (let i = 0; i < embedding.length; i++) norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < embedding.length; i++) embedding[i] /= norm;
  }
  return embedding;
};
