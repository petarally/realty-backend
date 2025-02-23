import dbconnection from "../connection.js";

export async function getPretplatnici(req, res) {
  try {
    const db = await dbconnection("pretplatnici");
    const pretplatnici = await db.find().toArray();
    res.json(pretplatnici);
  } catch (error) {
    console.error("Error fetching pretplatnici:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching pretplatnici" });
  }
}
