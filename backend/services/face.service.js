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

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
  ]);

  modelLoaded = true;

  console.log("✅ Face detection & recognition models loaded");
};

export const detectFaces = async (buffer) => {
  const image = await loadImage(buffer);

  const detections = await faceapi.detectAllFaces(image);

  return detections;
};
