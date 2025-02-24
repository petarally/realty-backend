import multer from "multer";
import uploadToR2 from "../r2.js";

// Upload slika test start
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => uploadToR2(file));

    const imageUrls = await Promise.all(uploadPromises);
    res.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Error uploading images" });
  }
};
export const uploadMiddleware = upload.array("images", 5);

// Kraj testa
