import express from "express";
import { query } from "../models/db.js";

const router = express.Router();

/**
 * Function to get translated string for a given key in the selected language
 */
const getTranslation = (languageCode, key) => {
  return query(
    `
      SELECT translation
      FROM translations
      WHERE language_code = $1 AND key = $2
    `,
    [languageCode, key]
  ).then((result) => {
    return result.rows[0] ? result.rows[0].translation : key; // Fallback to key if translation not found
  });
};

/**
 * Get all properties in a specific language with optional filtering
 * URL pattern: /:languageCode/:translatedProperties
 */
router.get("/:languageCode/:translatedProperties", (req, res, next) => {
  const { languageCode, translatedProperties } = req.params;
  const {
    price_min,
    price_max,
    location,
    type,
    page = 1,
    limit = 10,
  } = req.query;

  // Translate "properties" or its equivalent based on the chosen language
  getTranslation(languageCode, "properties")
    .then((translatedTerm) => {
      if (translatedProperties !== translatedTerm) {
        return res
          .status(404)
          .json({ error: `Invalid endpoint for language ${languageCode}` });
      }

      // Build the base query
      let queryString = `
        SELECT p.id, p.slug, p.created_at, pl.name, pl.description, pl.language_code, p.price, p.type, p.location
        FROM properties p
        INNER JOIN property_languages pl ON p.id = pl.property_id
        WHERE pl.language_code = $1
      `;

      // Prepare query parameters
      const params = [languageCode];

      // Apply filters if provided
      if (price_min) {
        queryString += ` AND p.price >= $${params.length + 1}`;
        params.push(price_min);
      }

      if (price_max) {
        queryString += ` AND p.price <= $${params.length + 1}`;
        params.push(price_max);
      }

      if (location) {
        queryString += ` AND p.location ILIKE $${params.length + 1}`;
        params.push(`%${location}%`);
      }

      if (type) {
        queryString += ` AND p.type = $${params.length + 1}`;
        params.push(type);
      }

      // Pagination
      queryString += ` LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`;
      params.push(limit, (page - 1) * limit);

      // Execute the query
      query(queryString, params)
        .then((result) => {
          res.status(200).json(result.rows);
        })
        .catch(next);
    })
    .catch(next);
});

/**
 * Get a specific property by slug and language
 * URL pattern: /:languageCode/:translatedProperties/:slug
 */
router.get("/:languageCode/:translatedProperties/:slug", (req, res, next) => {
  const { languageCode, translatedProperties, slug } = req.params;

  // Translate "properties" or its equivalent based on the chosen language
  getTranslation(languageCode, "properties")
    .then((translatedTerm) => {
      if (translatedProperties !== translatedTerm) {
        return res
          .status(404)
          .json({ error: `Invalid endpoint for language ${languageCode}` });
      }

      query(
        `
        SELECT p.id, p.slug, p.created_at, pl.name, pl.description, pl.language_code, p.price, p.type, p.location
        FROM properties p
        INNER JOIN property_languages pl ON p.id = pl.property_id
        WHERE pl.language_code = $1 AND p.slug = $2
      `,
        [languageCode, slug]
      )
        .then((result) => {
          if (result.rows.length === 0) {
            return res.status(404).json({ error: "Property not found" });
          }
          res.status(200).json(result.rows[0]);
        })
        .catch(next);
    })
    .catch(next);
});

/**
 * Apply filters (price, location, type) and pagination on the properties in the selected language
 * URL pattern: /:languageCode/:translatedProperties/filter
 */
router.get("/:languageCode/:translatedProperties/filter", (req, res, next) => {
  const { languageCode, translatedProperties } = req.params;
  const {
    price_min,
    price_max,
    location,
    type,
    page = 1,
    limit = 10,
  } = req.query;

  // Translate "properties" or its equivalent based on the chosen language
  getTranslation(languageCode, "properties")
    .then((translatedTerm) => {
      if (translatedProperties !== translatedTerm) {
        return res
          .status(404)
          .json({ error: `Invalid endpoint for language ${languageCode}` });
      }

      // Build the base query for filtered properties
      let queryString = `
        SELECT p.id, p.slug, pl.name, pl.description, p.price, p.location
        FROM properties p
        INNER JOIN property_languages pl ON p.id = pl.property_id
        WHERE pl.language_code = $1
      `;

      // Prepare query parameters
      const params = [languageCode];

      // Apply filters if provided
      if (price_min) {
        queryString += ` AND p.price >= $${params.length + 1}`;
        params.push(price_min);
      }

      if (price_max) {
        queryString += ` AND p.price <= $${params.length + 1}`;
        params.push(price_max);
      }

      if (location) {
        queryString += ` AND p.location ILIKE $${params.length + 1}`;
        params.push(`%${location}%`);
      }

      if (type) {
        queryString += ` AND p.type = $${params.length + 1}`;
        params.push(type);
      }

      // Pagination
      queryString += ` LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`;
      params.push(limit, (page - 1) * limit);

      // Execute query with filters
      query(queryString, params)
        .then((result) => {
          res.status(200).json(result.rows);
        })
        .catch(next);
    })
    .catch(next);
});

export default router;
