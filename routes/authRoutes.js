import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../models/db.js";

const router = express.Router();

// JWT secret key (store this in an environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";

// Utility function to find user by email
async function findUserByEmail(email) {
  const queryText = `
    SELECT 
      persons.id AS person_id, 
      persons.name_, 
      persons.surname, 
      persons.email, 
      users.phone, 
      agency.password_, 
      agency.role_
    FROM 
      persons
    JOIN 
      users ON persons.id = users.person_id
    JOIN 
      agency ON users.id = agency.user_id
    WHERE 
      email = $1
  `;
  const result = await query(queryText, [email]);
  return result.rows[0];
}

// Login route
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password_);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role_, // Assuming role is stored in the `role_` column
    };

    // Sign the JWT token (expires in 1 hour)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
});

export default router;
