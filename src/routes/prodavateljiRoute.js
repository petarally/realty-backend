import { getSellers } from "../controllers/nekretnine.js";
import express from "express";

const router = express.Router();

// Dohvaćanje prodavatelja
router.get("/", async (req, res) => {
  console.log("Fetching sellers...");
  try {
    const sellers = await getSellers();
    if (!sellers.length) {
      return res.status(404).json({ error: "No sellers found" });
    }
    res.json(sellers);
  } catch (error) {
    console.error("Error in /prodavatelji route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
