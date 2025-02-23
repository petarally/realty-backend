import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async function dbconnection(collectionName) {
  try {
    await client.connect();
    const db = client.db("realty");
    const coll = db.collection(collectionName);
    return coll;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllCollections() {
  try {
    await client.connect();
    const db = client.db("realty");
    const collections = await db.listCollections().toArray();
    return collections.map((collection) => collection.name);
  } catch (error) {
    console.error(error);
  }
}
