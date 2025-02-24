import express from "express";
import {
  uploadImages,
  uploadMiddleware,
} from "../controllers/testImageUpload.js";

const router = express.Router();

router.post("/", uploadMiddleware, uploadImages);

export default router;
