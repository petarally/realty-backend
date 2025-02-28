import dbconnection from "../connection.js";
import { verify } from "../controllers/korisnici.js";
import express from "express";
import { ObjectId } from "mongodb"; // Assuming you use MongoDB

const router = express.Router();

router.delete("/:id", verify, async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid post ID format" });
  }

  try {
    const collection = await dbconnection("nekretnine");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { delete: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post marked as deleted successfully" });
  } catch (error) {
    console.error("Error marking post as deleted:", error);
    res
      .status(500)
      .json({ error: "An error occurred while marking the post as deleted" });
  }
});

export default router;
