import express from "express";
import { query } from "../models/db.js";

const router = express.Router();

// POST /api/agent/add-property
router.post("/add-property", async (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Access denied, agent only" });
  }

  const {
    agent_id,
    property_type,
    price,
    map_longitude,
    map_latitude,
    languages, // Array of languages, e.g., [{ language_code, name, description, slug }]
    building_details,
    cadastral_details,
    categories,
    land_details,
    images,
  } = req.body;

  try {
    // Step 1: Create the property in the properties table
    const result = await query(
      `INSERT INTO properties (agent_id, property_type, price, map_longitude, map_latitude, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [agent_id, property_type, price, map_longitude, map_latitude]
    );
    const property_id = result.rows[0].id;

    // Step 2: Insert the languages (translations for property name, description, etc.)
    const languagePromises = languages.map((lang) =>
      query(
        `INSERT INTO languages (property_id, language_code, name, description, slug) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          property_id,
          lang.language_code,
          lang.name,
          lang.description,
          lang.slug,
        ]
      )
    );
    await Promise.all(languagePromises);

    // Step 3: Insert building details if available
    if (building_details) {
      await query(
        `INSERT INTO buildings (property_id, land_id, pool, pool_area, heated_pool, sewage_system, access_to_beach, parking, parking_type, garage, garage_area, year_built)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          property_id,
          building_details.land_id,
          building_details.pool,
          building_details.pool_area,
          building_details.heated_pool,
          building_details.sewage_system,
          building_details.access_to_beach,
          building_details.parking,
          building_details.parking_type,
          building_details.garage,
          building_details.garage_area,
          building_details.year_built,
        ]
      );
    }

    // Step 4: Insert cadastral details if available
    if (cadastral_details) {
      await query(
        `INSERT INTO cadastrals (property_id, cadastral_code) 
         VALUES ($1, $2)`,
        [property_id, cadastral_details.cadastral_code]
      );
    }

    // Step 5: Insert categories if available
    if (categories && categories.length > 0) {
      const categoryPromises = categories.map((category) =>
        query(
          `INSERT INTO categories (property_id, category) 
           VALUES ($1, $2)`,
          [property_id, category]
        )
      );
      await Promise.all(categoryPromises);
    }

    // Step 6: Insert land details if available
    if (land_details) {
      await query(
        `INSERT INTO lands (property_id, area, agricultural) 
         VALUES ($1, $2, $3)`,
        [property_id, land_details.area, land_details.agricultural]
      );
    }

    // Step 7: Insert images if available
    if (images && images.length > 0) {
      const imagePromises = images.map((image) =>
        query(
          `INSERT INTO images (property_id, image) 
           VALUES ($1, $2)`,
          [property_id, image]
        )
      );
      await Promise.all(imagePromises);
    }

    res.status(201).json({ message: "Property created successfully" });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent/properties
router.get("/properties", async (req, res, next) => {
  const { agent_id } = req.query;

  try {
    const result = await query(
      `SELECT p.id, p.property_type, p.price, p.map_longitude, p.map_latitude, p.created_at, 
              pl.language_code, pl.name, pl.description, pl.slug
       FROM properties p
       JOIN languages pl ON p.id = pl.property_id
       WHERE p.agent_id = $1`,
      [agent_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/agent/property/:id
router.get("/property/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT p.id, p.property_type, p.price, p.map_longitude, p.map_latitude, p.created_at,
              pl.language_code, pl.name, pl.description, pl.slug
       FROM properties p
       JOIN languages pl ON p.id = pl.property_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/agent/property/:id
router.put("/property/:id", async (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Access denied, agent only" });
  }
  const { id } = req.params;
  const {
    property_type,
    price,
    map_longitude,
    map_latitude,
    languages,
    building_details,
    cadastral_details,
    categories,
    land_details,
    images,
  } = req.body;

  try {
    // Step 1: Update property in the properties table
    await query(
      `UPDATE properties 
       SET property_type = $1, price = $2, map_longitude = $3, map_latitude = $4, updated_at = NOW() 
       WHERE id = $5`,
      [property_type, price, map_longitude, map_latitude, id]
    );

    // Step 2: Update languages (translations) for the property
    const languagePromises = languages.map((lang) =>
      query(
        `UPDATE languages 
         SET name = $1, description = $2, slug = $3 
         WHERE property_id = $4 AND language_code = $5`,
        [lang.name, lang.description, lang.slug, id, lang.language_code]
      )
    );
    await Promise.all(languagePromises);

    // Step 3: Update building details
    if (building_details) {
      await query(
        `UPDATE buildings 
         SET land_id = $1, pool = $2, pool_area = $3, heated_pool = $4, sewage_system = $5, 
             access_to_beach = $6, parking = $7, parking_type = $8, garage = $9, garage_area = $10, year_built = $11 
         WHERE property_id = $12`,
        [
          building_details.land_id,
          building_details.pool,
          building_details.pool_area,
          building_details.heated_pool,
          building_details.sewage_system,
          building_details.access_to_beach,
          building_details.parking,
          building_details.parking_type,
          building_details.garage,
          building_details.garage_area,
          building_details.year_built,
          id,
        ]
      );
    }

    // Update other tables like cadastral, categories, lands, images if applicable...

    res.status(200).json({ message: "Property updated successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/agent/property/:id
router.delete("/property/:id", async (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Access denied, agent only" });
  }
  const { id } = req.params;

  try {
    // Step 1: Delete related entries in the languages table
    await query(`DELETE FROM languages WHERE property_id = $1`, [id]);

    // Step 2: Delete related entries in other tables (e.g., buildings, categories, images)
    await query(`DELETE FROM buildings WHERE property_id = $1`, [id]);
    await query(`DELETE FROM cadastrals WHERE property_id = $1`, [id]);
    await query(`DELETE FROM categories WHERE property_id = $1`, [id]);
    await query(`DELETE FROM lands WHERE property_id = $1`, [id]);
    await query(`DELETE FROM images WHERE property_id = $1`, [id]);

    // Step 3: Delete the property itself
    await query(`DELETE FROM properties WHERE id = $1`, [id]);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
