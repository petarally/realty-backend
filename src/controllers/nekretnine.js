import dbconnection from "../connection.js";
import { ObjectId } from "mongodb";

export async function getPosts() {
  const collectionData = await dbconnection("nekretnine");
  const cursor = collectionData.find({ deleted: { $ne: true } }); // Filtrira podatke gde deleted nije true
  return await cursor.toArray();
}

export async function getPostById(productId) {
  try {
    if (!ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID format");
    }
    const collection = await dbconnection("nekretnine");
    const post = await collection.findOne({ _id: new ObjectId(productId) });

    return post || null; // Return null if not found
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
}

export async function getSellers() {
  try {
    const collectionData = await dbconnection("prodavatelji");
    const cursor = collectionData.find();
    return await cursor.toArray();
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return []; // Return an empty array on error
  }
}

export async function searchProperties(filters) {
  try {
    const collection = await dbconnection("nekretnine");

    // Kreiranje dinamičkog upita
    const query = {};

    if (filters.maxPrice && !isNaN(filters.maxPrice)) {
      query.price = { $lte: parseFloat(filters.maxPrice) }; // Maksimalna cijena
    }
    if (filters.maxArea && !isNaN(filters.maxArea)) {
      query.livableArea = { $lte: parseFloat(filters.maxArea) }; // Maksimalna površina
    }
    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" }; // Pretraga po lokaciji
    }
    if (filters.type) {
      query.type = filters.type; // Vrsta nekretnine
    }

    // Pronalaženje nekretnina koje zadovoljavaju filtere
    return await collection.find(query).toArray();
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
}
