import express from "express";
import { authenticateUser } from "../controllers/korisnici.js";

const router = express.Router();

// Ruta za prijavu korisnika
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
