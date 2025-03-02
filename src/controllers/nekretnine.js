import dbconnection from "../connection.js";
import { ObjectId } from "mongodb";

// Funkcija za dohvaćanje svih nekretnina
export async function getPosts() {
  const collectionData = await dbconnection("nekretnine");
  const cursor = collectionData.find({ deleted: { $ne: true } });
  return await cursor.toArray();
}

// Funkcija za dohvaćanje nekretnina po ID-u
export async function getPostById(productId) {
  try {
    if (!ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID format");
    }
    const collection = await dbconnection("nekretnine");
    const post = await collection.findOne({ _id: new ObjectId(productId) });

    return post || null;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
}

// Funkcija za dohvaćanje svih prodavatelja
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

// Funkcija za dohvaćanje nekretnina po zadanom parametru
export async function searchProperties(filters) {
  try {
    const collection = await dbconnection("nekretnine");
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
