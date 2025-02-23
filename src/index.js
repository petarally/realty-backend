import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import korisniciRoutes from "./routes/korisniciRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import pretplatniciRoutes from "./routes/pretplatniciRoutes.js";
import { translateText } from "./translator.js";

dotenv.config();

const app = express();
const port = 3232;

app.use(cors());
app.use(express.json());

// KORISNICI
app.use("/auth", authRoutes);
app.use("/users", korisniciRoutes);
app.use("/pretplatnici", pretplatniciRoutes);

// TRANSLATE
app.post("/translate", async (req, res) => {
  const { text } = req.body;

  try {
    const translations = await translateText(text);
    res.json({ translations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.status(403).send("403 Unauthorized. Contact Administrator.");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
