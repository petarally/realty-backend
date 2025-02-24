import {
  getPosts,
  getPostById,
  searchProperties,
  getSellers,
} from "../controllers/nekretnine.js";
import express from "express";
import { verify } from "../controllers/korisnici.js";
import { updatePostById } from "../postPosts.js";

const router = express.Router();

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
router.post("/", verify, async (req, res) => {
  const data = req.body;
  try {
    const collection = await dbconnection("nekretnine");
    const result = await collection.insertOne(data);
    const nekretninaId = result.insertedId;
    res
      .status(201)
      .json({ message: "Nekretnina je uspješno dodana", id: nekretninaId });
  } catch (error) {
    console.error("Greška prilikom dodavanja nekretnine:", error);
    res.status(500).json({ error: "Greška prilikom dodavanja nekretnine" });
  }
});

router.post("/prodavatelji", async (req, res) => {
  const data = req.body;
  try {
    const collection = await dbconnection("prodavatelji");
    const result = await collection.insertOne(data);
    res.status(201).json({ message: "Prodavatelj je uspješno dodan" });
  } catch (error) {
    console.error("Greška prilikom dodavanja prodavatelja:", error);
    res.status(500).json({ error: "Greška prilikom dodavanja prodavatelja" });
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
