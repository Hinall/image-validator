import * as faceapi from "face-api.js";
import canvas from "canvas";

const { loadImage } = canvas;

export const extractFaceDescriptor = async (buffer) => {
  const image = await loadImage(buffer);

  // We detect a single face, get its landmarks and descriptor
  const detection = await faceapi
    .detectSingleFace(image)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No face detected or could not extract descriptor");
  }

  return detection.descriptor; // Float32Array
};
