import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  registerUser,
} from "../controllers/korisnici.js";
import { verify } from "../controllers/korisnici.js";

const router = express.Router();

// Dohvati sve korisnike (samo za autentificirane korisnike)
router.get("/", verify, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dohvati korisnika po ID-u
router.get("/:id", verify, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ažuriraj korisnika po ID-u
router.patch("/:id", verify, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const result = await updateUserById(userId, updateData);
    res.json({ message: "User updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta za registraciju novog agenta
router.post("/createUser", verify, async (req, res) => {
  const userData = { ...req.body, rola: "agent" };
  console.log(userData);
  try {
    const newUserId = await registerUser(userData);
    res.status(201).json({ userId: newUserId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
