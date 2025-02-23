import {
  getPosts,
  getPostById,
  searchProperties,
  getSellers,
} from "../controllers/nekretnine.js";
import express from "express";
import { verify } from "../controllers/korisnici.js";
import { postPosts, updatePostById } from "../postPosts.js";
import multer from "multer";
import uploadToR2 from "../r2.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Dohvaćanje svih nekretnina
router.get("/", async (req, res) => {
  try {
    const properties = await getPosts();
    res.json(properties);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

// Dodavanje nove nekretnine
router.post("/", upload.array("images"), verify, async (req, res) => {
  const data = req.body;
  const files = req.files;

  try {
    // Upload images if they exist
    const imageUrls = files.length
      ? await Promise.all(files.map(uploadToR2))
      : [];

    // Add image URLs to data
    data.imageUrls = imageUrls;

    // Save to database
    const dataPosted = await postPosts(data);
    res.json(dataPosted);
  } catch (error) {
    console.error("Error posting to postPosts:", error);
    res.status(500).json({ error: "An error occurred while posting data" });
  }
});

// Dohvaćanje nekretnine po ID-u
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await getPostById(id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post" });
  }
});

// Ažuriranje nekretnine po ID-u
router.patch("/:id", verify, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPost = await updatePostById(id, updateData);
    res.json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pretraga nekretnina
router.get("/search", async (req, res) => {
  const filters = req.query;
  try {
    const properties = await searchProperties(filters);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Error searching properties" });
  }
});

// Dohvaćanje prodavatelja
router.get("/sellers", async (req, res) => {
  try {
    const properties = await getSellers();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sellers" });
  }
});

export default router;
