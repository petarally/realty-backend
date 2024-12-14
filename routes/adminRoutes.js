import express from "express";
import bcrypt from "bcrypt";
import { query } from "../models/db.js";

const router = express.Router();

/**
 * Utility function to find or create a person by email
 */
async function findOrCreatePerson({ name, surname, email }) {
  const emailCheckResult = await query(
    `SELECT id FROM Persons WHERE email = $1`,
    [email]
  );
  if (emailCheckResult.rows.length > 0) {
    return emailCheckResult.rows[0].id;
  }
  const personResult = await query(
    `INSERT INTO Persons (name_, surname, email) 
     VALUES ($1, $2, $3) 
     RETURNING id`,
    [name, surname, email]
  );
  return personResult.rows[0].id;
}

/**
 * Utility function to find or create a user by person_id
 */
async function findOrCreateUser({ personId, phone }) {
  const userCheckResult = await query(
    `SELECT id FROM Users WHERE person_id = $1`,
    [personId]
  );
  if (userCheckResult.rows.length > 0) {
    return userCheckResult.rows[0].id;
  }
  const userResult = await query(
    `INSERT INTO Users (person_id, phone) 
     VALUES ($1, $2) 
     RETURNING id`,
    [personId, phone]
  );
  return userResult.rows[0].id;
}

/**
 * Utility function to check if a user already has an agency role
 */
async function checkExistingAgency(userId) {
  const agencyCheckResult = await query(
    `SELECT id FROM Agency WHERE user_id = $1`,
    [userId]
  );
  if (agencyCheckResult.rows.length > 0) {
    throw new Error("This person is already associated with an agency.");
  }
}

/**
 * Utility function to add a role in the agency table
 */
async function addAgencyRole({ userId, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO Agency (user_id, password_, role_) 
     VALUES ($1, $2, $3)`,
    [userId, hashedPassword, role]
  );
}

/**
 * Route to add an admin
 */
router.post("/add-admin", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  const { name, surname, email, phone, password } = req.body;

  findOrCreatePerson({ name, surname, email })
    .then((personId) => findOrCreateUser({ personId, phone }))
    .then((userId) => checkExistingAgency(userId).then(() => userId))
    .then((userId) => addAgencyRole({ userId, password, role: "admin" }))
    .then(() => {
      res.status(201).json({ message: "Admin created successfully" });
    })
    .catch((err) => {
      if (err.message.includes("associated with an agency")) {
        res.status(400).json({ error: err.message });
      } else {
        next(err);
      }
    });
});

/**
 * Route to add an agent
 */
router.post("/add-agent", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  const { adminId, name, surname, email, phone, password } = req.body;

  // Verify the request comes from an admin
  query(`SELECT role_ FROM Agency WHERE user_id = $1`, [adminId])
    .then((result) => {
      if (result.rows.length === 0 || result.rows[0].role_ !== "admin") {
        return res
          .status(403)
          .json({ error: "Unauthorized: Only admins can add agents." });
      }
      return findOrCreatePerson({ name, surname, email });
    })
    .then((personId) => findOrCreateUser({ personId, phone }))
    .then((userId) => checkExistingAgency(userId).then(() => userId))
    .then((userId) => addAgencyRole({ userId, password, role: "agent" }))
    .then(() => {
      res.status(201).json({ message: "Agent created successfully" });
    })
    .catch((err) => {
      if (err.message.includes("associated with an agency")) {
        res.status(400).json({ error: err.message });
      } else {
        next(err);
      }
    });
});

/**
 * Route to get all agents
 */
router.get("/agents", (req, res, next) => {
  query(`SELECT * FROM Agency WHERE role_ = 'agent'`)
    .then((result) => {
      res.status(200).json(result.rows);
    })
    .catch(next);
});

/**
 * Route to get a specific agent by ID
 */
router.get("/agent/:id", (req, res, next) => {
  const { id } = req.params;
  query(`SELECT * FROM Agency WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.status(200).json(result.rows[0]);
    })
    .catch(next);
});

/**
 * Route to update an agent's details
 */
router.put("/agent/:id", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  const { id } = req.params;
  const { name, surname, email, phone, password } = req.body;

  query(`SELECT * FROM Agency WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const agent = result.rows[0];
      const updateFields = [];
      const values = [];

      // Build update fields
      if (name) {
        updateFields.push(`name_ = $${updateFields.length + 1}`);
        values.push(name);
      }
      if (surname) {
        updateFields.push(`surname = $${updateFields.length + 1}`);
        values.push(surname);
      }
      if (email) {
        updateFields.push(`email = $${updateFields.length + 1}`);
        values.push(email);
      }
      if (phone) {
        updateFields.push(`phone = $${updateFields.length + 1}`);
        values.push(phone);
      }

      if (password) {
        return bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            updateFields.push(`password_ = $${updateFields.length + 1}`);
            values.push(hashedPassword);
            values.push(id);
            return query(
              `UPDATE Agency SET ${updateFields.join(", ")} WHERE id = $${
                values.length
              }`,
              values
            );
          })
          .then(() => {
            res.status(200).json({ message: "Agent updated successfully" });
          });
      }

      values.push(id);
      return query(
        `UPDATE Agency SET ${updateFields.join(", ")} WHERE id = $${
          values.length
        }`,
        values
      )
        .then(() => {
          res.status(200).json({ message: "Agent updated successfully" });
        })
        .catch(next);
    })
    .catch(next);
});

/**
 * Route to delete an agent
 */
router.delete("/agent/:id", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  const { id } = req.params;

  query(`SELECT * FROM Agency WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Agent not found" });
      }
      return query(`DELETE FROM Agency WHERE id = $1`, [id]);
    })
    .then(() => {
      res.status(200).json({ message: "Agent deleted successfully" });
    })
    .catch(next);
});

// Add new languages
router.get("/all-languages", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  query(`SELECT * FROM all_languages`)
    .then((result) => res.status(200).json(result.rows))
    .catch(next);
});

router.put("/all-languages/:code", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  const { code } = req.params;
  const { enabled } = req.body;

  query(
    `UPDATE all_languages SET enabled = $1 WHERE language_code = $2 RETURNING *`,
    [enabled, code]
  )
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Language not found" });
      }
      res.status(200).json({
        message: "Language updated successfully",
        language: result.rows[0],
      });
    })
    .catch(next);
});

export default router;
