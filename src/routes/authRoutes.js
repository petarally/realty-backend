import express from "express";
import { authenticateUser, registerUser } from "../controllers/korisnici.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const userId = await registerUser(req.body);
    res.status(201).json({ message: "User registered", userId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
