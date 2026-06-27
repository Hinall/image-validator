import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import imageRoutes from "../routes/image.routes.js";
import { loadFaceModels } from "../services/face.service.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      success: true,
      message: "Database connected successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
app.use("/api/images", imageRoutes);
await loadFaceModels();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});