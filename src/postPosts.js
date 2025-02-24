import dbconnection from "./connection.js";
import { ObjectId } from "mongodb";

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
