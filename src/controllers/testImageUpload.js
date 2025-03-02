import multer from "multer";
import uploadToR2 from "../r2.js";

// Konfiguracija multera za privremeno spremanje u memoriji
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadMiddleware = upload.array("images", 5);

export const uploadImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log(`Broj uploadanih datoteka: ${files.length}`);

    // Upload svih slika u transakciji
    const uploadedImageUrls = [];
    for (const file of files) {
      try {
        const imageUrl = await uploadToR2(file);
        uploadedImageUrls.push(imageUrl);
      } catch (error) {
        console.error("Greška prilikom uploada slike:", error);

        // Rollback - brišemo već uploadane slike
        await rollbackUploadedImages(uploadedImageUrls);
        return res.status(500).json({
          error: "Greška prilikom uploada slika. Transakcija poništena.",
        });
      }
    }

    // Ako su sve slike uspješno uploadane, vraćamo njihove URL-ove
    res.json({ imageUrls: uploadedImageUrls });
  } catch (error) {
    console.error("Greška prilikom uploada slika:", error);
    res.status(500).json({ error: "Greška prilikom obrade zahtjeva" });
  }
};

// Funkcija za rollback - brisanje već uploadanih slika
const rollbackUploadedImages = async (imageUrls) => {
  for (const imageUrl of imageUrls) {
    try {
      // Dodajte funkciju za brisanje slike iz R2 storagea
      await deleteFromR2(imageUrl);
      console.log(`Slika obrisana: ${imageUrl}`);
    } catch (error) {
      console.error(`Greška prilikom brisanja slike (${imageUrl}):`, error);
    }
  }
};
