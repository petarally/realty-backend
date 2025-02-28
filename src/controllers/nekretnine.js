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
    const sellers = await collectionData.find().toArray();

    console.log("Sellers from DB:", sellers);
    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
}

export async function searchProperties(filters) {
  try {
    const collection = await dbconnection("nekretnine");

    // Kreiranje dinamičkog upita
    const query = {};

    if (filters.propertyId) {
      query._id = new ObjectId(filters.propertyId);
    }

    if (filters.maxPrice && !isNaN(filters.maxPrice)) {
      query.price = { $lte: parseFloat(filters.maxPrice) }; // Maksimalna cijena
    }
    if (filters.maxArea && !isNaN(filters.maxArea)) {
      query.livableArea = { $lte: parseFloat(filters.maxArea) }; // Maksimalna površina
    }
    if (filters.address) {
      query.address = { $regex: filters.address, $options: "i" }; // Pretraga po lokaciji
    }
    if (filters.type) {
      query.buildType = filters.type; // Vrsta nekretnine
    }

    // Pronalaženje nekretnina koje zadovoljavaju filtere
    return await collection.find(query).toArray();
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
}
