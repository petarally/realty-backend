import dbconnection from "./connection.js";
import { ObjectId } from "mongodb";
import uploadToR2 from "./r2.js";

export async function postPosts(data, files) {
  const collectionData = await dbconnection("nekretnine");

  // Uploaduj slike u R2
  const imageUrls = await Promise.all(
    files.map(async (file) => await uploadToR2(file))
  );

  // Kreiraj podatke za unos u bazu
  const postData = {
    address: data.address,
    amenities: data.amenities,
    bathrooms: data.bathrooms,
    bedrooms: data.bedrooms,
    buildType: data.buildType,
    buildYear: data.buildYear,
    createdAt: new Date(),
    description: data.description,
    gardenArea: data.gardenArea,
    images: imageUrls,
    livableArea: data.livableArea,
    price: data.price,
    propertyName: data.propertyName,
    slugs: data.slugs,
    sold: data.sold,
    deleted: data.deleted,
    userId: data.userId,
  };

  // Unesi podatke u MongoDB
  await collectionData.insertOne(postData);
  return postData;
}

export async function getPostById(productId) {
  try {
    const collection = await dbconnection("nekretnine");
    const post = await collection.findOne({ _id: new ObjectId(productId) });
    return post;
  } catch (error) {
    console.error("Error fetching posts by ID:", error);
    throw error;
  }
}

export async function updatePostById(productId, updateData) {
  try {
    const protectedFields = ["_id"];

    const invalidFields = Object.keys(updateData).filter((field) =>
      protectedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      throw new Error(
        `Fields not allowed to be updated: ${invalidFields.join(", ")}`
      );
    }

    const collection = await dbconnection("nekretnine");
    const updatedPost = await collection.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updatedPost) {
      throw new Error("Post not found");
    }

    return updatedPost.value;
  } catch (error) {
    console.error("Error updating post by ID:", error);
    throw error;
  }
}
