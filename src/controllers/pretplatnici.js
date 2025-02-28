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

export async function addPretplatnik(req, res) {
  const { ime_prezime, email } = req.body;

  if (!ime_prezime || !email) {
    return res
      .status(400)
      .json({ error: "Ime i prezime i email su obavezni." });
  }

  try {
    const collection = await dbconnection("pretplatnici");

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const newPretplatnik = {
      ime_prezime,
      email,
      datum_privole: formatDate(new Date()),
    };

    const result = await collection.insertOne(newPretplatnik);

    res.status(201).json({
      message: "Pretplatnik je uspješno dodan u bazu",
      pretplatnik: result.ops
        ? result.ops[0]
        : { _id: result.insertedId, ...newPretplatnik },
    });
  } catch (error) {
    console.error("Greška prilikom dodavanja novog pretplatnika:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the pretplatnik" });
  }
}
