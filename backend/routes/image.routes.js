import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  uploadImage,
  getImages,
} from "../controllers/image.controller.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  uploadImage
);

router.get("/", getImages);

export default router;