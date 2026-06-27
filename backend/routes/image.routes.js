import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  uploadImage,
  getImages,
} from "../controllers/image.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);

router.get("/", getImages);

export default router;