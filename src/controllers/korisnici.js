import dbconnection from "../connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { ObjectId } from "mongodb";

export async function registerUser(userData) {
  let db = await dbconnection("korisnici");
  let doc = {
    email: userData.email,
    password: await bcrypt.hash(userData.password, 8),
    ime_i_prezime: userData.ime_i_prezime,
    sluzbeni_telefon: userData.sluzbeni_telefon,
    sluzbeni_email: userData.sluzbeni_email,
    rola: userData.rola,
  };
  try {
    let result = await db.insertOne(doc);
    if (result && result.insertedId) {
      return result.insertedId;
    }
    console.log(userData);
  } catch (e) {
    if (e.code == 11000) {
      throw new Error("User already exists");
    }
    console.log(e.code);
  }
}

export async function authenticateUser(email, password) {
  const db = await dbconnection("korisnici");
  const user = await db.findOne({ email });

  if (!user) {
    console.log("No user found with email:", email);
    throw new Error("Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log("Password match result:", passwordMatch);

  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  console.log("Preparing to sign JWT");
  const token = jwt.sign(
    { email: user.email, role: user.rola }, // Store role instead of boolean
    process.env.JWT_SECRET,
    { algorithm: "HS512", expiresIn: "365d" }
  );

  delete user.password; // Ensure password is not exposed in response

  return {
    token,
    email: user.email,
    role: user.rola, // Return role instead of `isAdmin`
  };
}

export async function getAllUsers() {
  let db = await dbconnection("korisnici");
  try {
    let users = await db.find().toArray();
    users.forEach((user) => delete user.password); // Remove password from each user
    return users;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(userId) {
  let db = await dbconnection("korisnici");
  try {
    let user = await db.findOne({ _id: new ObjectId(userId) });
    if (user) {
      delete user.password; // Remove password from user
      return user;
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch user");
  }
}

export async function updateUserById(userId, updateData) {
  let db = await dbconnection("korisnici");
  try {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 8);
    }
    let result = await db.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }
    return result;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to update user");
  }
}

export function verify(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let [type, token] = req.headers.authorization.split(" ");
    console.log("Token type:", type); // Provjeri koji je tip tokena
    console.log("Token:", token); // Provjeri što dolazi kao token

    if (type !== "Bearer") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    req.jwt = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
