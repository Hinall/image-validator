import * as faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";

const { Canvas, Image, ImageData, loadImage } = canvas;

faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData,
});

let modelLoaded = false;

export const loadFaceModels = async () => {
  if (modelLoaded) return;

  const modelPath = path.join(process.cwd(), "models");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

  modelLoaded = true;

  console.log("✅ Face detection model loaded");
};

export const detectFaces = async (buffer) => {
  const image = await loadImage(buffer);

  const detections = await faceapi.detectAllFaces(image);

  return detections;
};
